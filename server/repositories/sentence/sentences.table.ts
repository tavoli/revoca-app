import { Generated, Insertable } from "kysely";

import {BooksTable} from "../book/book.table";

export interface SentencesTable {
  id: Generated<number>,
  book_id: BooksTable['id'],
  sentence: string,
}

export interface AiSentencesTable {
  id: Generated<number>,
  sentence: string,
  sentence_id: number,
  user_id: string,
}

export type NewSentences = Insertable<Omit<SentencesTable, 'id'>>[];

export type NewAiSentences = Insertable<Omit<AiSentencesTable, 'id'>>[];
