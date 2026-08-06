import type { ParsedDebugFile } from '../types/debugFile'
import type { RoseReport } from '../types/roseReport'
import { normalizeDebugDocument, parseDebugYaml } from './parseDebugYaml'
import { normalizeReportDocument, parseReportYaml } from './parseReportYaml'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Coerce API `report` (YAML string or JSON object) into a RoseReport. */
export function coerceReport(value: unknown): RoseReport | null {
  if (value == null) return null
  try {
    if (typeof value === 'string') {
      return parseReportYaml(value).report
    }
    if (isRecord(value)) {
      return normalizeReportDocument(value).report
    }
  } catch {
    return null
  }
  return null
}

/** Coerce API `debug` (YAML string or JSON object) into a ParsedDebugFile. */
export function coerceDebug(value: unknown): ParsedDebugFile | null {
  if (value == null) return null
  try {
    if (typeof value === 'string') {
      return parseDebugYaml(value)
    }
    if (isRecord(value)) {
      return normalizeDebugDocument(value)
    }
  } catch {
    return null
  }
  return null
}
