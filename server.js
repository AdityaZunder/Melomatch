require("dotenv").config();
const express = require("express");
const session = require("express-session");
const admin = require("firebase-admin");
const querystring = require("querystring");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

// Session Middleware (stores session in memory)
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Secure session secret from .env
    resave: false, // Prevents resaving session if nothing changed
    saveUninitialized: false, // Don't create empty sessions
    cookie: { secure: false, httpOnly: true, maxAge: 3600000 }, // 1-hour session expiry
  })
);

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

// Refresh token function
async function refreshAccessToken(refreshToken) {
  const response = await axios.post(
    SPOTIFY_TOKEN_URL,
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

// Spotify OAuth login (redirect user to Spotify for authentication)
app.get("/login", (req, res) => {
  const scope =
    "user-top-read playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private";

  const authUrl = `${SPOTIFY_AUTH_URL}?${querystring.stringify({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope,
  })}`;
  res.redirect(authUrl);
});
// Spotify OAuth Callback
app.get("/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: "Authorization code missing" });

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

    const { access_token, refresh_token } = response.data;

    // Store tokens in session
    req.session.access_token = access_token;
    req.session.refresh_token = refresh_token;

    res.json({ message: "Logged in successfully", access_token, refresh_token });
  } catch (error) {
    console.error("Error exchanging code for token:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to retrieve access token" });
  }
});

// Get user's top tracks (requires session)
app.get("/top-tracks", async (req, res) => {
  const access_token = req.session.access_token;

  if (!access_token) {
    return res.status(401).json({ error: "User not authenticated. Please log in again." });
  }

  try {
    const response = await axios.get("https://api.spotify.com/v1/me/top/tracks", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const simplifiedTracks = response.data.items.map((track) => ({
      name: track.name,
      artist: track.artists.map((artist) => artist.name).join(", "),
      album: track.album.name,
      spotify_url: track.external_urls.spotify,
    }));

    res.json(simplifiedTracks);
  } catch (error) {
    console.error("Error fetching top tracks:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch top tracks" });
  }
});

// Refresh token route
app.post("/refresh-token", async (req, res) => {
  const refresh_token = req.session.refresh_token;

  if (!refresh_token) {
    return res.status(401).json({ error: "No refresh token found. Please log in again." });
  }

  try {
    const data = await refreshAccessToken(refresh_token);
    
    // Update session with new access token
    req.session.access_token = data.access_token;
    res.json(data);
  } catch (error) {
    console.error("Error refreshing token:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to refresh token" });
  }
});

// Add the following routes in server.js

// Get user's playlists
app.get('/playlists', async (req, res) => {
  try {
      const accessToken = req.session.access_token; // Ensure the session has an access token
      if (!accessToken) {
          return res.status(401).json({ error: "User not authenticated" });
      }

      const response = await fetch("https://api.spotify.com/v1/me/playlists", {
          method: "GET",
          headers: { "Authorization": `Bearer ${accessToken}` },
      });

      if (!response.ok) {
          throw new Error(`Spotify API error: ${response.statusText}`);
      }

      const data = await response.json();
      const playlists = data.items.map(playlist => ({
          id: playlist.id,
          name: playlist.name,
          total_tracks: playlist.tracks.total
      }));

      res.json({ playlists });
  } catch (error) {
      console.error("Error fetching playlists:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get tracks from a selected playlist

app.get("/playlist-songs", async (req, res) => {
  const accessToken = req.session.access_token;

  if (!accessToken) {
    return res.status(401).json({ error: "Unauthorized: No access token" });
  }

  try {
    const playlistId = req.query.playlist_id;
    if (!playlistId) {
      return res.status(400).json({ error: "Missing playlist_id parameter" });
    }

    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Extracting only song names and artist names
    const simplifiedTracks = data.items.map((item) => ({
      song: item.track.name,
      artists: item.track.artists.map((artist) => artist.name),
    }));

    res.json({ tracks: simplifiedTracks });
  } catch (error) {
    console.error("Error fetching playlist songs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to log out" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Melo Match backend running on port ${PORT}`);
});