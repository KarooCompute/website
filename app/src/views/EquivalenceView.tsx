import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AnsiToHtml from 'ansi-to-html'
import { useReportFile } from '../hooks/useReportFile'
import { TabBar } from '../components/layout/TabBar'
import { ReportFileSelect } from '../components/layout/ReportFileSelect'
import { ReportSummaryLine } from '../components/layout/ReportSummaryLine'
import { DualEditorLayout } from '../components/layout/DualEditorLayout'
import { EditorPane } from '../components/editor/EditorPane'
import { EquivalenceDetailShell } from '../components/topo-smt/EquivalenceDetailShell'
import { TopoSmtReportViewer } from '../components/topo-smt/TopoSmtReportViewer'
import { MatchListView } from '../components/match-list/MatchListView'
import {
  isFullWidthTab,
  isMatchListTab,
  isTopoSmtTab,
  type ContentResolverState,
} from './contentResolvers'
import type { BlockDebugTabType, FunctionId } from '../types'
import './EquivalenceView.css'

export const EquivalenceView: React.FC = () => {
  const reportHook = useReportFile()
  const [blockDebugTab, setBlockDebugTab] = useState<BlockDebugTabType>('topo_smt_report')
  const [selectedId, setSelectedId] = useState<FunctionId | null>(null)
  const graphApiRef = useRef<{ resize: () => void; fit: () => void } | null>(null)

  const ansiConverter = useMemo(() => new AnsiToHtml({ escapeXML: true }), [])

  const resolverState: ContentResolverState = {
    blockDebugTab,
    debugInfo: reportHook.debugInfo,
  }

  const debugTabs: { id: BlockDebugTabType; label: string }[] = [
    { id: 'topo_smt_report', label: 'TopoSmt' },
    { id: 'match_list', label: 'List' },
    { id: 'errors', label: 'Errors' },
  ]

  const workspaceKey = `${reportHook.selectedPath ?? ''}|${reportHook.selectedDebugPath ?? ''}`

  useEffect(() => {
    setSelectedId(null)
  }, [workspaceKey])

  const handleSelect = useCallback((id: FunctionId) => {
    setSelectedId(id)
  }, [])

  const handleClose = useCallback(() => {
    setSelectedId(null)
  }, [])

  const handlePanelLayoutChange = useCallback(() => {
    graphApiRef.current?.resize()
  }, [])

  let leftPane: React.ReactNode

  if (isTopoSmtTab(resolverState) || isMatchListTab(resolverState)) {
    leftPane = (
      <div className="editor-content">
        <EquivalenceDetailShell
          workspace={reportHook.workspace}
          selectedId={selectedId}
          onClose={handleClose}
          ansiConverter={ansiConverter}
          workspaceKey={workspaceKey}
          onPanelLayoutChange={handlePanelLayoutChange}
        >
          {isTopoSmtTab(resolverState) ? (
            <TopoSmtReportViewer
              workspace={reportHook.workspace}
              workspaceKey={workspaceKey}
              selectedId={selectedId}
              onSelect={handleSelect}
              onGraphReady={(api) => {
                graphApiRef.current = api
              }}
            />
          ) : (
            <MatchListView
              workspace={reportHook.workspace}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          )}
        </EquivalenceDetailShell>
      </div>
    )
  } else {
    leftPane = (
      <EditorPane
        mode="errors"
        report={reportHook.rawReport}
        ansiConverter={ansiConverter}
        editorReadOnly
      />
    )
  }

  return (
    <>
      <TabBar
        leading={
          <div className="equivalence-file-selects">
            <ReportFileSelect
              files={reportHook.files}
              value={reportHook.selectedPath}
              onChange={reportHook.selectFile}
              disabled={reportHook.loading}
              error={reportHook.error}
              placeholder="Select report…"
            />
            <ReportFileSelect
              files={reportHook.files}
              value={reportHook.selectedDebugPath}
              onChange={reportHook.selectDebugFile}
              disabled={reportHook.debugLoading}
              error={reportHook.debugError}
              placeholder="Select debug…"
            />
          </div>
        }
        tabs={debugTabs}
        activeTab={blockDebugTab}
        onTabChange={setBlockDebugTab}
        trailing={<ReportSummaryLine summary={reportHook.rawReport?.summary} />}
      />
      <DualEditorLayout
        fullWidth={isFullWidthTab(resolverState)}
        left={leftPane}
        right={undefined}
      />
    </>
  )
}
