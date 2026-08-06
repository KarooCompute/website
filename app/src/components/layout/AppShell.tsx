import './AppShell.css'

export interface AppShellProps {
  sidebar: React.ReactNode
  children: React.ReactNode
}

export const AppShell: React.FC<AppShellProps> = ({ sidebar, children }) => (
  <div className="editor-container">
    <div className="app-flex">
      {sidebar}
      <div className="main-column">{children}</div>
    </div>
  </div>
)
