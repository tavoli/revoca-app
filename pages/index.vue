<script setup lang="tsx">
import TopMenu from "./index/components/TopMenu.vue"
import Controller from "./index/components/Controller.vue"

const route = useRoute()
const slug = route.query.s?.toString().split('/').filter(Boolean).slice(0, 1).toString()
</script>

<template>
  <TopMenu />
  <Controller :slug="slug" />
  <NuxtPage />
</template>
