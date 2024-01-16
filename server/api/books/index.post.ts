export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const user = event.context.user
  if (!user) {
    return {
      statusCode: 401,
      body: 'unauthorized',
    }
  }

  try {
    const book_id = await insertBook({
      title: body.title,
      slug: body.slug,
      image_url: body.imageUrl,
      user_id: user.id,
    })

    const sentences = body.sentences.map((sentence: string) => ({
      book_id,
      sentence,
    }))

    await insertSentences(sentences)

    await kv.zadd(
      'titles',
      { member: body.title, score: book_id },
    );
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
