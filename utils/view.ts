import {Node} from "prosemirror-model"
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
    const node = window.view.state.doc.nodeAt(from);
    const nodeQuote = window.view.state.doc.nodeAt(from - 1)
    const isQuote = nodeQuote?.type.name === 'blockquote';

    target.blind();

    const sentence = await insertSentence({
      type,
      from,
      to,
      isQuote,
    });

    const index = findSentenceIndex(target, sentencesCache);

    const aiSentence = {
      sentence_id: target.id,
      sentence,
    };

    const generatedId = await postAiSentence(aiSentence);
    const quote = { id: generatedId, sentence, parentId: target.id };

    target.unblind();

    insertQuoteAt(index, quote, sentencesCache);
    console.log('nodeQuote:', nodeQuote);
    setNodeId(nodeQuote ?? node, generatedId);
  } catch (error) {
    console.error('Error processing view:', error);
  }
}

const setNodeId = (node: Node | null, id: number) => {
  let quote: Node | null = null;
  if (node) {
    window.view.state.doc.content.forEach((n, pos) => {
      if (n === node) {
        quote = window.view.state.doc.resolve(pos).nodeBefore;
      }
    })
  }

  console.log('quote:', quote);

  if (quote) {
    window.view.state.doc.content.forEach((n, pos) => {
      if (n === quote) {
        window.view.dispatch(
          window.view.state.tr.setNodeMarkup(
            pos + 1, null, {id}
          )
        );
      }
    })
  }
}

const insertQuoteAt = (index: number, newSentence: any, sentences: any) => {
  if (sentences.data.value[index]) {
    sentences.data.value.splice(index, 0, {
      type: 'quote',
      ...newSentence,
    });
  } else {
    throw new Error('Could not insert quote');
  }
}

const findSentenceIndex = (target: any, sentences: any) => {
  const index = sentences.data.value.findIndex((s: any) => s.id === target.id);

  if (index === -1) {
    throw new Error('Could not find sentence');
  }

  return index;
}

interface InsertSentenceOptions {
  type: string
  from: number
  to: number
  isQuote: boolean
}

async function insertSentence({
  type,
  from,
  to,
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

  return fullSentence;
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


