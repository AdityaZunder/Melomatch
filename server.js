require("dotenv").config();
const express = require("express");
const admin = require("firebase-admin");
const querystring = require("querystring");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 5000;


// Middleware to parse JSON
app.use(express.json());

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

// Firebase initialization
const serviceAccount = require("./src/config/firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Import routes
const userRoutes = require("./src/routes/user");
app.use("/api/user", userRoutes);

// Add the refresh token function here
async function refreshAccessToken(refreshToken) {
  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    querystring.stringify({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return response.data;
}

// Test Firebase connection
app.get("/test-firebase", async (req, res) => {
  try {
    const testDoc = db.collection("test").doc("testDoc");
    await testDoc.set({ message: "Firebase is working!" });
    const doc = await testDoc.get();
    res.json(doc.data());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Handle Spotify OAuth Callback
app.get("/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: "Authorization code missing" });

  console.log("Received authorization code:", code);

  try {
    const response = await axios.post(
      SPOTIFY_TOKEN_URL,
      querystring.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    console.log("Spotify API Response:", response.data);

    const { access_token, refresh_token } = response.data;
    res.json({ access_token, refresh_token });
  } catch (error) {
    console.error("Error exchanging code for token:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to retrieve access token" });
  }
});


app.get("/top-tracks", async (req, res) => {
  const { access_token } = req.query;

  if (!access_token) {
    return res.status(400).json({ error: "Access token required" });
  }

  try {
    const response = await axios.get("https://api.spotify.com/v1/me/top/tracks", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    // Extract only the needed data
    const simplifiedTracks = response.data.items.map((track) => ({
      name: track.name,
      artist: track.artists.map((artist) => artist.name).join(", "),
      album: track.album.name,
      spotify_url: track.external_urls.spotify, // Link to song on Spotify
    }));

    res.json(simplifiedTracks);
  } catch (error) {
    console.error("Error fetching top tracks:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch top tracks" });
  }
});

//test for not
console.log("SPOTIFY_CLIENT_ID:", process.env.SPOTIFY_CLIENT_ID);
console.log("SPOTIFY_CLIENT_SECRET:", process.env.SPOTIFY_CLIENT_SECRET);
console.log("SPOTIFY_REDIRECT_URI:", process.env.SPOTIFY_REDIRECT_URI);

// Add this after your other routes
app.post("/refresh-token", async (req, res) => {
  const { refresh_token } = req.body;
  
  if (!refresh_token) {
    return res.status(400).json({ error: "Refresh token is required" });
  }

  try {
    const data = await refreshAccessToken(refresh_token);
    res.json(data);
  } catch (error) {
    console.error("Error refreshing token:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to refresh token" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Melo Match backend running on port ${PORT}`);
});