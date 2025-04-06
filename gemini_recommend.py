import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def summarize_listening_history(tracks):
    """Summarizes user's selected tracks into a structured format for AI."""
    return "\n".join([f"{track['name']} by {track['artist']} (Album: {track['album']})" for track in tracks])

def recommend_songs(image_mood, user_tracks, use_playlist=False):
    """Generates 7 AI-based song recommendations based on image mood & user music preference."""
    model = genai.GenerativeModel("gemini-1.5-flash")

    listening_history = summarize_listening_history(user_tracks)

    prompt = f"""
    The user's selected music taste is based on these tracks:
    {listening_history}

    The uploaded image conveys the following **mood and themes**:
    {image_mood}

    Based on these factors, recommend only **7 new songs** that fit the mood **(60–65%)** while also aligning with their music taste **(35–40%)**.
    Ensure the recommendations are diverse in genre but maintain a similar emotional tone.

    Return the response in this format:
    1. Song Name - Artist Name
    2. Song Name - Artist Name
    ...
    """

    response = model.generate_content(prompt)
    return response.text.strip().split("\n") if response else []

def get_album_art(song_name, artist_name, access_token):
    """Fetch album art URL from Spotify based on song and artist name."""
    try:
        query = f"{song_name} {artist_name}"
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        params = {
            "q": query,
            "type": "track",
            "limit": 1
        }
        response = requests.get("https://api.spotify.com/v1/search", headers=headers, params=params)
        data = response.json()

        if response.status_code != 200:
            raise Exception(data.get("error", {}).get("message", "Unknown error from Spotify"))

        tracks = data.get("tracks", {}).get("items", [])
        if not tracks:
            return None

        # Return the album art URL
        return tracks[0]["album"]["images"][0]["url"] if tracks[0]["album"]["images"] else None

    except Exception as e:
        print(f"[get_album_art] Failed to fetch album art: {e}")
        return None
# Example usage
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