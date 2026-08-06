export type FunctionResult = 'Equal' | 'Error'

export interface SourceLocation {
  file: string
  start_line: number
  start_character: number
  end_line: number
  end_character: number
}

export interface EqFunctionRef {
  name: string
  signature: string
  location?: SourceLocation
}

export interface EqMatchEntry {
  src: EqFunctionRef
  tgt: EqFunctionRef
  result: FunctionResult | string
  errors?: string[]
  deps?: string[]
}

export interface EqUnmatchedEntry {
  function: EqFunctionRef
  errors?: string[]
  deps?: string[]
}

export interface EqReport {
  src_structs?: string[]
  tgt_structs?: string[]
  matches: EqMatchEntry[]
  unmatched_src: EqUnmatchedEntry[]
  unmatched_tgt: EqUnmatchedEntry[]
}

export interface RoseReportSummary {
  equal?: number
  unmatched?: number
  errors?: number
  total?: number
  global_errors?: number
}

export interface RoseReport {
  rose_version?: string
  summary?: RoseReportSummary
  global_errors?: string[]
  eq_report: EqReport
}
