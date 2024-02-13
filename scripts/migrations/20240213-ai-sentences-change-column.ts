import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.deleteFrom('ai_sentences').execute()

  await db.schema.alterTable('ai_sentences')
    .dropColumn('id')
    .addColumn('id', 'char(7)', (col) => col.primaryKey().notNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('ai_sentences')
    .dropColumn('id')
    .addColumn('id', 'serial', (col) => col.primaryKey().notNull())
    .execute()
}
