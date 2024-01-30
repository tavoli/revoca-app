import { type HTMLContent } from "@tiptap/core"
import type {Pin, Sentence} from "./types"

export default function normalize(
  data: Sentence[],
  pins?: Pin[],
): HTMLContent {
  const normalized = data.map((item) => {
    const { id, sentence } = item
    return `<p id="${id}">${buildSentence(sentence, pins)}</p>`
  })
  return normalized.join('')
}

const buildSentence = (
  sentence: Sentence["sentence"],
  pins: Pin[] = [],
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
