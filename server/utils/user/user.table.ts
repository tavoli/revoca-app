import { Generated, Insertable } from "kysely";

export interface UsersTable {
  id: Generated<string>,
  username: string,
}

export type NewUser = Insertable<UsersTable>
