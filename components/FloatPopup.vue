<script setup lang="ts">
const slug = useSlug()
const response = ref('')

const MIN_CHARS = 3

const handleNewPin = () => {
  const sel = window.quill.getSelection()
  if (!sel) return

  postPin({
    pin: window.quill.getText(sel.index, sel.length),
    slug,
  })

  window.quill.formatText(sel, 'underline', 'api')
}

const handleClose = () => {
  closeMenu()
}

const closeMenu = () => {
  const el = document.getElementById('floatMenu')
  if (el) {
    el.classList.add('hidden')
    el.style.left = '-9999px'
    el.style.top = '-9999px'
    el.style.display = 'none'
  }
}

const handleSelection = (range: { index: number; length: number }) => {
  if (!range) return;

  const updateSelectionContext = async (prompt: string, start: number, len: number) => {
    if (prompt.length > MIN_CHARS) {
      window.quill.setSelection(start, len);
      const context = window.quill.getText(Math.max(0, start - 20), len + 40);
      response.value = '';
      for await (const chunk of aiPrompt({ context, prompt })) {
        response.value += chunk;
      }
    }
  };

  if (range.length > MIN_CHARS) {
    const prompt = window.quill.getText(range.index, range.length);
    updateSelectionContext(prompt, range.index, range.length);
  }
}

window.quill.on('selection-change', handleSelection)

onUnmounted(() => {
  window.quill.off('selection-change', handleSelection)
})
</script>

<template>
  <div id="floatMenu" class="absolute z-10 font-sans">
    <div class="absolute">
      <div class="w-96 h-52 bg-slate-900 p-2 rounded shadow-md overflow-pretty">

        <div class="mb-16 flex flex-col gap-y-2">
          <p class="text-base text-slate-200">
            {{ response }} 
          </p>
        </div> 

        <footer class="w-full bg-slate-800 absolute p-2 right-0 bottom-0 rounded-b-md">
          <button @click="handleNewPin" class="btn btn-xs btn-secondary">
            pin +
          </button>
          <button @click="handleClose" class="btn btn-xs btn-secondary float-right text-red-500">
            close
          </button>
        </footer>
      </div>
    </div>

  </div>
</template>
