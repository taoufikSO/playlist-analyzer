const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI
const SCOPES = [
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-read-private',
  'user-read-email'
].join(' ')

// Simple implicit flow (works perfect for client-side)
export const getLoginUrl = () => {
  const state = generateRandomString(16)
  localStorage.setItem('spotify_auth_state', state)
  
  const params = new URLSearchParams({
    response_type: 'token',
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state: state,
    show_dialog: true
  })

  return `https://accounts.spotify.com/authorize?${params.toString()}`
}

// Generate random string for state parameter
const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let text = ''
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

// Extract token from URL hash (after Spotify redirect)
export const getTokenFromUrl = () => {
  const hash = window.location.hash.substring(1)
  const params = new URLSearchParams(hash)
  
  return {
    access_token: params.get('access_token'),
    token_type: params.get('token_type'),
    expires_in: params.get('expires_in'),
    state: params.get('state'),
    error: params.get('error')
  }
}

// Validate state parameter
export const validateState = (state) => {
  const storedState = localStorage.getItem('spotify_auth_state')
  localStorage.removeItem('spotify_auth_state')
  return state === storedState
}

// Store token with expiry
export const storeToken = (tokenData) => {
  const expiryTime = Date.now() + (parseInt(tokenData.expires_in) * 1000)
  
  localStorage.setItem('spotify_access_token', tokenData.access_token)
  localStorage.setItem('spotify_token_expiry', expiryTime.toString())
}

// Get valid token (check if expired)
export const getValidToken = () => {
  const token = localStorage.getItem('spotify_access_token')
  const expiry = localStorage.getItem('spotify_token_expiry')
  
  if (!token || !expiry) return null
  
  if (Date.now() > parseInt(expiry)) {
    // Token expired
    clearToken()
    return null
  }
  
  return token
}

// Clear all token data
export const clearToken = () => {
  localStorage.removeItem('spotify_access_token')
  localStorage.removeItem('spotify_token_expiry')
  localStorage.removeItem('spotify_auth_state')
}

// Clean URL after handling callback
export const cleanUrl = () => {
  window.history.replaceState(null, '', window.location.pathname)
}