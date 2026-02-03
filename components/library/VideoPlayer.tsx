// components/library/VideoPlayer.tsx
// Vimeo player wrapper with progress tracking

'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, AlertCircle } from 'lucide-react';

interface VideoPlayerProps {
  vimeoId: string;
  tutorialId: string;
  source?: 'library' | 'ai_suggestion' | 'modal';
  onProgress?: (percent: number) => void;
  onComplete?: () => void;
  autoplay?: boolean;
}

export default function VideoPlayer({ 
  vimeoId, 
  tutorialId,
  source = 'library',
  onProgress,
  onComplete,
  autoplay = false
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const lastSavedPercent = useRef<number>(0);
  
  // Check if vimeoId is a placeholder
  const isPlaceholder = !vimeoId || vimeoId === 'VIMEO_ID_HERE';

  useEffect(() => {
    if (isPlaceholder) {
      setIsLoading(false);
      return;
    }

    // Dynamically import Vimeo player
    const initPlayer = async () => {
      try {
        const Player = (await import('@vimeo/player')).default;
        
        if (!containerRef.current) return;
        
        // Clear any existing player
        containerRef.current.innerHTML = '';
        
        // Initialize Vimeo player
        playerRef.current = new Player(containerRef.current, {
          id: parseInt(vimeoId),
          responsive: true,
          dnt: true, // Do Not Track for privacy
          autoplay: autoplay,
        });
        
        // Handle player ready
        playerRef.current.on('loaded', () => {
          setIsLoading(false);
          setError(null);
        });
        
        // Handle errors
        playerRef.current.on('error', (err: any) => {
          console.error('Vimeo player error:', err);
          setError('Unable to load video. Please try again later.');
          setIsLoading(false);
        });
        
        // Track progress
        playerRef.current.on('timeupdate', async (data: { percent: number; seconds: number }) => {
          const percent = Math.round(data.percent * 100);
          
          // Call onProgress callback
          onProgress?.(percent);
          
          // Save progress every 10% (avoid too many API calls)
          if (percent >= lastSavedPercent.current + 10) {
            lastSavedPercent.current = Math.floor(percent / 10) * 10;
            // Progress saving is handled by the parent component
          }
        });
        
        // Track play start
        playerRef.current.on('play', () => {
          if (!hasStarted) {
            setHasStarted(true);
          }
        });
        
        // Track completion (video ended)
        playerRef.current.on('ended', () => {
          onComplete?.();
        });
        
      } catch (err) {
        console.error('Error initializing Vimeo player:', err);
        setError('Failed to initialize video player.');
        setIsLoading(false);
      }
    };

    initPlayer();
    
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [vimeoId, tutorialId, source, autoplay, onProgress, onComplete, isPlaceholder, hasStarted]);
  
  // Placeholder state (no video uploaded yet)
  if (isPlaceholder) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-400">
        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
          <Play className="w-8 h-8" />
        </div>
        <p className="text-sm">Video coming soon</p>
        <p className="text-xs text-gray-500 mt-1">Content is being prepared</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-400">
        <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-sm text-red-400">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="w-8 h-8 border-2 border-[#ff9e19] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Vimeo player container */}
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ opacity: isLoading ? 0 : 1 }}
      />
    </div>
  );
}
