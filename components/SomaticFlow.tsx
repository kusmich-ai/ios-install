"use client";
import React, { useState, useEffect, useRef } from "react";

// ============================================================================
// SOMATIC FLOW - ADAPTIVE GUIDED PRACTICE
// First 7 completions: mandatory video guide (no skip)
// After 7 completions: self-guided text instructions + optional video
// ============================================================================

const VIDEO_MANDATORY_COUNT = 7; // Completions before self-guided unlocks

interface SomaticFlowProps {
  onComplete?: () => void;
  completionCount?: number; // How many times user has completed this practice
}

// ── Self-Guided View ────────────────────────────────────────────────────────

function SelfGuidedView({ onComplete, completionCount }: SomaticFlowProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(240);
  const [showControls, setShowControls] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const onCompleteCalledRef = useRef(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying && showControls) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, showControls]);

  const handleMarkComplete = () => {
    if (isComplete) return;
    setIsComplete(true);
    if (onComplete && !onCompleteCalledRef.current) {
      onCompleteCalledRef.current = true;
      onComplete();
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setShowControls(true);
  };

  const togglePlayPause = async () => {
    if (!videoRef.current) return;
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
        if (err instanceof Error) {
          setVideoError(err.name === "NotAllowedError" ? "Tap again to play" : `Playback failed: ${err.message}`);
        }
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (isComplete) {
    return (
      <div style={{
        position: "relative", width: "100%", height: "100%", minHeight: "100vh",
        background: "#0a0a0a", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "100px", height: "100px", borderRadius: "50%",
            border: "2px solid #10b981", backgroundColor: "rgba(16, 185, 129, 0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1rem",
          }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none"
              stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 300, color: "#10b981", marginBottom: "0.5rem" }}>
            Complete
          </div>
          <div style={{ fontSize: "0.85rem", color: "rgba(245, 242, 236, 0.5)" }}>
            Closing...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: "relative", width: "100%", height: "100%", minHeight: "100vh",
      background: "#0a0a0a", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflow: "hidden",
    }}>
      {/* ── Video Mode ─────────────────────────────────────── */}
      {showVideo ? (
        <>
          <video
            ref={videoRef}
            src="/video/SomaticFlowS.mp4"
            preload="auto"
            playsInline
            webkit-playsinline="true"
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setDuration(videoRef.current.duration);
                setIsLoaded(true);
                setVideoError(null);
              }
            }}
            onTimeUpdate={() => {
              if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
            }}
            onEnded={handleVideoEnded}
            onCanPlay={() => { setIsLoaded(true); setVideoError(null); }}
            onError={() => {
              setVideoError("Unable to load video file.");
              setIsLoaded(false);
            }}
            style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: "85%", maxWidth: "800px", maxHeight: "60vh",
              objectFit: "contain", borderRadius: "12px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          />

          {/* Overlay gradient */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: showControls
              ? "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.8) 100%)"
              : "transparent",
            transition: "background 0.3s ease",
          }} />

          {/* Title */}
          <div style={{
            position: "absolute", top: "5%", left: 0, right: 0, textAlign: "center",
            opacity: showControls ? 1 : 0, transition: "opacity 0.3s ease", pointerEvents: "none",
          }}>
            <h1 style={{
              fontSize: "1.25rem", fontWeight: 300, letterSpacing: "0.2em",
              textTransform: "uppercase", color: "#F5F2EC", margin: 0,
              textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            }}>Somatic Flow</h1>
            <p style={{
              fontSize: "0.8rem", color: "rgba(245, 242, 236, 0.6)",
              marginTop: "0.25rem", letterSpacing: "0.05em",
            }}>Video Reference</p>
          </div>

          {/* Play/Pause */}
          {showControls && (
            <button
              onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}
              style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                width: "80px", height: "80px", borderRadius: "50%",
                border: "2px solid rgba(255, 158, 25, 0.8)",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center",
                transition: "all 0.3s ease", zIndex: 10,
              }}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#ff9e19">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#ff9e19">
                  <polygon points="8,5 19,12 8,19" />
                </svg>
              )}
            </button>
          )}

          {/* Progress bar */}
          <div style={{
            position: "absolute", bottom: "14%", left: "5%", right: "5%",
            opacity: showControls ? 1 : 0, transition: "opacity 0.3s ease",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.85rem", color: "rgba(245,242,236,0.8)", fontVariantNumeric: "tabular-nums" }}>
                {formatTime(currentTime)}
              </span>
              <span style={{ fontSize: "0.85rem", color: "rgba(245,242,236,0.5)", fontVariantNumeric: "tabular-nums" }}>
                {formatTime(duration)}
              </span>
            </div>
            <div style={{
              width: "100%", height: "4px",
              backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "2px", overflow: "hidden",
            }}>
              <div style={{
                width: `${progress}%`, height: "100%",
                backgroundColor: "#ff9e19", borderRadius: "2px",
                transition: "width 0.1s linear",
              }} />
            </div>
          </div>

          {/* Back to instructions button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (videoRef.current) { videoRef.current.pause(); setIsPlaying(false); }
              setShowVideo(false);
            }}
            style={{
              position: "absolute", bottom: "5%", left: "50%",
              transform: "translateX(-50%)",
              padding: "0.5rem 1.25rem", fontSize: "0.8rem",
              color: "rgba(245, 242, 236, 0.6)",
              backgroundColor: "transparent",
              border: "1px solid rgba(245, 242, 236, 0.2)",
              borderRadius: "8px", cursor: "pointer",
              transition: "all 0.3s ease", zIndex: 10,
            }}
          >
            ← Back to Instructions
          </button>

          {/* Error display */}
          {videoError && (
            <div style={{
              position: "absolute", bottom: "20%", left: "10%", right: "10%",
              textAlign: "center", zIndex: 20,
            }}>
              <div style={{ color: "#ef4444", fontSize: "0.9rem" }}>{videoError}</div>
            </div>
          )}

          {/* Tap area for showing controls */}
          <div
            onClick={() => { if (!showControls) setShowControls(true); else togglePlayPause(); }}
            style={{ position: "absolute", inset: 0, zIndex: 5, cursor: "pointer" }}
          />
        </>
      ) : (
        /* ── Self-Guided Text Mode ────────────────────────── */
        <>
          {/* Title */}
          <div style={{
            position: "absolute", top: "5%", left: 0, right: 0, textAlign: "center",
          }}>
            <h1 style={{
              fontSize: "1.25rem", fontWeight: 300, letterSpacing: "0.2em",
              textTransform: "uppercase", color: "#F5F2EC", margin: 0,
            }}>Somatic Flow</h1>
            <p style={{
              fontSize: "0.8rem", color: "rgba(245, 242, 236, 0.5)",
              marginTop: "0.25rem", letterSpacing: "0.05em",
            }}>Self-Guided Practice</p>
          </div>

          {/* Instructions Card */}
          <div style={{
            width: "88%", maxWidth: "420px",
            padding: "2rem 1.5rem",
            backgroundColor: "rgba(245, 242, 236, 0.04)",
            border: "1px solid rgba(245, 242, 236, 0.1)",
            borderRadius: "16px",
          }}>
            {/* Part 1 */}
            <div style={{ marginBottom: "1.75rem" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                marginBottom: "0.75rem",
              }}>
                <span style={{ fontSize: "1.1rem" }}>🐱</span>
                <span style={{
                  fontSize: "0.95rem", fontWeight: 500, color: "#F5F2EC",
                  letterSpacing: "0.05em",
                }}>Part 1: Cat-Cow Flow</span>
                <span style={{
                  fontSize: "0.75rem", color: "rgba(255, 158, 25, 0.8)",
                  marginLeft: "auto", fontWeight: 500,
                }}>7 breaths</span>
              </div>
              <div style={{
                fontSize: "0.85rem", color: "rgba(245, 242, 236, 0.7)",
                lineHeight: 1.7, paddingLeft: "1.6rem",
              }}>
                <div style={{ marginBottom: "0.35rem" }}>
                  <span style={{ color: "rgba(255, 158, 25, 0.9)" }}>Inhale 4s →</span>{" "}
                  Cow — belly drops, chest lifts
                </div>
                <div>
                  <span style={{ color: "rgba(255, 158, 25, 0.9)" }}>Exhale 6s →</span>{" "}
                  Cat — spine rounds, chin tucks
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{
              height: "1px", backgroundColor: "rgba(245, 242, 236, 0.08)",
              margin: "0 1rem 1.75rem",
            }} />

            {/* Part 2 */}
            <div style={{ marginBottom: "1.75rem" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                marginBottom: "0.75rem",
              }}>
                <span style={{ fontSize: "1.1rem" }}>🏋️</span>
                <span style={{
                  fontSize: "0.95rem", fontWeight: 500, color: "#F5F2EC",
                  letterSpacing: "0.05em",
                }}>Part 2: Squat to Reach</span>
                <span style={{
                  fontSize: "0.75rem", color: "rgba(255, 158, 25, 0.8)",
                  marginLeft: "auto", fontWeight: 500,
                }}>7 breaths</span>
              </div>
              <div style={{
                fontSize: "0.85rem", color: "rgba(245, 242, 236, 0.7)",
                lineHeight: 1.7, paddingLeft: "1.6rem",
              }}>
                <div style={{ marginBottom: "0.35rem" }}>
                  <span style={{ color: "rgba(255, 158, 25, 0.9)" }}>Inhale 4s →</span>{" "}
                  Squat, arms sweep forward
                </div>
                <div>
                  <span style={{ color: "rgba(255, 158, 25, 0.9)" }}>Exhale 6s →</span>{" "}
                  Stand tall, arms overhead
                </div>
              </div>
            </div>

            {/* Breath reminder */}
            <div style={{
              fontSize: "0.75rem", color: "rgba(245, 242, 236, 0.35)",
              textAlign: "center", fontStyle: "italic",
            }}>
              Smooth breath through nose · no strain · ~3 minutes total
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            position: "absolute", bottom: "8%", left: "5%", right: "5%",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem",
          }}>
            {/* Mark Complete */}
            <button
              onClick={handleMarkComplete}
              style={{
                width: "100%", maxWidth: "320px",
                padding: "1rem 2rem", fontSize: "0.9rem",
                fontWeight: 500, letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#0a0a0a",
                backgroundColor: "#ff9e19",
                border: "none", borderRadius: "12px",
                cursor: "pointer", transition: "all 0.3s ease",
              }}
            >
              Mark Complete
            </button>

            {/* Play Video Reference */}
            <button
              onClick={() => setShowVideo(true)}
              style={{
                padding: "0.6rem 1.25rem", fontSize: "0.8rem",
                color: "rgba(245, 242, 236, 0.5)",
                backgroundColor: "transparent",
                border: "1px solid rgba(245, 242, 236, 0.15)",
                borderRadius: "8px", cursor: "pointer",
                transition: "all 0.3s ease",
                display: "flex", alignItems: "center", gap: "0.4rem",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="8,5 19,12 8,19" />
              </svg>
              Play Video Guide
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Video-Mandatory View (original behavior + info banner) ──────────────────

function VideoMandatoryView({ onComplete, completionCount = 0 }: SomaticFlowProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(240);
  const [isComplete, setIsComplete] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const onCompleteCalledRef = useRef(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const remaining = VIDEO_MANDATORY_COUNT - completionCount;

  useEffect(() => {
    if (isPlaying && showControls) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, showControls]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoaded(true);
      setVideoError(null);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setIsComplete(true);
    setShowControls(true);
    if (onComplete && !onCompleteCalledRef.current) {
      onCompleteCalledRef.current = true;
      onComplete();
    }
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    const error = video.error;
    let errorMessage = "Unable to load video file.";
    if (error) {
      switch (error.code) {
        case MediaError.MEDIA_ERR_ABORTED: errorMessage = "Video loading was aborted."; break;
        case MediaError.MEDIA_ERR_NETWORK: errorMessage = "Network error while loading video."; break;
        case MediaError.MEDIA_ERR_DECODE: errorMessage = "Video file is corrupted or unsupported format."; break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED: errorMessage = "Video file not found or format not supported."; break;
      }
    }
    setVideoError(errorMessage);
    setIsLoaded(false);
  };

  const togglePlayPause = async () => {
    if (!videoRef.current || isComplete) return;
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
        if (err instanceof Error) {
          setVideoError(err.name === "NotAllowedError" ? "Tap again to play (autoplay blocked)" : `Playback failed: ${err.message}`);
        }
      }
    }
  };

  const handleScreenTap = () => {
    if (isComplete) return;
    if (!showControls) { setShowControls(true); return; }
    togglePlayPause();
  };

  const retryLoad = () => {
    if (videoRef.current) { setVideoError(null); videoRef.current.load(); }
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
        position: "relative", width: "100%", height: "100%", minHeight: "100vh",
        background: "#0a0a0a", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        overflow: "hidden",
      }}
      onClick={handleScreenTap}
    >
      {/* Video Element */}
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
        onCanPlay={() => { setIsLoaded(true); setVideoError(null); }}
        style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "85%", maxWidth: "800px", maxHeight: "70vh",
          objectFit: "contain", borderRadius: "12px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      />

      {/* Overlay gradient */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: showControls
          ? "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.8) 100%)"
          : "transparent",
        transition: "background 0.3s ease",
      }} />

      {/* Title + guided sessions remaining */}
      <div style={{
        position: "absolute", top: "5%", left: 0, right: 0, textAlign: "center",
        opacity: showControls ? 1 : 0, transition: "opacity 0.3s ease", pointerEvents: "none",
      }}>
        <h1 style={{
          fontSize: "1.25rem", fontWeight: 300, letterSpacing: "0.2em",
          textTransform: "uppercase", color: "#F5F2EC", margin: 0,
          textShadow: "0 2px 10px rgba(0,0,0,0.5)",
        }}>Somatic Flow</h1>
        <p style={{
          fontSize: "0.8rem", color: "rgba(245, 242, 236, 0.6)",
          marginTop: "0.25rem", letterSpacing: "0.05em",
        }}>
          {isComplete ? "Session Complete" : isLoaded ? "Movement + breath" : "Loading video..."}
        </p>

        {/* Guided sessions remaining banner */}
        {!isComplete && (
          <div style={{
            display: "inline-block",
            marginTop: "0.75rem",
            padding: "0.35rem 1rem",
            backgroundColor: "rgba(255, 158, 25, 0.1)",
            border: "1px solid rgba(255, 158, 25, 0.2)",
            borderRadius: "20px",
            fontSize: "0.7rem",
            color: "rgba(255, 158, 25, 0.8)",
            letterSpacing: "0.03em",
          }}>
            {remaining === 1
              ? "Last guided session — self-guided unlocks next"
              : `${remaining} guided session${remaining !== 1 ? "s" : ""} remaining · then self-guided unlocks`
            }
          </div>
        )}
      </div>

      {/* Center Play/Pause */}
      {showControls && !isComplete && (
        <button
          onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}
          style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80px", height: "80px", borderRadius: "50%",
            border: "2px solid rgba(255, 158, 25, 0.8)",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
            transition: "all 0.3s ease", zIndex: 10,
          }}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#ff9e19">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#ff9e19">
              <polygon points="8,5 19,12 8,19" />
            </svg>
          )}
        </button>
      )}

      {/* Completion Overlay */}
      {isComplete && (
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)", textAlign: "center", zIndex: 10,
        }}>
          <div style={{
            width: "100px", height: "100px", borderRadius: "50%",
            border: "2px solid #10b981", backgroundColor: "rgba(16, 185, 129, 0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1rem",
          }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none"
              stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 300, color: "#10b981", marginBottom: "0.5rem" }}>
            Complete
          </div>
          <div style={{ fontSize: "0.85rem", color: "rgba(245, 242, 236, 0.5)" }}>
            Closing...
          </div>
        </div>
      )}

      {/* Progress Bar & Timer */}
      <div style={{
        position: "absolute", bottom: "8%", left: "5%", right: "5%",
        opacity: showControls ? 1 : 0, transition: "opacity 0.3s ease",
        pointerEvents: showControls ? "auto" : "none",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: "0.5rem",
        }}>
          <span style={{
            fontSize: "0.85rem", color: "rgba(245, 242, 236, 0.8)",
            fontVariantNumeric: "tabular-nums",
          }}>{formatTime(currentTime)}</span>
          <span style={{
            fontSize: "1.25rem", fontWeight: 200,
            color: isComplete ? "#10b981" : "#F5F2EC",
            fontVariantNumeric: "tabular-nums",
          }}>-{formatTime(timeRemaining)}</span>
          <span style={{
            fontSize: "0.85rem", color: "rgba(245, 242, 236, 0.5)",
            fontVariantNumeric: "tabular-nums",
          }}>{formatTime(duration)}</span>
        </div>
        <div style={{
          width: "100%", height: "4px",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          borderRadius: "2px", overflow: "hidden",
        }}>
          <div style={{
            width: `${progress}%`, height: "100%",
            backgroundColor: isComplete ? "#10b981" : "#ff9e19",
            borderRadius: "2px", transition: "width 0.1s linear",
          }} />
        </div>
      </div>

      {/* Error display */}
      {videoError && (
        <div style={{
          position: "absolute", bottom: "20%", left: "10%", right: "10%",
          textAlign: "center", zIndex: 20,
        }}>
          <div style={{ color: "#ef4444", fontSize: "0.9rem", marginBottom: "0.75rem",
            textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
            {videoError}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); retryLoad(); }}
            style={{
              padding: "0.5rem 1.25rem", fontSize: "0.8rem",
              color: "#ff9e19", backgroundColor: "rgba(255, 158, 25, 0.15)",
              border: "1px solid rgba(255, 158, 25, 0.4)",
              borderRadius: "6px", cursor: "pointer",
            }}
          >Retry Loading</button>
        </div>
      )}

      {/* Tap instruction */}
      {!isPlaying && !isComplete && !videoError && showControls && (
        <div style={{
          position: "absolute", bottom: "18%", left: 0, right: 0,
          textAlign: "center", fontSize: "0.8rem",
          color: "rgba(245, 242, 236, 0.5)", pointerEvents: "none",
        }}>Tap to begin</div>
      )}
    </div>
  );
}

// ── Main Export (Routes to correct view) ────────────────────────────────────

export default function SomaticFlow({ onComplete, completionCount = 0 }: SomaticFlowProps) {
  const isSelfGuided = completionCount >= VIDEO_MANDATORY_COUNT;

  if (isSelfGuided) {
    return <SelfGuidedView onComplete={onComplete} completionCount={completionCount} />;
  }

  return <VideoMandatoryView onComplete={onComplete} completionCount={completionCount} />;
}
