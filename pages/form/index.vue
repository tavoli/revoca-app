<script setup lang="ts">
  import Data from './_components/Data.vue';
  import Preview from './_components/Preview.vue';  

  const step = useState("step", () => 1)
  useState("form", () => ({
    rawText: 'put your text here',
    imageUrl: 'put your image url here',
    errors: new Map<string, string>(),
  }))
  useState("sentences", () => [])
</script>

<template>
  <Preview v-if="step === 2" />
  <Data v-else />
</template>

