<script setup lang="tsx">
  const query = useRequestURL()
  onMounted(() => {
    $fetch('/api/sentences/paginate', {
      method: 'POST',
      body: { 
        username: localStorage.getItem('u'),
        slug: query.pathname.split('/')[2],
      },
    })
  })
</script>

<template>
</template>
