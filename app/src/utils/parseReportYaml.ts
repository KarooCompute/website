import { load as loadYaml } from 'js-yaml'
import type {
  EqFunctionRef,
  EqMatchEntry,
  EqReport,
  EqUnmatchedEntry,
  RoseReport,
  RoseReportSummary,
  SourceLocation,
} from '../types/roseReport'

export interface ReportSmokeInfo {
  roseVersion: string
  functionCount: number
  total: number | null
}

export interface ParseReportResult {
  report: RoseReport
  smokeInfo: ReportSmokeInfo
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeSummary(raw: unknown): RoseReportSummary | undefined {
  if (!isRecord(raw)) return undefined

  const equal =
    typeof raw.equal === 'number'
      ? raw.equal
      : typeof raw.passed === 'number'
        ? raw.passed
        : undefined

  return {
    equal,
    unmatched: typeof raw.unmatched === 'number' ? raw.unmatched : undefined,
    errors: typeof raw.errors === 'number' ? raw.errors : undefined,
    total: typeof raw.total === 'number' ? raw.total : undefined,
    global_errors: typeof raw.global_errors === 'number' ? raw.global_errors : undefined,
  }
}

function normalizeLocation(raw: unknown): SourceLocation | undefined {
  if (!isRecord(raw)) return undefined
  if (typeof raw.file !== 'string') return undefined
  return {
    file: raw.file,
    start_line: typeof raw.start_line === 'number' ? raw.start_line : 0,
    start_character: typeof raw.start_character === 'number' ? raw.start_character : 0,
    end_line: typeof raw.end_line === 'number' ? raw.end_line : 0,
    end_character: typeof raw.end_character === 'number' ? raw.end_character : 0,
  }
}

function normalizeFunctionRef(raw: unknown, label: string): EqFunctionRef {
  if (!isRecord(raw) || typeof raw.name !== 'string') {
    throw new Error(`eq_report ${label} is missing a function name.`)
  }
  return {
    name: raw.name,
    signature: typeof raw.signature === 'string' ? raw.signature : '',
    location: normalizeLocation(raw.location),
  }
}

function normalizeStringList(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined
  return raw.filter((item): item is string => typeof item === 'string')
}

function normalizeMatchEntry(raw: unknown, index: number): EqMatchEntry {
  if (!isRecord(raw)) {
    throw new Error(`eq_report.matches[${index}] must be a mapping.`)
  }
  if (raw.result == null) {
    throw new Error(`eq_report.matches[${index}] is missing result.`)
  }
  return {
    src: normalizeFunctionRef(raw.src, `matches[${index}].src`),
    tgt: normalizeFunctionRef(raw.tgt, `matches[${index}].tgt`),
    result: String(raw.result),
    errors: normalizeStringList(raw.errors),
    deps: normalizeStringList(raw.deps),
  }
}

function normalizeUnmatchedEntry(raw: unknown, index: number, side: string): EqUnmatchedEntry {
  if (!isRecord(raw)) {
    throw new Error(`eq_report.${side}[${index}] must be a mapping.`)
  }
  return {
    function: normalizeFunctionRef(raw.function, `${side}[${index}].function`),
    errors: normalizeStringList(raw.errors),
    deps: normalizeStringList(raw.deps),
  }
}

function normalizeEqReport(raw: unknown): EqReport {
  if (!isRecord(raw)) {
    throw new Error('Report YAML is missing an "eq_report" mapping.')
  }

  const matchesRaw = Array.isArray(raw.matches) ? raw.matches : []
  const unmatchedSrcRaw = Array.isArray(raw.unmatched_src) ? raw.unmatched_src : []
  const unmatchedTgtRaw = Array.isArray(raw.unmatched_tgt) ? raw.unmatched_tgt : []

  return {
    src_structs: normalizeStringList(raw.src_structs),
    tgt_structs: normalizeStringList(raw.tgt_structs),
    matches: matchesRaw.map((entry, i) => normalizeMatchEntry(entry, i)),
    unmatched_src: unmatchedSrcRaw.map((entry, i) =>
      normalizeUnmatchedEntry(entry, i, 'unmatched_src'),
    ),
    unmatched_tgt: unmatchedTgtRaw.map((entry, i) =>
      normalizeUnmatchedEntry(entry, i, 'unmatched_tgt'),
    ),
  }
}

export function parseReportYaml(content: string): ParseReportResult {
  const parsed = loadYaml(content)

  if (!isRecord(parsed)) {
    throw new Error('Report YAML must be a mapping at the top level.')
  }

  if (!('eq_report' in parsed)) {
    throw new Error('Report YAML is missing an "eq_report" mapping.')
  }

  const eq_report = normalizeEqReport(parsed.eq_report)
  const summary = normalizeSummary(parsed.summary)
  const global_errors = normalizeStringList(parsed.global_errors) ?? []

  const report: RoseReport = {
    rose_version: typeof parsed.rose_version === 'string' ? parsed.rose_version : undefined,
    summary,
    global_errors,
    eq_report,
  }

  const functionCount =
    eq_report.matches.length +
    eq_report.unmatched_src.length +
    eq_report.unmatched_tgt.length

  return {
    report,
    smokeInfo: {
      roseVersion: String(report.rose_version ?? 'unknown'),
      functionCount,
      total: typeof summary?.total === 'number' ? summary.total : null,
    },
  }
}
