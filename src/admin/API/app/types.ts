export type AppAPI = {
  createBackup: () => Promise<void>
  restoreBackup: () => Promise<void>
}
export default null