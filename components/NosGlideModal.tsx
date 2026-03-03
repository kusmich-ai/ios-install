"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";

// ============================================================================
// NOS GLIDE MODAL
// 5-10 minute physiological transition sequence for sleep preparation
// 3 phases: Breath Descent → Progressive Release → Earned Stillness
// ============================================================================

// Body regions for Progressive Release phase
const BODY_REGIONS = [
  {
    id: "legs",
    name: "Legs & Feet",
    instruction: "Tense your legs and feet — squeeze everything tight for 5 seconds...",
    release: "Now release completely. Feel the tension drain out through your feet.",
    duration: 20,
  },
  {
    id: "arms",
    name: "Arms & Hands",
    instruction: "Make fists and tense your arms — biceps, forearms, hands — hold for 5 seconds...",
    release: "Let go. Let your arms fall heavy. Feel the difference between tension and release.",
    duration: 20,
  },
  {
    id: "jaw",
    name: "Jaw & Face",
    instruction: "Clench your jaw, scrunch your face tight — hold for 5 seconds...",
    release: "Release. Let your jaw drop slightly open. Soften your forehead. Let your tongue rest.",
    duration: 20,
  },
  {
    id: "abdomen",
    name: "Abdomen & Core",
    instruction: "Tighten your stomach and core — brace everything — hold for 5 seconds...",
    release: "Release fully. Feel your belly soften. Let your breath move naturally into the space you've created.",
    duration: 20,
  },
];

interface NosGlidePracticeProps {
  onComplete: () => void;
}

