import React, { JSXElementConstructor } from 'react'
import { Stack } from '@fluentui/react/lib/Stack'
import { INavLink, Nav } from '@fluentui/react/lib/Nav'
import { DetailsList, IColumn, IGroup } from '@fluentui/react/lib/DetailsList'
import { DefaultButton } from '@fluentui/react/lib/Button'
import { mergeStyles } from '@fluentui/react/lib/Styling'
import { SalesAPI, Datum, Sale } from '../API/sales/types'
import Filter from '../components/filter'
import { LineChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts'
declare const salesAPI: SalesAPI
interface DatumItem extends Datum {
  color: {
    h: number
    s: number
  }
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
  private findSales(dates: string[] | string) {
    const getRandomNumber = (limit: number) => {
      return Math.floor(Math.random() * limit);
    }
    salesAPI.find(dates)
      .then(data => data.map(item => ({ ...item, color: {h: getRandomNumber(360), s: getRandomNumber(100), l: getRandomNumber(100)} })))
      .then(data => {
        this.data = data
        this.setState({idUser: NaN})
      })
      .catch(error => console.error(error))
  }
  private getItemsAndGroups(): { items: Sale[]; groups: IGroup[], lines: { idUser: number; name: string; color: { h: number; s: number; }; data: { date: string; value: number }[] }[] } {
    const { idUser } = this.state
    const sales: Sale[] = []
    const data = Number.isNaN(idUser) ? this.data : [this.data[idUser]]
    const usersPreGrouped: {
      idUser: number
      userName: string
      count: number
      total: number
    }[] = []
    const daysPreGrouped: {
      idUser: number
      color: {
        h: number
        s: number
      }
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
    const lines: { idUser: number; name: string; color: { h: number; s: number; }; data: { date: string; value: number }[] }[] = []
    daysPreGrouped.forEach(dg => {
      const index = lines.findIndex(l => l.idUser === dg.idUser)
      if (index > -1) {
        lines[index].data.push({
          date: dg.day,
          value: dg.total
        })
      } else {
        lines.push({
          idUser: dg.idUser,
          name: dg.userName,
          color: dg.color,
          data: [{
            date: dg.day,
            value: dg.total
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
              onClick={() => salesAPI.export(Number.isNaN(this.state.idUser) ? this.data : [this.data[this.state.idUser]])}
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
                        e.querySelector('.ms-Nav-linkText').style.backgroundColor = `hsl(${datum.color.h}deg, ${datum.color.s}%, 25%)`
                        e.querySelector('.ms-Nav-linkText').style.color = "#fff"
                        e.querySelector('.ms-Nav-linkText').style.padding = '0 1rem'
                      }
                    }
                  })),
                  ...(() => {
                    const linkAllUsers: INavLink[] = []
                    if (this.data.length > 1) {
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
            <ResponsiveContainer width="60%" height="100%">
              <LineChart
                width={500}
                height={300}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" type="category" allowDuplicatedCategory={false} tick={<CustomizedAxisTick />} />
                <YAxis dataKey="value" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {lines.map(s => {
                  const props: any = {
                    dataKey: 'value',
                    data: s.data,
                    name: s.name,
                    key: s.name,
                    type: 'monotone',
                    stroke: `hsl(${s.color.h}deg, ${s.color.s}%, 25%)`,
                    label: <CustomizedLabel />
                  }
                  return <Line {...props} />
                })}
                </LineChart>
            </ResponsiveContainer>
          </Stack>
        )}
      </Stack>
    )
  }
}

type CustomComponent = {
  x?: number
  y?: number
  stroke?: string
  value?: string
  payload?: any
  active?: boolean
  label?: string
}

const CustomizedLabel: React.FC<CustomComponent> = ({x, y, stroke, value}) => (
  <text x={x} y={y} dy={-4} fill={stroke} fontSize={10} textAnchor="middle" style={{ fontSize: '1rem' }}>
    ${value}
  </text>
)

const CustomizedAxisTick: React.FC<CustomComponent> = ({ x, y, payload }) => (
  <g transform={`translate(${x},${y})`}>
    <text x={0} y={0} dy={16} textAnchor="middle" fill="#666">
      {payload.value}
    </text>
  </g>
)

const CustomTooltip: React.FC<CustomComponent> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`${payload[0].name}: $${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
}
