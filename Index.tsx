
import React, { useState } from 'react';
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
  // Image and analysis state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [moodAnalysis, setMoodAnalysis] = useState<MoodAnalysisResult | null>(null);
  
  // Spotify state
  const [isSpotifyLoggedIn, setIsSpotifyLoggedIn] = useState(false);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [selectedSource, setSelectedSource] = useState<SpotifySourceOptions | null>(null);
  const [sourceSelected, setSourceSelected] = useState(false);
  
  // Playlist state
  const [isGeneratingPlaylist, setIsGeneratingPlaylist] = useState(false);
  const [generatedTracks, setGeneratedTracks] = useState<GeneratedTrack[]>([]);
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);

  const [searchParams] = useSearchParams();


  
  // Handle Spotify login
  const handleSpotifyLogin = () => {
    try {
      authenticateWithSpotify(); // 🔁 Redirects to backend `/api/login`
    } catch (error) {
      console.error("Error authenticating with Spotify:", error);
      toast.error("Failed to connect to Spotify. Please try again.");
    }
  };
  
  // 👇 This goes below the handleSpotifyLogin definition (inside your component)
  React.useEffect(() => {
    const successParam = searchParams.get("success");
  
    if (successParam === "true") {
      setIsSpotifyLoggedIn(true);
      toast.success("Connected to Spotify!");
  
      // Load user's playlists after successful login
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
  // Handle source selection (top tracks or playlist)
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
  
  // Handle image upload and analysis
  const handleImageSelected = async (file: File) => {
    setSelectedImage(file);
    setIsAnalyzing(true);
    
    try {
      const analysis = await analyzeImage(file);
      setMoodAnalysis(analysis);
      toast.success("Image analysis complete!");
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error("Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Handle playlist generation
  const handleGeneratePlaylist = async () => {
    if (!moodAnalysis || !isSpotifyLoggedIn || topTracks.length === 0) {
      toast.error("Please complete image analysis and connect to Spotify first.");
      return;
    }
    
    setIsGeneratingPlaylist(true);
    
    try {
      // Generate tracks based on mood and user's selected tracks (limited to 7)
      const tracks = await generatePlaylist(moodAnalysis, topTracks, 7);
      setGeneratedTracks(tracks);
      
      // Create a Spotify playlist with the generated tracks
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
  
  // Determine which steps to show based on current state
  const showSpotifyAuth = true; // Always show this first
  const showSourceSelection = isSpotifyLoggedIn && !sourceSelected;
  const showImageUpload = sourceSelected; // Show image upload after selecting source
  const showMoodAnalysis = moodAnalysis !== null;
  // Only show top tracks after the mood analysis is complete
  const showTopTracks = sourceSelected && topTracks.length > 0 && moodAnalysis !== null;
  const showPlaylistGenerator = showTopTracks && moodAnalysis !== null;
  
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
          {/* Spotify Auth Section - Step 1 */}
          <section>
            <SpotifyAuth 
              onLogin={handleSpotifyLogin}
              isLoggedIn={isSpotifyLoggedIn}
              playlists={playlists}
              isLoadingPlaylists={isLoadingPlaylists}
              onSourceSelect={showSourceSelection ? handleSourceSelect : undefined}
            />
          </section>
          
          {/* Image Upload Section - Step 2 after Spotify connection */}
          {showImageUpload && (
            <section>
              <ImageUpload 
                onImageSelected={handleImageSelected}
                isAnalyzing={isAnalyzing}
              />
            </section>
          )}
          
          {/* Mood Analysis Section - After image upload */}
          {(showMoodAnalysis || isAnalyzing) && (
            <section>
              <MoodAnalysis 
                result={moodAnalysis}
                isLoading={isAnalyzing}
              />
            </section>
          )}
          
          {/* Top Tracks Section - Only show after mood analysis */}
          {(showTopTracks || (isLoadingTracks && moodAnalysis !== null)) && (
            <section>
              <TopTracks 
                tracks={topTracks}
                isLoading={isLoadingTracks}
              />
            </section>
          )}
          
          {/* Playlist Generator Section - Final step */}
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
