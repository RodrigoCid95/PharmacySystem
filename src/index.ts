import { app, BrowserWindow, ipcMain, dialog } from 'electron'
declare const LOGIN_WINDOW_WEBPACK_ENTRY: string
declare const LOGIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string
declare const ADMIN_WINDOW_WEBPACK_ENTRY: string
declare const ADMIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string
declare const CHECKOUT_BOX_WINDOW_WEBPACK_ENTRY: string
declare const CHECKOUT_BOX_WINDOW_PRELOAD_WEBPACK_ENTRY: string
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
      autoHideMenuBar: true,
      webPreferences: {
        preload: LOGIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        nodeIntegration: true,
        contextIsolation: true
      }
    })
    loginWindow.on('ready-to-show', () => {
      loginWindow.show()
      /* loginWindow.webContents.openDevTools() */
    })
    loginWindow.loadURL(LOGIN_WINDOW_WEBPACK_ENTRY)
    ipcMain.on('reset', () => app.relaunch())
    ipcMain.on('open-main-window', () => {
      const adminWindow = new BrowserWindow({
        minHeight: 600,
        minWidth: 800,
        fullscreen: true,
        show: false,
        title: 'Pharmacy System',
        autoHideMenuBar: true,
        webPreferences: {
          preload: ADMIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
          nodeIntegration: true,
          contextIsolation: true
        }
      })
      adminWindow.on('ready-to-show', () => {
        loginWindow.destroy()
        adminWindow.show()
        adminWindow.webContents.openDevTools()
      })
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
    ipcMain.on('open-checkout-box-window', (_, user) => {
      const mainWindowAdmin = new BrowserWindow({
        minHeight: 800,
        minWidth: 800,
        fullscreen: true,
        show: false,
        title: 'Pharmacy System - Caja',
        autoHideMenuBar: true,
        webPreferences: {
          preload: CHECKOUT_BOX_WINDOW_PRELOAD_WEBPACK_ENTRY,
          nodeIntegration: true,
          contextIsolation: true
        }
      })
      mainWindowAdmin.on('ready-to-show', () => {
        loginWindow.destroy()
        mainWindowAdmin.show()
        /* mainWindowAdmin.webContents.openDevTools() */
      })
      ipcMain.once('get-user', event => event.returnValue = user)
      mainWindowAdmin.loadURL(CHECKOUT_BOX_WINDOW_WEBPACK_ENTRY)
    })
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