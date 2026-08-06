import type { RoseReport } from '../types/roseReport'

export interface ReportErrorSection {
  id: string
  title: string
  errors: string[]
}

export function buildReportErrorSections(report: RoseReport | null | undefined): ReportErrorSection[] {
  if (!report) return []

  const sections: ReportErrorSection[] = []
  const eq = report.eq_report

  const globalErrors = [...(report.global_errors ?? [])]
  for (const entry of eq.unmatched_tgt) {
    const name = entry.function.name
    for (const err of entry.errors ?? []) {
      globalErrors.push(`target \`${name}\`: ${err}`)
    }
  }

  if (globalErrors.length > 0) {
    sections.push({
      id: 'global',
      title: 'Global',
      errors: globalErrors,
    })
  }

  const functionSections: ReportErrorSection[] = []

  for (const entry of eq.matches) {
    const errors = entry.errors ?? []
    if (errors.length === 0) continue
    const title = entry.src.name
    functionSections.push({
      id: `fn:${title}`,
      title,
      errors,
    })
  }

  for (const entry of eq.unmatched_src) {
    const errors = entry.errors ?? []
    if (errors.length === 0) continue
    const title = entry.function.name
    functionSections.push({
      id: `fn:${title}`,
      title,
      errors,
    })
  }

  functionSections.sort((a, b) => a.title.localeCompare(b.title))
  sections.push(...functionSections)

  return sections
}
