import React from 'react'
import ReactDOM from 'react-dom'
import { mergeStyles } from '@fluentui/react/lib/Styling'
import { IStackTokens, Stack } from '@fluentui/react/lib/Stack'
import { Text } from '@fluentui/react/lib/Text'
import { ProductFinder } from './components/finder'
import { Product } from './API/products/types'
import { FocusZone, FocusZoneDirection } from '@fluentui/react/lib/FocusZone'
import { DetailsRow, SelectionMode } from '@fluentui/react/lib/DetailsList'
import { getRTLSafeKeyCode, KeyCodes } from '@fluentui/react/lib/Utilities'
import { IconButton } from '@fluentui/react/lib/Button'
import { SpinButton } from '@fluentui/react/lib/SpinButton'
import { DocumentCard, DocumentCardTitle } from '@fluentui/react/lib/DocumentCard'
import { User } from './../admin/API/users/types'
import Loading from './components/loading'

declare const getUser: () => void
getUser()
declare const user: User

const stackTokens: IStackTokens = { childrenGap: 15 }

mergeStyles({
  ':global(body,html,#root)': {
    margin: 0,
    padding: 0,
    boxSazing: 'border-box',
    height: '100%',
  },
  ':global(#root)': {
    height: '95%',
  },
})
interface Item extends Product {
  count: number
}
interface CheckoutBoxState {
  isOpenFinder: boolean
  items: Item[]
}
class CheckoutBox extends React.Component<object, CheckoutBoxState> {
  constructor(props: object) {
    super(props)
    this.state = {
      isOpenFinder: false,
      items: []
    }
  }
  componentDidMount() {
    document.addEventListener('keydown', e => {
      switch (e.code) {
        case 'F3':
          e.preventDefault()
          this.setState({ isOpenFinder: true })
          return false
        case 'F5':
          e.preventDefault()
          console.log(this.state.items)
          return false
        default:
          console.log(e.code)
      }
    })
  }
  private addItem(product?: Product) {
    if (product) {
      const list = this.state.items
      list.push({ ...product, count: 1 })
      this.setState({ items: list, isOpenFinder: false })
    } else {
      this.setState({ isOpenFinder: false })
    }
  }
  render() {
    const { isOpenFinder, items } = this.state
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
          <Text variant="xxLargePlus">Checkout</Text>
        </Stack>
        <FocusZone
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
                  onRender: () => <IconButton iconProps={{ iconName: 'Trash' }} title="Quitar" ariaLabel="Quitar" onClick={() => {
                    const l = items
                    l.splice(index, 1)
                    this.setState({ items: l })
                  }} />
                },
                {
                  key: 'count',
                  name: 'Count',
                  fieldName: 'count',
                  minWidth: 100,
                  onRender: () => <SpinButton className={mergeStyles({width: '50px'})} min={1} max={item.stock} onChange={(e, newValue) => {
                    const l = items
                    l[index].count = parseInt(newValue || '1')
                    this.setState({ items: l })
                  }} />
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
              items.forEach(item => total += (item.count * item.price))
              return total.toString()
            })()}`} />
          </DocumentCard>
        </Stack>
        {isOpenFinder && (
          <ProductFinder onDismiss={this.addItem.bind(this)} />
        )}
      </Stack>
    )
  }
}
ReactDOM.render(<Loading />, document.getElementById('root'))