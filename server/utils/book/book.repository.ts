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

export async function paginateSentencesByBookSlug(slug: string, nextCursor: number) {
  return db.selectFrom('book_sentences as bs')
    .select(['bs.id', 'bs.sentence', 'bs.book_id'])
    .innerJoin('books as b', 'b.id', 'bs.book_id')
    .where('b.slug', '=', slug)
    .where('bs.id', '>', nextCursor)
    .orderBy('bs.id', 'asc')
    .limit(10)
    .execute();
}

export async function insertLastFeed(body: NewBookFeed) {
  return db.insertInto('books_feeds')
    .values(body)
    .execute();
}
