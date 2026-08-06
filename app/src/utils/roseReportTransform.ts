import type { DebugInfo, DebugBlock } from '../types/debug'
import type { ParsedDebugFile } from '../types/debugFile'
import type {
  DebugLevelEntry,
  EquivalenceWorkspace,
  FunctionId,
  FunctionRecord,
  FunctionStatus,
} from '../types/topo-smt'
import { emptyWorkspace } from '../types/topo-smt'
import type { EqMatchEntry, EqReport, EqUnmatchedEntry, RoseReport } from '../types/roseReport'
import { normalizeTopoStatus } from './parseDebugYaml'

const EMPTY_BLOCK: DebugBlock = {
  kir_1: '',
  kir_1_2: '',
  kir_2: '',
  graph: '',
}

function mapResult(result: string | undefined): FunctionStatus | undefined {
  switch (result) {
    case 'Equal':
    case 'equal':
      return 'equal'
    case 'Error':
    case 'Failed':
    case 'Fail':
      return 'fail'
    default:
      return undefined
  }
}

function buildMatchedMap(eqReport: EqReport): Map<string, string> {
  const map = new Map<string, string>()
  for (const entry of eqReport.matches) {
    map.set(entry.src.name, entry.tgt.name)
  }
  return map
}

function buildMatchBySrc(eqReport: EqReport): Map<string, EqMatchEntry> {
  const map = new Map<string, EqMatchEntry>()
  for (const entry of eqReport.matches) {
    map.set(entry.src.name, entry)
  }
  return map
}

function topoLabel(srcFunc: string, tgtFunc: string | undefined): string {
  return tgtFunc ? `${srcFunc}\n↓\n${tgtFunc}` : srcFunc
}

function buildDebugLevels(
  srcLevels: Record<string, string> | undefined,
  tgtLevels: Record<string, string> | undefined,
): DebugLevelEntry[] {
  const src = srcLevels ?? {}
  const tgt = tgtLevels ?? {}
  const seen = new Set<string>()
  const levels: DebugLevelEntry[] = []

  for (const id of Object.keys(src)) {
    seen.add(id)
    levels.push({
      id,
      label: id,
      src: src[id] ?? '',
      tgt: tgt[id] ?? '',
    })
  }

  for (const id of Object.keys(tgt)) {
    if (seen.has(id)) continue
    levels.push({
      id,
      label: id,
      src: src[id] ?? '',
      tgt: tgt[id] ?? '',
    })
  }

  return levels
}

function addRecord(workspace: EquivalenceWorkspace, record: FunctionRecord): void {
  workspace.records.set(record.id, record)

  if (record.match_kind === 'matched' || record.match_kind === 'unmatched_src') {
    workspace.srcSideIds.push(record.id)
  } else {
    workspace.unmatchedTgtIds.push(record.id)
  }

  if (record.src_func) {
    workspace.bySrcName.set(record.src_func, record.id)
  }
  if (record.tgt_func) {
    workspace.byTgtName.set(record.tgt_func, record.id)
  }
}

type GraphNode = { data: Record<string, unknown> }
type GraphEdge = { data: Record<string, unknown> }

function isGraphSrcNode(
  name: string,
  matchedMap: Map<string, string>,
  statusBySrc: Map<string, FunctionStatus>,
): boolean {
  // statusBySrc includes matched + unmatched_src only (unmatched_tgt is never added)
  return matchedMap.has(name) || statusBySrc.has(name)
}

