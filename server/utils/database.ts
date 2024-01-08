import Pool from 'pg-pool'
import { Kysely, PostgresDialect } from 'kysely'

export interface Database {
  users: UsersTable,
  books: BooksTable,
  book_sentences: BookSentencesTable,
  books_feeds: BooksFeedsTable,
  pin_words: PinWordsTable,
}

const dialect = new PostgresDialect({
  pool: new Pool({
    database: process.env.POSTGRES_DATABASE,
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    ssl: true,
  })
})

export const db = new Kysely<Database>({
  dialect,
})