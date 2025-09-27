import PonMachineControl from './components/PonMachineControl'
import CameraControl from './components/CameraControl'

function App(): React.JSX.Element {
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'auto' }}>
      <PonMachineControl />
      <CameraControl />
    </div>
  )
}

export default App
