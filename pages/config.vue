<script lang="tsx" setup>
const route = useRoute()

const slug = route.query.slug as string

const cache = useNuxtData(slug)

const fetchAllPinned = async () => {
  return await $fetch(`/api/books/pinned`, {
    query: {
      s: slug,
    },
  })
}

const pinned = await useLazyAsyncData(`${slug}:pinned`, fetchAllPinned, {
  getCachedData(key) {
    const cache = useNuxtData(key)
    return cache.data.value
  },
})

const pins = ref(cache.data.value?.pins.map((pin: PinDefinition) => {
  const selected = pinned.data.value?.includes(pin.pin)
  return {
    ...pin,
    selected,
  }
}) ?? [])

const handleSelectPin = (pin: string) => {
  useFetch(`/api/books/toggle-pin`, {
    headers: {
      'Authorization': `${localStorage.getItem('token')}`,
    },
    method: 'POST',
    body: {
      pin,
      slug,
    },
    onRequest() {
      const index = pins.value.findIndex((p: any) => p.pin === pin)
      pins.value[index].selected = !pins.value[index].selected

      if (pinned.data.value?.includes(pin)) {
        pinned.data.value = pinned.data.value?.filter((p: any) => p !== pin)
      } else {
        pinned.data.value = [...pinned.data.value, pin]
      }

      return true
    },
  })
}
</script>

<template>
  <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="fixed inset-0 z-10 w-screen h-screen overflow-pretty bg-slate-950">

      <button class="absolute top-0 right-0 z-10 p-4" @click="$router.back()">
        <svg class="w-6" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#fff">
          <path d="M6 6L14 14M14 6L6 14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      </button>
        
      <div class="w-10/12 mx-auto">
        <h1 class="text-2xl font-bold text-center text-gray-200 mt-16">
          pins you want to study
        </h1>

        <div class="grid grid-cols-4 gap-4 mt-14">

          <button class="h-16 grid place-items-center border rounded-md" 
            v-for="p in pins" 
            @click="handleSelectPin(p.pin)"
            :class="p.selected && 'bg-green-900'"
            :key="p.id">

            <h1 class="text-gray-200 text-xl text-left">
              {{ p.pin }}
            </h1>
          </button> 

        </div>
      </div>
    </div>
  </div>
</template>