function ensureDepNodes(
  nodes: GraphNode[],
  edges: GraphEdge[],
  nodeIds: Set<string>,
  srcFunc: string,
  deps: string[] | undefined,
  matchedMap: Map<string, string>,
  statusBySrc: Map<string, FunctionStatus>,
  idBySrc: Map<string, FunctionId>,
): void {
  for (const dep of deps ?? []) {
    // Only link to source-side graph nodes (matched / unmatched_src).
    // Deps that are unmatched_tgt (or otherwise absent) are omitted — never rendered.
    if (!nodeIds.has(dep) && !isGraphSrcNode(dep, matchedMap, statusBySrc)) {
      continue
    }

    if (!nodeIds.has(dep)) {
      const depTgt = matchedMap.get(dep)
      const depStatus = statusBySrc.get(dep)
      nodes.push({
        data: {
          id: dep,
          label: topoLabel(dep, depTgt),
          src_func: dep,
          ...(depTgt ? { tgt_func: depTgt } : {}),
          ...(depStatus ? { status: depStatus } : {}),
          ...(idBySrc.has(dep) ? { pair_id: idBySrc.get(dep) } : {}),
        },
      })
      nodeIds.add(dep)
    }

    edges.push({
      data: {
        id: `${srcFunc}->${dep}`,
        source: srcFunc,
        target: dep,
      },
    })
  }
}

/** Report-only graph: matches + unmatched_src only.
 * unmatched_tgt (and any deps listed on those entries) are never rendered. */
function buildFallbackGraph(
  eqReport: EqReport,
  matchedMap: Map<string, string>,
  statusBySrc: Map<string, FunctionStatus>,
  idBySrc: Map<string, FunctionId>,
): string {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  const nodeIds = new Set<string>()

  for (const entry of eqReport.matches) {
    const srcFunc = entry.src.name
    const tgtFunc = entry.tgt.name
    const status = statusBySrc.get(srcFunc)
    const pairId = idBySrc.get(srcFunc)

    nodes.push({
      data: {
        id: srcFunc,
        label: topoLabel(srcFunc, tgtFunc),
        src_func: srcFunc,
        tgt_func: tgtFunc,
        ...(status ? { status } : {}),
        ...(pairId != null ? { pair_id: pairId } : {}),
      },
    })
    nodeIds.add(srcFunc)

    ensureDepNodes(
      nodes,
      edges,
      nodeIds,
      srcFunc,
      entry.deps,
      matchedMap,
      statusBySrc,
      idBySrc,
    )
  }

  for (const entry of eqReport.unmatched_src) {
    const srcFunc = entry.function.name
    if (nodeIds.has(srcFunc)) continue

    const pairId = idBySrc.get(srcFunc)
    nodes.push({
      data: {
        id: srcFunc,
        label: topoLabel(srcFunc, undefined),
        src_func: srcFunc,
        status: 'unmatched',
        ...(pairId != null ? { pair_id: pairId } : {}),
      },
    })
    nodeIds.add(srcFunc)

    ensureDepNodes(
      nodes,
      edges,
      nodeIds,
      srcFunc,
      entry.deps,
      matchedMap,
      statusBySrc,
      idBySrc,
    )
  }

  return JSON.stringify({ elements: { nodes, edges } })
}

function patchGraphJson(
  graphJson: string,
  matchedMap: Map<string, string>,
  statusBySrc: Map<string, FunctionStatus>,
  idBySrc: Map<string, FunctionId>,
): { obj: Record<string, unknown>; nodeIds: Set<string> } | null {
  if (!graphJson) return null

  try {
    const obj = JSON.parse(graphJson) as Record<string, unknown>
    const elements = obj.elements as { nodes?: GraphNode[]; edges?: GraphEdge[] } | undefined
    const nodes = elements?.nodes
    if (!Array.isArray(nodes)) return null

    const nodeIds = new Set<string>()

    for (const node of nodes) {
      const data = node?.data
      if (!data || typeof data.src_func !== 'string') continue

      const srcFunc = data.src_func
      nodeIds.add(srcFunc)

      const tgtFunc = matchedMap.get(srcFunc)
      if (tgtFunc) {
        data.tgt_func = tgtFunc
        data.label = topoLabel(srcFunc, tgtFunc)
      } else {
        data.label = topoLabel(srcFunc, typeof data.tgt_func === 'string' ? data.tgt_func : undefined)
      }

      if (typeof data.status === 'string') {
        data.status = normalizeTopoStatus(data.status)
      } else {
        const status = statusBySrc.get(srcFunc)
        if (status) data.status = status
      }

      const pairId = idBySrc.get(srcFunc)
      if (pairId != null) data.pair_id = pairId
    }

    return { obj, nodeIds }
  } catch {
    return null
  }
}

