<script setup lang="tsx">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import { type Content } from "@tiptap/core"
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Image from '@tiptap/extension-image'

interface Props {
  html: Content
}

const props = withDefaults(defineProps<Props>(), {
  html: '',
})

const emit = defineEmits(['bottom'])

const isTarget = (id: string) => {
  const totalNodes = editor.value?.state.doc.childCount ?? 0
  if (totalNodes < 10) return false

  const targetIndex = totalNodes - 2
  const targetNode = editor.value?.state.doc.child(targetIndex)
  const targetId = targetNode?.textContent?.match(/{{(.*)}}/)?.[1] ?? ''

  return id === targetId
}

const saveScrollPosition = () => {
  const scrollPosition = window.scrollY
  if (scrollPosition === 0) return
  localStorage.setItem('scrollPosition', scrollPosition.toString())
}

const restoreScrollPosition = () => {
  const scrollPosition = localStorage.getItem('scrollPosition')
  if (scrollPosition === null) return
  window.scrollTo(0, parseInt(scrollPosition))
}

const CustomParagraph = Paragraph.extend({
  addAttributes() {
    return {
      meta: {
        default: null,
        parseHTML: (element) => {
          return {
            id: element.getAttribute('id'),
          }
        },
        renderHTML: (attributes) => {
          if (!attributes.id) return {}
          return {
            id: attributes.id,
          }
        },
      },
    }
  },
  addNodeView() {
    return ({ node, extension }) => {
      const dom = document.createElement('p')
      dom.textContent = node.textContent
      dom.setAttribute('id', node.attrs.meta?.id)
      dom.setAttribute('class', extension.options.HTMLAttributes.class)

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            saveScrollPosition()
            if (isTarget(dom.id)) {
              emit('bottom')
            }
          }
        })
      })

      observer.observe(dom)

      return {
        dom,
      }
    }
  },
})

const editor = useEditor({
  content: props.html,
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
  ],
  editable: false,
  editorProps: {
    attributes: {
      class: 'text-gray-300 text-lg font-bookerly',
    },
  },
  onTransaction() {
    restoreScrollPosition()
  },
})

watch(() => props.html, (value) => {
  editor.value?.chain().setContent(value).run()
})
</script>

<template>
  <Head>
    <link rel="stylesheet" href="/font/bookerly.css" />
  </Head>
  <editor-content :editor="editor" />
</template>
