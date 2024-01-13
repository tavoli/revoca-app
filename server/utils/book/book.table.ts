import { ColumnType, Generated, Insertable, Selectable } from "kysely";

export interface BooksTable {
  id: Generated<number>,
  user_id: string,
  title: string,
  slug: string,
  image_url?: string | null,
  is_active: ColumnType<boolean, boolean | undefined, boolean>,
}

export interface BookSentencesTable {
  id: Generated<number>,
  book_id: number,
  sentence: string,
}

export type Book = Selectable<BooksTable>;
export type NewBook = Insertable<BooksTable>;
export type NewSentences = Insertable<BookSentencesTable>;

