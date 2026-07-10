<script setup lang="ts">
import { ref } from 'vue'
import { withBase } from 'vitepress'

// 资源样例画廊：按「资源族」分卡（词标 / 图标 / 应用图标 / 头像 / Favicon），
// 每个族下的**每个文件**单独成行，点任意一行即复制该文件的完整生产链接。
// 预览图用相对路径（本地也能显示），复制的链接固定用规范中心的正式域名（分享出去永远可用）。
const SITE = 'https://standards.mintpop.ai'
const base = '/assets/brand/'

type Bg = 'light' | 'dark' | 'soft' | 'checker'
interface File {
  path: string // 相对 assets/brand/ 的路径
  desc: string // 变体说明，如「深字 · 浅底用」「512×512」
}
interface Card {
  title: string
  preview: { img: string; bg: Bg }[]
  files: File[]
}

const cards: Card[] = [
  {
    title: '词标 Wordmark',
    // 两版天生需要相反底色：深字配浅底、白字配深底 —— 预览对半分开，顺带把用法讲清楚
    preview: [
      { img: 'wordmark/mintpop-wordmark-dark.png', bg: 'light' },
      { img: 'wordmark/mintpop-wordmark-light.png', bg: 'dark' },
    ],
    files: [
      { path: 'wordmark/mintpop-wordmark-dark.png', desc: '深字 · 浅底用' },
      { path: 'wordmark/mintpop-wordmark-light.png', desc: '白字 · 深底用' },
    ],
  },
  {
    title: '图标 The Pop Mark',
    preview: [{ img: 'icon/mintpop-icon-256.png', bg: 'checker' }],
    files: [
      { path: 'icon/mintpop-icon.png', desc: '原始 · 真身 ≈208px' },
      { path: 'icon/mintpop-icon-square.png', desc: '方形安全区版' },
      { path: 'icon/mintpop-icon-256.png', desc: '256×256' },
      { path: 'icon/mintpop-icon-128.png', desc: '128×128' },
      { path: 'icon/mintpop-icon-64.png', desc: '64×64' },
    ],
  },
  {
    title: '应用图标 App Icon @512',
    preview: [
      { img: 'app-icon/mintpop-app-cloud.png', bg: 'light' },
      { img: 'app-icon/mintpop-app-white.png', bg: 'light' },
      { img: 'app-icon/mintpop-avatar-round.png', bg: 'light' },
    ],
    files: [
      { path: 'app-icon/mintpop-app-cloud.png', desc: 'Cloud · 主用（512）' },
      { path: 'app-icon/mintpop-app-white.png', desc: 'White · 512' },
      { path: 'app-icon/mintpop-avatar-round.png', desc: '圆形头像 · 512' },
    ],
  },
  {
    title: '头像 Avatar',
    preview: [{ img: 'avatar.png', bg: 'light' }],
    files: [{ path: 'avatar.png', desc: '原始头像' }],
  },
  {
    title: 'Favicon 全套',
    preview: [
      { img: 'favicon/favicon-32.png', bg: 'light' },
      { img: 'favicon/favicon-48.png', bg: 'light' },
      { img: 'favicon/apple-touch-icon.png', bg: 'light' },
    ],
    files: [
      { path: 'favicon/favicon-16.png', desc: '16×16' },
      { path: 'favicon/favicon-32.png', desc: '32×32' },
      { path: 'favicon/favicon-48.png', desc: '48×48' },
      { path: 'favicon/favicon-180.png', desc: '180×180' },
      { path: 'favicon/favicon-192.png', desc: '192×192' },
      { path: 'favicon/favicon-256.png', desc: '256×256' },
      { path: 'favicon/apple-touch-icon.png', desc: 'Apple Touch · 180' },
    ],
  },
]

function fullUrl(path: string) {
  return SITE + withBase(base + path)
}
function fileName(path: string) {
  return path.split('/').pop() ?? path
}

// 同一时刻只标记一个「刚复制成功 / 失败」的文件，短暂高亮后复位
const copied = ref('')
const failed = ref('')
let timer: ReturnType<typeof setTimeout> | undefined

