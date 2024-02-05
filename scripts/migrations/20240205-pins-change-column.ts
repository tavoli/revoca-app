import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.deleteFrom('pins').execute()

  await db.schema.alterTable('pins')
    .dropColumn('book_id')
    .addColumn('slug', 'varchar(120)', (col) => col.notNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('pins')
    .dropColumn('slug')
    .addColumn('book_id', 'integer', (col) => col.references('books.id').onDelete('cascade').notNull())
    .execute()
}

