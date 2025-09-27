import PonMachineControl from './components/PonMachineControl'
import CameraControl from './components/CameraControl'

function App(): React.JSX.Element {
  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <div style={{ flex: '0 0 70%', overflow: 'hidden' }}>
        <PonMachineControl />
      </div>
      <div style={{ flex: '0 0 30%', overflow: 'hidden' }}>
        <CameraControl />
      </div>
    </div>
  )
}

export default App
