import { mergeAttributes, Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'

import Component from './Component.vue'

export default Node.create({
  name: 'floating-tools',
  group: 'block',
  atom: true,

  parseHTML() {
    return [
      {
        tag: 'floating-tools',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['floating-tools', mergeAttributes(HTMLAttributes), 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(Component)
  },
})
