
import { Track } from '@/components/TopTracks';
import { GeneratedTrack } from '@/components/PlaylistGenerator';
import { MoodAnalysisResult } from '@/components/MoodAnalysis';
import axios from "axios";

// src/lib/Spotify.ts
// @/lib/Spotify.ts

// src/services/spotify.ts

export const authenticateWithSpotify = async () => {
  try {
    window.location.href = "http://localhost:5000/login";
  } catch (error) {
    console.error("Failed to authenticate with Spotify", error);
  }
};

export interface SpotifyPlaylist {
  id: string;
  name: string;
}

//function to get user's playlists from Spotify
export const getUserPlaylists = async (): Promise<SpotifyPlaylist[]> => {
  try {
    const response = await fetch("http://localhost:5000/playlists", {
      credentials: "include", // ✅ Send session cookie
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const playlists: SpotifyPlaylist[] = await response.json();
    console.log("✅ Playlists received from backend:", playlists);
    return playlists;
  } catch (error) {
    console.error("❌ Error fetching playlists from backend:", error);
    throw new Error("Failed to fetch playlists");
  }
};

export const getPlaylistTracks = async (playlistId: string): Promise<Track[]> => {
  try {
    const response = await fetch(`http://localhost:5000/playlist-songs?playlist_id=${playlistId}`, {
      credentials: "include", // ✅ Include session cookie
    });

    if (!response.ok) {
      throw new Error("Failed to fetch playlist tracks");
    }

    const data = await response.json();

    const formattedTracks: Track[] = data.tracks.map((track, index) => ({
      id: `track-${index}`, // Ideally use track.id from Spotify API
      name: track.song,
      artist: track.artists.join(', '),
      albumArt: track.albumArt,
    }));

    return formattedTracks;
  } catch (error) {
    console.error("Error fetching playlist tracks from backend:", error);
    return [];
  }
};
    
// Simulated function to get user's top tracks from Spotify
export async function getUserTopTracks() {
  try {
    const res = await fetch('http://localhost:5000/top-tracks', {
      credentials: 'include', // THIS is important to include the session cookie
    });
    console.log('Top tracks response status:', res.status); // 👈 add this

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data = await res.json();
    console.log('Top tracks data:', data); // 👈 add this
    return data;
  } catch (error) {
    console.error('Error fetching top tracks from backend:', error); // already present
    throw new Error('Failed to fetch top tracks');
  }
}

export const generatePlaylist = async (
  moodAnalysis: MoodAnalysisResult,
  userTracks: Track[]
): Promise<GeneratedTrack[]> => {
  try {
    const requestBody = {
      mood: moodAnalysis.mood,
      top_tracks: userTracks, // ✅ matches Flask's expected keys
    };

    console.log("Sending to Flask backend:", requestBody);

    // Step 1: Call Flask to get raw recommendations (name + artist)
    const recommendResponse = await fetch("http://127.0.0.1:5001/recommend-songs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(requestBody),
    });

    if (!recommendResponse.ok) {
      throw new Error("Failed to generate playlist from AI");
    }

    const rawTracks = await recommendResponse.json(); // should be [{ name, artist }, ...]

    console.log("Raw AI tracks from Flask:", rawTracks);

    // Step 2: Call Express to enrich songs using session-authenticated Spotify API
    const enrichResponse = await fetch("http://localhost:5000/enrich-songs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // important: so Express can read the session cookie
      body: JSON.stringify({ songs: rawTracks }),
    });

    if (!enrichResponse.ok) {
      throw new Error("Failed to enrich songs via Spotify");
    }

    const enrichedTracks = await enrichResponse.json(); // should be [{ name, artist, image, uri, etc }]
    console.log("Enriched Spotify tracks:", enrichedTracks);

    return enrichedTracks as GeneratedTrack[];

  } catch (error) {
    console.error("Error generating enriched playlist:", error);
    return [];
  }
};
// Simulated function to create a Spotify playlist
export const createSpotifyPlaylist = async (
  tracks: GeneratedTrack[],
  moodName: string
): Promise<string> => {
  // In a real implementation, this would call the Spotify API to create a playlist
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      // Mock Spotify playlist URL
      // In a real implementation, this would be the actual URL returned by the Spotify API
      resolve('https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd');
    }, 2000); // Simulate 2 second API call
  });
};
