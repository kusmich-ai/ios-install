"use client";
import React, { useState, useRef, useEffect } from "react";
import SomaticFlow, { SomaticFlowVersion } from "./SomaticFlow";
import { createClient } from "@/lib/supabase-client";

// ============================================================================
// SOMATIC FLOW MODAL
// Wrapper that shows the practice in a full-screen overlay.
// Handles:
//   - Passing currentVersion + hasSeenDemo to SomaticFlow
//   - Writing somatic_flow_last_version to Supabase on complete
//   - Writing somatic_flow_demos_seen to Supabase when demo watched
// ============================================================================

interface SomaticFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  currentVersion?: SomaticFlowVersion;
  hasSeenDemo?: boolean;           // derived from somaticFlowDemosSeen.includes(currentVersion)
  onProgressRefetch?: () => void;  // call after DB writes to keep useUserProgress in sync
}

export function SomaticFlowModal({
  isOpen,
  onClose,
  onComplete,
  currentVersion = 'original',
  hasSeenDemo = true,
  onProgressRefetch,
}: SomaticFlowModalProps) {
  const hasCompletedRef = useRef(false);
  const supabase = createClient();

  useEffect(() => {
    if (!isOpen) {
      hasCompletedRef.current = false;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── Write last version + trigger refetch on complete ──────────────────────
  const handleSessionComplete = async () => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;

    // Update somatic_flow_last_version in Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_progress')
          .update({ somatic_flow_last_version: currentVersion })
          .eq('user_id', user.id);
      }
    } catch (err) {
      console.error('[SomaticFlowModal] Failed to update last version:', err);
    }

    if (onComplete) onComplete();
    if (onProgressRefetch) onProgressRefetch();

    setTimeout(() => onClose(), 2000);
  };

  // ── Write demo seen to Supabase when watched ─────────────────────────────
  const handleDemoWatched = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch current array, append version if not already present
      const { data } = await supabase
        .from('user_progress')
        .select('somatic_flow_demos_seen')
        .eq('user_id', user.id)
        .single();

      const current: string[] = Array.isArray(data?.somatic_flow_demos_seen)
        ? data.somatic_flow_demos_seen
        : [];

      if (!current.includes(currentVersion)) {
        await supabase
          .from('user_progress')
          .update({ somatic_flow_demos_seen: [...current, currentVersion] })
          .eq('user_id', user.id);

        if (onProgressRefetch) onProgressRefetch();
      }
    } catch (err) {
      console.error('[SomaticFlowModal] Failed to update demos seen:', err);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999 }}>
      <SomaticFlow
        onComplete={handleSessionComplete}
        onDemoWatched={handleDemoWatched}
        currentVersion={currentVersion}
        hasSeenDemo={hasSeenDemo}
      />

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
          backgroundColor: "rgba(0, 0, 0, 0.5)",
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
        aria-label="Close somatic flow session"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ============================================================================
// HOOK FOR EASY USAGE
// Usage in ChatInterface:
//
//   const { isOpen, open, close, Modal } = useSomaticFlow();
//
//   // When opening, pass version data from useUserProgress:
//   open();
//
//   <Modal
//     currentVersion={progress.somaticFlowCurrentVersion}
//     hasSeenDemo={progress.somaticFlowDemosSeen.includes(progress.somaticFlowCurrentVersion)}
//     onComplete={handleSomaticFlowComplete}
//     onProgressRefetch={refetchProgress}
//   />
// ============================================================================

export function useSomaticFlow() {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);

  return {
    isOpen,
    open,
    close,
    toggle,
    Modal: ({
      onComplete,
      currentVersion,
      hasSeenDemo,
      onProgressRefetch,
    }: {
      onComplete?: () => void;
      currentVersion?: SomaticFlowVersion;
      hasSeenDemo?: boolean;
      onProgressRefetch?: () => void;
    }) => (
      <SomaticFlowModal
        isOpen={isOpen}
        onClose={close}
        onComplete={onComplete}
        currentVersion={currentVersion}
        hasSeenDemo={hasSeenDemo}
        onProgressRefetch={onProgressRefetch}
      />
    ),
  };
}

export default SomaticFlowModal;
