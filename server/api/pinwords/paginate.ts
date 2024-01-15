export default defineEventHandler(async (event) => {
  const query = getQuery<{n: string, u: string}>(event)
  const nextCursor = +query.n || 0
  const username = query.u

  if (!username) {
    return {
      statusCode: 400,
      body: {message: 'username is required'},
    }
  }

  const userId = await kv.hget<string>(username, 'id')

  if (!userId) {
    return {
      statusCode: 404,
      body: {message: 'user not found'},
    }
  }

  const pinwords = await paginatePins(userId, nextCursor)

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
