import { useState } from 'react'
import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'

function App(): React.JSX.Element {
  const [tval, setTval] = useState(16)
  const [speed, setSpeed] = useState(1000)
  const motorID = 1

  const handleInit = (): void => {
    window.api.step400.setCurrentMode(motorID)
  }

  const handleRun = (): void => {
    window.api.step400.setTval(motorID, tval)
    setTimeout(() => {
      window.api.step400.setSpeed(motorID, speed)
      window.api.step400.run(motorID, speed)
    }, 200)
  }

  const handleStop = (): void => {
    window.api.step400.softHiZ(motorID)
  }

  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">STEP400 Controller - Motor 1</div>
      <div className="text">Current Mode Control</div>

      <div className="actions">
        <div className="action">
          <button onClick={handleInit}>Initialize (Current Mode)</button>
        </div>

        <div className="action">
          <label>
            TVAL (0-127): {tval}
            <input
              type="range"
              min="0"
              max="127"
              value={tval}
              onChange={(e) => setTval(Number(e.target.value))}
            />
          </label>
        </div>

        <div className="action">
          <label>
            Speed (step/s): {speed}
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </label>
        </div>

        <div className="action">
          <button onClick={handleRun}>Run</button>
        </div>

        <div className="action">
          <button onClick={handleStop}>Stop</button>
        </div>
      </div>
      <Versions></Versions>
    </>
  )
}

export default App
