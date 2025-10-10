import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { WebMidi, Input, NoteMessageEvent } from 'webmidi'

export interface MidiNote {
  note: string
  octave: number
  velocity: number
  timestamp: number
  id: string
  port: number
}

interface MidiInputContextType {
  midiInputs: Input[]
  selectedInput1: Input | null
  selectedInput2: Input | null
  selectedInput3: Input | null
  notes: MidiNote[]
  notesPort1: MidiNote[]
  notesPort2: MidiNote[]
  notesPort3: MidiNote[]
  isEnabled: boolean
  error: string | null
  handleInputChange1: (inputId: string) => void
  handleInputChange2: (inputId: string) => void
  handleInputChange3: (inputId: string) => void
  clearNotes: () => void
}

const MidiInputContext = createContext<MidiInputContextType | undefined>(undefined)

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

export const MidiInputProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [midiInputs, setMidiInputs] = useState<Input[]>([])
  const [selectedInput1, setSelectedInput1] = useState<Input | null>(null)
  const [selectedInput2, setSelectedInput2] = useState<Input | null>(null)
  const [selectedInput3, setSelectedInput3] = useState<Input | null>(null)
  const [notes, setNotes] = useState<MidiNote[]>([])
  const [isEnabled, setIsEnabled] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const enableWebMidi = async () => {
      try {
        await WebMidi.enable()
        console.log('WebMidi enabled!')
        setIsEnabled(true)

        const inputs = WebMidi.inputs
        console.log(
          'Available MIDI inputs:',
          inputs.map((i) => ({ id: i.id, name: i.name }))
        )
        setMidiInputs(inputs)

        // Port 1: デバイス名に「ポン1」が含まれるものを優先
        const port1Device = inputs.find((i) => i.name.includes('ポン1'))
        setSelectedInput1(port1Device || null)

        // Port 2: デバイス名に「ポン2」が含まれるものを優先
        const port2Device = inputs.find((i) => i.name.includes('ポン2'))
        setSelectedInput2(port2Device || null)

        // Port 3: デバイス名に「カメラ」が含まれるものを優先、なければ3番目
        const port3Device = inputs.find((i) => i.name.includes('カメラ'))
        setSelectedInput3(port3Device || (inputs.length > 2 ? inputs[2] : null))
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
    console.log('Setting up MIDI listeners:', {
      port1: selectedInput1?.name || 'none',
      port2: selectedInput2?.name || 'none',
      port3: selectedInput3?.name || 'none'
    })

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

      // Port 1 & 2: Send to STEP400 motor control (OPEN)
      if (portNum === 1 || portNum === 2) {
        window.api.step400.moveToOpenPosition(portNum)
      }

      // Send Port3 notes C, D, E, F to ATEM controller
      if (portNum === 3 && ['C', 'D', 'E', 'F'].includes(noteInfo.note)) {
        const velocity = Math.round(e.note.attack * 127)
        window.api.midi.sendPort3Note(noteInfo.note, velocity)
      }
    }

    const handleNoteOff = (portNum: number) => (e: NoteMessageEvent) => {
      const noteInfo = getNoteFromNumber(e.note.number)
      const newNote: MidiNote = {
        note: noteInfo.note,
        octave: noteInfo.octave,
        velocity: 0, // velocity 0 for noteoff (CLOSE)
        timestamp: e.timestamp,
        id: `port${portNum}-off-${e.timestamp}-${e.note.number}`,
        port: portNum
      }

      setNotes((prev) => [newNote, ...prev].slice(0, 50))

      // Port 1 & 2: Send to STEP400 motor control (CLOSE)
      if (portNum === 1 || portNum === 2) {
        window.api.step400.moveToClosePosition(portNum)
      }
    }

    const cleanupFunctions: (() => void)[] = []

    if (selectedInput1) {
      const input1 = selectedInput1 // Capture the current reference
      const onNote1 = handleNoteOn(1)
      const offNote1 = handleNoteOff(1)
      // Remove all existing listeners before adding new ones
      input1.removeListener('noteon')
      input1.removeListener('noteoff')

      input1.addListener('noteon', onNote1)
      input1.addListener('noteoff', offNote1)
      cleanupFunctions.push(() => {
        try {
          input1.removeListener('noteon', onNote1)
          input1.removeListener('noteoff', offNote1)
        } catch (e) {
          // Input might have been disconnected
        }
      })
    }

    if (selectedInput2) {
      const input2 = selectedInput2 // Capture the current reference
      const onNote2 = handleNoteOn(2)
      const offNote2 = handleNoteOff(2)

      // Remove all existing listeners before adding new ones
      input2.removeListener('noteon')
      input2.removeListener('noteoff')

      input2.addListener('noteon', onNote2)
      input2.addListener('noteoff', offNote2)
      cleanupFunctions.push(() => {
        try {
          input2.removeListener('noteon', onNote2)
          input2.removeListener('noteoff', offNote2)
        } catch (e) {
          // Input might have been disconnected
        }
      })
    }

    if (selectedInput3) {
      const input3 = selectedInput3 // Capture the current reference
      const onNote3 = handleNoteOn(3)
      const offNote3 = handleNoteOff(3)

      // Remove all existing listeners before adding new ones
      input3.removeListener('noteon')
      input3.removeListener('noteoff')

      input3.addListener('noteon', onNote3)
      input3.addListener('noteoff', offNote3)
      cleanupFunctions.push(() => {
        try {
          input3.removeListener('noteon', onNote3)
          input3.removeListener('noteoff', offNote3)
        } catch (e) {
          // Input might have been disconnected
        }
      })
    }

    return () => {
      cleanupFunctions.forEach((fn) => fn())
    }
  }, [selectedInput1, selectedInput2, selectedInput3])

  const handleInputChange1 = useCallback(
    (inputId: string) => {
      console.log('Port 1 change requested:', inputId)
      const input = midiInputs.find((i) => i.id === inputId)
      console.log('Port 1 found input:', input?.name || 'none')
      setSelectedInput1(input || null)
    },
    [midiInputs]
  )

  const handleInputChange2 = useCallback(
    (inputId: string) => {
      console.log('Port 2 change requested:', inputId)
      const input = midiInputs.find((i) => i.id === inputId)
      console.log('Port 2 found input:', input?.name || 'none')
      setSelectedInput2(input || null)
    },
    [midiInputs]
  )

  const handleInputChange3 = useCallback(
    (inputId: string) => {
      console.log('Port 3 change requested:', inputId)
      const input = midiInputs.find((i) => i.id === inputId)
      console.log('Port 3 found input:', input?.name || 'none')
      setSelectedInput3(input || null)
    },
    [midiInputs]
  )

  const clearNotes = useCallback(() => {
    setNotes([])
  }, [])

  const notesPort1 = notes.filter((n) => n.port === 1)
  const notesPort2 = notes.filter((n) => n.port === 2)
  const notesPort3 = notes.filter((n) => n.port === 3)

  const value: MidiInputContextType = {
    midiInputs,
    selectedInput1,
    selectedInput2,
    selectedInput3,
    notes,
    notesPort1,
    notesPort2,
    notesPort3,
    isEnabled,
    error,
    handleInputChange1,
    handleInputChange2,
    handleInputChange3,
    clearNotes
  }

  return <MidiInputContext.Provider value={value}>{children}</MidiInputContext.Provider>
}

export const useMidiInput = (): MidiInputContextType => {
  const context = useContext(MidiInputContext)
  if (!context) {
    throw new Error('useMidiInput must be used within a MidiInputProvider')
  }
  return context
}
