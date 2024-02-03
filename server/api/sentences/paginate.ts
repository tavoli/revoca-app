import {
  GoogleGenerativeAI,
} from '@google/generative-ai';
import { z } from 'zod'
import chalk from 'chalk';

import { paginateSentences } from '~/server/repositories/sentence/sentences.repository'

const numberRegex = /^\d+$/
const paginateQuerySchema = z.object({
  l: z.string().regex(numberRegex).optional().default('10'),
  n: z.string().regex(numberRegex).optional(),
  s: z.string(),
})

interface ApiSentenceType {
  id: number
  original?: string
  sentence: string
  book_id: number
}

/**
 * @openapi
 *
 * /sentences/paginate:
 *   get:
 *     security:
 *       - HeaderAuth: []
 *
 *     summary: Paginate sentences
 *     description: Paginate sentences
 *
 *     parameters:
 *       - in: query
 *         name: n
 *         schema:
 *           type: string
 *         description: The next cursor
 *       - in: query
 *         name: s
 *         schema:
 *           type: string
 *         required: true
 *         description: The slug of the book
 *       - in: query
 *         name: l
 *         schema:
 *           type: string
 *         description: The limit
 *         default: 10
 *         example: 10
 *
 *     responses:
 *       '200':
 *         description: The sentences were successfully paginated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sentences'
 *
 *       '400':
 *         description: The request was malformed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationIssues'
 *         
 *       '404':
 *         description: The sentences were not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFound'
 *
 * components:
 *   schemas:
 *     Sentences:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/Sentence'
 *     Sentence:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The id of the sentence
 *           example: 1
 *         sentence:
 *           type: string
 *           description: The sentence
 *           example: "Sample sentence"
 *         book_id:
 *           type: integer
 *           description: The id of the book
 *           example: 1
 */

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (query) => paginateQuerySchema.safeParse(query))

  if (!query.success) {
    throw createError({
      message: 'Invalid query',
      data: query.error.issues,
      statusCode: 400,
    })
  }

  const slug = query.data.s

  const user = event.context.user
  if (!user) {
    throw createError({
      message: 'Unauthorized',
      statusCode: 401,
    })
  }

  const cacheCursorK = `${user.username}:${slug}`

  const nextCursor = query.data.n === undefined
   ? await kv.hget<number>(cacheCursorK, 'next_cursor') ?? undefined
   : +query.data.n

  const limit = +query.data.l
  const sentences = await paginateSentences(db, slug, limit, nextCursor) as ApiSentenceType[]

  if (sentences.length === 0 && nextCursor === undefined) {
    throw createError({
      message: 'Sentences not found',
      statusCode: 404,
    })
  } else if (sentences.length === 0 && Number(nextCursor) >= 0) {
    setHeader(event, 'X-Reached-End', 'true')
    throw createError({
      message: 'no more sentences or invalid cursor',
      statusCode: 404,
    })
  } else if (sentences.length === 0) {
    throw createError({
      message: 'Sentences not found',
      statusCode: 404,
    })
  }

  const lastSentence = sentences[sentences.length - 1]
  await kv.hset(cacheCursorK, { next_cursor: lastSentence.id })

  appendHeader(event, 'X-Reached-End', 'false')
  appendHeader(event, 'X-Next-Cursor', String(lastSentence.id))
  appendHeader(event, 'X-Book-Id', String(lastSentence.book_id))

  const cachePinsKey = `books:${lastSentence.book_id}:pins`;
  const pins = await kv.zrange(cachePinsKey, 0, 2, { withScores: true }) as any[];

  // Extract pins with scores as an array of objects
  const pinsWithScore = updateScores(pins, (score) => score);

  // Check if every pin has a score of 10 or 0
  const everyPinHasScoreEqualOrLessThan10 = pinsWithScore.every(({ score }) => score <= 10);
  const everyPinHasScoreEqualToZero = pinsWithScore.every(({ score }) => score === 0);

  // Prepare updated scores based on conditions
  let updatedScores;

  if (everyPinHasScoreEqualToZero) {
    updatedScores = updateScores(pins, () => +Date.now());
  } else if (everyPinHasScoreEqualOrLessThan10) {
    updatedScores = updateScores(pins, (eachScore) => eachScore - 1);
  } else {
    updatedScores = updateScores(pins, () => 10);
  }

  // Update scores
  if (pins.length > 0) {
    const [first, ...rest] = updatedScores;
    await kv.zadd(cachePinsKey, first, ...rest);
  }

  // Revoca
  if (pins.length > 0) {
    try {
      await revoca(sentences, pinsWithoutScores(pins));
    } catch (error) {
      console.log(chalk.red(error));
    }
  }

  return sentences.map(({ id, sentence, original }) => ({ id, sentence, original }))
})

async function revoca(data: ApiSentenceType[], pins: string[], index = 0) {
  const minWords = 20;

  if (data[index].sentence.split(" ").length < minWords) {
    return;
  }

  const MODEL_NAME = "gemini-pro";
  const API_KEY = process.env.GEMINI_API_KEY as string;

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.95,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const prompts = [
    "- Keep the author style",
    "- Keep the text length similar to the original.",
    "- Ensure the text is coherent to the original.",
    "- Ensure the meaning and essence of the text remains the same.",
    `- Incorporate in the text with creative touch, seamlessly weaving the words: {${pins.toString()}}.`,
    `\n\n${data[index].sentence}`,
  ];

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompts.join("\n") }] }],
    generationConfig,
  });

  const response = result.response;
  const text = response.text();

  data[index].original = data[index].sentence;
  data[index].sentence = text;

  if (index < data.length - 1) {
    await revoca(data, pins, index + 1);
  }
}

function updateScores(pins: any[], fn: (currentScore: number) => number) {
  return pins.reduce((acc, pin, index) => {
    if (index % 2 === 0) {
      acc.push({ member: pin, score: fn(pins[index + 1]) });
    }
    return acc;
  }, []) as { member: string; score: number }[];
}

function pinsWithoutScores(pins: any[]) {
  return pins.reduce((acc, pin, index) => {
    if (index % 2 === 0) {
      acc.push(pin);
    }
    return acc;
  }, []) as string[];
}
