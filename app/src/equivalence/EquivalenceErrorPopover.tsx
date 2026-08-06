import { createPortal } from 'react-dom'
import { useRef } from 'react'
import { BiError } from 'react-icons/bi'
import { useClickAway } from '../hooks/useClickAway'
import { useAnchoredPopover } from '../hooks/useAnchoredPopover'
import { TopoSmtStatusIndicator } from '../components/topo-smt/TopoSmtStatusIndicator'
import './EquivalenceHeader.css'

export interface EquivalenceErrorPopoverProps {
  errors: string[]
  open: boolean
  onToggle: () => void
  onClose: () => void
}

export const EquivalenceErrorPopover: React.FC<EquivalenceErrorPopoverProps> = ({
  errors,
  open,
  onToggle,
  onClose,
}) => {
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const position = useAnchoredPopover(buttonRef, open)

  useClickAway([popoverRef, buttonRef], onClose, open)

  return (
    <>
      <span>Not equal</span>
      <button
        aria-label="Show equivalence errors"
        onClick={onToggle}
        className="equivalence-error-btn"
        title="View errors"
        ref={buttonRef}
      >
        <TopoSmtStatusIndicator status="fail" />
      </button>
      {open &&
        errors.length > 0 &&
        createPortal(
          <div
            ref={popoverRef}
            className="equivalence-error-popover"
            style={{ top: position.top, left: position.left }}
          >
            <div>
              {errors.map((e, idx) => (
                <div key={idx} className="equivalence-error-item">
                  <BiError size={18} color="#ff5252" style={{ flex: '0 0 auto', marginTop: 2 }} />
                  <div className="equivalence-error-text">{e}</div>
                </div>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
