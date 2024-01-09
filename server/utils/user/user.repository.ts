export function insertUser(body: NewUser) {
  return db.insertInto('users')
    .values(body)
    .execute();
}
