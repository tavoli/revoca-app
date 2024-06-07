<script setup lang="tsx">
import Controller from '~/utils/controller';
import Header from './Header.vue'
import List from './List.vue'

const data = ref([])

onMounted(async () => {
  data.value = await Controller.paginateBooks()
})
</script>

<template>
  <Head>
    <title>books</title>
  </Head>
  <div class="container mx-auto flex flex-col gap-y-10">
    <Header />
    <List :books="data"  v-if="data.length" />
    <div v-else>
      <p class="text-gray-200">No books found</p>
    </div>
  </div>
</template>

