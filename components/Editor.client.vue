<script setup lang="tsx">
import Quill from 'quill';

const emit = defineEmits(['change']);

const options = {};

window.quill = new Quill('#editor', options);

window.quill.on('text-change', () => {
  emit('change', window.quill.getContents());
});
</script>

<template>
  <!-- just a empty div to avoid vue warning -->
  <!-- the #editor target is found at the parent component -->
  <div />
</template>

<style>
.ql-editor {
  min-height: 18em;

  &:focus-visible {
    outline: none;
  }
}
</style>
