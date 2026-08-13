import { Routes, Route, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Rose from './pages/Rose'
import Rprop from './pages/Rprop'
import RoseDemo from './pages/RoseDemo'
import './App.css'

function SiteLayout() {
  return (
    <div className="app-layout">
      <div className="site-ambient" aria-hidden>
        <div className="site-ambient-grain" />
      </div>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/rose/demo" element={<RoseDemo />} />
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/rose" element={<Rose />} />
        <Route path="/rprop" element={<Rprop />} />
      </Route>
    </Routes>
  )
}

export default App
