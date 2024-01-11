import { nanoid } from "nanoid";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    const user = {
      id: nanoid(8),
      username: body.username,
    }

    const ttl7days = 60 * 60 * 24 * 7
    const when = +new Date()

    const hasSession = await kv.hget(user.username, 'id')

    if (hasSession) {
      kv.hset(user.username, { id: hasSession, ttl: ttl7days, when })
    } else {
      const existingUser = await getUserByUsername(user.username)

      if (existingUser) {
        kv.hset(existingUser.username, { id: existingUser.id, ttl: ttl7days, when })
      } else {
        await insertUser(user);
        kv.hset(user.username, { id: user.id, ttl: ttl7days, when })
      }
    }

    return {
      statusCode: 200,
      body: { message: 'success' },
    }
  } catch (error) {
    console.error(error)

    return {
      statusCode: 500,
      body: { message: 'error' },
    }
  }
})
