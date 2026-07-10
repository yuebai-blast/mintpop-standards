<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import CopyMarkdown from './CopyMarkdown.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <!-- doc-before 槽只在文档页渲染（首页 home 布局不显示），正合适 -->
    <template #doc-before>
      <CopyMarkdown />
    </template>
  </Layout>
</template>
