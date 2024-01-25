import { z } from 'zod'

import { getAllInitialSentences } from '~/server/repositories/sentence/sentences.repository'

const numberRegex = /^\d+$/
const paginateQuerySchema = z.object({
  l: z.string().regex(numberRegex).optional().default('10'),
  s: z.string(),
})

/**
 * @openapi
 *
 * /sentences/initial:
 *   get:
 *     security:
 *       - HeaderAuth: []
 *
 *     summary: Initial sentences
 *     description: Load initial sentences
 *
 *     parameters:
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
 *         description: The limit of sentences
 *         default: 30
 *         example: 30
 *
 *     responses:
 *       '200':
 *         description: The sentences were successfully loaded
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

  const nextCursor = await kv.hget<number>(cacheCursorK, 'next_cursor')

  const limit = +query.data.l

  const sentences = await getAllInitialSentences(db, slug, limit, nextCursor)

  if (sentences.length === 0) {
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

  return sentences.map(({id, sentence}) => ({id, sentence}))
})
