import React, { useEffect, useState } from 'react'
import { WebMidi, Input, NoteMessageEvent } from 'webmidi'

interface MidiNote {
  note: string
  octave: number
  velocity: number
  timestamp: number
  id: string
  port: number
}

const MidiInput: React.FC = () => {
  const [midiInputs, setMidiInputs] = useState<Input[]>([])
  const [selectedInput1, setSelectedInput1] = useState<Input | null>(null)
  const [selectedInput2, setSelectedInput2] = useState<Input | null>(null)
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
        console.log(
          'Available MIDI inputs:',
          inputs.map((i) => i.name)
        )
        setMidiInputs(inputs)

        if (inputs.length > 0) {
          setSelectedInput1(inputs[0])
        }
        if (inputs.length > 1) {
          setSelectedInput2(inputs[1])
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
    const handleNoteOn = (portNum: number) => (e: NoteMessageEvent) => {
      const noteInfo = getNoteFromNumber(e.note.number)
      const newNote: MidiNote = {
        note: noteInfo.note,
        octave: noteInfo.octave,
        velocity: Math.round(e.note.attack * 127),
        timestamp: e.timestamp,
        id: `port${portNum}-${e.timestamp}-${e.note.number}`,
        port: portNum
      }

      setNotes((prev) => [newNote, ...prev].slice(0, 50))
    }

    const handleNoteOff = (portNum: number) => (e: NoteMessageEvent) => {
      setNotes((prev) =>
        prev.filter((n) => n.id !== `port${portNum}-${e.timestamp}-${e.note.number}`)
      )
    }

    const cleanupFunctions: (() => void)[] = []

    if (selectedInput1) {
      const onNote1 = handleNoteOn(1)
      const offNote1 = handleNoteOff(1)
      selectedInput1.addListener('noteon', onNote1)
      selectedInput1.addListener('noteoff', offNote1)
      cleanupFunctions.push(() => {
        selectedInput1.removeListener('noteon')
        selectedInput1.removeListener('noteoff')
      })
    }

    if (selectedInput2) {
      const onNote2 = handleNoteOn(2)
      const offNote2 = handleNoteOff(2)
      selectedInput2.addListener('noteon', onNote2)
      selectedInput2.addListener('noteoff', offNote2)
      cleanupFunctions.push(() => {
        selectedInput2.removeListener('noteon')
        selectedInput2.removeListener('noteoff')
      })
    }

    return () => {
      cleanupFunctions.forEach((fn) => fn())
    }
  }, [selectedInput1, selectedInput2])

  const handleInputChange1 = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const input = midiInputs.find((i) => i.id === e.target.value)
    setSelectedInput1(input || null)
  }

  const handleInputChange2 = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const input = midiInputs.find((i) => i.id === e.target.value)
    setSelectedInput2(input || null)
  }

  const clearNotes = () => {
    setNotes([])
  }

  const notesPort1 = notes.filter((n) => n.port === 1)
  const notesPort2 = notes.filter((n) => n.port === 2)

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
                onChange={handleInputChange1}
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
                onChange={handleInputChange2}
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

export default MidiInput
