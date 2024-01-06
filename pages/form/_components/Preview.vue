<script setup lang="ts">
  const sentences = useState("sentences", () => []) 

  const onSubmit = (e: Event) => {
    e.preventDefault();
  };
</script>

<template>
  <form :v-on-submit="onSubmit">
    <h1>step 2</h1>
    <ul>
      <li v-for="(_, index) in sentences" :key="index">
        <input type="text" v-model="sentences[index]">
      </li>
    </ul>
    <button type="submit" @click="onSubmit">
      submit
    </button>
  </form>
</template>