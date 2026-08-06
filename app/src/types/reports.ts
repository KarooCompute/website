import type { DebugInfo } from './debug'

export interface ReportListItem {
  filename: string
  size: number
}

export interface ReportDetail {
  debug_info: DebugInfo
  rust_code: string
  c_code: string
  case_name: string
  error: string
}
