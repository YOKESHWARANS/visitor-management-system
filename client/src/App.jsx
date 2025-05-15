import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Welcome from './pages/Welcome'
import VisitorSignup from './pages/VisitorSignup'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import VisitorExit from './pages/VisitorExit'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate() 

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setIsAuthenticated(false)
    navigate('/') 
  }

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/visitor-signup" element={<VisitorSignup />} />
        <Route path="/visitor-exit" element={<VisitorExit />} />
        <Route 
          path="/admin-login" 
          element={!isAuthenticated ? <AdminLogin setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/admin-dashboard" />} 
        />
        <Route 
          path="/admin-dashboard" 
          element={isAuthenticated ? <AdminDashboard handleLogout={handleLogout} /> : <Navigate to="/admin-login" />} 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

export default App
