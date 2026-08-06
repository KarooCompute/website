import { EquivalenceView } from '../views/EquivalenceView'
import '../components/layout/AppShell.css'
import './RoseDemo.css'

export default function RoseDemo() {
  return (
    <div className="rose-demo">
      <div className="editor-container">
        <div className="main-column">
          <EquivalenceView />
        </div>
      </div>
    </div>
  )
}
