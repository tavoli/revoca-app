import { ColumnType, Generated } from "kysely";

export interface PinWordsTable {
  id: Generated<number>,
  user_id: number,
  book_id: number,
  word: string,
  synonyms: string,
  is_active: ColumnType<boolean, boolean | undefined, boolean>,
  created_at: ColumnType<Date, string | undefined, never>,
}