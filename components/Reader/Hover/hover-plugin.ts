import { Editor, posToDOMRect } from '@tiptap/core'
import { NodeSelection, Plugin, PluginKey, Selection, TextSelection } from '@tiptap/pm/state'
import { EditorView } from '@tiptap/pm/view'
import tippy, { type Instance, type Props } from 'tippy.js'

export interface HoverMenuPluginProps {
  pluginKey: PluginKey | string
  editor: Editor
  element: string
  tippyOptions?: Partial<Props>
}

export type HoverMenuViewProps = HoverMenuPluginProps & {
  view: EditorView
}

export class HoverMenuView {
  public editor: Editor

  public element: string

  public $element: HTMLElement | undefined

  public view: EditorView

  public tippy: Instance | undefined

  public tippyOptions?: Partial<Props>

  constructor({
    editor, element, view, tippyOptions = {},
  }: HoverMenuViewProps) {
    this.editor = editor
    this.element = element
    this.view = view
    this.tippyOptions = tippyOptions
  }

  mouseoverHandler = (event: MouseEvent) => {
    if (!(event.target instanceof HTMLParagraphElement)) {
      return
    }

    const pos = this.view.posAtDOM(event.target as HTMLElement, 0)

    this.tippy?.setProps({
      getReferenceClientRect: () => posToDOMRect(this.view, pos, pos),
    })

    this.tippy?.show()

    const selection = new TextSelection(this.view.state.doc.resolve(pos))

    this.view.dispatch(
      this.view.state.tr.setSelection(selection)
    )

    this.view.state.tr.scrollIntoView()
  }

  createTooltip() {
    const editorElement = this.$element as HTMLElement

    if (this.tippy) {
      return
    }

    const template = this.view.dom.querySelector('#popover') as HTMLElement

    this.tippy = tippy(editorElement, {
      duration: 0,
      getReferenceClientRect: null,
      interactiveDebounce: 0,
      interactiveBorder: 0,
      trigger: 'manual',
      content: template,
      interactive: true,
      showOnCreate: true,
      placement: 'right',
      ...this.tippyOptions,
    })
  }

  update() {
    const editorElement = this.view.dom.querySelector(this.element)
    const nodes = this.view.dom.querySelectorAll('p')

    if (!editorElement || !nodes.length) {
      return
    }

    nodes.forEach(node => {
      node.addEventListener('mouseover', this.mouseoverHandler, {capture: true})
    })

    this.$element = editorElement as HTMLElement

    this.createTooltip()

    this.tippy?.setProps({
      getReferenceClientRect: () => posToDOMRect(
        this.view,
        this.view.state.selection.from,
        this.view.state.selection.to
      ),
    })

    return true
  }

  show() {
    this.tippy?.show()
  }

  hide() {
    this.tippy?.hide()
  }

  destroy() {
    this.tippy?.destroy()

    const nodes = this.view.dom.querySelectorAll('p')
    nodes.forEach(node => {
      node.removeEventListener('mouseover', this.mouseoverHandler, {capture: true})
    })
  }
}

export const HoverMenuPlugin = (options: HoverMenuPluginProps) => {
  return new Plugin({
    key:
      typeof options.pluginKey === 'string' ? new PluginKey(options.pluginKey) : options.pluginKey,
    view: view => new HoverMenuView({ view, ...options }),
  })
}
