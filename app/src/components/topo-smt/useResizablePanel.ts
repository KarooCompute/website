import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseResizablePanelOptions {
  minWidth?: number
  maxWidthRatio?: number
  onResize?: () => void
}

export function useResizablePanel(
  viewerRef: React.RefObject<HTMLDivElement | null>,
  options: UseResizablePanelOptions = {},
) {
  const { minWidth = 240, maxWidthRatio = 0.75, onResize } = options
  const draggingRef = useRef(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [panelWidth, setPanelWidth] = useState<number | null>(null)

  useEffect(() => {
    const clampPanelWidth = (width: number) => {
      const viewerWidth = viewerRef.current?.clientWidth ?? window.innerWidth
      const maxWidth = Math.round(viewerWidth * maxWidthRatio)
      return Math.max(minWidth, Math.min(maxWidth, width))
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current || !viewerRef.current) return
      const rect = viewerRef.current.getBoundingClientRect()
      setPanelWidth(clampPanelWidth(rect.right - e.clientX))
    }

    const onMouseUp = () => {
      if (!draggingRef.current) return
      draggingRef.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      onResize?.()
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [minWidth, maxWidthRatio, onResize, viewerRef])

  const startPanelResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    draggingRef.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const openPanel = useCallback(() => {
    setPanelOpen(true)
    setPanelWidth((w) => {
      if (w != null) return w
      const viewerWidth = viewerRef.current?.clientWidth ?? window.innerWidth
      return Math.round(viewerWidth / 3)
    })
  }, [viewerRef])

  const closePanel = useCallback(() => {
    setPanelOpen(false)
  }, [])

  const resetPanel = useCallback(() => {
    setPanelOpen(false)
  }, [])

  return {
    panelOpen,
    panelWidth,
    setPanelOpen,
    setPanelWidth,
    startPanelResize,
    openPanel,
    closePanel,
    resetPanel,
  }
}
