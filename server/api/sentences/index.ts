import {z} from 'zod'

import { getAllSentences } from '~/server/repositories/sentence/sentences.repository'

const querySchema = z.object({
  s: z.string(),
})

/**
 * @openapi
 *
 * /sentences:
 *   get:
 *     security:
 *       - HeaderAuth: []
 *
 *     summary: Get all sentences
 *     description: Get all sentences for a given slug
 *
 *     parameters:
 *       - in: query
 *         name: s
 *         required: true
 *         description: The slug of the book
 *         schema:
 *           type: string
 *           example: "slug"
 *           format: string
 *           minLength: 1
 *           maxLength: 255
 *           pattern: "^[a-zA-Z0-9-]*$"
 *           title: Slug
 *           description: The slug of the book
 *           default: "slug"
 *
 *     responses:
 *       '200':
 *         description: The sentences were retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sentences'
 *
 *       '400':
 *         description: The request body was invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationIssues'
 *
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Unauthorized'
 *
 *       '500':
 *         description: An internal server error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerError'
 */


export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (query) => querySchema.safeParse(query))

  if (!query.success) {
    throw createError({
      status: 400,
      data: query.error.issues,
    })
  }

  const user = event.context.user
  if (!user) {
    throw createError({
      message: 'Unauthorized',
      statusCode: 401,
    })
  }

  const slug = query.data.s

  const sentences = await getAllSentences(db, slug, user.id)

  if (sentences.length === 0) {
    throw createError({
      status: 404,
      data: {
        message: 'Sentences not found',
      },
    })
  }

  return sentences.map((sentence: any) => ({
    id: sentence.ai_id ?? sentence.id,
    parent: sentence.ai_id ? sentence.id : null,
    sentence: sentence.sentence,
    type: sentence.ai_id ? 'quote' : 'paragraph',
  }))
})
