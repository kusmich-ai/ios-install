"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

// ============================================================================
// RESONANCE BREATHING COMPONENT
// 4-second inhale (nose) / 6-second exhale (mouth) / 5 minutes total
// ============================================================================

interface BreathPhase {
  type: "inhale" | "exhale";
  duration: number;
}

const BREATH_CYCLE: BreathPhase[] = [
  { type: "inhale", duration: 4000 },
  { type: "exhale", duration: 6000 },
];

const TOTAL_BREATHS = 30;
const CYCLE_DURATION = 10000; // 10 seconds per breath
const TOTAL_DURATION = 300000; // 5 minutes

// Color palette
const COLORS = {
  background: "#0D0D0D",
  orbBase: "#F5F2EC",
  accent: "#ff9e18",
  accentDim: "rgba(255, 158, 24, 0.15)",
  textPrimary: "#F5F2EC",
  textDim: "rgba(245, 242, 236, 0.4)",
};

// Audio frequencies
const AUDIO = {
  inhaleFreq: 528, // Hz - "love frequency"
  exhaleFreq: 396, // Hz - grounding
  binauralBase: 200, // Hz carrier
  binauralBeat: 7.83, // Hz - Schumann resonance (theta/alpha border)
};

export default function ResonanceBreathing() {
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<"inhale" | "exhale" | "idle">("idle");
  const [breathCount, setBreathCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const binauralNodesRef = useRef<{ left: OscillatorNode; right: OscillatorNode; gainL: GainNode; gainR: GainNode } | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const phaseStartTimeRef = useRef<number>(0);

  // Initialize Web Audio Context
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play a singing bowl / chime tone
  const playTone = useCallback((frequency: number, duration: number, isInhale: boolean) => {
    const ctx = initAudio();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;

    // Create oscillators for rich, bowl-like tone
    const fundamental = ctx.createOscillator();
    const harmonic1 = ctx.createOscillator();
    const harmonic2 = ctx.createOscillator();

    fundamental.type = "sine";
    fundamental.frequency.setValueAtTime(frequency, now);

    harmonic1.type = "sine";
    harmonic1.frequency.setValueAtTime(frequency * 2, now);

    harmonic2.type = "sine";
    harmonic2.frequency.setValueAtTime(frequency * 3, now);

    // Gain nodes for mixing
    const fundamentalGain = ctx.createGain();
    const harmonic1Gain = ctx.createGain();
    const harmonic2Gain = ctx.createGain();
    const masterGain = ctx.createGain();

    fundamentalGain.gain.setValueAtTime(0.3, now);
    harmonic1Gain.gain.setValueAtTime(0.15, now);
    harmonic2Gain.gain.setValueAtTime(0.05, now);

    // Envelope - singing bowl style (quick attack, long decay)
    const attackTime = 0.02;
    const decayTime = duration / 1000;

    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(isInhale ? 0.12 : 0.1, now + attackTime);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + decayTime);

    // Connect nodes
    fundamental.connect(fundamentalGain);
    harmonic1.connect(harmonic1Gain);
    harmonic2.connect(harmonic2Gain);

    fundamentalGain.connect(masterGain);
    harmonic1Gain.connect(masterGain);
    harmonic2Gain.connect(masterGain);

    masterGain.connect(ctx.destination);

    // Start and stop
    fundamental.start(now);
    harmonic1.start(now);
    harmonic2.start(now);

    fundamental.stop(now + decayTime);
    harmonic1.stop(now + decayTime);
    harmonic2.stop(now + decayTime);
  }, [initAudio]);

  // Start binaural beat
  const startBinaural = useCallback(() => {
    const ctx = initAudio();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;

    // Create stereo binaural beat
    const leftOsc = ctx.createOscillator();
    const rightOsc = ctx.createOscillator();

    leftOsc.type = "sine";
    rightOsc.type = "sine";

    // Left ear: base frequency, Right ear: base + beat frequency
    leftOsc.frequency.setValueAtTime(AUDIO.binauralBase, now);
    rightOsc.frequency.setValueAtTime(AUDIO.binauralBase + AUDIO.binauralBeat, now);

    // Create stereo panner nodes
    const leftPanner = ctx.createStereoPanner();
    const rightPanner = ctx.createStereoPanner();
    leftPanner.pan.setValueAtTime(-1, now);
    rightPanner.pan.setValueAtTime(1, now);

    // Gain nodes - subtle volume
    const leftGain = ctx.createGain();
    const rightGain = ctx.createGain();
    leftGain.gain.setValueAtTime(0, now);
    rightGain.gain.setValueAtTime(0, now);

    // Fade in over 3 seconds
    leftGain.gain.linearRampToValueAtTime(0.08, now + 3);
    rightGain.gain.linearRampToValueAtTime(0.08, now + 3);

    // Connect
    leftOsc.connect(leftGain);
    rightOsc.connect(rightGain);
    leftGain.connect(leftPanner);
    rightGain.connect(rightPanner);
    leftPanner.connect(ctx.destination);
    rightPanner.connect(ctx.destination);

    leftOsc.start(now);
    rightOsc.start(now);

    binauralNodesRef.current = {
      left: leftOsc,
      right: rightOsc,
      gainL: leftGain,
      gainR: rightGain,
    };
  }, [initAudio]);

  // Stop binaural beat
  const stopBinaural = useCallback(() => {
    if (binauralNodesRef.current && audioContextRef.current) {
      const ctx = audioContextRef.current;
      const now = ctx.currentTime;
      const { left, right, gainL, gainR } = binauralNodesRef.current;

      // Fade out over 2 seconds
      gainL.gain.linearRampToValueAtTime(0, now + 2);
      gainR.gain.linearRampToValueAtTime(0, now + 2);

      setTimeout(() => {
        try {
          left.stop();
          right.stop();
        } catch (e) {
          // Already stopped
        }
      }, 2100);

      binauralNodesRef.current = null;
    }
  }, []);

  // Main animation loop
  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
      phaseStartTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    setElapsedTime(elapsed);

    if (elapsed >= TOTAL_DURATION) {
      setIsActive(false);
      setIsComplete(true);
      setCurrentPhase("idle");
      stopBinaural();
      return;
    }

    // Calculate current breath and phase
    const currentBreathIndex = Math.floor(elapsed / CYCLE_DURATION);
    const timeInCycle = elapsed % CYCLE_DURATION;

    let phase: "inhale" | "exhale";
    let phaseElapsed: number;
    let phaseDuration: number;

    if (timeInCycle < 4000) {
      phase = "inhale";
      phaseElapsed = timeInCycle;
      phaseDuration = 4000;
    } else {
      phase = "exhale";
      phaseElapsed = timeInCycle - 4000;
      phaseDuration = 6000;
    }

    // Detect phase transition for tone triggers
    if (phase !== currentPhase) {
      setCurrentPhase(phase);
      phaseStartTimeRef.current = timestamp;

      // Play tone on phase change
      if (phase === "inhale") {
        playTone(AUDIO.inhaleFreq, 3500, true);
        setBreathCount(currentBreathIndex + 1);
      } else {
        playTone(AUDIO.exhaleFreq, 5000, false);
      }
    }

    // Calculate smooth progress (0 to 1)
    const progress = phaseElapsed / phaseDuration;
    setPhaseProgress(progress);

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [currentPhase, playTone, stopBinaural]);

  // Start session
  const startSession = useCallback(() => {
    setIsActive(true);
    setIsComplete(false);
    setBreathCount(0);
    setElapsedTime(0);
    setPhaseProgress(0);
    setCurrentPhase("inhale");
    startTimeRef.current = 0;
    phaseStartTimeRef.current = 0;

    // Start binaural
    startBinaural();

    // Play first inhale tone
    setTimeout(() => {
      playTone(AUDIO.inhaleFreq, 3500, true);
      setBreathCount(1);
    }, 100);

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [animate, startBinaural, playTone]);

  // Stop session
  const stopSession = useCallback(() => {
    setIsActive(false);
    setCurrentPhase("idle");
    stopBinaural();

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [stopBinaural]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      stopBinaural();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopBinaural]);

  // Format time display
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Calculate orb scale based on phase
  const getOrbScale = () => {
    if (!isActive) return 1;

    // Ease in-out function
    const easeInOutQuad = (t: number) => {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    };

    const easedProgress = easeInOutQuad(phaseProgress);

    if (currentPhase === "inhale") {
      return 1 + easedProgress * 0.35; // Scale from 1 to 1.35
    } else {
      return 1.35 - easedProgress * 0.35; // Scale from 1.35 to 1
    }
  };

  // Calculate ball position (0 = bottom, 1 = top)
  const getBallPosition = () => {
    if (!isActive) return 0;

    const easeInOutQuad = (t: number) => {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    };

    const easedProgress = easeInOutQuad(phaseProgress);

    if (currentPhase === "inhale") {
      return easedProgress; // 0 to 1 (bottom to top)
    } else {
      return 1 - easedProgress; // 1 to 0 (top to bottom)
    }
  };

  const orbScale = getOrbScale();
  const ballPosition = getBallPosition();

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

      {/* Session Complete Screen */}
      {isComplete && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeIn 1s ease-out",
            zIndex: 20,
            backgroundColor: COLORS.background,
          }}
        >
          <p
            style={{
              fontSize: "1.5rem",
              fontWeight: 300,
              letterSpacing: "0.1em",
              marginBottom: "2rem",
              opacity: 0.9,
            }}
          >
            Session Complete
          </p>
          <p
            style={{
              fontSize: "1rem",
              fontWeight: 300,
              opacity: 0.6,
              marginBottom: "3rem",
            }}
          >
            30 breaths · 5 minutes
          </p>
          <button
            onClick={() => {
              setIsComplete(false);
              setElapsedTime(0);
              setBreathCount(0);
            }}
            style={{
              padding: "1rem 2.5rem",
              fontSize: "0.9rem",
              fontWeight: 400,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              backgroundColor: "transparent",
              border: `1px solid ${COLORS.textDim}`,
              color: COLORS.textPrimary,
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = COLORS.accent;
              e.currentTarget.style.color = COLORS.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = COLORS.textDim;
              e.currentTarget.style.color = COLORS.textPrimary;
            }}
          >
            Close
          </button>
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
                transition: "transform 0.1s linear",
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
                transition: "transform 0.1s linear",
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
                opacity: currentPhase === "inhale" ? 1 : 0.3,
                transition: "opacity 0.3s ease",
              }}
            >
              <svg
                viewBox="0 0 32 32"
                style={{ width: "32px", height: "32px" }}
                stroke={currentPhase === "inhale" ? COLORS.accent : COLORS.textPrimary}
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
                  color: currentPhase === "inhale" ? COLORS.accent : COLORS.textDim,
                  transition: "color 0.3s ease",
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
                  transform: "translateX(-50%)",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: COLORS.accent,
                  boxShadow: `0 0 12px ${COLORS.accent}`,
                  top: `${(1 - ballPosition) * 88}px`,
                  transition: "top 0.1s linear",
                }}
              />

              {/* Top marker */}
              <div
                style={{
                  position: "absolute",
                  top: "-4px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: currentPhase === "inhale" ? COLORS.orbBase : COLORS.textDim,
                  transition: "background-color 0.3s ease",
                }}
              />

              {/* Bottom marker */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-4px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: currentPhase === "exhale" ? COLORS.orbBase : COLORS.textDim,
                  transition: "background-color 0.3s ease",
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
                opacity: currentPhase === "exhale" ? 1 : 0.3,
                transition: "opacity 0.3s ease",
              }}
            >
              <svg
                viewBox="0 0 32 32"
                style={{ width: "32px", height: "32px" }}
                stroke={currentPhase === "exhale" ? COLORS.accent : COLORS.textPrimary}
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
                  color: currentPhase === "exhale" ? COLORS.accent : COLORS.textDim,
                  transition: "color 0.3s ease",
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
                color: currentPhase === "inhale" ? COLORS.textPrimary : COLORS.textDim,
                transition: "color 0.3s ease",
              }}
            >
              {currentPhase === "inhale" ? "Breathe In" : "Breathe Out"}
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
              Headphones recommended for full affect
            </p>
          )}
        </>
      )}
    </div>
  );
}
