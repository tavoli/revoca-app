<script setup lang="tsx">
  const cursor = useRequestHeader('X-Next-Cursor') ?? 0
  onMounted(() => {
    $fetch(`/api/books/paginate?n=${cursor}`)
    $fetch('/api/books/search?q=')
  })
</script>

<template>
</template>

