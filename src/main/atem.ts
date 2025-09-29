import { Atem } from 'atem-connection'
import { ipcMain } from 'electron'

class ATEMManager {
  private atem: Atem | null = null
  private connected = false
  private ipAddress = '169.254.154.142'

  constructor() {
    this.setupIPCHandlers()
  }

  private setupIPCHandlers() {
    ipcMain.handle('atem:connect', async (_, ip?: string) => {
      if (ip) {
        this.ipAddress = ip
      }
      return await this.connect()
    })

    ipcMain.handle('atem:disconnect', async () => {
      return await this.disconnect()
    })

    ipcMain.handle('atem:getStatus', () => {
      return {
        connected: this.connected,
        ipAddress: this.ipAddress
      }
    })

    ipcMain.handle('atem:switchCamera', async (_, cameraId: number) => {
      return await this.switchCamera(cameraId)
    })
  }

  async connect(): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.atem && this.connected) {
        await this.disconnect()
      }

      this.atem = new Atem()

      this.atem.on('connected', () => {
        this.connected = true
        console.log('ATEM connected to', this.ipAddress)
      })

      this.atem.on('disconnected', () => {
        this.connected = false
        console.log('ATEM disconnected')
      })

      this.atem.on('error', (error) => {
        console.error('ATEM error:', error)
      })

      await this.atem.connect(this.ipAddress)

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          if (!this.connected) {
            resolve({ success: false, error: 'Connection timeout' })
          }
        }, 5000)

        this.atem?.once('connected', () => {
          clearTimeout(timeout)
          resolve({ success: true })
        })
      })
    } catch (error) {
      console.error('Failed to connect to ATEM:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async disconnect(): Promise<{ success: boolean }> {
    try {
      if (this.atem) {
        await this.atem.disconnect()
        this.atem = null
        this.connected = false
      }
      return { success: true }
    } catch (error) {
      console.error('Failed to disconnect from ATEM:', error)
      return { success: false }
    }
  }

  async switchCamera(cameraId: number): Promise<{ success: boolean; error?: string }> {
    if (!this.atem || !this.connected) {
      return { success: false, error: 'ATEM not connected' }
    }

    try {
      // トランジション時間を500ms（0.5秒）に設定
      await this.atem.setTransitionSettings({
        nextTransition: {
          selection: 1 // BKGD (Background)
        }
      }, 0)

      // MIXトランジションに設定し、時間を設定
      await this.atem.setTransitionStyle({
        style: 0, // 0 = MIX (フェード)
        nextStyle: 0
      }, 0)

      await this.atem.setTransitionMixSettings({
        rate: 25 // 25フレーム（約0.5秒 @ 50fps）
      }, 0)

      // プレビューにカメラを設定
      await this.atem.changePreviewInput(cameraId)

      // オートトランジション実行（フェード切り替え）
      await this.atem.autoTransition(0)

      console.log(`Faded to camera ${cameraId}`)
      return { success: true }
    } catch (error) {
      console.error('Failed to switch camera:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  handleMidiNote(note: string) {
    const cameraMapping: { [key: string]: number } = {
      C: 1,
      D: 2,
      E: 3,
      F: 4
    }

    const cameraId = cameraMapping[note]
    if (cameraId) {
      this.switchCamera(cameraId)
    }
  }
}

export const atemManager = new ATEMManager()
