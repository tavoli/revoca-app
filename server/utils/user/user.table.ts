import { Generated, Insertable, Selectable } from "kysely";

export interface UsersTable {
  id: Generated<string>,
  username: string,
}

export type User = Selectable<UsersTable>
export type NewUser = Insertable<UsersTable>
