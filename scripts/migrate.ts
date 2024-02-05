import {promises as fs} from 'fs'
import path from 'path'
import {FileMigrationProvider, Migrator} from "kysely"
import chalk from 'chalk'

import {db} from '../server/utils/database'

function printResult({error, results}: any, direction: string) {
  if (error) {
    console.error(chalk.red(`😟 ${error.message}`));
    process.exit(1)
  }

  const logDir = direction === 'UP'
    ? chalk.bold.green('UP')
    : chalk.bold.red('DOWN')

  for (const result of results) {
    if (result.status === 'Success') {
      console.log(chalk.green(`🚀 ${logDir} - ${result.migrationName}`));
    } else if (result.status === 'Error') {
      console.log(chalk.red(`😟 Failed to migrate ${result.migrationName}`));
      console.error(result.error);
    }
  }
}

const migrationFolder = path.resolve(__dirname, './migrations')

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder,
  })
})

const params = process.argv.slice(2)

if (params.includes('--up')) {
  const result = await migrator.migrateToLatest() as any
  printResult(result, 'UP')
} else if (params.includes('--down')) {
  const result = await migrator.migrateDown() as any
  printResult(result, 'DOWN')
} else {
  console.error(chalk.red(`😟 Invalid command`));
}

await db.destroy()
