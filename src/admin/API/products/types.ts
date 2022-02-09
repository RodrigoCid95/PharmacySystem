export type Product = {
  id: string
  name: string
  description: string
  sku: string
  thumbnail?: string
  price: number
  stock: number
  minStock: number
  isPackage: boolean
  piecesPerPackage: number
  realStock: number
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