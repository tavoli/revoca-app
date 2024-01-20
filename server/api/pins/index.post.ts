import { z } from 'zod'

const pinBodySchema = z.object({
  book_id: z.number().int().positive(),
  sentence_id: z.number().int().positive(),
  pin: z.string().min(1).max(255),
})

/**
 * @openapi
 *
 * /pins:
 *   post:
 *     security:
 *       - HeaderAuth: []
 *
 *     summary: Create a new pin
 *     description: Create a new pin
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               book_id:
 *                 type: integer
 *                 format: int
 *                 minimum: 1
 *               sentence_id:
 *                 type: integer
 *                 format: int
 *                 minimum: 1
 *               pin:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *           example:
 *             book_id: 1
 *             sentence_id: 2
 *             pin: "Sample Pin Text"
 *
 *     responses:
 *       '200':
 *         description: The pin was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ok'
 *       '400':
 *         description: The request body was invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationIssues'
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
  const result = await readValidatedBody(event, (body) => pinBodySchema.safeParse(body))

  if (!result.success) {
    setResponseStatus(event, 400)
    return result.error.issues
  }

  const body = result.data

  const user = event.context.user
  if (!user) {
    setResponseStatus(event, 401)
    return { error: 'Unauthorized' }
  }

  const meanings = await getMeanings(body.pin)
  const partsOfSpeech = meanings.partsOfSpeech.join('\n')
  const definitions = meanings.definitions.join('\n')
  const synonyms = meanings.synonyms.join('\n')

  const pin = {
    user_id: user.id,
    book_id: body.book_id,
    sentence_id: body.sentence_id,
    pin: body.pin,
    parts_of_speech: partsOfSpeech || null,
    definitions: definitions || null,
    synonyms: synonyms || null,
    is_active: true,
    created_at: (new Date()).toISOString()
  }

  try {
    await insertPin(pin)
  } catch (e) {
    console.log(e)
    setResponseStatus(event, 500)
    return {error: 'Internal Server Error'}
  }

  return { ok: true }
})

async function getMeanings(pin: string) {
  const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${pin}`)
  const json = await response.json()

  const definitions: string[] = []
  const synonyms: string[] = []
  const partsOfSpeech: string[] = []

  if (json.title === 'No Definitions Found') {
    return {
      definitions,
      synonyms,
      partsOfSpeech
    }
  }

  for (const result of json) {
    for (const meaning of result.meanings) {
      partsOfSpeech.push(meaning.partOfSpeech)
      for (const definition of meaning.definitions) {
        definitions.push(definition.definition)
      }
      for (const synonym of meaning.synonyms) {
        synonyms.push(synonym)
      }
    }
  }

  return {
    definitions,
    synonyms,
    partsOfSpeech
  }
}
