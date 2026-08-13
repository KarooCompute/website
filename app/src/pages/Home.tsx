import { Link } from 'react-router-dom'
import { FaGithub } from 'react-icons/fa6'

function Home() {
  return (
    <>
      <section className="band hero-section">
        <div className="container hero-content">
          <h1 className="hero-title">Kaleb Bruwer</h1>
          <p className="hero-subtitle">Software Engineer</p>
          <p className="hero-actions">
            <a
              href={`${import.meta.env.BASE_URL}CV_2026.pdf`}
              className="btn"
              download
            >
              Download CV
            </a>
          </p>
        </div>
      </section>

      <section className="band">
        <div className="container content-section">
          <div className="info-box">
            <div className="info-box-header">
              <h2>About me</h2>
            </div>
            <p>
              I specialize in compiler technology, program analysis, and formal methods.
              I have experience designing semantic analysis pipelines, intermediate representations, and applying automated theorem proving to software verification.
              I have also worked in enterprise software development, workflow systems, and backend services.
            </p>
            <p>
              My most recent work has been on Rose, about which you can read more under projects.
            </p>
            <p>
              BSc Hons in Computer Science (2022)
            </p>
            <p>
              Email: <a href="mailto:kaleb.bruwer@gmail.com">kaleb.bruwer@gmail.com</a>
            </p>
            <p>
              <a
                href="https://github.com/Kaleb-Bruwer"
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaGithub aria-hidden />
                GitHub
              </a>
            </p>
          </div>

          <div className="info-box">
            <div className="info-box-header">
              <h2>Projects</h2>
            </div>
            <ul className="project-list">
              <li className="project-item">
                <div className="project-item-main">
                  <div className="project-item-top">
                    <Link to="/rose" className="project-title">
                      Rose: Rosetta Of Software Engineering
                    </Link>
                  </div>
                  <p className="project-desc">
                    Semantic extraction and equivalence checking for C and Rust programs.
                  </p>
                </div>
                <Link to="/rose" className="btn project-action">
                  Live Demo
                </Link>
              </li>
              <li className="project-item">
                <div className="project-item-top">
                  <Link to="/rprop" className="project-title">rprop</Link>
                  <span className="project-meta"><Link to="https://crates.io/crates/rprop" target="_blank" rel="noopener noreferrer">crates.io</Link></span>
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