/** Add unmatched_src nodes/edges missing from a debug-supplied graph. */
function supplementUnmatchedSrc(
  graphJson: string,
  unmatchedSrc: EqUnmatchedEntry[],
  matchedMap: Map<string, string>,
  statusBySrc: Map<string, FunctionStatus>,
  idBySrc: Map<string, FunctionId>,
): string {
  const patched = patchGraphJson(graphJson, matchedMap, statusBySrc, idBySrc)
  if (!patched) {
    return buildFallbackGraph(
      {
        matches: [],
        unmatched_src: unmatchedSrc,
        unmatched_tgt: [],
      },
      matchedMap,
      statusBySrc,
      idBySrc,
    )
  }

  const { obj, nodeIds } = patched
  const elements = obj.elements as { nodes: GraphNode[]; edges?: GraphEdge[] }
  if (!Array.isArray(elements.edges)) elements.edges = []

  for (const entry of unmatchedSrc) {
    const srcFunc = entry.function.name
    if (nodeIds.has(srcFunc)) {
      // Ensure existing node has unmatched status / pair_id
      for (const node of elements.nodes) {
        if (node.data?.src_func === srcFunc) {
          node.data.status = 'unmatched'
          node.data.label = topoLabel(srcFunc, undefined)
          delete node.data.tgt_func
          const pairId = idBySrc.get(srcFunc)
          if (pairId != null) node.data.pair_id = pairId
        }
      }
      continue
    }

    const pairId = idBySrc.get(srcFunc)
    elements.nodes.push({
      data: {
        id: srcFunc,
        label: topoLabel(srcFunc, undefined),
        src_func: srcFunc,
        status: 'unmatched',
        ...(pairId != null ? { pair_id: pairId } : {}),
      },
    })
    nodeIds.add(srcFunc)

    ensureDepNodes(
      elements.nodes,
      elements.edges,
      nodeIds,
      srcFunc,
      entry.deps,
      matchedMap,
      statusBySrc,
      idBySrc,
    )
  }

  return JSON.stringify(obj)
}

