import React from "react"
import { DefaultButton } from "@fluentui/react/lib/Button"
import { Stack } from "@fluentui/react/lib/Stack"
import { TextField } from "@fluentui/react/lib/TextField"
import { Toggle } from "@fluentui/react/lib/Toggle"
import { MessageBar, MessageBarType } from "@fluentui/react/lib/MessageBar"
import Loading from './loading'
import Alert from './alert'
import { User, UsersAPI } from './../API/users/types'
declare const users: UsersAPI
interface UserComponentProps {
  user: User | undefined
  onDismiss: () => void
}
interface UserComponentState {
  loading: boolean
  error: string
  user: User
  password: string
}
export default class UserComponent extends React.Component<UserComponentProps, UserComponentState> {
  constructor(props: UserComponentProps) {
    super(props)
    this.state = {
      loading: false,
      error: '',
      user: props.user || {
        id: '',
        userName: '',
        name: '',
        disabled: false
      },
      password: ''
    }
  }
  private _handlerOnSave() {
    const { user, password } = this.state
    const { id, userName, name } = user
    if (userName === '') {
      this.setState({ error: 'Escribe un nombre de usuario!' })
      return
    }
    if (name === '') {
      this.setState({ error: 'Escribe el nombre del usuario!' })
      return
    }
    if (user.id === '' && password === '') {
      this.setState({ error: 'Escribe una contraseña!' })
      return
    }
    this.setState({ loading: true })
    if (id === '') {
      users.create(user, password).then(this.props.onDismiss).catch((error: Error) => {
        console.error(error)
        this.setState({ loading: false, error: error.message })
      })
    } else {
      users.update(user).then(this.props.onDismiss).catch((error: Error) => {
        console.error(error)
        this.setState({ loading: false, error: error.message })
      })
    }
  }
  render() {
    const { onDismiss } = this.props
    const { loading, error, user, password } = this.state
    return (
      <Alert
        title={`${user.id === '' ? 'Nuevo' : 'Editar'} usuario`}
        onDismiss={onDismiss}
      >
        {loading && (
          <Stack styles={{ root: { marginTop: '1rem' } }}>
            <Loading label="Cargando ..." />
          </Stack>
        )}
        {!loading && (
          <React.Fragment>
            <Stack>
              {error !== '' && <MessageBar
                messageBarType={MessageBarType.error}
                onDismiss={() => this.setState({ error: '' })}
                dismissButtonAriaLabel="Cerrar"
              >
                {error}
              </MessageBar>}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <TextField defaultValue={user.userName} required label="Nombre de usuario" onChange={(e: any) => this.setState({ user: { ...user, userName: e.target.value } })} />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <TextField defaultValue={user.name} required label="Nombre completo" onChange={(e: any) => this.setState({ user: { ...user, name: e.target.value } })} />
            </Stack>
            <Stack styles={{ root: { paddingTop: '1rem' } }}>
              <Toggle
                defaultChecked={!user.disabled}
                onChange={() => this.setState({ user: { ...user, disabled: !user.disabled } })}
                inlineLabel
                onText="Habilitado"
                offText="Deshabilitado"
              />
            </Stack>
            {user.id === '' && (
              <Stack styles={{ root: { marginBottom: '1rem' } }}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <TextField defaultValue={password} required type="password" label="Contraseña" onChange={(e: any) => this.setState({ password: e.target.value })} />
              </Stack>
            )}
            <Stack horizontal horizontalAlign="space-around">
              <DefaultButton
                primary
                text='Guardar'
                onClick={this._handlerOnSave.bind(this)}
              />
              <DefaultButton
                text='Cancelar'
                onClick={onDismiss}
              />
            </Stack>
          </React.Fragment>
        )}
      </Alert>
    )
  }
}
