import {Kysely} from "kysely";

import {NewBook, NewBookPin} from "./book.table";

export async function insertBook(db: Kysely<Database>, body: NewBook) {
  return db.insertInto('books')
    .values(body)
    .returning('id')
    .executeTakeFirstOrThrow()
    .then((row: any) => row.id);
}

export async function insertBookPin(db: Kysely<Database>, body: NewBookPin[]) {
  return db.insertInto('books_pins')
    .values(body)
    .execute();
}

export async function paginateBooks(db: Kysely<Database>, userId: string, nextCursor: number = 0) {
  return db.selectFrom('books')
    .select(['books.id', 'title', 'slug', 'image_url'])
    .where('books.id', '>', nextCursor)
    .where('books.user_id', '=', userId)
    .orderBy('books.id', 'asc')
    .limit(100)
    .execute();
}

export async function getBooksByPins(db: Kysely<Database>, userId: string, pinIds: number[]) {
  return db.selectFrom('books as b')
    .select(['b.id', 'title', 'slug', 'image_url'])
    .distinct()
    .innerJoin('books_pins as bp', 'b.id', 'bp.book_id')
    .where('bp.user_id', '=', userId)
    .where('bp.pin_id', 'in', pinIds)
    .execute();
}
