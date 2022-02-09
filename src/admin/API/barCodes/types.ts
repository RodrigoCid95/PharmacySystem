export type BarCode = {
  id: string
  name: string
  value: string
}
export type BarCodesAPI = {
  create: (barCode: BarCode) => Promise<void>
  read: () => Promise<BarCode[]>
  update: (barCode: BarCode) => Promise<void>
  delete: (id: BarCode['id']) => Promise<void>
  saveFromDisk: (canvas: HTMLCanvasElement) => void
}
export default null