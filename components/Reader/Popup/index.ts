import { mergeAttributes, Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'

import Component from './Component.vue'

export default Node.create({
  name: 'popup',
  group: 'block',
  atom: true,

  parseHTML() {
    return [
      {
        tag: 'popup',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['popup', mergeAttributes(HTMLAttributes), 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(Component)
  },
})
