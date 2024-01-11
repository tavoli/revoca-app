export function insertUser(body: NewUser) {
  return db.insertInto('users')
    .values(body)
    .execute();
}

export function getUserByUsername(username: string) {
  return db.selectFrom('users')
    .select(['id', 'username'])
    .where('username', '=', username)
    .limit(1)
    .execute()
    .then((rows: User) => rows[0]);
}
