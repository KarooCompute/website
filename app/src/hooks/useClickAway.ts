import { useEffect, type RefObject } from 'react'

export function useClickAway(
  refs: RefObject<HTMLElement | null>[],
  onClickAway: () => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (!target) return
      const inside = refs.some((ref) => ref.current?.contains(target))
      if (!inside) onClickAway()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
    // refs hold stable RefObjects; only enabled/onClickAway should rebind listeners
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, onClickAway])
}
