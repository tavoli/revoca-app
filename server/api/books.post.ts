export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    const user_id = await kv.hget<string>(body.username, 'id')

    if (!user_id) {
      return {
        statusCode: 400,
        body: {message: 'user not found'},
      }
    }

    const book_id = await insertBook({
      title: body.title,
      slug: body.slug,
      image_url: body.imageUrl,
      user_id,
    })

    const sentences = body.sentences.map((sentence: string) => ({
      book_id,
      sentence,
    }))

    await insertSentences(sentences)
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
