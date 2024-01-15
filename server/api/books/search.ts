export default defineEventHandler(async (event) => {
  const query = getQuery<{q: string, n: string}>(event)
  
  const nextCursor = +query.n || 0
  const q = query.q ?? ''

  const [cursor, items] = await kv.zscan('titles', nextCursor, {
    match: `*${q}*`,
    count: 10
  })

  if (items && items?.length === 0) {
    return {
      statusCode: 404,
      body: { message: 'books not found' },
    }
  }

  const titles = items.reduce((acc: any, item: any, index: number) => {
    if (index % 2 === 0) {
      acc.push({title: item})
    } else {
      acc[acc.length - 1].id = item
    }
    return acc
  }, [])

  appendHeader(event, 'X-Next-Cursor', String(cursor))

  return {
    statusCode: 200,
    body: titles
  }
})
