import React from 'react'
import { Modal } from '@fluentui/react/lib/Modal'
import { Stack } from '@fluentui/react/lib/Stack'
import { mergeStyleSets } from '@fluentui/react/lib/Styling'
import { IButtonStyles, IconButton } from '@fluentui/react/lib/Button'
import { FontWeights, getTheme } from '@fluentui/style-utilities/lib/styles'
const theme = getTheme()
const contentStyles = mergeStyleSets({
  container: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'stretch',
  },
  header: [
    theme.fonts.xLargePlus,
    {
      flex: '1 1 auto',
      borderTop: `4px solid ${theme.palette.themePrimary}`,
      color: theme.palette.neutralPrimary,
      display: 'flex',
      alignItems: 'center',
      fontWeight: FontWeights.semibold,
      padding: '12px 12px 14px 24px',
    },
  ],
  body: {
    flex: '4 4 auto',
    padding: '0 24px 24px 24px',
    overflowY: 'hidden'
  },
})
const iconButtonStyles: Partial<IButtonStyles> = {
  root: {
    color: theme.palette.neutralPrimary,
    marginLeft: 'auto',
    marginTop: '4px',
    marginRight: '2px',
  },
  rootHovered: {
    color: theme.palette.neutralDark,
  },
}
interface AlertProps { onDismiss: () => void; title: string }
const Alert: React.FC<AlertProps> = ({ onDismiss, title, children }) => (
  <Modal
    isOpen
    onDismiss={onDismiss}
    isBlocking={false}
    containerClassName={contentStyles.container}
  >
    <div className={contentStyles.header}>
      <span>{title}</span>
      <IconButton
        styles={iconButtonStyles}
        iconProps={{ iconName: 'Cancel' }}
        ariaLabel="Cerrar"
        onClick={onDismiss}
      />
    </div>
    <div className={contentStyles.body}>
      <Stack styles={{ root: { width: '300px' } }}>
        {children}
      </Stack>
    </div>
  </Modal>
)
export default Alert