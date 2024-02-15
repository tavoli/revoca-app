import type {Node} from "prosemirror-model";
import {Plugin} from "prosemirror-state";
import {Decoration, DecorationSet} from "prosemirror-view";

const slashn = /\n/g

function scan(doc: Node) {
  let result: { from: number, to: number }[] = []
  
  function record(from: number, to: number) {
    result.push({from, to})
  }

  doc.descendants((node: Node, pos: number) => {
    if (node.isText) {
      let m

      while ((m = slashn.exec(node.text as string)) !== null) {
        // avoid duplicate
        if ((m.index + pos) - 1 === result[result.length - 1]?.to) {
          continue
        }

        if (!result.length) {
          result.push({from: 0, to: pos + m.index})
        } else {
          let last = result[result.length - 1]

          const from = last.to + 1
          const to = pos + m.index

          record(from, to)
        }
      }
    }
  })

  // add last line
  if (result.length) {
    let last = result[result.length - 1]
    record(last.to + 1, doc.nodeSize)
  }

  return result
}

function scanDeco(doc: Node) {
  let decos: Decoration[] = []

  scan(doc).forEach(({from, to}) => {
    decos.push(
      Decoration.inline(from, to, {
        nodeName: "span",
      })
    )
  })

  return DecorationSet.create(doc, decos)
}

export default new Plugin({
  props: {
    decorations(state) {
      return this.getState(state)
    },
  },

  state: {
    init(_, {doc}) {
      return scanDeco(doc)
    },

    apply(tr, set) {
      const action = tr.getMeta("DECORATION")
      if (action && action.type === "LEFT_POPUP") {
        return scanDeco(tr.doc)
      }
      return set
    }
  },

})
