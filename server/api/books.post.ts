export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    const user_id = await kv.hget(body.username, 'id')
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
