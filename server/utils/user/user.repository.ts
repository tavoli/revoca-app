export function insertUser(body: NewUser) {
  return db.insertInto('users')
    .values(body)
    .execute();
}

export function getUserByUsername(username: string) {
  return db.selectFrom('users')
    .select(['id', 'username'])
    .where('username', '=', username)
    .executeTakeFirst()
}
