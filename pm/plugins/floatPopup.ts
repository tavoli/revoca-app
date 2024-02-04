import {Plugin} from "prosemirror-state";
import type {EditorView} from "prosemirror-view";

let timeout: any
function debounce(callback: any, ms: number) {
  clearTimeout(timeout)
  timeout = setTimeout(callback, ms)
}

export default new Plugin({
  view: () => {
    return {
      update: (view: EditorView) => {
        debounce(() => onUpdate(view), 100)
      }
    }
  }
})

function onUpdate(view: EditorView) {
  const {from, to} = view.state.selection
  const selection = view.state.doc.textBetween(from, to, " ")

  if (selection) {
    const rect = view.coordsAtPos(from)

    dispatchSelection(view, selection)
    show(rect)
  } else {
    hide()
  }
}

function dispatchSelection(view: EditorView, selection: string) {
  view.dispatch(
    view.state.tr.setMeta("DISPATCH", {
      type: "SELECTION",
      payload: {
        selection,
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

