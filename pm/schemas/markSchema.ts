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
        id: {default: null}
      },
      parseDOM: [
        {
          tag: "p",
          getAttrs(dom: HTMLElement | string) {
            return {
              id: dom instanceof HTMLElement ? dom.id : null,
            }
          }
        },
      ]
    },

    blockquote: {
      group: "block",
      content: "paragraph{1}",
      toDOM() {
        return ["blockquote", {class: "border-4 border-l-indigo-500 pl-4"}, 0]
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
