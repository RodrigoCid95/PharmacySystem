import { app, BrowserWindow, ipcMain, dialog } from 'electron'
declare const LOGIN_WINDOW_WEBPACK_ENTRY: string
declare const LOGIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string
declare const ADMIN_WINDOW_WEBPACK_ENTRY: string
declare const ADMIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string
/* declare const ADMIN_WINDOW_WEBPACK_ENTRY: string
declare const ADMIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string */
(async () => {
  if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit()
  }
  const createWindow = (): void => {
    const loginWindow = new BrowserWindow({
      width: 480,
      height: 530,
      resizable: false,
      maximizable: false,
      minimizable: false,
      show: false,
      title: 'Iniciar sesión',
      webPreferences: {
        preload: LOGIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        nodeIntegration: true,
        contextIsolation: true
      }
    })
    loginWindow.on('ready-to-show', () => {
      loginWindow.show()
    })
    loginWindow.loadURL(LOGIN_WINDOW_WEBPACK_ENTRY)
    ipcMain.on('reset', () => app.relaunch())
    ipcMain.on('open-main-window', () => {
      const adminWindow = new BrowserWindow({
        height: 600,
        width: 800,
        show: false,
        title: 'Pharmacy System',
        webPreferences: {
          preload: ADMIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
          nodeIntegration: true,
          contextIsolation: true
        }
      })
      adminWindow.on('ready-to-show', () => {
        loginWindow.destroy()
        adminWindow.show()
      })
      /* adminWindow.webContents.openDevTools() */
      adminWindow.loadURL(ADMIN_WINDOW_WEBPACK_ENTRY)
      ipcMain.on('open-save-dialog', (e, filters) => {
        const pathSave = dialog.showSaveDialogSync(adminWindow, {
          title: 'Guardar como...',
          filters
        })
        e.returnValue = pathSave
      })
      ipcMain.on('open-open-dialog', (e, filters) => {
        const pathOpen = dialog.showOpenDialogSync(adminWindow, {
          title: 'Abrir archivo',
          filters
        })
        e.returnValue = pathOpen ? pathOpen[0] : ''
      })
    })
    /* ipcMain.on('open-admin-window', () => {
      const mainWindowAdmin = new BrowserWindow({
        minHeight: 700,
        width: 800,
        show: false,
        title: 'Pharmacy System - Administrador',
        webPreferences: {
          preload: ADMIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
          nodeIntegration: true,
          contextIsolation: true
        }
      })
      mainWindowAdmin.on('ready-to-show', () => {
        loginWindow.destroy()
        mainWindowAdmin.show()
      })
      mainWindowAdmin.loadURL(ADMIN_WINDOW_WEBPACK_ENTRY)
      mainWindowAdmin.webContents.openDevTools()
    }) */
  }
  app.whenReady().then(createWindow)
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})()