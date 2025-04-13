require("dotenv").config();
const express = require("express");
const session = require("express-session");
const querystring = require("querystring");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

const cors = require("cors");
app.use(cors({
  origin: ["http://localhost:8080", "http://127.0.0.1:5001"], 
  credentials: true,
}));

// Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 3600000,
      sameSite: "lax",
    },
  })
);



const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = process.env.SPOTIFY_REDIRECT_URI;




// 🔥 GET ACCESS TOKEN from session (for Flask or other services)
app.get("/get-access-token", (req, res) => {
  const accessToken = req.session.access_token;
  if (!accessToken) {
    return res.status(401).json({ error: "Access token not found in session" });
  }
  res.json({ accessToken });
});

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

// Login
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

// Callback
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
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { access_token, refresh_token } = response.data;

    req.session.access_token = access_token;
    req.session.refresh_token = refresh_token;

    console.log("✅ Tokens saved to session:", {
      access_token: access_token?.slice(0, 10) + "...",
      refresh_token: refresh_token?.slice(0, 10) + "...",
    });

    res.send(`
      <html>
        <head><title>Redirecting...</title></head>
        <body>
          <script>
            setTimeout(() => {
              window.location.href = "http://localhost:8080/?success=true";
            }, 200);
          </script>
          <p>Logging you in...</p>
        </body>
      </html>
    `);

    
  } catch (error) {
    console.error("❌ Error exchanging code for token:", error.response?.data || error.message);
    res.redirect("http://localhost:8080/?error=auth_failed");
  }
});

// Get top tracks
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
      id: track.id,
      name: track.name,
      artist: track.artists.map((artist) => artist.name).join(", "),
      albumArt: track.album.images[0]?.url || "",
    }));

    res.json(simplifiedTracks);
  } catch (error) {
    console.error("Error fetching top tracks:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch top tracks" });
  }
});

// Refresh token
app.post("/refresh-token", async (req, res) => {
  const refresh_token = req.session.refresh_token;

  if (!refresh_token) {
    return res.status(401).json({ error: "No refresh token found. Please log in again." });
  }

  try {
    const data = await refreshAccessToken(refresh_token);
    req.session.access_token = data.access_token;
    res.json(data);
  } catch (error) {
    console.error("Error refreshing token:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to refresh token" });
  }
});

// Get playlists
app.get('/playlists', async (req, res) => {
  const accessToken = req.session.access_token;

  if (!accessToken) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  try {
    const response = await fetch("https://api.spotify.com/v1/me/playlists", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Spotify API error:", response.status, response.statusText);
      return res.status(response.status).json({ error: "Failed to fetch playlists from Spotify" });
    }

    const data = await response.json();
    const playlists = data.items.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
    }));

    console.log("✅ Fetched playlists:", playlists);

    res.json(playlists);
  } catch (error) {
    console.error("❌ Error fetching playlists:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get playlist songs
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

    const simplifiedTracks = data.items.map((item) => ({
      id: item.track.id,
      song: item.track.name,
      artists: item.track.artists.map((artist) => artist.name),
      albumArt: item.track.album?.images?.[0]?.url || null,
    }));

    res.json({ tracks: simplifiedTracks });
  } catch (error) {
    console.error("❌ Error fetching playlist songs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/enrich-songs", async (req, res) => {
  const accessToken = req.session.access_token;

  if (!accessToken) {
    console.log("🚫 No access token in session!");
    return res.status(401).json({ error: "Access token not found in session" });
  }

  const rawSongs = req.body.songs;

  if (!Array.isArray(rawSongs)) {
    console.log("🚫 Invalid input for songs:", rawSongs);
    return res.status(400).json({ error: "Invalid song data format" });
  }

  try {
    const enriched = await Promise.all(
      rawSongs.map(async (song, index) => {
        // Clean inputs before querying
      const cleanedName = song.name.replace(/^\d+\.\s*/, "").trim(); // remove "1. " etc
      const mainArtist = song.artist.split(",")[0].trim(); // only take first artist

      const preciseQuery = `track:${cleanedName} artist:${mainArtist}`;
        console.log(`🔍 [${index + 1}] Searching for: ${preciseQuery}`);

        try {
          const response = await axios.get("https://api.spotify.com/v1/search", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              q: preciseQuery,
              type: "track",
              limit: 3, // More results for fallback
            },
          });

          const items = response.data.tracks.items;

          if (!items.length) {
            console.warn(`⚠️ [${index + 1}] No results for: ${preciseQuery}`);
            return {
              name: song.name,
              artist: song.artist,
              albumArt: null,
              spotifyUri: null,
            };
          }

          // Prefer exact match if found
          const exactMatch = items.find((item) =>
            item.name.toLowerCase().includes(song.name.toLowerCase()) &&
            item.artists.some((a) =>
              song.artist.toLowerCase().includes(a.name.toLowerCase()) ||
              a.name.toLowerCase().includes(song.artist.toLowerCase())
            )
          );

          const track = exactMatch || items[0];

          console.log(`✅ [${index + 1}] Found track: ${track.name} – ${track.artists.map(a => a.name).join(", ")}`);

          return {
            name: song.name,
            artist: song.artist,
            albumArt: track?.album?.images?.[0]?.url || null,
            spotifyUri: track?.uri || null, // ✅ Proper format: "spotify:track:xyz"
          };
        } catch (searchError) {
          console.error(`❌ [${index + 1}] Spotify search failed for: ${preciseQuery}`, searchError?.response?.data || searchError.message);
          return {
            name: song.name,
            artist: song.artist,
            albumArt: null,
            spotifyUri: null,
          };
        }
      })
    );

    console.log("🎧 Final Enriched Songs:", enriched);
    res.json(enriched);
  } catch (error) {
    console.error("❌ Error enriching songs:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to enrich songs with Spotify data" });
  }
});

app.post("/create-playlist", async (req, res) => {
  console.log("🎯 POST /create-playlist HIT");

  const accessToken = req.session.access_token;

  if (!accessToken) {
    return res.status(401).json({ error: "Unauthorized: No access token" });
  }

  const { tracks, moodName } = req.body;

  if (!Array.isArray(tracks) || typeof moodName !== "string" || moodName.trim() === "") {
    return res.status(400).json({ error: "Invalid input: 'tracks' (array) and 'moodName' (string) are required" });
  }

  try {
    // Step 1: Get user ID
    const userResponse = await axios.get("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userId = userResponse.data.id;

    // Step 2: Create new playlist
    const playlistResponse = await axios.post(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        name: `MeloMatch – ${moodName}`,
        description: "Playlist curated by Melo Match based on your vibe and mood.",
        public: false,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const playlistId = playlistResponse.data.id;
    const playlistUrl = playlistResponse.data.external_urls.spotify;

    // Step 3: Parse Spotify URIs from full URLs
    const uris = tracks
  .map((track) => {
    if (track.spotifyUri.startsWith("spotify:track:")) {
      return track.spotifyUri;
    }
    const urlMatch = track.spotifyUri.match(/track\/([a-zA-Z0-9]+)/);
    return urlMatch ? `spotify:track:${urlMatch[1]}` : null;
  })
  .filter(Boolean);

    // Step 4: Add tracks to playlist
    await axios.post(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      { uris },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Playlist created:", playlistUrl);
    res.json({ playlistUrl });

  } catch (error) {
    console.error("❌ Error creating playlist:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to create playlist" });
  }
});


// Logout
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