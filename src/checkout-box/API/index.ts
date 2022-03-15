import fs from 'fs'
import path from 'path'
import { ipcRenderer, contextBridge } from 'electron'
import { Database } from 'sqlite3'
import { CheckoutAPI, Product, DataSale, Sale } from './types'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sqlite3 = require('sqlite3').verbose()
const pathDatabase = process.env.HOME ? path.join(process.env.HOME, 'ps.db') : path.resolve(__dirname, '..', 'ps.db')
const db: Database = new sqlite3.Database(pathDatabase)

if (!fs.existsSync(pathDatabase)) {
  fs.writeFileSync(pathDatabase, '', { encoding: 'utf-8' })
}

db.on('open', () => {
  const checkoutAPI: CheckoutAPI = {
    findProduct: async (term, searchType) => {
      const query = `select * from "Products" where active = true and ${searchType ? 'name' : 'sku'} like '%${term}%'`
      const result: Product[] = (await new Promise(resolve =>
        db.all(
          query,
          [],
          (_, rows) => {
            resolve(rows)
          }
        )
      ) as Product[]).map(item => {
        return {
          ...item,
          realStock: item.isPackage ? (() => {
            const segments = item.stock.toString().split('.')
            if (!segments[1]) {
              return item.stock * item.piecesPerPackage
            } else {
              const packages = parseInt(segments[0])
              const unitys = parseInt(segments[1]) + (packages * item.piecesPerPackage)
              return unitys
            }
          })() : item.stock
        }
      })
      return result
    },
    checkout: async (products, idUser) => {
      const date = new Date()
      const year = date.getFullYear().toString()
      const mount = ((month) => month < 10 ? `0${month}` : month.toString())(date.getMonth() + 1)
      const day = (day => day < 10 ? `0${day}` : day.toString())(date.getDate())
      const hours = (hours => hours < 10 ? `0${hours}` : hours.toString())(date.getHours())
      const minutes = (minutes => minutes < 10 ? `0${minutes}` : minutes.toString())(date.getMinutes())
      const seconds = (seconds => seconds < 10 ? `0${seconds}` : seconds.toString())(date.getSeconds())
      const now = `${year}-${mount}-${day} ${hours}:${minutes}:${seconds}`
      for (const product of products) {
        let newStock = 0
        if (product.isPackage) {
          product.realStock -= product.count
          const packages = Math.trunc((product.realStock / product.piecesPerPackage))
          const leftoverPieces = product.realStock - (packages * product.piecesPerPackage)
          newStock = parseFloat(`${packages}.${leftoverPieces}`)
        } else {
          newStock = product.stock - product.count
        }
        await ((idProduct: Product['id'], newStock: Product['stock']) => new Promise<void>(resolve => (
          db.run(
            'update "Products" set stock = ? where id = ?',
            [newStock, idProduct],
            (error) => {
              if (error) {
                throw error
              }
              resolve()
            }
          )
        )))(product.id, newStock)
        await (({ id_user, id_product, date, count, total }: DataSale) => new Promise<void>(resolve => {
          db.run(
            `insert into "Sales" (id_user, id_product, date, count, total) values(?, ?, ?, ?, ?)`,
            [id_user, id_product, date, count, total],
            (error => {
              if (error) {
                throw error
              }
              resolve()
            })
          )
        }))({
          id_user: idUser,
          id_product: product.id,
          date: now,
          count: product.count,
          total: product.subTotal
        })
      }
    },
    getSales: async (idUser) => {
      const date = new Date()
      const result = await new Promise<Sale[]>(resolve =>
        db.all(
          `SELECT Sales.id as "id", Sales.id_product as "id_product", Sales.date as "date", Products.name as "nameProduct", Sales.count as "count", Sales.total as "total" FROM Sales INNER JOIN Products ON Sales.id_product = Products.id WHERE Sales.id_user = ${idUser} AND Sales.date >= datetime("${date.getFullYear()}-${(m => m < 10 ? `0${m}` : m)(date.getMonth() + 1)}-${(d => d < 10 ? `0${d}` : d)(date.getDate())}")`,
          (_, rows) => resolve(rows)
        )
      )
      return result.reverse()
    },
    cancelSale: async (sale) => {
      const product: Product = await new Promise<Product>(resolve =>
        db.get(
          'SELECT * FROM "Products" WHERE id = ?',
          [sale.id_product],
          (_, row) => resolve(row)
        )
      )
      if (product.isPackage) {
        const segments = product.stock.toString().split('.')
        const packages = parseInt(segments[0])
        const unitys = segments[1] ? parseInt(segments[1]) : 0
        const realStock = ((packages * product.piecesPerPackage) + unitys) + sale.count
        const newPackages = Math.trunc((realStock / product.piecesPerPackage))
        const leftoverPieces = realStock - (newPackages * product.piecesPerPackage)
        product.stock = parseFloat(`${newPackages}.${leftoverPieces}`)
      } else {
        product.stock += sale.count
      }
      await new Promise<void>(resolve =>
        db.run(
          'UPDATE "Products" set stock = ? WHERE id = ?',
          [product.stock, product.id],
          resolve
        )  
      )
      await new Promise<void>(resolve =>
        db.run(
          'DELETE FROM "Sales" WHERE id = ?',
          [sale.id],
          resolve
        )  
      )
    }
  }
  contextBridge.exposeInMainWorld('checkout', checkoutAPI)
  contextBridge.exposeInMainWorld('getUser', () => {
    contextBridge.exposeInMainWorld('user', ipcRenderer.sendSync('get-user'))
  })
  window.addEventListener('close', () => db.close())
})