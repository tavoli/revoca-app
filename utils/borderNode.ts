/**
 * Add border to the node
 *
 * @param {number} index - index of the node
 **/
export function borderNode(index: number, classList: string[]) {
  const node = window.quill.getLeaf(index)

  const parent = node[0]?.parent?.domNode
  if (parent?.tagName === 'P') {
    const classes = parent.classList
    parent.classList.remove(...classes)
    parent.classList.add(...classList)
  }
}
