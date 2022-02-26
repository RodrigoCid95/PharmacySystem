import { contextBridge, ipcRenderer } from "electron"
import fs from 'fs'
import path from 'path'
import { Database } from 'sqlite3'
import { Encryptor } from "./../../encryptor"
const NAME_TABLE = 'Users'
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
const db: Database = new sqlite3.Database(pathDatabase)
db.run('CREATE TABLE IF NOT EXISTS "' + NAME_TABLE + '" ("id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "userName"	varchar(50), "name"	varchar(50), "hashPass"	varchar(255), "disabled"	BOOLEAN );')
const auth: Auth = {
  enter: async (userName, password, isAdmin) => {
    if (isAdmin) {
      if (userName === 'root') {
        if (password === 'root') {
          ipcRenderer.sendSync('open-main-window')
        } else {
          throw new Error("La contraseña es incorrecta!")
        }
      } else {
        throw new Error("Nombre de usuario incorrecto!")
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await new Promise((resolve, reject) => db.get('select * from "' + NAME_TABLE + '" where userName = ?', [userName], (error, rows) => {
        if (error) {
          reject(error)
        } else {
          resolve(rows)
        }
      }))
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
window.addEventListener('close', () => db.close())
export type Auth = {
  enter: (userName: string, password: string, isAdmin: boolean) => Promise<void>
}
export default null