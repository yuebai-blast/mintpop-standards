import { defineConfig } from 'vitepress'
import fs from 'node:fs/promises'
import path from 'node:path'

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

export default defineConfig({
  lang: 'zh-CN',
  title: 'MintPop Standards',
  description: 'MintPop 品牌下各产品的设计与接入规范中心（供人查阅，也供 coding Agent 直接参考）',
  cleanUrls: true,
  lastUpdated: true,

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '账号接入', link: '/auth/account-integration' },
      { text: '品牌', link: '/brand/logo-and-usage' },
      { text: '设计', link: '/design/baseline' },
    ],
    sidebar: [
      {
        text: '账号 / 认证 · INVARIANT（必须遵守）',
        items: [{ text: '统一账号接入流程', link: '/auth/account-integration' }],
      },
      {
        text: '品牌 · INVARIANT（必须遵守）',
        items: [{ text: 'Logo 与用法', link: '/brand/logo-and-usage' }],
      },
      {
        text: '设计 · REFERENCE（参考基线，可自定义）',
        items: [{ text: '设计基线', link: '/design/baseline' }],
      },
    ],
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: false, next: false },
    search: { provider: 'local' },
  },

  // 构建后把源 .md 拷进产物根，使 /auth/account-integration.md 等 URL 直接可取
  async buildEnd({ srcDir, outDir }) {
    const files = await collectMarkdown(srcDir)
    for (const f of files) {
      const dest = path.join(outDir, f)
      await fs.mkdir(path.dirname(dest), { recursive: true })
      await fs.copyFile(path.join(srcDir, f), dest)
    }
  },
})
