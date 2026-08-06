import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AnsiToHtml from 'ansi-to-html'
import { fetchSample, fetchSamples, postEquivalence } from '../api/client'
import { TabBar } from '../components/layout/TabBar'
import { DualEditorLayout } from '../components/layout/DualEditorLayout'
import { EditorPane } from '../components/editor/EditorPane'
import { EquivalenceDetailShell } from '../components/topo-smt/EquivalenceDetailShell'
import { TopoSmtReportViewer } from '../components/topo-smt/TopoSmtReportViewer'
import { MatchListView } from '../components/match-list/MatchListView'
import { EquivalenceHeader } from '../equivalence/EquivalenceHeader'
import {
  getLeftLanguage,
  getRightLanguage,
  isFullWidthTab,
  isMatchListTab,
  isSourceCodeTab,
  isTopoSmtTab,
  type ContentResolverState,
} from './contentResolvers'
import type { BlockDebugTabType, DebugInfo, FunctionId, RoseReport } from '../types'
import './EquivalenceView.css'

function normalizeErrors(errors: unknown): string[] {
  if (errors == null) return []
  if (typeof errors === 'string') return errors.trim() ? [errors] : []
  if (Array.isArray(errors)) {
    return errors.flatMap((item) => {
      if (typeof item === 'string') return item.trim() ? [item] : []
      if (item == null) return []
      try {
        return [JSON.stringify(item)]
      } catch {
        return [String(item)]
      }
    })
  }
  try {
    return [JSON.stringify(errors)]
  } catch {
    return [String(errors)]
  }
}

function reportFromErrors(errors: string[]): RoseReport {
  return {
    global_errors: errors,
    eq_report: {
      matches: [],
      unmatched_src: [],
      unmatched_tgt: [],
    },
  }
}

export const EquivalenceView: React.FC = () => {
  const [blockDebugTab, setBlockDebugTab] = useState<BlockDebugTabType>('source_code')
  const [selectedId, setSelectedId] = useState<FunctionId | null>(null)
  const [samples, setSamples] = useState<string[]>([])
  const [selectedSample, setSelectedSample] = useState('')
  const [cCode, setCCode] = useState('// C code for equivalence\n')
  const [rCode, setRCode] = useState('// Rust code for equivalence\n')
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [result, setResult] = useState<boolean | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [showErrorPopover, setShowErrorPopover] = useState(false)
  const [runId, setRunId] = useState(0)
  const graphApiRef = useRef<{ resize: () => void; fit: () => void } | null>(null)

  const ansiConverter = useMemo(() => new AnsiToHtml({ escapeXML: true }), [])
  const workspace = debugInfo?.workspace ?? null
  const workspaceKey = String(runId)
  const errorsReport = useMemo(
    () => (result === null && errors.length === 0 ? null : reportFromErrors(errors)),
    [errors, result],
  )

  const resolverState: ContentResolverState = {
    blockDebugTab,
    debugInfo,
  }

  const debugTabs: { id: BlockDebugTabType; label: string }[] = [
    { id: 'source_code', label: 'Source Code' },
    { id: 'topo_smt_report', label: 'TopoSmt' },
    { id: 'match_list', label: 'List' },
    { id: 'errors', label: 'Errors' },
  ]

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const list = await fetchSamples()
        if (!cancelled) setSamples(list)
      } catch {
        if (!cancelled) setSamples([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setSelectedId(null)
  }, [workspaceKey])

  const handleSampleChange = useCallback(async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value
    setSelectedSample(name)
    setResult(null)
    setErrors([])
    setShowErrorPopover(false)
    if (!name) return

    try {
      const sample = await fetchSample(name)
      setCCode(sample.c_code)
      setRCode(sample.r_code)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setErrors([msg])
      setResult(false)
    }
  }, [])

  const handleRun = useCallback(async () => {
    setLoading(true)
    setShowErrorPopover(false)
    try {
      const response = await postEquivalence({
        c_code: cCode,
        r_code: rCode,
        mapping_yaml: '',
      })
      const nextErrors = normalizeErrors(response.errors)
      setErrors(nextErrors)
      setDebugInfo(response.debug_info ?? null)
      setResult(nextErrors.length === 0)
      setRunId((id) => id + 1)
      setSelectedId(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setErrors([msg])
      setResult(false)
      setDebugInfo(null)
      setRunId((id) => id + 1)
      setSelectedId(null)
    } finally {
      setLoading(false)
    }
  }, [cCode, rCode])

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
  let rightPane: React.ReactNode | undefined

  if (isSourceCodeTab(resolverState)) {
    leftPane = (
      <EditorPane
        mode="editor"
        editorValue={cCode}
        editorLanguage={getLeftLanguage(resolverState)}
        editorReadOnly={false}
        onEditorChange={setCCode}
      />
    )
    rightPane = (
      <EditorPane
        mode="editor"
        editorValue={rCode}
        editorLanguage={getRightLanguage(resolverState)}
        editorReadOnly={false}
        onEditorChange={setRCode}
      />
    )
  } else if (isTopoSmtTab(resolverState) || isMatchListTab(resolverState)) {
    leftPane = (
      <div className="editor-content">
        <EquivalenceDetailShell
          workspace={workspace}
          selectedId={selectedId}
          onClose={handleClose}
          ansiConverter={ansiConverter}
          workspaceKey={workspaceKey}
          onPanelLayoutChange={handlePanelLayoutChange}
        >
          {isTopoSmtTab(resolverState) ? (
            <TopoSmtReportViewer
              workspace={workspace}
              workspaceKey={workspaceKey}
              selectedId={selectedId}
              onSelect={handleSelect}
              onGraphReady={(api) => {
                graphApiRef.current = api
              }}
            />
          ) : (
            <MatchListView
              workspace={workspace}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          )}
        </EquivalenceDetailShell>
      </div>
    )
    rightPane = undefined
  } else {
    leftPane = (
      <EditorPane
        mode="errors"
        report={errorsReport}
        ansiConverter={ansiConverter}
        editorReadOnly
      />
    )
    rightPane = undefined
  }

  return (
    <>
      <EquivalenceHeader
        samples={samples}
        selectedSample={selectedSample}
        onSampleChange={(e) => {
          void handleSampleChange(e)
        }}
        result={result}
        errors={errors}
        showErrorPopover={showErrorPopover}
        onToggleErrorPopover={() => setShowErrorPopover((open) => !open)}
        onCloseErrorPopover={() => setShowErrorPopover(false)}
        loading={loading}
        onRun={() => {
          void handleRun()
        }}
      />
      <TabBar
        tabs={debugTabs}
        activeTab={blockDebugTab}
        onTabChange={setBlockDebugTab}
      />
      <DualEditorLayout
        fullWidth={isFullWidthTab(resolverState)}
        left={leftPane}
        right={rightPane}
      />
    </>
  )
}
