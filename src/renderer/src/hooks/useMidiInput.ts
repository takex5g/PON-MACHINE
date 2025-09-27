import { useEffect, useState, useCallback } from 'react'
import { WebMidi, Input, NoteMessageEvent } from 'webmidi'

export interface MidiNote {
  note: string
  octave: number
  velocity: number
  timestamp: number
  id: string
  port: number
}

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

export const useMidiInput = () => {
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
          inputs.map((i) => i.name)
        )
        setMidiInputs(inputs)

        if (inputs.length > 0) {
          setSelectedInput1(inputs[0])
        }
        if (inputs.length > 1) {
          setSelectedInput2(inputs[1])
        }
        if (inputs.length > 2) {
          setSelectedInput3(inputs[2])
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
    }

    const cleanupFunctions: (() => void)[] = []

    if (selectedInput1) {
      const input1 = selectedInput1  // Capture the current reference
      const onNote1 = handleNoteOn(1)
      const offNote1 = handleNoteOff(1)
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
      const input2 = selectedInput2  // Capture the current reference
      const onNote2 = handleNoteOn(2)
      const offNote2 = handleNoteOff(2)
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
      const input3 = selectedInput3  // Capture the current reference
      const onNote3 = handleNoteOn(3)
      const offNote3 = handleNoteOff(3)
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
      const input = midiInputs.find((i) => i.id === inputId)
      setSelectedInput1(input || null)
    },
    [midiInputs]
  )

  const handleInputChange2 = useCallback(
    (inputId: string) => {
      const input = midiInputs.find((i) => i.id === inputId)
      setSelectedInput2(input || null)
    },
    [midiInputs]
  )

  const handleInputChange3 = useCallback(
    (inputId: string) => {
      const input = midiInputs.find((i) => i.id === inputId)
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

  return {
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
}
