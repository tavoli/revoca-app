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

export async function paginateSentences(slug: string, nextCursor?: number) {
  let query =  db.selectFrom('book_sentences')
    .select(['book_sentences.id', 'sentence'])
    .innerJoin('books', 'book_sentences.book_id', 'books.id')
    .where('books.slug', '=', slug)

  if (nextCursor) {
    query = query.where('book_sentences.id', '>', nextCursor)
  }

  return query
    .orderBy('book_sentences.id', 'asc')
    .limit(10)
    .execute();
}

export async function paginateBooks(nextCursor: number = 0) {
  return db.selectFrom('books')
    .select(['books.id', 'title', 'slug', 'image_url'])
    .where('books.id', '>', nextCursor)
    .orderBy('books.id', 'asc')
    .limit(10)
    .execute();
}
