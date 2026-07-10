<script setup lang="ts">
import { withBase } from 'vitepress'

interface Asset {
  title: string
  path: string
  bg: 'soft' | 'light' | 'dark'
  images: string[]
  tile?: boolean
  imgStyle?: string
}

const base = '/assets/brand/'
const assets: Asset[] = [
  {
    title: '词标 · 深字（浅底用）',
    path: 'wordmark/mintpop-wordmark-dark.png',
    bg: 'light',
    images: ['wordmark/mintpop-wordmark-dark.png'],
  },
  {
    title: '词标 · 白字（深底用）',
    path: 'wordmark/mintpop-wordmark-light.png',
    bg: 'dark',
    images: ['wordmark/mintpop-wordmark-light.png'],
  },
  {
    title: '图标 · The Pop Mark（透明底）',
    path: 'icon/mintpop-icon.png（+ -square / -256 / -128 / -64）',
    bg: 'soft',
    images: ['icon/mintpop-icon-256.png'],
    imgStyle: 'max-height:96px',
  },
  {
    title: '应用图标 @512（cloud / white / avatar）',
    path: 'app-icon/mintpop-app-cloud.png · -white.png · avatar-round.png',
    bg: 'light',
    tile: true,
    images: [
      'app-icon/mintpop-app-cloud.png',
      'app-icon/mintpop-app-white.png',
      'app-icon/mintpop-avatar-round.png',
    ],
  },
  {
    title: '头像（原始 avatar）',
    path: 'avatar.png',
    bg: 'light',
    images: ['avatar.png'],
    imgStyle: 'max-height:120px;border-radius:14px',
  },
  {
    title: 'Favicon 全套',
    path: 'favicon/favicon-16/32/48/180/192/256.png + apple-touch-icon.png',
    bg: 'light',
    tile: true,
    images: ['favicon/favicon-32.png', 'favicon/favicon-48.png', 'favicon/apple-touch-icon.png'],
  },
]
</script>

<template>
  <div class="asset-gallery">
    <div v-for="a in assets" :key="a.title" class="asset-card">
      <div class="asset-preview" :class="`bg-${a.bg}`">
        <div v-if="a.tile" class="tiles">
          <img v-for="img in a.images" :key="img" :src="withBase(base + img)" :alt="a.title" />
        </div>
        <img v-else :src="withBase(base + a.images[0])" :alt="a.title" :style="a.imgStyle" />
      </div>
      <div class="asset-meta">
        <div class="t">{{ a.title }}</div>
        <div class="p"><code>{{ a.path }}</code></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.asset-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  margin: 20px 0;
}
.asset-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
}
.asset-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 150px;
  padding: 20px;
}
.asset-preview.bg-soft { background: var(--vp-c-bg-soft); }
.asset-preview.bg-light { background: #ffffff; }
.asset-preview.bg-dark { background: #0b0b0c; }
.asset-preview img { max-width: 100%; max-height: 100%; object-fit: contain; }
.asset-preview .tiles { display: flex; gap: 12px; align-items: center; }
.asset-preview .tiles img { height: 56px; width: auto; }
.asset-meta {
  padding: 12px 14px;
  border-top: 1px solid var(--vp-c-divider);
}
.asset-meta .t {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.asset-meta .p {
  margin-top: 6px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  word-break: break-all;
}
.asset-meta .p code {
  font-size: 12px;
  background: transparent;
  padding: 0;
}
</style>
