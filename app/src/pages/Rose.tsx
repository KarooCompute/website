import { Link } from 'react-router-dom'

function Rose() {
  return (
    <section className="band">
      <div className="container content-section">
        <h1 className="rose-color-light">Rose: Rosetta Of Software Engineering</h1>
        <div className="info-box">
          <div className="info-box-header">
            <h2>Try It</h2>
            <Link to="/rose/demo" className="btn">
              Launch demo
            </Link>
          </div>
          <p>
            A limited public demo is available, demonstrating the equivalence checking functionality.
          </p>
          <img
            className="rose-screenshot"
            src={`${import.meta.env.BASE_URL}Translation Screenshot.png`}
            alt="Rose equivalence demo showing C and Rust side by side"
          />
        </div>

        <div className="info-box">
          <div className="info-box-header">
            <h2>About</h2>
          </div>
          <p>
            Rose is a Semantic Extraction tool being developed by Karoo Compute Solutions to support the rapid translation of software from one language to another.
          </p>
          <p>
            Equivalence can be checked between two codebases, providing useful diagnostic information for any discrepancies on a per-function basis.
            This is intended to be used in conjunction with an LLM to automate the translation process.
          </p>
          <img
            className="rose-screenshot"
            src={`${import.meta.env.BASE_URL}TopoSmt Screenshot.png`}
            alt="Rose equivalence demo showing C and Rust side by side"
          />
        </div>

        <div className="info-box">
          <div className="info-box-header">
            <h2>How It Works</h2>
          </div>
          <p>
            <ol>
              <li>Semantic Analysis is performed, where the input code is lowered through a series of Intermediate Representations (IRs), until it reaches an SMT-LIB form.</li>
              <li>The source and target codebases are matched up topologically, based on the call graphs (including function signatures).</li>
              <li>For each matched-up pair of functions, an SMT-LIB statement is generated to determine equivalence.</li>
              <li>Z3 is used to solve the SMT-LIB statements</li>
            </ol>
          </p>

          <img
            className="rose-screenshot"
            src={`${import.meta.env.BASE_URL}SMT Screenshot.png`}
            alt="Rose equivalence demo showing C and Rust side by side"
          />
          <p>
            *Note: The debug panel in the above screenshot can be accessed in the web demo by clicking on any function in the TopoSMT or List views.
          </p>
        </div>

        <div className="info-box">
          <div className="info-box-header">
            <h2>Beyond the Demo</h2>
          </div>
          <p>
            The full version has the following additional features, that are not accessible in the web demo:
            <ul>
              <li>Command Line Interface</li>
              <li>VS Code Plugin: Same reporting interface as the web demo, for a local project</li>
              <li>Persisted equivalence reports</li>
              <li>Agent-friendly helpers</li>
              <li>Configurable dependency resolution</li>
            </ul>
          </p>
        </div>
      </div>
    </section>
  )
}

export default Rose
