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
            generation_config={"temperature": 0.6}
        )

        # First: Get mood title
        mood_prompt = (
    "In 2 to 3 words, describe the emotional atmosphere or aesthetic theme of this image. "
    "Be imaginative—use evocative, creative, or poetic language. Return only the mood title."
)
        mood_response = model.generate_content([image, mood_prompt])
        mood = mood_response.text.strip().capitalize() if mood_response and mood_response.text else "Unknown"

        # Second: Get full descriptive sentence
                # Second: Get full descriptive sentence
        desc_prompt = (
            "Write a single evocative and creative sentence describing the emotional tone, atmosphere, and aesthetic of this image. "
            "Be poetic and unique, avoid clichés, and aim to inspire a mood. Keep it between 30-60 words. give me only the description"
        )
        desc_response = model.generate_content([image, desc_prompt])
        description = desc_response.text.strip() if desc_response and desc_response.text else "No detailed description available."

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