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
            gap: '10px'
          }}
        >
          <div style={{ flex: '0 0 70%' }}>
            <PonMachineControl />
          </div>
          <div style={{ flex: '0 0 30%' }}>
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
