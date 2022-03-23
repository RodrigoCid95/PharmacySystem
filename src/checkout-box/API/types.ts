import { Database } from "sqlite3";
export type RunDB = <T = void>(callback: (db: Database) => Promise<T>) => Promise<T>
export type Product = {
  id: number
  name: string
  description: string
  sku: string
  thumbnail: string
  price: number
  stock: number
  minStock: number
  isPackage: boolean
  piecesPerPackage: number
  realStock: number
}
export interface Item extends Product {
  count: number
  subTotal: number
}
export type DataSale = {
  id?: number
  id_user: number
  id_product: number
  date: string
  count: number
  total: number
}
export type Sale = {
  id: number
  id_product: number
  date: string
  nameProduct: string
  count: number
  total: number
}
export type CheckoutAPI = {
  findProduct: (value: string, searchType: boolean) => Promise<Product[]>
  checkout: (products: Item[], idUser: number) => Promise<void>
  getSales: (idUser: number) => Promise<Sale[]>
  cancelSale: (sale: Sale) => Promise<void>
}
export default null