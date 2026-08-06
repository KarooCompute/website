import { useEffect, useMemo, useState } from 'react'
import type AnsiToHtml from 'ansi-to-html'
import type { DebugLevelEntry, DebugPanelTabType, FunctionRecord } from '../../types'
import type { SourceLocation } from '../../types/roseReport'
import { TabBar } from '../layout/TabBar'
import { VerticalSplitLayout } from '../layout/VerticalSplitLayout'
import { CodeEditor } from '../editor/CodeEditor'
import { FunctionErrorsList } from '../errors/FunctionErrorsList'
import { TopoSmtStatusIndicator } from './TopoSmtStatusIndicator'
import { postToExtension } from '../../vscode/api'
import { isNavigableLocation } from '../../utils/sourceLocation'
import './DebugPanel.css'

export interface DebugPanelProps {
  entry: FunctionRecord
  ansiConverter: AnsiToHtml
  onClose: () => void
}

function KirSplitPane({ label, value }: { label: string; value: string }) {
  return (
    <div className="topo-smt-kir-pane">
      <div className={`vertical-split-pane-label ${label}`}>{label}</div>
      <div className="editor-content">
        <CodeEditor value={value || '(empty)'} language="json" readOnly />
      </div>
    </div>
  )
}

function LevelTabContent({ level }: { level: DebugLevelEntry }) {
  return (
    <VerticalSplitLayout
      top={<KirSplitPane label="src" value={level.src} />}
      bottom={<KirSplitPane label="tgt" value={level.tgt} />}
    />
  )
}

function buildPanelTabs(levels: DebugLevelEntry[]): { id: DebugPanelTabType; label: string }[] {
  return [
    ...levels.map((level) => ({ id: level.id, label: level.label })),
    { id: 'smt', label: 'SMT' },
    { id: 'errors', label: 'Errors' },
  ]
}

function defaultTab(levels: DebugLevelEntry[]): DebugPanelTabType {
  return levels[0]?.id ?? 'smt'
}

function FuncBubble({
  name,
  side,
  signature,
  location,
}: {
  name: string
  side: 'src' | 'tgt'
  signature?: string
  location?: SourceLocation
}) {
  const navigable = isNavigableLocation(location)
  const titleParts = [signature, navigable ? 'Open in editor' : undefined].filter(Boolean)
  const title = titleParts.length > 0 ? titleParts.join(' — ') : undefined

  if (navigable) {
    return (
      <button
        type="button"
        className={`func-bubble ${side} navigable`}
        title={title}
        onClick={() =>
          postToExtension({ type: 'openSourceLocation', location })
        }
      >
        {name}
      </button>
    )
  }

  return (
    <span className={`func-bubble ${side}`} title={title}>
      {name}
    </span>
  )
}

export function DebugPanel({ entry, ansiConverter, onClose }: DebugPanelProps) {
  const tabs = useMemo(() => buildPanelTabs(entry.debug_levels), [entry.debug_levels])
  const [activeTab, setActiveTab] = useState<DebugPanelTabType>(() =>
    defaultTab(entry.debug_levels),
  )

  useEffect(() => {
    setActiveTab(defaultTab(entry.debug_levels))
  }, [entry.id]) // eslint-disable-line react-hooks/exhaustive-deps -- reset only when record changes

  const activeLevel = entry.debug_levels.find((level) => level.id === activeTab)
  const hasSrc = Boolean(entry.src_func)
  const hasTgt = Boolean(entry.tgt_func)

  return (
    <div className="debug-panel-inner">
      <div className="debug-panel-header">
        {entry.status ? <TopoSmtStatusIndicator status={entry.status} /> : null}
        {hasSrc ? (
          <FuncBubble
            name={entry.src_func}
            side="src"
            signature={entry.src_sig}
            location={entry.src_location}
          />
        ) : null}
        {hasSrc && hasTgt ? <span className="topo-smt-approx">≈</span> : null}
        {hasTgt ? (
          <FuncBubble
            name={entry.tgt_func}
            side="tgt"
            signature={entry.tgt_sig}
            location={entry.tgt_location}
          />
        ) : null}
        <button
          type="button"
          className="debug-panel-close"
          onClick={onClose}
          aria-label="Close detail panel"
        >
          ×
        </button>
      </div>
      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="debug-panel-body">
        {activeTab === 'smt' ? (
          entry.smt_log ? (
            <pre
              className="smt-ansi"
              dangerouslySetInnerHTML={{ __html: ansiConverter.toHtml(entry.smt_log) }}
            />
          ) : (
            <div className="topo-smt-no-log">No SMT log available for this pair.</div>
          )
        ) : activeTab === 'errors' ? (
          <FunctionErrorsList errors={entry.errors} />
        ) : activeLevel ? (
          <LevelTabContent level={activeLevel} />
        ) : (
          <div className="topo-smt-no-log">No debug content for this tab.</div>
        )}
      </div>
    </div>
  )
}
