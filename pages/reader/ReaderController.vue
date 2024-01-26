<script setup lang="tsx">
import { type Content } from "@tiptap/core"

interface Props {
  initialData: () => Promise<any>
  nextData: () => Promise<any>
}

const {initialData, nextData} = withDefaults(defineProps<Props>(), {
  initialData: () => Promise.resolve([]),
  paginate: () => Promise.resolve([]),
})

const sentences = ref<Content[]>([])

onMounted(async () => {
  const data = await initialData()
  sentences.value = data
})

const getNextData = async () => {
  const data = await nextData()
  sentences.value = [...sentences.value, ...data]
}
</script>

<template>
  <Body class="mode-dark" />
  <main class="w-4/12 mx-auto">
    <Reader :html="normalize(sentences)" @bottom="getNextData" />
  </main>
</template>
