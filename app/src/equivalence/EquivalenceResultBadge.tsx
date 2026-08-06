import { PiApproximateEqualsBold } from 'react-icons/pi'
import { TopoSmtStatusIndicator } from '../components/topo-smt/TopoSmtStatusIndicator'
import { EquivalenceErrorPopover } from './EquivalenceErrorPopover'
import './EquivalenceHeader.css'

export interface EquivalenceResultBadgeProps {
  result: boolean | null
  errors: string[]
  showErrorPopover: boolean
  onToggleErrorPopover: () => void
  onCloseErrorPopover: () => void
  loading: boolean
  onRun: () => void
}

export const EquivalenceResultBadge: React.FC<EquivalenceResultBadgeProps> = ({
  result,
  errors,
  showErrorPopover,
  onToggleErrorPopover,
  onCloseErrorPopover,
  loading,
  onRun,
}) => (
  <div className="editor-title-panel-spacer">
    {result !== null && (
      <span className="equivalence-result-badge">
        {result ? (
          <>
            <span>Equal</span>
            <TopoSmtStatusIndicator status="equal" />
          </>
        ) : (
          <EquivalenceErrorPopover
            errors={errors}
            open={showErrorPopover}
            onToggle={onToggleErrorPopover}
            onClose={onCloseErrorPopover}
          />
        )}
      </span>
    )}
    <button
      className="translate-btn"
      onClick={onRun}
      disabled={loading}
      title="Check equivalence"
    >
      {loading ? '...' : <PiApproximateEqualsBold size={18} />}
    </button>
  </div>
)
