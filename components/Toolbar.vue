<script setup>
  import {theme} from '@/stores/theme.ts'

  const open = ref(false)

  const changeTheme = (newTheme) => {
    theme.value = newTheme
  }
</script>

<template>
  <button class="btn btn-secondary" @click="open=!open">
    Aa
  </button>

  <div :class="{ 'visible': open, 'invisible': !open }" class="p-4 fixed top-14 bg-gray-100 border border-gray-300 rounded-lg">

    <!-- Font Selection -->
    <div class="flex gap-1 justify-between mb-4">
      <div class="flex flex-col flex-1 justify-center items-center p-2 border border-gray-300 rounded-lg cursor-pointer bg-blue-100">
        <span class="text-xl font-sans">Aa</span>
        <span>Sans-serif</span>
      </div>
      <div class="flex flex-col flex-1 justify-center items-center p-2 border border-gray-300 rounded-lg cursor-pointer">
        <span class="text-xl font-serif">Aa</span>
        <span>Serif</span>
      </div>
    </div>

    <!-- Size Selection -->
    <div class="flex items-center justify-between mb-4">
      <button class="w-16 p-2 border border-gray-300 rounded-lg">-</button>
      <span class="w-12 mx-2 p-2 border border-gray-300 rounded-lg text-center">6</span>
      <button class="w-16 p-2 border border-gray-300 rounded-lg">+</button>
    </div>

    <!-- Line Height -->
    <div class="flex items-center justify-between mb-4">
      <button class="w-16 p-2 border border-gray-300 rounded-lg cursor-pointer">
        <span>&#8596;</span>
      </button>
      <span class="w-12 mx-2 p-2 border border-gray-300 rounded-lg text-center">2</span>
      <button class="w-16 p-2 border border-gray-300 rounded-lg cursor-pointer">
        <span>&#8592;&#8594;</span>
      </button>
    </div>

    <!-- Paragraph Spacing -->
    <div class="flex items-center justify-between mb-4">
      <button class="w-16 p-2 border border-gray-300 rounded-lg">=</button>
      <span class="w-12 mx-2 p-2 border border-gray-300 rounded-lg text-center">5</span>
      <button class="w-16 p-2 border border-gray-300 rounded-lg">=</button>
    </div>

    <!-- Theme Selection -->
    <div class="flex justify-between gap-1">
      <button class="p-2 w-16 h-10 bg-white text-black border border-gray-300 rounded-lg" 
        @click="changeTheme({ light: true, dark: false, sepia: false })">
        Light
      </button>
      <button class="p-2 w-16 h-10 bg-gray-800 text-white rounded-lg" 
        @click="changeTheme({ light: false, dark: true, sepia: false })">
        Dark
      </button>
      <button class="p-2 w-16 h-10 bg-[#feffd8] text-black border border-gray-300 rounded-lg" 
        @click="changeTheme({ light: false, dark: false, sepia: true })">
        Sepia
      </button>
    </div>
  </div>
</template>
