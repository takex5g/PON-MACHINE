import { ElectronAPI } from '@electron-toolkit/preload'

interface STEP400API {
  setCurrentMode: (motorID: number) => void
  setTval: (motorID: number, tval: number) => void
  setSpeed: (motorID: number, speed: number) => void
  run: (motorID: number, speed: number) => void
  softStop: (motorID: number) => void
  softHiZ: (motorID: number) => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      step400: STEP400API
    }
  }
}
