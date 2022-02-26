import { ProductsAPI } from './types'
import { contextBridge } from 'electron'
import { Database } from 'sqlite3'
const NAME_TABLE = 'Products'
export default (db: Database) => {
  const productsAPI: ProductsAPI = {
    find: async (value, searchType) => {
      return []
    }
  }
  contextBridge.exposeInMainWorld('products', productsAPI)
}