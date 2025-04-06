import google.generativeai as genai
import os
from dotenv import load_dotenv
from PIL import Image, UnidentifiedImageError
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables.")

genai.configure(api_key=api_key)

def analyze_image(image_file):
    """Analyzes an uploaded in-memory image using Google Gemini and returns mood and description separately."""
    try:
        image_file.seek(0)
        try:
            image = Image.open(image_file)
        except UnidentifiedImageError:
            raise ValueError("Uploaded file is not a valid image.")

        model = genai.GenerativeModel(
            "gemini-1.5-flash",
            generation_config={"temperature": 0.3}
        )

        prompt = """Describe the mood, emotion, and themes of this image in a concise but evocative way (max 30 words).
Start with a 2–3 word mood title (like a theme), followed by a full descriptive sentence."""

        response = model.generate_content([image, prompt])

        if not response or not response.text:
            return {
                "mood": "Unknown",
                "description": "Could not analyze image."
            }

        full_text = response.text.strip()

        # Attempt to split into title + description using first period or newline
        if '.' in full_text:
            mood, description = full_text.split('.', 1)
            mood = mood.strip().capitalize()
            description = description.strip()
        elif '\n' in full_text:
            mood, description = full_text.split('\n', 1)
            mood = mood.strip().capitalize()
            description = description.strip()
        else:
            mood = full_text.strip().capitalize()
            description = "No detailed description available."

        return {
            "mood": mood,
            "description": description
        }

    except Exception as e:
        logger.error(f"Error analyzing image: {str(e)}")
        return {
            "mood": "Error",
            "description": f"An error occurred during image analysis: {str(e)}"
        }