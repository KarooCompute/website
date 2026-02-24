import { Link, NavLink } from 'react-router-dom'

function Navbar() {
  return (
    <header className="site-header">
      <div className="container nav">
        <Link to="/" className="brand">
          <img src={`${import.meta.env.BASE_URL}Karoo Dark Short.svg`} alt="Karoo logo" />
        </Link>
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Home</NavLink>
          <NavLink to="/rose" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Rose</NavLink>
          <NavLink to="/about" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>About</NavLink>
        </div>
      </div>
    </header>
  )
}

export default Navbar
