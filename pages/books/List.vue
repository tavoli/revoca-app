<script lang="tsx" setup>
const router = useRouter()

const gotoBook = (slug: string) => {
  router.push(`/?s=${slug}`)
}

interface Props {
  books: any
}

const props = withDefaults(defineProps<Props>(), {
  books: []
})
</script>

<template>
  <ul class="grid grid-cols-8 gap-4">

    <li class="h-64 bg-gray-800 rounded-md cursor-pointer relative"
      v-for="item in props.books" 
      :key="item.id" 
      @click="gotoBook(item.slug)">

      <img class="object-fit text-gray-200" :src="item.image_url" :alt="item.title" />
      <p class="text-gray-200 absolute bottom-0 h-16 p-2 bg-blue-950 w-full rounded-b-md flex items-center">
        {{ item.title }}
      </p>

    </li>

  </ul>
</template>
