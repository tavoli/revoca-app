<template>
  <editor-content :editor="editor" />
</template>

<script setup lang="tsx">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import FileHandler from '@tiptap-pro/extension-file-handler'
import Image from '@tiptap/extension-image'
import DropCursor from '@tiptap/extension-dropcursor'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    Document,
    Heading.configure({
      HTMLAttributes: {
        class: 'text-2xl font-bold',
      },
    }),
    Paragraph,
    Text,
    Image,
    DropCursor,
    FileHandler.configure({
      onDrop: (currentEditor, files, pos) => {
        files.forEach((file) => {
          handleFilePaste(file, currentEditor, pos)
        })
      },
      onPaste: (currentEditor, files) => {
        files.forEach(file => {
          handleFilePaste(file, currentEditor, currentEditor.state.selection.anchor)
        })
      },
    })
  ],
  onUpdate(update) {
    emit('update:modelValue', update.editor.getHTML())
  },
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none h-64',
    },
  },
}) as any

onMounted(() => {
  editor.value.chain().focus('end').setHeading({ level: 1 }).run()
})

function handleFilePaste(file: File, editor: any, pos: number) {
  switch (file.type) {
    case 'image/png':
    case 'image/jpeg':
    case 'image/gif':
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        editor.chain().focus().setImage({ src: reader.result }).run()
        editor.chain().insertContentAt(pos, {
          type: 'image',
          attrs: {
            src: reader.result,
          },
        }).focus().run()
      }
      break
    case 'text/plain':
      const reader2 = new FileReader()
      reader2.readAsText(file)
      reader2.onload = () => {
        editor.chain().focus().insertContentAt(pos, {
          type: 'text',
          text: reader2.result,
        }).run()
      }
    case 'application/pdf':
      // TODO: handle pdf
      break
    default:
      break
  }
}
</script>
