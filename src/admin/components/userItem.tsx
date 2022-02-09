import React from "react"
import { Persona, PersonaSize, PersonaPresence } from "@fluentui/react/lib/Persona"
import { ContextualMenu, DirectionalHint } from '@fluentui/react/lib/ContextualMenu'
import { mergeStyleSets } from "@fluentui/merge-styles/lib/mergeStyleSets"
import { useBoolean } from "@fluentui/react-hooks"
import Confirm from "./confirm"
// eslint-disable-next-line import/no-unresolved
import { User } from './../API/users/types'
export interface UserItem extends User {
  initials: string
}
interface UserItemComponentProps {
  item: UserItem
  onDelete: (id: User['id']) => void
  onEdit: (item: UserItem) => void
}
const styles = mergeStyleSets({
  root: {
    userSelect: 'none',
    maxWidth: '250px'
  }
})
export const UserItemComponent: React.FC<UserItemComponentProps> = ({ item, onEdit, onDelete }) => {
  const personRef = React.useRef(null)
  const [isOpenMenu, { setTrue: showMenu, setFalse: hideMenu }] = useBoolean(false)
  const [isOpenConfirm, { setTrue: showConfirm, setFalse: hideConfirm }] = useBoolean(false)
  if (personRef.current) {
    (personRef.current as HTMLElement).oncontextmenu = () => false
  }
  return (
    <React.Fragment>
      <Persona
        ref={personRef}
        className={styles.root}
        imageInitials={item.initials}
        text={item.userName}
        optionalText={item.name}
        showSecondaryText
        secondaryText={item.disabled ? 'Deshabilitado' : 'Habilitado'}
        size={PersonaSize.size56}
        onContextMenu={e => {
          e.preventDefault()
          showMenu()
        }}
        presence={item.disabled ? PersonaPresence.offline : PersonaPresence.online}
      />
      {isOpenConfirm && (
        <Confirm
          title="Eliminar usuario"
          text="¿Estás segur@ de eliminar este usuario?"
          textYes="Borrar"
          onCancel={hideConfirm}
          onNo={hideConfirm}
          onYes={() => {
            hideConfirm()
            onDelete(item.id)
          }}
        />
      )}
      <ContextualMenu
        items={[
          {
            key: 'edit',
            text: 'Editar',
            iconProps: { iconName: 'EditContact' },
            onClick: () => onEdit(item)
          },
          {
            key: 'delete',
            text: 'Eliminar',
            iconProps: { iconName: 'UserRemove' },
            onClick: showConfirm
          }
        ]}
        hidden={!isOpenMenu}
        target={personRef}
        onItemClick={hideMenu}
        onDismiss={hideMenu}
        directionalHint={DirectionalHint.rightCenter}
        isBeakVisible
      />
    </React.Fragment>
  )
}