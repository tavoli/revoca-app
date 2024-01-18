import { z } from 'zod'

const pinBodySchema = z.object({
  book_id: z.number().int().positive(),
  sentence_id: z.number().int().positive(),
  pin: z.string().min(1).max(255),
})

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, (body) => pinBodySchema.safeParse(body))

  if (!result.success) {
    return {
      statusCode: 400,
      body: result.error.issues,
    }
  }

  const body = result.data

  const user = event.context.user
  if (!user) {
    return {
      statusCode: 401,
      body: 'unauthorized',
    }
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

  await insertPin(pin)

  return {
    statusCode: 200,
    body: { message: 'success' }
  }
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
