<script setup lang="ts">
  onMounted(() => {
    $fetch('/api/paginate', {
      method: 'POST',
      body: { 
        username: localStorage.getItem('u'),
        title: 'put-your-title-here',
        nextCursor: 0,
      },
    })
  })
</script>

<template>
</template>
