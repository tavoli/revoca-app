<script setup lang="tsx">
const token = useCookie('token')
const route = useRoute()

const slug = route.params.slug as string

const fetchInitialData = async () => {
  const [sentences, pins] = await Promise.all([
    $fetch(`/api/sentences`, {
      query: {
        s: slug,
      },
      headers: {
        Authorization: `${token.value || localStorage.getItem('token')}`,
      },
    }),
    $fetch(`/api/pins/paginate`, {
      query: {
        l: 100,
      },
      headers: {
        Authorization: `${token.value || localStorage.getItem('token')}`,
      },
    }).catch(() => []),
  ])

  return { sentences, pins }
}

const {data, pending} = await useLazyAsyncData(slug, fetchInitialData, {
  getCachedData(key) {
    const cache = useNuxtData(key)
    return cache.data.value
  },
})
</script>

<template>
  <Body class="mode-dark" />
  <Head>
    <link rel="stylesheet" href="/font/bookerly.css" />
  </Head>
  <TopMenu />
  <main class="w-4/12 mx-auto">
    <div class="flex gap-y-2 flex-col items-center" v-if="pending">
      <div class="w-full h-48 bg-gray-800 animate-pulse" v-for="i in 10" :key="i" />
    </div>
    <div class="flex gap-y-2 flex-col items-center" v-else>
      <div id="content" class="hidden">
        <p class="py-4 relative" v-for="s in data.sentences" :key="s.id" :id="s.id">
          {{ s.sentence }}
        </p>
      </div>
    </div>
    <ClientOnly v-if="!pending">
      <Prose />
    </ClientOnly>
  </main>
</template>