export function mergeReportAndDebug(
  report: RoseReport,
  debug: ParsedDebugFile | null,
): DebugInfo {
  const eqReport = report.eq_report
  const matchedMap = buildMatchedMap(eqReport)
  const matchBySrc = buildMatchBySrc(eqReport)
  const statusBySrc = new Map<string, FunctionStatus>()
  const idBySrc = new Map<string, FunctionId>()

  for (const entry of eqReport.matches) {
    const status = mapResult(String(entry.result))
    if (status) statusBySrc.set(entry.src.name, status)
  }
  for (const entry of eqReport.unmatched_src) {
    statusBySrc.set(entry.function.name, 'unmatched')
  }

  const lhsFunctions = debug?.lhs?.functions ?? {}
  const rhsFunctions = debug?.rhs?.functions ?? {}
  const topo = debug?.topo_smt_report

  const workspace = emptyWorkspace()
  let nextId = 0

  // Prefer debug topo pair_ids for matched entries when available
  const debugPairBySrc = new Map<string, number>()
  if (topo && topo.entries.length > 0) {
    for (const entry of topo.entries) {
      if (entry.src_func) debugPairBySrc.set(entry.src_func, entry.pair_id)
    }
  }

  // Assign ids: matched first (prefer debug pair_id), then unmatched_src, then unmatched_tgt
  const usedIds = new Set<number>()
  for (const entry of eqReport.matches) {
    const preferred = debugPairBySrc.get(entry.src.name)
    let id = preferred != null && !usedIds.has(preferred) ? preferred : nextId
    while (usedIds.has(id)) id += 1
    usedIds.add(id)
    if (id >= nextId) nextId = id + 1
    idBySrc.set(entry.src.name, id)
  }

  for (const entry of eqReport.unmatched_src) {
    let id = nextId
    while (usedIds.has(id)) id += 1
    usedIds.add(id)
    nextId = id + 1
    idBySrc.set(entry.function.name, id)
  }

  // Matched records
  for (const entry of eqReport.matches) {
    const srcFunc = entry.src.name
    const tgtFunc = entry.tgt.name
    const id = idBySrc.get(srcFunc)!
    const topoEntry = topo?.entries.find((e) => e.src_func === srcFunc)

    addRecord(workspace, {
      id,
      match_kind: 'matched',
      src_func: srcFunc,
      tgt_func: tgtFunc,
      src_sig: entry.src.signature,
      tgt_sig: entry.tgt.signature,
      src_location: entry.src.location,
      tgt_location: entry.tgt.location,
      status: mapResult(String(entry.result)) ?? topoEntry?.status,
      errors: entry.errors ?? topoEntry?.errors ?? [],
      smt_log: topoEntry?.smt_log ?? '',
      debug_levels: buildDebugLevels(
        lhsFunctions[srcFunc]?.levels,
        rhsFunctions[tgtFunc]?.levels,
      ),
    })
  }

  // Unmatched source records
  for (const entry of eqReport.unmatched_src) {
    const srcFunc = entry.function.name
    const id = idBySrc.get(srcFunc)!

    addRecord(workspace, {
      id,
      match_kind: 'unmatched_src',
      src_func: srcFunc,
      tgt_func: '',
      src_sig: entry.function.signature,
      src_location: entry.function.location,
      status: 'unmatched',
      errors: entry.errors ?? [],
      smt_log: '',
      debug_levels: buildDebugLevels(lhsFunctions[srcFunc]?.levels, undefined),
    })
  }

  // Unmatched target records (list/panel only). Never add them — or their deps —
  // to graph_json; TopoSmt is source-side only.
  for (const entry of eqReport.unmatched_tgt) {
    const tgtFunc = entry.function.name
    let id = nextId
    while (usedIds.has(id)) id += 1
    usedIds.add(id)
    nextId = id + 1

    addRecord(workspace, {
      id,
      match_kind: 'unmatched_tgt',
      src_func: '',
      tgt_func: tgtFunc,
      tgt_sig: entry.function.signature,
      tgt_location: entry.function.location,
      status: 'unmatched',
      errors: entry.errors ?? [],
      smt_log: '',
      debug_levels: buildDebugLevels(undefined, rhsFunctions[tgtFunc]?.levels),
    })
  }

  // Graph: debug path with unmatched_src supplement, or report-only fallback
  if (topo && topo.graph_json) {
    // Overlay match statuses from eq_report onto debug entries already applied via statusBySrc
    for (const [src, entry] of matchBySrc) {
      const status = mapResult(String(entry.result))
      if (status) statusBySrc.set(src, status)
    }
    workspace.graph_json = supplementUnmatchedSrc(
      topo.graph_json,
      eqReport.unmatched_src,
      matchedMap,
      statusBySrc,
      idBySrc,
    )
  } else {
    workspace.graph_json = buildFallbackGraph(eqReport, matchedMap, statusBySrc, idBySrc)
  }

  return {
    lhs: { ...EMPTY_BLOCK },
    rhs: { ...EMPTY_BLOCK },
    workspace,
  }
}

/** @deprecated Prefer mergeReportAndDebug(report, null) */
export function roseReportToDebugInfo(report: RoseReport): DebugInfo {
  return mergeReportAndDebug(report, null)
}
