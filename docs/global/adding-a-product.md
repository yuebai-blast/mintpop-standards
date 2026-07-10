# 如何接入新产品

在规范中心新增一个产品，三步：

## 1. 登记到产品清单

编辑 `docs/.vitepress/products.ts`，加一条：

```ts
{
  slug: 'my-product',                 // 目录 slug，全小写 kebab-case
  name: 'MintPop MyProduct',          // 品牌前缀 + 产品名
  tagline: '一句话简介',
  logo: '/assets/products/my-product/logo.svg',
}
```

这一条会**自动**出现在：首页产品宫格、顶部「产品」下拉、该产品侧边栏——无需再改别处。

## 2. 建产品文档目录

新建 `docs/products/my-product/`，至少放两篇（侧边栏默认指向它们）：

- `index.md` —— 产品概览（是什么、遵循哪些总规范、素材在哪）
- `design.md` —— 产品设计规范（在[设计基线](/global/design-baseline)基础上覆盖了什么）

::: tip 直接抄现有产品
复制 `docs/products/keeper/` 改内容最快。产品需要更多文档就继续加 `.md`，并在 `products.ts` 对应产品的侧边栏（`config.mts` 里生成）按需补条目。
:::

## 3. 放产品素材

产品自己的 Logo / 图标 / 图片放 `docs/public/assets/products/my-product/`，发布后按
`/assets/products/my-product/<file>` 直接引用（各产品素材互不干扰）。

## 约定：先总规范，后产品规范

产品文档里**能引总规范就引，不要重复抄**：账号接入、品牌 Logo、命名一律指向 `/global/*`（`INVARIANT`，照做）；产品页只写「本产品特有 / 对 `REFERENCE` 项的自定义」。
