import React, { JSX, useState, useEffect } from 'react'
import { useMidiInput } from '../hooks/useMidiInput'

const CameraControl: React.FC = () => {
  const {
    midiInputs,
    selectedInput3,
    notesPort3,
    isEnabled,
    error,
    handleInputChange3
    // clearNotes
  } = useMidiInput()

  const [selectedCamera, setSelectedCamera] = useState<number | null>(null)
  const [lastSwitchTime, setLastSwitchTime] = useState<string>('')

  const handleInput3Change = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    handleInputChange3(e.target.value)
  }

  const getCameraFromNote = (note: string): number | null => {
    const cameraMapping: { [key: string]: number } = {
      C: 1,
      D: 2,
      E: 3,
      F: 4
    }
    return cameraMapping[note] || null
  }

  // 最新のノートからカメラを更新
  useEffect(() => {
    if (notesPort3.length > 0) {
      const latestNote = notesPort3[0]
      const camera = getCameraFromNote(latestNote.note)
      if (camera) {
        setSelectedCamera(camera)
        setLastSwitchTime(new Date(latestNote.timestamp).toLocaleTimeString())
      }
    }
  }, [notesPort3])

  const renderCameraButtons = (): JSX.Element => (
    <div
      style={{
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
        padding: '10px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}
    >
      {[1, 2, 3, 4].map((cameraNum) => (
        <div
          key={cameraNum}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <div
            style={{
              width: '100px',
              height: '50px',
              borderRadius: '12px',
              backgroundColor: selectedCamera === cameraNum ? '#4CAF50' : '#fff',
              border: selectedCamera === cameraNum ? '3px solid #2E7D32' : '2px solid #ccc',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow:
                selectedCamera === cameraNum
                  ? '0 4px 12px rgba(76, 175, 80, 0.3)'
                  : '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              cursor: 'default'
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: selectedCamera === cameraNum ? '#fff' : '#999'
              }}
            >
              カメラ
            </div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: selectedCamera === cameraNum ? '#fff' : '#666',
                marginTop: '5px'
              }}
            >
              {cameraNum}
            </div>
          </div>
          {/* <div
            style={{
              fontSize: '11px',
              color: '#666',
              backgroundColor: '#e0e0e0',
              padding: '2px 8px',
              borderRadius: '10px'
            }}
          >
            {['C', 'D', 'E', 'F'][cameraNum - 1]}
          </div> */}
        </div>
      ))}
    </div>
  )

  return (
    <div
      style={{
        fontFamily: 'monospace',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      {/* MIDI入力選択 */}
      <div
        style={{
          marginBottom: '10px',
          padding: '10px',
          backgroundColor: '#f0f0f0',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          flexWrap: 'wrap'
        }}
      >
        <span
          style={{
            fontWeight: 'bold',
            minWidth: '100px',
            color: 'black',
            fontSize: '16px'
          }}
        >
          MIDI入力:
        </span>
        <select
          value={selectedInput3?.id || ''}
          onChange={handleInput3Change}
          style={{
            padding: '8px 12px',
            flex: 1,
            minWidth: '200px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '14px'
          }}
          disabled={!isEnabled}
        >
          <option value="">None</option>
          {midiInputs.map((input) => (
            <option key={input.id} value={input.id}>
              {input.name}
            </option>
          ))}
        </select>
        <span
          style={{
            color: selectedInput3 ? '#4CAF50' : '#ccc',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {selectedInput3 ? '● Connected' : '○ Not connected'}
        </span>
      </div>

      {/* カメラ状態表示 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {renderCameraButtons()}
        {selectedCamera && lastSwitchTime && (
          <div
            style={{
              marginTop: '20px',
              textAlign: 'center',
              fontSize: '14px',
              color: '#666',
              backgroundColor: '#fff',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ddd'
            }}
          >
            現在選択: カメラ {selectedCamera} (切り替え時刻: {lastSwitchTime})
          </div>
        )}
      </div>
    </div>
  )
}

export default CameraControl