function NosGlidePractice({ onComplete }: NosGlidePracticeProps) {
  const [phase, setPhase] = useState<
    "intro" | "breath" | "release" | "stillness" | "complete"
  >("intro");

  // Breath Descent state
  const [breathCycle, setBreathCycle] = useState(0);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [breathProgress, setBreathProgress] = useState(0);
  const breathTimerRef = useRef<NodeJS.Timeout | null>(null);
  const breathIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Progressive Release state
  const [regionIndex, setRegionIndex] = useState(0);
  const [regionPhase, setRegionPhase] = useState<"tense" | "release" | "rest">("tense");
  const regionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Stillness state
  const [stillnessSeconds, setStillnessSeconds] = useState(0);
  const stillnessTimerRef = useRef<NodeJS.Timeout | null>(null);
  const STILLNESS_DURATION = 90; // 1.5 minutes

  // Cleanup all timers
  const clearAllTimers = useCallback(() => {
    if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
    if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
    if (regionTimerRef.current) clearTimeout(regionTimerRef.current);
    if (stillnessTimerRef.current) clearInterval(stillnessTimerRef.current);
  }, []);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  // ── BREATH DESCENT LOGIC ──────────────────────────────
  // 6 cycles of 4s inhale → 6s exhale
  const TOTAL_BREATH_CYCLES = 6;
  const INHALE_MS = 4000;
  const EXHALE_MS = 6000;
  const CYCLE_MS = INHALE_MS + EXHALE_MS;

  const startBreathDescent = () => {
    setPhase("breath");
    setBreathCycle(0);
    setBreathPhase("inhale");
    setBreathProgress(0);
    runBreathCycle(0);
  };

  const runBreathCycle = (cycle: number) => {
    if (cycle >= TOTAL_BREATH_CYCLES) {
      // Move to progressive release
      setTimeout(() => setPhase("release"), 1000);
      return;
    }

    setBreathCycle(cycle);
    setBreathPhase("inhale");
    setBreathProgress(0);

    // Progress animation for inhale
    const inhaleStart = Date.now();
    const inhaleInterval = setInterval(() => {
      const elapsed = Date.now() - inhaleStart;
      setBreathProgress(Math.min(elapsed / INHALE_MS, 1));
    }, 50);

    // After inhale, switch to exhale
    breathTimerRef.current = setTimeout(() => {
      clearInterval(inhaleInterval);
      setBreathPhase("exhale");
      setBreathProgress(0);

      const exhaleStart = Date.now();
      const exhaleInterval = setInterval(() => {
        const elapsed = Date.now() - exhaleStart;
        setBreathProgress(Math.min(elapsed / EXHALE_MS, 1));
      }, 50);

      breathIntervalRef.current = exhaleInterval as unknown as NodeJS.Timeout;

      // After exhale, next cycle
      breathTimerRef.current = setTimeout(() => {
        clearInterval(exhaleInterval);
        runBreathCycle(cycle + 1);
      }, EXHALE_MS);
    }, INHALE_MS);
  };

  // ── PROGRESSIVE RELEASE LOGIC ─────────────────────────
  useEffect(() => {
    if (phase !== "release") return;

    const runRegionSequence = () => {
      setRegionPhase("tense");

      // After 7s of tensing, switch to release
      regionTimerRef.current = setTimeout(() => {
        setRegionPhase("release");

        // After 8s of releasing, switch to rest
        regionTimerRef.current = setTimeout(() => {
          setRegionPhase("rest");

          // After 5s rest, next region or move to stillness
          regionTimerRef.current = setTimeout(() => {
            if (regionIndex < BODY_REGIONS.length - 1) {
              setRegionIndex((prev) => prev + 1);
            } else {
              // All regions done, move to stillness
              setPhase("stillness");
            }
          }, 5000);
        }, 8000);
      }, 7000);
    };

    runRegionSequence();

    return () => {
      if (regionTimerRef.current) clearTimeout(regionTimerRef.current);
    };
  }, [phase, regionIndex]);

  // ── STILLNESS LOGIC ───────────────────────────────────
  useEffect(() => {
    if (phase !== "stillness") return;

    setStillnessSeconds(0);
    stillnessTimerRef.current = setInterval(() => {
      setStillnessSeconds((prev) => {
        if (prev + 1 >= STILLNESS_DURATION) {
          if (stillnessTimerRef.current) clearInterval(stillnessTimerRef.current);
          setPhase("complete");
          return prev + 1;
        }
        return prev + 1;
      });
    }, 1000);

    return () => {
      if (stillnessTimerRef.current) clearInterval(stillnessTimerRef.current);
    };
  }, [phase]);

  // ── COMPLETION ────────────────────────────────────────
  useEffect(() => {
    if (phase === "complete") {
      const timer = setTimeout(() => onComplete(), 3000);
      return () => clearTimeout(timer);
    }
  }, [phase, onComplete]);

  const skipToComplete = () => {
    clearAllTimers();
    setPhase("complete");
  };

  // ── RENDER HELPERS ────────────────────────────────────
  const getOrbSize = () => {
    if (phase === "breath") {
      if (breathPhase === "inhale") return 140 + breathProgress * 40;
      if (breathPhase === "exhale") return 180 - breathProgress * 40;
      return 140;
    }
    if (phase === "release") {
      if (regionPhase === "tense") return 170;
      if (regionPhase === "release") return 130;
      return 140;
    }
    return 140;
  };

  const getOrbOpacity = () => {
    if (phase === "breath") {
      return breathPhase === "inhale" ? 0.15 + breathProgress * 0.15 : 0.3 - breathProgress * 0.15;
    }
    if (phase === "release") {
      return regionPhase === "tense" ? 0.25 : 0.1;
    }
    if (phase === "stillness") return 0.08;
    return 0.15;
  };

  const getOrbColor = () => {
    if (phase === "stillness") return "80, 120, 200"; // cool blue for rest
    if (phase === "release" && regionPhase === "release") return "100, 180, 160"; // teal for release
    return "255, 158, 25"; // amber default
  };

  const orbSize = getOrbSize();
  const orbOpacity = getOrbOpacity();
  const orbColor = getOrbColor();

  return (
    <div
      style={{
        minHeight: "0",
        height: "100dvh",
        backgroundColor: "#0a0a0a",
        color: "#F5F2EC",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        overflow: "auto",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      {/* ── INTRO PHASE ─────────────────────────────────── */}
      {phase === "intro" && (
        <div
          style={{
            maxWidth: "500px",
            textAlign: "center",
            paddingBottom: "2.5rem",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌊</div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
              color: "#F5F2EC",
            }}
          >
            NOS Glide
          </h1>
          <p
            style={{
              fontSize: "0.9rem",
              color: "rgba(245, 242, 236, 0.6)",
              marginBottom: "2rem",
            }}
          >
            Sequence your nervous system from activation into rest
          </p>

          {/* 3-Phase Overview */}
          <div
            style={{
              textAlign: "left",
              marginBottom: "2rem",
            }}
          >
            {[
              {
                num: "01",
                name: "Breath Descent",
                desc: "6 cycles of 4-in, 6-out — signals threat level dropping",
                time: "~1 min",
              },
              {
                num: "02",
                name: "Progressive Release",
                desc: "Legs → Arms → Jaw → Abdomen — completes residual activation",
                time: "~3 min",
              },
              {
                num: "03",
                name: "Earned Stillness",
                desc: "By now it's not forced — it's earned",
                time: "~1.5 min",
              },
            ].map((step, i) => (
              <div
                key={step.num}
                style={{
                  display: "flex",
                  gap: "1rem",
                  padding: "1rem 1.25rem",
                  backgroundColor:
                    i === 0
                      ? "rgba(255, 158, 25, 0.08)"
                      : "rgba(245, 242, 236, 0.02)",
                  borderRadius: "12px",
                  marginBottom: "0.5rem",
                  border:
                    i === 0
                      ? "1px solid rgba(255, 158, 25, 0.2)"
                      : "1px solid rgba(245, 242, 236, 0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color:
                      i === 0
                        ? "#ff9e19"
                        : "rgba(245, 242, 236, 0.3)",
                    letterSpacing: "0.05em",
                    paddingTop: "0.15rem",
                    flexShrink: 0,
                    width: "1.5rem",
                  }}
                >
                  {step.num}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: "#F5F2EC",
                      marginBottom: "0.2rem",
                    }}
                  >
                    {step.name}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "rgba(245, 242, 236, 0.5)",
                      lineHeight: 1.5,
                    }}
                  >
                    {step.desc}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "rgba(245, 242, 236, 0.3)",
                    flexShrink: 0,
                    paddingTop: "0.2rem",
                  }}
                >
                  {step.time}
                </div>
              </div>
            ))}
          </div>

          {/* Tip */}
          <div
            style={{
              padding: "0.75rem 1rem",
              backgroundColor: "rgba(245, 242, 236, 0.03)",
              borderRadius: "8px",
              fontSize: "0.8rem",
              color: "rgba(245, 242, 236, 0.4)",
              fontStyle: "italic",
              marginBottom: "2rem",
              lineHeight: 1.6,
            }}
          >
            Best done lying down, as the last thing before sleep. Your NOS
            doesn't respond to "relax" — it responds to sequence.
          </div>

          {/* Start Button */}
          <button
            onClick={startBreathDescent}
            style={{
              width: "100%",
              maxWidth: "320px",
              padding: "1rem 2rem",
              fontSize: "0.9rem",
              fontWeight: 500,
              backgroundColor: "#ff9e19",
              border: "none",
              borderRadius: "10px",
              color: "#0a0a0a",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Begin Glide
          </button>
        </div>
      )}

      {/* ── PHASE 1: BREATH DESCENT ──────────────────────── */}
      {phase === "breath" && (
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          {/* Phase label */}
          <div
            style={{
              fontSize: "0.65rem",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "rgba(255, 158, 25, 0.6)",
              marginBottom: "0.5rem",
            }}
          >
            Phase 1 of 3
          </div>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 300,
              letterSpacing: "0.1em",
              color: "#F5F2EC",
              marginBottom: "2.5rem",
            }}
          >
            Breath Descent
          </h2>

          {/* Breathing orb */}
          <div
            style={{
              width: `${orbSize}px`,
              height: `${orbSize}px`,
              margin: "0 auto 2.5rem",
              borderRadius: "50%",
              backgroundColor: `rgba(${orbColor}, ${orbOpacity})`,
              border: `1.5px solid rgba(${orbColor}, 0.3)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: `0 0 ${orbSize * 0.3}px rgba(${orbColor}, ${orbOpacity * 0.5})`,
            }}
          >
            <span
              style={{
                fontSize: "1.5rem",
                fontWeight: 200,
                color: `rgba(${orbColor}, 0.8)`,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              {breathPhase === "inhale" ? "In" : "Out"}
            </span>
          </div>

          {/* Timing cue */}
          <div
            style={{
              fontSize: "1rem",
              color: "rgba(245, 242, 236, 0.7)",
              marginBottom: "0.75rem",
            }}
          >
            {breathPhase === "inhale" ? (
              <>
                <span style={{ color: "#ff9e19" }}>Inhale</span> through your
                nose — 4 seconds
              </>
            ) : (
              <>
                <span style={{ color: "#ff9e19" }}>Exhale</span> slowly — 6
                seconds
              </>
            )}
          </div>

          {/* Cycle counter */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "0.5rem",
              marginBottom: "2.5rem",
            }}
          >
            {Array.from({ length: TOTAL_BREATH_CYCLES }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor:
                    i < breathCycle
                      ? "#ff9e19"
                      : i === breathCycle
                      ? "rgba(255, 158, 25, 0.5)"
                      : "rgba(245, 242, 236, 0.15)",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>

          {/* Reassurance */}
          <div
            style={{
              fontSize: "0.8rem",
              color: "rgba(245, 242, 236, 0.35)",
              fontStyle: "italic",
              marginBottom: "2rem",
            }}
          >
            Signaling your system that threat level is dropping
          </div>

          <button
            onClick={skipToComplete}
            style={{
              padding: "0.5rem 1.25rem",
              fontSize: "0.75rem",
              backgroundColor: "transparent",
              border: "1px solid rgba(245, 242, 236, 0.15)",
              borderRadius: "6px",
              color: "rgba(245, 242, 236, 0.4)",
              cursor: "pointer",
            }}
          >
            End Early
          </button>
        </div>
      )}

      {/* ── PHASE 2: PROGRESSIVE RELEASE ─────────────────── */}
      {phase === "release" && (
        <div style={{ textAlign: "center", maxWidth: "420px" }}>
          {/* Phase label */}
          <div
            style={{
              fontSize: "0.65rem",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "rgba(100, 180, 160, 0.7)",
              marginBottom: "0.5rem",
            }}
          >
            Phase 2 of 3
          </div>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 300,
              letterSpacing: "0.1em",
              color: "#F5F2EC",
              marginBottom: "2rem",
            }}
          >
            Progressive Release
          </h2>

          {/* Orb */}
          <div
            style={{
              width: `${orbSize}px`,
              height: `${orbSize}px`,
              margin: "0 auto 2rem",
              borderRadius: "50%",
              backgroundColor: `rgba(${orbColor}, ${orbOpacity})`,
              border: `1.5px solid rgba(${orbColor}, 0.25)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: `0 0 ${orbSize * 0.25}px rgba(${orbColor}, ${orbOpacity * 0.4})`,
            }}
          >
            <span style={{ fontSize: "0.85rem", fontWeight: 300, color: "rgba(245, 242, 236, 0.6)" }}>
              {regionPhase === "tense"
                ? "Tense"
                : regionPhase === "release"
                ? "Release"
                : "Rest"}
            </span>
          </div>

          {/* Region name */}
          <div
            style={{
              fontSize: "1.1rem",
              fontWeight: 600,
              color: "#F5F2EC",
              marginBottom: "0.75rem",
            }}
          >
            {BODY_REGIONS[regionIndex].name}
          </div>

          {/* Instruction */}
          <div
            style={{
              fontSize: "0.9rem",
              color: "rgba(245, 242, 236, 0.7)",
              lineHeight: 1.7,
              marginBottom: "1.5rem",
              minHeight: "3rem",
              padding: "0 0.5rem",
            }}
          >
            {regionPhase === "tense"
              ? BODY_REGIONS[regionIndex].instruction
              : regionPhase === "release"
              ? BODY_REGIONS[regionIndex].release
              : "Feel the difference between tension and ease..."}
          </div>

          {/* Region progress dots */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "0.75rem",
              marginBottom: "2rem",
            }}
          >
            {BODY_REGIONS.map((region, i) => (
              <div
                key={region.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor:
                      i < regionIndex
                        ? "rgba(100, 180, 160, 0.8)"
                        : i === regionIndex
                        ? regionPhase === "tense"
                          ? "rgba(255, 158, 25, 0.6)"
                          : "rgba(100, 180, 160, 0.6)"
                        : "rgba(245, 242, 236, 0.12)",
                    transition: "all 0.4s ease",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.6rem",
                    color:
                      i === regionIndex
                        ? "rgba(245, 242, 236, 0.5)"
                        : "rgba(245, 242, 236, 0.2)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {region.id}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={skipToComplete}
            style={{
              padding: "0.5rem 1.25rem",
              fontSize: "0.75rem",
              backgroundColor: "transparent",
              border: "1px solid rgba(245, 242, 236, 0.15)",
              borderRadius: "6px",
              color: "rgba(245, 242, 236, 0.4)",
              cursor: "pointer",
            }}
          >
            End Early
          </button>
        </div>
      )}

      {/* ── PHASE 3: EARNED STILLNESS ────────────────────── */}
      {phase === "stillness" && (
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          {/* Phase label */}
          <div
            style={{
              fontSize: "0.65rem",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "rgba(80, 120, 200, 0.6)",
              marginBottom: "0.5rem",
            }}
          >
            Phase 3 of 3
          </div>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 300,
              letterSpacing: "0.1em",
              color: "#F5F2EC",
              marginBottom: "3rem",
            }}
          >
            Earned Stillness
          </h2>

          {/* Minimal orb — very dim, slow pulse */}
          <div
            style={{
              width: "140px",
              height: "140px",
              margin: "0 auto 3rem",
              borderRadius: "50%",
              backgroundColor: "rgba(80, 120, 200, 0.06)",
              border: "1px solid rgba(80, 120, 200, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "stillnessPulse 8s ease-in-out infinite",
              boxShadow: "0 0 60px rgba(80, 120, 200, 0.04)",
            }}
          >
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 200,
                color: "rgba(80, 120, 200, 0.4)",
                letterSpacing: "0.2em",
              }}
            >
              rest
            </span>
          </div>

          {/* Minimal instruction */}
          <div
            style={{
              fontSize: "0.85rem",
              color: "rgba(245, 242, 236, 0.4)",
              lineHeight: 1.8,
              marginBottom: "2rem",
            }}
          >
            Nothing to do. Nothing to fix.
            <br />
            Just let the stillness be here.
          </div>

          {/* Time remaining — very subtle */}
          <div
            style={{
              fontSize: "0.7rem",
              color: "rgba(245, 242, 236, 0.2)",
              marginBottom: "2rem",
            }}
          >
            {Math.ceil((STILLNESS_DURATION - stillnessSeconds) / 60)} min
            remaining
          </div>

          <button
            onClick={skipToComplete}
            style={{
              padding: "0.5rem 1.25rem",
              fontSize: "0.75rem",
              backgroundColor: "transparent",
              border: "1px solid rgba(245, 242, 236, 0.1)",
              borderRadius: "6px",
              color: "rgba(245, 242, 236, 0.3)",
              cursor: "pointer",
            }}
          >
            End & Complete
          </button>

          {/* CSS animation for stillness pulse */}
          <style>{`
            @keyframes stillnessPulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.03); opacity: 0.85; }
            }
          `}</style>
        </div>
      )}

      {/* ── COMPLETE PHASE ───────────────────────────────── */}
      {phase === "complete" && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.8 }}>
            🌊
          </div>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
              color: "rgba(80, 120, 200, 0.9)",
            }}
          >
            NOS Glide Complete
          </h2>
          <p
            style={{
              fontSize: "0.9rem",
              color: "rgba(245, 242, 236, 0.5)",
              lineHeight: 1.6,
            }}
          >
            Your system is in descent. Rest well.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MODAL WRAPPER
