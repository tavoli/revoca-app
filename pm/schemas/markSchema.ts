import {Schema} from "prosemirror-model";

export default new Schema({
  nodes: {
    doc: {content: "block+"},

    paragraph: {
      group: "block",
      content: "text*",
      toDOM() {
        return ["p", {class: "py-4"}, 0]
      },
      attrs: {
        id: {
          default: null,
        },
        parent: {
          default: null,
        }
      },
      parseDOM: [
        {
          tag: "p",
          getAttrs(dom: HTMLElement | string) {
            return {
              id: dom instanceof HTMLParagraphElement ? dom.id : null,
              parent: dom instanceof HTMLParagraphElement ? dom.getAttribute("data-parent") : null,
            }
          }
        },
      ]
    },

    pre: {
      group: "block",
      content: "text*",
      toDOM() {
        return ["pre", {class: "bg-green-800 text-white p-4"}, 0]
      },
      attrs: {
        id: {
          default: null,
        },
        parent: {
          default: null,
        }
      },
      parseDOM: [
        {
          tag: "pre",
          getAttrs(dom: HTMLElement | string) {
            return {
              id: dom instanceof HTMLPreElement ? dom.id : null,
              parent: dom instanceof HTMLPreElement ? dom.getAttribute("data-parent") : null,
            }
          }
        },
      ]
    },

    blockquote: {
      group: "block",
      content: "paragraph{1} | pre{1}",
      toDOM() {
        return ["blockquote", {class: "border-l-green-800 pl-4"}, 0]
      },
      parseDOM: [
        {
          tag: "blockquote",
        },
      ]
    },

    text: { inline: true },
  },

  marks: {
    strong: {
      toDOM() {
        return ["strong", 0]
      }
    },
  }
})
