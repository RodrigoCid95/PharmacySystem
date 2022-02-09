import fs from 'fs'
import path from 'path'
import { Database } from 'sqlite3'
import app from './app'
import barCodes from './barCodes'
import products from './products'
import users from './users'
let pathDatabase = ''
if (process.env.HOME) {
  pathDatabase = path.join(process.env.HOME, 'ps.db')
} else {
  pathDatabase = path.resolve(__dirname, '..', 'ps.db')
}
if (!fs.existsSync(pathDatabase)) {
  fs.writeFileSync(pathDatabase, '', { encoding: 'utf-8' })
}
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sqlite3 = require('sqlite3').verbose()
const db: Database = new sqlite3.Database(pathDatabase);
db.run('CREATE TABLE IF NOT EXISTS "BarCodes" ( "id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "name"	TEXT, "value"	TEXT );', () => {
  db.run('CREATE TABLE IF NOT EXISTS "Products" ( "id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "name"	TEXT NOT NULL, "description"	TEXT, "sku"	TEXT NOT NULL, "thumbnail"	TEXT, "price"	INTEGER NOT NULL, "stock"	INTEGER NOT NULL, "minStock"	INTEGER, "isPackage"	INTEGER NOT NULL, "piecesPerPackage"	INTEGER, "realStock"	INTEGER );')
})
fs.mkdirSync(path.resolve(__dirname, '..', 'ps-images'), { recursive: true })
app(db)
barCodes(db)
products(db)
users(db)

window.addEventListener('close', () => db.close())