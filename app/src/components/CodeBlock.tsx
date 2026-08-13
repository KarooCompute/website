import CodeMirror from '@uiw/react-codemirror'
import { EditorView } from '@codemirror/view'
import { rust } from '@codemirror/lang-rust'
import { vscodeDarkInit } from '@uiw/codemirror-theme-vscode'
import './CodeBlock.css'

/** CodeMirror theme aligned with the marketing site tokens (not the demo IDE). */
const siteCodeTheme = vscodeDarkInit({
  settings: {
    background: 'transparent', // or 'var(--bg)' / '#090b0e'
    gutterBackground: 'transparent',
    lineHighlight: 'transparent',
  },
})

export interface CodeBlockProps {
  code: string
  /** Defaults to Rust with syntax highlighting. Use `plain` for Cargo.toml, shell, etc. */
  language?: 'rust' | 'plain'
}

export function CodeBlock({ code, language = 'rust' }: CodeBlockProps) {
  if (language === 'plain') {
    return (
      <pre className="code-block">
        <code>{code}</code>
      </pre>
    )
  }

  return (
    <div className="code-block code-block-rust">
      <CodeMirror
        value={code}
        editable={false}
        readOnly
        basicSetup={{
          lineNumbers: false,
          foldGutter: false,
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
        }}
        extensions={[rust(), EditorView.lineWrapping]}
        theme={siteCodeTheme}
      />
    </div>
  )
}
