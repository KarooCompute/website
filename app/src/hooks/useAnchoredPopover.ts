import { useLayoutEffect, useState, type RefObject } from 'react'

export interface AnchoredPopoverPosition {
  top: number
  left: number
}

export function useAnchoredPopover(
  anchorRef: RefObject<HTMLElement | null>,
  open: boolean,
): AnchoredPopoverPosition {
  const [position, setPosition] = useState<AnchoredPopoverPosition>({ top: 0, left: 0 })

  useLayoutEffect(() => {
    if (!open) return

    const update = () => {
      const el = anchorRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 6,
        left: Math.max(8, rect.right - 320),
      })
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [anchorRef, open])

  return position
}
