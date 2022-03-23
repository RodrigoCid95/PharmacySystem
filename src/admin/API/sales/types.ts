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
  idUser: number
  userName: string
  productName: string
  date: string
  count: number
  total: number
}
export type SalesAPI = {
  find: (range: string[] | string) => Promise<Sale[]>
  export: (data: Sale[]) => void
}