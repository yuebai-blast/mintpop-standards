# 统一支付接入规范

> **类型：`INVARIANT`（必须遵守）** · 适用范围：MintPop 品牌下所有需要收款的产品
>
> MintPop 各产品统一以 **Stripe** 作为支付网关，后端走 **PaymentIntent + client_secret** 模式，前端把支付方式**拍平展示为「微信支付 / 支付宝 / 银行卡」三个并列选项**。本页回答「一个新产品该怎么接支付、后端怎么建单验签、前端怎么长、文案图标用什么」。参考实现：`mintpop-api`（后端 `backend/internal/payment/`，前端 `user-portal/`）。

::: warning 敏感值不在本公开站
Stripe `secretKey` / `webhookSecret` 等**密钥不在这里**，也**不进代码仓库与 `.env`**——一律存服务端数据库（或密管服务），由管理端配置。本页只写「对外可讲的接入约定」。
:::

## 一句话心智模型

> **后端只有一个「stripe」通道，前端把它摊开成三张牌。**
> 后端把 Stripe 实例聚合成单一 `stripe` 支付方式，PaymentIntent 按配置携带多种 `payment_method_types`；前端**在纯展示层**把它拍平成「微信支付 / 支付宝 / 银行卡」三个并列卡片，用户选哪张、支付弹窗就只渲染哪种方式。**收窄只发生在展示层，后端契约不感知子方式。**

---

## 一、五条架构主张（品牌级，不可协商）

1. **网关统一 Stripe，模式统一 PaymentIntent。** 后端创建 PaymentIntent、把 `client_secret` 交给前端，由 Stripe.js 在前端完成确认。**不用 Checkout Session**（因此也不存在 success/cancel URL 一说），不自建收银台跳转页。
2. **前端拍平展示三种方式，顺序固定：微信支付 → 支付宝 → 银行卡。** 用户看到的是三个并列选项，**绝不出现「Stripe」作为一个支付方式选项**——Stripe 是处理方，不是用户心智里的支付方式；它只以「由 Stripe 安全处理」的角标形式出现。
3. **密钥只存服务端。** `secretKey` / `webhookSecret` 存数据库（管理端配置），不进 `.env.example`、不进代码；前端只通过接口拿 `publishable key`。
4. **金额与商品由自己的数据库定义，不用 Stripe Dashboard 的 Price/Product。** 套餐价格存本地表，下单时换算成最小货币单位塞进 PaymentIntent；Stripe 侧不维护商品目录，避免双源漂移。
5. **Webhook 是唯一的成单真相源，且必须验签 + 幂等。** 前端轮询只是「查结果」，入账一律由 webhook 驱动；同一事件重放不得重复入账。

---

## 二、后端接入规范

### 2.1 SDK 与初始化

- Go 用 `github.com/stripe/stripe-go/v85`（其它语言用对应官方 SDK 的等价物）。
- client 用 `secretKey` 懒初始化；配置项固定四个 key：`secretKey`（敏感）、`webhookSecret`（敏感）、`publishableKey`、`currency`（3 位 ISO，默认 `CNY`）。
- 有未完成订单时，`secretKey` / `webhookSecret` / `currency` 三项**锁定不可改**（防止在途订单验签/对账错乱）。

### 2.2 创建 PaymentIntent（参数逐条为硬约定）

```go
params := &stripe.PaymentIntentCreateParams{
    Amount:             stripe.Int64(amountInMinorUnit), // 金额按币种换算最小单位（CNY→分）
    Currency:           stripe.String(strings.ToLower(currency)),
    PaymentMethodTypes: pmTypes,                          // 见下方映射表
    Description:        stripe.String(subject),
    Metadata:           map[string]string{"orderId": outTradeNo}, // webhook 靠它找单
}
// 只要含 wechat_pay，必须显式指定客户端类型
params.PaymentMethodOptions = &stripe.PaymentIntentCreatePaymentMethodOptionsParams{
    WeChatPay: &stripe.PaymentIntentCreatePaymentMethodOptionsWeChatPayParams{
        Client: stripe.String("web"),
    },
}
params.SetIdempotencyKey("pi-" + outTradeNo) // 幂等键固定形态：pi-<我方单号>
```

