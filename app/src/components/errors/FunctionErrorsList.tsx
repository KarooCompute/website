import '../errors/ReportErrorsView.css'
import './FunctionErrorsList.css'

export interface FunctionErrorsListProps {
  errors: string[]
}

export function FunctionErrorsList({ errors }: FunctionErrorsListProps) {
  if (errors.length === 0) {
    return <div className="function-errors-empty">No errors for this function.</div>
  }

  return (
    <div className="function-errors-list-view">
      <ul className="report-errors-list">
        {errors.map((error, index) => (
          <li key={index} className="report-errors-item">
            {error}
          </li>
        ))}
      </ul>
    </div>
  )
}
