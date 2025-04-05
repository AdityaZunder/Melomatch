
import React, { useState } from 'react';
import { Music, LogIn, ListMusic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface SpotifyPlaylist {
  id: string;
  name: string;
}

export interface SpotifySourceOptions {
  sourceType: 'top-tracks' | 'playlist';
  playlistId?: string;
}

interface SpotifyAuthProps {
  onLogin: () => void;
  isLoggedIn: boolean;
  playlists?: SpotifyPlaylist[];
  isLoadingPlaylists?: boolean;
  onSourceSelect?: (options: SpotifySourceOptions) => void;
}

const SpotifyAuth: React.FC<SpotifyAuthProps> = ({ 
  onLogin, 
  isLoggedIn, 
  playlists = [],
  isLoadingPlaylists = false,
  onSourceSelect
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [sourceType, setSourceType] = useState<'top-tracks' | 'playlist'>('top-tracks');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('');
  
  const handleSourceTypeChange = (value: 'top-tracks' | 'playlist') => {
    setSourceType(value);
  };
  
  const handlePlaylistChange = (value: string) => {
    setSelectedPlaylistId(value);
  };
  
  const handleContinue = () => {
    if (onSourceSelect) {
      onSourceSelect({
        sourceType,
        ...(sourceType === 'playlist' ? { playlistId: selectedPlaylistId } : {})
      });
    }
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-2xl font-bold mb-2">Connect with Spotify</h2>
        <p className="text-muted-foreground">
          Connect your Spotify account to access your top tracks and create playlists.
        </p>
      </div>
      
      <div 
        className={cn(
          "glass-panel rounded-xl p-8 text-center animate-fade-up",
          isLoggedIn ? "border-green-500/20 bg-green-50/30" : ""
        )}
        style={{ animationDelay: '0.2s' }}
      >
        <div className="flex flex-col items-center">
          {isLoggedIn ? (
            <>
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <Music className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-1 text-green-600">
                Connected to Spotify
              </h3>
              <p className="text-muted-foreground mb-6">
                Choose your music source for recommendations:
              </p>
              
              <div className="w-full max-w-md">
                <RadioGroup 
                  defaultValue="top-tracks" 
                  className="grid grid-cols-1 gap-4 mb-6"
                  onValueChange={(value) => handleSourceTypeChange(value as 'top-tracks' | 'playlist')}
                >
                  <div className="flex items-start space-x-3 space-y-0 border border-border p-4 rounded-lg transition-all hover:border-melo-purple/50 hover:bg-melo-purple/5">
                    <RadioGroupItem value="top-tracks" id="top-tracks" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="top-tracks" className="font-medium flex items-center gap-2">
                        <Music size={18} className="text-melo-purple" />
                        Your Top 50 Recent Songs
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Use your most played tracks for recommendations
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 space-y-0 border border-border p-4 rounded-lg transition-all hover:border-melo-purple/50 hover:bg-melo-purple/5">
                    <RadioGroupItem value="playlist" id="playlist" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="playlist" className="font-medium flex items-center gap-2">
                        <ListMusic size={18} className="text-melo-purple" />
                        Select a Playlist
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Choose from your Spotify playlists
                      </p>
                      
                      {sourceType === 'playlist' && (
                        <div className="mt-4">
                          {isLoadingPlaylists ? (
                            <div className="h-10 bg-melo-purple/10 animate-pulse rounded-md"></div>
                          ) : (
                            <Select 
                              value={selectedPlaylistId}
                              onValueChange={handlePlaylistChange}
                              disabled={playlists.length === 0}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a playlist" />
                              </SelectTrigger>
                              <SelectContent>
                                {playlists.map((playlist) => (
                                  <SelectItem key={playlist.id} value={playlist.id}>
                                    {playlist.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </RadioGroup>
                
                <button 
                  onClick={handleContinue}
                  disabled={sourceType === 'playlist' && !selectedPlaylistId}
                  className={cn(
                    "w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all",
                    "bg-gradient-to-r from-melo-purple to-melo-blue text-white shadow-md hover:shadow-lg",
                    (sourceType === 'playlist' && !selectedPlaylistId) ? "opacity-50 cursor-not-allowed" : ""
                  )}
                >
                  <ListMusic size={18} />
                  Continue
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-melo-purple/10 flex items-center justify-center mb-4">
                <Music className="w-8 h-8 text-melo-purple" />
              </div>
              <h3 className="text-lg font-semibold mb-1">
                Connect Your Spotify Account
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                We'll use this to access your listening preferences and create custom playlists for you.
              </p>
              <button
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={onLogin}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#1DB954] hover:bg-[#1DB954]/90 text-white font-medium transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <div className="relative w-5 h-5">
                  <LogIn 
                    size={20} 
                    className={cn(
                      "absolute inset-0 transition-all duration-300",
                      isHovering ? "opacity-0 translate-x-2" : "opacity-100"
                    )}
                  />
                  <svg 
                    viewBox="0 0 24 24" 
                    width="20" 
                    height="20" 
                    className={cn(
                      "absolute inset-0 transition-all duration-300 fill-current",
                      isHovering ? "opacity-100" : "opacity-0 -translate-x-2"
                    )}
                  >
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                </div>
                <span>Connect with Spotify</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpotifyAuth;
