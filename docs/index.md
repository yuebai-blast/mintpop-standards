---
layout: home
hero:
  name: MintPop Standards
  text: 品牌下各产品的规范中心
  tagline: 供人查阅，也供 coding Agent 直接参考。接一个新产品，先看这里。
  actions:
    - theme: brand
      text: 统一账号接入
      link: /auth/account-integration
    - theme: alt
      text: 设计基线
      link: /design/baseline
features:
  - title: 🔒 账号 / 认证 · INVARIANT
    details: 各产品作为 OIDC 应用统一接入 MintPop 账号中心（Logto），流程跨产品一致，必须遵守。
    link: /auth/account-integration
  - title: 🎨 品牌 · INVARIANT
    details: Logo、命名、域名等品牌不可变项，所有产品保持一致。
    link: /brand/logo-and-usage
  - title: 🖌️ 设计 · REFERENCE
    details: 默认设计基线（配色、字体、间距）。是「参考基线」，各产品可在边界内自定义。
    link: /design/baseline
---

## 这是什么

MintPop 是一个**品牌**，底下有多个产品。各产品**共享账号体系与品牌规范**，但**设计不必完全一致**。这个站点把「新产品接入时要参考的规范与制品」集中到一处，同时服务两类读者：

- **人**：直接浏览本站（有导航、搜索、渲染好的页面）。
- **coding Agent**：每篇文档顶部有「📋 复制 Markdown」按钮，一键复制原文粘给 Agent；或直接把该页的 `.md` URL 交给能联网的 Agent 自取（见下）。

## 两个关键约定

### 1. INVARIANT vs REFERENCE（先看清哪些能改）

每篇规范在标题下会标注类型，决定 Agent / 你能不能偏离：

- **`INVARIANT`（必须遵守）**：跨产品一致的铁律，如账号接入流程、品牌 Logo。接入时**照做，不要改**。
- **`REFERENCE`（参考基线）**：给一套默认值 + 允许偏离的边界，如视觉设计。**按具体产品调整**。

### 2. 怎么把规范喂给 Agent

- **复制按钮**（推荐）：打开对应页面 → 点顶部「复制 Markdown」→ 粘进 Agent 对话。
- **直接给 URL**：把该页的 `.md` 地址交给能联网的 Agent，它会拉到原始 markdown。例如：
  - 页面：`https://<你的域名>/auth/account-integration`
  - 原文：`https://<你的域名>/auth/account-integration.md` ← 给 Agent 这个

## 给新产品接入的一句话清单

1. **账号**：按 [统一账号接入流程](/auth/account-integration) 作为 OIDC 应用接入（INVARIANT）。
2. **品牌**：Logo / 命名 / 域名遵循 [品牌规范](/brand/logo-and-usage)（INVARIANT）。
3. **设计**：以 [设计基线](/design/baseline) 为起点，按产品调性自定义（REFERENCE）。
