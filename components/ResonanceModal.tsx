"use client";
import React, { useState, useRef } from "react";
import ResonanceBreathing from "./ResonanceBreathing";

// ============================================================================
// RESONANCE MODAL
// Wrapper component that shows the breathing experience in a full-screen overlay
// Trigger this by calling the exposed open function or using the context
// ============================================================================

interface ResonanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void; // Called when practice is completed (for auto-logging)
}

export function ResonanceModal({ isOpen, onClose, onComplete }: ResonanceModalProps) {
  const hasCompletedRef = useRef(false);

  // Reset completion flag when modal opens
  if (!isOpen) {
    hasCompletedRef.current = false;
    return null;
  }

  const handleSessionComplete = () => {
    // Prevent double-calling
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;

    console.log('[ResonanceModal] Session complete, triggering onComplete');
    
    // Call the onComplete callback for auto-logging
    if (onComplete) {
      onComplete();
    }

    // Auto-close modal after brief delay to show completion state
    setTimeout(() => {
      onClose();
    }, 2000); // 2 second delay to show "Done" screen
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
      }}
    >
      <ResonanceBreathing onComplete={handleSessionComplete} />
      
      {/* Close button - top right (manual close, no auto-log) */}
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
        aria-label="Close breathing session"
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

export function useResonanceBreathing() {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);

  return {
    isOpen,
    open,
    close,
    toggle,
    // Modal component now accepts onComplete prop for auto-logging
    Modal: ({ onComplete }: { onComplete?: () => void }) => (
      <ResonanceModal isOpen={isOpen} onClose={close} onComplete={onComplete} />
    ),
  };
}

// ============================================================================
// EXAMPLE TRIGGER BUTTON (optional - use your own button styling)
// ============================================================================

export function ResonanceTriggerButton() {
  const { open, Modal } = useResonanceBreathing();

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
        Begin Breathing
      </button>
      <Modal />
    </>
  );
}

export default ResonanceModal;
