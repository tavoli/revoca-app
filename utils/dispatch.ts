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
      definitionStore.onSelection(
        event.payload.selection
      )
      break
    case 'AI_INFUSE_TEXT':
      viewUtils.infuse(targetStore.from, targetStore.to)
      break
    case 'AI_SIMPLIFY_TEXT':
      viewUtils.simplify(targetStore.from, targetStore.to)
      break
    case 'AI_SPLIT_TEXT':
      viewUtils.split(targetStore.from, targetStore.to)
      break
    default:
      window.view.updateState(
        window.view.state.apply(event.transaction)
      )
      break
  }
}
