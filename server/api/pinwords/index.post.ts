async function getMeanings(word: string) {
  const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
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

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const user_id = await kv.hget<string>(body.username, 'id')

  if (!user_id) {
    return {
      statusCode: 401,
      body: { message: 'user not found' }
    }
  }

  const meanings = await getMeanings(body.word)
  const partsOfSpeech = meanings.partsOfSpeech.join('\n')
  const definitions = meanings.definitions.join('\n')
  const synonyms = meanings.synonyms.join('\n')

  const pinword = {
    user_id: user_id,
    book_id: body.book_id,
    sentence_id: body.sentence_id,
    word: body.word,
    parts_of_speech: partsOfSpeech || null,
    definitions: definitions || null,
    synonyms: synonyms || null,
    is_active: true,
    created_at: (new Date()).toISOString()
  }

  await insertPin(pinword)

  return {
    statusCode: 200,
    body: { message: 'success' }
  }
})
