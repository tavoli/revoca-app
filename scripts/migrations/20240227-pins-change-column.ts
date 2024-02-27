import { Kysely } from 'kysely'
import type {Database} from '~/server/utils/database'

async function backup(db: Kysely<Database>) {
  const rows = await db.selectFrom('pins')
    .select(['user_id', 'slug', 'pin', 'is_active'])
    .execute()
  return rows
}

export async function up(db: Kysely<Database>): Promise<void> {
  const rows = await backup(db) 
  await db.deleteFrom('pins').execute()
  await db.schema.alterTable('pins')
    .dropColumn('context')
    .dropColumn('parts_of_speech')
    .dropColumn('definitions')
    .dropColumn('synonyms')
    .execute()
  if (rows.length) {
    await db.insertInto('pins').values(rows).execute()
  }
}

export async function down(db: Kysely<Database>): Promise<void> {
  const rows = await backup(db)
  await db.deleteFrom('pins').execute()
  await db.schema.alterTable('pins')
    .addColumn('context', 'char(7)')
    .addColumn('definitions', 'text')
    .addColumn('synonyms', 'text')
    .addColumn('parts_of_speech', 'varchar(255)')
    .execute()
  if (rows.length) {
    await db.insertInto('pins').values(rows).execute()
  } 
}
