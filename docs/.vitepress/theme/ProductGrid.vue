<script setup lang="ts">
import { ref } from 'vue'
import { withBase } from 'vitepress'
import { products } from '../products'

// logo 文件缺失（如产品尚未放素材）时，img 会 404；记录出错的 slug，回退到首字母徽标，
// 避免宫格里出现「坏图 + alt 文字」的破碎观感。
const broken = ref<Record<string, boolean>>({})
const letter = (name: string) => name.replace(/^MintPop\s*/, '').charAt(0)
</script>

<template>
  <div class="product-grid">
    <a
      v-for="p in products"
      :key="p.slug"
      class="product-card"
      :href="withBase(`/products/${p.slug}/`)"
    >
      <div class="logo">
        <img
          v-if="p.logo && !broken[p.slug]"
          :src="withBase(p.logo)"
          :alt="p.name"
          @error="broken[p.slug] = true"
        />
        <span v-else class="logo-fallback">{{ letter(p.name) }}</span>
      </div>
      <div class="meta">
        <div class="name">{{ p.name }}</div>
        <div class="tagline">{{ p.tagline }}</div>
      </div>
    </a>
  </div>
</template>

<style scoped>
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin-top: 32px;
}
.product-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  text-decoration: none;
  transition: border-color 0.2s, transform 0.2s;
}
.product-card:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-2px);
}
.logo {
  flex: 0 0 auto;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  overflow: hidden;
  background: var(--vp-c-bg);
}
.logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.logo-fallback {
  font-size: 22px;
  font-weight: 700;
  color: var(--vp-c-brand-1);
}
.meta {
  min-width: 0;
}
.name {
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.tagline {
  margin-top: 4px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
}
</style>
