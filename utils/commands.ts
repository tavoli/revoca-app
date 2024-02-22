const slug = useSlug()

export const processTextCommand = async (command: string, nodeClassList: string[]) => {
  if (command === 'split') {
    return processSplit(nodeClassList)
  }

  const options = {fn: command, slug}
  const selection = window.quill.getSelection() 

  if (selection) {
    let index = selection?.index
    const text = window.quill.getText(selection.index, selection.length)

    insertBlankLine(selection.index - 1)
    borderNode(index, nodeClassList)

    let chunks = ''

    for await (const chunkText of ai({ ...options, text })) {
      for (const sentence of chunkText.split('\n')) {
        if (sentence) {
          window.quill.insertText(index, sentence, 'api')

          chunks += sentence
          index += sentence.length
        } else {
          insertBlankLine(index)
          index += 1
        }
      }
    }

    highlightInserted(selection.index, chunks.length + 1)
  }
}

const processSplit = async (nodeClassList: string[]) => {
  const selection = window.quill.getSelection()

  if (selection) {
    let index = selection?.index
    const text = window.quill.getText(selection.index, selection.length)

    insertBlankLine(selection.index)
    const sentences = splitText(text) 

    for (const sentence of sentences) {
      borderNode(index, nodeClassList)
      
      const text = await sentence

      window.quill.insertText(index, text, 'api')
      index += text.length

      if (sentence !== sentences[sentences.length - 1]) {
        insertBlankLine(index)
        index += 1
      }
    }

    highlightInserted(selection.index, text.length + 1)
  }
}

const highlightInserted = (index: number, length: number) => {
  const DATA_KEY = factoryDataKeys(slug)

  const pinned = useNuxtData(DATA_KEY.PINNED).data.value
  const pins = useNuxtData(DATA_KEY.PINS).data.value.map((pin: PinDefinition) => pin.pin)

  const inserted = window.quill.getContents(index, length)

  highlight(inserted, index, pins, pinned)
}

const insertBlankLine = (index: number) => {
  window.quill.insertText(index, '\n', 'api')
}
