export default defineEventHandler(async (event) => {
  const query = getQuery<{n: number}>(event)
  const nextCursor = +query.n || 0
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
