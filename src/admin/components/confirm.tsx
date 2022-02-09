import React from 'react'
import { Stack } from '@fluentui/react/lib/Stack'
import { Text } from '@fluentui/react/lib/Text'
import Alert from './alert'
import { DefaultButton } from '@fluentui/react/lib/Button'
import { mergeStyleSets } from '@fluentui/react/lib/Styling'
interface ConfirmProps {
  title: string
  text: string
  textYes: string
  textNo?: string
  onCancel: () => void
  onYes: () => void
  onNo: () => void
}
const styles = mergeStyleSets({
  buttons: {
    marginTop: '1rem!important'
  }
})
const Confirm: React.FC<ConfirmProps> = ({ title, text, textYes, textNo, onCancel, onYes, onNo }) => {
  return (
    <Alert
      onDismiss={onCancel}
      title={title}
    >
      <Stack>
        <Text variant="large">{text}</Text>
      </Stack>
      <Stack horizontal horizontalAlign="space-around" className={styles.buttons}>
        {textYes && textYes !== '' && (
          <DefaultButton
            primary
            text={textYes}
            onClick={onYes}
          />
        )}
        <DefaultButton
          text={textNo || 'Cancelar'}
          onClick={onNo}
        />
      </Stack>
    </Alert>
  )
}
export default Confirm