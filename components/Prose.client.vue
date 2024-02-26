<script setup lang="tsx">
import Quill from 'quill';
import type {Op} from 'quill/core';
import '~/quill/blots/paragraph';
import '~/quill/blots/quote';
import '~/quill/blots/generated';
import '~/quill/blots/divider';

declare global {
  interface Window {
    quill: Quill;
  }
}

const props = defineProps<{
  sentences: Op[];
}>()

const options = {
  readOnly: true,
}

window.quill = new Quill('#content', options);

window.quill.setContents(props.sentences);
</script>

<template>
  <LeftMenu />
  <FloatPopup />
</template>
