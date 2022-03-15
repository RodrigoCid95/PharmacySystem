import { BarCodesAPI } from './types'
import { contextBridge, ipcRenderer } from "electron"
import { Database } from 'sqlite3'
import fs from 'fs'
const NAME_TABLE = 'BarCodes'
export default (db: Database) => {
  const barCodesAPI: BarCodesAPI = {
    create: ({ name, value }) => new Promise((resolve, reject) => {
      db.run(`insert into "${NAME_TABLE}" (name, value) values (?, ?)`, [name, value], (error) => {
        if (error) {
          reject()
        } else {
          resolve()
        }
      })
    }),
    read: () => new Promise((resolve, reject) => {
      db.all(`select * from "${NAME_TABLE}"`, (error, rows) => {
        if (error) {
          reject()
        } else {
          resolve(rows)
        }
      })
    }),
    update: ({ name, value }) => new Promise((resolve, reject) => {
      db.run(`update "${NAME_TABLE}" set name = ?, value = ?`, [name, value], error => {
        if (error) {
          reject()
        } else {
          resolve()
        }
      })
    }),
    delete: id => new Promise((resolve, reject) => {
      db.run(`delete from "${NAME_TABLE}" where id = ?`, [id], error => {
        if (error) {
          reject()
        } else {
          resolve()
        }
      })
    }),
    saveFromDisk: async (canvas) => {
      const data = await fetch(canvas.toDataURL()).then(res => res.arrayBuffer())
      const res = ipcRenderer.sendSync('open-save-dialog', [{ name: 'Imágenes', extensions: ['png'] }])
      if (res) {
        fs.writeFileSync(res, Buffer.from(data))
      }
    }
  }
  contextBridge.exposeInMainWorld('barCodes', barCodesAPI)
}