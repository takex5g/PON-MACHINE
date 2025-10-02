import TabContainer from './components/TabContainer'
import PonMachineControl from './components/PonMachineControl'
import CameraControl from './components/CameraControl'
import SteppingControl from './components/SteppingControl'
import ATEMControl from './components/ATEMControl'

function App(): React.JSX.Element {
  const tabs = [
    {
      id: 'midi',
      label: 'MIDI',
      content: (
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            minHeight: 0
          }}
        >
          <div style={{ flex: '7', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <PonMachineControl />
          </div>
          <div style={{ flex: '3', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <CameraControl />
          </div>
        </div>
      )
    },
    {
      id: 'stepping',
      label: 'ステッピング',
      content: <SteppingControl />
    },
    {
      id: 'atem',
      label: 'ATEM',
      content: <ATEMControl />
    }
  ]

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      <TabContainer tabs={tabs} />
    </div>
  )
}

export default App
