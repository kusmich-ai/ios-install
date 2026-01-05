'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, ArrowLeft } from 'lucide-react';

export default function AW5PrepPage() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(426);
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readyState, setReadyState] = useState(0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Single useEffect for all audio events - no dependencies to avoid re-running
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const syncPlayState = () => {
      // Always sync with actual audio state
      setIsPlaying(!audio.paused && !audio.ended);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setReadyState(audio.readyState);
      syncPlayState();
    };

    const handleLoadedMetadata = () => {
      console.log('[Audio] Metadata loaded, duration:', audio.duration, 'readyState:', audio.readyState);
      setReadyState(audio.readyState);
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
      setError(null);
    };

    const handleCanPlay = () => {
      console.log('[Audio] Can play, readyState:', audio.readyState);
      setReadyState(audio.readyState);
      setError(null);
    };

    const handlePlay = () => {
      console.log('[Audio] Play event, readyState:', audio.readyState);
      setReadyState(audio.readyState);
      setIsPlaying(true);
    };

    const handlePause = () => {
      console.log('[Audio] Pause event');
      setIsPlaying(false);
    };

    const handleEnded = () => {
      console.log('[Audio] Ended');
      setIsPlaying(false);
      setIsComplete(true);
    };

    const handleError = () => {
      console.error('[Audio] Error:', audio.error);
      setIsPlaying(false);
      setReadyState(audio.readyState);
      
      if (audio.error) {
        switch (audio.error.code) {
          case MediaError.MEDIA_ERR_NETWORK:
            setError('Network error - check connection');
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            setError('Audio format not supported');
            break;
          default:
            setError('Unable to play audio');
        }
      } else {
        setError('Unable to play audio');
      }
    };

    const handleStalled = () => {
      console.warn('[Audio] Stalled - buffering issues');
      setReadyState(audio.readyState);
    };

    const handleWaiting = () => {
      console.log('[Audio] Waiting for data...');
      setReadyState(audio.readyState);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('waiting', handleWaiting);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('waiting', handleWaiting);
    };
  }, []);

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    setError(null);

    if (!hasStarted) {
      setHasStarted(true);
    }

    // Check actual audio state, not React state
    if (!audio.paused) {
      console.log('[Action] Pausing...');
      audio.pause();
    } else {
      console.log('[Action] Playing...');
      try {
        await audio.play();
        console.log('[Action] Play promise resolved');
        
        // Double-check it's actually playing after a moment
        setTimeout(() => {
          if (audio.paused && !audio.ended) {
            console.warn('[Action] Audio paused unexpectedly');
            setIsPlaying(false);
            setError('Tap again to play');
          }
        }, 500);
      } catch (err) {
        console.error('[Action] Play failed:', err);
        setIsPlaying(false);
        setError('Tap to play');
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
    setHasStarted(false);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const showBackButton = !hasStarted || isComplete;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      {/* Audio element */}
      <audio
        ref={audioRef}
        preload="metadata"
        playsInline
      >
        <source src="/audio/AW5Prep.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {/* Back Button */}
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
                onClick={handlePlayPause}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors shadow-lg shadow-[#ff9e19]/20 ${
                  error 
                    ? 'bg-red-500/80 hover:bg-red-500' 
                    : 'bg-[#ff9e19] hover:bg-[#ffb347]'
                }`}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-black" fill="black" />
                ) : (
                  <Play className="w-8 h-8 text-black ml-1" fill="black" />
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-center text-red-400 text-sm mb-4">
                {error}
              </p>
            )}

            {/* Progress Section */}
            <div className="space-y-3">
              <div className="relative">
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ff9e19] transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              <div className="flex justify-between text-sm text-gray-500">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Instructions */}
            {!hasStarted && (
              <div className="mt-12 text-center">
                <p className="text-gray-500 text-sm">
                  Find a quiet space. Sit or stand comfortably.<br />
                  Press play when ready.
                </p>
              </div>
            )}

            {/* Debug info - TEMPORARY - remove after testing */}
            {hasStarted && (
              <div className="mt-8 p-3 bg-gray-900 rounded text-xs text-gray-500 font-mono">
                <p>State: {isPlaying ? 'PLAYING' : 'PAUSED'}</p>
                <p>Time: {currentTime.toFixed(1)}s / {duration.toFixed(1)}s</p>
                <p>Ready: {readyState} (need 2+)</p>
                {error && <p className="text-red-400">Error: {error}</p>}
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
