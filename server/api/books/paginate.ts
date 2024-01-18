import {z} from 'zod'

const paginateQuerySchema = z.object({
  n: z.number().int().positive().optional(),
})

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (query) => paginateQuerySchema.safeParse(query))

  if (!query.success) {
    return {
      statusCode: 400,
      body: query.error.issues,
    }
  }

  const nextCursor = query.data.n

  const books = await paginateBooks(nextCursor)

  if (books.length === 0) {
    return {
      statusCode: 404,
      body: { message: 'books not found' },
    }
  }

  const lastBook = books[books.length - 1]
  appendHeader(event, 'X-Next-Cursor', String(lastBook.id))

  return {
    statusCode: 200,
    body: books
  }
})
