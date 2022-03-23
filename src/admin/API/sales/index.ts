import fs from 'fs'
import { contextBridge, ipcRenderer } from 'electron'
import { SalesAPI, Sale } from './types'
import { RunDB } from './../types'
export default (runDB: RunDB) => {
  const salesAPI: SalesAPI = {
    find: async (range) => {
      let where = 'true'
      if (Array.isArray(range)) {
        where = `DATE(Sales.date) >= Date("${range[0]}") AND Date(Sales.date) <= Date("${range[1]}")`
      }
      if (typeof range === 'string' && range !== '') {
        where = `DATE(Sales.date) = Date("${range}")`
      }
      const results = await runDB<Sale[]>(db => new Promise(resolve =>
        db.all(
          `SELECT Sales.id, Sales.id_user as idUser, Sales.date, Users.name as userName, Products.name as productName, Sales.date, Sales.count, Sales.total FROM Sales INNER JOIN Users, Products On Sales.id_user = Users.id AND Sales.id_product = Products.id WHERE ${where}`,
          [],
          (_, rows) => resolve(rows)
        )
      ))
      return results.map(result => ({ ...result, date: result.date }))
    },
    export: data => {
      const pathXlsx = ipcRenderer.sendSync('open-save-dialog', [{ name: 'Comprimido', extensions: ['xlsx'] }])
      if (pathXlsx) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const json2xls = require('json2xls')
        const xls = json2xls(data.map(item => ({
          Usuario: item.userName,
          Producto: item.productName,
          Fecha: item.date.split(' ')[0],
          Hora: (segmentsHours => `${segmentsHours[0]}:${segmentsHours[1]}`)(item.date.split(' ')[1].split(':')),
          Cantidad: item.count,
          Total: item.total
        })))
        fs.writeFileSync(pathXlsx, xls, 'binary')
      }
    }
  }
  contextBridge.exposeInMainWorld('salesAPI', salesAPI)
}