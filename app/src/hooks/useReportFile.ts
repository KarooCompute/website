import { useCallback, useEffect, useRef, useState } from 'react'
import type { DebugInfo } from '../types'
import type { ParsedDebugFile } from '../types/debugFile'
import type { RoseReport } from '../types/roseReport'
import { parseDebugYaml } from '../utils/parseDebugYaml'
import { parseReportYaml, type ReportSmokeInfo } from '../utils/parseReportYaml'
import { mergeReportAndDebug } from '../utils/roseReportTransform'

export interface YamlFileEntry {
  label: string
  path: string
}

const DEFAULT_ROSE_REPORT = 'rose_report.yaml'
const DEFAULT_DEBUG = 'debug.yaml'

const DEMO_FILES: YamlFileEntry[] = [
  { label: DEFAULT_ROSE_REPORT, path: DEFAULT_ROSE_REPORT },
  { label: DEFAULT_DEBUG, path: DEFAULT_DEBUG },
]

function demoAssetUrl(path: string): string {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`
  return `${base}demo/${path}`
}

async function fetchYaml(path: string): Promise<string> {
  const res = await fetch(demoAssetUrl(path))
  if (!res.ok) {
    throw new Error(`Failed to load ${path} (${res.status})`)
  }
  return res.text()
}

export function useReportFile() {
  const [files] = useState<YamlFileEntry[]>(DEMO_FILES)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [selectedDebugPath, setSelectedDebugPath] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [debugLoading, setDebugLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugError, setDebugError] = useState<string | null>(null)
  const [rawReport, setRawReport] = useState<RoseReport | null>(null)
  const [parsedDebug, setParsedDebug] = useState<ParsedDebugFile | null>(null)
  const [smokeInfo, setSmokeInfo] = useState<ReportSmokeInfo | null>(null)
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)

  const rawReportRef = useRef<RoseReport | null>(null)
  const parsedDebugRef = useRef<ParsedDebugFile | null>(null)

  rawReportRef.current = rawReport
  parsedDebugRef.current = parsedDebug

  const recompute = useCallback((report: RoseReport | null, debug: ParsedDebugFile | null) => {
    if (!report) {
      setDebugInfo(null)
      return
    }
    setDebugInfo(mergeReportAndDebug(report, debug))
  }, [])

  const loadReportContent = useCallback(
    (path: string, content: string) => {
      setSelectedPath(path)
      try {
        const { report, smokeInfo: info } = parseReportYaml(content)
        setRawReport(report)
        setSmokeInfo(info)
        setError(null)
        recompute(report, parsedDebugRef.current)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        setRawReport(null)
        setSmokeInfo(null)
        setDebugInfo(null)
        setError(msg)
      } finally {
        setLoading(false)
      }
    },
    [recompute],
  )

  const loadDebugContent = useCallback(
    (path: string, content: string) => {
      setSelectedDebugPath(path)
      try {
        const debug = parseDebugYaml(content)
        setParsedDebug(debug)
        setDebugError(null)
        recompute(rawReportRef.current, debug)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        setParsedDebug(null)
        setDebugError(msg)
        recompute(rawReportRef.current, null)
      } finally {
        setDebugLoading(false)
      }
    },
    [recompute],
  )

  const selectFile = useCallback(
    async (path: string) => {
      if (!path) {
        setSelectedPath(null)
        setRawReport(null)
        setSmokeInfo(null)
        setError(null)
        setLoading(false)
        recompute(null, parsedDebugRef.current)
        return
      }

      setSelectedPath(path)
      setLoading(true)
      setError(null)
      setDebugInfo(null)
      setRawReport(null)
      setSmokeInfo(null)

      try {
        const content = await fetchYaml(path)
        loadReportContent(path, content)
      } catch (err: unknown) {
        setLoading(false)
        setError(err instanceof Error ? err.message : String(err))
      }
    },
    [loadReportContent, recompute],
  )

  const selectDebugFile = useCallback(
    async (path: string) => {
      if (!path) {
        setSelectedDebugPath(null)
        setParsedDebug(null)
        setDebugError(null)
        setDebugLoading(false)
        recompute(rawReportRef.current, null)
        return
      }

      setSelectedDebugPath(path)
      setDebugLoading(true)
      setDebugError(null)

      try {
        const content = await fetchYaml(path)
        loadDebugContent(path, content)
      } catch (err: unknown) {
        setDebugLoading(false)
        setDebugError(err instanceof Error ? err.message : String(err))
        recompute(rawReportRef.current, null)
      }
    },
    [loadDebugContent, recompute],
  )

  useEffect(() => {
    void selectFile(DEFAULT_ROSE_REPORT)
    void selectDebugFile(DEFAULT_DEBUG)
    // Load demo fixtures once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    files,
    selectedPath,
    selectedDebugPath,
    loading,
    debugLoading,
    error,
    debugError,
    rawReport,
    smokeInfo,
    debugInfo,
    workspace: debugInfo?.workspace ?? null,
    selectFile,
    selectDebugFile,
  }
}
