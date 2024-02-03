import { Extension } from '@tiptap/core'

import { HoverMenuPlugin, type HoverMenuPluginProps } from './hover-plugin'

export type HoverMenuOptions = Omit<HoverMenuPluginProps, 'editor' | 'element'> & {
  element: string
}

export const HoverMenu = Extension.create<HoverMenuOptions>({
  name: 'hoverMenu',

  addOptions() {
    return {
      element: '',
      tippyOptions: {},
      pluginKey: 'hoverMenu',
    }
  },

  addProseMirrorPlugins() {
    return [
      HoverMenuPlugin({
        pluginKey: this.options.pluginKey,
        editor: this.editor,
        element: this.options.element,
        tippyOptions: this.options.tippyOptions,
      }),
    ]
  },
})
