import { ProductsAPI } from './types'
import { contextBridge } from 'electron'
import fs from 'fs'
import path from 'path'
import { Database } from 'sqlite3'
const NAME_TABLE = 'Products'
export default (db: Database) => {
  const productsAPI: ProductsAPI = {
    create: async ({ name, description, sku, thumbnail, price, stock, minStock, isPackage, piecesPerPackage, realStock }) => {
      await new Promise<void>((resolve) => {
        db.run(
          'insert into "' + NAME_TABLE + '" (name, description, sku, price, stock, minStock, isPackage, piecesPerPackage, realStock) values (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [name, description, sku, price, stock, minStock, isPackage, piecesPerPackage, realStock],
          resolve
        )
      })
      const { id } = await new Promise(resolve => {
        db.get('SELECT * FROM "' + NAME_TABLE + '" ORDER BY id DESC LIMIT 1', (error, row) => resolve(row))
      })
      if (thumbnail) {
        await productsAPI.updateThumbnail({ id, name, description, sku, thumbnail, price, stock, minStock, isPackage, piecesPerPackage, realStock }, thumbnail)
      }
    },
    read: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows: any[] = await new Promise(resolve => db.all('select * from "' + NAME_TABLE + '"', (error, rows) => resolve(rows)))
      return rows.map(({ id, name, description, sku, thumbnail, price, stock, minStock, isPackage, piecesPerPackage, realStock }) => {
        return { id: id.toString(), name, description, sku, thumbnail: (thumbnail ? '/ps-images/' + thumbnail : ''), price, stock, minStock, isPackage, piecesPerPackage, realStock }
      })
    },
    update: ({ id, name, description, sku, thumbnail, price, stock, minStock, isPackage, piecesPerPackage, realStock }) => {
      return new Promise(resolve => db.run(
        'update "' + NAME_TABLE + '" set name = ?, description = ?, sku = ?, thumbnail = ?, price = ?, stock = ?, minStock = ?, isPackage = ?, piecesPerPackage = ?, realStock = ? where id = ?',
        [name, description, sku, thumbnail, price, stock, minStock, isPackage, piecesPerPackage, realStock, id],
        resolve
      ))
    },
    delete: id => {
      return new Promise(resolve => {
        db.run('delete from "' + NAME_TABLE + '" where id = ?', [id], resolve)
      })
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
      const pathThumbnail = path.resolve(__dirname, '..', 'ps-images')
      if (!fs.existsSync(pathThumbnail)) {
        fs.mkdirSync(pathThumbnail, { recursive: true })
      }
      const fileName = product.id.toString() + '.png'
      const filePath = path.resolve(pathThumbnail, fileName)
      const data = await fetch(newThumbnail).then(res => res.arrayBuffer())
      fs.writeFileSync(filePath, Buffer.from(data))
      product.thumbnail = fileName
      await productsAPI.update(product)
      return fileName
    }
  }
  contextBridge.exposeInMainWorld('products', productsAPI)
}