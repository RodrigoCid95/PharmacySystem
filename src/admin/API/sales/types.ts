export type DataSale = {
  id?: number
  id_user: number
  id_product: number
  date: string
  count: number
  total: number
}
export type DataDatum = {
  idUser: number
  userName: string
  productName: string
  date: string
  count: number
  total: number
}
export type Sale = {
  productName: string
  date: {
    day: string
    hour: string
  }
  count: number
  total: number
}
export type Datum = {
  idUser: number
  userName: string
  sales: Sale[]
}
export type SalesAPI = {
  find: (range: string[] | string) => Promise<Datum[]>
  export: (data: Datum[]) => void
}