- **支付方式映射表（品牌统一，逐字一致）**：

  | 我方支付类型 | Stripe `payment_method_types` |
  |---|---|
  | `wxpay` | `wechat_pay` |
  | `alipay` | `alipay` |
  | `card` | `card` |

- 实例支持哪些子方式由配置（如 `supported_types = "card,alipay,wxpay"`）决定，映射后合并；**为空一律回退 `["card"]`**。
- `Metadata["orderId"]` 存**我方外部单号**（`out_trade_no`），是 webhook 回调定位订单的唯一钥匙。
- 金额换算必须按币种小数位处理（CNY 2 位、JPY 0 位、BHD 3 位…），不许硬编码 `*100`。
- 响应回传前端：`client_secret`、`intent_id`（即 PaymentIntent ID，落库为 `payment_trade_no`）、`currency`、`pay_amount`、`out_trade_no`。

### 2.3 Webhook（验签 + 幂等，缺一即为事故）

- 端点：`POST /api/v1/payment/webhook/stripe`。读取**原始 body**（限 1MB），取 `Stripe-Signature` 头，用官方 SDK `webhook.ConstructEvent(rawBody, sig, webhookSecret)` 验签——**禁止**自己解析 JSON 后再校验。
- 只处理两个事件，其余一律回 200 空响应忽略：
  - `payment_intent.succeeded` → 成功
  - `payment_intent.payment_failed` → 失败
- 从事件里取 `Metadata["orderId"]` 找单；查无此单也回 2xx（止住 Stripe 重试风暴）。
- **入账幂等用条件 UPDATE（乐观并发）**：只有当前状态是 `PENDING`（或允许恢复的 `CANCELLED` / 宽限期内 `EXPIRED`）才置 `PAID`，受影响行数为 0 视为已处理过，直接返回成功。
- 置 `PAID` 前校验：provider 一致、金额与 `pay_amount` 在币种容差内一致；不符写审计并拒绝。
- 履约（充值余额 / 发订阅）与「置 PAID」分离，用租约锁 + 审计表唯一约束（如 `(order_id, action)`）保证只履约一次。

### 2.4 订单状态机（SCREAMING_SNAKE_CASE，前后端逐字一致）

```
PENDING → PAID → RECHARGING → COMPLETED
        ↘ EXPIRED / CANCELLED / FAILED
COMPLETED → REFUND_REQUESTED → REFUNDING → REFUNDED / PARTIALLY_REFUNDED
                              ↘ REFUND_PENDING / REFUND_FAILED
```

前端判定口径统一：**已支付** = `PAID | COMPLETED`；**轮询可停（成功）** = `PAID | COMPLETED | RECHARGING`。

### 2.5 退款

- 走 `Refunds.Create`，参数 `PaymentIntent=<payment_trade_no>` + 最小单位金额，`Reason=requested_by_customer`。
- **退款必须用下单时那个实例的凭证**（订单落库时记住 `provider_instance_id`），不允许换实例猜。
- `pending` 的退款单置 `REFUND_PENDING`，由查询任务向网关拉终态再结算。

### 2.6 面向前端的 API 契约（统一 `ApiResponse<T>` 包装，`code=0` 为成功）

| 端点 | 作用 |
|---|---|
| `GET  /payment/checkout-info` | 返回可用支付方式 `methods`（含限额）+ `stripe_publishable_key` |
| `POST /payment/orders` | 下单：`{ amount, payment_type, order_type, return_url, plan_id? }` → `{ client_secret, out_trade_no, pay_amount, currency, ... }` |
| `POST /payment/orders/verify` | 按 `out_trade_no` 主动向网关核实并推进状态（前端轮询用） |
| `GET  /payment/orders/my` · `POST /payment/orders/:id/cancel` | 我的订单 / 取消 |

