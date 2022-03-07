import { Buy, Product, ProductsAPI } from './types'
import { contextBridge } from 'electron'
import { Database } from 'sqlite3'
const NAME_PRODUCTS_TABLE = 'Products'
const NAME_BUYS_TABLE = 'Buys'
export default (db: Database) => {
  const productsAPI: ProductsAPI = {
    find: async (term, searchType) => {
      const query = `select * from ${NAME_PRODUCTS_TABLE} where active = true and ${searchType ? 'name' : 'sku'} like '%${term}%'`
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
      const mount = ((month) => month < 10 ? `0${month}` : month.toString())(date.getMonth())
      const day = (day => day < 10 ? `0${day}` : day.toString())(date.getDate())
      const hours = (hours => hours < 10 ? `0${hours}` : hours.toString())(date.getHours())
      const minutes = (minutes => minutes < 10 ? `0${minutes}` : minutes.toString())(date.getMinutes())
      const seconds = (seconds => seconds < 10 ? `0${seconds}` : seconds.toString())(date.getSeconds())
      const now = `${year}-${mount}-${day} ${hours}:${minutes}:${seconds}`
      for (const product of products) {
        await (({id_user, id_product, date, count, total}: Buy) => new Promise<void>(resolve => {
          db.run(
            `insert into ${NAME_BUYS_TABLE} (id_user, id_product, date, count, total) values(?, ?, ?, ?, ?)`,
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
    }
  }
  contextBridge.exposeInMainWorld('products', productsAPI)
}