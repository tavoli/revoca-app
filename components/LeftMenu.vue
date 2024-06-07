<script setup lang="ts">
import {theme} from '@/stores/theme.ts'
import {Range} from 'quill/core/selection';

const showContent = ref(false)
const slug = useSlug()
const selection = ref<Range>()

const onSelection = (e: any) => {
  const { detail } = e
  const { index, length } = detail
  selection.value = { index, length } as Range
}

const cls = [
  'GENERATED',
  'border-l-4',
  'pl-4',
]

const handleInfuse = () => {
  processTextCommand(
    slug,
    selection.value as Range,
    'infuse',
    [...cls, 'border-green-900']
  )

  showContent.value = false
}

const handleSimplify = async () => {
  processTextCommand(
    slug,
    selection.value as Range,
    'simplify',
    [...cls, 'border-green-700']
  )

  showContent.value = false
}

const handleSplit = async () => {
  showContent.value = false

  processTextCommand(
    slug,
    selection.value as Range,
    'split',
    [...cls, 'border-green-500']
  )
}

const handleModernize = async () => {
  showContent.value = false

  processTextCommand(
    slug,
    selection.value as Range,
    'modernize',
    [...cls, 'border-green-300']
  )
}

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement

  if (!target.closest('#leftMenu')) {
    showContent.value = false
  }
}

window.addEventListener('virtual-selection', onSelection)

window.addEventListener('click', handleClickOutside)

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
  window.removeEventListener('virtual-selection', onSelection)
})
</script>

<template>
  <div id="leftMenu" class="absolute z-10 hidden">
    <button class="flex group items-center justify-center border rounded-md border-transparent bg-slate-900 text-neutral-500 hover:bg-white/10 hover:text-neutral-300 h-8 gap-1 w-[2rem] px-2" 
      :class="theme.sepia && 'bg-transparent hover:bg-slate-300'"
      @click="showContent = !showContent">
      <svg class="text-slate-300 w-4 h-4"
        :class="theme.sepia && 'text-slate-950'"
        xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="12" r="1"></circle>
        <circle cx="9" cy="5" r="1"></circle>
        <circle cx="9" cy="19" r="1"></circle>
        <circle cx="15" cy="12" r="1"></circle>
        <circle cx="15" cy="5" r="1"></circle>
        <circle cx="15" cy="19" r="1"></circle>
      </svg> 
    </button>

    <div class="mt-2 p-2 flex flex-col min-w-[8rem] rounded-lg bg-slate-900 shadow-sm border border-slate-800" 
      :class="{'hidden': !showContent, 'bg-slate-300': theme.sepia}">
      <button>
        <button class="flex items center gap-2 p-1.5 text-sm font-medium text-slate-400 text-left bg-transparent w-full rounded hover:text-slate-300" 
          :class="theme.sepia && 'hover:text-slate-500'"
          @click="handleInfuse">
          infuse pins
        </button>

        <button class="flex items center gap-2 p-1.5 text-sm font-medium text-slate-400 text-left bg-transparent w-full rounded hover:text-slate-300"
          :class="theme.sepia && 'hover:text-slate-500'"
          @click="handleSimplify">
          simplify text
        </button>

        <button class="flex items center gap-2 p-1.5 text-sm font-medium text-slate-400 text-left bg-transparent w-full rounded hover:text-slate-300"
          :class="theme.sepia && 'hover:text-slate-500'"
          @click="handleSplit">
          split text
        </button>

        <button class="flex items center gap-2 p-1.5 text-sm font-medium text-slate-400 text-left bg-transparent w-full rounded hover:text-slate-300"
          :class="theme.sepia && 'hover:text-slate-500'"
          @click="handleModernize">
          modernize text
        </button>
      </button>
    </div>
  </div>
</template>
