import React from 'react'
import { useMidiInput, MidiNote } from '../hooks/useMidiInput'

const CameraControl: React.FC = () => {
  const {
    midiInputs,
    selectedInput3,
    notesPort3,
    isEnabled,
    error,
    handleInputChange3,
    clearNotes
  } = useMidiInput()

  const handleInput3Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleInputChange3(e.target.value)
  }

  const renderNoteList = (portNotes: MidiNote[]) => (
    <div
      style={{
        border: '1px solid #ccc',
        padding: '10px',
        height: '400px',
        overflowY: 'auto',
        backgroundColor: '#f5f5f5'
      }}
    >
      {portNotes.length === 0 ? (
        <p style={{ color: '#999' }}>Camera Port - No notes received</p>
      ) : (
        <div>
          {portNotes.map((note) => (
            <div
              key={note.id}
              style={{
                padding: '8px',
                margin: '5px 0',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <span style={{ fontWeight: 'bold', fontSize: '18px', marginRight: '15px' }}>
                  {note.note}
                  {note.octave}
                </span>
                <span style={{ color: '#666' }}>Vel: {note.velocity}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                {new Date(note.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'monospace',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <h2 style={{ marginBottom: '10px' }}>Camera Control</h2>

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      <div
        style={{
          marginBottom: '10px',
          padding: '15px',
          backgroundColor: '#f0f0f0',
          borderRadius: '4px'
        }}
      >
        <h3 style={{ marginBottom: '10px' }}>MIDI Port 3 - Camera</h3>
        <label>
          Device:
          <select
            value={selectedInput3?.id || ''}
            onChange={handleInput3Change}
            style={{ marginLeft: '10px', padding: '5px', width: '50%' }}
            disabled={!isEnabled}
          >
            <option value="">None</option>
            {midiInputs.map((input) => (
              <option key={input.id} value={input.id}>
                {input.name}
              </option>
            ))}
          </select>
        </label>
        <div style={{ marginTop: '5px', color: selectedInput3 ? 'green' : '#ccc' }}>
          {selectedInput3 ? '● Connected' : '○ Not connected'}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {renderNoteList(notesPort3)}
      </div>

      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <button onClick={clearNotes} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Clear Camera Notes
        </button>
      </div>
    </div>
  )
}

export default CameraControl