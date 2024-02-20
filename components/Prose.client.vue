<script setup lang="tsx">
import Quill from 'quill';
import '~/quill/blots/paragraph';
import '~/quill/blots/quote';
import '~/quill/blots/generated';
import '~/quill/blots/divider';
import type {Delta} from 'quill/core';

declare global {
  interface Window {
    quill: Quill;
  }
}

const options = {
  readOnly: true,
}

window.quill = new Quill('#content', options);

let pins = new RegExp('a^')
let pinned = new RegExp('a^')

function regex(pins: string[]) {
  return new RegExp('\\b(' + pins.join('|') + ')\\b', 'ig')
}

function scan(delta: Delta) {
  const results: {index: number, to: number, pinned: boolean}[] = []

  function record(index: number, to: number, pinned = false) {
    results.push({index, to, pinned})
  }

  let retain = 0

  for (const op of delta.ops) {
    if (op.retain) {
      retain = op.retain as number
    }

    if (typeof op.insert === 'string') {
      const text = op.insert

      let m

      while ((m = pins.exec(text))) {
        console.log(pins, m)
        const index = m.index
        const length = m[0].length

        record(index + retain, length)
      }

      while ((m = pinned.exec(text))) {
        const index = m.index
        const length = m[0].length

        record(index + retain, length)
      }
    }
  }

  return results
}

const slug = useSlug()
const DATA_KEY = factoryDataKeys(slug)

pinned = regex(useNuxtData(DATA_KEY.PINNED).data.value)
pins = regex(useNuxtData(DATA_KEY.PINS).data.value.map((pin: PinDefinition) => pin.pin))

function highlight(delta: Delta) {
  const results = scan(delta)

  for (const result of results) {
    const range = {index: result.index, length: result.to}

    if (result.pinned) {
      window.quill.formatText(range, 'underline', 'green', 'silent')
    } else {
      window.quill.formatText(range, 'underline', 'silent')
    }
  }
}

window.quill.on('text-change', highlight)
</script>

<template>
  <LeftMenu />
  <FloatPopup />
</template>
