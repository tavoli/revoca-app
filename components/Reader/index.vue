<script setup lang="tsx">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import { type Content } from "@tiptap/core"
import Document from '@tiptap/extension-document'
import Bold from '@tiptap/extension-bold'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Image from '@tiptap/extension-image'
import {extendParagraph} from './extendParagraph'
import Popup from './Popup'

interface Props {
  html: Content
}

const plugins = [`<popup />`]

const props = withDefaults(defineProps<Props>(), {
  html: '',
})

const emit = defineEmits(['bottom'])

const CustomParagraph = extendParagraph(Paragraph, {
  onIntersecting() {
    emit('bottom')
  },
})

const editor = useEditor({
  content: props.html?.concat(...plugins),
  extensions: [
    Heading,
    CustomParagraph.configure({
      HTMLAttributes: {
        class: 'py-4',
      },
    }),
    Document,
    Image,
    Text,
    Bold.configure({
      HTMLAttributes: {
        class: 'font-bold bg-green-600 rounded-md',
      },
    }),
    Popup,
  ],
  editable: false,
  editorProps: {
    attributes: {
      class: 'text-gray-300 text-lg text-justify font-bookerly',
    },
  },
})

watch(() => props.html, (value) => {
  const content = value?.concat(...plugins)
  editor.value?.commands.setContent(content)
})
</script>

<template>
  <Head>
    <link rel="stylesheet" href="/font/bookerly.css" />
  </Head>
  <editor-content :editor="editor" />
</template>
