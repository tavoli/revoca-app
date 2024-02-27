import type {Delta} from "quill/core"

function scan(delta: Delta, retain: number, pins: RegExp, pinned: RegExp) {
  const results: {index: number, to: number, pinned: boolean}[] = []

  function record(index: number, to: number, pinned = false) {
    results.push({index, to, pinned})
  }

  for (const op of delta.ops) {
    if (typeof op.insert === 'string') {
      const text = op.insert

      let m

      while ((m = pins.exec(text))) {
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

export function highlight(delta: Delta, retain: number, pins: string[], pinned: string[]) {
  function regex(pins: string[]) {
    return new RegExp('\\b(' + pins.join('|') + ')\\b', 'ig')
  }

  const results = scan(
    delta,
    retain,
    regex(pins),
    regex(pinned)
  )

  for (const result of results) {
    const range = {index: result.index, length: result.to}
    if (result.pinned) {
      window.quill.formatText(range, 'underline', 'api')
    } else {
      window.quill.formatText(range, 'underline', 'api')
    }
  }
}

