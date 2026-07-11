---
layout: home
hero:
  # name 不再用文字渲染，改由 Layout 的 home-hero-info-before 槽注入现成词标图（见 theme/Layout.vue）
  text: 规范中心
  tagline: 品牌总规范 + 各产品规范。供人查阅，也供 coding Agent 直接参考。
  actions:
    - theme: brand
      text: 品牌总规范
      link: /global/
---

## 产品

点击进入某个产品，查看它自己的文档与素材。

<ProductGrid />

## 两层规范

- **品牌总规范（`/global/`）**：跨所有产品共享的规则——统一账号接入、品牌 Logo、设计基线。多为 `INVARIANT`（必须遵守）。
- **各产品规范（`/products/<产品>/`）**：某个产品自己的文档与素材，可在总规范基础上扩展或（对 `REFERENCE` 项）自定义。

> 每篇文档顶部有「📋 复制 Markdown」按钮喂给 Agent；其 `.md` URL 也可直接交给能联网的 Agent 自取。
