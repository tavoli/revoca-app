import {EditorView, type NodeView} from "prosemirror-view"
import {Node} from "prosemirror-model"
import type {Store} from "pinia"

export default class PreView implements NodeView {
  dom: InstanceType<typeof window.Node>
  contentDOM: HTMLElement
  view: EditorView
  node: Node
  observer: MutationObserver
  target: Store<"target", ReturnType<typeof useTargetStore>>

  constructor(
    node: Node,
    view: EditorView,
  ) {
    this.dom = this.contentDOM = document.createElement("pre")
    this.view = view
    this.node = node
    this.target = useTargetStore() as Store<"target", ReturnType<typeof useTargetStore>>


    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement && node.nodeName === "SPAN") {
            node.addEventListener("mouseover", this.mouseover.bind(this))
          }
        })
      })
    })

    this.observer.observe(this.dom, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    })
  }

  setSelection() {
    const {from, to} = this.view.state.selection
    console.log('selcetion', from, to)
  }

  mouseover = (event: MouseEvent) => {
    // the pos and to is not loyalt to the span
    // fix this to get pos and to using proseMirror lib
    const span = event.target as HTMLSpanElement
    const pos = this.view.posAtDOM(span, 0)
    const to = pos + span.textContent.length
    this.popover(pos)
    this.dispatchPos(pos, to + 8)  // TODO: fix this
  }

  private dispatchPos(pos: number, to: number) {
    this.target.set({
      node: this.node,
      from: pos,
      to: to,
      id: this.node.attrs.id,
      parent: this.node.attrs.parent,
    })
  }

  private popover(pos: number) {
    const rect = this.posToDOMRect(pos)
    const menu = document.querySelector("#leftMenu") as HTMLElement
    if (menu) {
      menu.style.display = "block"
      menu.style.top = `${rect.top}px`
      menu.style.left = `${(rect.left - 40)}px`
    }
  }

  private posToDOMRect(pos: number) {
    const rect = this.view.coordsAtPos(pos)
    return {
      top: rect.top + window.scrollY,
      left: rect.left,
    }
  }

  destroy() {
    this.dom.childNodes.forEach((node) => {
      if (node instanceof HTMLElement && node.nodeName === "SPAN") {
        node.removeEventListener("mouseover", this.mouseover)
      }
    })

    this.observer.disconnect()
  }
}

if (import.meta.hot) {
  import.meta.hot.accept()
}
