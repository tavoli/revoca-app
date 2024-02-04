import {EditorState, Plugin, PluginKey} from "prosemirror-state";

const key = new PluginKey("insertChunk") as any

const getState = (state: EditorState) => {
  const loadingState = state.plugins.find((plugin: any) => plugin.key === key.key)
  return loadingState?.getState(state)
}

export default new Plugin({
  key,
  state: {
    init() {
      return {
        from: null,
        chunk: ""
      }
    },
    apply(tr, value) {
      if (tr.getMeta("INSERT_CHUNK")) {
        const {from, chunk} = tr.getMeta("INSERT_CHUNK")
        return {
          from,
          chunk: value.chunk + chunk
        }
      }

      return value
    },
  },
  view: () => {
    return {
      update: (view) => {
        const state = getState(view.state)
        const tr = view.state.tr

        if (state) {
          if (state.from && state.chunk) {
            console.log("state.from", state.from)
               view.dispatch(
                 tr.insert(state.from, view.state.schema.text(state.chunk))
               )
          }
        }
      }
    }
  }
})

