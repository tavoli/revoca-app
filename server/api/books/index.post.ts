import { z } from 'zod'

const bookBodySchema = z.object({
  title: z.string(),
  imageUrl: z.string(),
  sentences: z.array(z.string()),
  slug: z.string(),
  pins: z.object({
    ids: z.array(z.number()),
  }).optional()
})

/**
 * @openapi
 *
 * /books:
 *   post:
 *     security:
 *       - HeaderAuth: []
 *
 *     summary: Create a new book
 *     description: Create a new book
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               sentences:
 *                 type: array
 *                 items:
 *                   type: string
 *               slug:
 *                 type: string
 *               pins:
 *                 type: object
 *                 properties:
 *                   ids:
 *                     type: array
 *                     items:
 *                       type: number
 *           example:
 *             title: "Sample Title"
 *             imageUrl: "https://example.com/image.jpg"
 *             sentences: ["Sentence 1", "Sentence 2"]
 *             slug: "sample-title"
 *             pins:
 *               ids: [1, 2, 3]
 *     
 *     responses:
 *       '200':
 *         description: The book was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ok'
 *
 *       '400':
 *         description: The request was malformed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationIssues'
 *
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Unauthorized'
 *       '500':
 *         description: An internal server error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerError'
 */
export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, body => bookBodySchema.safeParse(body))

  if (!result.success) {
    setResponseStatus(event, 400)
    return result.error.issues
  }

  const user = event.context.user

  if (!user) {
    setResponseStatus(event, 401)
    return { error: 'Unauthorized' }
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
      setResponseStatus(event, 500)
      return { error: 'Error creating book' }
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
    setResponseStatus(event, 500)
    return { error: 'Error creating book' }
  }

  return { ok: true }
})
