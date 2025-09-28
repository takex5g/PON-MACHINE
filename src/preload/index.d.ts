import { ElectronAPI } from '@electron-toolkit/preload'

interface STEP400API {
  setCurrentMode: (motorID: number) => void
  setTval: (motorID: number, tval: number) => void
  setSpeed: (motorID: number, speed: number) => void
  run: (motorID: number, speed: number) => void
  softStop: (motorID: number) => void
  softHiZ: (motorID: number) => void
  goTo: (motorID: number, position: number) => void
  move: (motorID: number, steps: number) => void
  goHome: (motorID: number) => void
  homing: (motorID: number) => void
  setStepMode: (motorID: number, stepMode: number) => void
  getMicrostepMode: (motorID: number) => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      step400: STEP400API
    }
  }
}
