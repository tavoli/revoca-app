<script setup lang="tsx">
  function randomWord() {
    const list = ['mean', 'chain', 'sail', 'sugar', 'screw', 'sneeze', 'societ']
    return list[Math.floor(Math.random() * list.length)]
  }

  const query = useRequestURL()
  onMounted(() => {
    $fetch(`/api/sentences/paginate?s=${query.pathname.split('/')[2]}`)

    $fetch('/api/pinwords', {
      method: 'POST',
      body: { 
        book_id: 21,
        sentence_id: 10,
        word: randomWord(),
      },
    })

    $fetch(`/api/pinwords/paginate?n=0`)
    $fetch('/api/books/by-pins?p=1,2,3')
  })

</script>

<template>
</template>
