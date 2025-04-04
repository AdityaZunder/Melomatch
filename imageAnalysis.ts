
import { MoodAnalysisResult } from '@/components/MoodAnalysis';

// Simulate analyzing an image and returning mood information
export const analyzeImage = async (imageFile: File): Promise<MoodAnalysisResult> => {
  // In a real implementation, this would call an AI service API
  // For now, we'll simulate the analysis with a delay and mock data
  
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      // Generate mock analysis result
      // In a real implementation, this would come from an AI service
      const moods = [
        {
          mood: "Serene & Peaceful",
          description: "This image has a calm, tranquil energy with soft tones and gentle composition. It evokes feelings of peace and mindfulness.",
          dominantColors: ["#729FCF", "#E8F4F8", "#BCD8E6"],
          intensityScore: 3.2,
          tags: ["calm", "tranquil", "relaxing", "peaceful", "gentle"],
        },
        {
          mood: "Energetic & Vibrant",
          description: "This image radiates energy and excitement with bold colors and dynamic elements. It has a lively, vibrant atmosphere.",
          dominantColors: ["#FF5E5B", "#FFED66", "#00CECB"],
          intensityScore: 8.7,
          tags: ["energetic", "vibrant", "exciting", "bold", "dynamic"],
        },
        {
          mood: "Nostalgic & Warm",
          description: "This image has a warm, vintage quality that evokes feelings of nostalgia and comfort. It has a timeless, sentimental atmosphere.",
          dominantColors: ["#E8985E", "#D8B276", "#AF8C65"],
          intensityScore: 6.4,
          tags: ["nostalgic", "warm", "vintage", "sentimental", "cozy"],
        },
        {
          mood: "Melancholic & Reflective",
          description: "This image has a contemplative, slightly melancholic quality with subdued colors and thoughtful composition.",
          dominantColors: ["#546A7B", "#9EA7B3", "#2A3C4A"],
          intensityScore: 4.8,
          tags: ["reflective", "pensive", "melancholic", "moody", "contemplative"],
        },
        {
          mood: "Mysterious & Intriguing",
          description: "This image has an enigmatic quality with contrasting elements and unexpected details. It evokes curiosity and wonder.",
          dominantColors: ["#2D112A", "#511C56", "#7B337D"],
          intensityScore: 7.2,
          tags: ["mysterious", "intriguing", "enigmatic", "dramatic", "dark"],
        }
      ];
      
      // Randomly select one of the mock mood analyses
      const randomMood = moods[Math.floor(Math.random() * moods.length)];
      
      resolve(randomMood);
    }, 2500); // Simulate 2.5 second API call
  });
};
