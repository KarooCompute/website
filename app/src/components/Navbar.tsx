import { Link, NavLink } from 'react-router-dom'

function Navbar() {
  return (
    <header className="site-header">
      <div className="container nav">
        <Link to="/" className="brand">
          Kaleb Bruwer
        </Link>
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Home</NavLink>
          <NavLink to="/rose" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Rose</NavLink>
        </div>
      </div>
    </header>
  )
}

export default Navbar
