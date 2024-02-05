import {Plugin} from "prosemirror-state";
import type {EditorView} from "prosemirror-view";

let mouseClickes = 0

export default new Plugin({
  props: {
    handleDOMEvents: {
      mousedown: () => {
        mouseClickes++
      },
      mouseup: (view: EditorView) => {
        mouseClickes--
        if (mouseClickes === 0) {
          onUpdate(view)
        }
      }
    }
  }
})

function onUpdate(view: EditorView) {
  const {from, to} = view.state.selection
  const selection = view.state.doc.textBetween(from, to, " ")

  if (selection.trim().length > 0) {
    const rect = view.coordsAtPos(from)

    dispatchSelection(view, selection)
    show(rect)
  } else {
    hide()
  }
}

function dispatchSelection(view: EditorView, selection: string) {
  const from = view.state.selection.from
  const start = view.state.doc.resolve(from).start(-1)
  const node = view.state.doc.nodeAt(start)

  view.dispatch(
    view.state.tr.setMeta("DISPATCH", {
      type: "SELECTION",
      payload: {
        selection,
        id: +node?.attrs.id
      }
    })
  )
}

function show(rect: { top: number; left: number }) {
  const floatPopup = document.querySelector("#floatPopup") as HTMLElement
  if (floatPopup) {
    floatPopup.style.display = "block"
    floatPopup.style.top = `${window.scrollY + rect.top + 25}px`
    floatPopup.style.left = `${rect.left}px`
  }
}

function hide() {
  const floatPopup = document.querySelector("#floatPopup") as HTMLElement
  if (floatPopup) {
    floatPopup.style.display = "none"
  }
}

