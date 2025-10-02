import React, { useState } from 'react'

// ステップモードの定義
const STEP_MODES = [
  { value: 0, label: 'フルステップ', description: '最大トルク、高速動作に適している' },
  { value: 1, label: '1/2マイクロステップ', description: 'バランスの良い選択' },
  { value: 2, label: '1/4マイクロステップ', description: '中程度の精度とトルク' },
  { value: 3, label: '1/8マイクロステップ', description: '高い精度、中程度のトルク' },
  { value: 4, label: '1/16マイクロステップ', description: '非常に高い精度' },
  { value: 5, label: '1/32マイクロステップ', description: '極めて高い精度' },
  { value: 6, label: '1/64マイクロステップ', description: '最高精度' },
  { value: 7, label: '1/128マイクロステップ', description: '最高精度（現在の設定）' }
]

const SteppingControl: React.FC = () => {
  const [motorId, setMotorId] = useState(1)
  const [tval, setTval] = useState(9)
  const [speed, setSpeed] = useState(620)
  const [position, setPosition] = useState(0)
  const [isHoming, setIsHoming] = useState(false)
  const [stepMode, setStepMode] = useState(4) // デフォルト: 1/128マイクロステップ

  const handleInit = (): void => {
    window.api.step400.setCurrentMode(motorId)
  }

  const handleStepModeChange = (newStepMode: number): void => {
    setStepMode(newStepMode)
    window.api.step400.setStepMode(motorId, newStepMode)
  }

  const handleTvalChange = (newTval: number): void => {
    setTval(newTval)
    window.api.step400.setTval(motorId, newTval)
  }

  const handleSpeedChange = (newSpeed: number): void => {
    setSpeed(newSpeed)
    window.api.step400.setSpeed(motorId, newSpeed)
  }

  const handleStop = (): void => {
    window.api.step400.softHiZ(motorId)
  }

  const handleGoTo = (): void => {
    window.api.step400.goTo(motorId, position)
  }

  const handleMove = (steps: number): void => {
    window.api.step400.move(motorId, steps)
  }

  const handleHome = (): void => {
    window.api.step400.goHome(motorId)
  }

  const handleHoming = (): void => {
    setIsHoming(true)
    window.api.step400.homing(motorId)
    setTimeout(() => {
      setIsHoming(false)
      setPosition(0)
    }, 5000) // Assume homing completes within 5 seconds
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

      {/* Step Mode Selection */}
      <div
        style={{
          padding: '15px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}
      >
        <h3 style={{ marginBottom: '15px', fontSize: '16px' }}>ステップモード設定</h3>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            ステップモード:
          </label>
          <select
            value={stepMode}
            onChange={(e) => handleStepModeChange(Number(e.target.value))}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
              width: '100%',
              marginBottom: '8px'
            }}
          >
            {STEP_MODES.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
          <div
            style={{
              fontSize: '12px',
              color: '#666',
              backgroundColor: '#f9f9f9',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #eee'
            }}
          >
            <strong>{STEP_MODES[stepMode].label}:</strong> {STEP_MODES[stepMode].description}
          </div>
        </div>
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#666'
            }}
          >
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#666'
            }}
          >
            <span>100</span>
            <span>10000</span>
          </div>
        </div>
      </div>

      {/* Homing and Stop Controls */}
      <div
        style={{
          padding: '15px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}
      >
        <h3 style={{ marginBottom: '15px', fontSize: '16px' }}>Homing (原点復帰)</h3>

        <div
          style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '15px' }}
        >
          <button
            onClick={handleHoming}
            disabled={isHoming}
            style={{
              padding: '12px 24px',
              backgroundColor: isHoming ? '#FFA726' : '#FF6B35',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isHoming ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {isHoming ? 'Homing...' : 'Start Homing'}
          </button>
          <button
            onClick={handleHome}
            disabled={isHoming}
            style={{
              padding: '12px 24px',
              backgroundColor: '#607D8B',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isHoming ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            Go Home (0)
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
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
            onClick={() => setPosition(0)}
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
            Reset Position
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
          backgroundColor: isHoming ? '#fff3e0' : '#f5f5f5',
          borderRadius: '8px',
          border: `1px solid ${isHoming ? '#FF6B35' : '#ddd'}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: isHoming ? '#FF6B35' : '#ccc'
            }}
          />
          <span style={{ fontWeight: 'bold' }}>Status: {isHoming ? 'Homing' : 'Stopped'}</span>
        </div>
      </div>
    </div>
  )
}

export default SteppingControl
