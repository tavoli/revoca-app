import Pool from 'pg-pool'
import { Kysely, PostgresDialect } from 'kysely'

import {UsersTable} from '../repositories/user/user.table'
import {BooksTable} from '../repositories/book/book.table'
import {PinTable} from '../repositories/pin/pin.table'
import {BooksPinsTable} from '../repositories/book/book.table'
import {SentencesTable, AiSentencesTable} from '../repositories/sentence/sentences.table'

export interface Database {
  users: UsersTable,
  books: BooksTable,
  sentences: SentencesTable,
  pins: PinTable,
  books_pins: BooksPinsTable,
  ai_sentences: AiSentencesTable
}

const dialect = new PostgresDialect({
  pool: new Pool({
    database: process.env.PG_DATABASE,
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    ssl: true,
  })
})

export const db = new Kysely<Database>({
  dialect,
})
