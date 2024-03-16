import {z} from 'zod'

import {paginateBooks} from '~/server/repositories/book/book.repository'

const paginateQuerySchema = z.object({
  n: z.string().optional().default('1'),
})

/**
 * @openapi
 *
 * /books/paginate:
 *   get:
 *     summary: Paginate books
 *     description: Paginate books
 *
 *     parameters:
 *       - in: query
 *         name: n
 *         schema:
 *           type: integer
 *           description: The next cursor
 *           example: 1
 *
 *     responses:
 *       200:
 *         description: The books were successfully paginated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Books'
 *
 *       400:
 *         description: The request was malformed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationIssues'
 *
 *       404:
 *         description: The books were not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFound'
 *
 * components:
 *   schemas:
 *     Books:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/Book'
 *
 *     Book:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The id of the book
 *         title:
 *           type: string
 *           description: The title of the book
 *         slug:
 *           type: string
 *           description: The slug of the book
 *         image_url:
 *           type: string
 *           description: The image url of the book
 */

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (query) => paginateQuerySchema.safeParse(query))

  if (!query.success) {
    throw createError({
      status: 400,
      data: query.error.issues,
    })
  }

  const user = event.context.user

  if (!user) {
    throw createError({
      status: 401,
      data: 'Unauthorized',
    })
  }

  const nextCursor = +query.data.n

  const books = await paginateBooks(db, user.id, nextCursor)

  if (books.length === 0) {
    throw createError({
      status: 404,
      data: 'Not Found',
    })
  }

  const lastBook = books[books.length - 1]
  appendHeader(event, 'X-Next-Cursor', String(lastBook.id))

  return books
})
