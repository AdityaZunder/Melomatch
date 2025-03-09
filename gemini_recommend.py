import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def summarize_listening_history(top_tracks):
    """Summarizes user's top tracks into a structured format for AI."""
    summary = []
    for track in top_tracks:
        summary.append(f"{track['name']} by {track['artist']} (Album: {track['album']})")
    return "\n".join(summary)

def recommend_songs(image_mood, user_top_tracks):
    """Generates 10 AI-based song recommendations based on image mood & user history."""
    model = genai.GenerativeModel("gemini-1.5-flash")

    listening_history = summarize_listening_history(user_top_tracks)

    prompt = f"""
    User's music taste is based on these tracks:
    {listening_history}

    The uploaded image conveys the following mood:
    {image_mood}

    Based on both, recommend 10 new songs that match their taste & mood.
    Return the response in this format:

    1. Song Name - Artist Name
    2. Song Name - Artist Name
    ...
    """

    response = model.generate_content(prompt)
    return response.text.strip().split("\n")  # Returns a list of song recommendations