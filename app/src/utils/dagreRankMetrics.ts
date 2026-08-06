import type cytoscape from 'cytoscape'
import { TOPO_SMT_COLUMN_PITCH, TOPO_SMT_ROW_PITCH } from '../components/graph/cytoscapeLayout'

export interface ClusterMetrics {
  widthUnits: number
  heightUnits: number
  ranks: Map<string, number>
  layers: Map<number, string[]>
}

function computeLongestPathRanks(
  nodeIds: string[],
  edges: { source: string; target: string }[],
): Map<string, number> {
  const ranks = new Map<string, number>()
  for (const id of nodeIds) {
    ranks.set(id, 0)
  }

  const incoming = new Map<string, string[]>()
  for (const id of nodeIds) {
    incoming.set(id, [])
  }
  for (const edge of edges) {
    incoming.get(edge.target)?.push(edge.source)
  }

  let changed = true
  while (changed) {
    changed = false
    for (const edge of edges) {
      const nextRank = (ranks.get(edge.source) ?? 0) + 1
      const current = ranks.get(edge.target) ?? 0
      if (nextRank > current) {
        ranks.set(edge.target, nextRank)
        changed = true
      }
    }
  }

  return ranks
}

function buildLayers(ranks: Map<string, number>): Map<number, string[]> {
  const layers = new Map<number, string[]>()
  for (const [nodeId, rank] of ranks) {
    const layer = layers.get(rank) ?? []
    layer.push(nodeId)
    layers.set(rank, layer)
  }
  return layers
}

export function computeDagreRankMetrics(
  subgraph: cytoscape.Collection,
): ClusterMetrics {
  const nodeIds = subgraph.nodes().map((n) => n.id())
  const edges = subgraph.edges().map((e) => ({
    source: e.source().id(),
    target: e.target().id(),
  }))

  const ranks = computeLongestPathRanks(nodeIds, edges)
  const layers = buildLayers(ranks)

  let widthUnits = 1
  for (const nodes of layers.values()) {
    widthUnits = Math.max(widthUnits, nodes.length)
  }

  const rankValues = [...layers.keys()]
  const minRank = rankValues.length > 0 ? Math.min(...rankValues) : 0
  const maxRank = rankValues.length > 0 ? Math.max(...rankValues) : 0
  const heightUnits = maxRank - minRank + 1

  return { widthUnits, heightUnits, ranks, layers }
}

function layerStartCol(layerSize: number, widthUnits: number): number {
  return Math.floor((widthUnits - layerSize) / 2)
}

function assignLayerColumns(
  nodeIds: string[],
  subgraph: cytoscape.Collection,
  widthUnits: number,
): Map<string, number> {
  const sorted = [...nodeIds].sort((a, b) => {
    const nodeA = subgraph.getElementById(a)
    const nodeB = subgraph.getElementById(b)
    return nodeA.position('x') - nodeB.position('x')
  })

  const startCol = layerStartCol(sorted.length, widthUnits)
  const columns = new Map<string, number>()
  sorted.forEach((nodeId, index) => {
    columns.set(nodeId, startCol + index)
  })
  return columns
}

export function gridAlignCluster(
  subgraph: cytoscape.Collection,
  metrics: ClusterMetrics,
): void {
  const { widthUnits, ranks, layers } = metrics
  const rankValues = [...layers.keys()]
  const minRank = rankValues.length > 0 ? Math.min(...rankValues) : 0

  const columnByNode = new Map<string, number>()

  for (const [, nodeIds] of layers) {
    const layerCols = assignLayerColumns(nodeIds, subgraph, widthUnits)
    for (const [nodeId, col] of layerCols) {
      columnByNode.set(nodeId, col)
    }
  }

  subgraph.nodes().forEach((node) => {
    const nodeId = node.id()
    const rank = ranks.get(nodeId) ?? minRank
    const col = columnByNode.get(nodeId) ?? layerStartCol(1, widthUnits)
    node.position({
      x: col * TOPO_SMT_COLUMN_PITCH,
      y: (rank - minRank) * TOPO_SMT_ROW_PITCH,
    })
  })
}
