import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import ProductGrid from './ProductGrid.vue'
import BrandAssets from './BrandAssets.vue'

// 品牌字体：Fredoka（展示/词标）+ Inter（UI/正文），均自托管（Fontsource），
// 禁外链 Google Fonts，保证含中国大陆在内全球可达（见 /global/brand 字体规范）。
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/fredoka/500.css'
import '@fontsource/fredoka/600.css'

// 品牌主题层：Mint 主色 + 字体映射 + hero 渐变（覆盖 VitePress 默认 indigo）
import './custom.css'

// 扩展默认主题：
// - Layout 包装组件把「复制 Markdown」按钮注入到每篇文档顶部
// - 全局注册 ProductGrid（首页宫格）、BrandAssets（品牌页资源样例画廊）
export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('ProductGrid', ProductGrid)
    app.component('BrandAssets', BrandAssets)
  },
} satisfies Theme
