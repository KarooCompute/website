import { load as loadYaml } from 'js-yaml'
import type { ParsedDebugFile, RawTopoSmtEntry, RawTopoSmtReport } from '../types/debugFile'
import type { TopoSmtReport, TopoSmtReportEntry } from '../types/topo-smt'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function normalizeTopoStatus(
  status: string | undefined,
): TopoSmtReportEntry['status'] {
  switch (status) {
    case 'equal':
    case 'pass':
      return 'equal'
    case 'fail':
    case 'Error':
    case 'Failed':
    case 'Fail':
      return 'fail'
    case 'unmatched':
    case 'Unmatched':
    case 'skipped':
    case 'Skipped':
    case 'Skip':
      return 'unmatched'
    default:
      return 'unmatched'
  }
}

function normalizeTopoEntry(raw: RawTopoSmtEntry, index: number): TopoSmtReportEntry {
  return {
    pair_id: typeof raw.pair_id === 'number' ? raw.pair_id : index,
    src_func: raw.src_func ?? '',
    tgt_func: raw.tgt_func || undefined,
    status: normalizeTopoStatus(raw.status),
    smt_log: raw.smt_log ?? '',
    errors: Array.isArray(raw.errors) ? raw.errors.map(String) : [],
    debug_levels: [],
  }
}

function normalizeTopoReport(raw: unknown): TopoSmtReport | null {
  if (!isRecord(raw)) return null

  const report = raw as RawTopoSmtReport
  const entries = Array.isArray(report.entries)
    ? report.entries.map((entry, i) => normalizeTopoEntry(entry ?? {}, i))
    : []

  return {
    entries,
    graph_json: typeof report.graph_json === 'string' ? report.graph_json : '',
  }
}

export function normalizeDebugDocument(parsed: unknown): ParsedDebugFile {
  if (!isRecord(parsed)) {
    throw new Error('Debug YAML must be a mapping at the top level.')
  }

  const lhs = isRecord(parsed.lhs) ? (parsed.lhs as ParsedDebugFile['lhs']) : {}
  const rhs = isRecord(parsed.rhs) ? (parsed.rhs as ParsedDebugFile['rhs']) : {}

  return {
    lhs,
    rhs,
    topo_smt_report: normalizeTopoReport(parsed.topo_smt_report),
  }
}

export function parseDebugYaml(content: string): ParsedDebugFile {
  return normalizeDebugDocument(loadYaml(content))
}
