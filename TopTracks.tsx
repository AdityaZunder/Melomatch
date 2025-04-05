
import React from 'react';
import { cn } from '@/lib/utils';

export interface Track {
  id: string;
  name: string;
  artist: string;
  albumArt: string;
}

interface TopTracksProps {
  tracks: Track[];
  isLoading: boolean;
}

const TopTracks: React.FC<TopTracksProps> = ({ tracks, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-6 animate-fade-up">
          <h2 className="text-2xl font-bold mb-2">Your Top Tracks</h2>
          <p className="text-muted-foreground">
            Loading your favorite music...
          </p>
        </div>
        <div className="glass-panel rounded-xl p-6 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-2 mb-2">
              <div className="bg-melo-purple/10 w-12 h-12 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-melo-purple/20 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-melo-purple/10 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!tracks.length) return null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-2xl font-bold mb-2">Your Top Tracks</h2>
        <p className="text-muted-foreground">
          Based on your recent listening history.
        </p>
      </div>
      
      <div 
        className="glass-panel rounded-xl p-4 animate-fade-up hover-scale"
        style={{ animationDelay: '0.2s' }}
      >
        <ul className="divide-y divide-border">
          {tracks.map((track, index) => (
            <li 
              key={track.id}
              className={cn(
                "flex items-center gap-4 p-3 transition-all duration-300 hover:bg-melo-purple/5 rounded-lg",
                "animate-fade-in"
              )}
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <div className="flex-shrink-0 relative">
                <div className="absolute -left-3 -top-1 w-6 h-6 rounded-full bg-melo-purple flex items-center justify-center text-white text-sm font-bold">
                  {index + 1}
                </div>
                <img 
                  src={track.albumArt} 
                  alt={track.name} 
                  className="w-12 h-12 rounded-md object-cover shadow-md"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium truncate">{track.name}</h4>
                <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TopTracks;
