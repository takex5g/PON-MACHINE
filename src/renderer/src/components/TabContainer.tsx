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
          padding: '0'
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
      </div>
      <div
        style={{
          flex: 1,
          padding: '20px',
          backgroundColor: '#ffffff',
          overflow: 'auto'
        }}
      >
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  )
}

export default TabContainer
