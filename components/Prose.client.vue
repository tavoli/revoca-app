<script setup lang="tsx">
import Quill from 'quill';
import '~/quill/blots/paragraph';
import '~/quill/blots/quote';
import '~/quill/blots/generated';
import '~/quill/blots/divider';

declare global {
  interface Window {
    quill: Quill;
  }
}

const options = {
  readOnly: true,
}

window.quill = new Quill('#content', options);
</script>

<template>
  <LeftMenu />
  <FloatPopup />
</template>
