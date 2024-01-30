<script setup lang="tsx">
import {nodeViewProps, NodeViewWrapper} from '@tiptap/vue-3'

import type {Target} from '~/utils/types';
import Pin from './Pin.vue'

const props = defineProps(nodeViewProps)

const target = useState<Target>('target')

const popop = ref<HTMLElement>()
const content = ref<HTMLElement>()

const hidden = ref(true)
const style = ref({})

props.editor.on('selectionUpdate', ({ editor }) => {
  const { selection } = editor.state

  const isParagraph = editor.state.selection.$from.parent.type.name === 'paragraph'

  if (!isParagraph) {
    return
  }

  const { from, to } = selection
  const text = editor.state.doc.textBetween(from, to)

  target.value.sentenceId = +editor.state.selection.$from.parent.attrs.meta.id
  target.value.pin = text.trim()
  target.value.context = editor.state.doc.textBetween(from - 40, to + 40)

  if (text.trim().length === 0) {
    hidden.value = true
    return
  }

  const coords = editor.view.coordsAtPos(from, 0)
  const left = editor.view.dom.getBoundingClientRect().left
  
  if (text.trim().length > 0) {
    const scrollPos = window.scrollY
    const popupHeightPx = getComputedStyle(content.value!).height
    const popupHeight = parseInt(popupHeightPx.replace('px', '')) + 50
    style.value = {
      top: `${(coords.top + scrollPos) - popupHeight}px`,
      left: `${coords.left - left}px`,
    }
    hidden.value = false
  } else {
    hidden.value = true
  }
})

onUnmounted(() => {
  props.editor.off('transaction')
})
</script>

<template>
  <node-view-wrapper>
    <div ref="popop" :class="{ hidden }" :style="style" class="popop-container absolute z-10 top-0 left-0">
      <div class="popop absolute">
        <div ref="content" class="popop-content w-64 h-32 bg-white p-2 rounded shadow-md overflow-auto">
          <Pin :editor="props.editor" />
        </div>
      </div>
    </div>
  </node-view-wrapper>
</template>
