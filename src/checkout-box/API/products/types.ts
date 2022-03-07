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
export type Buy = {
  id?: number
  id_user: number
  id_product: number
  date: string
  count: number
  total: number
}
export type ProductsAPI = {
  find: (value: string, searchType: boolean) => Promise<Product[]>
  checkout: (products: Item[], idUser: number) => Promise<void>
}
export default null