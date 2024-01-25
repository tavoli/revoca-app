<template>
  <node-view-wrapper>
    ola 
  </node-view-wrapper>
</template>

<script setup lang="tsx">
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps({
  data: Array<any>
})
</script>
