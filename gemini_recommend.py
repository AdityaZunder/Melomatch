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