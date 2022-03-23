import { contextBridge } from "electron"
import { Encryptor } from './../../../encryptor'
import { UsersAPI } from './types'
import { RunDB } from './../types'
export default (runDB: RunDB) => {
  const usersAPI: UsersAPI = {
    create: ({ name, userName, disabled }, password) => {
      const hashPassword = Encryptor.encode(userName, password)
      return runDB(db => new Promise(resolve =>
        db.run(
          'insert into "Users" (name, userName, hashPass, disabled, active) values (?, ?, ?, ?, ?) ',
          [name, userName, hashPassword, disabled, true],
          resolve
        )
      ))
    },
    read: () =>
      runDB(db => new Promise(resolve =>
        db.all(
          'select * from "Users" where active = true',
          (_, rows) =>
            resolve(rows || [])
        )
      )),
    update: async ({ id, name, userName, disabled }) =>
      runDB(db => new Promise(resolve =>
        db.run(
          'update "Users" set name = ?, userName =?, disabled = ? where id = ?',
          [name, userName, disabled, id],
          resolve
        )
      )),
    delete: id =>
      runDB(db => new Promise(resolve =>
        db.run(
          'update "Users" set active = ? where id = ?',
          [false, id],
          resolve
        )
      ))
  }
  contextBridge.exposeInMainWorld('users', usersAPI)
}