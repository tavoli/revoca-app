<script setup lang="tsx">
const route = useRoute()

const slug = route.params.slug as string
const DATA_KEY = factoryDataKeys(slug)

// TODO login when token is not present
// TODO save the generated sentence on cache

await useAsyncData(DATA_KEY.PINS,
  fetchPinsPaginate,
  {
    getCachedData(key) {
      const cache = useNuxtData(key)
      return cache.data.value
    },
  }
)

await useLazyAsyncData(DATA_KEY.PINNED,
  () => fetchPinned(slug),
  {
    getCachedData: (key) => useNuxtData(key).data.value,
  }
)

const {data: sentences, pending} = await useAsyncData(DATA_KEY.SENTENCES,
  () => fetchSentences(slug),
  {
    getCachedData(key) {
      const cache = useNuxtData(key)
      return cache.data.value
    },
  }
)
</script>

<template>
  <Body class="mode-dark" />

  <TopMenu />

  <main class="w-4/12 mx-auto">
    <div class="flex gap-y-2 flex-col items-center" v-if="pending">
      <div class="w-full h-48 bg-gray-800 animate-pulse" v-for="i in 10" :key="i" />
    </div>
    <div class="flex gap-y-2 flex-col items-center" v-else>
      <div id="content" class="hidden">
        <template v-for="s in sentences">

          <blockquote class="border-l-green-800 pl-4" 
            v-if="s.type === 'quote'" 
            :id="s.id">

            <p class="py-4" :id="s.id" :data-parent="s.parent">{{ s.sentence }}</p>

          </blockquote>

          <p class="py-4" 
            v-else 
            :id="s.id" 
            :key="s.id">
            {{ s.sentence }}
          </p>

        </template>
      </div>
    </div>

    <ClientOnly v-if="!pending">
      <Prose />
    </ClientOnly>
  </main>
</template>
