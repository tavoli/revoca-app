<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

import Controller from '~/utils/controller';

const username = ref('');
const router = useRouter();

const data = ref([])

onMounted(async () => {
  data.value = await Controller.paginateBooks()
})

const createUserSession = async () => {
  if (username.value) {
    const response = await $fetch<{token: string}>(`/api/session`, {
      method: 'POST',
      body: JSON.stringify({ 
        username: username.value 
      }),
    })

    localStorage.setItem('token', response.token)

    if (data.value.length) {
      router.push('/books')
    } else {
      router.push('/new')
    }
  }
};

onMounted(() => {
  const input = document.querySelector('input')
  input?.focus()
})
</script>

<template>
  <Body class="mode-dark" />
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-100">
          Log in to your account
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="createUserSession">
        <input type="hidden" name="remember" value="true">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="username" class="sr-only">Username</label>
            <input id="username" v-model="username" name="username" type="text" autocomplete="username" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Username">
          </div>
        </div>
        <div>
          <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <!-- Heroicon name: solid/lock-closed -->
              <svg class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 2.1c-3.5 0-6.4 2.9-6.4 6.5V10c0 1.3 1 2.4 2.3 2.6V15c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-2.4c1.3-.2 2.3-1.3 2.3-2.6v-1.4c0-3.6-2.9-6.5-6.4-6.5zM8 10v2.5c0 .3.2.5.5.5h3c.3 0 .5-.2.5-.5V10h1.7c.3 0 .4-.4.2-.6L10.7 4c-.2-.2-.5-.2-.7 0L6.1 9.4c-.2.2-.1.6.2.6H8z" clip-rule="evenodd"/>
              </svg>
            </span>
            Sign in
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

