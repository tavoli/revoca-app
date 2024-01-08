import { Kysely } from 'kysely'

export function insertBook(db: Kysely<Database>, body: NewBook) {
  return db.insertInto('books')
    .values(body)
    .returning('id')
    .execute();
}