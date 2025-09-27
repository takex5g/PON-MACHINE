import * as osc from 'osc'

export class STEP400Controller {
  private udpPort: osc.UDPPort
  private remoteAddress: string
  private remotePort: number

  constructor(remoteAddress = '10.0.0.101', remotePort = 50000) {
    this.remoteAddress = remoteAddress
    this.remotePort = remotePort

    this.udpPort = new osc.UDPPort({
      localAddress: '0.0.0.0',
      localPort: 57121,
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
    this.udpPort.send({
      address: '/setTval',
      args: [
        { type: 'i', value: motorID },
        { type: 'i', value: tval },
        { type: 'i', value: tval },
        { type: 'i', value: tval },
        { type: 'i', value: tval }
      ]
    })
  }

  setSpeed(motorID: number, speed: number): void {
    this.udpPort.send({
      address: '/setMaxSpeed',
      args: [
        { type: 'i', value: motorID },
        { type: 'f', value: speed }
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
}