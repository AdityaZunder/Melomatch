import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import Header from '@/components/Header';
import ImageUpload from '@/components/ImageUpload';
import MoodAnalysis, { MoodAnalysisResult } from '@/components/MoodAnalysis';
import SpotifyAuth, { SpotifySourceOptions } from '@/components/SpotifyAuth';
import TopTracks, { Track } from '@/components/TopTracks';
import PlaylistGenerator, { GeneratedTrack } from '@/components/PlaylistGenerator';
import Footer from '@/components/Footer';
import { analyzeImage } from '@/services/imageAnalysis';
import { 
  authenticateWithSpotify,
  getUserTopTracks,
  generatePlaylist,
  createSpotifyPlaylist,
  getUserPlaylists,
  getPlaylistTracks,
  SpotifyPlaylist
} from '@/services/spotify';

const Index: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [moodAnalysis, setMoodAnalysis] = useState<MoodAnalysisResult | null>(null);
  const [hasAnalyzedImage, setHasAnalyzedImage] = useState(false);

  const [isSpotifyLoggedIn, setIsSpotifyLoggedIn] = useState(false);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [selectedSource, setSelectedSource] = useState<SpotifySourceOptions | null>(null);
  const [sourceSelected, setSourceSelected] = useState(false);

  const [isGeneratingPlaylist, setIsGeneratingPlaylist] = useState(false);
  const [generatedTracks, setGeneratedTracks] = useState<GeneratedTrack[]>([]);
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);

  const [searchParams] = useSearchParams();

  const handleSpotifyLogin = () => {
    try {
      authenticateWithSpotify();
    } catch (error) {
      console.error("Error authenticating with Spotify:", error);
      toast.error("Failed to connect to Spotify. Please try again.");
    }
  };

  useEffect(() => {
    const successParam = searchParams.get("success");

    if (successParam === "true") {
      setIsSpotifyLoggedIn(true);
      toast.success("Connected to Spotify!");

      const fetchUserPlaylists = async () => {
        try {
          setIsLoadingPlaylists(true);
          const userPlaylists = await getUserPlaylists();
          setPlaylists(userPlaylists);
        } catch (error) {
          console.error("Error loading Spotify playlists:", error);
          toast.error("Failed to load playlists.");
        } finally {
          setIsLoadingPlaylists(false);
        }
      };

      fetchUserPlaylists();
    }
  }, [searchParams]);

  useEffect(() => {
    const canGenerate =
      moodAnalysis &&
      topTracks.length > 0 &&
      isSpotifyLoggedIn &&
      generatedTracks.length === 0 &&
      !isGeneratingPlaylist &&
      hasAnalyzedImage; // ✅ only after analysis
  
    if (canGenerate) {
      handleGeneratePlaylist();
    }
  }, [moodAnalysis, topTracks, isSpotifyLoggedIn, hasAnalyzedImage]);

  const handleSourceSelect = async (options: SpotifySourceOptions) => {
    setSelectedSource(options);
    setIsLoadingTracks(true);

    try {
      if (options.sourceType === 'top-tracks') {
        const tracks = await getUserTopTracks();
        setTopTracks(tracks);
        toast.success("Loaded your top tracks!");
      } else if (options.sourceType === 'playlist' && options.playlistId) {
        const tracks = await getPlaylistTracks(options.playlistId);
        setTopTracks(tracks);
        toast.success("Loaded tracks from your playlist!");
      }
      setSourceSelected(true);
    } catch (error) {
      console.error('Error loading tracks:', error);
      toast.error("Failed to load tracks. Please try again.");
    } finally {
      setIsLoadingTracks(false);
    }
  };

  const handleImageSelected = async (file: File) => {
    setSelectedImage(file);
    setIsAnalyzing(true);
    setHasAnalyzedImage(false); // reset first
  
    try {
      const analysis = await analyzeImage(file);
      setMoodAnalysis(analysis);
      setHasAnalyzedImage(true); // ✅ set after success
      toast.success("Image analysis complete!");
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error("Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGeneratePlaylist = async () => {
    if (!moodAnalysis || !isSpotifyLoggedIn || topTracks.length === 0) {
      toast.error("Please complete image analysis and connect to Spotify first.");
      return;
    }
  
    setIsGeneratingPlaylist(true);
  
    try {
      const tracks = await generatePlaylist(moodAnalysis, topTracks); // ✅ simplified
      setGeneratedTracks(tracks);
  
      const playlistLink = await createSpotifyPlaylist(tracks, moodAnalysis.mood);
      setPlaylistUrl(playlistLink);
  
      toast.success("Your recommendations are ready!");
    } catch (error) {
      console.error('Error generating playlist:', error);
      toast.error("Failed to generate recommendations. Please try again.");
    } finally {
      setIsGeneratingPlaylist(false);
    }
  };

  const showSourceSelection = isSpotifyLoggedIn && !sourceSelected;
  const showImageUpload = sourceSelected;
  const showMoodAnalysis = moodAnalysis !== null;
  const showPlaylistGenerator = showMoodAnalysis && topTracks.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-theme-navy">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12 animate-fade-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            <span className="gradient-text">Match Your Mood</span> <br className="md:hidden" />
            <span className="text-theme-gray">with Music</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect your Spotify, choose an image, and we'll create the perfect playlist
            to match the vibe.
          </p>
        </div>

        <div className="space-y-16">
          <section>
            <SpotifyAuth 
              onLogin={handleSpotifyLogin}
              isLoggedIn={isSpotifyLoggedIn}
              playlists={playlists}
              isLoadingPlaylists={isLoadingPlaylists}
              onSourceSelect={showSourceSelection ? handleSourceSelect : undefined}
            />
          </section>

          {showImageUpload && (
            <section>
              <ImageUpload 
                onImageSelected={handleImageSelected}
                isAnalyzing={isAnalyzing}
              />
            </section>
          )}

          {(showMoodAnalysis || isAnalyzing) && (
            <section>
              <MoodAnalysis 
                result={moodAnalysis}
                isLoading={isAnalyzing}
              />
            </section>
          )}

       {/* Recommended Tracks Section - Only show after mood analysis is done */}
{moodAnalysis && (
  <section>
    {isGeneratingPlaylist ? (
      // ✨ Shimmer track-style loading with controlled width
      <div className="space-y-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center space-x-4 bg-muted p-4 rounded-xl shadow max-w-xl mx-auto"
          >
            <div className="w-16 h-16 bg-gray-300 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4" />
              <div className="h-4 bg-gray-300 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    ) : generatedTracks.length > 0 ? (
      // ✅ Show tracks when available
      <TopTracks 
        tracks={generatedTracks}
        isLoading={false}
      />
    ) : (
      // ❌ Fallback message
      <div className="text-center text-red-500 text-lg font-medium mt-4">
        Failed to generate recommendations. Please try again.
      </div>
    )}
  </section>
)}    


          {(showPlaylistGenerator || isGeneratingPlaylist) && (
            <section>
              <PlaylistGenerator 
                tracks={generatedTracks}
                isGenerating={isGeneratingPlaylist}
                playlistUrl={playlistUrl}
                onGeneratePlaylist={handleGeneratePlaylist}
              />
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
