import {z} from 'zod'

const idsQuerySchema = z.object({
  p: z.string().regex(/^\d+(,\d+)*$/),
})

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (query) => idsQuerySchema.safeParse(query));

  if (!query.success) {
    return {
      statusCode: 400,
      body: query.error.issues,
    }
  }

  const user = event.context.user
  if (!user) {
    return {
      statusCode: 401,
      body: 'unauthorized',
    }
  }

  const pinIds = query.data.p.split(',').map(Number)

  const books = await getBooksByPins(user.id, pinIds)

  if (!books.length) {
    return {
      statusCode: 404,
      body: 'not found',
    }
  }

  return {
    statusCode: 200,
    body: books,
  }
})


