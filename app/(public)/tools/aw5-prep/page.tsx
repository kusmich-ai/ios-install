'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function AW5PrepPage() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(426); // 7:06 = 426 seconds
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

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
    const onLoadedMetadata = () => setDuration(audio.duration || 426);
    const onEnded = () => {
      setIsPlaying(false);
      setIsComplete(true);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!hasStarted) {
      setHasStarted(true);
    }

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src="/audio/AW5Prep.mp3"
        preload="auto"
      />

      {/* Main container */}
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[#ff9e19] text-sm font-medium tracking-widest uppercase mb-2">
            Awaken with 5
          </p>
          <h1 className="text-white text-2xl md:text-3xl font-light">
            AW5 Core Prep Ritual
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            7 minute guided preparation protocol
          </p>
        </div>

        {/* Completion State */}
        {isComplete ? (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#ff9e19]/10 flex items-center justify-center">
              <span className="text-3xl">✓</span>
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
                className="w-20 h-20 rounded-full bg-[#ff9e19] flex items-center justify-center hover:bg-[#ffb347] transition-colors shadow-lg shadow-[#ff9e19]/20"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-black" fill="black" />
                ) : (
                  <Play className="w-8 h-8 text-black ml-1" fill="black" />
                )}
              </button>
            </div>

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
      <div className="absolute bottom-6 text-center">
        <p className="text-gray-600 text-xs">
          Part of the{' '}
          <a
            href="https://unbecoming.app"
            className="text-[#ff9e19] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            IOS System
          </a>
        </p>
      </div>
    </div>
  );
}
