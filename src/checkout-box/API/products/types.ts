export type Product = {
  id: string
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
export type ProductsAPI = {
  find: (value: string, searchType: boolean) => Promise<Product[]>
}
export default null