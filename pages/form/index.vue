<script setup lang="tsx">
  import Data from './_components/Data.vue';
  import Preview from './_components/Preview.vue';  

  export interface Form {
    title: string;
    rawText: string;
    imageUrl: string;
    errors: Map<string, string>;
  }

  const step = useState("step", () => 1)
  useState<Form>("form", () => ({
    title: 'title here',
    rawText: 'title',
    imageUrl: 'put your image url here',
    errors: new Map<string, string>(),
  }))
  useState("sentences", () => [])
</script>

<template>
  <Preview v-if="step === 2" />
  <Data v-else />
</template>
