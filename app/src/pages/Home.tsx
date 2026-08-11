import { Link } from 'react-router-dom'

function Home() {
  return (
    <>
      <section className="band">
        <div className="container content-section">
          <div className="bio-card info-box">
            <div className="bio-avatar">
              <img src={`${import.meta.env.BASE_URL}Kaleb_square.jpg`} alt="Profile avatar" />
            </div>
            <div className="bio-header">
              <h2 className="bio-name">Kaleb Bruwer</h2>
              <p className="bio-role">Software Engineer</p>
            </div>
            <p className="bio-text">
              I specialize in compiler technology, program analysis, and formal methods.
              I have experience designing semantic analysis pipelines, intermediate representations, and applying automated theorem proving to software verification.
              I have also worked in enterprise software development, workflow systems, and backend services.
            </p>

            <p className="bio-meta">
              BSc Hons in Computer Science (2022)
            </p>
          </div>

          <div className="info-box">
            <div className="info-box-header">
              <h2>Projects</h2>
            </div>
            <ul className="project-list">
              <li className="project-item">
                <div className="project-item-top">
                  <Link to="/rose" className="project-title">
                    Rose: Rosetta Of Software Engineering
                  </Link>
                </div>
                <p className="project-desc">
                  Semantic extraction and equivalence checking for C and Rust programs.
                </p>
              </li>
              <li className="project-item">
                <div className="project-item-top">
                  <a
                    href="https://crates.io/crates/rprop"
                    className="project-title"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    rprop
                  </a>
                  <span className="project-meta">crates.io</span>
                </div>
                <p className="project-desc">
                  Propositional logic in Rust: claims and proofs checked by type system at compile time.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
