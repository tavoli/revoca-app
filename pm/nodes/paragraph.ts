import {EditorView, type NodeView} from "prosemirror-view"
import {Node} from "prosemirror-model"

export default class ParagraphView implements NodeView {
  dom: InstanceType<typeof window.Node>
  contentDOM: HTMLElement
  view: EditorView
  node: Node

  constructor(
    node: Node,
    view: EditorView,
  ) {
    this.dom = this.contentDOM = document.createElement("p")
    this.view = view
    this.node = node

    this.contentDOM.classList.add("py-4")
    this.contentDOM.id = node.attrs.id

    this.dom.addEventListener("mouseover", this.mouseover.bind(this))
  }

  private mouseover() {
    const pos = this.view.posAtDOM(this.dom, 0)
    this.popover(pos)
    this.dispatchPos(pos)
  }

  private dispatchPos(pos: number) {
    console.log(this.node.attrs.id)
    this.view.dispatch(
      this.view.state.tr.setMeta('DISPATCH', {
        type: 'NODE_TARGET',
        payload: {
          from: pos - 1,
          to: this.view.state.tr.doc.resolve(pos).end(),
          id: +this.node.attrs.id,
        }
      })
    )
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
