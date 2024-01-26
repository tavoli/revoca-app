<script lang="tsx" setup>
import AutoComplete from './AutoComplete.vue'
</script>

<template>
  <div class="text-center py-2">
    <h1 class="font-semibold text-gray-200">books</h1> 
  </div>
  <div class="flex flex-row gap-x-2">
    <GoHomeBtn />
    <AutoComplete />
  </div>
</template>
