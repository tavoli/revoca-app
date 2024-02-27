import { ColumnType, Generated, Insertable, Selectable } from "kysely";

export interface PinTable {
  id: Generated<number>,
  user_id: string,
  slug: string,
  pin: string,
  is_active: ColumnType<boolean, boolean | undefined, boolean>,
  created_at: ColumnType<Date, string | undefined, never>,
}

export type Pin = Selectable<PinTable>

export type NewPin = Insertable<PinTable>
