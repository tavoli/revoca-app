import {Plugin, PluginKey} from "prosemirror-state";

const key = new PluginKey("isLoading") as any

export default new Plugin({
  key,
  state: {
    init() {
      return {
        isLoading: false,
        from: 0,
      }
    },
    apply(tr, _value) {
      if (tr.getMeta("LOADING")) {
        const {from} = tr.getMeta("LOADING")

        return {
          isLoading: true,
          from,
        }
      }

      return {
        isLoading: false,
        from: 0,
      }
    },
  },
  view: () => {
    return {
      update: (view) => {
        const loadingState = view.state.plugins.find((plugin: any) => plugin.key === key.key)
        const state = loadingState?.getState(view.state)

        const element = view.domAtPos(state.from + 1).node as HTMLElement

        if (state?.isLoading && element) {
          element?.classList.add("bg-gray-200", "animate-pulse")
        }
      }
    }
  }
})

