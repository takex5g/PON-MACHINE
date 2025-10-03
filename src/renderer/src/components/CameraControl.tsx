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
              backgroundColor: selectedCamera === cameraNum ? '#f44336' : '#fff',
              border: selectedCamera === cameraNum ? '3px solid #d32f2f' : '2px solid #ccc',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow:
                selectedCamera === cameraNum
                  ? '0 4px 12px rgba(244, 67, 54, 0.3)'
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
                fontSize: '20px',
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
          padding: '8px',
          backgroundColor: '#f0f0f0',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap'
        }}
      >
        <span
          style={{
            fontWeight: 'bold',
            minWidth: '60px',
            color: 'black'
          }}
        >
          カメラ制御:
        </span>
        <select
          value={selectedInput3?.id || ''}
          onChange={handleInput3Change}
          style={{ padding: '4px', flex: 1, minWidth: '120px' }}
          disabled={!isEnabled}
        >
          <option value="">None</option>
          {midiInputs.map((input) => (
            <option key={input.id} value={input.id}>
              {input.name}
            </option>
          ))}
        </select>
        <span style={{ color: selectedInput3 ? 'green' : '#ccc', fontSize: '14px' }}>
          {selectedInput3 ? '● Connected' : '○ Not connected'}
        </span>
      </div>

      {/* カメラ状態表示 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {renderCameraButtons()}
      </div>
    </div>
  )
}

export default CameraControl
