import React from 'react'
import { mergeStyles } from '@fluentui/react/lib/Styling'
import { TextField } from '@fluentui/react/lib/TextField'
import { DetailsList, DetailsListLayoutMode, IColumn, SelectionMode } from '@fluentui/react/lib/DetailsList'
import Alert from './alert'
import { CheckoutAPI, Sale } from './../API/types'
import { User } from './../../admin/API/users/types'
declare const checkout: CheckoutAPI
declare const user: User
interface CancelProps {
  onDismiss: () => void
}
interface CancelState {
  items: Sale[]
}
export default class Cancel extends React.Component<CancelProps, CancelState> {
  private allItems: Sale[]
  constructor(props: CancelProps) {
    super(props)
    this.state = {
      items: []
    }
    this.allItems = []
    this.loadSales = this.loadSales.bind(this)
  }
  private async loadSales() {
    const items = await checkout.getSales(user.id || 0)
    this.allItems = items
    this.setState({ items })
  }
  componentDidMount() {
    this.loadSales()
  }
  private async _onItemInvoked(item: Sale) {
    await checkout.cancelSale(item)
    this.loadSales()
  }
  private _onFilter(_: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text?: string) {
    this.setState({items: text ? this.allItems.filter(i => i.nameProduct.toLowerCase().indexOf(text.toLowerCase()) > -1) : this.allItems})
  }
  private _renderItemColumn(item: Sale, _?: number, column?: IColumn) {
    if (column) {
      const fieldContent = item[column.fieldName as keyof Sale] as string;
      if (column.key === 'date') {
        const date = new Date(fieldContent)
        return <span>{date.toLocaleTimeString()}</span>
      } else {
        return <span>{fieldContent}</span>
      }
    }
  }
  render() {
    const { items } = this.state
    const { onDismiss } = this.props
    return (
      <Alert
        title='Cancelar venta'
        onDismiss={onDismiss}
      >
        <TextField
          className={mergeStyles({
            display: 'block',
            marginBottom: '10px',
          })}
          label="Filtrar por nombre:"
          underlined
          onChange={this._onFilter.bind(this)}
          styles={{ root: { maxWidth: '300px' } }}
        />
        <DetailsList
          items={items}
          columns={[
            { key: 'date', name: 'Hora', fieldName: 'date', minWidth: 100, maxWidth: 200, isResizable: true },
            { key: 'nameProduct', name: 'Producto', fieldName: 'nameProduct', minWidth: 100, maxWidth: 200, isResizable: true },
            { key: 'count', name: 'Cantidad', fieldName: 'count', minWidth: 100, maxWidth: 200, isResizable: true },
            { key: 'total', name: 'Total', fieldName: 'total', minWidth: 100, maxWidth: 200, isResizable: true }
          ]}
          onRenderItemColumn={this._renderItemColumn.bind(this)}
          layoutMode={DetailsListLayoutMode.justified}
          onItemInvoked={this._onItemInvoked.bind(this)}
          selectionMode={SelectionMode.none}
        />
      </Alert>
    )
  }
}