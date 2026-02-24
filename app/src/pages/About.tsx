function About() {
  return (
    <section className="band">
      <div className="container content-section">
        {/* <h1>About Us</h1>
        <p>
          [Company description]
        </p> */}

        <div className="bio-card">
          <div className="bio-avatar">
            <img src={`${import.meta.env.BASE_URL}Kaleb_square.jpg`} alt="Profile avatar" />
          </div>
          <div className="bio-header">
            <h2 className="bio-name">Kaleb Bruwer</h2>
            <p className="bio-role">Founder</p>
          </div>
          <p className="bio-text">
            I graduated from the University of Pretoria with a BScHons in Computer Science in 2022.
            After that I worked as a software engineer for over two years, before making the decision to start my own company.
            I have a strong interest in program semantics and correctness.
          </p>
          <div className="bio-links">
            <a href="mailto:kaleb@karoocompute.com">kaleb@karoocompute.com</a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
