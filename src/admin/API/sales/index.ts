import fs from 'fs'
import { contextBridge, ipcRenderer } from 'electron'
import { SalesAPI, Datum, DataDatum } from './types'
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
      const results = await runDB<Datum[]>(db => new Promise(resolve =>
        db.all(
          `SELECT Sales.id, Sales.id_user as idUser, Sales.date, Users.name as userName, Products.name as productName, Sales.date, Sales.count, Sales.total FROM Sales INNER JOIN Users, Products On Sales.id_user = Users.id AND Sales.id_product = Products.id WHERE ${where}`,
          [],
          (_, rows: DataDatum[]) => {
            const data: Datum[] = []
            for (const row of rows) {
              const sale = {
                productName: row.productName,
                date: (d => {
                  const s = d.split(' ')
                  return {
                    day: s[0],
                    hour: s[1]
                  }
                })(row.date),
                count: row.count,
                total: row.total
              }
              const index = data.findIndex(d => d.idUser === row.idUser)
              if (index > -1) {
                data[index].sales.push(sale)
              } else {
                data.push({
                  idUser: row.idUser,
                  userName: row.userName,
                  sales: [sale]
                })
              }
            }
            resolve(data)
          }
        )
      ))
      return results
    },
    export: data => {
      const pathXlsx = ipcRenderer.sendSync('open-save-dialog', [{ name: 'Libro', extensions: ['xlsx'] }])
      if (pathXlsx) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const json2xls = require('json2xls')
        const table = []
        for (const datum of data) {
          for (const sale of datum.sales) {
            table.push({
              Usuario: datum.userName,
              Producto: sale.productName,
              Fecha: sale.date.day,
              Hora: sale.date.hour,
              Cantidad: sale.count,
              Total: sale.total
            })
          }
        }
        const xls = json2xls(table)
        fs.writeFileSync(pathXlsx, xls, 'binary')
      }
    }
  }
  contextBridge.exposeInMainWorld('salesAPI', salesAPI)
}