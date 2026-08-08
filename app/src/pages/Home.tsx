import { Link } from 'react-router-dom'

function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="band hero-section">
        <div className="container hero-content">
          <h1 className="hero-title">Semantic&nbsp;Extraction and Translation</h1>
          <p className="hero-text">
            Karoo Compute Solutions is developing <Link to="/rose">Rose</Link>, a Semantic Extraction tool aimed at enabling the rapid, reliable translation of software from one language to another.
          </p>
          <Link to="/about" className="hero-link">About Us →</Link>
        </div>
      </section>
    </>
  )
}

export default Home
