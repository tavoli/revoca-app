export function insertPin(body: NewPinword) {
  return db.insertInto('pin_words')
    .values(body)
    .execute();
}

export function paginatePins(userId: string, nextCursor: number = 0) {
  return db.selectFrom('pin_words')
    .select(['id', 'word', 'synonyms', 'definitions', 'parts_of_speech'])
    .where('id', '>', nextCursor)
    .where('user_id', '=', userId)
    .limit(10)
    .execute();
}
