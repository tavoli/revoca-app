export default async function dictionary (pin: string) {
  const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${pin}`)
  const json = await response.json()

  const definitions: string[] = []
  const synonyms: string[] = []
  const partsOfSpeech: string[] = []

  if (json.title === 'No Definitions Found') {
    return {
      pin,
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
    pin,
    definitions,
    synonyms,
    partsOfSpeech
  }
}
