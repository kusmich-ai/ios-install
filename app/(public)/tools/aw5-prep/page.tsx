'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, ArrowLeft, Loader2 } from 'lucide-react';

export default function AW5PrepPage() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(426); // 7:06 = 426 seconds
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Format time as M:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    
    const onLoadedMetadata = () => {
      console.log('[AW5Prep] Audio metadata loaded, duration:', audio.duration);
      setDuration(audio.duration || 426);
    };
    
    const onCanPlay = () => {
      console.log('[AW5Prep] Audio can play');
      setIsAudioReady(true);
      setIsLoading(false);
      setAudioError(null);
    };
    
    const onEnded = () => {
      console.log('[AW5Prep] Audio ended');
      setIsPlaying(false);
      setIsComplete(true);
    };
    
    const onPlay = () => {
      console.log('[AW5Prep] Audio playing');
      setIsPlaying(true);
      setIsLoading(false);
    };
    
    const onPause = () => {
      console.log('[AW5Prep] Audio paused');
      setIsPlaying(false);
    };
    
    const onError = (e: Event) => {
      const target = e.target as HTMLAudioElement;
      let errorMessage = 'Unable to load audio';
      
      if (target.error) {
        switch (target.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = 'Audio loading was aborted';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error - check your connection';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = 'Audio file could not be decoded';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Audio format not supported';
            break;
        }
      }
      
      console.error('[AW5Prep] Audio error:', errorMessage, target.error);
      setAudioError(errorMessage);
      setIsLoading(false);
    };
    
    const onWaiting = () => {
      console.log('[AW5Prep] Audio buffering...');
      // Only show loading if already playing (buffering mid-playback)
      if (isPlaying) {
        setIsLoading(true);
      }
    };
    
    const onPlaying = () => {
      console.log('[AW5Prep] Audio started playing');
      setIsLoading(false);
      setIsPlaying(true);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
    };
  }, [isPlaying]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) {
      console.error('[AW5Prep] No audio element');
      return;
    }

    if (audioError) {
      // Try to reload on error
      console.log('[AW5Prep] Retrying audio load...');
      setAudioError(null);
      setIsLoading(true);
      audio.load();
      
      // Set a timeout to stop loading if it takes too long
      setTimeout(() => {
        if (!isAudioReady && !audioError) {
          setIsLoading(false);
        }
      }, 10000);
      return;
    }

    if (!hasStarted) {
      setHasStarted(true);
    }

    if (isPlaying) {
      audio.pause();
    } else {
      try {
        setIsLoading(true);
        console.log('[AW5Prep] Attempting to play...');
        
        // Set a timeout to stop spinner if play takes too long
        const loadingTimeout = setTimeout(() => {
          if (!isPlaying) {
            console.log('[AW5Prep] Play timeout - stopping spinner');
            setIsLoading(false);
          }
        }, 5000);
        
        await audio.play();
        clearTimeout(loadingTimeout);
        console.log('[AW5Prep] Play successful');
      } catch (error) {
        console.error('[AW5Prep] Play failed:', error);
        setAudioError('Tap again to play');
        setIsLoading(false);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleRestart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = 0;
    setCurrentTime(0);
    setIsComplete(false);
    setIsPlaying(false);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Show back button when not actively playing
  const showBackButton = !hasStarted || isComplete;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      {/* Audio element with explicit MIME type */}
      <audio
        ref={audioRef}
        preload="auto"
        playsInline
      >
        <source src="/audio/AW5Prep.mp3" type="audio/mpeg" />
      </audio>

      {/* Back Button - Top Left */}
      {showBackButton && (
        <a 
          href="https://www.unbecoming.app/tools/awaken-with-5"
          className="absolute top-6 left-6 flex items-center gap-2 text-gray-500 hover:text-[#ff9e19] transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Guide</span>
        </a>
      )}

      {/* Main container */}
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[#ff9e19] text-sm font-medium tracking-widest uppercase mb-2">
            Awaken with 5
          </p>
          <h1 className="text-white text-2xl md:text-3xl font-light">
            Daily Core Ritual
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            7 minute guided preparation
          </p>
        </div>

        {/* Completion State */}
        {isComplete ? (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#ff9e19]/10 flex items-center justify-center">
              <span className="text-3xl text-[#ff9e19]">✓</span>
            </div>
            <h2 className="text-white text-xl mb-2">Ritual Complete</h2>
            <p className="text-gray-400 text-sm mb-8">
              Your nervous system is primed and ready.
            </p>
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border border-gray-700 text-gray-300 rounded-full hover:border-[#ff9e19] hover:text-[#ff9e19] transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Play Again
            </button>
          </div>
        ) : (
          <>
            {/* Play/Pause Button */}
            <div className="flex justify-center mb-8">
              <button
                onClick={togglePlayPause}
                disabled={isLoading && !audioError}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors shadow-lg shadow-[#ff9e19]/20 ${
                  audioError 
                    ? 'bg-red-500/80 hover:bg-red-500' 
                    : 'bg-[#ff9e19] hover:bg-[#ffb347]'
                } ${isLoading && !audioError ? 'opacity-70' : ''}`}
              >
                {isLoading && !audioError ? (
                  <Loader2 className="w-8 h-8 text-black animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-8 h-8 text-black" fill="black" />
                ) : (
                  <Play className="w-8 h-8 text-black ml-1" fill="black" />
                )}
              </button>
            </div>

            {/* Error Message */}
            {audioError && (
              <p className="text-center text-red-400 text-sm mb-4">
                {audioError}
              </p>
            )}

            {/* Progress Section */}
            <div className="space-y-3">
              {/* Progress Bar */}
              <div className="relative">
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ff9e19] transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {/* Invisible range input for seeking */}
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {/* Time Display */}
              <div className="flex justify-between text-sm text-gray-500">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Instructions (before started) */}
            {!hasStarted && (
              <div className="mt-12 text-center">
                <p className="text-gray-500 text-sm">
                  Find a quiet space. Sit or stand comfortably.<br />
                  Press play when ready.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {showBackButton && (
        <div className="absolute bottom-6 text-center">
          <p className="text-gray-600 text-xs">
            Part of the{' '}
            <a
              href="https://awakenwith5.com"
              className="text-[#ff9e19]/60 hover:text-[#ff9e19] transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Awaken with 5
            </a>
            {' '}experience
          </p>
        </div>
      )}
    </div>
  );
}
