<script setup lang="tsx">
const selected = ref('')
const response = ref('')

const handleNewPin = () => {
 
}

window.quill.on('selection-change', (range) => {
  if (!range) return;

  const updateSelectionContext = async (prompt: string, start: number, len: number) => {
    if (prompt.length > 0 && selected.value !== prompt) {
      selected.value = prompt;
      window.quill.setSelection(start, len);
      const context = window.quill.getText(Math.max(0, start - 20), len + 40);
      response.value = '';

      for await (const chunk of aiPrompt({ context, prompt })) {
        response.value += chunk;
      }
    }
  };

  let prompt, start, len;

  if (range.length === 0) {
    start = range.index;
    let end = start;
    
    while (start > 0 && isalnum(window.quill.getText(start - 1, 1))) start--;
    while (isalnum(window.quill.getText(end, 1))) end++;
    
    len = end - start;
    prompt = window.quill.getText(start, len);
  } else {
    prompt = window.quill.getText(range.index, range.length);
    start = range.index;
    len = range.length;
  }

  updateSelectionContext(prompt, start, len);
});

function isalnum(str: string) {
  return /^[a-zA-Z0-9]*$/.test(str);
}
</script>

<template>
  <div id="floatMenu" class="absolute z-10 font-sans hidden">

    <div class="absolute">
      <div class="w-96 h-36 bg-slate-900 p-2 rounded shadow-md overflow-pretty">

        <div class="mb-16 flex flex-col gap-y-2">
          <p class="text-base text-slate-200">
            {{ response }} 
          </p>
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
