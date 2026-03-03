"use client";
import React, { useState, useRef } from "react";

// ============================================================================
// NOS GLIDE MODAL (Simplified)
// Instructional reference card for the 3-phase physiological descent sequence
// User reads the steps, does the practice on their own, marks complete
// ============================================================================

interface NosGlidePracticeProps {
  onComplete: () => void;
}

function NosGlidePractice({ onComplete }: NosGlidePracticeProps) {
  const [phase, setPhase] = useState<"instructions" | "complete">("instructions");

  const handleComplete = () => {
    setPhase("complete");
    setTimeout(() => onComplete(), 2000);
  };

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
      {/* ── INSTRUCTIONS ─────────────────────────────────── */}
      {phase === "instructions" && (
        <div style={{ maxWidth: "500px", textAlign: "center", paddingBottom: "2rem" }}>
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
              color: "rgba(245, 242, 236, 0.5)",
              marginBottom: "0.25rem",
            }}
          >
            Sequence your nervous system from activation into rest
          </p>
          <p
            style={{
              fontSize: "0.75rem",
              color: "rgba(245, 242, 236, 0.3)",
              marginBottom: "2rem",
            }}
          >
            5–10 minutes · Lying down · Last thing before sleep
          </p>

          {/* 3 Phase Cards */}
          <div style={{ textAlign: "left", marginBottom: "2rem" }}>

            {/* Phase 1: Breath Descent */}
            <div
              style={{
                padding: "1.25rem",
                backgroundColor: "rgba(255, 158, 25, 0.06)",
                border: "1px solid rgba(255, 158, 25, 0.15)",
                borderRadius: "14px",
                marginBottom: "0.75rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 158, 25, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "#ff9e19",
                    flexShrink: 0,
                  }}
                >
                  01
                </div>
                <div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#F5F2EC" }}>
                    Breath Descent
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "rgba(245, 242, 236, 0.35)" }}>~1 minute</div>
                </div>
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "rgba(245, 242, 236, 0.6)",
                  lineHeight: 1.7,
                  paddingLeft: "0.25rem",
                }}
              >
                <div style={{ marginBottom: "0.4rem" }}>
                  <span style={{ color: "rgba(255, 158, 25, 0.8)" }}>Inhale</span> through your nose for{" "}
                  <strong style={{ color: "#F5F2EC" }}>4 seconds</strong>
                </div>
                <div style={{ marginBottom: "0.6rem" }}>
                  <span style={{ color: "rgba(255, 158, 25, 0.8)" }}>Exhale</span> slowly for{" "}
                  <strong style={{ color: "#F5F2EC" }}>6 seconds</strong>
                </div>
                <div style={{ fontSize: "0.8rem", color: "rgba(245, 242, 236, 0.4)" }}>
                  Repeat for 6 cycles. This signals your system that threat level is dropping.
                </div>
              </div>
            </div>

            {/* Phase 2: Progressive Release */}
            <div
              style={{
                padding: "1.25rem",
                backgroundColor: "rgba(100, 180, 160, 0.04)",
                border: "1px solid rgba(100, 180, 160, 0.12)",
                borderRadius: "14px",
                marginBottom: "0.75rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(100, 180, 160, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "rgba(100, 180, 160, 0.8)",
                    flexShrink: 0,
                  }}
                >
                  02
                </div>
                <div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#F5F2EC" }}>
                    Progressive Release
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "rgba(245, 242, 236, 0.35)" }}>~3 minutes</div>
                </div>
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "rgba(245, 242, 236, 0.6)",
                  lineHeight: 1.7,
                  paddingLeft: "0.25rem",
                }}
              >
                <div style={{ marginBottom: "0.5rem" }}>
                  For each body region: <strong style={{ color: "#F5F2EC" }}>tense for 5 seconds</strong>, then{" "}
                  <strong style={{ color: "#F5F2EC" }}>release completely</strong>.
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.35rem 1rem",
                    fontSize: "0.8rem",
                    color: "rgba(245, 242, 236, 0.5)",
                    margin: "0.5rem 0",
                  }}
                >
                  <div>① Legs & feet</div>
                  <div>② Arms & hands</div>
                  <div>③ Jaw & face</div>
                  <div>④ Abdomen & core</div>
                </div>
                <div style={{ fontSize: "0.8rem", color: "rgba(245, 242, 236, 0.4)", marginTop: "0.4rem" }}>
                  Feel the contrast between tension and release each time. This completes residual activation held in the muscles.
                </div>
              </div>
            </div>

            {/* Phase 3: Earned Stillness */}
            <div
              style={{
                padding: "1.25rem",
                backgroundColor: "rgba(80, 120, 200, 0.04)",
                border: "1px solid rgba(80, 120, 200, 0.1)",
                borderRadius: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(80, 120, 200, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "rgba(80, 120, 200, 0.7)",
                    flexShrink: 0,
                  }}
                >
                  03
                </div>
                <div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#F5F2EC" }}>
                    Earned Stillness
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "rgba(245, 242, 236, 0.35)" }}>~1–2 minutes</div>
                </div>
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "rgba(245, 242, 236, 0.6)",
                  lineHeight: 1.7,
                  paddingLeft: "0.25rem",
                }}
              >
                <div style={{ marginBottom: "0.4rem" }}>
                  Nothing to do. Nothing to fix. Just lie still and let the stillness be here.
                </div>
                <div style={{ fontSize: "0.8rem", color: "rgba(245, 242, 236, 0.4)" }}>
                  By now it's not forced — it's earned. Your system is in descent. Rest.
                </div>
              </div>
            </div>
          </div>

          {/* Tip */}
          <div
            style={{
              padding: "0.65rem 1rem",
              backgroundColor: "rgba(245, 242, 236, 0.03)",
              borderRadius: "8px",
              fontSize: "0.75rem",
              color: "rgba(245, 242, 236, 0.35)",
              fontStyle: "italic",
              marginBottom: "1.75rem",
              lineHeight: 1.6,
            }}
          >
            Your NOS doesn't respond to "relax" — it responds to sequence. Over time, the pattern gets faster.
          </div>

          {/* Action Button */}
          <button
            onClick={handleComplete}
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
            Mark Complete
          </button>
        </div>
      )}

      {/* ── COMPLETE ─────────────────────────────────────── */}
      {phase === "complete" && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.8 }}>🌊</div>
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

export function NosGlideModalComponent({ isOpen, onClose, onComplete }: NosGlideModalProps) {
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
    }, 2000);
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
      <NosGlideModalComponent isOpen={isOpen} onClose={close} onComplete={onComplete} />
    ),
  };
}

export default NosGlideModalComponent;
