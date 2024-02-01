import type {ParagraphOptions} from "@tiptap/extension-paragraph"
import type {Node} from "@tiptap/vue-3"

interface ExtendedEvents {
  onIntersecting: (dom: HTMLElement) => void
}

export const extendParagraph = (
  Paragraph: Node<ParagraphOptions, any>,
  events: ExtendedEvents
) => {
  const CustomParagraph = Paragraph.extend({
    addAttributes() {
      return {
        meta: {
          default: null,
          parseHTML: (element) => {
            return {
              id: element.getAttribute('id'),
              title: element.getAttribute('title'),
            }
          },
          renderHTML: (attributes) => {
            if (!attributes.id) return {}
            return {
              id: attributes.id,
              title: attributes.title,
            }
          },
        },
      }
    },
    addNodeView() {
      return ({ editor, node, extension }) => {
        const dom = document.createElement('p')
        const content = document.createTextNode(node.textContent)

        dom.setAttribute('id', node.attrs.meta?.id)
        dom.setAttribute('class', extension.options.HTMLAttributes.class)
        if (node.attrs.meta?.title) {
          dom.setAttribute('title', node.attrs.meta?.title)
        }
        dom.appendChild(content)

        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const totalNodes = editor?.state.doc.childCount ?? 0
              if (totalNodes < 10) return false

              const targetIndex = totalNodes - 2
              const targetNode = editor?.state.doc.child(targetIndex)
              const targetId = targetNode?.attrs.meta?.id

              if (dom.id === targetId) {
                events.onIntersecting(dom)
              }
            }
          })
        })

        observer.observe(dom)

        return {
          content,
          contentDOM: dom,
          dom,
        }
      }
    },
  })

  return CustomParagraph
} 

