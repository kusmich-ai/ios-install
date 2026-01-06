'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, ArrowLeft, Loader2 } from 'lucide-react';

export default function AW5PrepPage() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(426);
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setIsPlaying(!audio.paused && !audio.ended);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setIsComplete(true);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!hasStarted) {
      setHasStarted(true);
    }

    if (!audio.paused) {
      audio.pause();
    } else {
      setIsLoading(true);
      audio.play()
        .then(() => setIsLoading(false))
        .catch(() => setIsLoading(false));
    }
  };

  const handleRestart = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
    }
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
        preload="auto"
        playsInline
      >
        <source src="/tools/audio/AW5Prep.mp3" type="audio/mpeg" />
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
                disabled={isLoading}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors shadow-lg shadow-[#ff9e19]/20 bg-[#ff9e19] hover:bg-[#ffb347] ${isLoading ? 'opacity-80' : ''}`}
              >
                {isLoading ? (
                  <Loader2 className="w-8 h-8 text-black animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-8 h-8 text-black" fill="black" />
                ) : (
                  <Play className="w-8 h-8 text-black ml-1" fill="black" />
                )}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#ff9e19] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Time Display */}
            <div className="flex justify-between text-sm text-gray-500 mb-8">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Instructions */}
            {!hasStarted && (
              <div className="text-center">
                <p className="text-gray-400 text-sm">
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
