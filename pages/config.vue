<script lang="tsx" setup>
const route = useRoute()

const slug = route.query.slug as string
const DATA_KEY = factoryDataKeys(slug)

const pinned = await useLazyAsyncData(DATA_KEY.PINNED,
  () => fetchPinned(slug),
  {
    getCachedData: (key) => useNuxtData(key).data.value,
  }
)

const {data: pins, pending} = await useLazyAsyncData(DATA_KEY.PINS,
  fetchPinsPaginate,
  {
    transform: (data) => {
      return data.map((pin) => {
        const selected = pinned.data.value?.includes(pin.pin)
        return {
          ...pin,
          selected,
        }
      })
    },
  })

const toggleCached = (pin: string) => {
  const index = pins.value?.findIndex((p: any) => p.pin === pin) as number

  if (index !== -1) {
    if (pins.value?.[index]) {
      pins.value[index].selected = !pins.value[index].selected
    }
  }
}

const appendToPinned = (pin: string) => {
  if (pinned.data.value?.includes(pin)) {
    pinned.data.value = pinned.data.value?.filter((p: any) => p !== pin)
  } else {
    pinned.data.value = [...pinned.data.value, pin]
  }
}

const optmisticUpdate = (pin: string) => {
  toggleCached(pin)
  appendToPinned(pin)
}

const handleSelectPin = (pin: string) => {
  fetchTogglePin({slug, pin}, optmisticUpdate)
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

        <div v-if="!pending && pins?.length" class="relative h-48">
          <div class="absolute bottom-0 inset-x-0 p-4 flex justify-center">
            <button class="bg-blue-950 text-white font-bold py-2 px-4 rounded w-96" @click="$router.push(`/${slug}`)">
              go to book
            </button>
          </div>
        </div>
      </div>

      <div v-if="!pending && !pins?.length" class="absolute inset-0 flex items-center justify-center">
        <h1 class="text-2xl font-bold text-center text-gray-200">
          no pins found
        </h1>
        <button class="bg-blue-950 text-white font-bold py-2 px-4 rounded ml-4" @click="$router.push(`/${slug}`)">
          go to book
        </button>
      </div>
    </div>
  </div>
</template>
