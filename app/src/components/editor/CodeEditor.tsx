import CodeMirror from '@uiw/react-codemirror'
import { linter, lintGutter } from '@codemirror/lint'
import type { Extension } from '@codemirror/state'
import { cpp } from '@codemirror/lang-cpp'
import { rust } from '@codemirror/lang-rust'
import { json } from '@codemirror/lang-json'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import type { EditorLanguage } from '../../types'
import type { SimpleErrorLoc } from '../../utils/errors'
import './CodeEditor.css'

function getLanguageExtension(language: EditorLanguage) {
  switch (language) {
    case 'cpp':
      return cpp()
    case 'rust':
      return rust()
    case 'json':
      return json()
  }
}

export interface CodeEditorProps {
  value: string
  language: EditorLanguage
  readOnly?: boolean
  onChange?: (value: string) => void
  rustLintErrors?: SimpleErrorLoc[]
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  language,
  readOnly = false,
  onChange,
  rustLintErrors,
}) => {
  const extensions: Extension[] = [getLanguageExtension(language)]

  if (language === 'rust' && rustLintErrors !== undefined) {
    extensions.push(
      lintGutter(),
      linter((editorView) => {
        const doc = editorView.state.doc
        return (rustLintErrors || []).map((e) => {
          const ln = Math.max(1, e.line ?? 1)
          const info = doc.line(ln)
          const start = e.column && e.column > 0 ? info.from + (e.column - 1) : info.from
          const end = info.to
          return {
            from: Math.min(Math.max(start, info.from), info.to),
            to: end,
            message: e.message,
            severity: 'error' as const,
          }
        })
      }),
    )
  }

  return (
    <CodeMirror
      value={value}
      extensions={extensions}
      theme={vscodeDark}
      readOnly={readOnly}
      onChange={onChange}
    />
  )
}
