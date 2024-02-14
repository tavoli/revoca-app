import type {Node} from "prosemirror-model";
import {Plugin} from "prosemirror-state";
import {Decoration, DecorationSet} from "prosemirror-view";

let pins = new RegExp('a^')
let pinned = new RegExp('a^')

function regex(pins: string[]) {
  return new RegExp('\\b(' + pins.join('|') + ')\\b', 'ig')
}

function scan(doc: Node) {
  let result: {
    from: number,
    to: number,
    pinned?: boolean
  }[] = []
  
  function record(from: number, to: number, pinned = false) {
    result.push({from, to, pinned})
  }

  doc.descendants((node: Node, pos: number) => {
    if (node.isText) {
      let m

      while (m = pins.exec(node.text as string)) {
        record(pos + m.index, pos + m.index + m[0].length)
      }

      while (m = pinned.exec(node.text as string)) {
        record(pos + m.index, pos + m.index + m[0].length, true)
      }
    }
  })

  return result
}

function scanDeco(doc: Node) {
  let decos: Decoration[] = []

  scan(doc).forEach(({from, to, pinned}) => {
    decos.push(

      Decoration.inline(from, to, {
        nodeName: "strong",
        class: pinned
          ? "bg-slate-800 text-slate-100"
          : "bg-green-800 text-slate-100"
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
      const action: {pins?: string[], pinned?: string[]} = tr.getMeta('SET_STATE')

      if (action?.pins) {
        pins = regex(action.pins)
        return scanDeco(tr.doc)
      }

      if (action?.pinned) {
        pinned = regex(action.pinned)
        return scanDeco(tr.doc)
      }

      return tr.docChanged ? scanDeco(tr.doc) : set
    }
  },

})
