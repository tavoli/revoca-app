<script lang="tsx" setup>
const router = useRouter()

const gotoBooks = () => {
  router.push('/books')
}
</script>

<template>
  <button @click="gotoBooks" class="btn btn-tertiary w-24">
    books
  </button>
</template>
