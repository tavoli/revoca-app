import { type HTMLContent } from "@tiptap/core"
import type {PinDefinition, Sentence} from "./types"

export default function normalize(
  data: Sentence[],
  pins?: PinDefinition[],
): HTMLContent {
  const normalized = data.map((item) => {
    const { id, sentence } = item
    if (!pins?.length) {
      return `<p id="${id}">${sentence}</p>`
    }
    return `<p id="${id}">${buildSentence(sentence, pins)}</p>`
  })
  return normalized.join('')
}

export const buildSentence = (
  sentence: Sentence["sentence"],
  pins: PinDefinition[] = [],
) => {
  const pinSet = new Set(pins.map((pin) => pin.pin))
  const words = sentence.split(' ')
  const normalized = words.map((word) => {
    if (pinSet.has(word)) {
      return `<strong>${word}</strong>`
    }
    return word
  })
  return normalized.join(' ')
}
