import type { CyPos } from '../types'

export interface GraphElements {
  nodes: unknown[]
  edges: unknown[]
}

export interface ParseElementsOptions {
  enrichTopoSmtLabels?: boolean
}

function topoNodeLabel(srcFunc: string, tgtFunc: string | undefined): string {
  return tgtFunc ? `${srcFunc}\n↓\n${tgtFunc}` : srcFunc
}

function normalizeNodeStatus(status: unknown): string | undefined {
  if (typeof status !== 'string') return undefined
  switch (status) {
    case 'pass':
    case 'equal':
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
      return status
  }
}

export function parseElements(
  input: string,
  options?: ParseElementsOptions,
): GraphElements {
  if (!input) return { nodes: [], edges: [] }

  const enrichNodes = (nodes: unknown[]): unknown[] => {
    if (!options?.enrichTopoSmtLabels) return nodes
    return nodes.map((n) => {
      const node = n as {
        data?: {
          label?: string
          src_func?: string
          tgt_func?: string
          status?: string
        }
      }
      const data = node?.data
      if (!data) return n

      const next = { ...data }
      if (data.src_func) {
        next.label = topoNodeLabel(data.src_func, data.tgt_func || undefined)
      }
      const status = normalizeNodeStatus(data.status)
      if (status) next.status = status

      return { ...node, data: next }
    })
  }

  try {
    const obj = JSON.parse(input)
    const els = obj?.elements ? obj.elements : { nodes: [], edges: [] }
    return {
      nodes: enrichNodes(els.nodes || []),
      edges: els.edges || [],
    }
  } catch {
    if (options?.enrichTopoSmtLabels) {
      return { nodes: [], edges: [] }
    }
  }

  const nodes: unknown[] = []
  const edges: unknown[] = []
  input.split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed) return
    try {
      const obj = JSON.parse(trimmed)
      if (obj?.elements) {
        if (Array.isArray(obj.elements.nodes)) nodes.push(...obj.elements.nodes)
        if (Array.isArray(obj.elements.edges)) edges.push(...obj.elements.edges)
      }
    } catch {
      // ignore lines that aren't standalone JSON
    }
  })
  return { nodes, edges }
}

function accumulateNodes(obj: unknown, acc: unknown[]): void {
  const parsed = obj as { elements?: { nodes?: unknown[] } }
  const els = parsed?.elements ?? {}
  if (Array.isArray(els.nodes)) acc.push(...els.nodes)
}

export function computeRhsPresetPositions(
  leftPositions: Record<string, CyPos>,
  rhsGraphJson: string,
): Record<string, CyPos> | undefined {
  if (!leftPositions || Object.keys(leftPositions).length === 0) return undefined
  if (!rhsGraphJson) return undefined

  const nodes: unknown[] = []
  try {
    accumulateNodes(JSON.parse(rhsGraphJson), nodes)
  } catch {
    rhsGraphJson.split('\n').forEach((line) => {
      const t = line.trim()
      if (!t) return
      try {
        accumulateNodes(JSON.parse(t), nodes)
      } catch {
        // ignore
      }
    })
  }

  const mapped: Record<string, CyPos> = {}
  nodes.forEach((n) => {
    const node = n as { data?: { id?: string; left_id?: string } }
    const id = node?.data?.id
    const leftId = node?.data?.left_id
    if (id && leftId && leftPositions[leftId]) {
      mapped[id] = leftPositions[leftId]
    }
  })
  return Object.keys(mapped).length > 0 ? mapped : undefined
}
