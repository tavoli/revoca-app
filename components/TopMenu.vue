<script lang="tsx" setup>
const menu = ref<HTMLDivElement>()
const lastScroll = ref(0)

const handleScroll = () => {
  const scrollDown = window.scrollY > lastScroll.value
  const scrollUp = window.scrollY < lastScroll.value

  if (scrollDown) {
    setMenuTop('-100px')
  } else if (scrollUp) {
    setMenuTop('0.5rem')
  }

  lastScroll.value = window.scrollY
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const setMenuTop = (value: string) => {
  if (menu.value) menu.value.style.top = value
}
</script>

<template>
  <div class="sticky top-2 z-1 w-10/12 mx-auto" ref="menu">
    <div class="flex flex-row gap-x-2">
      <GoBooksBtn />
      <GoNewBtn />

      <div class="flex-1 flex justify-end gap-2">
        <GoConfigBtn />
        <Toolbar />
      </div>
    </div>
  </div>
</template>
