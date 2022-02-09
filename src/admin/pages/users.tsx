import React from 'react'
import { Stack } from '@fluentui/react/lib/Stack'
import { CommandBar } from '@fluentui/react/lib/CommandBar'
import { mergeStyleSets } from '@fluentui/react/lib/Styling'
import UserComponent from '../components/user'
import { User, UsersAPI } from './../API/users/types'
import { UserItemComponent, UserItem } from './../components/userItem'
declare const users: UsersAPI
const styles = mergeStyleSets({
  list: {
    marginTop: '1rem!important'
  }
})
interface UsersPageState {
  currentUser: User | undefined
  isModalOpen: boolean
  items: UserItem[]
}
export default class UsersPage extends React.Component<object, UsersPageState> {
  constructor(props: object) {
    super(props)
    this.state = {
      currentUser: undefined,
      isModalOpen: false,
      items: []
    }
    this.loadUsers = this.loadUsers.bind(this)
  }
  componentDidMount() {
    this.loadUsers()
  }
  private loadUsers() {
    users.read().then(users => this.setState({ items: users.map(({ id, userName, name, disabled }) => ({ id, userName, name, disabled, initials: (() => name.split(' ').map(world => world[0]).join(''))().toUpperCase() })) }))
  }
  render() {
    const { currentUser, isModalOpen, items } = this.state
    return (
      <React.Fragment>
        <Stack tokens={{ childrenGap: 10 }}>
          <CommandBar
            items={[
              {
                key: 'new',
                text: 'Nuevo',
                iconProps: { iconName: 'Add' },
                onClick: () => this.setState({ currentUser: undefined, isModalOpen: true })
              }
            ]}
          />
        </Stack>
        <Stack className={styles.list} tokens={{ childrenGap: 10 }}>
          {items.map((item, i) => (
            <UserItemComponent
              key={i}
              item={item}
              onEdit={itm => this.setState({ currentUser: itm, isModalOpen: true })}
              onDelete={id => {
                users.delete(id).then(this.loadUsers).catch(error => console.error(error))
              }}
            />
          ))}
        </Stack>
        {isModalOpen && (
            <UserComponent
              onDismiss={() => {
                this.setState({ isModalOpen: false })
                this.loadUsers()
              }}
              user={currentUser}
            />
          )}
      </React.Fragment>
    )
  }
}