
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

// Simulated function to get user's playlists from Spotify
export const getUserPlaylists = async (): Promise<SpotifyPlaylist[]> => {
  // In a real implementation, this would call the Spotify API
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      // Mock playlists data
      const mockPlaylists: SpotifyPlaylist[] = [
        {
          id: 'playlist1',
          name: 'Workout Mix'
        },
        {
          id: 'playlist2',
          name: 'Chill Vibes'
        },
        {
          id: 'playlist3',
          name: 'Road Trip'
        },
        {
          id: 'playlist4',
          name: 'Study Session'
        },
        {
          id: 'playlist5',
          name: 'Party Anthems'
        }
      ];
      
      resolve(mockPlaylists);
    }, 1500);
  });
};

// Simulated function to get tracks from a specific playlist
export const getPlaylistTracks = async (playlistId: string): Promise<Track[]> => {
  // In a real implementation, this would call the Spotify API
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      // Mock playlist tracks based on the playlist ID
      const playlistTracks: Record<string, Track[]> = {
        'playlist1': [ // Workout Mix
          {
            id: 'w1',
            name: 'Eye of the Tiger',
            artist: 'Survivor',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b273c1a0e2c6c42e1dd8ba599c0f'
          },
          {
            id: 'w2',
            name: 'Stronger',
            artist: 'Kanye West',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b2731f6a2a40bb692936879db730'
          },
          {
            id: 'w3',
            name: 'Can\'t Hold Us',
            artist: 'Macklemore & Ryan Lewis',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b273c04e9f2b1563e6f601a06cd1'
          }
        ],
        'playlist2': [ // Chill Vibes
          {
            id: 'c1',
            name: 'Sunflower',
            artist: 'Post Malone, Swae Lee',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b273e2e352d89826aef6dbd5ff8f'
          },
          {
            id: 'c2',
            name: 'Sunday Morning',
            artist: 'Maroon 5',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b273283e3b960d4faaffd36d1973'
          },
          {
            id: 'c3',
            name: 'Electric Feel',
            artist: 'MGMT',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b273f8770906ff0f91663df3a05f'
          }
        ],
        'playlist3': [ // Road Trip
          {
            id: 'r1',
            name: 'Life Is a Highway',
            artist: 'Rascal Flatts',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b273d7b2c8bfce6c3969e8838365'
          },
          {
            id: 'r2',
            name: 'Take Me Home, Country Roads',
            artist: 'John Denver',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b2732b9b037b30a569411e8c8468'
          },
          {
            id: 'r3',
            name: 'Sweet Home Alabama',
            artist: 'Lynyrd Skynyrd',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b273b6aa6447195c5872839080d7'
          }
        ],
        'playlist4': [ // Study Session
          {
            id: 's1',
            name: 'Experience',
            artist: 'Ludovico Einaudi',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b2734e8ca8357cea69dd7ef091a5'
          },
          {
            id: 's2',
            name: 'Comptine d\'un autre été, l\'après-midi',
            artist: 'Yann Tiersen',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b2730f571abe8900dad81b4f0c41'
          },
          {
            id: 's3',
            name: 'River Flows in You',
            artist: 'Yiruma',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b273fd7f7ba237eafcfa4c07431a'
          }
        ],
        'playlist5': [ // Party Anthems
          {
            id: 'p1',
            name: 'Don\'t Stop the Music',
            artist: 'Rihanna',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b2735e8f1cfc2eb3f4dc3c59e559'
          },
          {
            id: 'p2',
            name: 'Uptown Funk',
            artist: 'Mark Ronson ft. Bruno Mars',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b2735af2926a035d9502bfa65f5a'
          },
          {
            id: 'p3',
            name: 'Yeah!',
            artist: 'Usher ft. Lil Jon, Ludacris',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b27303c03c7eb0d431a4f78691d5'
          }
        ]
      };
      
      // Return the tracks for the given playlist ID, or an empty array if not found
      resolve(playlistTracks[playlistId] || []);
    }, 2000);
  });
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

