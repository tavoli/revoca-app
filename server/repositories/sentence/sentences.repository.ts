import {Kysely, sql} from "kysely";

import {Database} from "~/server/utils/database";
import {NewAiSentence, NewSentences} from "./sentences.table";

export async function insertSentences(db: Kysely<Database>, body: NewSentences) {
  return db.insertInto('sentences')
    .values(body)
    .execute();
}

export async function insertAiSentences(db: Kysely<Database>, body: NewAiSentence) {
  return db.insertInto('ai_sentences')
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

export async function getAllSentences(db: Kysely<Database>, slug: string, userId: string) {
  const query = (db as any).selectFrom('sentences')
    .select(['sentences.id', 'sentence', sql.raw('null as ai_id')])
    .union((eb: any) => eb.parens(

      eb.selectFrom('ai_sentences')
        .select(['sentences.id', 'ai_sentences.sentence', 'ai_sentences.id as ai_id'])
        .innerJoin('sentences', 'ai_sentences.sentence_id', 'sentences.id')
        .innerJoin('books', 'sentences.book_id', 'books.id')
        .where('ai_sentences.user_id', '=', userId)
        .where('books.slug', '=', slug)

    ))
    .innerJoin('books', 'sentences.book_id', 'books.id')
    .where('books.slug', '=', slug)
    .orderBy(sql.raw('id, ai_id'), 'asc')

  return query.execute();
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
