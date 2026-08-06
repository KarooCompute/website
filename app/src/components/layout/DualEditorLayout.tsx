import './DualEditorLayout.css'

export interface DualEditorLayoutProps {
  fullWidth?: boolean
  left: React.ReactNode
  right?: React.ReactNode
}

export const DualEditorLayout: React.FC<DualEditorLayoutProps> = ({
  fullWidth,
  left,
  right,
}) => (
  <div className={`editors-flex ${fullWidth ? 'topo-smt-full' : ''}`}>
    <div className="editor-panel">{left}</div>
    {right != null && <div className="editor-panel">{right}</div>}
  </div>
)
