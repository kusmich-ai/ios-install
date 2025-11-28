"use client";
import React, { useState } from "react";
import AwarenessRep from "./AwarenessRep";

// ============================================================================
// AWARENESS REP MODAL
// Wrapper component that shows the audio meditation in a full-screen overlay
// Matches the ResonanceModal pattern for consistency
// ============================================================================

interface AwarenessRepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void; // Called when practice finishes (for auto-logging)
}

export function AwarenessRepModal({ isOpen, onClose, onComplete }: AwarenessRepModalProps) {
  if (!isOpen) return null;

  const handleComplete = () => {
    // Call the onComplete callback (this triggers auto-logging)
    if (onComplete) {
      onComplete();
    }
    // Optional: auto-close after a brief delay to show completion state
    // setTimeout(onClose, 1500);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
      }}
    >
      <AwarenessRep onComplete={handleComplete} />
      
      {/* Close button - top right */}
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
          e.currentTarget.style.borderColor = "#ff9e18";
          e.currentTarget.style.color = "#ff9e18";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(245, 242, 236, 0.3)";
          e.currentTarget.style.color = "#F5F2EC";
        }}
        aria-label="Close awareness session"
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
// Use this hook in your parent component to control the modal
// ============================================================================

export function useAwarenessRep() {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);

  return {
    isOpen,
    open,
    close,
    toggle,
    Modal: ({ onComplete }: { onComplete?: () => void }) => (
      <AwarenessRepModal isOpen={isOpen} onClose={close} onComplete={onComplete} />
    ),
  };
}

// ============================================================================
// EXAMPLE TRIGGER BUTTON (optional - use your own button styling)
// ============================================================================

export function AwarenessRepTriggerButton() {
  const { open, Modal } = useAwarenessRep();

  return (
    <>
      <button
        onClick={open}
        style={{
          padding: "1rem 2rem",
          fontSize: "0.9rem",
          fontWeight: 500,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          backgroundColor: "#0D0D0D",
          border: "1px solid #F5F2EC",
          color: "#F5F2EC",
          cursor: "pointer",
          transition: "all 0.3s ease",
          fontFamily: "'Cormorant Garamond', Georgia, serif",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#F5F2EC";
          e.currentTarget.style.color = "#0D0D0D";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#0D0D0D";
          e.currentTarget.style.color = "#F5F2EC";
        }}
      >
        Begin Awareness Rep
      </button>
      <Modal />
    </>
  );
}

export default AwarenessRepModal;
