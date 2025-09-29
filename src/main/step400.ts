import * as osc from 'osc'
import { EventEmitter } from 'events'

const DEFAULT_STEP400_IP = '10.0.0.101'

export class STEP400Controller extends EventEmitter {
  private udpPort: osc.UDPPort
  private remoteAddress: string
  private remotePort: number
  private localPort: number

  constructor(remoteAddress = DEFAULT_STEP400_IP, remotePort = 50000, deviceID = 1) {
    super()
    this.remoteAddress = remoteAddress
    this.remotePort = remotePort
    // STEP400 sends responses to port 50100 + deviceID
    this.localPort = 50100 + deviceID

    this.udpPort = new osc.UDPPort({
      localAddress: '0.0.0.0',
      localPort: this.localPort,
      remoteAddress: this.remoteAddress,
      remotePort: this.remotePort,
      metadata: true
    })

    this.udpPort.on('ready', () => {
      console.log('STEP400 OSC connection ready')
    })

    this.udpPort.on('error', (error) => {
      console.error('STEP400 OSC error:', error)
    })

    this.udpPort.on('message', (oscMsg) => {
      // Parse and display message in readable format
      const values = oscMsg.args?.map((arg: any) => arg.value) || []

      switch (oscMsg.address) {
        case '/destIp':
          console.log(`Destination IP confirmed: ${values.slice(0, 4).join('.')}`)
          break
        case '/microstepMode':
          console.log(`Motor ${values[0]} - Microstep Mode: ${values[1]}`)
          break
        case '/position':
          console.log(`Motor ${values[0]} - Position: ${values[1]}`)
          break
        case '/busy':
          console.log(`Motor ${values[0]} - Busy: ${values[1] ? 'Yes' : 'No'}`)
          break
        case '/HiZ':
          console.log(`Motor ${values[0]} - HiZ: ${values[1] ? 'Yes' : 'No'}`)
          break
        case '/motorStatus':
          console.log(`Motor ${values[0]} - Status: ${values[1]}`)
          break
        case '/dir':
          console.log(`Motor ${values[0]} - Direction: ${values[1] ? 'Forward' : 'Reverse'}`)
          break
        case '/booted':
          console.log('STEP400 has booted')
          break
        default:
          console.log(`${oscMsg.address}: [${values.join(', ')}]`)
      }

      this.emit('message', oscMsg)
    })
  }

  open(): void {
    this.udpPort.open()
  }

  close(): void {
    this.udpPort.close()
  }

  setCurrentMode(motorID: number): void {
    this.udpPort.send({
      address: '/setCurrentMode',
      args: [{ type: 'i', value: motorID }]
    })
  }

  setTval(motorID: number, tval: number): void {
    // Based on profile: HOLD=4, RUN/ACC/DEC=variable
    const holdTval = 2 // Lower value for holding to reduce heat
    this.udpPort.send({
      address: '/setTval',
      args: [
        { type: 'i', value: motorID },
        { type: 'i', value: holdTval }, // TVAL_HOLD
        { type: 'i', value: tval }, // TVAL_RUN
        { type: 'i', value: tval }, // TVAL_ACC
        { type: 'i', value: tval } // TVAL_DEC
      ]
    })
  }

  setSpeed(motorID: number, speed: number): void {
    this.udpPort.send({
      address: '/setSpeedProfile',
      args: [
        { type: 'i', value: motorID },
        { type: 'f', value: 2000.0 }, // acc (from profile)
        { type: 'f', value: 2000.0 }, // dec (from profile)
        { type: 'f', value: speed } // maxSpeed
      ]
    })
  }

  run(motorID: number, speed: number): void {
    this.udpPort.send({
      address: '/run',
      args: [
        { type: 'i', value: motorID },
        { type: 'f', value: speed }
      ]
    })
  }

  softStop(motorID: number): void {
    this.udpPort.send({
      address: '/softStop',
      args: [{ type: 'i', value: motorID }]
    })
  }

  softHiZ(motorID: number): void {
    this.udpPort.send({
      address: '/softHiZ',
      args: [{ type: 'i', value: motorID }]
    })
  }

  hardStop(motorID: number): void {
    this.udpPort.send({
      address: '/hardStop',
      args: [{ type: 'i', value: motorID }]
    })
  }

  goTo(motorID: number, position: number): void {
    this.udpPort.send({
      address: '/goTo',
      args: [
        { type: 'i', value: motorID },
        { type: 'i', value: position }
      ]
    })
  }

  move(motorID: number, steps: number): void {
    this.udpPort.send({
      address: '/move',
      args: [
        { type: 'i', value: motorID },
        { type: 'i', value: steps }
      ]
    })
  }

  goHome(motorID: number): void {
    this.udpPort.send({
      address: '/goHome',
      args: [{ type: 'i', value: motorID }]
    })
  }

  homing(motorID: number): void {
    this.udpPort.send({
      address: '/homing',
      args: [{ type: 'i', value: motorID }]
    })
  }

  setStepMode(motorID: number, stepMode: number): void {
    console.log('setStepMote')
    this.udpPort.send({
      address: '/setMicrostepMode',
      args: [
        { type: 'i', value: motorID },
        { type: 'i', value: stepMode }
      ]
    })
    setTimeout(() => {
      this.getMicrostepMode(motorID)
    }, 100)
  }

  getMicrostepMode(motorID: number): void {
    this.udpPort.send({
      address: '/getMicrostepMode',
      args: [{ type: 'i', value: motorID }]
    })
  }

  getPosition(motorID: number): void {
    this.udpPort.send({
      address: '/getPosition',
      args: [{ type: 'i', value: motorID }]
    })
  }

  getStatus(motorID: number): void {
    this.udpPort.send({
      address: '/getStatus',
      args: [{ type: 'i', value: motorID }]
    })
  }

  getBusy(motorID: number): void {
    this.udpPort.send({
      address: '/getBusy',
      args: [{ type: 'i', value: motorID }]
    })
  }

  getHiZ(motorID: number): void {
    this.udpPort.send({
      address: '/getHiZ',
      args: [{ type: 'i', value: motorID }]
    })
  }

  getDir(motorID: number): void {
    this.udpPort.send({
      address: '/getDir',
      args: [{ type: 'i', value: motorID }]
    })
  }

  // Enable automatic status updates
  enableBusyReport(motorID: number, enable: boolean): void {
    this.udpPort.send({
      address: '/enableBusyReport',
      args: [
        { type: 'i', value: motorID },
        { type: 'i', value: enable ? 1 : 0 }
      ]
    })
  }

  enableHizReport(motorID: number, enable: boolean): void {
    this.udpPort.send({
      address: '/enableHizReport',
      args: [
        { type: 'i', value: motorID },
        { type: 'i', value: enable ? 1 : 0 }
      ]
    })
  }

  enableDirReport(motorID: number, enable: boolean): void {
    this.udpPort.send({
      address: '/enableDirReport',
      args: [
        { type: 'i', value: motorID },
        { type: 'i', value: enable ? 1 : 0 }
      ]
    })
  }

  enableMotorStatusReport(motorID: number, enable: boolean): void {
    this.udpPort.send({
      address: '/enableMotorStatusReport',
      args: [
        { type: 'i', value: motorID },
        { type: 'i', value: enable ? 1 : 0 }
      ]
    })
  }
}
