import React, { useState } from 'react'

const SteppingControl: React.FC = () => {
  const [motorId, setMotorId] = useState(1)
  const [tval, setTval] = useState(9)
  const [speed, setSpeed] = useState(620)
  const [position, setPosition] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const handleInit = (): void => {
    window.api.step400.setCurrentMode(motorId)
  }

  const handleTvalChange = (newTval: number): void => {
    setTval(newTval)
    window.api.step400.setTval(motorId, newTval)
  }

  const handleSpeedChange = (newSpeed: number): void => {
    setSpeed(newSpeed)
    window.api.step400.setSpeed(motorId, newSpeed)
  }

  const handleRun = (): void => {
    window.api.step400.setTval(motorId, tval)
    setTimeout(() => {
      window.api.step400.setSpeed(motorId, speed)
      window.api.step400.run(motorId, speed)
      setIsRunning(true)
    }, 200)
  }

  const handleStop = (): void => {
    window.api.step400.softHiZ(motorId)
    setIsRunning(false)
  }

  const handleGoTo = (): void => {
    window.api.step400.goTo(motorId, position)
  }

  const handleMove = (steps: number): void => {
    window.api.step400.move(motorId, steps)
  }

  const handleHome = (): void => {
    window.api.step400.goHome(motorId)
    setPosition(0)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        maxWidth: '600px',
        margin: '0 auto'
      }}
    >
      <h2 style={{ color: '#333', marginBottom: '20px' }}>STEP400 Motor Control</h2>

      {/* Motor Selection */}
      <div
        style={{
          padding: '15px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontWeight: 'bold', minWidth: '100px' }}>Motor ID:</span>
          <select
            value={motorId}
            onChange={(e) => setMotorId(Number(e.target.value))}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px'
            }}
          >
            {[1, 2, 3, 4].map((id) => (
              <option key={id} value={id}>
                Motor {id}
              </option>
            ))}
          </select>
          <button
            onClick={handleInit}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Initialize
          </button>
        </label>
      </div>

      {/* Speed and TVAL Controls */}
      <div
        style={{
          padding: '15px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}
      >
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            TVAL (Current): {tval}
          </label>
          <input
            type="range"
            min="0"
            max="127"
            value={tval}
            onChange={(e) => handleTvalChange(Number(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
            <span>0</span>
            <span>127</span>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Speed (step/s): {speed}
          </label>
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={speed}
            onChange={(e) => handleSpeedChange(Number(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
            <span>100</span>
            <span>10000</span>
          </div>
        </div>
      </div>

      {/* Run Controls */}
      <div
        style={{
          padding: '15px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}
      >
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={handleRun}
            disabled={isRunning}
            style={{
              padding: '12px 24px',
              backgroundColor: isRunning ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {isRunning ? 'Running...' : 'Run'}
          </button>
          <button
            onClick={handleStop}
            style={{
              padding: '12px 24px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Stop
          </button>
        </div>
      </div>

      {/* Position Controls */}
      <div
        style={{
          padding: '15px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}
      >
        <h3 style={{ marginBottom: '15px', fontSize: '16px' }}>Position Control</h3>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: 'bold', minWidth: '100px' }}>Position:</span>
            <input
              type="number"
              value={position}
              onChange={(e) => setPosition(Number(e.target.value))}
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                fontSize: '14px',
                flex: 1
              }}
            />
            <button
              onClick={handleGoTo}
              style={{
                padding: '8px 16px',
                backgroundColor: '#9C27B0',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Go To
            </button>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={() => handleMove(-100)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← 100 steps
          </button>
          <button
            onClick={handleHome}
            style={{
              padding: '8px 16px',
              backgroundColor: '#607D8B',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Home
          </button>
          <button
            onClick={() => handleMove(100)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            100 steps →
          </button>
        </div>
      </div>

      {/* Status Display */}
      <div
        style={{
          padding: '15px',
          backgroundColor: isRunning ? '#e8f5e9' : '#f5f5f5',
          borderRadius: '8px',
          border: `1px solid ${isRunning ? '#4CAF50' : '#ddd'}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: isRunning ? '#4CAF50' : '#ccc'
            }}
          />
          <span style={{ fontWeight: 'bold' }}>
            Status: {isRunning ? 'Running' : 'Stopped'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default SteppingControl