import React from 'react'
import { DefaultButton } from '@fluentui/react/lib/Button'
import { mergeStyles } from '@fluentui/react/lib/Styling'
import { useBoolean } from '@fluentui/react-hooks/lib/useBoolean'
import Alert from './alert'
import Loading from './loading'
import { SpinButton, ISpinButton } from '@fluentui/react/lib/SpinButton'
import { Stack } from '@fluentui/react/lib/Stack'
import { ProductsAPI, Product } from './../API/products/types'
declare const products: ProductsAPI
interface AddStockProps {
  product: Product
  onSave: () => void
}
const AddStock: React.FC<AddStockProps> = ({ product, onSave }) => {
  const stockRef = React.useRef<ISpinButton>(null)
  const [isOpenModal, { setTrue: showModal, setFalse: hideModal }] = useBoolean(false)
  const [isShowLoading, { setTrue: showLoading, setFalse: hideLoading }] = useBoolean(false)
  const _handlerOnSave = React.useCallback(() => {
    const numberStock = parseInt(stockRef.current?.value || '0')
    if (numberStock > 0) {
      showLoading()
      product.stock += numberStock
      products.update(product).then(() => {
        hideLoading()
        hideModal()
        onSave()
      }).catch(error => {
        console.error(error)
      })
    }
  }, [hideLoading, hideModal, onSave, product, showLoading])
  return (
    <React.Fragment>
      <DefaultButton onClick={showModal} className={mergeStyles({ margin: '1rem!important' })} text="Agregar unidades al stock" />
      {isOpenModal && (
        <Alert
          title="Agregar al stock"
          onDismiss={hideModal}
        >
          {isShowLoading && <Loading label="Guardando ..." />}
          {!isShowLoading && (
            <React.Fragment>
              <SpinButton
                componentRef={stockRef}
                className={mergeStyles({ margin: '1rem!important' })}
                label="Stock"
                min={1}
                step={1}
                incrementButtonAriaLabel='+'
                decrementButtonAriaLabel='-'
              />
              <Stack horizontal horizontalAlign="space-around">
                <DefaultButton
                  primary
                  text="Guardar"
                  onClick={_handlerOnSave}
                />
                <DefaultButton
                  text="Cancelar"
                  onClick={hideModal}
                />
              </Stack>
            </React.Fragment>
          )}
        </Alert>
      )}
    </React.Fragment>
  )
}
export default AddStock