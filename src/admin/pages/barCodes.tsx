import React from 'react'
import { CommandBar } from '@fluentui/react/lib/CommandBar'
import { Stack } from '@fluentui/react/lib/Stack'
import { mergeStyles } from '@fluentui/react/lib/Styling'
import BarCodeItem from './../components/barCodeItem'
import { BarCode, BarCodesAPI } from '../API/barCodes/types'
import Loading from '../components/loading'
declare const barCodes: BarCodesAPI
interface BarcodesPageState {
  barCodesList: BarCode[]
  loading: boolean
}
export default class BarcodesPage extends React.Component<object, BarcodesPageState> {
  constructor(props: object) {
    super(props)
    this.state = {
      barCodesList: [],
      loading: true
    }
    this.loadBarCodes = this.loadBarCodes.bind(this)
  }
  componentDidMount() {
    this.loadBarCodes()
  }
  private loadBarCodes() {
    this.setState({ barCodesList: [], loading: true })
    barCodes.read().then(barcodes => this.setState({ loading: false, barCodesList: barcodes }))
  }
  render() {
    const { barCodesList, loading } = this.state
    return (
      <React.Fragment>
        <Stack tokens={{ childrenGap: 10 }}>
          <CommandBar
            items={[
              {
                key: 'new',
                text: 'Nuevo',
                iconProps: { iconName: 'Add' },
                onClick: () => {
                  const now = new Date()
                  barCodes.create({
                    id: '',
                    name: 'Nuevo Código de barras',
                    value: Date.UTC(
                      now.getFullYear(),
                      now.getMonth(),
                      now.getDate(),
                      now.getHours(),
                      now.getMinutes(),
                      now.getSeconds(),
                      now.getMilliseconds()
                    ).toString()
                  }).then(this.loadBarCodes)
                }
              }
            ]}
          />
        </Stack>
        <Stack className={mergeStyles({ flexDirection: 'row', flexWrap: 'wrap', justifyContent: (loading ? 'center' : 'unset') })} tokens={{ childrenGap: 10 }}>
          {loading && <Loading label="Cargando Códigos de barras ..." />}
          {!loading && barCodesList.map((item, i) => <BarCodeItem key={i} data={item} onReload={this.loadBarCodes} />)}
        </Stack>
      </React.Fragment>
    )
  }
}