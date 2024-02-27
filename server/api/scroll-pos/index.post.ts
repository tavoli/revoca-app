import { z } from 'zod'

const bodySchema = z.object({
  slug: z.string(),
  y: z.number(),
})

export default defineEventHandler(async (event) => {
  const result = await readValidatedBody(event, (body) => bodySchema.safeParse(body))

  if (!result.success) {
    throw createError({
      data: result.error.issues,
      status: 400,
    })
  }

  const {slug, y} = result.data

  try {
    kv.set(scrollPosKey(slug), y)
  } catch (e) {
    throw createError({
      data: e,
      status: 500,
    })
  }

  return { success: true }
});
