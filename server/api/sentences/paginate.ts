import { z } from 'zod'

const paginateQuerySchema = z.object({
  n: z.string().regex(/^\d+$/).optional().default('0'),
  s: z.string(),
})

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (query) => paginateQuerySchema.safeParse(query))

  if (!query.success) {
    return {
      statusCode: 400,
      body: query.error.issues,
    }
  }

  const slug = query.data.s

  const user = event.context.user
  if (!user) {
    return {
      statusCode: 401,
      body: 'unauthorized',
    }
  }

  const cacheCursorK = `${user.username}:${slug}`

  const nextCursor = query.data.n === undefined
    ? await kv.hget<number>(cacheCursorK, 'next_cursor') ?? undefined
    : +query.data.n

  const sentences = await paginateSentences(slug, nextCursor)

  if (sentences.length === 0 && nextCursor === undefined) {
    return {
      statusCode: 404,
      body: 'NO_SENTENCES',
    }
  } else if (sentences.length === 0 && Number(nextCursor) >= 0) {
    setHeader(event, 'X-Reached-End', 'true')
    return {
      statusCode: 404,
      body: 'NO_MORE_SENTENCES_OR_INVALID_CURSOR',
    }
  } else if (sentences.length === 0) {
    return {
      statusCode: 404,
      body: 'UNKNOWN_ERROR',
    }
  }

  const lastSentence = sentences[sentences.length - 1]
  await kv.hset(cacheCursorK, { next_cursor: lastSentence.id })

  appendHeader(event, 'X-Reached-End', 'false')
  appendHeader(event, 'X-Next-Cursor', String(lastSentence.id))
  appendHeader(event, 'X-Book-Id', String(lastSentence.book_id))

  return {
    statusCode: 200,
    body: sentences.map(({id, sentence}) => ({id, sentence}))
  }
})
