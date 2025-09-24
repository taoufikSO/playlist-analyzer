export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { clientId, code, redirectUri, codeVerifier } = req.body

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    })

    const data = await response.json()
    return res.status(response.ok ? 200 : 400).json(data)
  } catch (err) {
    console.error('Token exchange failed:', err)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
