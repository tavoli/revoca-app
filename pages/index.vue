<template>
  <main>
    <h1>enter</h1>
    <input type="text" placeholder="username" v-model="username" />
    <button @click="createUserSession">
      submit
    </button>
  </main> 
</template>

<script setup lang="tsx">
  import { onMounted } from 'vue';
  import { useRouter } from 'vue-router';

  const username = ref('');
  const router = useRouter();

  const createUserSession = () => {
    if (username.value) {
      localStorage.setItem('u', username.value)

      $fetch(`/api/session`, {
        method: 'POST',
        body: JSON.stringify({ 
          username: username.value 
        }),
      })

      router.push('/form');
    }
  };

  onMounted(() => {
    const input = document.querySelector('input')
    input?.focus()
  })
</script>

<style>
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
