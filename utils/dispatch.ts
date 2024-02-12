export interface DispatchEvent {
  type: string
  payload?: any
  transaction: any
}

export function dispatch(event: DispatchEvent) {
  const targetStore = useTargetStore()
  const definitionStore = useDefinitionStore()

  switch (event.type) {
    case 'PIN':
      viewUtils.postSelection()
      break
    case 'SELECTION':
      targetStore.$patch({ id: event.payload.id })

      definitionStore.onSelection(
        event.payload.selection
      )
      break
    case 'INFUSE_TEXT':
      viewUtils.infuse(targetStore.from, targetStore.to)
      break
    case 'SIMPLIFY_TEXT':
      viewUtils.simplify(targetStore.from, targetStore.to)
      break
    default:
      window.view.updateState(
        window.view.state.apply(event.transaction)
      )
      break
  }
}
