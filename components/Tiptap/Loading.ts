import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export const Loading = Extension.create({
  name: 'loadingDecoration',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("loadingDecoration"),
        state: {
          init() {},
          apply(tr, _value) {
            if (tr.getMeta("loadingDecoration")) {
              const {fromPos, toPos} = tr.getMeta("loadingDecoration")
              console.log(fromPos, toPos)
              return DecorationSet.create(tr.doc, [
                Decoration.inline(fromPos, toPos, {style: "background-color: #f0f0f0"})
              ])
            }
          }
        },
      }),
    ]
  },
})


