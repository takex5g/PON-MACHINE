import { useState, useEffect } from 'react'

const ATEMControl = () => {
  const [ipAddress, setIpAddress] = useState('')
  const [connected, setConnected] = useState(false)
  const [activeCamera, setActiveCamera] = useState(1)
  const [isConnecting, setIsConnecting] = useState(false)
  const [transitionMode, setTransitionMode] = useState<'fade' | 'cut'>('fade')

  useEffect(() => {
    const checkStatus = async () => {
      const status = await window.api.atem.getStatus()
      setConnected(status.connected)
      setIpAddress(status.ipAddress)
    }
    checkStatus()
  }, [])

  const handleConnect = async () => {
    setIsConnecting(true)
    const result = await window.api.atem.connect(ipAddress)
    if (result.success) {
      setConnected(true)
    } else {
      alert(`接続失敗: ${result.error}`)
    }
    setIsConnecting(false)
  }

  const handleDisconnect = async () => {
    await window.api.atem.disconnect()
    setConnected(false)
  }

  const handleCameraSwitch = async (cameraId: number) => {
    // transitionModeに応じてvelocityを設定
    const velocity = transitionMode === 'cut' ? 100 : 50
    const result = await window.api.atem.switchCamera(cameraId, velocity)
    if (result.success) {
      setActiveCamera(cameraId)
    } else {
      alert(`カメラ切り替え失敗: ${result.error}`)
    }
  }

  return (
    <div style={{ padding: '16px', color: '#000' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#000' }}>
        ATEM スイッチャー制御
      </h2>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontWeight: 'bold', marginBottom: '8px', color: '#000' }}>接続設定</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            placeholder="IPアドレス"
            style={{
              padding: '4px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
            disabled={connected}
          />
          {!connected ? (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              style={{
                padding: '4px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isConnecting ? 'not-allowed' : 'pointer',
                opacity: isConnecting ? 0.5 : 1
              }}
            >
              {isConnecting ? '接続中...' : '接続'}
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              style={{
                padding: '4px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              切断
            </button>
          )}
          <span style={{ marginLeft: '8px', color: connected ? '#16a34a' : '#6b7280' }}>
            {connected ? '● 接続中' : '○ 未接続'}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontWeight: 'bold', marginBottom: '8px', color: '#000' }}>
          カメラ切り替え
        </h3>

        {/* トランジションモード選択 */}
        <div style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setTransitionMode('fade')}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              fontWeight: 'bold',
              backgroundColor: transitionMode === 'fade' ? '#3b82f6' : '#e5e7eb',
              color: transitionMode === 'fade' ? 'white' : 'black',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            フェード
          </button>
          <button
            onClick={() => setTransitionMode('cut')}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              fontWeight: 'bold',
              backgroundColor: transitionMode === 'cut' ? '#3b82f6' : '#e5e7eb',
              color: transitionMode === 'cut' ? 'white' : 'black',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            カット
          </button>
          <span style={{ marginLeft: '8px', alignSelf: 'center', fontSize: '14px', color: '#666' }}>
            ({transitionMode === 'fade' ? 'velocity < 65' : 'velocity ≥ 65'})
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {[1, 2, 3, 4].map((cam) => (
            <button
              key={cam}
              onClick={() => handleCameraSwitch(cam)}
              disabled={!connected}
              style={{
                padding: '16px',
                borderRadius: '4px',
                fontWeight: 'bold',
                backgroundColor: activeCamera === cam ? '#ef4444' : '#e5e7eb',
                color: activeCamera === cam ? 'white' : 'black',
                border: 'none',
                cursor: connected ? 'pointer' : 'not-allowed',
                opacity: connected ? 1 : 0.5
              }}
            >
              CAM {cam}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontWeight: 'bold', marginBottom: '8px', color: '#000' }}>
          MIDI制御マッピング（Port 3）
        </h3>
        <div
          style={{
            backgroundColor: '#f3f4f6',
            padding: '12px',
            borderRadius: '4px',
            color: '#000'
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
              fontSize: '14px',
              marginBottom: '12px'
            }}
          >
            <div>• ノート C → カメラ 1</div>
            <div>• ノート D → カメラ 2</div>
            <div>• ノート E → カメラ 3</div>
            <div>• ノート F → カメラ 4</div>
          </div>
          <div style={{ borderTop: '1px solid #d1d5db', paddingTop: '8px' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
              Velocity によるトランジション制御
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>• Velocity &lt; 65: フェード切り替え</div>
            <div style={{ fontSize: '12px', color: '#666' }}>• Velocity ≥ 65: カット切り替え</div>
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
            ※ どのオクターブでも動作します
          </div>
        </div>
      </div>
    </div>
  )
}

export default ATEMControl
