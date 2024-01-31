import { z } from 'zod'

const pinQuerySchema = z.object({
  pin: z.string().min(1),
})

/**
 * @openapi
 *
 * /definition:
 *   get:
 *
 *     summary: Get pin definition
 *     description: Get pin definition
 *
 *     parameters: 
 *      - in: query
 *        name: pin
 *        schema:
 *          type: string
 *          required: true
 *          description: pin to define
 *          example: "hello"
 *
 *     responses:
 *       '200':
 *         description: The definition of the pin
 *         content:
 *           application/json:
 *             schema:
 *              type: object
 *              properties:
 *                definitions:
 *                  type: array
 *                  items:
 *                    type: string
 *                    description: definition of the text
 *                    example: an expression of greeting
 *                synonyms:
 *                  type: array
 *                  items:
 *                    type: string
 *                    description: synonyms of the text
 *                    example: hi
 *                partOfSpeech:
 *                  type: array
 *                  items:
 *                    type: string
 *                    description: part of speech of the text
 *                    example: noun
 *             example:
 *               definitions: ["an expression of greeting"]
 *               synonyms: ["hi"]
 *               partOfSpeech: ["noun"]
 *               
 *       '400':
 *         description: Zod validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationIssues'
 */

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (query) => pinQuerySchema.safeParse(query))

  if (!query.success) {
    throw createError({
      data: query.error.issues,
      status: 400,
    })
  }

  const response = await dictionary(query.data.pin)

  return response
});

