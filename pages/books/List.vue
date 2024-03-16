<script lang="tsx" setup>
const router = useRouter()

const gotoBook = (slug: string) => {
  router.push(slug)
}

interface Props {
  books: any
}

const props = withDefaults(defineProps<Props>(), { books: [] })
</script>

<template>
  <ul class="grid grid-cols-8 gap-4">

    <li class="bg-gray-800 rounded-md cursor-pointer relative"
      v-for="item in props.books"
      :key="item.id"
      @click="gotoBook(item.slug)">

      <img class="object-fit text-gray-200 rounded-b-md min-h-60"
        :src="item.image_url" 
        :alt="item.title" 
      />

      <p class="w-full text-gray-200 absolute bottom-0 p-2 bg-blue-950 rounded-b-md flex items-center">
        {{ item.title }}
      </p>
    </li>

  </ul>
</template>
