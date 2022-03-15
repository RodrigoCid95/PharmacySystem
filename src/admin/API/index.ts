import path from 'path'
import { Database } from 'sqlite3'
import app from './app'
import barCodes from './barCodes'
import products from './products'
import users from './users'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sqlite3 = require('sqlite3').verbose()
const pathDatabase = process.env.HOME ? path.join(process.env.HOME, 'ps.db') : path.resolve(__dirname, '..', 'ps.db')
const db: Database = new sqlite3.Database(pathDatabase)

db.on('open', async () => {
  app(db)
  barCodes(db)
  products(db)
  users(db)
  window.addEventListener('close', () => db.close())
})