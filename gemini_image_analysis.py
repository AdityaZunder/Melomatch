import google.generativeai as genai
from PIL import Image

# Set up the Gemini API key
genai.configure(api_key="AIzaSyDy_O-58VtLHF2F8pXvNGlPmOSQDV8oQ8w")

def analyze_image(image_path):
    """Analyzes an image using Google Gemini and returns a description."""
    # Load image using PIL
    image = Image.open(image_path)
    
    # Initialize the model with a low temperature for consistency
    model = genai.GenerativeModel(
        "gemini-1.5-flash",
        generation_config={"temperature": 0.2}  # Ensures deterministic output
    ) 
    
    # Generate the response
    response = model.generate_content(
        [
            image,  # Pass the PIL Image directly
            "Describe this image in detail but limit word count to 30 words, including mood and themes. If there's a character, mention its origin (e.g., 'Anime character from One Piece'). There is no need of extra words such as here is a description of the image, just give the description"
        ]
    )

    return response.text if response else "No description found."

# Example usage
if __name__ == "__main__":
    image_path = "/Users/roronoazoro/Pictures/desktop pics/wallpapersden.com_monkey-d-luffy-one-piece-art_2560x1600.jpg"
    description = analyze_image(image_path)
    print("Image Mood & Description:", description)