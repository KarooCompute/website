export type ApiErrorLocation = {
  file?: string
  line?: number
  column?: number
  end_line?: number
  end_column?: number
}

export type ApiError =
  | string
  | {
      message?: string
      location?: ApiErrorLocation | null
      // allow unknown extra fields without TS noise
      [key: string]: unknown
    }

export function formatError(err: ApiError): string {
  if (typeof err === 'string') return err
  if (!err || typeof err !== 'object') return String(err)

  const message = typeof err.message === 'string' ? err.message : JSON.stringify(err)
  const loc = err.location
  if (loc && typeof loc === 'object') {
    const file = loc.file ? String(loc.file) : undefined
    const line = typeof loc.line === 'number' ? loc.line : undefined
    const col = typeof loc.column === 'number' ? loc.column : undefined
    const left = [file, line, col]
      .filter((v, i) => (i === 0 ? Boolean(v) : v !== undefined))
      .join(':')
    if (left) return `${left} ${message}`.trim()
  }
  return message
}

export function formatErrorList(list: unknown): string[] {
  if (!Array.isArray(list)) return []
  return (list as ApiError[]).map(formatError)
}

export type SimpleErrorLoc = {
  line?: number
  column?: number
  message: string
}

export function extractRustErrors(list: unknown, targetFile: string): SimpleErrorLoc[] {
  if (!Array.isArray(list)) return []
  const out: SimpleErrorLoc[] = []
  for (const e of list as ApiError[]) {
    if (typeof e === 'string') continue
    if (!e || typeof e !== 'object') continue
    const msg = typeof e.message === 'string' ? e.message : JSON.stringify(e)
    const loc = e.location
    if (loc && typeof loc === 'object') {
      const file = loc.file ? String(loc.file) : ''
      if (file === targetFile) {
        out.push({
          line: typeof loc.line === 'number' ? loc.line : undefined,
          column: typeof loc.column === 'number' ? loc.column : undefined,
          message: msg
        })
      }
    }
  }
  return out
}


