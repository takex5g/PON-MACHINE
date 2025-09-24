import React, { useEffect, useState } from 'react'
import { WebMidi, Input, NoteMessageEvent } from 'webmidi'

interface MidiNote {
  note: string
  octave: number
  velocity: number
  timestamp: number
  id: string
}

const MidiInput: React.FC = () => {
  const [midiInputs, setMidiInputs] = useState<Input[]>([])
  const [selectedInput, setSelectedInput] = useState<Input | null>(null)
  const [notes, setNotes] = useState<MidiNote[]>([])
  const [isEnabled, setIsEnabled] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const noteNameMapping: { [key: number]: string } = {
    0: 'C',
    1: 'C#',
    2: 'D',
    3: 'D#',
    4: 'E',
    5: 'F',
    6: 'F#',
    7: 'G',
    8: 'G#',
    9: 'A',
    10: 'A#',
    11: 'B'
  }

  const getNoteFromNumber = (noteNumber: number): { note: string; octave: number } => {
    const octave = Math.floor(noteNumber / 12) - 1
    const noteIndex = noteNumber % 12
    return {
      note: noteNameMapping[noteIndex],
      octave
    }
  }

  useEffect(() => {
    const enableWebMidi = async () => {
      try {
        await WebMidi.enable()
        console.log('WebMidi enabled!')
        setIsEnabled(true)

        const inputs = WebMidi.inputs
        console.log('Available MIDI inputs:', inputs.map(i => i.name))
        setMidiInputs(inputs)

        if (inputs.length > 0) {
          setSelectedInput(inputs[0])
        }
      } catch (err) {
        console.error('Failed to enable WebMidi:', err)
        setError('Failed to enable WebMidi. Please check browser compatibility.')
      }
    }

    enableWebMidi()

    return () => {
      if (WebMidi.enabled) {
        WebMidi.disable()
      }
    }
  }, [])

  useEffect(() => {
    if (!selectedInput) return

    const handleNoteOn = (e: NoteMessageEvent) => {
      const noteInfo = getNoteFromNumber(e.note.number)
      const newNote: MidiNote = {
        note: noteInfo.note,
        octave: noteInfo.octave,
        velocity: Math.round(e.note.attack * 127),
        timestamp: e.timestamp,
        id: `${e.timestamp}-${e.note.number}`
      }

      setNotes(prev => [newNote, ...prev].slice(0, 50))
    }

    const handleNoteOff = (e: NoteMessageEvent) => {
      setNotes(prev => prev.filter(n => n.id !== `${e.timestamp}-${e.note.number}`))
    }

    selectedInput.addListener('noteon', handleNoteOn)
    selectedInput.addListener('noteoff', handleNoteOff)

    return () => {
      selectedInput.removeListener('noteon')
      selectedInput.removeListener('noteoff')
    }
  }, [selectedInput])

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const input = midiInputs.find(i => i.id === e.target.value)
    setSelectedInput(input || null)
  }

  const clearNotes = () => {
    setNotes([])
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>MIDI Input Monitor</h2>

      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <label>
          Device:
          <select
            value={selectedInput?.id || ''}
            onChange={handleInputChange}
            style={{ marginLeft: '10px', padding: '5px' }}
            disabled={!isEnabled}
          >
            <option value="">None</option>
            {midiInputs.map(input => (
              <option key={input.id} value={input.id}>
                {input.name}
              </option>
            ))}
          </select>
        </label>
        <span style={{ marginLeft: '20px', color: isEnabled ? 'green' : 'red' }}>
          {isEnabled ? '● Connected' : '● Disconnected'}
        </span>
      </div>

      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Notes</h3>
        <button onClick={clearNotes} style={{ padding: '5px 10px' }}>
          Clear
        </button>
      </div>

      <div style={{
        border: '1px solid #ccc',
        padding: '10px',
        height: '400px',
        overflowY: 'auto',
        backgroundColor: '#f5f5f5'
      }}>
        {notes.length === 0 ? (
          <p style={{ color: '#999' }}>No notes received. Connect a MIDI device to start.</p>
        ) : (
          <div>
            {notes.map(note => (
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
                    {note.note}{note.octave}
                  </span>
                  <span style={{ color: '#666' }}>
                    Velocity: {note.velocity}
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
    </div>
  )
}

export default MidiInput