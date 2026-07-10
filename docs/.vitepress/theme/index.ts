import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import ProductGrid from './ProductGrid.vue'

// 扩展默认主题：
// - Layout 包装组件把「复制 Markdown」按钮注入到每篇文档顶部
// - 全局注册 ProductGrid，供首页 markdown 里 <ProductGrid /> 使用
export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('ProductGrid', ProductGrid)
  },
} satisfies Theme
