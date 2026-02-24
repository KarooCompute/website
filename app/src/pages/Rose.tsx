import { Link } from 'react-router-dom'

function Rose() {
  return (
    <section className="band">
      <div className="container content-section">
        <h1 className="rose-color-light">Rose: Rosetta Of Software Engineering</h1>
        <p>
          Rose is an LSP-based semantic translation tool developed by Karoo Compute Solutions to support the rapid translation of software from one language to another.
        </p>
        <p>
          Through the use of semantic modelling, Rose can check the equivalence of two codebases, providing useful diagnostic information for any discrepancies.
        </p>

        <p>
          <Link to="/">← Back to Home</Link>
        </p>
      </div>
    </section>
  )
}

export default Rose
