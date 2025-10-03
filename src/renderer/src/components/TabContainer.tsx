import React, { useState } from 'react'

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface TabContainerProps {
  tabs: Tab[]
}

const TabContainer: React.FC<TabContainerProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '')

  const handleEmergencyStop = () => {
    window.api.step400.softHiZ(1)
    window.api.step400.softHiZ(2)
  }

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
        // backgroundColor: '#f0f0f0'
      }}
    >
      <div
        style={{
          display: 'flex',
          // backgroundColor: '#e0e0e0',
          borderBottom: '2px solid #ccc',
          padding: '0',
          alignItems: 'center'
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === tab.id ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #4CAF50' : 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              color: activeTab === tab.id ? '#333' : '#666',
              transition: 'all 0.3s ease',
              marginBottom: activeTab === tab.id ? '-2px' : '0'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.backgroundColor = '#f5f5f5'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            {tab.label}
          </button>
        ))}
        <button
          onClick={handleEmergencyStop}
          style={{
            marginLeft: 'auto',
            marginRight: '20px',
            padding: '8px 32px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'background-color 0.3s ease',
            alignSelf: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#d32f2f'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f44336'
          }}
        >
          STOP
        </button>
      </div>
      <div
        style={{
          flex: 1,
          padding: '20px',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  )
}

export default TabContainer
