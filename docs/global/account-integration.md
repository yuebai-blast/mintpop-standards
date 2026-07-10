# 统一账号接入流程

> **类型：`INVARIANT`（必须遵守）** · 适用范围：MintPop 品牌下所有产品
>
> MintPop 各产品共用一套账号体系，统一由 **MintPop 账号中心（基于 [Logto](https://logto.io)，标准 OIDC/OAuth 2.1）** 提供登录与身份。**新产品一律作为 OIDC 应用接入，不要各自造账号体系。**

::: warning 敏感值不在本公开站
`client_secret`、内部管理端点、租户管理凭据等**敏感信息不在这里**。本页只写「对外可讲的接入流程」。具体的 `issuer` / `client_id` / `client_secret` 向账号中心管理员申请，或见私有仓库 `mintpop-auth`。
:::

## 一、接入模型

- **协议**：OpenID Connect（Authorization Code + PKCE）。
- **身份来源唯一**：用户身份、邮箱、头像等以账号中心为准，产品侧只存 `sub`（用户唯一 ID）与业务数据的关联，**不重复维护密码**。
- **应用类型**：
  - 前端 SPA / 桌面端 → **公开客户端（Public，PKCE，无 secret）**。
  - 有后端的 Web / 服务端 → **机密客户端（Confidential，带 secret）**。

## 二、接入步骤（新产品照做）

1. **申请一个 OIDC 应用**：向账号中心管理员提供「产品名 + 应用类型 + 回调地址」，领取 `client_id`（机密客户端另发 `client_secret`）。
2. **配置回调地址**：遵循下方[回调地址约定](#三、回调地址约定-invariant)。
3. **走标准 Authorization Code + PKCE 流程**登录，用返回的 `id_token` / `access_token` 建立会话。
4. **校验令牌**：用账号中心的 JWKS 公钥验签，校验 `iss` / `aud` / `exp`。
5. **登出**：接入 OIDC 的 end-session 端点做单点登出。

## 三、回调地址约定（INVARIANT）

统一按产品域名组织，便于账号中心侧登记与排查：

```
https://<product-domain>/auth/callback          # 登录回调
https://<product-domain>/auth/logout/callback   # 登出回调
```

本地开发允许 `http://localhost:<port>/auth/callback`。

## 四、Scope 与 Claims（INVARIANT）

- **默认申请的 scope**：`openid profile email`（按需再加 `offline_access` 拿 refresh token）。
- **产品侧统一读取的标准 claims**：`sub`（用户唯一 ID，主键关联用它）、`email`、`name`、`picture`。
- **不要**把 `email` 当唯一主键——邮箱可变，**唯一主键永远用 `sub`**。

## 五、令牌处理（INVARIANT）

- `access_token` 只走 `Authorization: Bearer <token>` 头，**禁止**放 URL query。
- 有后端的产品：token 存服务端会话 / HttpOnly Cookie，**不落 localStorage**。
- 校验必须验签 + 校验 `aud` 指向本产品的 `client_id`，防止 token 混用。

## 六、常见接入方式对照

| 产品形态 | 应用类型 | 推荐库 |
|---|---|---|
| Vue / React SPA | Public + PKCE | `@logto/browser` / 各框架 SDK |
| 有后端的 Web | Confidential | 后端 OIDC 中间件 |
| 桌面端（Tauri/Electron） | Public + PKCE + 系统浏览器 | 系统浏览器 + loopback 回调 |

> 具体 SDK 用法与 `issuer` 等参数，接入时找账号中心索取配置片段；本页只约束「必须怎么接」，不放密钥。
