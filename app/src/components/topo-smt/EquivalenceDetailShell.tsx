import { useEffect, useRef } from 'react'
import type AnsiToHtml from 'ansi-to-html'
import type { EquivalenceWorkspace, FunctionId, FunctionRecord } from '../../types'
import { DebugPanel } from './DebugPanel'
import { useResizablePanel } from './useResizablePanel'
import './EquivalenceDetailShell.css'

export interface EquivalenceDetailShellProps {
  workspace: EquivalenceWorkspace | null
  selectedId: FunctionId | null
  onClose: () => void
  ansiConverter: AnsiToHtml
  workspaceKey?: string | null
  onPanelLayoutChange?: () => void
  children: React.ReactNode
}

export function EquivalenceDetailShell({
  workspace,
  selectedId,
  onClose,
  ansiConverter,
  workspaceKey,
  onPanelLayoutChange,
  children,
}: EquivalenceDetailShellProps) {
  const viewerRef = useRef<HTMLDivElement | null>(null)
  const layoutChangeRef = useRef(onPanelLayoutChange)
  layoutChangeRef.current = onPanelLayoutChange

  const {
    panelOpen,
    panelWidth,
    startPanelResize,
    closePanel,
    resetPanel,
    openPanel,
  } = useResizablePanel(viewerRef, {
    onResize: () => layoutChangeRef.current?.(),
  })

  useEffect(() => {
    resetPanel()
  }, [workspaceKey, resetPanel])

  useEffect(() => {
    if (selectedId != null) {
      openPanel()
    }
  }, [selectedId, openPanel])

  useEffect(() => {
    layoutChangeRef.current?.()
  }, [panelOpen, panelWidth])

  const selectedRecord: FunctionRecord | undefined =
    selectedId != null ? workspace?.records.get(selectedId) : undefined
  const showPanel = panelOpen && selectedRecord != null && panelWidth != null

  const handleClose = () => {
    closePanel()
    onClose()
  }

  return (
    <div className="equivalence-detail-shell" ref={viewerRef}>
      <div className="equivalence-detail-navigator">{children}</div>
      {showPanel && selectedRecord ? (
        <div
          className="debug-panel"
          style={{ width: panelWidth, flexBasis: panelWidth }}
        >
          <div
            className="debug-panel-resizer"
            onMouseDown={startPanelResize}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize detail panel"
          />
          <div className="debug-panel-content">
            <DebugPanel
              entry={selectedRecord}
              ansiConverter={ansiConverter}
              onClose={handleClose}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
