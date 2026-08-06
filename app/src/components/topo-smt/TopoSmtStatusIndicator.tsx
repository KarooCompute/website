import { FaCheck, FaExclamation, FaQuestion } from 'react-icons/fa6'
import type { FunctionStatus } from '../../types'
import './TopoSmtStatusIndicator.css'

const TOPO_SMT_STATUS_LABELS: Record<FunctionStatus, string> = {
  equal: 'equal',
  fail: 'Failed',
  unmatched: 'Unmatched',
}

export interface TopoSmtStatusIndicatorProps {
  status: FunctionStatus
}

export const TopoSmtStatusIndicator: React.FC<TopoSmtStatusIndicatorProps> = ({ status }) => {
  const label = TOPO_SMT_STATUS_LABELS[status]
  const icon =
    status === 'equal' ? (
      <FaCheck size={12} />
    ) : status === 'fail' ? (
      <FaExclamation size={12} />
    ) : (
      <FaQuestion size={12} />
    )

  return (
    <span className={`topo-smt-status-indicator ${status}`} title={label} aria-label={label}>
      {icon}
    </span>
  )
}
