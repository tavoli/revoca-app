export function insertPin(body: NewPin) {
  return db.insertInto('pins')
    .values(body)
    .execute();
}

export function paginatePins(userId: string, nextCursor: number = 0) {
  return db.selectFrom('pins')
    .select(['id', 'pin', 'synonyms', 'definitions', 'parts_of_speech'])
    .where('id', '>', nextCursor)
    .where('user_id', '=', userId)
    .limit(10)
    .execute();
}
