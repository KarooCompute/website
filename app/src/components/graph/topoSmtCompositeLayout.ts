import type cytoscape from 'cytoscape'
import {
  TOPO_SMT_COLUMN_PITCH,
  TOPO_SMT_DAGRE_LAYOUT,
  TOPO_SMT_MAX_PACK_WIDTH,
  TOPO_SMT_REGION_PADDING,
  TOPO_SMT_ROW_PITCH,
} from './cytoscapeLayout'
import {
  computeDagreRankMetrics,
  gridAlignCluster,
} from '../../utils/dagreRankMetrics'
import { shelfPackClusters, type ClusterRect } from '../../utils/rectanglePacking'

function findWeaklyConnectedComponents(
  nodeIds: Set<string>,
  edges: { source: string; target: string }[],
): string[][] {
  const adj = new Map<string, Set<string>>()
  for (const id of nodeIds) {
    adj.set(id, new Set())
  }

  for (const edge of edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) continue
    adj.get(edge.source)!.add(edge.target)
    adj.get(edge.target)!.add(edge.source)
  }

  const visited = new Set<string>()
  const components: string[][] = []

  for (const id of nodeIds) {
    if (visited.has(id)) continue

    const component: string[] = []
    const stack = [id]
    visited.add(id)

    while (stack.length > 0) {
      const current = stack.pop()!
      component.push(current)
      for (const neighbor of adj.get(current) ?? []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          stack.push(neighbor)
        }
      }
    }

    components.push(component)
  }

  return components
}

function translateCollection(collection: cytoscape.Collection, dx: number, dy: number): void {
  collection.forEach((node) => {
    const pos = node.position()
    node.position({ x: pos.x + dx, y: pos.y + dy })
  })
}

interface ClusterLayout {
  id: string
  subgraph: cytoscape.Collection
  widthUnits: number
  heightUnits: number
}

function layoutDependencyRegion(
  connectedNodes: cytoscape.Collection,
  edges: cytoscape.EdgeCollection,
  edgePairs: { source: string; target: string }[],
  yOffset: number,
): number {
  const componentIds = findWeaklyConnectedComponents(
    new Set(connectedNodes.map((n) => n.id())),
    edgePairs,
  )

  const clusterLayouts: ClusterLayout[] = []

  for (const ids of componentIds) {
    const idSet = new Set(ids)
    const componentId = ids.slice().sort().join('\0')
    const componentNodes = connectedNodes.filter((n) => idSet.has(n.id()))
    const componentEdges = (edges as cytoscape.EdgeCollection).filter(
      (e) => idSet.has(e.source().id()) && idSet.has(e.target().id()),
    )
    const subgraph = componentNodes.union(componentEdges)

    subgraph.layout(TOPO_SMT_DAGRE_LAYOUT).run()

    const metrics = computeDagreRankMetrics(subgraph)
    gridAlignCluster(subgraph, metrics)

    clusterLayouts.push({
      id: componentId,
      subgraph,
      widthUnits: metrics.widthUnits,
      heightUnits: metrics.heightUnits,
    })
  }

  const clusterRects: ClusterRect[] = clusterLayouts.map((c) => ({
    id: c.id,
    widthUnits: c.widthUnits,
    heightUnits: c.heightUnits,
  }))

  const { placements, totalRowUnits } = shelfPackClusters(
    clusterRects,
    TOPO_SMT_MAX_PACK_WIDTH,
  )

  const placementById = new Map(placements.map((p) => [p.id, p]))

  for (const cluster of clusterLayouts) {
    const placement = placementById.get(cluster.id)
    if (!placement) continue

    translateCollection(
      cluster.subgraph,
      placement.colOffset * TOPO_SMT_COLUMN_PITCH,
      yOffset + placement.rowOffset * TOPO_SMT_ROW_PITCH,
    )
  }

  if (totalRowUnits === 0) return yOffset
  return yOffset + totalRowUnits * TOPO_SMT_ROW_PITCH + TOPO_SMT_REGION_PADDING
}

function layoutIsolateGrid(isolateNodes: cytoscape.Collection, yOffset: number): void {
  if (isolateNodes.length === 0) return

  const sorted = isolateNodes.sort((a, b) => a.id().localeCompare(b.id()))
  const cols = Math.min(
    TOPO_SMT_MAX_PACK_WIDTH,
    Math.max(1, Math.ceil(Math.sqrt(sorted.length))),
  )

  sorted.forEach((node, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    node.position({
      x: col * TOPO_SMT_COLUMN_PITCH,
      y: yOffset + row * TOPO_SMT_ROW_PITCH,
    })
  })
}

export function runTopoSmtCompositeLayout(cy: cytoscape.Core): void {
  const nodes = cy.nodes()
  const edges = cy.edges()

  if (nodes.length === 0) return

  const connectedIds = new Set<string>()
  const edgePairs: { source: string; target: string }[] = []

  edges.forEach((edge) => {
    connectedIds.add(edge.source().id())
    connectedIds.add(edge.target().id())
    edgePairs.push({ source: edge.source().id(), target: edge.target().id() })
  })

  const connectedNodes = nodes.filter((n) => connectedIds.has(n.id()))
  const isolateNodes = nodes.filter((n) => !connectedIds.has(n.id()))

  let yOffset = 0

  if (connectedNodes.length > 0) {
    yOffset = layoutDependencyRegion(connectedNodes, edges as cytoscape.EdgeCollection, edgePairs, yOffset)
  }

  if (isolateNodes.length > 0) {
    layoutIsolateGrid(isolateNodes, yOffset)
  }
}