// ============================================================================

interface NosGlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export function NosGlideModalComponent({
  isOpen,
  onClose,
  onComplete,
}: NosGlideModalProps) {
  const hasCompletedRef = useRef(false);

  if (!isOpen) {
    hasCompletedRef.current = false;
    return null;
  }

  const handleSessionComplete = () => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;

    console.log("[NosGlideModal] Session complete");

    if (onComplete) {
      onComplete();
    }

    setTimeout(() => {
      onClose();
    }, 3000);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999 }}>
      <NosGlidePractice onComplete={handleSessionComplete} />

      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: "fixed",
          top: "1.5rem",
          right: "1.5rem",
          width: "44px",
          height: "44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "transparent",
          border: "1px solid rgba(245, 242, 236, 0.3)",
          borderRadius: "50%",
          color: "#F5F2EC",
          cursor: "pointer",
          transition: "all 0.3s ease",
          zIndex: 10000,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#ff9e19";
          e.currentTarget.style.color = "#ff9e19";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(245, 242, 236, 0.3)";
          e.currentTarget.style.color = "#F5F2EC";
        }}
        aria-label="Close practice"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ============================================================================
// HOOK FOR EASY USAGE
// ============================================================================

export function useNosGlide() {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return {
    isOpen,
    open,
    close,
    Modal: ({ onComplete }: { onComplete?: () => void }) => (
      <NosGlideModalComponent
        isOpen={isOpen}
        onClose={close}
        onComplete={onComplete}
      />
    ),
  };
}

export default NosGlideModalComponent;
