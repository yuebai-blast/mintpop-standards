# 品牌总规范

> 适用范围：**MintPop 品牌下所有产品**。这里是跨产品共享的规则；某个产品自己的规范见对应[产品页](/)。

各产品**设计不必完全一致**，但**账号体系与品牌必须一致**。规范分两类：

- **`INVARIANT`（必须遵守）**：跨产品铁律，接入时照做、不要改。
- **`REFERENCE`（参考基线）**：默认值 + 偏离边界，各产品可自定义。

## 目录

| 规范 | 类型 | 说明 |
|---|---|---|
| [统一账号接入](/global/account-integration) | `INVARIANT` | 各产品作为 OIDC 应用统一接入 MintPop 账号中心（Logto） |
| [统一支付接入](/global/payment-integration) | `INVARIANT` | Stripe PaymentIntent 后端接入 + 前端「微信 / 支付宝 / 银行卡」拍平展示 |
| [品牌 Logo 与用法](/global/brand) | `INVARIANT` | 品牌名写法、Logo 资源与使用规则、域名约定 |
| [设计基线](/global/design-baseline) | `REFERENCE` | 默认配色 / 字体 / 间距，产品可在边界内自定义 |
