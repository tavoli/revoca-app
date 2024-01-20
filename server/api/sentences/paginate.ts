import { z } from 'zod'

const paginateQuerySchema = z.object({
  n: z.string().regex(/^\d+$/).optional().default('0'),
  s: z.string(),
})

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
    setResponseStatus(event, 400)
    return query.error.issues
  }

  const slug = query.data.s

  const user = event.context.user
  if (!user) {
    setResponseStatus(event, 401)
    return { error: 'Unauthorized' }
  }

  const cacheCursorK = `${user.username}:${slug}`

  const nextCursor = query.data.n === undefined
    ? await kv.hget<number>(cacheCursorK, 'next_cursor') ?? undefined
    : +query.data.n

  const sentences = await paginateSentences(slug, nextCursor)

  if (sentences.length === 0 && nextCursor === undefined) {
    setResponseStatus(event, 404)
    return { error: 'SENTENCES_NOT_FOUND' }
  } else if (sentences.length === 0 && Number(nextCursor) >= 0) {
    setHeader(event, 'X-Reached-End', 'true')
    setResponseStatus(event, 404)
    return { error: 'NO_MORE_SENTENCES_OR_INVALID_CURSOR' }
  } else if (sentences.length === 0) {
    setResponseStatus(event, 404)
    return { error: 'SENTENCES_NOT_FOUND' }
  }

  const lastSentence = sentences[sentences.length - 1]
  await kv.hset(cacheCursorK, { next_cursor: lastSentence.id })

  appendHeader(event, 'X-Reached-End', 'false')
  appendHeader(event, 'X-Next-Cursor', String(lastSentence.id))
  appendHeader(event, 'X-Book-Id', String(lastSentence.book_id))

  return sentences.map(({id, sentence}) => ({id, sentence}))
})
