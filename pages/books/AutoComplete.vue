<script lang="tsx" setup>
const search = ref('')
</script>

<template>
  <input
    v-model="search"
    type="text"
    class="flex-1 rounded-md px-2"
    placeholder="search"
    aria-label="Search"
    aria-describedby="basic-addon1"
  />
</template>
