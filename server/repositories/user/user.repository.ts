import {Kysely} from "kysely";

import {NewUser} from "./user.table";

export function insertUser(db: Kysely<Database>, body: NewUser) {
  return db.insertInto('users')
    .values(body)
    .execute();
}

export function getUserByUsername(db: Kysely<Database>, username: string) {
  return db.selectFrom('users')
    .select(['id', 'username'])
    .where('username', '=', username)
    .executeTakeFirst()
}
