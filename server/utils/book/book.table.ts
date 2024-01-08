import { ColumnType, Generated, Insertable, Selectable } from "kysely";

export interface BooksTable {
  id: Generated<number>,
  user_id: number,
  title: string,
  slug: string,
  image_url?: string | null,
  is_active: ColumnType<boolean, boolean | undefined, boolean>,
}

export interface BookSentencesTable {
  book_id: number,
  sentence: string,
}

export interface BooksFeedsTable {
  book_id: number,
  user_id: number,
  next_cursor: number,
}

export type Book = Selectable<BooksTable>;
export type NewBook = Insertable<BooksTable>;

