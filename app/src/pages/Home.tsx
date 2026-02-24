import { Link } from 'react-router-dom'

function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="band hero-section">
        <div className="container hero-content">
          <h1 className="hero-title">Modernize with Semantic&nbsp;Extraction</h1>
          <p className="hero-text">
            Karoo Compute Solutions is developing <Link to="/rose">Rose</Link>, a Semantic Extraction tool that will enable the rapid, reliable translation of software from one language to another.
          </p>
          <Link to="/about" className="hero-link">About Us →</Link>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="band alt">
        <div className="container content-section">
          <h2>Problem</h2>
          <p>
            Software translation has long beeen regarded as an infeasible or high risk endeavour, due in part to the effort of translation, but also the difficulty of ensuring equivalence between the original and the translated code.
          </p>
          <p>
            While today's Large Language Models (LLMs) can rapidly generate seemingly impressive code, thereby addressing the first concern, they lack the ability to <em>verify</em> that their output truly matches the original.
            The absence of verification limits their usefulness and is what we identified as the key barrier to opening up a mostly untapped market.
          </p>
          
          <h2>Approach</h2>
          <p>
            Our development focuses on <strong>Semantic Extraction</strong>—a way to extract the meaning of code into a universal form, so that comparisons can be performed between languages.
            We can use this to guide LLMs towards producing translations that are equivalent to the original, through a feedback loop that identifies the LLM's mistakes for it to fix.
          </p>

          <h2>Market</h2>
          <p>
            The ability to move software from one language to another has long been an elusive desire shared by many software engineers and project managers around the world.
            While many are motivated in this desire by personal preference, there are far more substantive reasons such as maintenance costs, development velocity, and security to consider.
          </p>
          <p>
            The world currently makes use of a large body of software written in C, a memory-unsafe language facing a dangerous class of vulnerabilities which its memory-safe counterparts are immune to.
            <sup>
              <a href="https://www.chromium.org/Home/chromium-security/memory-safety" target="_blank" rel="noopener noreferrer">
                [1]
              </a>
              <a href="https://www.microsoft.com/en-us/msrc/blog/2019/07/a-proactive-approach-to-more-secure-code" target="_blank" rel="noopener noreferrer">
                [2]
              </a>
            </sup>.
          </p>
          <p>
            COBOL is a legacy language that is still widely used in the financial industry, but the cost to maintain such codebases keeps increasing.
            These cost increases are driven not only by scarcity of developers, but also by the fact that legacy languages generally do not keep up with modernisation trends seen in the wider industry.
            This creates a growing delta in development velocity between legacy and modern languages.
          </p>
          <p>
            Currently, we are focused only on translating from C to Rust, while being mindful that much of our core technology will be easily reusable for different language combinations in the future.
          </p>

          <h2>Vision</h2>
          <p>
            We foresee a paradigm shift within Computer Science and Software Engineering where semantics and implementation will no longer be intertwined in the same representation, but will be treated as two separate concerns.
            For this to be practical, tooling will be required to "extract" the meaning (semantics) of a program out of the code it's implemented in.
            Such lifted semantics can then be used to compare implementations, prove invariants, or provide counter-examples for any discrepancies.
            The current goal with Rose is simply to compare between two codebases to check equivalence, but many opportunities exist for future work.
          </p>
          <p>
            Semantic Extraction, when combined with LLM technologies, shows promise in accelerating development speed and improving maintainability without sacrificing reliability.
          </p>
        </div>
      </section>
    </>
  )
}

export default Home
