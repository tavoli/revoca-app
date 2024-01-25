<script setup lang="tsx">
  import { onMounted } from 'vue';
  import { useRouter } from 'vue-router';

  const username = ref('');
  const router = useRouter();

  const createUserSession = async () => {
    if (username.value) {
      const response = await $fetch<{token: string}>(`/api/session`, {
        method: 'POST',
        body: JSON.stringify({ 
          username: username.value 
        }),
      })

      localStorage.setItem('token', response.token)
      router.push('/new')
    }
  };

  onMounted(() => {
    const input = document.querySelector('input')
    input?.focus()
  })
</script>

<template>
  <main class="flex flex-col items-center justify-center h-screen space-y-4 border w-1/2 p-4">
    <h1 class="text-4xl font-bold mb-4">Log in</h1>
    <input class="border border-gray-400 rounded p-2" v-model="username" placeholder="username" feedback="submit" />
    <button class="bg-blue-500 text-white font-bold py-2 px-4 rounded" @click="createUserSession">
      Submit
    </button>
  </main> 
</template>