// Simulated function to generate a playlist based on mood and user preferences
export const generatePlaylist = async (
  moodAnalysis: MoodAnalysisResult,
  userTracks: Track[],
  numberOfTracks: number = 20
): Promise<GeneratedTrack[]> => {
  // In a real implementation, this would use the Spotify recommendations API
  // based on the mood analysis and user's top tracks as seed data
  
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      // Template tracks for different moods
      const tracksByMood: Record<string, GeneratedTrack[]> = {
        'Serene & Peaceful': [
          {
            id: 's1',
            name: 'Gymnopédie No. 1',
            artist: 'Erik Satie',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b2739991cc7eb5d5573ce1cf389f'
          },
          {
            id: 's2',
            name: 'Weightless',
            artist: 'Marconi Union',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b2731a5eeaab9d7236c1517396dd'
          },
          {
            id: 's3',
            name: 'Horizon Variations',
            artist: 'Max Richter',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b273a0ca870c10cfac7d9ea4143e'
          },
          {
            id: 's4',
            name: 'Claire de Lune',
            artist: 'Claude Debussy',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b273d8a75d3c2778510d7d2c6ca6'
          },
        ],
        'Energetic & Vibrant': [
          {
            id: 'e1',
            name: 'Physical',
            artist: 'Dua Lipa',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b273d4daf28d55fe4197ede848be'
          },
          {
            id: 'e2',
            name: 'Dynamite',
            artist: 'BTS',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b2737d35d503ceee6331ce3744b2'
          },
          {
            id: 'e3',
            name: 'Dance Monkey',
            artist: 'Tones and I',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b27348a7aed5c18bbbd83e76d86e'
          },
          {
            id: 'e4',
            name: 'Can\'t Stop the Feeling!',
            artist: 'Justin Timberlake',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b273b4c26a947228e3862d62863f'
          },
        ],
        'Nostalgic & Warm': [
          {
            id: 'n1',
            name: 'Vienna',
            artist: 'Billy Joel',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b2734ce8b4e42588bf18182a1ad2'
          },
          {
            id: 'n2',
            name: 'Dreams',
            artist: 'Fleetwood Mac',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b2739e2f95ae77cf436017ada9cb'
          },
          {
            id: 'n3',
            name: 'September',
            artist: 'Earth, Wind & Fire',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b2736e9941f4e9abef3d569dc0bc'
          },
          {
            id: 'n4',
            name: 'Landslide',
            artist: 'Fleetwood Mac',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b273f9f1d613f1ac9ddcabdc56b5'
          },
        ],
        'Melancholic & Reflective': [
          {
            id: 'm1',
            name: 'Liability',
            artist: 'Lorde',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b27334828dde4dfd53a51ffb29be'
          },
          {
            id: 'm2',
            name: 'Exile (feat. Bon Iver)',
            artist: 'Taylor Swift',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b273c956f9afc5abe7b9e99c1718'
          },
          {
            id: 'm3',
            name: 'Someone You Loved',
            artist: 'Lewis Capaldi',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b273fc2101e6889d6ce9025f85f2'
          },
          {
            id: 'm4',
            name: 'Motion Sickness',
            artist: 'Phoebe Bridgers',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b273a91c10fe9472d9bd89802e5a'
          },
        ],
        'Mysterious & Intriguing': [
          {
            id: 'my1',
            name: 'Nightmare',
            artist: 'Halsey',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b27308e36752c33faa432cb7afd3'
          },
          {
            id: 'my2',
            name: 'Seven Nation Army',
            artist: 'The White Stripes',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b273a7cea6140fd0e25963d2b507'
          },
          {
            id: 'my3',
            name: 'Bad Guy',
            artist: 'Billie Eilish',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b2732a038d3bf856d7d5aa3a6ef0'
          },
          {
            id: 'my4',
            name: 'Another Brick in the Wall, Pt. 2',
            artist: 'Pink Floyd',
            albumArt: 'https://i.scdn.co/image/ab67616d0000b273883b942ae3c39cffa453e394'
          },
        ]
      };
      
      // Get the base tracks for the identified mood
      let baseTracks = tracksByMood[moodAnalysis.mood] || tracksByMood['Energetic & Vibrant'];
      
      // Create a full playlist with a mix of mood-based tracks and some of the user's top tracks
      // that would match the mood (in reality, this would use Spotify's recommendation system)
      const generatedTracks: GeneratedTrack[] = [
        ...baseTracks,
        ...userTracks.slice(0, 3).map(track => ({
          id: `user-${track.id}`,
          name: track.name,
          artist: track.artist,
          albumArt: track.albumArt
        })),
        // Add more tracks to reach the desired number
        {
          id: 'g1',
          name: 'Sunflower',
          artist: 'Post Malone, Swae Lee',
          albumArt: 'https://i.scdn.co/image/ab67616d0000b273e2e352d89826aef6dbd5ff8f'
        },
        {
          id: 'g2',
          name: 'Adore You',
          artist: 'Harry Styles',
          albumArt: 'https://i.scdn.co/image/ab67616d0000b273d51f3370c3e06de1c1d01bb4'
        },
        {
          id: 'g3',
          name: 'Circles',
          artist: 'Post Malone',
          albumArt: 'https://i.scdn.co/image/ab67616d0000b273b3c3eadcfd11bba39488332d'
        },
        {
          id: 'g4',
          name: 'Memories',
          artist: 'Maroon 5',
          albumArt: 'https://i.scdn.co/image/ab67616d0000b273c0e7bf5cdd630f314f20586a'
        },
        {
          id: 'g5',
          name: 'Before You Go',
          artist: 'Lewis Capaldi',
          albumArt: 'https://i.scdn.co/image/ab67616d0000b273fc2101e6889d6ce9025f85f2'
        },
        {
          id: 'g6',
          name: 'Stuck with U',
          artist: 'Ariana Grande & Justin Bieber',
          albumArt: 'https://i.scdn.co/image/ab67616d0000b273a7c4f5bc47c721b6dc19fe39'
        },
        {
          id: 'g7',
          name: 'Savage Love',
          artist: 'Jawsh 685, Jason Derulo',
          albumArt: 'https://i.scdn.co/image/ab67616d0000b273bb5c51c9737e5049e6bf11b0'
        },
        {
          id: 'g8',
          name: 'Kings & Queens',
          artist: 'Ava Max',
          albumArt: 'https://i.scdn.co/image/ab67616d0000b2733faf4487a04097359e6976c9'
        },
        {
          id: 'g9',
          name: 'Roses',
          artist: 'SAINt JHN, Imanbek',
          albumArt: 'https://i.scdn.co/image/ab67616d0000b2735f5977f8d2727f013e61af68'
        },
        {
          id: 'g10',
          name: 'Mood',
          artist: '24kGoldn, iann dior',
          albumArt: 'https://i.scdn.co/image/ab67616d0000b273d14a0bcb6f6008e5b96eeaff'
        },
        {
          id: 'g11',
          name: 'What You Know Bout Love',
          artist: 'Pop Smoke',
          albumArt: 'https://i.scdn.co/image/ab67616d0000b2732453af58f62afb55edaa2bc3'
        },
        {
          id: 'g12',
          name: 'Lonely',
          artist: 'Justin Bieber & benny blanco',
          albumArt: 'https://i.scdn.co/image/ab67616d0000b273ea9eef15a48464577c2c7b62'
        }
      ];
      
      // Take only the requested number of tracks (defaulting to 20, but now adjustable)
      resolve(generatedTracks.slice(0, numberOfTracks));
    }, 3000); // Simulate 3 second API call
  });
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
