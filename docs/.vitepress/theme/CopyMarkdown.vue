<script setup lang="ts">
import { ref } from 'vue'
import { useData, withBase } from 'vitepress'

// 「复制 Markdown」按钮：抓取本页对应的原始 .md 文本，写入剪贴板，直接粘给 coding Agent。
// 原理：构建时 buildEnd 已把源 .md 按同路径拷进产物，故 fetch 当前页的 .md 即可拿到原文。
const { page } = useData()
const state = ref<'idle' | 'ok' | 'err'>('idle')

async function copy() {
  try {
    // page.relativePath 形如 "auth/account-integration.md"
    const url = withBase('/' + page.value.relativePath)
    const md = await (await fetch(url)).text()
    await navigator.clipboard.writeText(md)
    state.value = 'ok'
  } catch {
    state.value = 'err'
  }
  setTimeout(() => (state.value = 'idle'), 2000)
}
</script>

<template>
  <button class="copy-md" type="button" @click="copy">
    <span v-if="state === 'idle'">📋 复制 Markdown（喂给 Agent）</span>
    <span v-else-if="state === 'ok'">✅ 已复制到剪贴板</span>
    <span v-else>❌ 复制失败，请重试</span>
  </button>
</template>

<style scoped>
.copy-md {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 20px;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}
.copy-md:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
</style>
