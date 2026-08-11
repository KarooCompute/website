import { useLocation } from 'react-router-dom'

/** Paths that show the site footer copyright bar. */
const FOOTER_PATHS = new Set(['/rose'])

function Footer() {
  const { pathname } = useLocation()
  if (!FOOTER_PATHS.has(pathname)) return null

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <span>© 2024-{new Date().getFullYear()} Karoo Compute Solutions (Pty) Ltd</span>
        <a href="mailto:info@karoocompute.com">info@karoocompute.com</a>
      </div>
    </footer>
  )
}

export default Footer
