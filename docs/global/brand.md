# 品牌 Logo 与用法

> **类型：`INVARIANT`（必须遵守）** · 适用范围：MintPop 品牌下所有产品
>
> 品牌名写法、Logo、域名规则跨产品一致，保证用户在不同产品间认得出这是同一个品牌。

## 一、品牌名写法（INVARIANT）

- 正确写法：**MintPop**（M、P 大写，连写，无空格）。
- ❌ 错误：`Mintpop` / `mint pop` / `MINTPOP`（正文里）/ `Mint-Pop`。
- 产品命名：`MintPop <ProductName>`（如 `MintPop Keeper`）；口语可简称产品名。

## 二、品牌级 Logo 资源（直接拉取）

品牌级 Logo 放在本站 `assets/brand/`，各产品**直接引用同一份**，不要自己重画：

| 用途 | 路径 |
|---|---|
| 主 Logo（SVG，浅底用） | `/assets/brand/logo.svg` |
| 反白 Logo（深色底用） | `/assets/brand/logo-inverse.svg` |
| 纯图标 / favicon | `/assets/brand/mark.svg` |

> 例：`https://<你的域名>/assets/brand/logo.svg`。当前为占位，把正式素材放进仓库 `docs/public/assets/brand/` 即生效。
>
> 各**产品自己的** Logo / 素材放 `docs/public/assets/products/<产品>/`，见对应产品页。

## 三、使用规则（INVARIANT）

- **留白**：Logo 四周留出不小于图标高度 1/2 的净空，不要贴边、不要被文字包围。
- **不许改**：不拉伸变形、不换配色、不加描边/阴影、不旋转。
- **最小尺寸**：图标最小 16px，横版 Logo 最小高度 20px。
- **底色**：浅底用主 Logo，深底用反白版，保证对比度。

## 四、域名约定（INVARIANT）

- 主域：`mintpop.ai`。
- 产品站点用**子域**：`<product>.mintpop.ai`（如 `keeper.mintpop.ai`）。
- 规范中心：`standards.mintpop.ai`（即本站）。
