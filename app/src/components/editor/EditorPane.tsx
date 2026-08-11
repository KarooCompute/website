import type AnsiToHtml from 'ansi-to-html'
import type { RoseReport } from '../../types'
import type { SimpleErrorLoc } from '../../utils/errors'
import { ReportErrorsView } from '../errors/ReportErrorsView'
import { CodeEditor, type CodeEditorProps } from './CodeEditor'
import './EditorPane.css'

export type EditorPaneMode = 'editor' | 'errors'

export interface EditorPaneProps {
  mode: EditorPaneMode
  title?: string
  report?: RoseReport | null
  ansiConverter?: AnsiToHtml
  editorValue?: string
  editorLanguage?: CodeEditorProps['language']
  editorReadOnly?: boolean
  onEditorChange?: (value: string) => void
  rustLintErrors?: SimpleErrorLoc[]
}

export const EditorPane: React.FC<EditorPaneProps> = ({
  mode,
  title,
  report,
  editorValue = '',
  editorLanguage = 'json',
  editorReadOnly = true,
  onEditorChange,
  rustLintErrors,
}) => {
  const showErrors = mode === 'errors'
  const showEditor = mode === 'editor'

  return (
    <div className="editor-content">
      {title ? <div className="editor-pane-heading">{title}</div> : null}
      {showErrors ? (
        <ReportErrorsView report={report} />
      ) : showEditor ? (
        <CodeEditor
          value={editorValue}
          language={editorLanguage}
          readOnly={editorReadOnly}
          onChange={onEditorChange}
          rustLintErrors={rustLintErrors}
        />
      ) : null}
    </div>
  )
}
