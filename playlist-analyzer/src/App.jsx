// src/App.jsx (UPDATE EXISTING)
// ============================================
// Update App.jsx to use the new auth system

import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './components/Home'
import Callback from './components/Callback'
import Dashboard from './components/Dashboard'
import { getValidAccessToken, logout as authLogout } from './utils/spotifyAuth'

function App() {
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const validToken = await getValidAccessToken()
        if (validToken) {
          setToken(validToken)
        }
      } catch (error) {
        console.error('Auth initialization failed:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const handleLogout = () => {
    authLogout()
    setToken(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Routes>
        <Route 
          path="/" 
          element={token ? <Dashboard token={token} onLogout={handleLogout} /> : <Home />} 
        />
        <Route path="/callback" element={<Callback />} />
      </Routes>
    </div>
  )
}

export default App
