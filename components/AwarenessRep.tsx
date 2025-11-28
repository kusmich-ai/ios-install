"use client";
import React, { useState, useEffect, useRef } from "react";

// ============================================================================
// AWARENESS REP - 3:35 GUIDED MEDITATION
// A minimal, calming audio experience with subtle visual feedback
// ============================================================================

interface AwarenessRepProps {
  onComplete?: () => void; // Called when audio finishes
}

export default function AwarenessRep({ onComplete }: AwarenessRepProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(215); // Default 3:35 (215 seconds)
  const [isComplete, setIsComplete] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle audio events
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoaded(true);
      console.log('[AwarenessRep] Audio loaded, duration:', audioRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setIsComplete(true);
    console.log('[AwarenessRep] Audio ended, calling onComplete');
    if (onComplete) {
      onComplete();
    }
  };

  const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    console.error("[AwarenessRep] Audio error:", e);
    setAudioError("Unable to load audio. Please check the file exists at /audio/AwarenessRep.mp3");
  };

  const handleCanPlay = () => {
    setIsLoaded(true);
    setAudioError(null);
  };

  const togglePlayPause = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setAudioError(null);
      } catch (err) {
        console.error("[AwarenessRep] Playback failed:", err);
        setAudioError("Playback failed. Tap to try again.");
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const timeRemaining = Math.max(0, duration - currentTime);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Pulse animation speed based on a gentle rhythm
  const pulseScale = isPlaying 
    ? 1 + Math.sin(Date.now() / 2000) * 0.08 // Slow, subtle pulse
    : 1;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* HTML Audio Element - more reliable than Audio API */}
      <audio
        ref={audioRef}
        src="/audio/AwarenessRep.mp3"
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handleError}
        onCanPlay={handleCanPlay}
      />

      {/* Ambient background glow */}
      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 158, 25, 0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 300,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#F5F2EC",
            margin: 0,
            opacity: 0.9,
          }}
        >
          Awareness Rep
        </h1>
        <p
          style={{
            fontSize: "0.85rem",
            color: "rgba(245, 242, 236, 0.5)",
            marginTop: "0.5rem",
            letterSpacing: "0.05em",
          }}
        >
          {isComplete ? "Session Complete" : isLoaded ? "Rest in awareness" : "Loading audio..."}
        </p>
      </div>

      {/* Main visual - expanding rings */}
      <div
        style={{
          position: "relative",
          width: "280px",
          height: "280px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Outer ring */}
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: `1px solid rgba(255, 158, 25, ${isPlaying ? 0.2 : 0.1})`,
            transform: `scale(${isPlaying ? pulseScale * 1.1 : 1})`,
            transition: "transform 2s ease-in-out, border-color 0.5s ease",
          }}
        />

        {/* Middle ring */}
        <div
          style={{
            position: "absolute",
            width: "75%",
            height: "75%",
            borderRadius: "50%",
            border: `1px solid rgba(255, 158, 25, ${isPlaying ? 0.3 : 0.15})`,
            transform: `scale(${isPlaying ? pulseScale : 1})`,
            transition: "transform 2s ease-in-out, border-color 0.5s ease",
          }}
        />

        {/* Inner circle with play/pause */}
        <button
          onClick={togglePlayPause}
          disabled={isComplete}
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            border: `2px solid ${isComplete ? "#10b981" : "#ff9e19"}`,
            backgroundColor: isComplete 
              ? "rgba(16, 185, 129, 0.1)" 
              : "rgba(255, 158, 25, 0.1)",
            cursor: isComplete ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
            transform: `scale(${isPlaying ? pulseScale * 0.95 : 1})`,
          }}
          aria-label={isComplete ? "Complete" : isPlaying ? "Pause" : "Play"}
        >
          {isComplete ? (
            // Checkmark icon
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : isPlaying ? (
            // Pause icon
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="#ff9e19"
            >
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            // Play icon
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="#ff9e19"
            >
              <polygon points="8,5 19,12 8,19" />
            </svg>
          )}
        </button>
      </div>

      {/* Timer display */}
      <div
        style={{
          marginTop: "3rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "2.5rem",
            fontWeight: 200,
            color: isComplete ? "#10b981" : "#F5F2EC",
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "0.05em",
          }}
        >
          {isComplete ? "Done" : formatTime(timeRemaining)}
        </div>
        
        {!isComplete && (
          <div
            style={{
              fontSize: "0.75rem",
              color: "rgba(245, 242, 236, 0.4)",
              marginTop: "0.25rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            remaining
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          width: "60%",
          maxWidth: "300px",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "3px",
            backgroundColor: "rgba(255, 158, 25, 0.2)",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: isComplete ? "#10b981" : "#ff9e19",
              borderRadius: "2px",
              transition: "width 0.1s linear",
            }}
          />
        </div>
        
        {/* Time markers */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "0.5rem",
            fontSize: "0.7rem",
            color: "rgba(245, 242, 236, 0.3)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Error display */}
      {audioError && (
        <div
          style={{
            position: "absolute",
            bottom: "8%",
            color: "#ef4444",
            fontSize: "0.85rem",
            textAlign: "center",
            padding: "0 1rem",
          }}
        >
          {audioError}
        </div>
      )}

      {/* Instructions */}
      {!isPlaying && !isComplete && (
        <div
          style={{
            position: "absolute",
            bottom: "8%",
            fontSize: "0.8rem",
            color: "rgba(245, 242, 236, 0.4)",
            textAlign: "center",
          }}
        >
          Tap to begin
        </div>
      )}
    </div>
  );
}
