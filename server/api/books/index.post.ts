import { z } from 'zod'

import {insertBook, insertBookPin} from '~/server/repositories/book/book.repository'
import {insertSentences} from '~/server/repositories/sentence/sentences.repository'

const bookBodySchema = z.object({
  title: z.string(),
  imageSrc: z.string(),
  sentences: z.array(z.string()),
  slug: z.string(),
})

/**
 * @openapi
 *
 * /books:
 *   post:
 *     security:
 *       - HeaderAuth: []
 *
 *     summary: Create a new book
 *     description: Create a new book
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               imageSrc:
 *                 type: string
 *               sentences:
 *                 type: array
 *                 items:
 *                   type: string
 *               slug:
 *                 type: string
 *           example:
 *             title: "Sample Title"
 *             imageSrc: "https://example.com/image.jpg"
 *             sentences: ["Sentence 1", "Sentence 2"]
 *             slug: "sample-title"
 *     
 *     responses:
 *       '200':
 *         description: The book was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ok'
 *
 *       '400':
 *         description: The request was malformed
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
 *       '500':
 *         description: An internal server error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerError'
 */
export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, body => bookBodySchema.safeParse(body))

  if (!result.success) {
    throw createError({
      message: 'Error creating book',
      data: result.error.issues,
      statusCode: 500,
    })
  }

  const user = event.context.user

  if (!user) {
    throw createError({
      message: 'Unauthorized',
      statusCode: 401,
    })
  }

  const body = result.data

  await db.transaction().execute(async (trx) => {
    try {
      const book_id = await insertBook(trx, {
        title: body.title,
        slug: body.slug,
        image_url: body.imageSrc,
        user_id: user.id,
      })

      if (!book_id) {
        throw createError({
          message: 'Error creating book',
          statusCode: 500,
        })
      }

      const sentences = body.sentences.map((sentence: string) => ({
        book_id,
        sentence,
      }))

      await insertSentences(trx, sentences)

      await kv.zadd(
        'titles',
        { member: body.title, score: book_id },
      );

    } catch (error) {
      console.error(error)
      throw createError({
        message: 'Error creating book',
        statusCode: 500,
      })
    }
  })

  return { ok: true }
})
