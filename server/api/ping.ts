import {sql} from 'kysely'

export default defineEventHandler(async () => {

  try {
    await sql`SELECT 1`.execute(db)
  } catch (e) {
    throw createError({
      message: 'Database error',
      statusCode: 500,
    })
  }

  return 'pong'

});
