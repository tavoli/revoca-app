import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('ai_sentences')
    .addColumn('id', 'serial', (col) => col.notNull().primaryKey())
    .addColumn('sentence', 'text', (col) => col.notNull())
    .addColumn('sentence_id', 'integer', (col) => col.references('sentences.id').onDelete('cascade').notNull())
    .addColumn('user_id', 'char(8)', (col) => col.references('users.id').onDelete('cascade').notNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('ai_sentences').execute()
}

