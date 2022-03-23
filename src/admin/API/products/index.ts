import { contextBridge } from 'electron'
import fs from 'fs'
import path from 'path'
import { Product, ProductsAPI } from './types'
import { RunDB } from '../types'
export default (runDB: RunDB) => {
  const productsAPI: ProductsAPI = {
    create: async ({ name, description, sku, thumbnail, price, stock, minStock, isPackage, piecesPerPackage }) => {
      await runDB(db => new Promise<void>((resolve) => {
        db.run(
          `insert into "Products" (name, description, sku, price, stock, minStock, isPackage, piecesPerPackage, active) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [name, description, sku, price, stock, minStock, isPackage, piecesPerPackage, true],
          resolve
        )
      }))
      const { id } = await runDB<Product>(db => new Promise(resolve => {
        db.get(`SELECT * FROM "Products" ORDER BY id DESC LIMIT 1`, (_, row) => resolve(row))
      }))
      if (thumbnail) {
        await productsAPI.updateThumbnail({ id, name, description, sku, thumbnail, price, stock, minStock, isPackage, piecesPerPackage }, thumbnail)
      }
    },
    read: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows: any[] = await runDB(db => new Promise(resolve => db.all(`select * from "Products" where active = true`, (_, rows) => resolve(rows))))
      return rows.map(({ id, name, description, sku, thumbnail, price, stock, minStock, isPackage, piecesPerPackage, realStock }) => {
        return { id: id.toString(), name, description, sku, thumbnail: (thumbnail ? '/ps-images/' + thumbnail : ''), price, stock, minStock, isPackage, piecesPerPackage, realStock }
      })
    },
    update: ({ id, name, description, sku, thumbnail, price, stock, minStock, isPackage, piecesPerPackage }) => {
      return runDB(db => new Promise(resolve => db.run(
        `update "Products" set name = ?, description = ?, sku = ?, thumbnail = ?, price = ?, stock = ?, minStock = ?, isPackage = ?, piecesPerPackage = ? where id = ?`,
        [name, description, sku, thumbnail, price, stock, minStock, isPackage, piecesPerPackage, id],
        resolve
      )))
    },
    delete: id => {
      return runDB(db => new Promise(resolve => {
        db.run(`update "Products" set active = ? where id = ?`, [false, id], resolve)
      }))
    },
    selectImage: (callback) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/png'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      input.onchange = (ev: any) => {
        const file = ev.path[0].files[0]
        const reader = new FileReader()
        reader.onload = () => (reader.result && typeof reader.result === 'string') && callback(reader.result)
        reader.onerror = error => console.error(error)
        reader.readAsDataURL(file)
      }
      input.click()
    },
    updateThumbnail: async (product, newThumbnail) => {
      const pathThumbnail = path.join(__dirname, '..', 'ps-images')
      if (!fs.existsSync(pathThumbnail)) {
        fs.mkdirSync(pathThumbnail, { recursive: true })
      }
      const fileName = product.id.toString() + '.png'
      const filePath = path.join(pathThumbnail, fileName)
      const data = await fetch(newThumbnail).then(res => res.arrayBuffer())
      fs.writeFileSync(filePath, Buffer.from(data))
      product.thumbnail = fileName
      await productsAPI.update(product)
      return fileName
    }
  }
  contextBridge.exposeInMainWorld('products', productsAPI)
}