`payment_type` 取值：拍平的三个 Stripe 子方式**统一下发 `stripe`**（子方式不进下单参数，只决定前端渲染哪种确认 UI）；如有微信/支付宝直连通道则为 `wxpay` / `alipay`。

---

## 三、前端接入规范（品牌 UI 标准）

### 3.1 拍平算法（标准实现，照抄）

```ts
/** 展示顺序即数组顺序：微信 → 支付宝 → 银行卡（INVARIANT） */
export const STRIPE_SUB_METHODS = ['wxpay', 'alipay', 'card'] as const

/** 子方式 → Stripe payment_method_types（与后端映射表逐字一致） */
export const STRIPE_PM_TYPE = { wxpay: 'wechat_pay', alipay: 'alipay', card: 'card' }

/** 从后端 methods 构建拍平列表：直连微信/支付宝优先，Stripe 补位；银行卡只来自 Stripe */
export function buildPayOptions(methods) {
  const options = []
  const hasStripe = 'stripe' in methods
  for (const m of ['wxpay', 'alipay']) {
    if (m in methods) options.push({ key: m, paymentType: m })
    else if (hasStripe) options.push({ key: `stripe:${m}`, paymentType: 'stripe', subMethod: m })
  }
  if (hasStripe) options.push({ key: 'stripe:card', paymentType: 'stripe', subMethod: 'card' })
  return options
}
```

默认选中 = 拍平列表首项（通常是微信支付）。

### 3.2 视觉规范（INVARIANT）

| 项 | 微信支付 | 支付宝 | 银行卡 |
|---|---|---|---|
| 中文名 | 微信支付 | 支付宝 | 银行卡 |
| 英文名 | WeChat Pay | Alipay | Bank card |
| 副文案（中/英） | 扫码即时到账 / Scan to pay instantly | 扫码即时到账 / Scan to pay instantly | Visa · 万事达 / Visa · Mastercard |
| 图标底色 | `#09BB07`（微信绿） | `#1677FF`（支付宝蓝） | `#635BFF`（Stripe 紫） |
| 图标 | 白色微信 logo（内联 SVG） | 白色粗体「支」字 | 白色银行卡轮廓（内联 SVG） |

- **图标一律内联 SVG（含支付宝的「支」字），不引外链图片**（兼顾全球访问可达性与体积）；容器 34×34px、圆角 9px。
- **布局**：`role="radiogroup"` 网格——移动端单列竖排、桌面端三列横排（`grid-cols-1 sm:grid-cols-3`），三张卡片**平级并列，无主次之分**。
- **选中态**：边框换品牌强调色 + 强调色 6% 底 + 右侧单选圆点；未选中 hover 只轻描边框。
- **必带两处 Stripe 标注**（合规与信任感，不可省）：
  - 标题行右侧角标：「由 **Stripe** 安全处理」/ “Processed securely by **Stripe**”（Stripe 一词着色 `#635BFF`）。
  - 底部安全提示（盾牌图标 + 虚线分隔）：「微信支付与支付宝均通过 Stripe 安全处理，到账与额度一致。」
- 无障碍：radiogroup 需支持 roving tabindex 与方向键循环选择。

### 3.3 支付确认交互（按子方式分流）

统一用 `@stripe/stripe-js`（**动态 import 懒加载**，publishable key 来自 `checkout-info`）：

| 子方式 | 确认方式 |
|---|---|
| 微信支付 | `confirmWechatPayPayment(clientSecret, { payment_method_options: { wechat_pay: { client: 'web' } } }, { handleActions: false })` → 取 `next_action.wechat_pay_display_qr_code` **本地渲染二维码**（qrcode 库，200×200） |
| 支付宝 | 桌面端 `handleActions: false` 取托管页 URL 本地生成二维码；移动端整页跳转 |
| 银行卡 | 挂 **Payment Element**（`layout: 'tabs'`，`appearance: { theme: 'stripe', variables: { borderRadius: '12px' } }`），`confirmPayment({ redirect: 'if_required' })` |

