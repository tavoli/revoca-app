import markSchema from '~/pm/schemas/markSchema'
import {fetchAIStream} from './api'
import {useTargetStore} from '~/stores/target'

const VIEW_TYPES = {
  SIMPLIFY: 'simplify',
  INFUSE: 'infuse',
};

export const viewUtils = {
  async infuse(from: number, to: number) {
    await processView(VIEW_TYPES.INFUSE, from, to);
  },

  async simplify(from: number, to: number) {
    await processView(VIEW_TYPES.SIMPLIFY, from, to);
  },

  async postSelection() {
    const slug = useSlug();
    const DATA_KEY = factoryDataKeys(slug);
    const pinsCache = useNuxtData(DATA_KEY.PINS);
    const targetStore = useTargetStore();
    const definitionStore = useDefinitionStore();

    const selection = window.view.state.selection;
    const pin = window.view.state.doc.textBetween(
      selection.from, selection.to, ' '
    )

    const body = {
      id: targetStore.id,
      pin,
      slug,
    };

    postPin(body, () => {
      pinsCache.data.value = [
        ...pinsCache.data.value,
        definitionStore.definition
      ]
    });
  }
}

async function processView(type: string, from: number, to: number) {
  try {
    const slug = useSlug();
    const DATA_KEY = factoryDataKeys(slug);
    const sentencesCache = useNuxtData(DATA_KEY.SENTENCES);

    const target = useTargetStore();
    const isQuote = window.view.state.doc.nodeAt(from - 1)?.type.name === 'blockquote';

    await insertSentence({
      type,
      from,
      to,
      target,
      sentences: sentencesCache,
      isQuote,
    });
  } catch (error) {
    console.error('Error processing view:', error);
  }
}

interface InsertSentenceOptions {
  type: string
  from: number
  to: number
  target: any
  sentences: any
  isQuote: boolean
}

async function insertSentence({
  type,
  from,
  to,
  target,
  sentences,
  isQuote
}: InsertSentenceOptions) {
  const newLine = markSchema.node('blockquote', null, [
    markSchema.node('paragraph', null, [
      markSchema.text(isQuote ? ' ' : '\n')
    ]),
  ]);

  window.view.dispatch(
    window.view.state.tr.insert(from, newLine)
  );

  const sentence = window.view.state.doc.textBetween(from, to);
  const fullSentence = await fetchAIStream({
    fn: type,
    slug: useSlug(),
    sentence,
    dispatch: (chunk, chunkOpt) => {
      window.view.dispatch(
        window.view.state.tr.insert(
          chunkOpt.from + (isQuote ? 0 : 1), createNodes(chunk)
        )
      );
    },
    initialOpt: {from: from + 1, to}
  });

  const index = sentences.data.value.findIndex((s: any) => s.id === target.id);
  const newId = target.id * 2;

  sentences.data.value.splice(index, 0, {
    type: 'quote',
    id: newId,
    sentence: fullSentence,
  });
}

function createNodes(chunk: string) {
  const slug = useSlug()
  const DATA_KEY = factoryDataKeys(slug)
  const pinsCache = useNuxtData(DATA_KEY.PINS)
  const pinSet = new Set((pinsCache.data.value).map((pin: PinDefinition) => pin.pin))

  const w = (word: string) => word.replace(/[^a-zA-Z]/g, "");

  const createMarkedNode = (word: string) => {
    const trimmedWord = word.trim();
    if (trimmedWord.length > 0 && pinSet.has(w(trimmedWord))) {
      return markSchema.text(`${trimmedWord} `).mark([
        window.view.state.schema.marks.strong.create()
      ]);
    }

    return markSchema.text(`${trimmedWord} `);
  };

  return chunk.split(/\s+/).map(createMarkedNode);
}


