import express from "express";

const app = express();


app.use(express.json());






app.post("/api/spotify/token", async (req, res) => {
  try {
    const { code, redirectUri, codeVerifier, clientId } = req.body;
  console.log('[SERVER] /token body', req.body); // debug
    const r = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    const data = await r.json();
    if (!r.ok) return res.status(400).json(data);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.listen(8001, () => console.log("Auth server ⇒ http://127.0.0.1:8001"));
