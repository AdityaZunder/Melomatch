import google.generativeai as genai
from PIL import Image
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up the Gemini API key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("Missing GEMINI_API_KEY in environment variables.")
genai.configure(api_key=api_key)

def analyze_image(image_path):
    """Analyzes an image using Google Gemini and returns a concise description."""
    # Validate image path
    if not os.path.exists(image_path):
        return "Error: Image file not found."

    # Load image using PIL
    image = Image.open(image_path)
    
    # Initialize the model with fine-tuned settings
    model = genai.GenerativeModel(
        "gemini-1.5-flash",
        generation_config={
            "temperature": 0.2,  # Ensures more deterministic responses
            "max_output_tokens": 50  # Prevents excessively long descriptions
        }
    ) 
    
    # AI prompt for image analysis
    prompt = (
        "Provide a concise description of this image in **under 30 words**. "
        "Focus on mood, themes, and aesthetics. "
        "If the image contains a well-known character, identify its origin (e.g., 'Anime character from One Piece'). "
        "Avoid extra words such as 'Here is a description'."
    )

    # Generate response
    response = model.generate_content([image, prompt])

    return response.text.strip() if response and response.text else "No description found."

# Example usage
if __name__ == "__main__":
    image_path = "/Users/roronoazoro/Pictures/desktop pics/wallpapersden.com_monkey-d-luffy-one-piece-art_2560x1600.jpg"
    description = analyze_image(image_path)
    print("Image Mood & Description:", description)