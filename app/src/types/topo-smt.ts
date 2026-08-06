import type { SourceLocation } from './roseReport'

export interface KirPair {
  src: string
  tgt: string
}

export interface DebugLevelEntry {
  id: string
  label: string
  src: string
  tgt: string
}

export type FunctionId = number

export type MatchKind = 'matched' | 'unmatched_src' | 'unmatched_tgt'

export type FunctionStatus = 'equal' | 'fail' | 'unmatched'

export interface FunctionRecord {
  id: FunctionId
  match_kind: MatchKind
  src_func: string
  tgt_func: string
  src_sig?: string
  tgt_sig?: string
  src_location?: SourceLocation
  tgt_location?: SourceLocation
  status?: FunctionStatus
  errors: string[]
  smt_log: string
  debug_levels: DebugLevelEntry[]
}

export interface EquivalenceWorkspace {
  records: Map<FunctionId, FunctionRecord>
  /** Matched + unmatched_src (source-side bucket; rendered in TopoSmt graph) */
  srcSideIds: FunctionId[]
  unmatchedTgtIds: FunctionId[]
  bySrcName: Map<string, FunctionId>
  byTgtName: Map<string, FunctionId>
  graph_json: string
}

/** @deprecated Prefer FunctionRecord; kept for debug YAML intermediate parsing */
export interface TopoSmtReportEntry {
  pair_id: number
  src_func: string
  tgt_func?: string
  src_sig?: string
  tgt_sig?: string
  status: FunctionStatus
  smt_log: string
  errors: string[]
  debug_levels: DebugLevelEntry[]
}

export interface TopoSmtReport {
  entries: TopoSmtReportEntry[]
  graph_json: string
}

export type DebugPanelTabType = string

export function emptyWorkspace(): EquivalenceWorkspace {
  return {
    records: new Map(),
    srcSideIds: [],
    unmatchedTgtIds: [],
    bySrcName: new Map(),
    byTgtName: new Map(),
    graph_json: '',
  }
}
