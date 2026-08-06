import './ReportFileSelect.css'

export interface ReportFileSelectProps {
  files: { label: string; path: string }[]
  value: string | null
  onChange: (path: string) => void
  disabled?: boolean
  error?: string | null
  placeholder?: string
}

export function ReportFileSelect({
  files,
  value,
  onChange,
  disabled,
  error,
  placeholder = 'Select report…',
}: ReportFileSelectProps) {
  return (
    <div className="report-file-select-wrap">
      <select
        className={`report-file-select${error ? ' report-file-select-error' : ''}`}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        title={error ?? undefined}
      >
        <option value="">{placeholder}</option>
        {files.map((file) => (
          <option key={file.path} value={file.path}>
            {file.label}
          </option>
        ))}
      </select>
      {error ? <span className="report-file-select-error-text">{error}</span> : null}
    </div>
  )
}
