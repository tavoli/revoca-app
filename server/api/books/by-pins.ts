export default defineEventHandler(async (event) => {
  const query = getQuery<{p: string}>(event);

  const user = event.context.user
  if (!user) {
    return {
      statusCode: 401,
      body: 'unauthorized',
    }
  }

  const pinIds = query.p.split(',').map(Number)

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


