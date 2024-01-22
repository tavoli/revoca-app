import {Kysely} from "kysely";

import {NewSentences} from "../sentences/sentences.table";
import {Database} from "~/server/utils/database";

export async function insertSentences(db: Kysely<Database>, body: NewSentences) {
  return db.insertInto('sentences')
    .values(body)
    .execute();
}

export async function paginateSentences(db: Kysely<Database>, slug: string, nextCursor?: number) {
  let query =  db.selectFrom('sentences')
    .select(['sentences.id', 'sentence', 'book_id'])
    .innerJoin('books', 'sentences.book_id', 'books.id')
    .where('books.slug', '=', slug)

  if (nextCursor) {
    query = query.where('sentences.id', '>', nextCursor)
  }

  return query
    .orderBy('sentences.id', 'asc')
    .limit(10)
    .execute();
}
