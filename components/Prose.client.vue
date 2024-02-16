<script setup lang="tsx">
import {EditorState} from "prosemirror-state";
import {EditorView} from "prosemirror-view";
import {DOMParser} from "prosemirror-model";

import markSchema from '~/pm/schemas/markSchema'
import ParagraphView from '~/pm/nodes/paragraph'
import PreView from '~/pm/nodes/pre'
import floatPopup from "~/pm/plugins/floatPopup";
import type {DispatchEvent} from "~/utils/dispatch";
import pinOnMount from "~/pm/plugins/pinOnMount";
import leftPopup from "~/pm/plugins/leftPopup";

declare global {
  interface Window {
    view: EditorView
  }
}

const element = ref<HTMLElement>()

const parser = DOMParser.fromSchema(markSchema)
const content = document.querySelector('#content') as HTMLElement
const doc = parser.parse(content)

const state = EditorState.create({
  schema: markSchema,
  plugins: [
    leftPopup,
    floatPopup,
    pinOnMount,
  ],
  doc,
})

const editor = document.createElement('div')

const view = new EditorView(editor, {
  state,

  editable: () => false,

  nodeViews: {
    paragraph(node, view) {
      return new ParagraphView(node, view)
    },
    pre(node, view) {
      return new PreView(node, view)
    },
  },

  dispatchTransaction(transaction) {
    const meta = transaction.getMeta('DISPATCH') as DispatchEvent

    const event = {
      type: meta?.type ?? 'TRANSACTION',
      payload: meta?.payload,
      transaction
    }

    dispatch(event)
  }
})

window.view = view

watch(() => element.value, () => {
  if (element.value) {
    element.value.appendChild(editor.children[0])

    if (!import.meta.env.DEV) {
      content.remove()
      editor.remove()
    }
  }
})

const slug = useSlug()
const DATA_KEY = factoryDataKeys(slug)

const pinned = useNuxtData(DATA_KEY.PINNED)
const pins = useNuxtData(DATA_KEY.PINS)

watch(() => pinned.data.value, (value) => {
  view.dispatch(
    view.state.tr.setMeta('SET_STATE', {
      pinned: value
    })
  )
}, {
  immediate: true
})

watch(() => pins.data.value, (value) => {
  view.dispatch(
    view.state.tr.setMeta('SET_STATE', {
      pins: value.map(({pin}: PinDefinition) => pin)
    })
  )
}, {
  immediate: true
})
</script>

<template>
  <LeftMenu />
  <FloatPopup />
  <div id="prose" ref="element" class="font-bookerly prose prose-lg prose-slate prose-dark text-slate-300" />
</template>
