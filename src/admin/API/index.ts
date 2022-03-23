import os from 'os'
import path from 'path'
import { RunDB } from './types'
import { Database } from 'sqlite3'
import './app'
import barCodesAPI from './barCodes'
import productsAPI from './products'
import salesAPI from './sales'
import usersAPI from './users'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sqlite3 = require('sqlite3').verbose()
const homeDir = os.homedir()
const appDir = path.join(homeDir, '.ps')
const pathDatabase = path.join(appDir, 'ps.db')

const runDB: RunDB = async (callback) => {
  const db: Database = new sqlite3.Database(pathDatabase)
  await new Promise(resolve => db.once('open', resolve))
  const result = await callback(db)
  await new Promise(resolve => db.close(resolve))
  return result
}

barCodesAPI(runDB)
productsAPI(runDB)
salesAPI(runDB)
usersAPI(runDB)