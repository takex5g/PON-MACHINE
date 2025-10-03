import * as osc from 'osc'
import { EventEmitter } from 'events'

const DEFAULT_STEP400_IP = '10.0.0.101'

export class STEP400Controller extends EventEmitter {
  private udpPort: osc.UDPPort
  private remoteAddress: string
  private remotePort: number
  private localPort: number
  private positionReportIntervals: Map<number, NodeJS.Timeout> = new Map()
  private motorPositions: Map<number, number> = new Map()

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
      const values = oscMsg.args?.map((arg: any) => arg.value) || []
      console.log(`Received OSC message: ${oscMsg.address}`, values)

      switch (oscMsg.address) {
        case '/destIp':
          console.log(`Destination IP confirmed: ${values.slice(0, 4).join('.')}`)
          break
        case '/microstepMode':
          console.log(`Motor ${values[0]} - Microstep Mode: ${values[1]}`)
          break
        case '/position':
          this.motorPositions.set(values[0], values[1])
          this.displayPositions()
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

  setDestIp(ip: string): void {
    const octets = ip.split('.').map(Number)
    this.udpPort.send({
      address: '/setDestIp',
      args: [
        { type: 'i', value: octets[0] },
        { type: 'i', value: octets[1] },
        { type: 'i', value: octets[2] },
        { type: 'i', value: octets[3] }
      ]
    })
  }

  close(): void {
    this.stopPositionReport()
    this.udpPort.close()
  }

  private displayPositions(): void {
    const pos1 = this.motorPositions.get(1) ?? '---'
    const pos2 = this.motorPositions.get(2) ?? '---'

    console.log(` Motor 1: ${String(pos1).padStart(8)}  Motor 2: ${String(pos2).padStart(8)} `)
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

  // Start periodic position reporting
  startPositionReport(motorID: number, intervalMs = 1000): void {
    this.stopPositionReport(motorID)
    console.log(`Starting position report for motor ${motorID} every ${intervalMs}ms`)
    const interval = setInterval(() => {
      this.getPosition(motorID)
    }, intervalMs)
    this.positionReportIntervals.set(motorID, interval)
  }

  // Stop periodic position reporting
  stopPositionReport(motorID?: number): void {
    if (motorID !== undefined) {
      const interval = this.positionReportIntervals.get(motorID)
      if (interval) {
        clearInterval(interval)
        this.positionReportIntervals.delete(motorID)
      }
    } else {
      // Stop all if no motorID specified
      this.positionReportIntervals.forEach((interval) => clearInterval(interval))
      this.positionReportIntervals.clear()
    }
  }

  // Custom helper: Move motor to close position (-5000)
  // Uses high TVAL (strong torque) and slow speed for closing
  moveToClosePosition(motorID: number): void {
    console.log('CLOSE')
    const closeTval = 60 // Strong torque
    const closeSpeed = 400 // Slow speed

    // Set TVAL for closing
    this.udpPort.send({
      address: '/setTval',
      args: [
        { type: 'i', value: motorID },
        { type: 'i', value: 2 }, // TVAL_HOLD
        { type: 'i', value: closeTval }, // TVAL_RUN
        { type: 'i', value: closeTval }, // TVAL_ACC
        { type: 'i', value: closeTval } // TVAL_DEC
      ]
    })

    // Set speed profile for closing
    this.udpPort.send({
      address: '/setSpeedProfile',
      args: [
        { type: 'i', value: motorID },
        { type: 'f', value: 2000.0 }, // acc
        { type: 'f', value: 2000.0 }, // dec
        { type: 'f', value: closeSpeed } // maxSpeed
      ]
    })

    //モーターID1の場合は-3900, モーターID2の場合は-2700動かす
    if (motorID === 1) {
      this.goTo(motorID, -3900)
    } else if (motorID === 2) {
      this.goTo(motorID, -2900)
    }
  }

  // Custom helper: Move motor to open position (home: 0)
  // Uses low TVAL (less torque) and high speed for opening
  moveToOpenPosition(motorID: number): void {
    console.log('OPEN')
    const openTval = 9 // Light torque
    const openSpeed = 900 // Fast speed

    // Set TVAL for opening
    this.udpPort.send({
      address: '/setTval',
      args: [
        { type: 'i', value: motorID },
        { type: 'i', value: 2 }, // TVAL_HOLD
        { type: 'i', value: openTval }, // TVAL_RUN
        { type: 'i', value: openTval }, // TVAL_ACC
        { type: 'i', value: openTval } // TVAL_DEC
      ]
    })

    // Set speed profile for opening
    this.udpPort.send({
      address: '/setSpeedProfile',
      args: [
        { type: 'i', value: motorID },
        { type: 'f', value: 2000.0 }, // acc
        { type: 'f', value: 2000.0 }, // dec
        { type: 'f', value: openSpeed } // maxSpeed
      ]
    })

    // Execute movement
    // setTimeout(() => {
    this.goHome(motorID)
    // }, 100)
  }
}
