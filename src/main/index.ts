import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { STEP400Controller } from './step400'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const step400 = new STEP400Controller('10.0.0.101', 50000)
  step400.open()

  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.on('step400:setCurrentMode', (_event, motorID: number) => {
    step400.setCurrentMode(motorID)
  })

  ipcMain.on('step400:setTval', (_event, motorID: number, tval: number) => {
    step400.setTval(motorID, tval)
  })

  ipcMain.on('step400:setSpeed', (_event, motorID: number, speed: number) => {
    step400.setSpeed(motorID, speed)
  })

  ipcMain.on('step400:run', (_event, motorID: number, speed: number) => {
    step400.run(motorID, speed)
  })

  ipcMain.on('step400:softStop', (_event, motorID: number) => {
    step400.softStop(motorID)
  })

  ipcMain.on('step400:softHiZ', (_event, motorID: number) => {
    step400.softHiZ(motorID)
  })

  ipcMain.on('step400:goTo', (_event, motorID: number, position: number) => {
    step400.goTo(motorID, position)
  })

  ipcMain.on('step400:move', (_event, motorID: number, steps: number) => {
    step400.move(motorID, steps)
  })

  ipcMain.on('step400:goHome', (_event, motorID: number) => {
    step400.goHome(motorID)
  })

  ipcMain.on('step400:homing', (_event, motorID: number) => {
    step400.homing(motorID)
  })

  ipcMain.on('step400:setStepMode', (_event, motorID: number, stepMode: number) => {
    step400.setStepMode(motorID, stepMode)
  })

  ipcMain.on('step400:getMicrostepMode', (_event, motorID: number) => {
    step400.getMicrostepMode(motorID)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed
app.on('window-all-closed', () => {
  app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
