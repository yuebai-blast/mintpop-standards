<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { withBase } from 'vitepress'
import CopyMarkdown from './CopyMarkdown.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <!-- doc-before 槽只在文档页渲染（首页 home 布局不显示），正合适 -->
    <template #doc-before>
      <CopyMarkdown />
    </template>

    <!-- 首页 hero：用现成词标图替代文字「MintPop」。按背景深浅切两版（见 /global/brand 词标规范）：
         浅底用深字版、深底用白字版。 -->
    <template #home-hero-info-before>
      <img
        class="hero-wordmark hero-wordmark--light"
        :src="withBase('/assets/brand/wordmark/mintpop-wordmark-dark.png')"
        alt="MintPop"
      />
      <img
        class="hero-wordmark hero-wordmark--dark"
        :src="withBase('/assets/brand/wordmark/mintpop-wordmark-light.png')"
        alt="MintPop"
      />
    </template>
  </Layout>
</template>
