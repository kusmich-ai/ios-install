"use client";
import React, { useState } from "react";

// ============================================================================
// SOMATIC FLOW - VERSION-AWARE GUIDED PRACTICE
// Displays the correct movement pair based on currentVersion prop.
// First encounter with a version: demo button is prominent.
// After demo watched once: demo button becomes secondary reference.
// No video-mandatory forcing — one watch per version, then self-guided always.
// ============================================================================

export type SomaticFlowVersion = 'original' | 'v2' | 'v3' | 'v4';

interface VersionContent {
  label: string;
  subtitle: string;
  videoSrc: string;
  part1: { emoji: string; title: string; inhale: string; exhale: string; };
  part2: { emoji: string; title: string; inhale: string; exhale: string; };
  footer: string;
}

// ============================================
// VERSION CONTENT DEFINITIONS
// ============================================

const VERSION_CONTENT: Record<SomaticFlowVersion, VersionContent> = {
  original: {
    label: 'Somatic Flow',
    subtitle: 'Cat-Cow + Squat to Reach',
    videoSrc: '/video/SomaticFlowOriginal.mp4',
    part1: {
      emoji: '🐱',
      title: 'Cat-Cow Flow',
      inhale: 'Cow — belly drops, chest lifts',
      exhale: 'Cat — spine rounds, chin tucks',
    },
    part2: {
      emoji: '🏋️',
      title: 'Squat to Reach',
      inhale: 'Squat, arms sweep forward',
      exhale: 'Stand tall, arms overhead',
    },
    footer: 'Smooth breath through nose · no strain · ~2 minutes total',
  },
  v2: {
    label: 'Somatic Flow',
    subtitle: 'Thoracic Rotation + Neck Release',
    videoSrc: '/video/SomaticFlowV2.mp4',
    part1: {
      emoji: '🌀',
      title: 'Thoracic Rotation',
      inhale: 'Twist right, arms open wide to sides',
      exhale: 'Return center, arms rest at sides. Alternate left',
    },
    part2: {
      emoji: '🌿',
      title: 'Neck Release',
      inhale: 'Right ear drops to shoulder, chest opens',
      exhale: 'Chin rolls forward through center to left shoulder',
    },
    footer: 'Smooth breath through nose · no strain · ~2 minutes total',
  },
  v3: {
    label: 'Somatic Flow',
    subtitle: 'Rise + Fold · Thoracic Rotation',
    videoSrc: '/video/SomaticFlowV3.mp4',
    part1: {
      emoji: '⬆️',
      title: 'Rise + Fold',
      inhale: 'Rise onto toes, arms sweep overhead, full reach',
      exhale: 'Fold forward, soft knees, arms hang heavy',
    },
    part2: {
      emoji: '🌀',
      title: 'Thoracic Rotation',
      inhale: 'Twist right, arms open wide to sides',
      exhale: 'Return center, arms rest at sides. Alternate left',
    },
    footer: 'Smooth breath through nose · no strain · ~2 minutes total',
  },
  v4: {
    label: 'Somatic Flow',
    subtitle: 'Neck Release · Rise + Fold',
    videoSrc: '/video/SomaticFlowV4.mp4',
    part1: {
      emoji: '🌿',
      title: 'Neck Release',
      inhale: 'Right ear drops to shoulder, chest opens',
      exhale: 'Chin rolls forward through center to left shoulder',
    },
    part2: {
      emoji: '⬆️',
      title: 'Rise + Fold',
      inhale: 'Rise onto toes, arms sweep overhead, full reach',
      exhale: 'Fold forward, soft knees, arms hang heavy',
    },
    footer: 'Smooth breath through nose · no strain · ~2 minutes total',
  },
};

// ============================================
// PROPS
// ============================================