- Elements 用 **deferred 模式**初始化：`elements({ mode: 'payment', amount, currency, paymentMethodTypes: [所选那一种] })`——**只渲染用户选中的那一种方式**，这是「拍平」在确认层的延续；仅旧单续付等信息不全时才退回 clientSecret 模式（渲染全部方式）。
- Payment Element 语言跟随应用 locale（zh-CN→`zh`，en-US→`en`）。
- 二维码展示需带有效期倒计时文案（「二维码有效期：{time}」）。

### 3.4 回跳与轮询

- 下单必传 `return_url = ${origin}/payment/result`；每个产品固定提供 `/payment/result` 回流路由。
- 轮询统一原语：**每 2s 调 `POST /orders/verify`**，命中成功口径（`PAID | COMPLETED | RECHARGING`）即停；整页跳转回流场景轮询约 15 次（~30s）后转「结果待确认」而非报失败。
- 回流页处理完毕要清理 URL 上的 `payment_intent` / `payment_intent_client_secret` / `redirect_status` 等 query。
- 回流成功文案按订单类型区分：「余额已更新」/「订阅已生效」。

### 3.5 i18n 基准文案（中英一一对应，新产品照抄）

| key | 中文 | 英文 |
|---|---|---|
| paymentMethod | 支付方式 | Payment method |
| poweredBy | 由 {provider} 安全处理 | Processed securely by {provider} |
| securityNote | 微信支付与支付宝均通过 {provider} 安全处理，到账与额度一致。 | WeChat Pay and Alipay are both processed securely by {provider} — credited at the same amount. |
| methodWxpay / methodAlipay / methodCard | 微信支付 / 支付宝 / 银行卡 | WeChat Pay / Alipay / Bank card |
| methodScanDesc / methodCardDesc | 扫码即时到账 / Visa · 万事达 | Scan to pay instantly / Visa · Mastercard |
| confirmPay / submitting | 确认支付 / 下单中… | Confirm payment / Placing order… |
| stripePay / processing | 立即支付 / 正在确认支付 | Pay now / Confirming payment |

---

## 四、安全清单（上线前逐条核对）

- [ ] Stripe 密钥不出现在仓库任何文件（含 `.env.example`）；grep `sk_live` / `sk_test` 为零命中。
- [ ] CSP 放行 Stripe：`script-src` / `frame-src` 含 `https://*.stripe.com`（这是 `.env` / 配置里唯一允许出现 stripe 字样的地方）。
- [ ] Webhook 用官方 SDK 验签，原始 body 限长；无关事件与查无此单均回 2xx。
- [ ] 入账为条件 UPDATE 幂等；履约有租约锁 / 唯一约束防重。
- [ ] 金额校验：回调金额与订单 `pay_amount` 按币种容差比对，不符拒绝入账。
- [ ] 退款使用下单实例的凭证。
- [ ] 前端不落任何密钥，只持有 publishable key 与 client_secret。

---

## 附、术语

- **PaymentIntent 模式**：后端建意图、前端 Stripe.js 确认的集成方式；区别于整页跳转的 Checkout Session。本品牌只用前者。
- **拍平（flatten）**：后端聚合为单一 `stripe` 通道，前端将其展开为「微信 / 支付宝 / 银行卡」并列选项的展示策略。
- **子方式（sub method）**：拍平后的单个选项（`wxpay` / `alipay` / `card`），只存在于前端展示与确认层，不进下单参数。
- **`out_trade_no`**：我方外部单号，唯一索引；写入 PaymentIntent 的 `Metadata["orderId"]`，是 webhook 找单的钥匙。
- **deferred Elements**：Stripe Elements 的延迟意图初始化模式（传 `mode/amount/currency` 而非 clientSecret），可按需收窄渲染的支付方式。
