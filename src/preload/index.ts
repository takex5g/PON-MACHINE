import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  atem: {
    connect: (ip?: string) => ipcRenderer.invoke('atem:connect', ip),
    disconnect: () => ipcRenderer.invoke('atem:disconnect'),
    getStatus: () => ipcRenderer.invoke('atem:getStatus'),
    switchCamera: (cameraId: number) => ipcRenderer.invoke('atem:switchCamera', cameraId)
  },
  midi: {
    sendPort3Note: (note: string) => ipcRenderer.send('midi:port3Note', note)
  },
  step400: {
    setCurrentMode: (motorID: number) => ipcRenderer.send('step400:setCurrentMode', motorID),
    setTval: (motorID: number, tval: number) => ipcRenderer.send('step400:setTval', motorID, tval),
    setSpeed: (motorID: number, speed: number) =>
      ipcRenderer.send('step400:setSpeed', motorID, speed),
    run: (motorID: number, speed: number) => ipcRenderer.send('step400:run', motorID, speed),
    softStop: (motorID: number) => ipcRenderer.send('step400:softStop', motorID),
    softHiZ: (motorID: number) => ipcRenderer.send('step400:softHiZ', motorID),
    goTo: (motorID: number, position: number) =>
      ipcRenderer.send('step400:goTo', motorID, position),
    move: (motorID: number, steps: number) => ipcRenderer.send('step400:move', motorID, steps),
    goHome: (motorID: number) => ipcRenderer.send('step400:goHome', motorID),
    homing: (motorID: number) => ipcRenderer.send('step400:homing', motorID),
    setHomingDirection: (motorID: number, direction: number) =>
      ipcRenderer.send('step400:setHomingDirection', motorID, direction),
    setHomeSwMode: (motorID: number, switchMode: number) =>
      ipcRenderer.send('step400:setHomeSwMode', motorID, switchMode),
    setStepMode: (motorID: number, stepMode: number) =>
      ipcRenderer.send('step400:setStepMode', motorID, stepMode),
    getMicrostepMode: (motorID: number) => ipcRenderer.send('step400:getMicrostepMode', motorID),
    getPosition: (motorID: number) => ipcRenderer.send('step400:getPosition', motorID),
    getStatus: (motorID: number) => ipcRenderer.send('step400:getStatus', motorID),
    getBusy: (motorID: number) => ipcRenderer.send('step400:getBusy', motorID),
    getHiZ: (motorID: number) => ipcRenderer.send('step400:getHiZ', motorID),
    getDir: (motorID: number) => ipcRenderer.send('step400:getDir', motorID),
    moveToOpenPosition: (motorID: number) => ipcRenderer.send('step400:moveToOpenPosition', motorID),
    moveToClosePosition: (motorID: number) =>
      ipcRenderer.send('step400:moveToClosePosition', motorID)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
