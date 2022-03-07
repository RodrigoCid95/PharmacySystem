import fs from 'fs'
import path from 'path'
import { ipcRenderer, contextBridge } from 'electron'
import { Database } from 'sqlite3'
import products from './products'
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
db.run('CREATE TABLE IF NOT EXISTS "Buys" ( "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "id_user" INTEGER NOT NULL, "id_product" INTEGER NOT NULL, "date" TEXT NOT NULL, "count" INTEGER NOT NULL, "total" INTEGER NOT NULL );')
fs.mkdirSync(path.resolve(__dirname, '..', 'ps-images'), { recursive: true })
products(db)
window.addEventListener('close', () => db.close())
contextBridge.exposeInMainWorld('getUser', () => {
  contextBridge.exposeInMainWorld('user', ipcRenderer.sendSync('get-user'))
})