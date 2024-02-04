<script lang="tsx" setup>
import Controller from '~/utils/controller';

const route = useRoute()

const slug = route.query.slug as string

const cache = useNuxtData<any>(slug)
const pins = cache.data.value.pins

const handleSelectPin = (pin: PinDefinition) => {
  pin.selected = !pin.selected
  Controller.setPin(slug, pin.pin)
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
            @click="handleSelectPin(pin)"
            v-for="pin in pins" 
            :class="pin.selected && 'bg-green-900'"
            :key="pin.id">

            <h1 class="text-gray-200 text-xl text-left">
              {{ pin.pin }}
            </h1>
          </button> 

        </div>
      </div>
    </div>
  </div>
</template>
