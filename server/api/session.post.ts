import { nanoid } from "nanoid"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const user = {
    id: nanoid(8),
    username: body.username,
  }


  try {
    await insertUser(user)
    await kv.hset(body.username, { id: user.id })
  } catch (error) {
    console.error(error)
    return {
      statusCode: 500,
      body: { message: 'error' },
    }
  }

  return {
    statusCode: 201,
    body: { message: 'success' }
  }
})
