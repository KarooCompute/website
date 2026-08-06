import { EquivalenceResultBadge } from './EquivalenceResultBadge'
import './EquivalenceHeader.css'

export interface EquivalenceHeaderProps {
  samples: string[]
  selectedSample: string
  onSampleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  result: boolean | null
  errors: string[]
  showErrorPopover: boolean
  onToggleErrorPopover: () => void
  onCloseErrorPopover: () => void
  loading: boolean
  onRun: () => void
}

export const EquivalenceHeader: React.FC<EquivalenceHeaderProps> = ({
  samples,
  selectedSample,
  onSampleChange,
  result,
  errors,
  showErrorPopover,
  onToggleErrorPopover,
  onCloseErrorPopover,
  loading,
  onRun,
}) => (
  <div className="editors-header-flex">
    <div className="editor-title-panel editor-title-panel-actions">
      <h2>Sample</h2>
      <select value={selectedSample} onChange={onSampleChange} className="inline-selector">
        <option value="">Select sample...</option>
        {samples.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <EquivalenceResultBadge
        result={result}
        errors={errors}
        showErrorPopover={showErrorPopover}
        onToggleErrorPopover={onToggleErrorPopover}
        onCloseErrorPopover={onCloseErrorPopover}
        loading={loading}
        onRun={onRun}
      />
    </div>
    <div className="editor-title-panel">
      <h2>Rust Input</h2>
    </div>
  </div>
)
