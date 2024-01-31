<script setup lang="tsx">
import {nodeViewProps} from '@tiptap/vue-3'
import Controller from '~/utils/controller';
import {type PinDefinition, type Target} from '~/utils/types';

const {editor} = defineProps({
  editor: nodeViewProps.editor,
})

const target = useState<Target>('target')
const definitions = useState<PinDefinition[]>('definitions')
const meaning = ref<PinDefinition>()

const handleNewPin = () => {
  editor.commands.toggleBold()
  Controller.postPin({
    book_id: target.value.bookId!,
    sentence_id: target.value.sentenceId!,
    pin: target.value.pin!,
  })
}

watch(() => target.value.pin, async (currentPin) => {
  if (currentPin) {
    meaning.value = definitions.value.find(({pin}) => pin === currentPin)
    if (!meaning.value) {
      meaning.value = await Controller.getDefinition(currentPin)
      definitions.value.push(meaning.value)
    }
  }
})
</script>

<template>
  <div class="mb-16 flex flex-col gap-y-2" v-if="meaning">
    <ul class="flex flex-wrap gap-x-1 text-xs">
      <li v-for="partOfSpeech in meaning.partsOfSpeech" :key="partOfSpeech" class="border-1 border rounded-md p-1">
        {{ partOfSpeech }}
      </li>
    </ul>
    <div class="text-gray-800 text-sm text-left">
      <ul class="list-disc list-inside text-slate-100">
        <li v-for="def in meaning.definitions" :key="def">
          {{ def }}
        </li>
      </ul>
    </div> 
    <ul class="flex flex-wrap gap-1 text-xs">
      <li v-for="syn in meaning.synonyms" :key="syn" class="border-1 border rounded-md p-1">
        {{ syn }}
      </li>
    </ul>
  </div> 
  <footer class="w-full bg-slate-800 absolute p-2 right-0 bottom-0">
    <button @click="handleNewPin" class="btn btn-xs btn-secondary">
      pin +
    </button>
  </footer>
</template>
