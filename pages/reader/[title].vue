<script setup lang="tsx">
  function randomWord() {
    const list = ['mean', 'chain', 'sail', 'sugar', 'screw', 'sneeze', 'societ']
    return list[Math.floor(Math.random() * list.length)]
  }

  const query = useRequestURL()
  onMounted(() => {
    $fetch('/api/sentences/paginate', {
      method: 'POST',
      body: { 
        username: localStorage.getItem('u'),
        slug: query.pathname.split('/')[2],
        // nextCursor: 0, // use this to reset cursor
      },
    })

    $fetch('/api/pinwords', {
      method: 'POST',
      body: { 
        username: localStorage.getItem('u'),
        book_id: 21,
        sentence_id: 10,
        word: randomWord(),
      },
    })

    $fetch(`/api/pinwords/paginate?n=0&u=${localStorage.getItem('u')}`)
  })

</script>

<template>
</template>
