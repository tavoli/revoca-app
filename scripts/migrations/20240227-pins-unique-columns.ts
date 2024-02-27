import { Kysely } from 'kysely'
import type {Database} from '~/server/utils/database'

async function backup(db: Kysely<Database>) {
  const rows = await db.selectFrom('pins')
    .select(['user_id', 'slug', 'pin', 'is_active'])
    .groupBy(['user_id', 'slug', 'pin', 'is_active'])
    .execute()
  return rows
}

export async function up(db: Kysely<Database>): Promise<void> {
  const rows = await backup(db) 
  await db.deleteFrom('pins').execute()
  await db.schema.alterTable('pins')
    .addUniqueConstraint('unique_user_slug_pin', ['user_id', 'slug', 'pin'])
    .execute()
  if (rows.length) {
    await db.insertInto('pins').values(rows).execute()
  }
}

export async function down(db: Kysely<Database>): Promise<void> {
  const rows = await backup(db)
  await db.deleteFrom('pins').execute()
  await db.schema.alterTable('pins')
    .dropConstraint('unique_user_slug_pin')
    .execute()
  if (rows.length) {
    await db.insertInto('pins').values(rows).execute()
  }
}
