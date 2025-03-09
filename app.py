from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from gemini_image_analysis import analyze_image
from gemini_recommend import recommend_songs  # New AI song recommendation

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

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/analyze-image", methods=["POST"])
def analyze_uploaded_image():
    """Handles image upload and analysis."""
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image provided"}), 400

        image = request.files["image"]
        
        if image.filename == '':
            return jsonify({"error": "No selected file"}), 400
            
        if not allowed_file(image.filename):
            return jsonify({"error": "File type not allowed"}), 400

        # Secure the filename and save the file
        filename = secure_filename(image.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        image.save(filepath)

        try:
            # Analyze the image
            image_mood = analyze_image(filepath)
            
            # Clean up - delete the temporary file
            os.remove(filepath)
            
            return jsonify({
                "success": True,
                "mood": image_mood
            })

        except Exception as e:
            logger.error(f"Error analyzing image: {str(e)}")
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({"error": "Failed to analyze image"}), 500

    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({"error": "Server error"}), 500

@app.route("/recommend-songs", methods=["POST"])
def recommend_songs_endpoint():
    """Handles song recommendation based on image mood & user's listening history."""
    try:
        data = request.json
        image_mood = data.get("mood")
        user_top_tracks = data.get("top_tracks", [])

        if not image_mood or not user_top_tracks:
            return jsonify({"error": "Missing required data"}), 400

        # Get AI-generated song recommendations
        recommended_songs = recommend_songs(image_mood, user_top_tracks)

        return jsonify({
            "success": True,
            "recommended_songs": recommended_songs
        })

    except Exception as e:
        logger.error(f"Error in song recommendation: {str(e)}")
        return jsonify({"error": "Failed to generate song recommendations"}), 500

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "healthy"}), 200

if __name__ == "__main__":
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)