import React from 'react'
import ReactDOM from 'react-dom'
import { getTheme, mergeStyles } from '@fluentui/react/lib/Styling'
import { IStackTokens, Stack } from '@fluentui/react/lib/Stack'
import { Text } from '@fluentui/react/lib/Text'
import { initializeIcons } from '@fluentui/react/lib/Icons'
import { FocusZone, FocusZoneDirection } from '@fluentui/react/lib/FocusZone'
import { DetailsRow, SelectionMode } from '@fluentui/react/lib/DetailsList'
import { getRTLSafeKeyCode, KeyCodes } from '@fluentui/react/lib/Utilities'
import { DefaultButton, IconButton } from '@fluentui/react/lib/Button'
import { SpinButton } from '@fluentui/react/lib/SpinButton'
import Loading from './components/loading'
import Alert from './components/alert'
import Cancel from './components/cancel'
import { ProductFinder } from './components/finder'
import { User } from './../admin/API/users/types'
import { Item, CheckoutAPI } from './API/types'

declare const getUser: () => void
declare const user: User
declare const checkout: CheckoutAPI

initializeIcons('./fonts/')

const theme = getTheme()
const stackTokens: IStackTokens = { childrenGap: 15 }

mergeStyles({
  ':global(body,html,#root)': {
    margin: 0,
    padding: 0,
    boxSazing: 'border-box',
    height: '100%',
  }
})

interface CheckoutBoxState {
  isOpenFinder: boolean
  items: Item[]
  isOpenHelp: boolean
  isOpenLoad: boolean
  isOpenCancel: boolean
}
class CheckoutBox extends React.Component<object, CheckoutBoxState> {
  constructor(props: object) {
    super(props)
    this.state = {
      isOpenFinder: false,
      items: [],
      isOpenHelp: false,
      isOpenLoad: false,
      isOpenCancel: false
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
            await checkout.checkout(this.state.items, user.id || 0)
            this.setState({ isOpenLoad: false, items: [] })
          } else {
            this.setState({ isOpenHelp: true })
          }
          return false
        case 'F4':
          e.preventDefault()
          if (!this.state.isOpenCancel) {
            this.setState({ isOpenCancel: true })
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
    const { isOpenFinder, items, isOpenHelp, isOpenLoad, isOpenCancel } = this.state
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
        <Stack horizontal className={mergeStyles({ justifyContent: 'space-between' })}>
          <Text variant='xLarge'>Farmacia de Jesús - {user.name}</Text>
          <Text variant='xLarge'>{`Total: $${(() => {
            let total = 0
            items.forEach(item => total += item.subTotal)
            return total.toString()
          })()}`}</Text>
          <IconButton
            styles={{
              root: {
                color: theme.palette.neutralPrimary,
                marginLeft: 'auto',
                marginTop: '4px',
                marginRight: '2px',
              },
              rootHovered: {
                color: theme.palette.neutralDark,
              },
            }}
            iconProps={{ iconName: 'Cancel' }}
            ariaLabel="Cerrar"
            onClick={() => window.close()}
          />
        </Stack>
        <Stack>
          <Text variant="xxLargePlus">Caja</Text>
        </Stack>
        {isOpenLoad ? (
          <Loading label='Cargando ...' />
        ) : (
          <React.Fragment>
            <FocusZone
              className={mergeStyles({ height: '100%', overflowY: 'auto' })}
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
                            l[index].subTotal = (l[index].count * l[index].price)
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
          </React.Fragment>
        )}
        {isOpenFinder && (
          <ProductFinder onDismiss={this.addItem.bind(this)} />
        )}
        {isOpenHelp && (
          <Alert
            title='Caja vacía!'
            onDismiss={() => this.setState({ isOpenHelp: false })}
          >
            <Stack className={mergeStyles({ marginBottom: '1rem' })}>
              <Text variant="xLarge">Añade productos a la caja utilizando la tecla "F3".</Text>
            </Stack>
            <Stack horizontal horizontalAlign="center">
              <DefaultButton
                text='Aceptar'
                onClick={() => this.setState({ isOpenHelp: false })}
              />
            </Stack>
          </Alert>
        )}
        {isOpenCancel && (
          <Cancel onDismiss={() => this.setState({ isOpenCancel: false })} />
        )}
      </Stack >
    )
  }
}
ReactDOM.render(<Loading />, document.getElementById('root'))
getUser()
ReactDOM.render(<CheckoutBox />, document.getElementById('root'))