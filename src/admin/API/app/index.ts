import { contextBridge, ipcRenderer } from 'electron'
import fs from 'fs'
import path from 'path'
import archiver from 'archiver'
import unzipper from 'unzipper'
import { Database } from 'sqlite3'
import { Encryptor } from './../../../encryptor'
import { AppAPI } from './types'
import { DataProduct } from './../products/types'
import { BarCode } from './../barCodes/types'
import { DataUser } from './../users/types'
import { Buy } from './../buys/types'
const pathAuthFile = path.resolve(__dirname, '..', 'us.a')
export default (db: Database) => {
  const appAPI: AppAPI = {
    // eslint-disable-next-line no-async-promise-executor
    createBackup: () => new Promise(async resolve => {
      const pathZip = ipcRenderer.sendSync('open-save-dialog', [{ name: 'Comprimido', extensions: ['zip'] }])
      if (pathZip) {
        const pathImages = path.resolve(__dirname, '..', 'ps-images')
        const output = fs.createWriteStream(pathZip)
        const archive = archiver('zip')
        output.on('close', function () {
          console.log(archive.pointer() + ' bytes en total!')
          console.log('El archivador se ha finalizado y el descriptor del archivo de salida se ha cerrado.')
          resolve()
        })
        output.on('end', function () {
          console.log('Los datos han sido drenados')
        })
        archive.on('warning', function (err) {
          if (err.code === 'ENOENT') {
            console.warn(err)
          } else {
            throw err;
          }
        })
        archive.on('error', function (err) {
          throw err
        })
        archive.pipe(output)
        const productList = await new Promise(resolve => db.all('select * from "Products"', (_, rows) => resolve(rows)))
        const strProductList = JSON.stringify(productList)
        archive.append(strProductList, { name: 'products.json' })
        const barCodeList = await new Promise(resolve => db.all('select * from "BarCodes"', (_, rows) => resolve(rows)))
        const strBarCodeList = JSON.stringify(barCodeList)
        archive.append(strBarCodeList, { name: 'barCodes.json' })
        const usersList = await new Promise(resolve => db.all('select * from "Users"', (_, rows) => resolve(rows)))
        const strUsersList = JSON.stringify(usersList)
        archive.append(strUsersList, { name: 'users.json' })
        const buyList = await new Promise(resolve => db.all('select * from "Buys"', (_, rows) => resolve(rows)))
        const strBuyList = JSON.stringify(buyList)
        archive.append(strBuyList, { name: 'buys.json' })
        for (const img of fs.readdirSync(pathImages)) {
          archive.file(path.resolve(pathImages, img), { name: 'ps-images/' + img })
        }
        archive.file(pathAuthFile, { name: 'us.a' })
        archive.finalize()
      } else {
        resolve()
      }
    }),
    restoreBackup: async () => {
      const dirExtract = path.resolve(__dirname, '..')
      const pathZip = ipcRenderer.sendSync('open-open-dialog', [{ name: 'Comprimido', extensions: ['zip'] }])
      if (pathZip) {
        await unzipper.Open.file(pathZip)
          .then(d => d.extract({ path: dirExtract, concurrency: 5 }))
        const pathImages = path.resolve(dirExtract, 'ps-images')
        if (!fs.existsSync(pathImages)) {
          throw new Error('El archivo de respaldo es inválido!')
        }
        const pathProducts = path.resolve(dirExtract, 'products.json')
        if (!fs.existsSync(pathProducts)) {
          throw new Error('El archivo de respaldo es inválido!')
        }
        const pathBarCodes = path.resolve(dirExtract, 'barCodes.json')
        if (!fs.existsSync(pathBarCodes)) {
          throw new Error('El archivo de respaldo es inválido!')
        }
        const pathUsers = path.resolve(dirExtract, 'users.json')
        if (!fs.existsSync(pathUsers)) {
          throw new Error('El archivo de respaldo es inválido!')
        }
        const pathBuys = path.resolve(dirExtract, 'buys.json')
        if (!fs.existsSync(pathBuys)) {
          throw new Error('El archivo de respaldo es inválido!')
        }
        await new Promise(resolve => db.run('delete from "sqlite_sequence"', resolve))
        const dataProducts: DataProduct[] = JSON.parse(fs.readFileSync(pathProducts, { encoding: 'utf8' }))
        const dataBarCodes: BarCode[] = JSON.parse(fs.readFileSync(pathBarCodes, { encoding: 'utf8' }))
        const dataUsers: DataUser[] = JSON.parse(fs.readFileSync(pathUsers, { encoding: 'utf8' }))
        const dataBuys: Buy[] = JSON.parse(fs.readFileSync(pathBuys, { encoding: 'utf8' }))
        await new Promise(resolve => db.run('delete from "Products"', resolve))
        await new Promise(resolve => db.run('delete from "BarCodes"', resolve))
        await new Promise(resolve => db.run('delete from "Users"', resolve))
        await new Promise(resolve => db.run('delete from "Buys"', resolve))
        for (const { id, name, description, sku, thumbnail, price, stock, minStock, isPackage, piecesPerPackage } of dataProducts) {
          await new Promise(resolve =>
            db.run(
              'insert into "Products" (id, name, description, sku, thumbnail, price, stock, minStock, isPackage, piecesPerPackage, active) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [id, name, description, sku, thumbnail, price, stock, minStock, isPackage, piecesPerPackage, true],
              resolve
            )
          )
        }
        for (const { id, name, value } of dataBarCodes) {
          await new Promise(resolve =>
            db.run(
              'insert into "BarCodes" (name, value) values (?, ?, ?)',
              [id, name, value],
              resolve
            )
          )
        }
        for (const { id, name, userName, hashPassword, disabled } of dataUsers) {
          await new Promise(resolve =>
            db.run(
              'insert into "Users" (id, userName, name, hashPassword, disabled, active) values(?, ?, ?, ?, ?, ?)',
              [id, name, userName, hashPassword, disabled, true],
              resolve
            )
          )
        }
        for (const { id, id_user, id_product, date, count, total } of dataBuys) {
          await new Promise(resolve =>
            db.run(
              'insert into "Buys" (id, id_user, id_product, date, count, total) values (?, ?, ?, ?, ?, ?)',
              [id, id_user, id_product, date, count, total],
              resolve
            )
          )
        }
        fs.unlinkSync(pathProducts)
        fs.unlinkSync(pathBarCodes)
        fs.unlinkSync(pathUsers)
        fs.unlinkSync(pathBuys)
      }
    },
    changeCredentials: (userName, password) => {
      fs.writeFileSync(pathAuthFile, Encryptor.encode(userName, password), { encoding: 'utf8' })
    }
  }
  contextBridge.exposeInMainWorld('app', appAPI)
}