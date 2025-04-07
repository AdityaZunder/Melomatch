from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
import requests
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from gemini_image_analysis import analyze_image
from gemini_recommend import recommend_songs  # New AI song recommendation

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=[
    "http://localhost:8080",
    "http://127.0.0.1:8080"  # 👈 Add this too just in case
]) # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure upload folder
UPLOAD_FOLDER = 'temp_uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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

        try:
            image_result = analyze_image(image_file)
            return jsonify({
                "success": True,
                "mood": image_result["mood"],
                 "description": image_result["description"]
                })

        except Exception as e:
            logger.error(f"Error analyzing image: {str(e)}")
            return jsonify({"error": "Failed to analyze image"}), 500

    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({"error": "Server error"}), 500



@app.route("/recommend-songs", methods=["POST"])
def recommend_songs_endpoint():
    try:
        data = request.json
        image_mood = data.get("mood")
        user_tracks = data.get("top_tracks")

        if not image_mood or not user_tracks:
            return jsonify({"error": "Missing mood or user tracks"}), 400

        # Clean the user tracks to only name & artist
        simplified_tracks = [
            {"name": track["name"], "artist": track["artist"]}
            for track in user_tracks if "name" in track and "artist" in track
        ]

        # Generate raw song list using AI
        ai_response = recommend_songs(image_mood, simplified_tracks)

        raw_songs = []
        for line in ai_response:
            if "-" in line:
                parts = line.split(" - ")
                if len(parts) >= 2:
                    raw_songs.append({
                        "name": parts[0].strip().replace("**", ""),
                        "artist": parts[1].strip().replace("**", "")
                    })

        print("✅ Returning raw songs to frontend:", raw_songs)
        return jsonify(raw_songs), 200

    except Exception as e:
        print("❌ Exception in /recommend-songs:", str(e))
        return jsonify({ "error": str(e) }), 500
    


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "healthy"}), 200

if __name__ == "__main__":
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=5001, debug=False)
