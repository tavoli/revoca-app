import { z } from 'zod'

const setPinBodySchema = z.object({
  bookId: z.number(),
  pin: z.string(),
})

/**
 * @openapi
 *
 * /books/set-pin:
 *   post:
 *     security:
 *       - HeaderAuth: []
 *
 *     summary: Set a pin for a book
 *     description: Set a pin for a book
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookId:
 *                 type: number
 *                 description: The id of the book
 *                 example: 1
 *                 required: true
 *               pin:
 *                 type: string
 *                 description: The pin to set
 *                 example: 'something'
 *                 required: true
 *               
 *           example:
 *             bookId: 1
 *             pin: 'meant'
 *     
 *     responses:
 *       '200':
 *         description: The pin was set
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
 *
 *       '500':
 *         description: An internal server error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerError'
 */

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, body => setPinBodySchema.safeParse(body))

  if (!result.success) {
    throw createError({
      message: 'Validation error',
      data: result.error.issues,
      statusCode: 400,
    })
  }

  const user = event.context.user

  if (!user) {
    throw createError({
      message: 'Unauthorized',
      statusCode: 401,
    })
  }

  const body = result.data

  const key = `books:${body.bookId}:pins`
  const data = {
    member: body.pin,
    score: +new Date(),
  }

  try {
    await kv.zadd(key, data)
  } catch (error) {
    console.error(error)
    throw createError({
      message: 'Error creating book',
      statusCode: 500,
    })
  }

  return { ok: true }
})
