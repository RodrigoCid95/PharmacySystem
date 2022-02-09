import { contextBridge, ipcRenderer } from 'electron'
import fs from 'fs'
import path from 'path'
import archiver from 'archiver'
import unzipper from 'unzipper'
import { Database } from 'sqlite3'
import { AppAPI } from './types'
import { Product } from '../products/types'
import { BarCode } from '../barCodes/types'
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
        const productList = await new Promise(resolve => db.all('select * from "Products"', (error, rows) => resolve(rows)))
        const strProductList = JSON.stringify(productList)
        archive.append(strProductList, { name: 'products.json' })
        const barCodeList = await new Promise(resolve => db.all('select * from "BarCodes"', (error, rows) => resolve(rows)))
        const strBarCodeList = JSON.stringify(barCodeList)
        archive.append(strBarCodeList, { name: 'barCodes.json' })
        for (const img of fs.readdirSync(pathImages)) {
          archive.file(path.resolve(pathImages, img), { name: 'ps-images/' + img })
        }
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
        const dataProducts: Product[] = JSON.parse(fs.readFileSync(pathProducts, { encoding: 'utf-8' }))
        const dataBarCodes: BarCode[] = JSON.parse(fs.readFileSync(pathBarCodes, { encoding: 'utf-8' }))
        await new Promise(resolve => db.run('delete from "Products"', resolve))
        await new Promise(resolve => db.run('delete from "BarCodes"', resolve))
        for (const product of dataProducts) {
          await new Promise(resolve =>
            db.run(
              'insert into "Products" (name, description, sku, thumbnail, price, stock, minStock, isPackage, piecesPerPackage, realStock) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [product.name, product.description, product.sku, product.thumbnail, product.price, product.stock, product.minStock, product.isPackage, product.piecesPerPackage, product.realStock],
              resolve
            )
          )
        }
        for (const barCode of dataBarCodes) {
          await new Promise(resolve =>
            db.run(
              'insert into "BarCodes" (name, value) values (?, ?)',
              [barCode.name, barCode.value],
              resolve
            )
          )
        }
        fs.unlinkSync(pathProducts)
        fs.unlinkSync(pathBarCodes)
      }
    }
  }
  contextBridge.exposeInMainWorld('app', appAPI)
}