export type User = {
  id?: string
  name: string
  userName: string
  disabled: boolean
}
export interface DataUser extends User {
  hashPassword: string
}
export type UsersAPI = {
  create: (user: User, password: string) => Promise<void>
  read: () => Promise<User[]>
  update: (user: User) => Promise<void>
  delete: (id: User['id']) => Promise<void>
}
export default null