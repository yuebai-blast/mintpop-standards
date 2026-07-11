// 产品清单 —— 单一事实来源
// 同时驱动：首页产品宫格、顶部导航「产品」下拉、各产品侧边栏。
// 新增一个产品 = 这里加一条 + 建 docs/products/<slug>/（index.md + design.md）+
//   放素材到 docs/public/assets/products/<slug>/。

export interface Product {
  /** 目录 slug，对应 docs/products/<slug>/ 与 /assets/products/<slug>/ */
  slug: string
  /** 展示名（品牌前缀 + 产品名） */
  name: string
  /** 一句话简介 */
  tagline: string
  /** 产品 Logo，放 docs/public/assets/products/<slug>/logo.svg；缺省则宫格显示首字母占位 */
  logo?: string
}

// ⚠️ 下面是示例，请按实际 MintPop 产品编辑增删
export const products: Product[] = [
  {
    slug: 'keeper',
    name: 'MintPop Keeper',
    tagline: '（示例）密码 / 凭据管理桌面端',
    logo: '/assets/products/keeper/logo.svg',
  },
  {
    slug: 'game-seer',
    name: 'MintPop Game Seer',
    tagline: '世界杯赛事预测 · AI 分析师 × 量化双引擎',
    logo: '/assets/products/game-seer/logo.svg',
  },
  {
    slug: 'raw-lens',
    name: 'MintPop Raw Lens',
    tagline: '（示例）影像处理工具',
    logo: '/assets/products/raw-lens/logo.svg',
  },
]
