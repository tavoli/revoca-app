<script setup lang="tsx">
const currentDefinition = useState<PinDefinition>('currentDefinition')

const handleNewPin = () => {
  window.view.dispatch(
    window.view.state.tr.setMeta('DISPATCH', { type: 'PIN' })
  )
}
</script>

<template>
  <div id="floatPopup" class="absolute z-10 font-sans hidden">

    <div class="absolute">
      <div class="w-96 h-64 bg-slate-900 p-2 rounded shadow-md overflow-pretty">

        <div class="mb-16 flex flex-col gap-y-2" v-if="currentDefinition">
          <ul class="flex flex-wrap gap-x-1 text-xs text-slate-200">
            <li v-for="partOfSpeech in currentDefinition.partsOfSpeech" :key="partOfSpeech" class="border-1 border rounded-md p-1">
              {{ partOfSpeech }}
            </li>
          </ul>
          <div class="text-gray-800 text-sm text-left">
            <ul class="list-disc list-inside text-slate-200">
              <li v-for="def in currentDefinition.definitions" :key="def">
                {{ def }}
              </li>
            </ul>
          </div> 
          <ul class="flex flex-wrap gap-1 text-xs text-slate-200">
            <li v-for="syn in currentDefinition.synonyms" :key="syn" class="border-1 border rounded-md p-1">
              {{ syn }}
            </li>
          </ul>
        </div> 
        <footer class="w-full bg-slate-800 absolute p-2 right-0 bottom-0 rounded-b-md">
          <button @click="handleNewPin" class="btn btn-xs btn-secondary">
            pin +
          </button>
        </footer>

      </div>
    </div>

  </div>
</template>
