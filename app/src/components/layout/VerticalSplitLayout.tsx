import './VerticalSplitLayout.css'

export interface VerticalSplitLayoutProps {
  top: React.ReactNode
  bottom: React.ReactNode
}

export function VerticalSplitLayout({ top, bottom }: VerticalSplitLayoutProps) {
  return (
    <div className="vertical-split-layout">
      <div className="vertical-split-pane">{top}</div>
      <div className="vertical-split-pane">{bottom}</div>
    </div>
  )
}
