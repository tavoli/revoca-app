<script setup lang="tsx">
import {nodeViewProps} from '@tiptap/vue-3'
import Controller from '~/utils/controller';
import {type Pin, type Target} from '~/utils/types';

const {editor} = defineProps({
  editor: nodeViewProps.editor,
})

const target = useState<Target>('target')
const pins = useState<Pin[]>('pins')

const handlePin = () => {
  editor.commands.toggleBold()

  Controller.postPin({
    book_id: target.value.bookId!,
    sentence_id: target.value.sentenceId!,
    pin: target.value.pin!,
  })
}

const currentPin = computed(() => {
  return pins.value.find(pin => pin.pin === target.value.pin)
})
</script>

<template>
  <div class="p-0.5" v-if="currentPin">
    <p class="text-gray-800 text-sm text-left">
      {{ currentPin.definitions }}
    </p>
  </div>
  <button @click="handlePin" class="btn btn-primary">
    H+
  </button>
</template>
