import React, { JSX } from 'react'
import { useMidiInput, MidiNote } from '../contexts/MidiInputContext'

interface NotePair {
  id: string
  openNote: MidiNote
  closeNote: MidiNote | null
  startTime: number
}

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

  // OPEN→CLOSEをペア化する関数
  const pairNotes = (notes: MidiNote[]): NotePair[] => {
    const pairs: NotePair[] = []
    let pendingOpen: MidiNote | null = null

    // notesは新→古の順なので、逆順にして古→新で処理
    const sortedNotes = [...notes].reverse()

    for (const note of sortedNotes) {
      if (note.velocity > 0) {
        // OPEN
        if (pendingOpen) {
          // 前のOPENがCLOSEされていない場合、単独でペア化
          pairs.push({
            id: pendingOpen.id,
            openNote: pendingOpen,
            closeNote: null,
            startTime: pendingOpen.timestamp
          })
        }
        pendingOpen = note
      } else {
        // CLOSE
        if (pendingOpen) {
          pairs.push({
            id: pendingOpen.id,
            openNote: pendingOpen,
            closeNote: note,
            startTime: pendingOpen.timestamp
          })
          pendingOpen = null
        }
      }
    }

    // 最後にOPENが残っている場合
    if (pendingOpen) {
      pairs.push({
        id: pendingOpen.id,
        openNote: pendingOpen,
        closeNote: null,
        startTime: pendingOpen.timestamp
      })
    }

    return pairs.reverse() // 最新を上に
  }

  const renderNoteList = (portNotes: MidiNote[], portLabel: string): JSX.Element => {
    const pairs = pairNotes(portNotes)

    return (
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
        {pairs.length === 0 ? (
          <p style={{ color: '#999' }}>{portLabel} - No notes received</p>
        ) : (
          <div>
            {pairs.map((pair) => {
              const duration = pair.closeNote
                ? ((pair.closeNote.timestamp - pair.openNote.timestamp) / 1000).toFixed(1)
                : null

              return (
                <div
                  key={pair.id}
                  style={{
                    padding: '12px',
                    margin: '8px 0',
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '6px'
                  }}
                >
                  {/* メインの横並び表示 */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                      marginBottom: '8px'
                    }}
                  >
                    {/* OPEN */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: '#4CAF50'
                        }}
                      />
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 'bold',
                            fontSize: '16px',
                            color: '#4CAF50'
                          }}
                        >
                          OPEN
                        </span>
                        <div
                          style={{
                            fontSize: '10px',
                            color: '#4CAF50',
                            marginTop: '2px'
                          }}
                        >
                          (ポン!)
                        </div>
                      </div>
                    </div>

                    {/* 矢印 */}
                    <div
                      style={{
                        flex: 1,
                        height: '24px',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {/* アニメーションする矢印本体 */}
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          height: '2px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          backgroundColor: pair.closeNote ? '#4CAF50' : '#ccc',
                          transformOrigin: 'left center',
                          animation: pair.closeNote ? 'none' : 'arrowGrow 0.4s ease-out forwards'
                        }}
                      />
                      {/* 矢印の先端 */}
                      <div
                        style={{
                          position: 'absolute',
                          right: '-6px',
                          width: 0,
                          height: 0,
                          borderTop: '6px solid transparent',
                          borderBottom: '6px solid transparent',
                          borderLeft: `10px solid ${pair.closeNote ? '#4CAF50' : '#ccc'}`,
                          animation: pair.closeNote
                            ? 'none'
                            : 'arrowHeadGrow 0.4s ease-out forwards'
                        }}
                      />
                      {duration && (
                        <div
                          style={{
                            position: 'absolute',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: 'white',
                            padding: '2px 8px',
                            fontSize: '11px',
                            color: '#666',
                            borderRadius: '3px',
                            border: '1px solid #ddd'
                          }}
                        >
                          {duration}s
                        </div>
                      )}
                    </div>

                    {/* CLOSE */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: pair.closeNote ? '#f44336' : '#ccc'
                        }}
                      />
                      <span
                        style={{
                          fontWeight: 'bold',
                          fontSize: '16px',
                          color: pair.closeNote ? '#f44336' : '#ccc'
                        }}
                      >
                        CLOSE
                      </span>
                    </div>
                  </div>

                  {/* タイムスタンプ */}
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#999',
                      textAlign: 'right'
                    }}
                  >
                    {new Date(pair.openNote.timestamp).toLocaleTimeString()}
                    {pair.closeNote &&
                      ` → ${new Date(pair.closeNote.timestamp).toLocaleTimeString()}`}
                    {!pair.closeNote && (
                      <span style={{ marginLeft: '8px', color: '#ff9800', fontWeight: 'bold' }}>
                        進行中...
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <style>
        {`
          @keyframes arrowGrow {
            from {
              transform: scaleX(0);
            }
            to {
              transform: scaleX(1);
            }
          }

          @keyframes arrowHeadGrow {
            0% {
              opacity: 0;
              transform: translateX(-100px);
            }
            70% {
              opacity: 0;
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}
      </style>
      <div
        style={{
          fontFamily: 'monospace',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}
      >
        {/* <h2 style={{ marginBottom: '10px' }}>MIDI Input Monitor</h2> */}

        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: 0 }}>
          {/* Port 1 Section */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div
              style={{
                marginBottom: '10px',
                padding: '8px',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
                flexShrink: 0
              }}
            >
              <span
                style={{
                  fontWeight: 'bold',
                  minWidth: '60px',
                  color: 'black'
                }}
              >
                マシン 1:
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
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div
              style={{
                marginBottom: '10px',
                padding: '8px',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
                flexShrink: 0
              }}
            >
              <span style={{ fontWeight: 'bold', minWidth: '60px', color: 'black' }}>
                マシン 2:
              </span>
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
    </>
  )
}

export default PonMachineControl
