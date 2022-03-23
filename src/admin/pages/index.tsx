import React from 'react'
import { Stack } from '@fluentui/react/lib/Stack'
import { Nav } from '@fluentui/react/lib/Nav'
import { DetailsList, IColumn, IGroup } from '@fluentui/react/lib/DetailsList'
import { DefaultButton } from '@fluentui/react/lib/Button'
import { mergeStyles } from '@fluentui/react/lib/Styling'
import { SalesAPI, Sale } from '../API/sales/types'
import Filter from '../components/filter'
declare const salesAPI: SalesAPI
interface User {
  id: number
  name: string
}
interface Segment {
  date: string
  items: Sale[]
  total: number
}
interface IndexPageState {
  users: User[]
  items: Sale[]
  groups: IGroup[]
}
export default class IndexPage extends React.Component<object, IndexPageState> {
  private allItems: Sale[]
  private columns: IColumn[]
  constructor(props: object) {
    super(props)
    this.state = {
      users: [],
      items: [],
      groups: []
    }
    this.allItems = []
    this.columns = [
      { key: 'date', name: 'Hora', fieldName: 'date', minWidth: 100, maxWidth: 200, isResizable: true },
      { key: 'productName', name: 'Producto', fieldName: 'productName', minWidth: 100, maxWidth: 200, isResizable: true },
      { key: 'count', name: 'Cantidad', fieldName: 'count', minWidth: 100, maxWidth: 200, isResizable: true },
      { key: 'total', name: 'Total', fieldName: 'total', minWidth: 100, maxWidth: 200, isResizable: true },
    ]
  }
  private async findSales(dates: string[] | string) {
    const items = await salesAPI.find(dates)
    const users: User[] = []
    items.forEach(({ idUser, userName }) => {
      if (users.findIndex(u => u.id === idUser) === -1) {
        users.push({
          id: idUser,
          name: userName
        })
      }
    })
    this.allItems = items
    this.setState({ users, items: [], groups: [] })
  }
  private _setSegments(idUser: User['id']) {
    const preFilter: Sale[] = this.allItems.filter(i => i.idUser === idUser)
    const segments: Segment[] = []
    for (const item of preFilter) {
      const index = segments.findIndex(i => i.date === item.date)
      if (index === -1) {
        const items = preFilter.filter(i => i.date === item.date)
        segments.push({
          date: item.date,
          items,
          total: (() => {
            let total = 0
            for (const item of items) {
              total += item.total
            }
            return total
          })()
        })
      }
    }
    let items: Sale[] = []
    const groups: IGroup[] = []
    segments.forEach((segment, i) => {
      groups.push({ key: i.toString(), name: `Fecha: ${segment.date} - Vendido: $${segment.total}`, startIndex: items.length, count: segment.items.length, level: 0 })
      items = items.concat(segment.items)
    })
    this.setState({ items, groups })
  }
  render() {
    const { users, items, groups } = this.state
    return (
      <Stack horizontal>
        <Stack>
          <Filter
            onChange={this.findSales.bind(this)}
          />
          {users.length > 0 && (
            <DefaultButton
              text='Exportar registros'
              onClick={() => {
                const data: Sale[] = this.state.items.length > 0 ? this.state.items : this.allItems
                salesAPI.export(data)
              }}
            />
          )}
          {users.length > 0 && (
            <Nav
              className={mergeStyles({ marginTop: '1rem' })}
              groups={[{
                links: users.map(user => ({
                  key: user.id.toString(),
                  name: user.name,
                  url: '#',
                  onClick: () => this._setSegments(user.id)
                }))
              }]}
            />
          )}
        </Stack>
        <Stack>
          {items.length > 0 && (
            <DetailsList
              items={items}
              groups={groups}
              columns={this.columns}
              groupProps={{
                showEmptyGroups: true,
              }}
              selectionMode={0}
              onRenderItemColumn={(item: Sale, _?: number, column?: IColumn) => {
                if (column) {
                  const fieldContent = item[column.fieldName as keyof Sale] as string;
                  switch (column.key) {
                    case 'date': {
                      const date = new Date(fieldContent.split(' ')[0])
                      return <span>{date.toLocaleTimeString()}</span>
                    }
                    case 'total':
                      return <span>${fieldContent}</span>
                    default:
                      return <span>{fieldContent}</span>
                  }
                }
              }}
            />
          )}
        </Stack>
      </Stack>
    )
  }
}