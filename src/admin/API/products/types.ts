export type Product = {
  id: number
  name: string
  description: string
  sku: string
  thumbnail?: string
  price: number
  stock: number
  minStock: number
  isPackage: boolean
  piecesPerPackage: number
}
export interface DataProduct extends Product {
  active: boolean
}
export type ProductsAPI = {
  create: (product: Product) => Promise<void>
  read: () => Promise<Product[]>
  update: (product: Product) => Promise<void>
  delete: (id: Product['id']) => Promise<void>
  selectImage: (callback: (data: string) => void) => void
  updateThumbnail: (product: Product, newThumbnail: string) => Promise<string>
}
export default null