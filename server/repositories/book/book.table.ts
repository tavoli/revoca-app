import { ColumnType, Generated, Insertable, Selectable } from "kysely";

import {UsersTable} from "../user/user.table";
import {PinTable} from "../pin/pin.table";

export interface BooksTable {
  id: Generated<number>,
  user_id: UsersTable['id'],
  title: string,
  slug: string,
  image_url?: string | null,
  is_active: ColumnType<boolean, boolean | undefined, boolean>,
}

export interface BooksPinsTable {
  id: Generated<number>,
  book_id: BooksTable['id'],
  pin_id: PinTable['id'],
  user_id: UsersTable['id'],
}

export type Book = Selectable<BooksTable>;
export type NewBook = Insertable<Omit<BooksTable, 'id'>>;
export type NewBookPin = Insertable<Omit<BooksPinsTable, 'id'>>;
