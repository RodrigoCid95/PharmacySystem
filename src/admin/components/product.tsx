import React from 'react'
import Alert from './alert'
import { Product, ProductsAPI } from './../API/products/types'
import { Stack } from '@fluentui/react/lib/Stack'
import Loading from './loading'
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar'
import { DefaultButton } from '@fluentui/react/lib/Button'
import { ITextField, TextField } from '@fluentui/react/lib/TextField'
import { mergeStyles } from '@fluentui/react/lib/Styling'
import { ISpinButton, SpinButton } from '@fluentui/react/lib/SpinButton'
import { Image, ImageFit } from '@fluentui/react/lib/Image'
import { Toggle } from '@fluentui/react/lib/Toggle'
import { Text } from '@fluentui/react/lib/Text'
import AddStock from './addStock'

declare const products: ProductsAPI

const notFountImage = 'data:image/jpeg;base64,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'

interface ProductComponentProps {
  product?: Product
  onDismiss: (reload: boolean) => void
}
interface ProductComponentState {
  loading: boolean
}
export class ProductComponent extends React.Component<ProductComponentProps, ProductComponentState> {
  constructor(props: ProductComponentProps) {
    super(props)
    this.state = {
      loading: false
    }
  }
  private _handlerOnSave(product: Product) {
    if (product.id) {
      products.update(product).then(() => {
        this.setState({ loading: false })
        this.props.onDismiss(true)
      }).catch(error => {
        console.error(error)
      })
    } else {
      products.create(product).then(() => {
        this.setState({ loading: false })
        this.props.onDismiss(true)
      }).catch(error => {
        console.error(error)
      })
    }
  }
  render() {
    const { onDismiss, product } = this.props
    const { loading } = this.state
    return (
      <Alert
        title={`${product ? 'Editar' : 'Nuevo'} producto`}
        onDismiss={() => onDismiss(false)}
      >
        {loading && (
          <Stack styles={{ root: { marginTop: '1rem' } }}>
            <Loading label="Cargando ..." />
          </Stack>
        )}
        {!loading && (
          <Form
            product={product}
            setLoading={loading => this.setState({ loading })}
            onReturnValue={this._handlerOnSave.bind(this)}
            onCancel={reload => onDismiss(reload)}
          />
        )}
      </Alert>
    )
  }
}
interface FormProps {
  product?: Product
  setLoading: (loading: boolean) => void
  onReturnValue: (product: Product) => void
  onCancel: (reload: boolean) => void
}
const Form: React.FC<FormProps> = ({ product, setLoading, onReturnValue, onCancel }) => {
  const [error, setError] = React.useState<string>('')
  const [thumbnail, setThumbnail] = React.useState<string>(product?.thumbnail || '')

  const nameRef = React.useRef<ITextField>(null)
  const descriptionRef = React.useRef<ITextField>(null)
  const skuRef = React.useRef<ITextField>(null)
  const priceRef = React.useRef<ISpinButton>(null)
  const stockRef = React.useRef<ISpinButton>(null)
  const minStockRef = React.useRef<ISpinButton>(null)
  const [isPackage, setIsPackage] = React.useState<boolean>(product?.isPackage || false)
  const piecesPerPackageRef = React.useRef<ISpinButton>(null)

  const _handlerOnChangeThumbnail = React.useCallback(() => {
    products.selectImage(image => {
      if (product) {
        setLoading(true)
        products.updateThumbnail(product, image).then(thumb => {
          setThumbnail(thumb)
          setLoading(false)
        })
      } else {
        setThumbnail(image)
      }
    })
  }, [product, setLoading])

  const _handlerReturnValue = React.useCallback(() => {
    setError('')
    const name = nameRef.current?.value || ''
    if (name === '') {
      setError('Falta un nombre!')
      return
    }
    const sku = skuRef.current?.value || ''
    if (sku === '') {
      setError('Falta código SKU')
      return
    }
    const price = parseFloat(priceRef.current?.value || '0')
    if (price === 0) {
      setError('Falta el precio')
      return
    }
    const piecesPerPackage = parseInt(piecesPerPackageRef.current?.value || '0')
    if (!product && isPackage && piecesPerPackage === 0) {
      setError('Falta definir cuantas piezas contiene cada paquete')
      return
    }
    const description = descriptionRef.current?.value || ''
    const stock = parseInt(stockRef.current?.value || product?.stock.toString() || '0')
    const minStock = parseInt(minStockRef.current?.value || '0')
    const newProduct: Product = {
      id: product?.id || 0,
      name,
      description,
      sku,
      thumbnail,
      price,
      stock,
      minStock,
      isPackage,
      piecesPerPackage
    }
    onReturnValue(newProduct)
  }, [isPackage, onReturnValue, product, thumbnail])

  return (
    <React.Fragment>
      <Stack className={mergeStyles({ marginBottom: '1rem' })}>
        {error !== '' && (
          <MessageBar
            messageBarType={MessageBarType.error}
            onDismiss={() => setError('')}
            dismissButtonAriaLabel="Cerrar"
          >
            {error}
          </MessageBar>
        )}
        <Image onClick={_handlerOnChangeThumbnail} src={thumbnail || notFountImage} imageFit={ImageFit.cover} />
        <TextField componentRef={nameRef} defaultValue={product?.name || ''} required label="Nombre" />
        <TextField componentRef={descriptionRef} defaultValue={product?.description || ''} label="Descripción" multiline rows={3} />
        <TextField componentRef={skuRef} defaultValue={product?.sku || ''} required label="SKU" />
        <SpinButton componentRef={priceRef} defaultValue={product?.price.toString() || ''} incrementButtonAriaLabel="+" decrementButtonAriaLabel="-" min={0} step={0.1} label="Precio" className={mergeStyles({ marginTop: '1rem!important' })} />
        {product ? (
          <React.Fragment>
            <AddStock product={product} onSave={() => onCancel(true)} />
            {isPackage && <Text>{product.piecesPerPackage} piezas por paquete</Text>}
          </React.Fragment>
        ) : (
          <SpinButton componentRef={stockRef} defaultValue="0" incrementButtonAriaLabel="+" decrementButtonAriaLabel="-" min={0} step={1} label="Stock" className={mergeStyles({ marginTop: '1rem!important' })} />
        )}
        <SpinButton componentRef={minStockRef} defaultValue={product?.minStock.toString() || ''} incrementButtonAriaLabel="+" decrementButtonAriaLabel="-" min={0} step={1} label="Stock mínimo" className={mergeStyles({ marginTop: '1rem!important' })} />
        {!product && <Toggle className={mergeStyles({ marginTop: '1rem!important' })} inlineLabel onText="Es un paquete" offText="Es una unidad" onChange={(ev, checked) => setIsPackage(checked || false)} />}
        {isPackage && !product && (
          <SpinButton componentRef={piecesPerPackageRef} incrementButtonAriaLabel="+" decrementButtonAriaLabel="-" min={1} step={1} label="Piezas por paquete" className={mergeStyles({ marginTop: '1rem 0!important' })} />
        )}
      </Stack>
      <Stack horizontal horizontalAlign="space-around">
        <DefaultButton
          primary
          text="Guardar"
          onClick={_handlerReturnValue}
        />
        <DefaultButton
          text="Cancelar"
          onClick={() => onCancel(false)}
        />
      </Stack>
    </React.Fragment>
  )
}