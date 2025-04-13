import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def summarize_listening_history(tracks):
    return "\n".join([
        f"{track['name']} by {track['artist']} (Album: {track.get('album', 'Unknown')})"
        for track in tracks
    ])

def recommend_songs(image_mood, user_tracks, use_playlist=False):
    """Generates 5 AI-based song recommendations based on image mood & user music preference."""
    model = genai.GenerativeModel("gemini-1.5-flash")

    listening_history = summarize_listening_history(user_tracks)

    prompt = f"""
You are a music recommendation engine.

The user listens to the following songs:
{listening_history}

They uploaded an image with the following mood and themes:
{image_mood}

🎯 Your task:
- Recommend exactly 5 songs.
  - 3 songs should already exist in the user's selection.
  - 2 songs should be new discoveries that match the image mood.
- Ensure all songs match the mood (75-80%) and align with user taste (20-25%).
- Vary the genres slightly but keep a consistent mood feel.
- Only follow the format given
-Let the last two songs reccomended be the new songs and the first the be the songs alreay existing in the playlist.
- Keep the response clean and minimal:
Format:
1. Song Name - Artist
2. Song Name - Artist
3. Song Name - Artist
4. Song Name - Artist
5. Song Name - Artist
"""

    response = model.generate_content(prompt)
    return response.text.strip().split("\n")[:5] if response else []


if __name__ == "__main__":
    image_mood = "Dreamy and nostalgic with soft, warm lighting"  # Example mood
    user_choice = "playlist"  # Change to "top_tracks" if needed

    # Fetch user's selected music source
    if user_choice == "playlist":
        user_tracks = fetch_user_playlist_tracks()  # Implement this function if needed
    else:
        user_tracks = fetch_user_top_tracks()  # Fetches from top tracks API

    # Get AI-based recommendations
    recommendations = recommend_songs(image_mood, user_tracks, use_playlist=(user_choice == "playlist"))

    print("\n🎵 Recommended Songs 🎵")
    for song in recommendations:
        print(song)