import {z} from 'zod'

const searchQuerySchema = z.object({
  q: z.string().optional().default(''),
  n: z.string().regex(/^\d+$/).optional().default('0'),
})

/**
/**
 * @openapi
 * /:
 *   get:
 *     description: Welcome to swagger-jsdoc!
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (query) => searchQuerySchema.safeParse(query))

  if (!query.success) {
    return {
      statusCode: 400,
      body: query.error.issues,
    }
  }

  const nextCursor = +query.data.n
  const q = query.data.q

  const [cursor, items] = await kv.zscan('titles', nextCursor, {
    match: `*${q}*`,
    count: 10
  })

  if (items && items?.length === 0) {
    return {
      statusCode: 404,
      body: { message: 'books not found' },
    }
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

  return {
    statusCode: 200,
    body: titles
  }
})
