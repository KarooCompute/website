import { Link } from 'react-router-dom'
import { CodeBlock } from '../components/CodeBlock'

const RPROP_EXAMPLE = `use rprop::{propose, claim, prove};

propose!(A; B; C);
propose!(D = A && B);

claim!(MyTheorem = A && B -> D);

#[prove(MyTheorem)]
fn my_theorem(a: A, b: B) -> D {
    D{a, b}
}`

function Rprop() {
  return (
    <section className="band">
      <div className="container content-section">
        <div className="info-box">
          <div className="info-box-header">
            <h2>rprop: Propositional Logic in Rust</h2>
            <span className="project-meta">
              <a href="https://crates.io/crates/rprop" target="_blank" rel="noopener noreferrer">
                crates.io
              </a>
            </span>
          </div>

          <p>
            The rprop library allows users to write propositional logic statements in Rust, using a procedural macro system.
            Users can make propositions and claims, where claims must be accompanied by proofs that will be checked at compile time.
          </p>

          <CodeBlock code={RPROP_EXAMPLE} />

          <p>
            The above code declares A,B and C as atomic propositions, and D as a conjunction of A and B.
          </p>

          <p>
            MyTheorem makes the claim that D can be derived from A and B. Claims require proofs, otherwise a compilation error is raised.
            The my_theorem function is annotated with{' '}
            <code className="code-inline">#[prove(MyTheorem)]</code>, to satisfy the claim's proof requirement.
          </p>

          <p>
            Note that claims are always implications, which are internally represented as function signatures.
            Proofs must match the signatures of their corresponding claims.
          </p>

          <p>
            More information is available on the <a href="https://crates.io/crates/rprop" target="_blank" rel="noopener noreferrer">crates.io page</a>.
          </p>
        </div>

        <div className="info-box">
          <div className="info-box-header">
            <h2>Why?</h2>
          </div>
          <p>
            This library is the result of ~1 week of blue-sky research and development, aimed at finding a simple way to formalise architectural requirements.
          </p>
          <p>
            I made use of rprop to draft some changes to the IR pipeline used in <Link to="/rose">Rose</Link>.
            I used atomic propositions to represent individual IR properties, and conjunctions of those properties to represent the IR's themselves.
            Lifting stages were represented as claims. Each stage would take the prior IR, along with the properties it introduced, as input, and returned the new IR as output.
            This representation allowed me to make all the important properties explicit, making it easier to reason about changes to the pipeline.
          </p>
          <p>
            The fundamental problem I tried to solve, was to alleviate the risk of silently dropping a requirement, by having a compiler shout at me instead.
            Propositional logic is a good fit for linear pipelines, such as Rose's semantic extraction, but may be difficult to apply to stateful or cyclic systems.
            Modeling such systems would be easier with the increased expressive power of first-order logic, which goes beyond the scope of this library.
          </p>
        </div>

        <div className="info-box">
          <div className="info-box-header">
            <h2>Installation</h2>
          </div>
          <p>
            rprop is available on crates.io, and can be added to your project by adding the following to your Cargo.toml:
          </p>
          <CodeBlock code={`[dependencies]
rprop = "0.2"`} />
        </div>
      </div>
    </section>
  )
}

export default Rprop
