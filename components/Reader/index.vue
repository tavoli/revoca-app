<script setup lang="tsx">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import Document from '@tiptap/extension-document'
import Bold from '@tiptap/extension-bold'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Image from '@tiptap/extension-image'
import {extendParagraph} from './extendParagraph'
import Popup from './Popup'
import type {PinDefinition, Sentence} from '~/utils/types'
import {HoverMenu} from './Hover/hover'
import {Loading} from '../Tiptap/Loading'

interface Props {
  getInitialData: () => Promise<Sentence[]>
  getNextData: () => Promise<Sentence[]>
  getPins: () => Promise<PinDefinition[]>
}

const plugins = [`<floating-tools />`]

const pins = useState<PinDefinition[]>('definitions', () => [])

const props = withDefaults(defineProps<Props>(), {
  initialHtml: '',
  getNextData: () => Promise.resolve([]),
  getPins: () => Promise.resolve([]),
})

const CustomParagraph = extendParagraph(Paragraph, {
  async onIntersecting() {
    const nextJson = await props.getNextData()
    const nextHtml = normalize(nextJson, pins.value)
    editor.value?.commands.insertContentAt(
      editor.value?.state.doc.content.size,
      nextHtml,
    )
  },
})

const editor = useEditor({
  content: '',
  extensions: [
    Loading,
    Heading,
    CustomParagraph.configure({
      HTMLAttributes: {
        class: 'py-4 pl-14 pr-4 relative',
      },
    }),
    Document,
    Image,
    Text,
    (Bold as any).configure({
      HTMLAttributes: {
        class: 'font-bold bg-green-600 rounded-md',
      },
    }),
    Popup,
    HoverMenu.configure({
      element: '#hover-menu'
    }),
  ],
  editable: false,
  editorProps: {
    attributes: {
      class: 'text-gray-300 text-lg text-justify font-bookerly',
    },
  },
})

onMounted(async () => {
  const initialData = await props.getInitialData()
  pins.value = await props.getPins()

  const initialHtml = normalize(initialData, pins.value)
  const content = initialHtml.concat(...plugins)

  editor.value?.commands.setContent(content)
})
</script>

<template>
  <Head>
    <link rel="stylesheet" href="/font/bookerly.css" />
  </Head>

  <editor-content :editor="editor" />
</template>
