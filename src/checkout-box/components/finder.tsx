import React from 'react'
import { useId, useBoolean } from '@fluentui/react-hooks'
import { FontWeights, getFocusStyle, getTheme, mergeStyleSets } from '@fluentui/react/lib/Styling'
import { Modal } from '@fluentui/react/lib/Modal'
import { Toggle } from '@fluentui/react/lib/Toggle'
import { FocusZone, FocusZoneDirection } from '@fluentui/react/lib/FocusZone'
import { TextField } from '@fluentui/react/lib/TextField'
import { List } from '@fluentui/react/lib/List'
import { Image, ImageFit } from '@fluentui/react/lib/Image'
import { CheckoutAPI, Item } from '../API/types'
import Loading from './loading'
declare const checkout: CheckoutAPI
const notFountImage = 'data:image/jpeg;base64,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'
let currentProduct: Item | undefined = undefined
export const ProductFinder: React.FC<{ onDismiss: (product?: Item) => void }> = ({ onDismiss }) => {
  const titleId = useId('title')
  const [loading, { setTrue: showLoading, setFalse: hideLoading }] = useBoolean(false)
  const [items, setItems] = React.useState<Item[]>([])
  const [searchType, { toggle: toggleSearchBoolean }] = useBoolean(false)
  const focusZoneRef = React.useRef<FocusZone>(null)
  const returnItem = React.useCallback(() => {
    if (currentProduct && currentProduct.stock > 0) {
      onDismiss(currentProduct)
    }
  }, [onDismiss])
  return (
    <Modal
      titleAriaId={titleId}
      isOpen
      onDismiss={() => onDismiss()}
      isBlocking={false}
      containerClassName={contentStyles.container}
    >
      <div className={contentStyles.header}>
        <span id={titleId}>Buscar producto</span>
      </div>
      <div className={contentStyles.body}>
        {loading && <Loading label="Buscando producto..." />}
        {!loading && (
          <FocusZone
            direction={FocusZoneDirection.vertical}
            ref={focusZoneRef}
          >
            <TextField
              placeholder={searchType ? 'Escribe un nombre ...' : 'Escribe o escanea un SKU ...'}
              onRenderLabel={() => (
                <Toggle
                  offText='Buscar por sku'
                  onText='Buscar por nombre'
                  checked={searchType}
                  onChange={toggleSearchBoolean}
                />
              )}
              onKeyUp={async e => {
                if (e.code === 'Enter') {
                  showLoading()
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const result = await checkout.findProduct(e.currentTarget.value, searchType)
                  setItems(result.map(product => ({ ...product, count: 1, subTotal: product.price })))
                  hideLoading()
                }
              }}
            />
            <List
              items={items}
              onFocus={e => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const id: string = (e.target as any).getAttribute('index-item') || '0'
                if (id) {
                  currentProduct = items.find(item => item.id === parseInt(id))
                }
              }}
              onRenderCell={(item) => (
                <div
                  className={classNames.itemCell}
                  index-item={item?.id}
                  data-is-focusable
                  style={item?.stock === 0 ? { backgroundColor: '#ffe3e6', cursor: 'pointer' } : { cursor: 'pointer' }}
                  onDoubleClick={returnItem}
                  onKeyUp={e => {
                    if (e.code === 'Enter') {
                      returnItem()
                    }
                  }}
                >
                  <Image className={classNames.itemImage} src={item?.thumbnail || notFountImage} width={50} height={50} imageFit={ImageFit.cover} />
                  <div className={classNames.itemContent}>
                    <div className={classNames.itemName}>{item?.name}</div>
                    <div className={classNames.itemIndex}>{`$${item?.price}`}</div>
                    <div className={classNames.itemIndex}>{`${item?.realStock} unidades.`}</div>
                    <div>{item?.description}</div>
                  </div>
                </div>
              )}
            />
          </FocusZone>
        )}
      </div>
    </Modal>
  )
}
const theme = getTheme()
const contentStyles = mergeStyleSets({
  container: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch',
    width: '90%',
    height: '90%'
  },
  header: [
    theme.fonts.xxLarge,
    {
      flex: '1 1 auto',
      borderTop: `4px solid ${theme.palette.themePrimary}`,
      color: theme.palette.neutralPrimary,
      display: 'flex',
      alignItems: 'center',
      fontWeight: FontWeights.semibold,
      padding: '12px 12px 14px 24px'
    }
  ],
  body: {
    flex: '4 4 auto',
    padding: '0 24px 24px 24px',
    overflowY: 'hidden',
    selectors: {
      p: { margin: '14px 0' },
      'p:first-child': { marginTop: 0 },
      'p:last-child': { marginBottom: 0 },
    }
  }
})
const { palette, semanticColors, fonts } = theme
const classNames = mergeStyleSets({
  itemCell: [
    getFocusStyle(theme, { inset: -1 }),
    {
      minHeight: 54,
      padding: 10,
      boxSizing: 'border-box',
      borderBottom: `1px solid ${semanticColors.bodyDivider}`,
      display: 'flex',
      selectors: {
        '&:hover': { background: palette.neutralLight },
      },
    },
  ],
  itemImage: {
    flexShrink: 0,
  },
  itemContent: {
    marginLeft: 10,
    overflow: 'hidden',
    flexGrow: 1,
  },
  itemName: [
    fonts.xLarge,
    {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  ],
  itemIndex: {
    fontSize: fonts.small.fontSize,
    color: palette.neutralTertiary,
    marginBottom: 10,
  },
  chevron: {
    alignSelf: 'center',
    marginLeft: 10,
    color: palette.neutralTertiary,
    fontSize: fonts.large.fontSize,
    flexShrink: 0,
  },
})