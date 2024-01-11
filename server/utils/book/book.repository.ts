export async function insertBook(body: NewBook) {
  return db.insertInto('books')
    .values(body)
    .returning('id')
    .executeTakeFirst()
    .then((row: any) => row.id);
}

export async function insertSentences(body: NewSentences) {
  return db.insertInto('book_sentences')
    .values(body)
    .execute();
}
