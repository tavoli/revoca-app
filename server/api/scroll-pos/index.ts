import { z } from 'zod'

const querySchema = z.object({
  slug: z.string(),
})

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, (query) => querySchema.safeParse(query))

  if (!query.success) {
    throw createError({
      data: query.error.issues,
      status: 400,
    })
  }

  const {slug} = query.data

  try {
    const y = kv.get(scrollPosKey(slug))
    return y
  } catch (e) {
    throw createError({
      data: e,
      status: 500,
    })
  }
});

