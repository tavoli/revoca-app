import {z} from 'zod'
import {getBooksByPins} from '~/server/repositories/book/book.repository';

const idsQuerySchema = z.object({
  ids: z.string().regex(/^\d+(,\d+)*$/),
})

/**
 * @openapi
 *
 * /books/by-pins:
 *   get:
 *     security:
 *      - HeaderAuth: []
 *
 *     summary: Get books by pins
 *     description: Returns a list of books that match the pins ids.
 *
 *     parameters:
 *     - in: query
 *       name: ids
 *       description: Comma separated list of pin ids.
 *
 *     responses:
 *       200:
 *         description: A list of books.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Books'
 *
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Unauthorized'
 *
 *       400:
 *         description: Zod validation error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationIssues'
 *
 *       404:
 *         description: No books found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFound'
 */

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (query) => idsQuerySchema.safeParse(query));

  if (!query.success) {
    setResponseStatus(event, 400)
    return query.error.issues
  }

  const user = event.context.user
  if (!user) {
    setResponseStatus(event, 401)
    return { error: 'Unauthorized' }
  }

  const pinIds = query.data.ids.split(',').map(Number)

  const books = await getBooksByPins(db, user.id, pinIds)

  if (!books.length) {
    setResponseStatus(event, 404)
    return { error: 'Books not found' }
  }

  return books
})


