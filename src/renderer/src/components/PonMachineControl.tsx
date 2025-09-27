import React from 'react'
import { useMidiInput, MidiNote } from '../hooks/useMidiInput'

const PonMachineControl: React.FC = () => {
  const {
    midiInputs,
    selectedInput1,
    selectedInput2,
    notesPort1,
    notesPort2,
    isEnabled,
    error,
    handleInputChange1,
    handleInputChange2,
    clearNotes
  } = useMidiInput()

  const handleInput1Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleInputChange1(e.target.value)
  }

  const handleInput2Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleInputChange2(e.target.value)
  }

  const renderNoteList = (portNotes: MidiNote[], portLabel: string) => (
    <div
      style={{
        border: '1px solid #ccc',
        padding: '10px',
        height: '450px',
        overflowY: 'auto',
        backgroundColor: '#f5f5f5'
      }}
    >
      {portNotes.length === 0 ? (
        <p style={{ color: '#999' }}>{portLabel} - No notes received</p>
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
      <h2 style={{ marginBottom: '10px' }}>MIDI Input Monitor</h2>

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: 0 }}>
        {/* Port 1 Section */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              marginBottom: '10px',
              padding: '10px',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px'
            }}
          >
            <h3 style={{ marginBottom: '10px' }}>Port 1</h3>
            <label>
              Device:
              <select
                value={selectedInput1?.id || ''}
                onChange={handleInput1Change}
                style={{ marginLeft: '10px', padding: '5px', width: '70%' }}
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
            <div style={{ marginTop: '5px', color: selectedInput1 ? 'green' : '#ccc' }}>
              {selectedInput1 ? '● Connected' : '○ Not connected'}
            </div>
          </div>
          {renderNoteList(notesPort1, 'Port 1')}
        </div>

        {/* Port 2 Section */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              marginBottom: '10px',
              padding: '10px',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px'
            }}
          >
            <h3 style={{ marginBottom: '10px' }}>Port 2</h3>
            <label>
              Device:
              <select
                value={selectedInput2?.id || ''}
                onChange={handleInput2Change}
                style={{ marginLeft: '10px', padding: '5px', width: '70%' }}
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
            <div style={{ marginTop: '5px', color: selectedInput2 ? 'green' : '#ccc' }}>
              {selectedInput2 ? '● Connected' : '○ Not connected'}
            </div>
          </div>
          {renderNoteList(notesPort2, 'Port 2')}
        </div>
      </div>

      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <button onClick={clearNotes} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Clear All Notes
        </button>
      </div>
    </div>
  )
}

export default PonMachineControl