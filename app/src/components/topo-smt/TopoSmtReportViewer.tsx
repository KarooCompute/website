import { useCallback, useEffect, useRef, useState } from 'react'
import type { EquivalenceWorkspace, FunctionId } from '../../types'
import { parseElements } from '../../utils/graph'
import cytoscape from '../graph/setup'
import { FIT_PADDING, TOPO_SMT_MAX_ZOOM } from '../graph/cytoscapeLayout'
import { runTopoSmtCompositeLayout } from '../graph/topoSmtCompositeLayout'
import { TOPO_SMT_STYLES } from '../graph/cytoscapeStyles'
import './TopoSmtReportViewer.css'

export interface TopoSmtReportViewerProps {
  workspace: EquivalenceWorkspace | null
  workspaceKey?: string | null
  selectedId: FunctionId | null
  onSelect: (id: FunctionId) => void
  onGraphReady?: (api: { resize: () => void; fit: () => void }) => void
}

function syncGraph(cy: cytoscape.Core, graphJson: string): void {
  const { nodes, edges } = parseElements(graphJson, { enrichTopoSmtLabels: true })
  const nodeList = (nodes || []) as cytoscape.ElementDefinition[]
  const nodeIdSet = new Set(
    nodeList
      .map((n) => {
        const data = (n as { data?: { id?: string } }).data
        return typeof data?.id === 'string' ? data.id : null
      })
      .filter((id): id is string => id != null),
  )
  const edgeList = ((edges || []) as cytoscape.ElementDefinition[]).filter((e) => {
    const data = (e as { data?: { source?: string; target?: string } }).data
    return (
      typeof data?.source === 'string' &&
      typeof data?.target === 'string' &&
      nodeIdSet.has(data.source) &&
      nodeIdSet.has(data.target)
    )
  })

  cy.batch(() => {
    cy.elements().remove()
    const all = nodeList.concat(edgeList)
    if (all.length > 0) {
      cy.add(all)
    }
  })

  if (cy.nodes().length === 0) return

  runTopoSmtCompositeLayout(cy)
  cy.resize()
  cy.fit(undefined, FIT_PADDING)
}

export const TopoSmtReportViewer: React.FC<TopoSmtReportViewerProps> = ({
  workspace,
  workspaceKey,
  selectedId,
  onSelect,
  onGraphReady,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const cyRef = useRef<cytoscape.Core | null>(null)
  const onSelectRef = useRef(onSelect)
  const onGraphReadyRef = useRef(onGraphReady)
  const [cyReady, setCyReady] = useState(false)

  onSelectRef.current = onSelect
  onGraphReadyRef.current = onGraphReady

  const graphJson = workspace?.graph_json ?? ''
  const hasGraph = Boolean(graphJson) && (workspace?.srcSideIds.length ?? 0) > 0

  const fitGraph = useCallback(() => {
    const cy = cyRef.current
    if (!cy || cy.nodes().length === 0) return
    cy.resize()
    cy.fit(undefined, FIT_PADDING)
  }, [])

  const resizeGraph = useCallback(() => {
    cyRef.current?.resize()
  }, [])

  useEffect(() => {
    onGraphReadyRef.current?.({ resize: resizeGraph, fit: fitGraph })
  }, [resizeGraph, fitGraph, cyReady])

  useEffect(() => {
    const container = containerRef.current
    if (!container || cyRef.current) return

    const cy = cytoscape({
      container,
      elements: { nodes: [], edges: [] },
      style: TOPO_SMT_STYLES as cytoscape.StylesheetJson,
      maxZoom: TOPO_SMT_MAX_ZOOM,
      autoungrabify: true,
    })

    cy.on('tap', 'node', (evt) => {
      const pairId = evt.target.data('pair_id')
      if (typeof pairId === 'number') {
        evt.target.select()
        onSelectRef.current(pairId)
      }
    })

    cyRef.current = cy
    setCyReady(true)

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => fitGraph())
    })
    observer.observe(container)

    return () => {
      observer.disconnect()
      cy.destroy()
      cyRef.current = null
      setCyReady(false)
    }
  }, [fitGraph])

  useEffect(() => {
    if (!cyReady || !cyRef.current) return

    syncGraph(cyRef.current, hasGraph ? graphJson : '')

    requestAnimationFrame(() => {
      requestAnimationFrame(() => fitGraph())
    })
  }, [cyReady, hasGraph, graphJson, workspaceKey, fitGraph])

  useEffect(() => {
    if (!cyRef.current) return
    cyRef.current.nodes().unselect()
    if (selectedId == null) return
    const node = cyRef.current.nodes().filter((n) => n.data('pair_id') === selectedId)
    if (node.length > 0) {
      node.select()
    }
  }, [selectedId, graphJson])

  useEffect(() => {
    if (!cyRef.current) return
    const id = requestAnimationFrame(() => fitGraph())
    return () => cancelAnimationFrame(id)
  }, [selectedId, fitGraph])

  return (
    <div className="topo-smt-graph-host">
      {!hasGraph ? (
        <div className="topo-smt-empty topo-smt-empty-overlay">No TopoSmt report available.</div>
      ) : null}
      <div className="topo-smt-graph" ref={containerRef} />
    </div>
  )
}
