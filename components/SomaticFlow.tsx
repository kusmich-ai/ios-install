"use client";
import React, { useState, useEffect, useRef } from "react";

// ============================================================================
// SOMATIC FLOW - 4 MIN GUIDED VIDEO
// Full-screen video player with minimal overlay controls
// ============================================================================

interface SomaticFlowProps {
  onComplete?: () => void; // Called when video finishes
}

export default function SomaticFlow({ onComplete }: SomaticFlowProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(240); // Default 4:00 (240 seconds)
  const [isComplete, setIsComplete] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const onCompleteCalledRef = useRef(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide controls after 3 seconds of playback
  useEffect(() => {
    if (isPlaying && showControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showControls]);

  // Handle video events
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoaded(true);
      setVideoError(null);
      console.log('[SomaticFlow] Video loaded successfully, duration:', videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setIsComplete(true);
    setShowControls(true);
    console.log('[SomaticFlow] Video ended');
    
    if (onComplete && !onCompleteCalledRef.current) {
      onCompleteCalledRef.current = true;
      console.log('[SomaticFlow] Calling onComplete');
      onComplete();
    }
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    const error = video.error;
    
    let errorMessage = "Unable to load video file.";
    
    if (error) {
      switch (error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorMessage = "Video loading was aborted.";
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage = "Network error while loading video.";
          break;
        case MediaError.MEDIA_ERR_DECODE:
          errorMessage = "Video file is corrupted or unsupported format.";
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = "Video file not found or format not supported.";
          break;
      }
      console.error("[SomaticFlow] Video error:", error.code, error.message);
    }
    
    setVideoError(errorMessage);
    setIsLoaded(false);
  };

  const handleCanPlay = () => {
    console.log('[SomaticFlow] Video can play');
    setIsLoaded(true);
    setVideoError(null);
  };

  const togglePlayPause = async () => {
    if (!videoRef.current || isComplete) return;

    // Show controls on any interaction
    setShowControls(true);

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await videoRef.current.play();
        setIsPlaying(true);
        setVideoError(null);
      } catch (err) {
        console.error("[SomaticFlow] Playback failed:", err);
        
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            setVideoError("Tap again to play (autoplay blocked)");
          } else {
            setVideoError(`Playback failed: ${err.message}`);
          }
        }
      }
    }
  };

  const handleScreenTap = () => {
    if (isComplete) return;
    
    // If controls are hidden, show them
    if (!showControls) {
      setShowControls(true);
      return;
    }
    
    // If controls are visible, toggle play/pause
    togglePlayPause();
  };

  const retryLoad = () => {
    if (videoRef.current) {
      console.log('[SomaticFlow] Retrying video load...');
      setVideoError(null);
      videoRef.current.load();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const timeRemaining = Math.max(0, duration - currentTime);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        overflow: "hidden",
      }}
      onClick={handleScreenTap}
    >
      {/* Video Element - Centered */}
      <video
        ref={videoRef}
        src="/video/SomaticFlowS.mp4"
        preload="auto"
        playsInline
        webkit-playsinline="true"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handleError}
        onCanPlay={handleCanPlay}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "85%",
          maxWidth: "800px",
          maxHeight: "70vh",
          objectFit: "contain",
          borderRadius: "12px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      />

      {/* Overlay for controls - fades based on showControls */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: showControls 
            ? "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.8) 100%)"
            : "transparent",
          transition: "background 0.3s ease",
          pointerEvents: "none",
        }}
      />

      {/* Title - Top */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: showControls ? 1 : 0,
          transition: "opacity 0.3s ease",
          pointerEvents: "none",
        }}
      >
        <h1
          style={{
            fontSize: "1.25rem",
            fontWeight: 300,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#F5F2EC",
            margin: 0,
            textShadow: "0 2px 10px rgba(0,0,0,0.5)",
          }}
        >
          Somatic Flow
        </h1>
        <p
          style={{
            fontSize: "0.8rem",
            color: "rgba(245, 242, 236, 0.6)",
            marginTop: "0.25rem",
            letterSpacing: "0.05em",
          }}
        >
          {isComplete ? "Session Complete" : isLoaded ? "Movement + breath" : "Loading video..."}
        </p>
      </div>

      {/* Center Play/Pause Button */}
      {showControls && !isComplete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlayPause();
          }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            border: "2px solid rgba(255, 158, 25, 0.8)",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
            zIndex: 10,
          }}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            // Pause icon
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#ff9e19">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            // Play icon
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#ff9e19">
              <polygon points="8,5 19,12 8,19" />
            </svg>
          )}
        </button>
      )}

      {/* Completion Overlay */}
      {isComplete && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              border: "2px solid #10b981",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
            }}
          >
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: 300,
              color: "#10b981",
              marginBottom: "0.5rem",
            }}
          >
            Complete
          </div>
          <div
            style={{
              fontSize: "0.85rem",
              color: "rgba(245, 242, 236, 0.5)",
            }}
          >
            Closing...
          </div>
        </div>
      )}

      {/* Progress Bar & Timer - Bottom */}
      <div
        style={{
          position: "absolute",
          bottom: "8%",
          left: "5%",
          right: "5%",
          opacity: showControls ? 1 : 0,
          transition: "opacity 0.3s ease",
          pointerEvents: showControls ? "auto" : "none",
        }}
      >
        {/* Timer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
          }}
        >
          <span
            style={{
              fontSize: "0.85rem",
              color: "rgba(245, 242, 236, 0.8)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatTime(currentTime)}
          </span>
          <span
            style={{
              fontSize: "1.25rem",
              fontWeight: 200,
              color: isComplete ? "#10b981" : "#F5F2EC",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            -{formatTime(timeRemaining)}
          </span>
          <span
            style={{
              fontSize: "0.85rem",
              color: "rgba(245, 242, 236, 0.5)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatTime(duration)}
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: "100%",
            height: "4px",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
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
      </div>

      {/* Error display with retry button */}
      {videoError && (
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            left: "10%",
            right: "10%",
            textAlign: "center",
            zIndex: 20,
          }}
        >
          <div
            style={{
              color: "#ef4444",
              fontSize: "0.9rem",
              marginBottom: "0.75rem",
              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            {videoError}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              retryLoad();
            }}
            style={{
              padding: "0.5rem 1.25rem",
              fontSize: "0.8rem",
              color: "#ff9e19",
              backgroundColor: "rgba(255, 158, 25, 0.15)",
              border: "1px solid rgba(255, 158, 25, 0.4)",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Initial tap instruction */}
      {!isPlaying && !isComplete && !videoError && showControls && (
        <div
          style={{
            position: "absolute",
            bottom: "18%",
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: "0.8rem",
            color: "rgba(245, 242, 236, 0.5)",
            pointerEvents: "none",
          }}
        >
          Tap to begin
        </div>
      )}
    </div>
  );
}
