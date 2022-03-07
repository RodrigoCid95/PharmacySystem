import React from 'react'
import ReactDOM from 'react-dom'
import { mergeStyles } from '@fluentui/react/lib/Styling'
import { IStackTokens, Stack } from '@fluentui/react/lib/Stack'
import { Text } from '@fluentui/react/lib/Text'
import { ProductFinder } from './components/finder'
import { Item, ProductsAPI } from './API/products/types'
import { FocusZone, FocusZoneDirection } from '@fluentui/react/lib/FocusZone'
import { DetailsRow, SelectionMode } from '@fluentui/react/lib/DetailsList'
import { getRTLSafeKeyCode, KeyCodes } from '@fluentui/react/lib/Utilities'
import { DefaultButton, IconButton } from '@fluentui/react/lib/Button'
import { SpinButton } from '@fluentui/react/lib/SpinButton'
import { DocumentCard, DocumentCardTitle } from '@fluentui/react/lib/DocumentCard'
import { User } from './../admin/API/users/types'
import Loading from './components/loading'
import Alert from './components/alert'
import { initializeIcons } from '@fluentui/react/lib/Icons'

declare const getUser: () => void
declare const user: User
declare const products: ProductsAPI

initializeIcons('./fonts/')

const stackTokens: IStackTokens = { childrenGap: 15 }

mergeStyles({
  ':global(body,html,#root)': {
    margin: 0,
    padding: 0,
    boxSazing: 'border-box',
    height: '100%',
  },
  ':global(#root)': {
    height: '100%',
  },
})
interface CheckoutBoxState {
  isOpenFinder: boolean
  items: Item[]
  isOpenHelp: boolean
  isOpenLoad: boolean
}
class CheckoutBox extends React.Component<object, CheckoutBoxState> {
  constructor(props: object) {
    super(props)
    this.state = {
      isOpenFinder: false,
      items: [],
      isOpenHelp: false,
      isOpenLoad: false
    }
  }
  componentDidMount() {
    document.addEventListener('keydown', async e => {
      switch (e.code) {
        case 'F3':
          e.preventDefault()
          this.setState({ isOpenFinder: true })
          return false
        case 'F5':
          e.preventDefault()
          if (this.state.items.length > 0) {
            this.setState({ isOpenLoad: true })
            await products.checkout(this.state.items, user.id || 0)
            this.setState({ isOpenLoad: false, items: [] })
          } else {
            this.setState({ isOpenHelp: true })
          }
          return false
        default:
          console.log(e.code)
      }
    })
  }
  private addItem(product?: Item) {
    if (product) {
      const list = [{ ...product, count: 1 }, ...this.state.items]
      const items: Item[] = []
      for (const product of list) {
        const index = items.findIndex(i => i.id === product.id)
        if (index > -1) {
          const newCount: number = items[index].count + product.count
          if (newCount <= product.realStock) {
            items[index].count = newCount
          } else {
            items[index].count = product.realStock
          }
        } else {
          items.push(product)
        }
      }
      this.setState({ items, isOpenFinder: false })
    } else {
      this.setState({ isOpenFinder: false })
    }
  }
  render() {
    const { isOpenFinder, items, isOpenHelp, isOpenLoad } = this.state
    return (
      <Stack
        className={mergeStyles({
          width: '100%',
          height: '100%',
          color: '#605e5c',
          padding: '1rem'
        })}
        tokens={stackTokens}
      >
        <Stack horizontal>
          <Text variant="xLarge">Farmacia de Jesús - {user.name}</Text>
        </Stack>
        <Stack>
          <Text variant="xxLargePlus">Caja</Text>
        </Stack>
        {isOpenLoad ? (
          <Loading label='Cargando ...' />
        ) : (
          <React.Fragment>
            <FocusZone
              className={mergeStyles({ height: '100%', maxHeight: '80%', overflowY: 'auto' })}
              direction={FocusZoneDirection.vertical}
              isCircularNavigation
              shouldEnterInnerZone={ev => ev.which === getRTLSafeKeyCode(KeyCodes.right)}
              role="grid"
            >
              {items.map((item, index) => (
                <DetailsRow
                  key={index}
                  item={item}
                  itemIndex={index}
                  columns={[
                    {
                      key: 'options',
                      name: 'Options',
                      fieldName: 'options',
                      minWidth: 100,
                      onRender: () => (
                        <IconButton
                          iconProps={{ iconName: 'Trash' }}
                          title="Quitar"
                          ariaLabel="Quitar"
                          onClick={() => {
                            const l = items
                            l.splice(index, 1)
                            this.setState({ items: l })
                          }}
                        />
                      )
                    },
                    {
                      key: 'count',
                      name: 'Count',
                      fieldName: 'count',
                      minWidth: 100,
                      onRender: () => (
                        <SpinButton
                          className={mergeStyles({ width: '50px' })}
                          min={1}
                          max={item.realStock}
                          value={item.count.toString()}
                          onChange={(e, newValue) => {
                            const l = items
                            l[index].count = parseInt(newValue || '1')
                            l[index].subTotal = (l[index].count * l[index].realStock)
                            this.setState({ items: l })
                          }}
                        />
                      )
                    },
                    {
                      key: 'name',
                      name: 'Name',
                      fieldName: 'name',
                      minWidth: 100,
                    },
                    {
                      key: 'description',
                      name: 'Description',
                      fieldName: 'description',
                      minWidth: 100,
                    },
                    {
                      key: 'price',
                      name: 'Price',
                      fieldName: 'price',
                      minWidth: 100,
                      onRender: () => <span>{`$${item.price}`}</span>
                    },
                  ]}
                  selectionMode={SelectionMode.none}
                  styles={{ root: { width: '100%' } }}
                />
              ))}
            </FocusZone>
            <Stack className={mergeStyles({ flexDirection: 'row', justifyContent: 'flex-end' })}>
              <DocumentCard>
                <DocumentCardTitle title={`Total: $${(() => {
                  let total = 0
                  items.forEach(item => total += item.subTotal)
                  return total.toString()
                })()}`} />
              </DocumentCard>
            </Stack>
          </React.Fragment>
        )}
        {
          isOpenFinder && (
            <ProductFinder onDismiss={this.addItem.bind(this)} />
          )
        }
        {
          isOpenHelp && (
            <Alert
              title='Si productos por cobrar'
              onDismiss={() => this.setState({ isOpenHelp: false })}
            >
              <Stack className={mergeStyles({ marginBottom: '1rem' })}>
                <Text variant="xLarge">No hay productos en la lista para cobrar, utiliza la tecla "F3" para buscar un producto y añadirlo a la lista.</Text>
              </Stack>
              <Stack horizontal horizontalAlign="center">
                <DefaultButton
                  text='Aceptar'
                  onClick={() => this.setState({ isOpenHelp: false })}
                />
              </Stack>
            </Alert>
          )
        }
      </Stack >
    )
  }
}
ReactDOM.render(<Loading />, document.getElementById('root'))
getUser()
ReactDOM.render(<CheckoutBox />, document.getElementById('root'))