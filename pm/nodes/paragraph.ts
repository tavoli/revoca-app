import {EditorView, type NodeView} from "prosemirror-view"
import {Node} from "prosemirror-model"

import { useTargetStore } from "~/stores/target"
import type {Store} from "pinia"

export default class ParagraphView implements NodeView {
  dom: InstanceType<typeof window.Node>
  contentDOM: HTMLElement
  view: EditorView
  node: Node
  target: Store<"target", ReturnType<typeof useTargetStore>>

  constructor(
    node: Node,
    view: EditorView,
  ) {
    this.dom = this.contentDOM = document.createElement("p")
    this.view = view
    this.node = node
    this.target = useTargetStore() as Store<"target", ReturnType<typeof useTargetStore>>

    this.dom.addEventListener("mouseover", this.mouseover.bind(this))
  }

  setSelection() {
    const hasSelection = 
      this.view.state.selection.from < this.view.state.selection.to

    if (hasSelection) {
      this.target.blind()
    } else {
      this.target.unblind()
    }
  }

  private mouseover() {
    if (this.target.isBlinded) return
    const pos = this.view.posAtDOM(this.dom, 0)
    this.popover(pos)
    this.dispatchPos(pos)
  }

  private dispatchPos(pos: number) {
    this.target.set({
      node: this.node,
      from: pos - 1,
      to: this.view.state.tr.doc.resolve(pos).end(),
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
    this.dom.removeEventListener("mouseover", this.mouseover, {capture: true})
  }
}
