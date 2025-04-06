from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
import requests
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from gemini_image_analysis import analyze_image
from gemini_recommend import recommend_songs  # AI-based recommendations
import uuid

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure upload folder
UPLOAD_FOLDER = 'temp_uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


# --- Utility functions ---

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_access_token_from_express():
    """Fetch the access token from the Express backend."""
    try:
        response = requests.get("http://localhost:5000/get-access-token")
        if response.status_code == 200:
            return response.json().get("accessToken")
        else:
            logger.error(f"Failed to get access token: {response.text}")
            return None
    except Exception as e:
        logger.error(f"Error fetching access token: {str(e)}")
        return None


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
        logger.error(f"[get_album_art] Failed to fetch album art: {e}")
        return None


# --- API Endpoints ---

@app.route("/analyze-image", methods=["POST"])
def analyze_uploaded_image():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image provided"}), 400

        image_file = request.files["image"]

        if image_file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        if not allowed_file(image_file.filename):
            return jsonify({"error": "File type not allowed"}), 400

        image_result = analyze_image(image_file)

        return jsonify({
            "success": True,
            "mood": image_result["mood"],
            "description": image_result["description"]
        })

    except Exception as e:
        logger.error(f"Error analyzing image: {str(e)}")
        return jsonify({"error": "Failed to analyze image"}), 500


@app.route("/recommend-songs", methods=["POST"])
def recommend_songs_endpoint():
    """Handles song recommendation based on image mood & user's listening history."""
    try:
        data = request.json
        image_mood = data.get("mood")
        user_top_tracks = data.get("top_tracks", [])

        if not image_mood or not user_top_tracks:
            return jsonify({"error": "Missing required data"}), 400

        access_token = get_access_token_from_express()
        if not access_token:
            return jsonify({"error": "Could not retrieve access token"}), 401

        # Get AI-generated song recommendations
        recommended = recommend_songs(image_mood, user_top_tracks)

        # Build final song objects with album art
        songs = []
        for line in recommended:
            if "-" not in line:
                continue
            parts = line.split(" - ")
            if len(parts) < 2:
                continue

            song_name, artist = parts[0].strip(), parts[1].strip()
            album_art = get_album_art(song_name, artist, access_token)

            songs.append({
                "id": str(uuid.uuid4()),
                "name": song_name,
                "artist": artist,
                "albumArt": album_art or "https://source.unsplash.com/400x400/?music"
            })

        return jsonify(songs), 200

    except Exception as e:
        logger.error(f"Error in song recommendation: {str(e)}")
        return jsonify({"error": "Failed to generate song recommendations"}), 500


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "healthy"}), 200


# --- Start Flask App ---
if __name__ == "__main__":
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)