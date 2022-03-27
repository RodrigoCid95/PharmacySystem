import React from 'react'
import { Stack } from '@fluentui/react/lib/Stack'
import { INavLink, Nav } from '@fluentui/react/lib/Nav'
import { DetailsList, IColumn, IGroup } from '@fluentui/react/lib/DetailsList'
import { DefaultButton } from '@fluentui/react/lib/Button'
import { mergeStyles } from '@fluentui/react/lib/Styling'
import { SalesAPI, Datum, Sale } from '../API/sales/types'
import Filter from '../components/filter'
import { VictoryChart, VictoryGroup, VictoryLine, VictoryScatter, VictoryTooltip, VictoryVoronoiContainer } from 'victory'
declare const salesAPI: SalesAPI
interface DatumItem extends Datum {
  color: string
}
interface IndexPageState {
  idUser: number
}
export default class IndexPage extends React.Component<object, IndexPageState> {
  private data: DatumItem[]
  constructor(props: object) {
    super(props)
    this.state = {
      idUser: NaN
    }
    this.data = []
    this.findSales = this.findSales.bind(this)
  }
  componentDidMount() {
    this.findSales('')
  }
  private async findSales(dates: string[] | string) {
    this.data = (await salesAPI.find(dates)).map(item => ({ ...item, color: '#' + Math.floor(Math.random() * 16777215).toString(16) }))
    this.setState({ idUser: NaN })
  }
  private getItemsAndGroups(): { items: Sale[]; groups: IGroup[], lines: { idUser: number; userName: string; color: string; data: { x: string; y: number }[] }[] } {
    const { idUser } = this.state
    const sales: Sale[] = []
    const data = isNaN(idUser) ? this.data : [this.data[idUser]]
    const usersPreGrouped: {
      idUser: number
      userName: string
      count: number
      total: number
    }[] = []
    const daysPreGrouped: {
      idUser: number
      color: string
      day: string
      userName: string
      count: number
      total: number
    }[] = []
    for (const datum of data) {
      let count = 0
      let total = 0
      datum.sales.forEach(sale => {
        sales.push(sale)
        count++
        total += sale.total
        const index = daysPreGrouped.findIndex(dpg => dpg.idUser === datum.idUser && dpg.day === sale.date.day)
        if (index > -1) {
          daysPreGrouped[index].count++
          daysPreGrouped[index].total += sale.total
        } else {
          daysPreGrouped.push({
            idUser: datum.idUser,
            color: datum.color,
            day: sale.date.day,
            userName: datum.userName,
            count: 1,
            total: sale.total
          })
        }
      })
      usersPreGrouped.push({
        idUser: datum.idUser,
        userName: datum.userName,
        count,
        total
      })
    }
    const userGroups: IGroup[] = []
    const dayGroups: IGroup[] = []
    usersPreGrouped.forEach((userPreGroup, i) => {
      userGroups.push({
        key: i.toString(),
        name: `${userPreGroup.userName} - Vendido: ${userPreGroup.total}`,
        startIndex: userGroups.length === 0 ? 0 : (userGroups[userGroups.length - 1].startIndex + userGroups[userGroups.length - 1].count),
        count: userPreGroup.count,
        level: 0,
        isCollapsed: true
      })
      const daysPreGroupedFilter = daysPreGrouped.filter(dpg => dpg.idUser === userPreGroup.idUser)
      daysPreGroupedFilter.forEach((dayPreGroup, i2) => {
        dayGroups.push({
          key: `${i.toString()}-${i2.toString()}`,
          name: `${dayPreGroup.day} - Vendido: ${dayPreGroup.total}`,
          startIndex: dayGroups.length === 0 ? 0 : (dayGroups[dayGroups.length - 1].startIndex + dayGroups[dayGroups.length - 1].count),
          count: dayPreGroup.count,
          level: 1,
          isCollapsed: true
        })
      })
    })
    const groups: IGroup[] = []
    userGroups.forEach((group, i) => {
      groups.push(group)
      dayGroups.filter(g => g.key.split('-')[0] === i.toString()).forEach(g => groups.push(g))
    })
    const lines: { idUser: number; userName: string; color: string; data: { x: string; y: number }[] }[] = []
    daysPreGrouped.forEach(dg => {
      const index = lines.findIndex(l => l.idUser === dg.idUser)
      if (index > -1) {
        lines[index].data.push({
          x: dg.day,
          y: dg.total
        })
      } else {
        lines.push({
          idUser: dg.idUser,
          userName: dg.userName,
          color: dg.color,
          data: [{
            x: dg.day,
            y: dg.total
          }]
        })
      }
    })
    return {
      items: sales,
      groups,
      lines
    }
  }
  render() {
    const { items, groups, lines } = this.getItemsAndGroups.bind(this)()
    return (
      <Stack className={mergeStyles({ flexDirection: 'row', maxHeight: '100%' })}>
        <Stack>
          <Filter
            onChange={this.findSales}
          />
          {this.data.length > 0 && (
            <DefaultButton
              text='Exportar registros'
              onClick={() => salesAPI.export(isNaN(this.state.idUser) ? this.data : [this.data[this.state.idUser]])}
            />
          )}
          {this.data.length > 0 && (
            <Nav
              className={mergeStyles({ marginTop: '1rem' })}
              groups={[{
                links: [
                  ...this.data.map((datum, index) => ({
                    key: index.toString(),
                    name: datum.userName,
                    url: '#',
                    onClick: () => this.setState({ idUser: index }),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ref: (e: any) => {
                      if (e) {
                        e.querySelector('.ms-Nav-linkText').style.color = datum.color
                      }
                    }
                  })),
                  ...(() => {
                    const linkAllUsers: INavLink[] = []
                    if (this.data.length > 2) {
                      linkAllUsers.push({
                        key: 'all-users',
                        name: 'Todos los usuarios',
                        url: '#',
                        onClick: () => this.setState({ idUser: NaN })
                      })
                    }
                    return linkAllUsers
                  })()
                ]
              }]}
            />
          )}
        </Stack>
        {this.data.length > 0 && (
          <Stack horizontal className={mergeStyles({ width: '100%' })}>
            <DetailsList
              items={items}
              groups={groups}
              columns={[
                { key: 'date', name: 'Fecha y hora', fieldName: 'date', minWidth: 150, maxWidth: 150 },
                { key: 'productName', name: 'Producto', fieldName: 'productName', minWidth: 100, maxWidth: 200 },
                { key: 'count', name: 'Cantidad', fieldName: 'count', minWidth: 80, maxWidth: 80 },
                { key: 'total', name: 'Total', fieldName: 'total', minWidth: 80, maxWidth: 80 },
              ]}
              selectionMode={0}
              onRenderItemColumn={(item: Sale, _?: number, column?: IColumn) => {
                if (column) {
                  const fieldContent = item[column.fieldName as keyof Sale];
                  switch (column.key) {
                    case 'date': {
                      if (typeof fieldContent === 'object') {
                        const d = fieldContent.day.split('-').map(i => parseInt(i))
                        const h = fieldContent.hour.split(':').map(i => parseInt(i))
                        const date = new Date(d[0], (d[1] - 1), d[2], h[0], h[1])
                        return <span>{date.toLocaleDateString()} - {date.toLocaleTimeString()}</span>
                      }
                      break
                    }
                    case 'total':
                      return <span>${fieldContent}</span>
                    default:
                      return <span>{fieldContent}</span>
                  }
                }
              }}
            />
            <VictoryChart
              containerComponent={<VictoryVoronoiContainer style={{ width: '50%', height: 'auto', padding: '2%' }} />}
            >
              {lines.map(line => (
                <VictoryGroup
                  key={line.idUser}
                  color={line.color}
                  labels={({ datum }) => `${line.userName}: $${datum.y}`}
                  labelComponent={
                    <VictoryTooltip
                      style={{ fontSize: 10 }}
                    />
                  }
                  data={line.data}
                >
                  <VictoryLine />
                  <VictoryScatter
                    size={({ active }) => active ? 8 : 3}
                  />
                </VictoryGroup>
              ))}
            </VictoryChart>
          </Stack>
        )}
      </Stack>
    )
  }
}