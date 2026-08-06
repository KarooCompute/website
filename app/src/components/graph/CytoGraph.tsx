import { useCallback, useEffect, useRef } from 'react'
import type { CyPos } from '../../types'
import { parseElements } from '../../utils/graph'
import cytoscape from './setup'
import { FIT_PADDING } from './cytoscapeLayout'
import { KIR_GRAPH_STYLES } from './cytoscapeStyles'
import './CytoGraph.css'

function presetLayoutPositions(
  positions: Record<string, CyPos>,
): cytoscape.NodePositionFunction {
  // Cytoscape passes the node object at runtime; typings incorrectly say string.
  return ((node: cytoscape.NodeSingular) =>
    positions[node.id()] || undefined) as unknown as cytoscape.NodePositionFunction
}

// Defined at module scope to avoid remounts on parent re-renders
export interface CytoGraphProps {
  graphJson: string
  active: boolean
  presetPositions?: Record<string, CyPos>
  onPositionsComputed?: (pos: Record<string, CyPos>) => void
}

export const CytoGraph: React.FC<CytoGraphProps> = ({
  graphJson,
  active,
  presetPositions,
  onPositionsComputed,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const cyRef = useRef<cytoscape.Core | null>(null)
  const prevJsonRef = useRef<string>('')
  const onPositionsComputedRef = useRef(onPositionsComputed)
  onPositionsComputedRef.current = onPositionsComputed

  const emitPositions = useCallback(() => {
    if (!cyRef.current || !onPositionsComputedRef.current) return
    const pos: Record<string, CyPos> = {}
    cyRef.current.nodes().forEach((n) => {
      pos[n.id()] = n.position()
    })
    onPositionsComputedRef.current(pos)
  }, [])

  useEffect(() => {
    if (!containerRef.current || cyRef.current) return

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: { nodes: [], edges: [] },
      style: KIR_GRAPH_STYLES as cytoscape.StylesheetJson,
      layout: { name: 'cose', animate: false },
    })

    cyRef.current.on('mouseover', 'edge', (evt) => {
      const e = evt.target
      e.style('label', e.data('label') || e.data('kind'))
    })
    cyRef.current.on('mouseout', 'edge', (evt) => {
      evt.target.style('label', '')
    })

    cyRef.current.on('mouseover', 'node', (evt) => {
      const n = evt.target
      const base = n.data('label') || n.data('kind') || ''
      const file = n.data('src_file')
      const line = n.data('src_line')
      const col = n.data('src_column')
      let tip = base
      if (file && line) {
        tip = base + '\n' + file + ': Ln ' + line + (col ? ', Col ' + col : '')
      }
      n.style('label', tip)
    })
    cyRef.current.on('mouseout', 'node', (evt) => {
      const n = evt.target
      n.style('label', n.data('label') || '')
    })

    if (graphJson && graphJson.trim().length > 0) {
      const { nodes, edges } = parseElements(graphJson)
      cyRef.current.batch(() => {
        cyRef.current!.elements().remove()
        const all = ([] as cytoscape.ElementDefinition[]).concat(
          (nodes || []) as cytoscape.ElementDefinition[],
          (edges || []) as cytoscape.ElementDefinition[],
        )
        if (all.length > 0) {
          cyRef.current!.add(all)
        }
      })
      if (presetPositions && Object.keys(presetPositions).length > 0) {
        cyRef.current
          .layout({
            name: 'preset',
            positions: presetLayoutPositions(presetPositions),
            animate: false,
          })
          .run()
      } else {
        cyRef.current.layout({ name: 'cose', animate: false }).run()
      }
      cyRef.current.resize()
      cyRef.current.fit(undefined, FIT_PADDING)
      prevJsonRef.current = graphJson
      requestAnimationFrame(() => emitPositions())
    }

    return () => {
      cyRef.current?.destroy()
      cyRef.current = null
    }
    // Cytoscape instance is created once; subsequent updates use the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!cyRef.current) return
    const jsonChanged = prevJsonRef.current !== graphJson
    if (!jsonChanged && !presetPositions) return
    prevJsonRef.current = graphJson

    const { nodes, edges } = parseElements(graphJson)
    cyRef.current.batch(() => {
      cyRef.current!.elements().remove()
      const all = ([] as cytoscape.ElementDefinition[]).concat(
        (nodes || []) as cytoscape.ElementDefinition[],
        (edges || []) as cytoscape.ElementDefinition[],
      )
      if (all.length > 0) {
        cyRef.current!.add(all)
      }
    })

    const hasPreset = presetPositions && Object.keys(presetPositions).length > 0
    cyRef.current
      .layout(
        hasPreset
          ? {
              name: 'preset',
              positions: presetLayoutPositions(presetPositions!),
              animate: false,
            }
          : { name: 'cose', animate: false },
      )
      .run()
    cyRef.current.resize()
    cyRef.current.fit(undefined, FIT_PADDING)
    requestAnimationFrame(() => emitPositions())
  }, [graphJson, presetPositions, emitPositions])

  useEffect(() => {
    if (!cyRef.current || !onPositionsComputed) return
    const handler = () => emitPositions()
    cyRef.current.on('layoutstop', handler)
    return () => {
      cyRef.current?.off('layoutstop', handler)
    }
  }, [onPositionsComputed, emitPositions])

  useEffect(() => {
    if (!cyRef.current || !active) return
    const id = requestAnimationFrame(() => {
      cyRef.current!.resize()
      cyRef.current!.fit(undefined, FIT_PADDING)
      emitPositions()
    })
    return () => cancelAnimationFrame(id)
  }, [active, emitPositions])

  return <div ref={containerRef} className="cyto-graph-container" />
}
