import { ElectronAPI } from '@electron-toolkit/preload'

interface ATEMAPI {
  connect: (ip?: string) => Promise<{ success: boolean; error?: string }>
  disconnect: () => Promise<{ success: boolean }>
  getStatus: () => Promise<{ connected: boolean; ipAddress: string }>
  switchCamera: (cameraId: number) => Promise<{ success: boolean; error?: string }>
}

interface MidiAPI {
  sendPort3Note: (note: string) => void
}

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
  getPosition: (motorID: number) => void
  getStatus: (motorID: number) => void
  getBusy: (motorID: number) => void
  getHiZ: (motorID: number) => void
  getDir: (motorID: number) => void
  moveToOpenPosition: (motorID: number) => void
  moveToClosePosition: (motorID: number) => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      atem: ATEMAPI
      midi: MidiAPI
      step400: STEP400API
    }
  }
}
