import { useState, useEffect } from 'react'

const ATEMControl = () => {
  const [ipAddress, setIpAddress] = useState('169.254.154.142')
  const [connected, setConnected] = useState(false)
  const [activeCamera, setActiveCamera] = useState(1)
  const [isConnecting, setIsConnecting] = useState(false)

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
    const result = await window.api.atem.switchCamera(cameraId)
    if (result.success) {
      setActiveCamera(cameraId)
    } else {
      alert(`カメラ切り替え失敗: ${result.error}`)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">ATEM スイッチャー制御</h2>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">接続設定</h3>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            placeholder="IPアドレス"
            className="px-3 py-1 border rounded"
            disabled={connected}
          />
          {!connected ? (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isConnecting ? '接続中...' : '接続'}
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              切断
            </button>
          )}
          <span className={`ml-2 ${connected ? 'text-green-600' : 'text-gray-500'}`}>
            {connected ? '● 接続中' : '○ 未接続'}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">カメラ切り替え</h3>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((cam) => (
            <button
              key={cam}
              onClick={() => handleCameraSwitch(cam)}
              disabled={!connected}
              className={`p-4 rounded font-bold ${
                activeCamera === cam ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              CAM {cam}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">MIDI制御マッピング（Port 3）</h3>
        <div className="bg-gray-100 p-3 rounded">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>• ノート C → カメラ 1</div>
            <div>• ノート D → カメラ 2</div>
            <div>• ノート E → カメラ 3</div>
            <div>• ノート F → カメラ 4</div>
          </div>
          <div className="mt-2 text-xs text-gray-600">※ どのオクターブでも動作します</div>
        </div>
      </div>
    </div>
  )
}

export default ATEMControl
