import { type HTMLContent } from "@tiptap/core"

export default function normalize(data: any): HTMLContent {
  const normalized = data.map((item: any) => {
    const { id, sentence } = item
    return `<p>{{${id}}}${sentence}</p>`
  })
  return normalized.join``
}
