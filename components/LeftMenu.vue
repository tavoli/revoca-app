<script setup lang="tsx">
const showContent = ref(false)

const handleInfuse = () => {
  showContent.value = false
  window.view.dispatch(
    window.view.state.tr.setMeta('DISPATCH', { type: 'INFUSE_TEXT' })
  )
}

const handleSimplify = () => {
  showContent.value = false
  window.view.dispatch(
    window.view.state.tr.setMeta('DISPATCH', { type: 'SIMPLIFY_TEXT' })
  )
}

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('#leftMenu')) {
    showContent.value = false
  }
}

window.addEventListener('click', handleClickOutside)

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div id="leftMenu" class="absolute z-10 hidden">
    <button class="flex group items-center justify-center border rounded-md border-transparent bg-slate-900 text-neutral-500 hover:bg-black/5 hover:text-neutral-700 hover:bg-white/10 hover:text-neutral-300 h-8 gap-1 w-[2rem] px-2" @click="showContent = !showContent">
      <svg class="text-slate-300 w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="12" r="1"></circle>
        <circle cx="9" cy="5" r="1"></circle>
        <circle cx="9" cy="19" r="1"></circle>
        <circle cx="15" cy="12" r="1"></circle>
        <circle cx="15" cy="5" r="1"></circle>
        <circle cx="15" cy="19" r="1"></circle>
      </svg> 
    </button>

    <div class="mt-2 p-2 flex flex-col min-w-[8rem] rounded-lg bg-slate-900 dark:bg-black shadow-sm border border-slate-800 dark:border-neutral-800" :class="{'hidden': !showContent}">
      <button>
        <button class="flex items center gap-2 p-1.5 text-sm font-medium text-slate-400 text-left bg-transparent w-full rounded hover:text-slate-300" @click="handleInfuse">
          infuse pins
        </button>

        <button class="flex items center gap-2 p-1.5 text-sm font-medium text-slate-400 text-left bg-transparent w-full rounded hover:text-slate-300" @click="handleSimplify">
          simplify text
        </button>
      </button>
    </div>
  </div>
</template>
