import {z} from 'zod'

const searchQuerySchema = z.object({
  q: z.string().optional().default(''),
  n: z.string().regex(/^\d+$/).optional().default('0'),
})

/**
 * @openapi
 *
 * /books/search:
 *   get:
 *     summary: Search books
 *     description: Returns a list of titles that match the search query.
 *
 *     parameters:
 *     - in: query
 *       name: q
 *     - in: query
 *       name: n
 *
 *     responses:
 *       200:
 *         description: A list of titles.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Titles'
 *
 *       400:
 *         description: Invalid query.
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
 *
 * components:
 *   schemas:
 *     Titles:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/Title'
 *
 *     Title:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the book
 *           example: "Sample Title"
 *         id:
 *           type: number
 *           description: The id of the book
 *           example: 123
 *
 */

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (query) => searchQuerySchema.safeParse(query))

  if (!query.success) {
    setResponseStatus(event, 400)
    return query.error.issues
  }

  const nextCursor = +query.data.n
  const q = query.data.q

  const [cursor, items] = await kv.zscan('titles', nextCursor, {
    match: `*${q}*`,
    count: 10
  })

  if (items && items?.length === 0) {
    setResponseStatus(event, 404)
    return { error: 'Not found' }
  }

  const titles = items.reduce((acc: any, item: any, index: number) => {
    if (index % 2 === 0) {
      acc.push({title: item})
    } else {
      acc[acc.length - 1].id = item
    }
    return acc
  }, [])

  appendHeader(event, 'X-Next-Cursor', String(cursor))

  return titles
})
