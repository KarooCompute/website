export type CyPos = { x: number; y: number }

export interface DebugData {
  ast_json: string
  lhs_kir1: string
  rhs_kir1: string
  lhs_kir1_2: string
  rhs_kir1_2: string
  lhs_kir2: string
  rhs_kir2: string
  lhs_graph: string
  rhs_graph: string
  rust_code: string
}

export interface DebugBlock {
  kir_1: string
  kir_1_2: string
  kir_2: string
  graph: string
}

import type { EquivalenceWorkspace } from './topo-smt'

export interface DebugInfo {
  lhs: DebugBlock
  rhs: DebugBlock
  workspace: EquivalenceWorkspace
}
