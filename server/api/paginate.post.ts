export default defineEventHandler(async (event) => {
  const {title, nextCursor, username} = await readBody(event)

  // TODO get last feed on database
  // do not ask for nextCursor on request
  //  LastFeed table must to lay on redis
  //  because it is a cache and will be get lots of times
  const sentences = await paginateSentencesByBookSlug(title, nextCursor)

  if (sentences.length === 0) {
    return {
      statusCode: 404,
      body: { message: 'not found' }
    }
  }

  const user_id = await kv.hget(username, 'id')
  const lastSentence = sentences[sentences.length - 1]

  await insertLastFeed({
    book_id: lastSentence.book_id,
    next_cursor: lastSentence.id,
    user_id,
  })

  appendHeader(event, 'X-Next-Cursor', lastSentence.id)

  return {
    statusCode: 200,
    body: sentences
  }
})
