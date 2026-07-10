import { defineConfig } from 'vitepress'
import fs from 'node:fs/promises'
import path from 'node:path'
import { products } from './products'

// 递归收集所有源 markdown（排除 .vitepress），构建后原样拷进产物。
// 目的：同一份 .md 既能被页面「复制 Markdown」按钮 fetch，又能被 Agent 按 URL 直取。
async function collectMarkdown(dir: string, base = ''): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const out: string[] = []
  for (const e of entries) {
    if (e.name === '.vitepress') continue
    const rel = base ? `${base}/${e.name}` : e.name
    if (e.isDirectory()) out.push(...(await collectMarkdown(path.join(dir, e.name), rel)))
    else if (e.name.endsWith('.md')) out.push(rel)
  }
  return out
}

// 各产品侧边栏：进入某产品目录时显示该产品自己的文档树（由 products.ts 生成）
const productSidebar = Object.fromEntries(
  products.map((p) => [
    `/products/${p.slug}/`,
    [
      {
        text: p.name,
        items: [
          { text: '概览', link: `/products/${p.slug}/` },
          { text: '设计规范', link: `/products/${p.slug}/design` },
        ],
      },
      { text: '← 返回品牌总规范', link: '/global/' },
    ],
  ]),
)

export default defineConfig({
  lang: 'zh-CN',
  title: 'MintPop Standards',
  description: 'MintPop 品牌规范中心：品牌总规范 + 各产品规范，供人查阅，也供 coding Agent 直接参考',
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/assets/brand/app-icon/mintpop-app-cloud.png' }],
    ['link', { rel: 'apple-touch-icon', href: '/assets/brand/app-icon/mintpop-app-cloud.png' }],
    ['meta', { name: 'theme-color', content: '#17D1A7' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'MintPop Standards' }],
    ['meta', { property: 'og:description', content: 'MintPop 品牌规范中心：品牌总规范 + 各产品规范' }],
    ['meta', { property: 'og:image', content: '/assets/brand/app-icon/mintpop-app-cloud.png' }],
  ],

  themeConfig: {
    // 站点图标：app-cloud 瓦片（自带 Cloud 浅底，深浅主题通用）
    logo: '/assets/brand/app-icon/mintpop-app-cloud.png',
    nav: [
      { text: '首页', link: '/' },
      { text: '品牌总规范', link: '/global/' },
      {
        text: '产品',
        items: products.map((p) => ({ text: p.name, link: `/products/${p.slug}/` })),
      },
    ],

    // 按路径前缀切换侧边栏：/global/ 一套，各产品各一套
    sidebar: {
      '/global/': [
        {
          text: '品牌总规范',
          items: [
            { text: '总览', link: '/global/' },
            { text: '统一账号接入 · INVARIANT', link: '/global/account-integration' },
            { text: '品牌 Logo 与用法 · INVARIANT', link: '/global/brand' },
            { text: '设计基线 · REFERENCE', link: '/global/design-baseline' },
            { text: '如何接入新产品', link: '/global/adding-a-product' },
          ],
        },
      ],
      ...productSidebar,
    },

    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: false, next: false },
    search: { provider: 'local' },
  },

  // 构建后把源 .md 拷进产物根，使 /global/xxx.md、/products/<slug>/xxx.md 等 URL 直接可取
  async buildEnd({ srcDir, outDir }) {
    const files = await collectMarkdown(srcDir)
    for (const f of files) {
      const dest = path.join(outDir, f)
      await fs.mkdir(path.dirname(dest), { recursive: true })
      await fs.copyFile(path.join(srcDir, f), dest)
    }
  },
})
