export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    const user_id = await kv.hget(body.username, 'id')
    console.log(user_id)
    await insertBook(db, {
      title: body.title,
      slug: body.slug,
      image_url: body.imageUrl,
      user_id,
    })
  } catch (error) {
    console.error(error)
    return {
      statusCode: 500,
      body: { message: 'error' },
    }
  }

  return {
    statusCode: 200,
    body: { message: 'success' }
  }
})
