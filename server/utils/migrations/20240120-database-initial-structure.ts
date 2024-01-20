import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('users')
    .addColumn('id', 'char(8)', (col) => col.primaryKey())
    .addColumn('username', 'varchar(35)', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('books')
    .addColumn('id', 'serial', (col) => col.notNull().primaryKey())
    .addColumn('user_id', 'char(8)', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('title', 'varchar(100)', (col) => col.notNull())
    .addColumn('slug', 'varchar(120)', (col) => col.notNull())
    .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('image_url', 'varchar(255)')
    .execute();

  await db.schema
    .createTable('sentences')
    .addColumn('id', 'serial', (col) => col.notNull().primaryKey())
    .addColumn('book_id', 'integer', (col) => col.references('books.id').onDelete('cascade').notNull())
    .addColumn('sentence', 'text', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('pins')
    .addColumn('id', 'serial', (col) => col.notNull().primaryKey())
    .addColumn('user_id', 'char(8)', (col) => col.references('users.id').onDelete('cascade').notNull())
    .addColumn('book_id', 'integer', (col) => col.references('books.id').onDelete('cascade').notNull())
    .addColumn('sentence_id', 'integer', (col) => col.references('sentences.id').onDelete('cascade').notNull())
    .addColumn('pin', 'varchar(255)', (col) => col.notNull())
    .addColumn('synonyms', 'text')
    .addColumn('definitions', 'text')
    .addColumn('parts_of_speech', 'varchar(255)')
    .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamp', (col) => col.notNull().defaultTo(sql.raw('now()')))
    .execute();

  await db.schema
    .createTable('books_pins')
    .addColumn('id', 'serial', (col) => col.notNull().primaryKey())
    .addColumn('book_id', 'integer', (col) => col.references('books.id').onDelete('cascade').notNull())
    .addColumn('pin_id', 'integer', (col) => col.references('pins.id').onDelete('cascade').notNull())
    .addColumn('user_id', 'char(8)', (col) => col.references('users.id').onDelete('cascade').notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('books_pins').execute();
  await db.schema.dropTable('pins').execute();
  await db.schema.dropTable('sentences').execute();
  await db.schema.dropTable('books').execute();
  await db.schema.dropTable('users').execute(); 
}
