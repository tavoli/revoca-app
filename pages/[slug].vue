<script setup lang="ts">
import {theme} from '@/stores/theme.ts'

const slug = useSlug()
const DATA_KEY = factoryDataKeys(slug)

// TODO login when token is not present
// TODO save the generated sentence on cache

const {data: sentences, pending} = await useAsyncData(DATA_KEY.SENTENCES,
  () => fetchBook(slug),
  {
    getCachedData(key) {
      const cache = useNuxtData(key)
      return cache.data.value
    },
  }
)
</script>

<template>
  <Body :class="theme" />

  <TopMenu />

  <main class="w-4/12 mx-auto">
    <div class="flex gap-y-2 flex-col items-center" v-if="pending">
      <div class="w-full h-48 bg-gray-800 animate-pulse" v-for="i in 10" :key="i" />
    </div>

    <div class="flex gap-y-2 flex-col items-center" v-else>
      <div id="content" class="font-bookerly prose prose-lg prose-slate prose-dark text-slate-300">
        <template v-for="sentence in sentences">
          <p v-for="line in sentence.insert.split('\n')" :key="line">{{ line }}</p>
        </template>
      </div>
    </div>

    <ClientOnly v-if="!pending">
      <ScrollRestorer />
      <Prose />
      <HighlightPins />
    </ClientOnly>
  </main>
</template>
