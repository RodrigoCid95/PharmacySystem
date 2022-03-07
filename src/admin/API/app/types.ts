export type AppAPI = {
  createBackup: () => Promise<void>
  restoreBackup: () => Promise<void>
  changeCredentials: (userName: string, password: string) => void
}
export default null