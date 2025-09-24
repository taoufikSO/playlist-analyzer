const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const SCOPES = [
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-read-private',
  'user-read-email'
].join(' ');

// Random string for PKCE
const generateRandomString = (len) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, b => chars[b % chars.length]).join('');
};

// SHA256 → base64url
const sha256 = async (plain) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(plain));
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
};

// Start the auth flow
export const startAuthFlow = async () => {
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await sha256(codeVerifier);
  const state = generateRandomString(16);

  // store in sessionStorage (tab-scoped)
  sessionStorage.setItem('spotify_pkce_verifier', codeVerifier);
  sessionStorage.setItem('spotify_oauth_state', state);

  const auth = new URL('https://accounts.spotify.com/authorize');
  auth.searchParams.set('response_type', 'code');
  auth.searchParams.set('client_id', CLIENT_ID);
  auth.searchParams.set('scope', SCOPES);
  auth.searchParams.set('code_challenge_method', 'S256');
  auth.searchParams.set('code_challenge', codeChallenge);
  auth.searchParams.set('redirect_uri', REDIRECT_URI);
  auth.searchParams.set('state', state);

  // helpful debug
  console.log('[AUTH URL]', auth.toString());
  window.location.href = auth.toString();
};

// Exchange authorization code for tokens (via backend)
export const exchangeCodeForToken = async (code, state) => {
  const storedState = sessionStorage.getItem('spotify_oauth_state');
  const codeVerifier = sessionStorage.getItem('spotify_pkce_verifier');

  if (!storedState || state !== storedState) throw new Error('State parameter mismatch');
  if (!codeVerifier) throw new Error('Code verifier not found');

  const res = await fetch('/api/spotify/token', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({
      clientId: CLIENT_ID,
      code,
      redirectUri: REDIRECT_URI,
      codeVerifier,
    }),
  });

  const data = await res.json();
   console.log('[EXCHANGE RESULT]', res.status, data);  
  if (!res.ok || !data.access_token) {
    throw new Error(`Token exchange failed: ${data.error_description || data.error || 'unknown error'}`);
  }

  // clean temp values
  sessionStorage.removeItem('spotify_pkce_verifier');
  sessionStorage.removeItem('spotify_oauth_state');

  // persist tokens
  localStorage.setItem('spotify_access_token', data.access_token);
  if (data.refresh_token) localStorage.setItem('spotify_refresh_token', data.refresh_token);
  const expiry = Date.now() + (data.expires_in || 3600) * 1000;
  localStorage.setItem('spotify_token_expiry', String(expiry));

  return data.access_token;
};

export const isTokenExpired = () => {
  const t = localStorage.getItem('spotify_token_expiry');
  return !t || Date.now() > Number(t);
};

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('spotify_refresh_token');
  if (!refreshToken) throw new Error('No refresh token available');

  // refresh still goes to Spotify, but you could proxy it too if you want
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type':'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error || 'refresh failed');

  localStorage.setItem('spotify_access_token', data.access_token);
  if (data.refresh_token) localStorage.setItem('spotify_refresh_token', data.refresh_token);
  const expiry = Date.now() + (data.expires_in || 3600) * 1000;
  localStorage.setItem('spotify_token_expiry', String(expiry));
  return data.access_token;
};

export const getValidAccessToken = async () => {
  let token = localStorage.getItem('spotify_access_token');
  if (!token) return null;
  if (isTokenExpired()) {
    try { token = await refreshAccessToken(); }
    catch {
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_refresh_token');
      localStorage.removeItem('spotify_token_expiry');
      return null;
    }
  }
  return token;
};

export const getAuthParamsFromUrl = () => {
  const p = new URLSearchParams(window.location.search);
  return { code: p.get('code'), state: p.get('state'), error: p.get('error') };
};

export const cleanupUrl = () => {
  window.history.replaceState({}, document.title, window.location.pathname);
};

export const logout = () => {
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_refresh_token');
  localStorage.removeItem('spotify_token_expiry');
  sessionStorage.removeItem('spotify_pkce_verifier');
  sessionStorage.removeItem('spotify_oauth_state');
};
