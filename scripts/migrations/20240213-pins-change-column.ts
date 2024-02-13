import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.deleteFrom('pins').execute()

  await db.schema.alterTable('pins')
    .dropColumn('sentence_id')
    .addColumn('context', 'char(7)')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom('pins').execute()

  await db.schema.alterTable('pins')
    .addColumn('sentence_id', 'integer', (col) => col.references('sentences.id').onDelete('cascade').notNull())
    .dropColumn('context')
    .execute()
}
