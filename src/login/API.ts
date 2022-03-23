import { contextBridge, ipcRenderer } from 'electron'
import os from 'os'
import fs from 'fs'
import path from 'path'
import { Database } from 'sqlite3'
import { Encryptor } from '../encryptor'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sqlite3 = require('sqlite3').verbose()
const homeDir = os.homedir()
const appDir = path.join(homeDir, '.ps')

if (!fs.existsSync(appDir)) {
  fs.mkdirSync(appDir, { recursive: true })
}

const pathDatabase = path.join(appDir, 'ps.db')
const pathAuthFile = path.join(appDir, 'us.a')
const pathImages = path.join(appDir, 'ps-images')

if (!fs.existsSync(pathDatabase)) {
  fs.writeFileSync(pathDatabase, '', { encoding: 'utf-8' })
}
if (!fs.existsSync(pathAuthFile)) {
  fs.writeFileSync(pathAuthFile, Encryptor.encode('admin', 'root'), { encoding: 'utf8' })
}
if (!fs.existsSync(pathImages)) {
  fs.mkdirSync(pathImages, { recursive: true })
}

const db: Database = new sqlite3.Database(pathDatabase)

db.on('open', async () => {
  await new Promise(resolve =>
    db.run(
      'CREATE TABLE IF NOT EXISTS "Users" ("id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "userName"	varchar(50), "name"	varchar(50), "hashPass"	varchar(255), "disabled"	BOOLEAN, "active"	BOOLEAN );',
      [],
      resolve
    )
  )
  await new Promise(resolve =>
    db.run(
      'CREATE TABLE IF NOT EXISTS "BarCodes" ( "id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "name"	TEXT, "value"	TEXT );',
      [],
      resolve
    )
  )
  await new Promise(resolve =>
    db.run(
      'CREATE TABLE IF NOT EXISTS "Products" ( "id"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "name"	TEXT NOT NULL, "description"	TEXT, "sku"	TEXT NOT NULL, "thumbnail"	TEXT, "price"	INTEGER NOT NULL, "stock"	INTEGER NOT NULL, "minStock"	INTEGER, "isPackage"	INTEGER NOT NULL, "piecesPerPackage"	INTEGER, "active"	BOOLEAN );',
      [],
      resolve
    )
  )
  await new Promise(resolve =>
    db.run(
      'CREATE TABLE IF NOT EXISTS "Sales" ( "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "id_user" INTEGER NOT NULL, "id_product" INTEGER NOT NULL, "date" TEXT NOT NULL, "count" INTEGER NOT NULL, "total" INTEGER NOT NULL );',
      [],
      resolve
    )
  )
  db.close(() => {
    const auth: Auth = {
      enter: async (userName, password, isAdmin) => {
        if (isAdmin) {
          const contentFile = fs.readFileSync(pathAuthFile, { encoding: 'utf8' })
          const result = Encryptor.decode(contentFile, password)
          if (result === userName) {
            ipcRenderer.sendSync('open-main-window')
          } else {
            throw new Error("El nombre de usuario o la cotraseña es incorrecta!")
          }
        } else {
          const db: Database = new sqlite3.Database(pathDatabase)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result: any = await new Promise((resolve, reject) => 
            db.on('open', () => db.get('select * from "Users" where userName = ?', [userName], (error, rows) => {
              if (error) {
                reject(error)
              } else {
                resolve(rows)
              }
            }))
          )
          db.close()
          if (result) {
            if (result.disabled) {
              throw new Error(`El usuario "${userName}" está deshabilitado!`)
            } else {
              const hashDecode = Encryptor.decode(result.hashPass, password)
              if (hashDecode === userName) {
                delete result.hashPass
                ipcRenderer.sendSync('open-checkout-box-window', result)
              } else {
                throw new Error('La contraseña es incorrecta!')
              }
            }
          } else {
            throw new Error(`El usuario "${userName}" no existe!`)
          }
        }
      }
    }
    contextBridge.exposeInMainWorld('auth', auth)
  })
})
export type Auth = {
  enter: (userName: string, password: string, isAdmin: boolean) => Promise<void>
}