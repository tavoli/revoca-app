import {Kysely} from "kysely";

import {NewPin} from "./pin.table";

export function insertPin(db: Kysely<Database>, body: NewPin) {
  return db.insertInto('pins')
    .values(body)
    .execute();
}

export function paginatePins(
  db: Kysely<Database>,
  userId: string,
  nextCursor: number = 0,
  limit: number = 10
) {
  return db.selectFrom('pins')
    .select(['id', 'pin', 'synonyms', 'definitions', 'parts_of_speech'])
    .where('id', '>', nextCursor)
    .where('user_id', '=', userId)
    .limit(limit)
    .execute();
}
