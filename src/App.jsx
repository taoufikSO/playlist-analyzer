import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './components/Home'
import Dashboard from './components/Dashboard'
import { getTokenFromUrl, validateState, storeToken, getValidToken, clearToken, cleanUrl } from './utils/spotifyAuth'

function App() {
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const initAuth = () => {
      // Check if we're on callback URL
      if (window.location.hash.includes('access_token')) {
        handleCallback()
      } else {
        // Check for existing valid token
        const existingToken = getValidToken()
        if (existingToken) {
          setToken(existingToken)
        }
        setLoading(false)
      }
    }

    const handleCallback = () => {
      const tokenData = getTokenFromUrl()
      
      if (tokenData.error) {
        setError(`Authentication failed: ${tokenData.error}`)
        cleanUrl()
        setLoading(false)
        return
      }

      if (tokenData.access_token) {
        // Validate state parameter
        if (!validateState(tokenData.state)) {
          setError('Invalid state parameter')
          cleanUrl()
          setLoading(false)
          return
        }

        // Store token and update state
        storeToken(tokenData)
        setToken(tokenData.access_token)
        
        // Clean URL
        cleanUrl()
      }
      
      setLoading(false)
    }

    initAuth()
  }, [])

  const handleLogout = () => {
    clearToken()
    setToken(null)
    setError(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md text-white">
          <h2 className="text-2xl font-bold mb-4">Authentication Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null)
              window.location.href = '/'
            }}
            className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Routes>
        <Route path="/*" element={
          token ? 
            <Dashboard token={token} onLogout={handleLogout} /> : 
            <Home />
        } />
      </Routes>
    </div>
  )
}

export default App
