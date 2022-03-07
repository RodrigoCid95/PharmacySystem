import React from 'react'
import ReactDOM from 'react-dom'
import { IStackTokens, Stack } from '@fluentui/react/lib/Stack'
import { TextField } from '@fluentui/react/lib/TextField'
import { DefaultButton } from '@fluentui/react/lib/Button'
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar'
import { mergeStyles } from '@fluentui/react/lib/Styling'
import { initializeIcons } from '@fluentui/font-icons-mdl2'
import { Auth } from './API'

initializeIcons('./fonts/')

declare const auth: Auth

mergeStyles({
  ':global(body,html,#root)': {
    margin: 0,
    padding: 0,
    height: '100vh',
  },
})

const stackTokens: IStackTokens = { childrenGap: 15 }
const SignIn: React.FC = () => {
  const [userName, setUserName] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  return (
    <Stack horizontalAlign="center" verticalAlign="center" verticalFill styles={{ root: { width: '80%', margin: '0 auto', textAlign: 'center', color: '#605e5c' } }} tokens={stackTokens}>
      <Stack>
        {error !== '' && (
          <MessageBar
            messageBarType={MessageBarType.error}
            onDismiss={() => setError('')}
            dismissButtonAriaLabel="Close"
          >
            {error}
          </MessageBar>
        )}
        <TextField
          label="Nombre de usuario:"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => setUserName(e.target.value)}
        />
        <TextField
          label="Contraseña:"
          type="password"
          canRevealPassword
          revealPasswordAriaLabel="Mostrar contraseña"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e: any) => setPassword(e.target.value)}
        />
      </Stack>
      <DefaultButton
        primary
        styles={{ root: { justifyContent: 'center' } }}
        text="Entrar"
        onClick={() => {
          setError('')
          if (userName === '') {
            setError('Escribe un nombre de usuario!')
          } else if (password === '') {
            setError('Escribe una contraseña!')
          } else {
            auth.enter(userName, password, false).then(() => {
              console.log('Ready!')
            }).catch((error: Error) => {
              console.error(error)
              setError(error.message)
            })
          }
        }}
        split
        menuProps={{
          items: [
            {
              key: 'enterAsAdmin',
              text: 'Entrar como administrador',
              iconProps: { iconName: 'Admin' },
              onClick: () => {
                setError('')
                if (userName === '') {
                  setError('Escribe un nombre de usuario!')
                } else if (password === '') {
                  setError('Escribe una contraseña!')
                } else {
                  auth.enter(userName, password, true).catch((error: Error) => {
                    console.error(error)
                    setError(error.message)
                  })
                }
              }
            }
          ]
        }}
      />
    </Stack>
  )
}
ReactDOM.render(<SignIn />, document.getElementById('root'))