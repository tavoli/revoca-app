import markSchema from '~/pm/schemas/markSchema'
import {fetchAIStream} from './api'
import {useTargetStore} from '~/stores/target'
import {nanoid} from "nanoid";

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
    const nodeQuote = window.view.state.doc.nodeAt(from - 1)
    const isQuote = nodeQuote?.type.name === 'blockquote';

    target.blind();

    const [sentence, id] = await newLineChunks({
      type,
      from,
      to,
      isQuote,
      target,
    });

    const aiSentence = {
      parent: Number(target.parent || target.id),
      sentence,
      id,
    };

    postAiSentence(aiSentence);
    insertQuoteAt(aiSentence, sentencesCache);

    target.unblind();
  } catch (error) {
    console.error('Error processing view:', error);
  }
}

const insertQuoteAt = (newSentence: any, sentences: any) => {
  const index = sentences.data.value.findIndex((s: any) => s.id === newSentence.parent);

  if (index === -1) return false;

  if (sentences.data.value[index]) {
    sentences.data.value.splice(index, 0, {
      type: 'quote',
      ...newSentence,
    });
  }

  return true;
}

interface InsertSentenceOptions {
  type: string
  from: number
  to: number
  isQuote: boolean
  target: any
}

async function newLineChunks({
  type,
  from,
  to,
  isQuote,
  target
}: InsertSentenceOptions) {
  const id = nanoid(7);
  const newLine = markSchema.node('blockquote', null, [
    markSchema.node('paragraph', {
      id, parent: target.parent || target.id
    },[
      markSchema.text('\n')
    ]),
  ]);

  window.view.dispatch(
    window.view.state.tr.insert(isQuote ? from - 1 : from, newLine)
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

  return [fullSentence, id];
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


