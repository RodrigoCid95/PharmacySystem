import fs from 'fs'
import { BarCode, BarCodesAPI } from './types'
import { contextBridge, ipcRenderer } from "electron"
import { RunDB } from './../types'

export default (runDB: RunDB) => {
  const barCodesAPI: BarCodesAPI = {
    create: ({ name, value }) => runDB(db => new Promise((resolve, reject) => {
      db.run(`insert into "BarCodes" (name, value) values (?, ?)`, [name, value], (error) => {
        if (error) {
          reject()
        } else {
          resolve()
        }
      })
    })),
    read: () => runDB<BarCode[]>(db => new Promise((resolve, reject) => {
      db.all(`select * from "BarCodes"`, (error, rows) => {
        if (error) {
          reject()
        } else {
          resolve(rows)
        }
      })
    })),
    update: ({ name, value }) => runDB(db => new Promise((resolve, reject) => {
      db.run(`update "BarCodes" set name = ?, value = ?`, [name, value], error => {
        if (error) {
          reject()
        } else {
          resolve()
        }
      })
    })),
    delete: id => runDB(db => new Promise((resolve, reject) => {
      db.run(`delete from "BarCodes" where id = ?`, [id], error => {
        if (error) {
          reject()
        } else {
          resolve()
        }
      })
    })),
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