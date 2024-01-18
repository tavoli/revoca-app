import {z} from 'zod'

const paginateQuerySchema = z.object({
  n: z.string().regex(/^\d+$/).optional().default('0'),
})

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (query) => paginateQuerySchema.safeParse(query))

  if (!query.success) {
    return {
      statusCode: 400,
      body: query.error.issues,
    }
  }

  const nextCursor = +query.data.n

  const user = event.context.user
  if (!user) {
    return {
      statusCode: 401,
      body: 'unauthorized',
    }
  }

  const pins = await paginatePins(user.id, nextCursor)

  if (pins.length === 0) {
    return {
      statusCode: 404,
      body: { message: 'pins not found' },
    }
  }

  const lastPin = pins[pins.length - 1]
  appendHeader(event, 'X-Next-Cursor', String(lastPin.id))

  return {
    statusCode: 200,
    body: pins
  }
})
