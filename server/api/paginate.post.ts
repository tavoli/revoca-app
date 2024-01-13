export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const cacheKey = `${body.username}:${body.slug}`
  let nextCursor = body.nextCursor

  if (!body.nextCursor) {
    nextCursor = await kv.hget<number>(cacheKey, 'next_cursor') ?? undefined
  }

  const sentences = await paginateBook(body.slug, nextCursor)

  if (sentences.length === 0 && !nextCursor) {
    return {
      statusCode: 404,
      body: { message: 'book not found' },
    }
  }

  if (sentences.length === 0) {
    return {
      statusCode: 200,
      body: [],
    }
  }

  const lastSentence = sentences[sentences.length - 1]
  await kv.hset(cacheKey, { next_cursor: lastSentence.id })
  appendHeader(event, 'X-Next-Cursor', String(lastSentence.id))

  return {
    statusCode: 200,
    body: sentences.map(({sentence}) => sentence),
  }
})
