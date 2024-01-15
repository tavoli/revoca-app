export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const cacheKey = `${body.username}:${body.slug}`

  let nextCursor: number | undefined;

  if (body.nextCursor === undefined) {
    nextCursor = await kv.hget<number>(cacheKey, 'next_cursor') ?? undefined;
  } else if (body.nextCursor === 0) {
    await kv.hdel(cacheKey, 'next_cursor');
    nextCursor = undefined;
  } else {
    nextCursor = +body.nextCursor;
  }

  const sentences = await paginateSentences(body.slug, nextCursor)

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
  appendHeader(event, 'X-Book-Id', String(lastSentence.book_id))

  return {
    statusCode: 200,
    body: sentences.map(({id, sentence}) => ({id, sentence}))
  }
})
