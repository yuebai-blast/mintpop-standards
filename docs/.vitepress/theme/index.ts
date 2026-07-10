import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'

// 扩展默认主题，用 Layout 包装组件把「复制 Markdown」按钮注入到每篇文档顶部
export default {
  extends: DefaultTheme,
  Layout,
} satisfies Theme
