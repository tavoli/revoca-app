export default defineEventHandler(async (event) => {
  const query = getQuery<{n: string, u: string}>(event)
  const nextCursor = +query.n || 0

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
