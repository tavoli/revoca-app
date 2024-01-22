<template>
  <main>
    <h1>Log in</h1>
    <input v-model="username" placeholder="username" feedback="submit" />
    <button @click="createUserSession">
      Submit
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

<style lang="pcss" scoped>
  main {
    @apply flex flex-col items-center justify-center h-screen;
    @apply space-y-4 border w-1/2 p-4;
  }

  h1 {
    @apply text-4xl font-bold mb-4;
  }

  button {
    @apply bg-blue-500 text-white font-bold py-2 px-4 rounded;
  }

  input {
    @apply border border-gray-400 rounded p-2;
  }
</style>
