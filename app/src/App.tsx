import { Routes, Route, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Rose from './pages/Rose'
import RoseDemo from './pages/RoseDemo'
import './App.css'

function SiteLayout() {
  return (
    <div className="app-layout">
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
        <Route path="/about" element={<About />} />
      </Route>
    </Routes>
  )
}

export default App
