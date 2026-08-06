import type { RoseReportSummary } from '../../types/roseReport'
import './ReportSummaryLine.css'

export interface ReportSummaryLineProps {
  summary: RoseReportSummary | undefined
}

function countClass(value: number, colorClass: string): string {
  return value !== 0 ? `report-summary-count ${colorClass}` : 'report-summary-count'
}

export function ReportSummaryLine({ summary }: ReportSummaryLineProps) {
  if (!summary) return null

  const equal = summary.equal ?? 0
  const unmatched = summary.unmatched ?? 0
  const errors = summary.errors ?? 0
  const total = summary.total ?? 0
  const globalErrors = summary.global_errors ?? 0

  return (
    <div className="report-summary-line" aria-label="Report summary">
      <span className={countClass(equal, 'report-summary-equal')}>{equal}</span>
      <span className="report-summary-label"> equal + </span>
      <span className={countClass(unmatched, 'report-summary-unmatched')}>{unmatched}</span>
      <span className="report-summary-label"> unmatched + </span>
      <span className={countClass(errors, 'report-summary-errors')}>{errors}</span>
      <span className="report-summary-label"> error(s) / </span>
      <span className={countClass(total, 'report-summary-total')}>{total}</span>
      <span className="report-summary-label"> total; </span>
      <span className={countClass(globalErrors, 'report-summary-errors')}>{globalErrors}</span>
      <span className="report-summary-label"> global error(s)</span>
    </div>
  )
}
