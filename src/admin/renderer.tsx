import React from 'react'
import ReactDOM from 'react-dom'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { useBoolean } from '@fluentui/react-hooks'
import { mergeStyles } from '@fluentui/react/lib/Styling'
import { IStackTokens, Stack } from '@fluentui/react/lib/Stack'
import { Text } from '@fluentui/react/lib/Text'
import { ActionButton, IconButton, PrimaryButton } from '@fluentui/react/lib/Button'
import { Panel, PanelType } from '@fluentui/react/lib/Panel'
import { initializeIcons } from '@fluentui/font-icons-mdl2'
import Loading from './components/loading'
import { AppAPI } from './API/app/types'

declare const app: AppAPI

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
    height: '95%',
  },
})

const IndexPage = React.lazy(() => import('./pages/index'))
const UsersPage = React.lazy(() => import('./pages/users'))
const ProductsPage = React.lazy(() => import('./pages/products'))
const BarCodesPage = React.lazy(() => import('./pages/barCodes'))

const Menu: React.FC<{ isOpen: boolean; dismissPanel: () => void; onChangeTitle: (title: string) => void; onChangeLoading: (label: string) => void }> = ({ isOpen, dismissPanel, onChangeTitle, onChangeLoading }) => {
  const navigate = useNavigate()
  const onRenderFooterContent = React.useCallback(
    () => (
      <Stack className={mergeStyles({ flexDirection: 'row' })}>
        <PrimaryButton
          onClick={() => {
            onChangeLoading('Creando copia de seguridad ...')
            app.createBackup().then(() => {
              onChangeLoading('')
            })
          }}
          styles={{ root: { marginRight: 8 } }}
        >
          Crear backup
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            onChangeLoading('Restaurando copia de seguridad ...')
            app.restoreBackup().then(() => {
              onChangeLoading('')
            })
          }}
          styles={{ root: { marginRight: 8 } }}
        >
          Restaurar backup
        </PrimaryButton>
      </Stack>
    ),
    [navigate]
  )
  return (
    <Panel
      isLightDismiss
      isOpen={isOpen}
      onDismiss={dismissPanel}
      type={PanelType.smallFixedNear}
      closeButtonAriaLabel="Cerrar"
      headerText="Menú"
      onRenderFooterContent={onRenderFooterContent}
      isFooterAtBottom
    >
      <Stack className={mergeStyles({ marginTop: '1rem' })}>
        <ActionButton
          iconProps={{ iconName: 'People' }}
          onClick={() => {
            navigate('/admin/users')
            dismissPanel()
            onChangeTitle('Usuarios')
          }}
        >
          Usuarios
        </ActionButton>
        <ActionButton
          iconProps={{ iconName: 'ProductList' }}
          onClick={() => {
            navigate('/admin/products')
            dismissPanel()
            onChangeTitle('Productos')
          }}
        >
          Productos
        </ActionButton>
        <ActionButton
          iconProps={{ iconName: 'ShowGrid' }}
          onClick={() => {
            navigate('/admin/bar-codes')
            dismissPanel()
            onChangeTitle('Códigos de barras')
          }}
        >
          Códigos de barras
        </ActionButton>
      </Stack>
    </Panel>
  )
}

const AdminDashboard: React.FC = () => {
  const [isOpenMenu, { setTrue: openMenu, setFalse: dismissMenu }] = useBoolean(false)
  const [labelLoading, setLabelLoading] = React.useState('')
  const [title, setTitle] = React.useState('')
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
      {labelLoading !== '' && <Loading label={labelLoading} />}
      {labelLoading === '' && (
        <React.Fragment>
          <Stack horizontal>
            <IconButton iconProps={{ iconName: 'CollapseMenu' }} title="Menú" ariaLabel="Menú" onClick={openMenu} />
            <Text variant="xLarge">Administrador{title === '' ? '' : ` - ${title}`}</Text>
          </Stack>
          <Stack className={mergeStyles({ height: '100%' })}>
            <MemoryRouter>
              <Menu
                isOpen={isOpenMenu}
                dismissPanel={dismissMenu}
                onChangeTitle={setTitle}
                onChangeLoading={label => setLabelLoading(label)}
              />
              <Routes>
                <Route path="/" element={
                  <React.Suspense fallback={<Loading />}>
                    <IndexPage />
                  </React.Suspense>
                } />
                <Route path="/admin/users" element={
                  <React.Suspense fallback={<Loading />}>
                    <UsersPage />
                  </React.Suspense>
                } />
                <Route path="/admin/products" element={
                  <React.Suspense fallback={<Loading />}>
                    <ProductsPage />
                  </React.Suspense>
                } />
                <Route path="/admin/bar-codes" element={
                  <React.Suspense fallback={<Loading />}>
                    <BarCodesPage />
                  </React.Suspense>
                } />
              </Routes>
            </MemoryRouter>
          </Stack>
        </React.Fragment>
      )}
    </Stack>
  )
}
ReactDOM.render(<AdminDashboard />, document.getElementById('root'))