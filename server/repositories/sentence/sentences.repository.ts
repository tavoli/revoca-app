import {Kysely} from "kysely";

import {Database} from "~/server/utils/database";
import {NewSentences} from "./sentences.table";

export async function insertSentences(db: Kysely<Database>, body: NewSentences) {
  return db.insertInto('sentences')
    .values(body)
    .execute();
}

export async function getAllInitialSentences(db: Kysely<Database>, slug: string, limit = 30, nextCursor: number | null) {
  let query = db.selectFrom('sentences')
    .select(['sentences.id', 'sentence', 'book_id'])
    .innerJoin('books', 'sentences.book_id', 'books.id')
    .where('books.slug', '=', slug)

  if (nextCursor && nextCursor > 0) {
    query = query.where('sentences.id', '<', nextCursor)
  } else {
    query = query.limit(limit)
  }

  return query.orderBy('sentences.id', 'asc').execute();
}

export async function getAllSentences(db: Kysely<Database>, slug: string) {
  let query = db.selectFrom('sentences')
    .select(['sentences.id', 'sentence', 'book_id'])
    .innerJoin('books', 'sentences.book_id', 'books.id')
    .where('books.slug', '=', slug)
  return query.orderBy('sentences.id', 'asc').execute();
}

export async function paginateSentences(db: Kysely<Database>, slug: string, limit = 10, nextCursor?: number) {
  let query =  db.selectFrom('sentences')
    .select(['sentences.id', 'sentence', 'book_id'])
    .innerJoin('books', 'sentences.book_id', 'books.id')
    .where('books.slug', '=', slug)

  if (nextCursor) {
    query = query.where('sentences.id', '>', nextCursor)
  }

  return query
    .orderBy('sentences.id', 'asc')
    .limit(limit)
    .execute();
}