async function copy(path: string) {
  const url = fullUrl(path)
  try {
    await navigator.clipboard.writeText(url)
    copied.value = path
    failed.value = ''
  } catch {
    failed.value = path
    copied.value = ''
  }
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    copied.value = ''
    failed.value = ''
  }, 1800)
}
</script>

<template>
  <div class="asset-gallery">
    <div v-for="c in cards" :key="c.title" class="asset-card">
      <div class="asset-preview" :class="{ single: c.preview.length === 1 }">
        <div
          v-for="p in c.preview"
          :key="p.img"
          class="pane"
          :class="`bg-${p.bg}`"
        >
          <img :src="withBase(base + p.img)" :alt="c.title" />
        </div>
      </div>

      <div class="asset-body">
        <div class="asset-title">{{ c.title }}</div>
        <ul class="file-list">
          <li v-for="f in c.files" :key="f.path">
            <button
              type="button"
              class="file-row"
              :class="{ ok: copied === f.path, err: failed === f.path }"
              :aria-label="`复制 ${fileName(f.path)} 的完整链接`"
              @click="copy(f.path)"
            >
              <span class="file-main">
                <code class="file-name">{{ fileName(f.path) }}</code>
                <span class="file-desc">{{ f.desc }}</span>
              </span>
              <span class="file-action" aria-hidden="true">
                <span v-if="copied === f.path" class="tag ok">已复制</span>
                <span v-else-if="failed === f.path" class="tag err">失败</span>
                <svg
                  v-else
                  class="ico"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.asset-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 18px;
  margin: 22px 0;
}
.asset-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  overflow: hidden;
  background: var(--vp-c-bg);
}

/* —— 预览区：多变体时按份数等分，词标即天然「浅底 | 深底」对照 —— */
.asset-preview {
  display: flex;
  height: 132px;
}
.asset-preview .pane {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  min-width: 0;
}
.asset-preview.single .pane {
  padding: 20px;
}
.asset-preview .pane img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.bg-light {
  background: #ffffff;
}
.bg-dark {
  background: #0b0b0c;
}
.bg-soft {
  background: var(--vp-c-bg-soft);
}
/* 透明底用棋盘格如实呈现「透明」 */
.bg-checker {
  background-color: var(--vp-c-bg-soft);
  background-image:
    linear-gradient(45deg, var(--vp-c-divider) 25%, transparent 25%),
    linear-gradient(-45deg, var(--vp-c-divider) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--vp-c-divider) 75%),
    linear-gradient(-45deg, transparent 75%, var(--vp-c-divider) 75%);
  background-size: 14px 14px;
  background-position: 0 0, 0 7px, 7px -7px, -7px 0;
}

/* —— 文件列表：整行即复制按钮 —— */
.asset-body {
  padding: 12px 12px 8px;
  border-top: 1px solid var(--vp-c-divider);
}
.asset-title {
  font-family: var(--mp-font-display, var(--vp-font-family-base));
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  padding: 2px 4px 8px;
}
.file-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.file-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 7px 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--vp-c-text-1);
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s, box-shadow 0.15s;
}
.file-row:hover {
  background: var(--vp-c-default-soft);
}
.file-row:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 1px;
}
.file-row.ok {
  background: var(--vp-c-brand-soft);
}
.file-main {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;
}
.file-name {
  font-family: var(--vp-font-family-mono);
  font-size: 12.5px;
  color: var(--vp-c-text-1);
  background: transparent;
  padding: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.file-row.ok .file-name {
  color: var(--vp-c-brand-1);
}
.file-desc {
  font-size: 11.5px;
  color: var(--vp-c-text-3);
}
.file-action {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  color: var(--vp-c-text-3);
}
.file-row:hover .file-action {
  color: var(--vp-c-brand-1);
}
.ico {
  display: block;
}
.tag {
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1;
}
.tag.ok {
  color: var(--vp-c-brand-1);
}
.tag.err {
  color: var(--vp-c-danger-1, #e5484d);
}

@media (prefers-reduced-motion: reduce) {
  .file-row {
    transition: none;
  }
}
</style>
