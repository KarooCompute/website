import './TabBar.css'

export interface TabBarItem<T extends string> {
  id: T
  label: string
}

export interface TabBarProps<T extends string> {
  leading?: React.ReactNode
  trailing?: React.ReactNode
  tabs: TabBarItem<T>[]
  activeTab: T
  onTabChange: (tab: T) => void
}

export function TabBar<T extends string>({
  leading,
  trailing,
  tabs,
  activeTab,
  onTabChange,
}: TabBarProps<T>) {
  return (
    <div className="debug-tabs">
      {leading ? <div className="debug-tabs-leading">{leading}</div> : null}
      <div className="debug-tabs-items">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {trailing ? <div className="debug-tabs-trailing">{trailing}</div> : null}
    </div>
  )
}
