<script setup lang="tsx">
import {EditorState} from "prosemirror-state";
import {EditorView} from "prosemirror-view";
import {DOMParser} from "prosemirror-model";

import markSchema from '../pm/schemas/markSchema'
import ParagraphView from '../pm/nodes/paragraph'
import floatPopup from "~/pm/plugins/floatPopup";
import Controller from "~/utils/controller";

declare global {
  interface Window {
    view: EditorView
  }
}

interface DispatchEvent {
  type: string
  payload?: any
  transaction: any
}

interface NodeTarget {
  node: Node
  from: number
  to: number
  id: number
}

const element = ref<HTMLElement>()
const nodeTarget = useState<NodeTarget>('nodeTarget')
const definitions = useState<PinDefinition[]>('definitions', () => [])
const currentDefinition = useState<PinDefinition>('currentDefinition')
const slug = useSlug()
const cache = useNuxtData(slug)

const parser = DOMParser.fromSchema(markSchema)
const content = document.querySelector('#content') as HTMLElement
const doc = parser.parse(content)

const state = EditorState.create({
  schema: markSchema,
  plugins: [floatPopup],
  doc
})

const editor = document.createElement('div')

const view = new EditorView(editor, {
  state: state,

  editable: () => false,

  nodeViews: {
    paragraph(node, view) {
      return new ParagraphView(node, view)
    }
  },

  dispatchTransaction(transaction) {
    const meta = transaction.getMeta('DISPATCH') as DispatchEvent

    const event = {
      type: meta?.type ?? 'TRANSACTION',
      payload: meta?.payload,
      transaction
    }

    update(event)
  }
})

window.view = view

watch(() => element.value, () => {
  console.log('Prose.client.vue updated')

  if (element.value) {
    element.value.appendChild(editor.children[0])

    if (!import.meta.env.DEV) {
      content.remove()
      editor.remove()
    }
  }
})

function update(event: DispatchEvent) {
  switch (event.type) {
    case 'PIN':
      const stateSelection = window.view.state.selection
      const pin = window.view.state.doc.textBetween(
        stateSelection.from, stateSelection.to, ' '
      )

      const body = {
        id: nodeTarget.value.id,
        slug,
        pin,
      }

      useFetch(`/api/pins`, {
        headers: {
          'Authorization': `${localStorage.getItem('token')}`,
        },
        method: 'POST',
        body,
        onRequest: () => {
          cache.data.value = {
            ...cache.data.value,
            pins: [
              ...cache.data.value.pins,
              currentDefinition.value,
            ],
          }
        },
      })
      break
    case 'SELECTION':
      nodeTarget.value.id = event.payload.id
      const selection = event.payload.selection

      // TODO: optmistic update directly on useNuxtData to avoid seek for definition at twice (server and local)

      // try from server first
      let definitionFromCache = cache.data.value.pins?.find((pin: any) => pin.pin === selection)

      // try from local cache
      if (!definitionFromCache) {
        definitionFromCache = definitions.value.find((pin: any) => pin.pin === selection) 
      }

      currentDefinition.value = definitionFromCache as PinDefinition

      // if not found, fetch from server
      if (!definitionFromCache) {
        getDefinition({
          pin: selection,
          dispatch: (definition: any) => {
            definitions.value = [...definitions.value, definition]
            currentDefinition.value = definition
          }
        })
      }
      break
    case 'NODE_TARGET':
      nodeTarget.value = event.payload
      break
    case 'INFUSE_TEXT':
      const from = nodeTarget.value?.from
      const to = nodeTarget.value?.to

      if (from && to) {
        const newLine = markSchema.node('blockquote', null, [
          markSchema.node('paragraph', null, [
            markSchema.text('\n')
          ]),
        ])

        view.dispatch(
          view.state.tr.insert(from, newLine)
        )

        aiInfuseStream({
          text: view.state.doc.textBetween(from, to),

          dispatch: (chunk, chunkOpt) => {
            view.dispatch(
              view.state.tr.insert(chunkOpt.from + 2, createNodes(chunk))
            )
          },

          initialOpt: {
            from: from + 1,
            to
          }
        })
      }
      break
    case 'SIMPLIFY_TEXT':
      break
    default:
      view.updateState(
        view.state.apply(event.transaction)
      )
      break
  }
}

interface StreamOptions {
  text: string
  dispatch: (
    chunk: string,
    chunkOpt: {
      from: number, to: number
    }
  ) => void
  initialOpt: {
    from: number
    to: number
  }
}

async function aiInfuseStream({ text, dispatch, initialOpt }: StreamOptions) {
  const response = await fetch("/api/ai/infuse", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      bookId: 6,
      sentence: text
    })
  })

  const streamResponse = response.body

  if (!streamResponse) {
    return
  }

  const reader = streamResponse.getReader()

  const decoder = new TextDecoder();

  let from = initialOpt.from
  let to = initialOpt.to

  while (true) {
    const { done, value } = await reader.read()

    if (done) {
      break
    }

    const chunkValue = decoder.decode(value);

    to = from + chunkValue.length

    dispatch(chunkValue, { from, to })

    from = to
  }
}

async function getDefinition({ pin, dispatch }: any) {
  const def = await Controller.getDefinition(pin)
  dispatch(def)
}

function createNodes(chunk: string) {
  const pinSet = new Set((cache.data.value.pins as PinDefinition[]).map((pin: PinDefinition) => pin.pin))

  const w = (word: string) => word.replace(/[^a-zA-Z]/g, "");

  const createMarkedNode = (word: string) => {
    const trimmedWord = word.trim();
    if (trimmedWord.length > 0 && pinSet.has(w(trimmedWord))) {
      return markSchema.text(`${trimmedWord} `).mark([
        view.state.schema.marks.strong.create()
      ]);
    }

    return markSchema.text(`${trimmedWord} `);
  };

  return chunk.split(/\s+/).map(createMarkedNode);
}
</script>

<template>
  <LeftMenu />
  <FloatPopup />
  <div id="prose" ref="element" class="font-bookerly prose prose-md prose-slate prose-dark text-slate-300" />
</template>
