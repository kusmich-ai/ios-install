"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

// ============================================================================
// RESONANCE BREATHING COMPONENT
// 4-second inhale (nose) / 6-second exhale (mouth) / 5 minutes total
// Synced to BreathPulse.mp3 as the master audio track
// ============================================================================

interface ResonanceBreathingProps {
  onComplete?: () => void; // Called when session completes (for auto-logging)
}

const TOTAL_BREATHS = 30;
const CYCLE_DURATION = 10000; // 10 seconds per breath
const INHALE_DURATION = 4000; // 4 seconds
const EXHALE_DURATION = 6000; // 6 seconds
const TOTAL_DURATION = 303000; // 5:03 to match audio

// Color palette
const COLORS = {
  background: "#0D0D0D",
  orbBase: "#F5F2EC",
  accent: "#ff9e18",
  accentDim: "rgba(255, 158, 24, 0.15)",
  textPrimary: "#F5F2EC",
  textDim: "rgba(245, 242, 236, 0.4)",
  success: "#10b981",
};

// Audio file path
const AUDIO_FILE = "/audio/BreathPulse.mp3";

// Audio volume
const VOLUME = 0.7;

export default function ResonanceBreathing({ onComplete }: ResonanceBreathingProps) {
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<"inhale" | "exhale" | "idle">("idle");
  const [breathCount, setBreathCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [audioLoaded, setAudioLoaded] = useState(false);
  
  // Use refs for animation values to avoid re-renders
  const [animationState, setAnimationState] = useState({
    orbScale: 1,
    ballPosition: 0,
    phase: "idle" as "inhale" | "exhale" | "idle",
  });

  // Audio element ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const onCompleteCalledRef = useRef(false);

  // Handle session completion
  const handleSessionComplete = useCallback(() => {
    setIsActive(false);
    setIsComplete(true);
    setCurrentPhase("idle");
    setAnimationState({ orbScale: 1, ballPosition: 0, phase: "idle" });
    
    // Trigger onComplete callback (only once)
    if (onComplete && !onCompleteCalledRef.current) {
      onCompleteCalledRef.current = true;
      console.log('[ResonanceBreathing] Session complete, calling onComplete');
      onComplete();
    }
  }, [onComplete]);

  // Preload audio file
  useEffect(() => {
    audioRef.current = new Audio(AUDIO_FILE);
    audioRef.current.volume = VOLUME;
    audioRef.current.preload = "auto";

    audioRef.current.addEventListener("canplaythrough", () => {
      setAudioLoaded(true);
    });

    audioRef.current.addEventListener("ended", () => {
      handleSessionComplete();
    });

    audioRef.current.load();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [handleSessionComplete]);

  // Ease in-out function
  const easeInOutQuad = (t: number) => {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  };

  // Animation loop - syncs visuals to audio currentTime
  const animate = useCallback(() => {
    if (!audioRef.current || !isActive) return;

    const currentTime = audioRef.current.currentTime * 1000; // Convert to ms

    // Check if audio ended
    if (audioRef.current.ended || currentTime >= TOTAL_DURATION) {
      handleSessionComplete();
      return;
    }

    // Calculate current breath and phase based on audio time
    const currentBreathIndex = Math.floor(currentTime / CYCLE_DURATION);
    const timeInCycle = currentTime % CYCLE_DURATION;

    let phase: "inhale" | "exhale";
    let phaseElapsed: number;
    let phaseDuration: number;

    if (timeInCycle < INHALE_DURATION) {
      phase = "inhale";
      phaseElapsed = timeInCycle;
      phaseDuration = INHALE_DURATION;
    } else {
      phase = "exhale";
      phaseElapsed = timeInCycle - INHALE_DURATION;
      phaseDuration = EXHALE_DURATION;
    }

    // Calculate smooth progress (0 to 1)
    const progress = phaseElapsed / phaseDuration;
    const easedProgress = easeInOutQuad(progress);

    // Calculate orb scale
    let orbScale: number;
    if (phase === "inhale") {
      orbScale = 1 + easedProgress * 0.35;
    } else {
      orbScale = 1.35 - easedProgress * 0.35;
    }

    // Calculate ball position (0 = bottom, 1 = top)
    let ballPosition: number;
    if (phase === "inhale") {
      ballPosition = easedProgress;
    } else {
      ballPosition = 1 - easedProgress;
    }

    // Batch update animation state
    setAnimationState({ orbScale, ballPosition, phase });
    
    // Update other state less frequently
    const newBreathCount = Math.min(currentBreathIndex + 1, TOTAL_BREATHS);
    if (breathCount !== newBreathCount) {
      setBreathCount(newBreathCount);
    }
    if (currentPhase !== phase) {
      setCurrentPhase(phase);
    }
    
    // Update elapsed time (for display)
    setElapsedTime(currentTime);

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isActive, breathCount, currentPhase, handleSessionComplete]);

  // Start animation loop when active
  useEffect(() => {
    if (isActive) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, animate]);

  // Start session
  const startSession = useCallback(() => {
    if (!audioRef.current) return;

    // Reset the onComplete called flag
    onCompleteCalledRef.current = false;

    // Reset audio to beginning
    audioRef.current.currentTime = 0;
    
    // Start playing
    audioRef.current.play().catch((e) => {
      console.log("Audio play failed:", e);
    });

    setIsActive(true);
    setIsComplete(false);
    setBreathCount(1);
    setElapsedTime(0);
    setCurrentPhase("inhale");
    setAnimationState({ orbScale: 1, ballPosition: 0, phase: "inhale" });
  }, []);

  // Stop session
  const stopSession = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setIsActive(false);
    setCurrentPhase("idle");
    setAnimationState({ orbScale: 1, ballPosition: 0, phase: "idle" });

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // Format time display
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const { orbScale, ballPosition } = animationState;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: COLORS.background,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        color: COLORS.textPrimary,
        overflow: "hidden",
      }}
    >
      {/* Google Fonts Import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&display=swap');
        
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.25; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Session Complete Screen - Matches AwarenessRep style */}
      {isComplete && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeIn 0.5s ease-out",
            zIndex: 20,
            backgroundColor: COLORS.background,
          }}
        >
          {/* Green checkmark circle */}
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              border: `2px solid ${COLORS.success}`,
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "2rem",
            }}
          >
            <svg
              width="50"
              height="50"
              viewBox="0 0 24 24"
              fill="none"
              stroke={COLORS.success}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          
          <p
            style={{
              fontSize: "2rem",
              fontWeight: 300,
              letterSpacing: "0.1em",
              marginBottom: "1rem",
              color: COLORS.success,
            }}
          >
            Done
          </p>
          <p
            style={{
              fontSize: "1rem",
              fontWeight: 300,
              opacity: 0.6,
              marginBottom: "1rem",
            }}
          >
            30 breaths · 5 minutes
          </p>
          <p
            style={{
              fontSize: "0.85rem",
              fontWeight: 300,
              opacity: 0.4,
            }}
          >
            Closing...
          </p>
        </div>
      )}

      {/* Main Content */}
      {!isComplete && (
        <>
          {/* Timer Display */}
          {isActive && (
            <div
              style={{
                position: "absolute",
                top: "2rem",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span
                style={{
                  fontSize: "2rem",
                  fontWeight: 300,
                  letterSpacing: "0.2em",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {formatTime(elapsedTime)}
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 400,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  opacity: 0.5,
                }}
              >
                Breath {breathCount} of 30
              </span>
            </div>
          )}

          {/* Sacred Geometry Orb */}
          <div
            style={{
              position: "relative",
              width: "280px",
              height: "280px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "3rem",
            }}
          >
            {/* Outer glow */}
            <div
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: `radial-gradient(circle, ${COLORS.accentDim} 0%, transparent 70%)`,
                transform: `scale(${orbScale * 1.3})`,
                willChange: "transform",
                animation: isActive ? "pulseGlow 10s ease-in-out infinite" : "none",
              }}
            />

            {/* Main orb with sacred geometry */}
            <svg
              viewBox="0 0 200 200"
              style={{
                width: "100%",
                height: "100%",
                transform: `scale(${orbScale})`,
                willChange: "transform",
              }}
            >
              {/* Definitions for gradients and filters */}
              <defs>
                <radialGradient id="orbGradient" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
                  <stop offset="50%" stopColor={COLORS.orbBase} stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#D4CFC7" stopOpacity="0.15" />
                </radialGradient>

                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="url(#orbGradient)"
                filter="url(#glow)"
              />

              {/* Sacred Geometry - Flower of Life inspired pattern */}
              <g
                stroke={COLORS.accent}
                strokeWidth="0.6"
                fill="none"
                opacity={isActive ? 0.6 : 0.4}
                filter="url(#softGlow)"
              >
                {/* Center circle */}
                <circle cx="100" cy="100" r="25" />

                {/* Six surrounding circles - first ring */}
                {[0, 60, 120, 180, 240, 300].map((angle) => {
                  const rad = (angle * Math.PI) / 180;
                  const x = 100 + 25 * Math.cos(rad);
                  const y = 100 + 25 * Math.sin(rad);
                  return <circle key={angle} cx={x} cy={y} r="25" />;
                })}

                {/* Second ring - 12 circles */}
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
                  const rad = (angle * Math.PI) / 180;
                  const x = 100 + 50 * Math.cos(rad);
                  const y = 100 + 50 * Math.sin(rad);
                  return <circle key={`outer-${angle}`} cx={x} cy={y} r="25" />;
                })}

                {/* Outer boundary circle */}
                <circle cx="100" cy="100" r="75" strokeWidth="0.75" />
              </g>

              {/* Subtle inner accent ring */}
              <circle
                cx="100"
                cy="100"
                r="40"
                fill="none"
                stroke={COLORS.accent}
                strokeWidth="0.3"
                opacity={isActive ? 0.3 : 0.15}
              />
            </svg>
          </div>

          {/* Nose/Mouth Icons + Vertical Line Indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2rem",
              height: "120px",
            }}
          >
            {/* Nose Icon */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
                opacity: animationState.phase === "inhale" ? 1 : 0.3,
              }}
            >
              <svg
                viewBox="0 0 32 32"
                style={{ width: "32px", height: "32px" }}
                stroke={animationState.phase === "inhale" ? COLORS.accent : COLORS.textPrimary}
                strokeWidth="1.5"
                fill="none"
              >
                <path d="M16 4 L16 18 Q16 24 12 26 Q10 27 10 25 Q10 23 12 22 Q14 21 14 18" />
                <path d="M16 18 Q16 24 20 26 Q22 27 22 25 Q22 23 20 22 Q18 21 18 18" />
              </svg>
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 400,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: animationState.phase === "inhale" ? COLORS.accent : COLORS.textDim,
                }}
              >
                In
              </span>
            </div>

            {/* Vertical Line + Ball */}
            <div
              style={{
                position: "relative",
                width: "2px",
                height: "100px",
                backgroundColor: COLORS.textDim,
                borderRadius: "1px",
              }}
            >
              {/* Moving ball */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  marginLeft: "-6px",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: COLORS.accent,
                  boxShadow: `0 0 12px ${COLORS.accent}`,
                  bottom: `${ballPosition * 88}px`,
                  willChange: "bottom",
                }}
              />

              {/* Top marker */}
              <div
                style={{
                  position: "absolute",
                  top: "-4px",
                  left: "50%",
                  marginLeft: "-4px",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: animationState.phase === "inhale" ? COLORS.orbBase : COLORS.textDim,
                }}
              />

              {/* Bottom marker */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-4px",
                  left: "50%",
                  marginLeft: "-4px",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: animationState.phase === "exhale" ? COLORS.orbBase : COLORS.textDim,
                }}
              />
            </div>

            {/* Mouth Icon */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
                opacity: animationState.phase === "exhale" ? 1 : 0.3,
              }}
            >
              <svg
                viewBox="0 0 32 32"
                style={{ width: "32px", height: "32px" }}
                stroke={animationState.phase === "exhale" ? COLORS.accent : COLORS.textPrimary}
                strokeWidth="1.5"
                fill="none"
              >
                <ellipse cx="16" cy="16" rx="10" ry="6" />
                <path d="M10 16 Q16 20 22 16" />
              </svg>
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 400,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: animationState.phase === "exhale" ? COLORS.accent : COLORS.textDim,
                }}
              >
                Out
              </span>
            </div>
          </div>

          {/* Phase Text */}
          {isActive && (
            <p
              style={{
                marginTop: "2rem",
                fontSize: "1.25rem",
                fontWeight: 300,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: animationState.phase === "inhale" ? COLORS.textPrimary : COLORS.textDim,
              }}
            >
              {animationState.phase === "inhale" ? "Breathe In" : "Breathe Out"}
            </p>
          )}

          {/* Start / Stop Button */}
          {!isActive && (
            <button
              onClick={startSession}
              style={{
                marginTop: "3rem",
                padding: "1.25rem 3rem",
                fontSize: "0.85rem",
                fontWeight: 400,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                backgroundColor: "transparent",
                border: `1px solid ${COLORS.orbBase}`,
                color: COLORS.textPrimary,
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.orbBase;
                e.currentTarget.style.color = COLORS.background;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = COLORS.textPrimary;
              }}
            >
              Begin Session
            </button>
          )}

          {isActive && (
            <button
              onClick={stopSession}
              style={{
                marginTop: "2rem",
                padding: "0.75rem 1.5rem",
                fontSize: "0.7rem",
                fontWeight: 400,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                backgroundColor: "transparent",
                border: "none",
                color: COLORS.textDim,
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = COLORS.textPrimary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = COLORS.textDim;
              }}
            >
              End Session
            </button>
          )}

          {/* Headphones recommendation */}
          {!isActive && (
            <p
              style={{
                position: "absolute",
                bottom: "2rem",
                fontSize: "0.7rem",
                fontWeight: 400,
                letterSpacing: "0.1em",
                opacity: 0.4,
              }}
            >
              Headphones recommended for best experience
            </p>
          )}
        </>
      )}
    </div>
  );
}
