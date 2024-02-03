<script setup lang="tsx">
import {nodeViewProps} from '@tiptap/vue-3'
import Controller from '~/utils/controller';

const showContent = ref(false)

const {editor} = defineProps({
  editor: nodeViewProps.editor,
})

const target = useState<Target>('target')

const handleSimplify = async () => {
  showContent.value = false;

  let tr = editor.state.tr;

  const selection = tr.selection;

  const el = editor.view.domAtPos(selection.from);
  if (el.node) {
    (el?.node as HTMLElement).classList.add('text-slate-800', 'animate-pulse');
  }

  let sentence = ''
  editor.state.doc.nodesBetween(selection.from, selection.to, (node) => {
    sentence = node.textContent;
  });

  try {
    const response = await Controller.aiSimplify(sentence);
    sentence = response.generated
    console.log(response);
  } catch (error) {
    console.log(error);
  }

  editor.state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
    tr = tr.replaceWith(pos, pos + node.nodeSize, editor.schema.node('paragraph', {
      meta: {
        id: node.attrs.meta.id,
      }
    }, editor.schema.text(sentence)));
  });
  
  editor.view.dispatch(tr);

  (el?.node as HTMLElement).classList.remove('text-slate-800', 'animate-pulse');
}

const handleInfuse = async () => {
  showContent.value = false;

  let tr = editor.state.tr;

  const selection = tr.selection;

  const el = editor.view.domAtPos(selection.from);
  if (el.node) {
    (el?.node as HTMLElement).classList.add('text-slate-800', 'animate-pulse');
  }

  let sentence = ''
  let pins: string[] = []

  editor.state.doc.nodesBetween(selection.from, selection.to, (node) => {
    sentence = node.textContent;
  });

  try {
    const response = await Controller.aiInfuse(
      sentence,
      target.value.bookId as number,
    );

    sentence = response.generated
    pins = response.pins
    console.log(response);
  } catch (error) {
    console.log(error);
  }

  editor.state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
    tr = tr.replaceWith(pos, pos + node.nodeSize, editor.schema.node('paragraph', {
      meta: {
        id: node.attrs.meta.id,
      }
    }, editor.schema.text(sentence)));
  });
  
  editor.view.dispatch(tr);

  (el?.node as HTMLElement).classList.remove('text-slate-800', 'animate-pulse');
}

const buildSentence = (
  sentence: string,
  pins: string[]
) => {
  const pinSet = new Set(pins.map((pin) => pin))
  const words = sentence.split(' ')
  const normalized = words.map((word) => {
    if (pinSet.has(word)) {
      return `<strong>${word}</strong>`
    }
    return word
  })
  return normalized.join(' ')
}
</script>

<template>
  <button data-trigger id="hover-menu" />

  <div id="popover" class="absolute -top-2 -left-16">
    <button class="flex group items-center justify-center border rounded-md border-transparent bg-slate-900 text-neutral-500 hover:bg-black/5 hover:text-neutral-700 hover:bg-white/10 hover:text-neutral-300 h-8 gap-1 w-[2rem] px-2" @click="showContent = !showContent">
      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
        <circle cx="9" cy="12" r="1"></circle>
        <circle cx="9" cy="5" r="1"></circle>
        <circle cx="9" cy="19" r="1"></circle>
        <circle cx="15" cy="12" r="1"></circle>
        <circle cx="15" cy="5" r="1"></circle>
        <circle cx="15" cy="19" r="1"></circle>
      </svg> 
    </button>

    <div class="mt-2 p-2 flex flex-col min-w-[8rem] rounded-lg bg-gray-900 dark:bg-black shadow-sm border border-slate-800 dark:border-neutral-800" :class="{'hidden': !showContent}">
      <button>
        <button class="flex items center gap-2 p-1.5 text-sm font-medium text-neutral-500 dark:text-neutral-400 text-left bg-transparent w-full rounded hover:text-neutral-200 dark:hover:bg-neutral-900 dark:hover:text-neutral-200" @click="handleInfuse">
          infuse pins
        </button>

        <button class="flex items center gap-2 p-1.5 text-sm font-medium text-neutral-500 dark:text-neutral-400 text-left bg-transparent w-full rounded hover:text-neutral-200 dark:hover:bg-neutral-900 dark:hover:text-neutral-200" @click="handleSimplify">
          simplify text
        </button>
      </button>
    </div>
  </div>
</template>
