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

  const pinwords = await paginatePins(user.id, nextCursor)

  if (pinwords.length === 0) {
    return {
      statusCode: 404,
      body: { message: 'pinwords not found' },
    }
  }

  const lastPinword = pinwords[pinwords.length - 1]
  appendHeader(event, 'X-Next-Cursor', String(lastPinword.id))

  return {
    statusCode: 200,
    body: pinwords
  }
})
