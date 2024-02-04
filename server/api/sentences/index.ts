import { getAllSentences } from '~/server/repositories/sentence/sentences.repository'

export default defineEventHandler(async (event) => {
  const query = getQuery(event) 
  const slug = query.s as string

  const sentences = await getAllSentences(db, slug)

  if (sentences.length === 0) {
    throw createError({
      status: 404,
      data: {
        message: 'Sentences not found',
      },
    })
  }

  return sentences
})
