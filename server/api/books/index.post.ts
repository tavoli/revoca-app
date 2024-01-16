import { z } from 'zod'

const bookSchema = z.object({
  title: z.string(),
  imageUrl: z.string(),
  sentences: z.array(z.string()),
  slug: z.string(),
  pins: z.object({
    ids: z.array(z.number()),
  }).optional()
})

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, body => bookSchema.safeParse(body))

  if (!result.success) {
    return {
      statusCode: 400,
      body: result.error,
    }
  }

  const user = event.context.user

  if (!user) {
    return {
      statusCode: 401,
      body: 'unauthorized',
    }
  }

  const body = result.data

  try {
    const book_id = await insertBook({
      title: body.title,
      slug: body.slug,
      image_url: body.imageUrl,
      user_id: user.id,
    })

    if (!book_id) {
      return {
        statusCode: 500,
        body: {message: 'error'},
      }
    }

    const sentences = body.sentences.map((sentence: string) => ({
      book_id,
      sentence,
    }))

    await insertSentences(sentences)

    if (body.pins) {
      const pins = body.pins.ids.map((pin_id: number) => ({
        book_id,
        pin_id,
        user_id: user.id,
      }))

      await insertBookPin(pins)
    }

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
