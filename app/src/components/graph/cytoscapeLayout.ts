export const TOPO_SMT_MAX_ZOOM = 1.5

export const TOPO_SMT_DAGRE_LAYOUT = {
  name: 'dagre',
  rankDir: 'TB',
  nodeSep: 50,
  rankSep: 70,
  edgeSep: 20,
  animate: false,
} as const

/** Max packing width in grid units (widest-rank node count). */
export const TOPO_SMT_MAX_PACK_WIDTH = 12

/** Horizontal pitch of one grid column (node width + dagre nodeSep). */
export const TOPO_SMT_COLUMN_PITCH = 160 + TOPO_SMT_DAGRE_LAYOUT.nodeSep

/** Vertical pitch of one grid rank (node height + dagre rankSep). */
export const TOPO_SMT_ROW_PITCH = 64 + TOPO_SMT_DAGRE_LAYOUT.rankSep

/** Padding between dependency region and isolate grid only. */
export const TOPO_SMT_REGION_PADDING = 80

/** @deprecated Use runTopoSmtCompositeLayout for report graphs. */
export const TOPO_SMT_LAYOUT = TOPO_SMT_DAGRE_LAYOUT

export const FIT_PADDING = 80
