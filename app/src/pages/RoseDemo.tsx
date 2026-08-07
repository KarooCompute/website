import { Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa6'
import { EquivalenceView } from '../views/EquivalenceView'
import '../components/layout/AppShell.css'
import './RoseDemo.css'

export default function RoseDemo() {
  return (
    <div className="rose-demo">
      <div className="editor-container">
        <div className="main-column">
          <EquivalenceView
            headerLeading={
              <Link to="/rose" className="rose-demo-back" aria-label="Back to Rose">
                <FaArrowLeft aria-hidden />
              </Link>
            }
          />
        </div>
      </div>
    </div>
  )
}
