<template>
  <main>
    <h1>enter</h1>
    <input type="text" placeholder="username">
    <button @click="router.push('/form')">
      submit
    </button>
  </main> 
</template>

<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();

  onMounted(() => {
    const input = document.querySelector('input')
    input?.focus()
  })
</script>

<style>
  body {
    background-color: #121212;
  }
  main {
    margin: 0 auto;
    width: 300px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  h1 {
    color: #fff;
    font-size: 24px;
  }
  input {
    width: 100%;
    background-color: transparent;
    border: none;
    color: #fff;
    font-size: 16px;
    outline: none;
  }
  button {
    width: 100%;
    padding: 5px;
    background-color: green;
    color: #fff;
    border: none;
    font-size: 16px;
    cursor: pointer;
    border-radius: 2px;
  }
</style>