import {z} from 'zod'

import {paginatePins} from '~/server/repositories/pin/pin.repository'

const paginateQuerySchema = z.object({
  n: z.string().regex(/^\d+$/).optional().default('0'),
})

/**
 * @openapi
 *
 * /pins/paginate:
 *   get:
 *     security:
 *      - HeaderAuth: []
 *
 *     summary: Paginate pins
 *     description: Paginate pins
 *
 *     parameters:
 *       - in: query
 *         name: n
 *         schema:
 *           type: integer
 *           minimum: 1
 *           description: The next cursor
 *           example: 1
 *           required: false
 *           default: 1
 *
 *     responses:
 *       200:
 *         description: The books were successfully paginated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pins'
 *
 *       400:
 *         description: The request was malformed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationIssues'
 *
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Unauthorized'
 *
 *       404:
 *         description: The books were not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFound'
 *
 * components:
 *   schemas:
 *     Pins:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/Pin'
 *
 *     Pin:
 *       type: object
 *       properties:
 *         id:
 *          type: integer
 *          description: The id of the pin
 *          example: 1
 *         pin:
 *           type: string
 *           description: The pin
 *           example: "Sample pin"
 *         synonyms:
 *           type: array
 *           items:
 *             type: string
 *             description: The synonyms of the pin
 *             example: ["Synonym 1", "Synonym 2"]
 *         definitions:
 *           type: array
 *           items:
 *             type: string
 *             description: The definitions of the pin
 *             example: ["Definition 1", "Definition 2"]
 *         partOfSpeech:
 *           type: string
 *           description: The part of speech of the pin
 *           example: "noun"
 *           enum: ["noun", "verb", "adjective", "adverb", "pronoun", "preposition", "conjunction", "interjection"]
 */

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (query) => paginateQuerySchema.safeParse(query))

  if (!query.success) {
    throw createError({
      message: 'Invalid query',
      data: query.error.issues,
      statusCode: 400,
    })
  }

  const nextCursor = +query.data.n

  const user = event.context.user
  if (!user) {
    throw createError({
      message: 'Unauthorized',
      statusCode: 401,
    })
  }

  const pins = await paginatePins(db, user.id, nextCursor)

  if (pins.length === 0) {
    throw createError({
      message: 'Not found',
      statusCode: 404,
    })
  }

  const lastPin = pins[pins.length - 1]
  appendHeader(event, 'X-Next-Cursor', String(lastPin.id))

  return pins
})
