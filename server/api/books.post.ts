export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    await insertBook(db, {
      user_id: 1, // TODO: get user_id from session
      title: body.title,
      slug: body.slug,
      image_url: body.imageUrl,
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