'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

// ============================================
// AWARENESS REP - 2 MIN GUIDED AUDIO
// Public page at /awareness
// Audio file: /audio/AwarenessRep.mp3
// ============================================

const AUDIO_FILE = '/audio/AwarenessRep.mp3';

export default function AwarenessPage() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(120); // Default 2 mins, will update from metadata
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Format seconds to mm:ss
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

  const handleMuteToggle = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = !audio.muted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !hasStarted) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * duration;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        preload="auto"
        playsInline
      >
        <source src={AUDIO_FILE} type="audio/mpeg" />
      </audio>

      {/* Main container */}
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-light text-[#f5f2ec] tracking-wide mb-3">
            Awareness Rep
          </h1>
          <p className="text-[#f5f2ec]/50 text-sm font-light">
            2-minute meta-awareness practice
          </p>
        </div>

        {/* Visualization orb */}
        <div className="flex justify-center mb-12">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Outer glow ring */}
            <div 
              className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                isPlaying 
                  ? 'bg-[#ff9e19]/10 scale-110' 
                  : 'bg-[#ff9e19]/5 scale-100'
              }`}
              style={{
                filter: 'blur(20px)',
              }}
            />
            
            {/* Main orb */}
            <div 
              className={`relative w-32 h-32 rounded-full transition-all duration-700 ${
                isPlaying ? 'scale-100' : 'scale-95'
              }`}
              style={{
                background: isPlaying 
                  ? 'radial-gradient(circle at 30% 30%, #ff9e19, #cc7a10)'
                  : 'radial-gradient(circle at 30% 30%, #ff9e19/60, #cc7a10/40)',
                boxShadow: isPlaying 
                  ? '0 0 60px rgba(255, 158, 25, 0.4), inset 0 0 30px rgba(255, 255, 255, 0.1)'
                  : '0 0 30px rgba(255, 158, 25, 0.2)',
              }}
            />
            
            {/* Inner highlight */}
            <div 
              className="absolute w-24 h-24 rounded-full"
              style={{
                background: 'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.15), transparent 60%)',
              }}
            />
          </div>
        </div>

        {/* Completion state */}
        {isComplete ? (
          <div className="text-center space-y-6">
            <div className="text-[#f5f2ec]/70 text-sm font-light">
              Practice complete
            </div>
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full
                         bg-[#ff9e19]/10 text-[#ff9e19] text-sm font-medium
                         hover:bg-[#ff9e19]/20 transition-all duration-300"
            >
              <RotateCcw size={16} />
              Practice Again
            </button>
          </div>
        ) : (
          <>
            {/* Progress bar */}
            <div 
              className="h-1 bg-[#f5f2ec]/10 rounded-full mb-6 cursor-pointer overflow-hidden"
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-[#ff9e19] rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Time display */}
            <div className="flex justify-between text-xs text-[#f5f2ec]/40 mb-8 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              {/* Mute button */}
              <button
                onClick={handleMuteToggle}
                className="p-3 rounded-full text-[#f5f2ec]/40 hover:text-[#f5f2ec]/70 
                           hover:bg-[#f5f2ec]/5 transition-all duration-200"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>

              {/* Play/Pause button */}
              <button
                onClick={handlePlayPause}
                disabled={isLoading}
                className="w-16 h-16 rounded-full bg-[#ff9e19] text-[#0a0a0a] 
                           flex items-center justify-center
                           hover:bg-[#ffae3d] active:scale-95 
                           transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause size={24} fill="currentColor" />
                ) : (
                  <Play size={24} fill="currentColor" className="ml-1" />
                )}
              </button>

              {/* Restart button */}
              <button
                onClick={handleRestart}
                className="p-3 rounded-full text-[#f5f2ec]/40 hover:text-[#f5f2ec]/70 
                           hover:bg-[#f5f2ec]/5 transition-all duration-200"
              >
                <RotateCcw size={20} />
              </button>
            </div>
          </>
        )}

        {/* Instructions (only show before starting) */}
        {!hasStarted && (
          <div className="mt-12 text-center">
            <div className="text-[#f5f2ec]/30 text-xs font-light leading-relaxed max-w-xs mx-auto">
              Notice whatever is here — sounds, sensations, thoughts.
              <br /><br />
              You're not trying to change anything. Just notice that you're noticing.
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center">
          <a 
            href="https://www.unbecoming.app"
            className="text-[#f5f2ec]/20 text-xs hover:text-[#f5f2ec]/40 transition-colors"
          >
            unbecoming.app
          </a>
        </div>
      </div>
    </div>
  );
}
