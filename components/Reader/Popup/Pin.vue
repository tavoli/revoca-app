<script setup lang="tsx">
import {nodeViewProps} from '@tiptap/vue-3'
import {type Target} from '~/utils/types';

const {editor} = defineProps({
  editor: nodeViewProps.editor,
})

const target = useState<Target>('target')

const handlePin = () => {
  editor.commands.toggleBold()

  $fetch(`/api/pins`, {
    method: 'POST',
    headers: {
      'Authorization': `${localStorage.getItem('token')}`,
    },
    body: {
      book_id: target.value.bookId,
      sentence_id: target.value.sentenceId,
      pin: target.value.pin,
    },
  })
}
</script>

<template>
  <button @click="handlePin" class="btn btn-primary">
    H+
  </button>
</template>
