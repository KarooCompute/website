import type { RoseReport } from '../../types/roseReport'
import { buildReportErrorSections } from '../../utils/reportErrors'
import './ReportErrorsView.css'

export interface ReportErrorsViewProps {
  report: RoseReport | null | undefined
}

export function ReportErrorsView({ report }: ReportErrorsViewProps) {
  const sections = buildReportErrorSections(report)

  if (!report) {
    return <div className="report-errors-empty">No report loaded.</div>
  }

  if (sections.length === 0) {
    return <div className="report-errors-empty">No errors in this report.</div>
  }

  return (
    <div className="report-errors-view">
      {sections.map((section) => (
        <section key={section.id} className="report-errors-section">
          <h3 className="report-errors-heading">{section.title}</h3>
          <ul className="report-errors-list">
            {section.errors.map((error, index) => (
              <li key={`${section.id}-${index}`} className="report-errors-item">
                {error}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
