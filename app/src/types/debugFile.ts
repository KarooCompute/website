import type { TopoSmtReport } from './topo-smt'

export interface DebugFunctionEntry {
  levels?: Record<string, string>
}

export interface DebugSide {
  functions?: Record<string, DebugFunctionEntry>
}

export interface RawTopoSmtEntry {
  pair_id?: number
  src_func?: string
  tgt_func?: string
  status?: string
  smt_log?: string
  errors?: string[]
}

export interface RawTopoSmtReport {
  entries?: RawTopoSmtEntry[]
  graph_json?: string
}

export interface DebugFile {
  rose_version?: string
  lhs?: DebugSide
  rhs?: DebugSide
  topo_smt_report?: RawTopoSmtReport
}

export interface ParsedDebugFile {
  lhs: DebugSide
  rhs: DebugSide
  topo_smt_report: TopoSmtReport | null
}
