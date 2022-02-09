import { UsersAPI } from './types'
import { contextBridge } from "electron"
import { Database } from 'sqlite3'
import { Encryptor } from './../../../encryptor'
const NAME_TABLE = 'Users'
export default (db: Database) => {
  const usersAPI: UsersAPI = {
    create: ({ name, userName, disabled }, password) => {
      const hashPassword = Encryptor.encode(userName, password)
      return new Promise(resolve =>
        db.run(
          'insert into "' + NAME_TABLE + '" (name, userName, hashPass, disabled) values (?, ?, ?, ?) ',
          [name, userName, hashPassword, disabled],
          resolve
        )
      )
    },
    read: () =>
      new Promise(resolve =>
        db.all(
          'select * from "' + NAME_TABLE + '"',
          (error, rows) =>
            resolve(rows || [])
        )
      ),
    update: async ({ id, name, userName, disabled }) =>
      new Promise(resolve =>
        db.run(
          'update "' + NAME_TABLE + '" set name = ?, userName =?, disabled = ? where id = ?',
          [name, userName, disabled, id],
          resolve
        )
      ),
    delete: id =>
      new Promise(resolve =>
        db.run(
          'delete from "' + NAME_TABLE + '" where id = ?',
          [id],
          resolve
        )
      )
  }
  contextBridge.exposeInMainWorld('users', usersAPI)
}