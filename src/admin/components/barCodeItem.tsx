import React from 'react'
import { useBoolean } from '@fluentui/react-hooks/lib/useBoolean'
import { mergeStyles } from '@fluentui/react/lib/Styling'
import { DocumentCard, DocumentCardActions } from '@fluentui/react/lib/DocumentCard'
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner'
import { Text } from '@fluentui/react/lib/Text'
import { TextField } from '@fluentui/react/lib/TextField'
import jsBarcode from 'jsbarcode'
import { BarCode, BarCodesAPI } from '../API/barCodes/types'
declare const barCodes: BarCodesAPI
interface BarCodeItemProps {
  data: BarCode
  onReload: () => void
}
const BarCodeItem: React.FC<BarCodeItemProps> = ({ data, onReload }) => {
  const { id, value } = data
  const [name, setName] = React.useState(data.name)
  const [edit, { setTrue: startEdit, setFalse: endEdit }] = useBoolean(false)
  const [spinnerLabel, setSpinnerLabel] = React.useState('')
  const _handlerOnDelete = React.useCallback(() => {
    setSpinnerLabel('Eliminando ...')
    barCodes.delete(id).then(onReload)
  }, [id, onReload])
  const _handlerOnDownload = React.useCallback(() => barCodes.saveFromDisk(document.getElementById(`bar-code-${id}`) as any), [id])
  const renderBarCode = React.useCallback((ref: HTMLCanvasElement) => {
    if (ref) {
      jsBarcode(ref, value)
    }
  }, [value])
  const _handlerUpddate = React.useCallback((newName: string) => {
    if (newName !== '' && name !== newName) {
      setSpinnerLabel('Cambiando nombre ...')
      barCodes.update({ id, name: newName, value }).then(() => {
        endEdit()
        setName(newName)
        setSpinnerLabel('')
      })
    } else {
      endEdit()
    }
  }, [endEdit, id, name, value])
  return (
    <DocumentCard className={mergeStyles({ margin: '.5rem 1rem' })}>
      {spinnerLabel !== '' && (
        <div className={mergeStyles({ padding: '2rem' })}>
          <Spinner size={SpinnerSize.large} label={spinnerLabel} />
        </div>
      )}
      {spinnerLabel === '' && (
        <React.Fragment>
          <div className={mergeStyles({ padding: '.5rem 1rem' })} onDoubleClick={startEdit}>
            {!edit && <Text variant="large">{name}</Text>}
            {edit && (
              <TextField
                defaultValue={name}
                autoFocus
                onBlur={e => _handlerUpddate(e.target.value)}
                onKeyUp={(e: any) => {
                  if (e.key === 'Enter') {
                    _handlerUpddate(e.target.value)
                  } else if (e.key === 'Escape') {
                    endEdit()
                  }
                }} />
            )}
          </div>
          <canvas ref={renderBarCode} id={`bar-code-${id}`} className={mergeStyles({ margin: '0 auto', display: 'block' })} />
          <DocumentCardActions actions={[
            { iconProps: { iconName: 'DownloadDocument' }, ariaLabel: 'Descargar', onClick: _handlerOnDownload },
            { iconProps: { iconName: 'Trash' }, ariaLabel: 'Eliminar', onClick: _handlerOnDelete }
          ]} />
        </React.Fragment>
      )}
    </DocumentCard>
  )
}
export default BarCodeItem