import React, { JSX } from 'react'
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
    handleInputChange2
    // clearNotes
  } = useMidiInput()

  const handleInput1Change = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    handleInputChange1(e.target.value)
  }

  const handleInput2Change = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    handleInputChange2(e.target.value)
  }

  const renderNoteList = (portNotes: MidiNote[], portLabel: string): JSX.Element => (
    <div
      style={{
        border: '1px solid #ccc',
        padding: '10px',
        flex: 1,
        overflowY: 'auto',
        backgroundColor: '#f5f5f5',
        minHeight: 0
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
                <span
                  style={{
                    fontWeight: 'bold',
                    fontSize: '18px',
                    marginRight: '15px',
                    color: note.velocity > 0 ? '#4CAF50' : '#f44336'
                  }}
                >
                  {note.velocity > 0 ? 'OPEN' : 'CLOSE'}
                </span>
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
        fontFamily: 'monospace',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* <h2 style={{ marginBottom: '10px' }}>MIDI Input Monitor</h2> */}

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: 0 }}>
        {/* Port 1 Section */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
              Port 1:
            </span>
            <select
              value={selectedInput1?.id || ''}
              onChange={handleInput1Change}
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
            <span style={{ color: selectedInput1 ? 'green' : '#ccc', fontSize: '14px' }}>
              {selectedInput1 ? '● Connected' : '○ Not connected'}
            </span>
          </div>
          {renderNoteList(notesPort1, 'Port 1')}
        </div>

        {/* Port 2 Section */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
            <span style={{ fontWeight: 'bold', minWidth: '60px', color: 'black' }}>Port 2:</span>
            <select
              value={selectedInput2?.id || ''}
              onChange={handleInput2Change}
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
            <span style={{ color: selectedInput2 ? 'green' : '#ccc', fontSize: '14px' }}>
              {selectedInput2 ? '● Connected' : '○ Not connected'}
            </span>
          </div>
          {renderNoteList(notesPort2, 'Port 2')}
        </div>
      </div>

      {/* <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <button onClick={clearNotes} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Clear All Notes
        </button>
      </div> */}
    </div>
  )
}

export default PonMachineControl
