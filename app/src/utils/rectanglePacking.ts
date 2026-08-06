export interface ClusterRect {
  id: string
  widthUnits: number
  heightUnits: number
}

export interface PlacedCluster {
  id: string
  colOffset: number
  rowOffset: number
}

export interface PackedLayout {
  placements: PlacedCluster[]
  totalRowUnits: number
}

export function shelfPackClusters(
  clusters: ClusterRect[],
  maxWidth: number,
): PackedLayout {
  if (clusters.length === 0) {
    return { placements: [], totalRowUnits: 0 }
  }

  const sorted = [...clusters].sort((a, b) => b.heightUnits - a.heightUnits)
  const placements: PlacedCluster[] = []

  let currentRowWidth = 0
  let currentRowHeight = 0
  let rowOffset = 0
  let colOffset = 0
  let totalRowUnits = 0

  const finalizeRow = () => {
    if (currentRowHeight === 0) return
    rowOffset += currentRowHeight
    totalRowUnits = rowOffset
    currentRowWidth = 0
    currentRowHeight = 0
    colOffset = 0
  }

  for (const cluster of sorted) {
    const tooWideForRow =
      cluster.widthUnits > maxWidth ||
      (currentRowWidth > 0 && currentRowWidth + cluster.widthUnits > maxWidth)

    if (tooWideForRow) {
      finalizeRow()
    }

    placements.push({
      id: cluster.id,
      colOffset,
      rowOffset,
    })

    colOffset += cluster.widthUnits
    currentRowWidth += cluster.widthUnits
    currentRowHeight = Math.max(currentRowHeight, cluster.heightUnits)
  }

  finalizeRow()

  return { placements, totalRowUnits }
}
