import type { SourceLocation } from '../types/roseReport'

/** True when the location can be opened as a local file in the editor. */
export function isNavigableLocation(
  loc: SourceLocation | null | undefined,
): loc is SourceLocation {
  if (!loc || typeof loc.file !== 'string' || !loc.file) return false
  const file = loc.file
  if (file.startsWith('file:')) return true
  if (file.startsWith('/') || /^[A-Za-z]:[\\/]/.test(file)) return true
  return false
}
