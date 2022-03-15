import React from 'react'
import { DetailsList, DetailsListLayoutMode, Selection, IColumn, DetailsRow, IDetailsListProps } from '@fluentui/react/lib/DetailsList'
import { CommandBar } from '@fluentui/react/lib/CommandBar'
import { Stack } from '@fluentui/react/lib/Stack'
import { TextField } from '@fluentui/react/lib/TextField'
import { MarqueeSelection } from '@fluentui/react/lib/MarqueeSelection'
import { getTheme, mergeStyles } from '@fluentui/react/lib/Styling'
import { Image, ImageFit } from '@fluentui/react/lib/Image'
import { ProductsAPI, Product } from './../API/products/types'
import Loading from './../components/loading'
import { ProductComponent } from '../components/product'
import Confirm from './../components/confirm'

declare const products: ProductsAPI
const notFountImage = 'data:image/jpeg;base64,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'
const theme = getTheme()
interface ProductsPageState {
  sortedItems: Product[]
  columns: IColumn[]
  loading: string
  currentProduct: Product | undefined
  openProductModal: boolean
  openDeleteAlert: boolean
}
export default class ProductsPage extends React.Component<object, ProductsPageState> {
  private _selection: Selection
  private _allItems: Product[]
  constructor(props: object) {
    super(props)
    this._selection = new Selection()
    this._allItems = []
    this.state = {
      sortedItems: this._allItems,
      columns: [
        { key: 'thumbnail', name: 'Imágen', fieldName: 'thumbnail', minWidth: 100, maxWidth: 100, isResizable: false },
        { key: 'name', name: 'Nombre', fieldName: 'name', minWidth: 100, maxWidth: 200, isResizable: true },
        { key: 'description', name: 'Descripción', fieldName: 'description', minWidth: 100, maxWidth: 200, isResizable: true },
        { key: 'sku', name: 'SKU', fieldName: 'sku', minWidth: 100, maxWidth: 200, isResizable: true },
        { key: 'price', name: 'Precio', fieldName: 'price', minWidth: 100, maxWidth: 200, isResizable: true },
        { key: 'stock', name: 'Stock', fieldName: 'stock', minWidth: 100, maxWidth: 200, isResizable: true },
      ],
      loading: '',
      currentProduct: undefined,
      openProductModal: false,
      openDeleteAlert: false
    }
  }
  componentDidMount() {
    this.loadProducts()
  }
  private async loadProducts() {
    this.setState({ loading: 'Cargando lista de productos ...' })
    const items = await products.read()
    this._allItems = items
    this.setState({
      sortedItems: items,
      loading: ''
    })
  }
  private _onFilter = (text: string): void => {
    this.setState({
      sortedItems: text ? this._allItems.filter(i => i.name.toLowerCase().indexOf(text) > -1 || i.description.toLowerCase().indexOf(text) > -1 || i.sku.toLowerCase().indexOf(text) > -1) : this._allItems,
    });
  }
  private _onItemInvoked = (item: Product): void => {
    this.setState({ openProductModal: true, currentProduct: item })
  }
  private _onColumnClick = (_event: React.MouseEvent<HTMLElement, MouseEvent> | undefined, column?: IColumn): void => {
    if (column && column.key !== 'thumbnail') {
      const { columns } = this.state
      let { sortedItems } = this.state
      let isSortedDescending = column.isSortedDescending
      if (column.isSorted) {
        isSortedDescending = !isSortedDescending
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      sortedItems = _copyAndSort(sortedItems, column.fieldName!, isSortedDescending)
      this.setState({
        sortedItems: sortedItems,
        columns: columns.map(col => {
          col.isSorted = col.key === column.key;
          if (col.isSorted) {
            col.isSortedDescending = isSortedDescending;
          }
          return col;
        }),
      })
    }
  }
  private async _handlerOnDelete() {
    this.setState({ openDeleteAlert: false, loading: `Eliminando ${this._selection.getSelectedCount() === 0 ? 'producto' : 'productos'}` })
    const productsList = (this._selection.getSelection() as Product[])
    for (const product of productsList) {
      await products.delete(product.id)
    }
    await this.loadProducts()
  }
  private _onRenderRow: IDetailsListProps['onRenderRow'] = props => {
    if (props) {
      const { stock, minStock } = (props.item as Product)
      if (stock === 0) {
        return <DetailsRow {...props} className={mergeStyles({ backgroundColor: theme.palette.red, color: theme.palette.white })} />
      }
      if (stock < minStock) {
        return <DetailsRow {...props} className={mergeStyles({ backgroundColor: theme.palette.yellowLight })} />
      } else {
        return <DetailsRow {...props} />
      }
    }
    return null;
  }
  render() {
    const { columns, sortedItems, loading, currentProduct, openProductModal, openDeleteAlert } = this.state
    return (
      <React.Fragment>
        <Stack className={mergeStyles({ flexDirection: 'row', alignItems: 'center' })}>
          <TextField
            placeholder="Filtrar por nombre"
            onChange={(_e, t) => this._onFilter(t || '')}
          />
          <CommandBar
            className={mergeStyles({ minWidth: '305px' })}
            items={[
              {
                key: 'new',
                text: 'Nuevo',
                iconProps: { iconName: 'Add' },
                onClick: () => this.setState({ currentProduct: undefined, openProductModal: true })
              },
              {
                key: 'delete',
                text: 'Eliminar',
                iconProps: { iconName: 'Remove' },
                onClick: () => this.setState({ openDeleteAlert: true })
              },
              {
                key: 'reload',
                text: 'Refrescar',
                iconProps: { iconName: 'Refresh' },
                onClick: this.loadProducts.bind(this)
              }
            ]}
          />
        </Stack>
        <Stack className={mergeStyles({ overflow: 'auto', height: '100%' })}>
          {loading !== '' && <Loading label={loading} />}
          {!loading && (
            <MarqueeSelection selection={this._selection}>
              <DetailsList
                items={sortedItems}
                columns={columns}
                onRenderItemColumn={_renderItemColumn}
                onColumnHeaderClick={this._onColumnClick}
                onRenderRow={this._onRenderRow?.bind(this)}
                setKey="set"
                layoutMode={DetailsListLayoutMode.justified}
                selection={this._selection}
                selectionPreservedOnEmptyClick={true}
                onItemInvoked={this._onItemInvoked}
              />
            </MarqueeSelection>
          )}
        </Stack>
        {openProductModal && (
          <ProductComponent
            onDismiss={reload => {
              this.setState({ openProductModal: false, currentProduct: undefined })
              if (reload) {
                this.loadProducts()
              }
            }}
            product={currentProduct}
          />
        )}
        {openDeleteAlert && (
          <Confirm
            title="Eliminar"
            text={this._selection.getSelectedCount() === 0 ? 'Primero selecciona uno o más productos' : this._selection.getSelectedCount() === 1 ? '¿Estás segur@ que quieres borrar este producto?' : '¿Estás segur@ que quieres borrar estos productos?'}
            textYes={this._selection.getSelectedCount() === 0 ? '' : 'Borrar'}
            onCancel={() => this.setState({ openDeleteAlert: false })}
            onNo={() => this.setState({ openDeleteAlert: false })}
            onYes={this._handlerOnDelete.bind(this)}
          />
        )}
      </React.Fragment>
    )
  }
}
function _renderItemColumn(item: Product, index?: number | undefined, column?: IColumn | undefined) {
  if (column) {
    const fieldContent = item[column.fieldName as keyof Product] as string;
    if (column.key === 'thumbnail') {
      return <Image src={fieldContent || notFountImage} width={50} height={50} imageFit={ImageFit.cover} />
    } else if (column.key === 'price') {
      return <span>${fieldContent}</span>
    } else if (column.key === 'stock') {
      if (item.isPackage) {
        if (item.stock === 0) {
          return <span>Agotado</span>
        } else {
          const result = item.stock.toString().split('.')
          const packages = result[0]
          const unitys = result[1] ? parseFloat(result[1]) : 0
          if (unitys > 0) {
            return <span>{packages} paquetes y {unitys} piezas.</span>
          } else {
            return <span>{packages} paquetes.</span>
          }
        }
      } else {
        if (item.stock === 0) {
          return <span>Agotado</span>
        } else {
          return <span>{fieldContent} paquetes.</span>
        }
      }
    } else {
      return <span>{fieldContent}</span>
    }
  }
}
function _copyAndSort<T>(items: T[], columnKey: string, isSortedDescending?: boolean): T[] {
  const key = columnKey as keyof T;
  return items.slice(0).sort((a: T, b: T) => ((isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1));
}