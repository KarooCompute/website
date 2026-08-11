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
            Rose is an LSP-based Semantic Extraction tool being developed by Karoo Compute Solutions to support the rapid translation of software from one language to another.
          </p>
          <p>
            Through the use of Semantic Extraction, Rose can check the equivalence of two codebases, providing useful diagnostic information for any discrepancies.
            This is to be used in conjunction with an LLM to automate the translation process.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Rose
