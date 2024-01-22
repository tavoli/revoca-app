import Pool from 'pg-pool'
import { Kysely, PostgresDialect } from 'kysely'

import {UsersTable} from '../repositories/user/user.table'
import {BooksTable} from '../repositories/book/book.table'
import {PinTable} from '../repositories/pin/pin.table'
import {BooksPinsTable} from '../repositories/book/book.table'
import {SentencesTable} from '../repositories/sentence/sentences.table'

export interface Database {
  users: UsersTable,
  books: BooksTable,
  sentences: SentencesTable,
  pins: PinTable,
  books_pins: BooksPinsTable,
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