interface SomaticFlowProps {
  onComplete?: () => void;
  onDemoWatched?: () => void;   // called once when user watches demo for this version
  onClose?: () => void;         // closes the entire modal (from parent)
  currentVersion?: SomaticFlowVersion;
  hasSeenDemo?: boolean;        // true = demo button secondary; false = demo button prominent
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function SomaticFlow({
  onComplete,
  onDemoWatched,
  onClose,
  currentVersion = 'original',
  hasSeenDemo = true,
}: SomaticFlowProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [showControls, setShowControls] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [demoWatchedThisSession, setDemoWatchedThisSession] = useState(false);

  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const onCompleteCalledRef = React.useRef(false);
  const controlsTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const onDemoWatchedCalledRef = React.useRef(false);

  const content = VERSION_CONTENT[currentVersion] || VERSION_CONTENT.original;
  const showDemoProminent = !hasSeenDemo && !demoWatchedThisSession;

  React.useEffect(() => {
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

  const handleOpenDemo = () => {
    setShowVideo(true);
    // Fire onDemoWatched once when they first open it
    if (!onDemoWatchedCalledRef.current && !hasSeenDemo) {
      onDemoWatchedCalledRef.current = true;
      setDemoWatchedThisSession(true);
      if (onDemoWatched) onDemoWatched();
    }
  };

  const handleCloseVideo = () => {
    if (videoRef.current) { videoRef.current.pause(); setIsPlaying(false); }
    setShowVideo(false);
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

  // ── Complete State ──────────────────────────────────────────────────────────

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

  // ── Video Demo Mode ─────────────────────────────────────────────────────────

  if (showVideo) {
    return (
      <div style={{
        position: "relative", width: "100%", height: "100%", minHeight: "100vh",
        background: "#0a0a0a", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        overflow: "hidden",
      }}>
        <video
          ref={videoRef}
          src={content.videoSrc}
          preload="auto"
          playsInline
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration);
              setVideoError(null);
            }
          }}
          onTimeUpdate={() => {
            if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
          }}
          onEnded={() => { setIsPlaying(false); setShowControls(true); }}
          onCanPlay={() => setVideoError(null)}
          onError={() => setVideoError("Unable to load demo video.")}
          style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: "85%", maxWidth: "800px", maxHeight: "60vh",
            objectFit: "contain", borderRadius: "12px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          }}
        />

        {/* Overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: showControls
            ? "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.8) 100%)"
            : "transparent",
          transition: "background 0.3s ease",
        }} />

        {/* Context-aware X: in video mode goes back to instructions */}
        <button
          onClick={(e) => { e.stopPropagation(); handleCloseVideo(); }}
          style={{
            position: "absolute", top: "1.5rem", right: "1.5rem",
            width: "44px", height: "44px",
            display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            border: "1px solid rgba(245, 242, 236, 0.3)",
            borderRadius: "50%", color: "#F5F2EC",
            cursor: "pointer", zIndex: 10001,
          }}
          aria-label="Back to instructions"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        <div style={{
          position: "absolute", top: "5%", left: 0, right: 0, textAlign: "center",
          opacity: showControls ? 1 : 0, transition: "opacity 0.3s ease", pointerEvents: "none",
        }}>
          <h1 style={{
            fontSize: "1.25rem", fontWeight: 300, letterSpacing: "0.2em",
            textTransform: "uppercase", color: "#F5F2EC", margin: 0,
          }}>Somatic Flow</h1>
          <p style={{
            fontSize: "0.8rem", color: "rgba(245, 242, 236, 0.6)",
            marginTop: "0.25rem", letterSpacing: "0.05em",
          }}>{content.subtitle} · Demo</p>
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

        {/* Back button */}
        <button
          onClick={handleCloseVideo}
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
          ← Back to Practice
        </button>

        {videoError && (
          <div style={{
            position: "absolute", bottom: "20%", left: "10%", right: "10%",
            textAlign: "center", zIndex: 20,
          }}>
            <div style={{ color: "#ef4444", fontSize: "0.9rem" }}>{videoError}</div>
          </div>
        )}

        {/* Tap area */}
        <div
          onClick={() => { if (!showControls) setShowControls(true); else togglePlayPause(); }}
          style={{ position: "absolute", inset: 0, zIndex: 5, cursor: "pointer" }}
        />
      </div>
    );
  }

  // ── Self-Guided Text Mode ───────────────────────────────────────────────────

  return (
    <div style={{
      position: "relative", width: "100%", height: "100%", minHeight: "100vh",
      background: "#0a0a0a", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "space-between",
        width: "100%", height: "100dvh", minHeight: "0",
        padding: "1rem 0 2rem",
        overflow: "auto",
        boxSizing: "border-box",
      }}>
        {/* Title */}
        <div style={{ textAlign: "center", paddingTop: "0.5rem" }}>
          <h1 style={{
            fontSize: "1.25rem", fontWeight: 300, letterSpacing: "0.2em",
            textTransform: "uppercase", color: "#F5F2EC", margin: 0,
          }}>{content.label}</h1>
          <p style={{
            fontSize: "0.8rem", color: "rgba(245, 242, 236, 0.5)",
            marginTop: "0.25rem", letterSpacing: "0.05em",
          }}>{content.subtitle}</p>
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
              display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem",
            }}>
              <span style={{ fontSize: "1.1rem" }}>{content.part1.emoji}</span>
              <span style={{
                fontSize: "0.95rem", fontWeight: 500, color: "#F5F2EC", letterSpacing: "0.05em",
              }}>Part 1: {content.part1.title}</span>
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
                {content.part1.inhale}
              </div>
              <div>
                <span style={{ color: "rgba(255, 158, 25, 0.9)" }}>Exhale 6s →</span>{" "}
                {content.part1.exhale}
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
              display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem",
            }}>
              <span style={{ fontSize: "1.1rem" }}>{content.part2.emoji}</span>
              <span style={{
                fontSize: "0.95rem", fontWeight: 500, color: "#F5F2EC", letterSpacing: "0.05em",
              }}>Part 2: {content.part2.title}</span>
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
                {content.part2.inhale}
              </div>
              <div>
                <span style={{ color: "rgba(255, 158, 25, 0.9)" }}>Exhale 6s →</span>{" "}
                {content.part2.exhale}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div style={{
            fontSize: "0.75rem", color: "rgba(245, 242, 236, 0.35)",
            textAlign: "center", fontStyle: "italic",
          }}>
            {content.footer}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem",
          paddingBottom: "2.5rem", width: "90%",
        }}>
          {/* First-encounter: Demo button is prominent, above Mark Complete */}
          {showDemoProminent && (
            <>
              <button
                onClick={handleOpenDemo}
                style={{
                  width: "100%", maxWidth: "320px",
                  padding: "1rem 2rem", fontSize: "0.9rem",
                  fontWeight: 500, letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#0a0a0a",
                  backgroundColor: "#ff9e19",
                  border: "none", borderRadius: "12px",
                  cursor: "pointer", transition: "all 0.3s ease",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="8,5 19,12 8,19" />
                </svg>
                Watch Demo First
              </button>
              <button
                onClick={handleMarkComplete}
                style={{
                  padding: "0.6rem 1.25rem", fontSize: "0.8rem",
                  color: "rgba(245, 242, 236, 0.4)",
                  backgroundColor: "transparent",
                  border: "1px solid rgba(245, 242, 236, 0.1)",
                  borderRadius: "8px", cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                Skip — I know this movement
              </button>
            </>
          )}

          {/* Returning: Mark Complete is primary, demo is secondary reference */}
          {!showDemoProminent && (
            <>
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
              <button
                onClick={handleOpenDemo}
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
                Watch Demo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
