import {z} from 'zod'

const pinsSchema = z.object({
  s: z.string(),
})

/**
 * @openapi
 *
 * /books/pinned:
 *   get:
 *     summary: Get pinned texts
 *     description: get all pinned texts for a specific book
 *
 *     parameters:
 *       - in: query
 *         name: s
 *         schema:
 *           type: string
 *           description: The slug of the book
 *           example: 'the-hobbit'
 *
 *     responses:
 *       200:
 *         description: A list of pinned texts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 description: The pinned text
 *                 example: 'In a hole in the ground there lived a hobbit.'
 *                 required: true
 *                 uniqueItems: true
 *
 *       400:
 *         description: The request was malformed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationIssues'
 *
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFound'
 */

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (query) => pinsSchema.safeParse(query))

  if (!query.success) {
    throw createError({
      status: 400,
      data: query.error.issues,
    })
  }

  const slug = query.data.s

  const key = pinGetKey(slug)

  const pins = await kv.zrange(key, 0, -1)

  if (pins.length === 0) {
    throw createError({
      status: 404,
      message: 'No pins found',
    })
  }

  return pins
})
