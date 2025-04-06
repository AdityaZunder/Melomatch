import { MoodAnalysisResult } from "@/components/MoodAnalysis";

export const analyzeImage = async (imageFile: File): Promise<MoodAnalysisResult> => {
  const formData = new FormData();
  formData.append("image", imageFile);

  try {
    const response = await fetch("http://localhost:5001/analyze-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to analyze image");
    }

    const data = await response.json();

    return {
      mood: data.mood || "Unknown mood",
      description: data.description || "No description available.",
      dominantColors: [], // Optional: You can update backend to return this later
      intensityScore: Math.random() * 10, // Placeholder until you compute this
      tags: [], // Optional: can be derived from mood text using keyword extraction
    };
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};