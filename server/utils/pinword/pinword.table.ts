import { ColumnType, Generated, Insertable, Selectable } from "kysely";

export interface PinwordTable {
  id: Generated<number>,
  user_id: string,
  book_id: number,
  sentence_id: number,
  word: string,
  parts_of_speech?: string | null,
  definitions?: string | null,
  synonyms?: string | null,
  is_active: ColumnType<boolean, boolean | undefined, boolean>,
  created_at: ColumnType<Date, string | undefined, never>,
}

export type Pinword = Selectable<PinwordTable>
export type NewPinword = Insertable<PinwordTable>
