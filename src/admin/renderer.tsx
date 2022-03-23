import React from 'react'
import ReactDOM from 'react-dom'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { useBoolean } from '@fluentui/react-hooks'
import { mergeStyles } from '@fluentui/react/lib/Styling'
import { IStackTokens, Stack } from '@fluentui/react/lib/Stack'
import { Text } from '@fluentui/react/lib/Text'
import { ActionButton, DefaultButton, IconButton } from '@fluentui/react/lib/Button'
import { Panel, PanelType } from '@fluentui/react/lib/Panel'
import { ITextField, TextField } from '@fluentui/react/lib/TextField'
import { initializeIcons } from '@fluentui/react/lib/Icons'
import Loading from './components/loading'
import Alert from './components/alert'
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
  }
})

const IndexPage = React.lazy(() => import('./pages/index'))
const UsersPage = React.lazy(() => import('./pages/users'))
const ProductsPage = React.lazy(() => import('./pages/products'))
const BarCodesPage = React.lazy(() => import('./pages/barCodes'))
interface MenuProps {
  isOpen: boolean
  dismissPanel: () => void
  onChangeTitle: (title: string) => void
  onChangeLoading: (label: string) => void
  onChangeCredentials: () => void
}
const Menu: React.FC<MenuProps> = ({ isOpen, dismissPanel, onChangeTitle, onChangeLoading, onChangeCredentials }) => {
  const navigate = useNavigate()
  const onRenderFooterContent = React.useCallback(
    () => (
      <Stack className={mergeStyles({ display: 'flex', alignItems: 'center' })}>
        <DefaultButton
          primary
          text='Cerrar'
          onClick={() => window.close()}
          split
          menuProps={{
            items: [
              {
                key: 'createBackup',
                text: 'Crear copia de seguridad',
                iconProps: { iconName: 'Add' },
                onClick: () => {
                  onChangeLoading('Creando copia de seguridad ...')
                  app.createBackup().then(() => {
                    onChangeLoading('')
                  }).catch(error => {
                    console.error(error)
                    onChangeLoading('')
                  })
                }
              },
              {
                key: 'restoreBackup',
                text: 'Restaurar copia de seguridad',
                iconProps: { iconName: 'Refresh' },
                onClick: () => {
                  onChangeLoading('Restaurando copia de seguridad ...')
                  app.restoreBackup().then(() => {
                    onChangeLoading('')
                  }).catch(error => {
                    console.error(error)
                    onChangeLoading('')
                  })
                }
              }
            ]
          }}
        />
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
          iconProps={{ iconName: 'Home' }}
          onClick={() => {
            navigate('/')
            dismissPanel()
            onChangeTitle('Inicio')
          }}
        >
          Inicio
        </ActionButton>
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
        <ActionButton
          iconProps={{ iconName: 'Signin' }}
          onClick={() => {
            onChangeCredentials()
            dismissPanel()
          }}
        >
          Cambiar credenciales
        </ActionButton>
      </Stack>
    </Panel>
  )
}
const AdminDashboard: React.FC = () => {
  const [isOpenMenu, { setTrue: openMenu, setFalse: dismissMenu }] = useBoolean(false)
  const [isOpenChangeCredentials, { setTrue: openChangeCredentials, setFalse: dismissChangeCredentials }] = useBoolean(false)
  const [labelLoading, setLabelLoading] = React.useState('')
  const [title, setTitle] = React.useState('Inicio')
  const userNameRef = React.useRef<ITextField>(null)
  const passwordRef = React.useRef<ITextField>(null)
  return (
    <Stack
      className={mergeStyles({
        width: '100%',
        height: 'calc(100% - 2rem)',
        color: '#605e5c',
        padding: '1rem',
        display: 'block'
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
          <Stack className={mergeStyles({ height: '100%', marginTop: 'unset' })}>
            <MemoryRouter>
              <Menu
                isOpen={isOpenMenu}
                dismissPanel={dismissMenu}
                onChangeTitle={setTitle}
                onChangeLoading={label => setLabelLoading(label)}
                onChangeCredentials={openChangeCredentials}
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
              {isOpenChangeCredentials && (
                <Alert
                  title='Ingresa las nuevas credenciales'
                  onDismiss={dismissChangeCredentials}
                >
                  <Stack className={mergeStyles({ marginBottom: '1rem' })}>
                    <TextField
                      label='Nombre de usuario:'
                      componentRef={userNameRef}
                      placeholder="Escribe un nombre de usuario ..."
                      className={mergeStyles({ marginBottom: '1rem' })}
                    />
                    <TextField
                      label='Contraseña:'
                      type="password"
                      canRevealPassword
                      revealPasswordAriaLabel="Mostrar contraseña"
                      componentRef={passwordRef}
                      placeholder="Escribe una contraseña ..."
                    />
                  </Stack>
                  <Stack horizontal horizontalAlign="space-around">
                    <DefaultButton
                      primary
                      text="Guardar"
                      onClick={() => {
                        const userName = userNameRef.current?.value
                        if (!userName) {
                          return
                        }
                        const password = passwordRef.current?.value
                        if (!password) {
                          return
                        }
                        if (userName === password) {
                          return
                        }
                        app.changeCredentials(userName, password)
                        dismissChangeCredentials()
                      }}
                    />
                    <DefaultButton
                      text="Cancelar"
                      onClick={dismissChangeCredentials}
                    />
                  </Stack>
                </Alert>
              )}
            </MemoryRouter>
          </Stack>
        </React.Fragment>
      )}
    </Stack>
  )
}
ReactDOM.render(<AdminDashboard />, document.getElementById('root'))