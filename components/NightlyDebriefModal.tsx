"use client";
import React, { useState, useRef } from "react";

// ============================================================================
// NIGHTLY DEBRIEF PRACTICE COMPONENT
// 2-minute end-of-day integration checkpoint
// ============================================================================

interface NightlyDebriefPracticeProps {
  onComplete: (lesson: string) => void;
}

function NightlyDebriefPractice({ onComplete }: NightlyDebriefPracticeProps) {
  const [phase, setPhase] = useState<'intro' | 'breathe' | 'reflect' | 'complete'>('intro');
  const [lesson, setLesson] = useState('');
  const [breathCount, setBreathCount] = useState(0);

  const startBreathing = () => {
    setPhase('breathe');
    // Auto-advance after 3 breaths (about 30 seconds)
    let count = 0;
    const breathInterval = setInterval(() => {
      count++;
      setBreathCount(count);
      if (count >= 3) {
        clearInterval(breathInterval);
        setPhase('reflect');
      }
    }, 10000); // 10 seconds per breath cycle (4s in + 6s out)
  };

  const skipToReflect = () => {
    setPhase('reflect');
  };

  const handleComplete = () => {
    if (!lesson.trim()) return;
    setPhase('complete');
    setTimeout(() => {
      onComplete(lesson);
    }, 2500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#F5F2EC',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* INTRO PHASE */}
      {phase === 'intro' && (
        <div style={{ maxWidth: '500px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌙</div>
          <h1 style={{ 
            fontSize: '1.75rem', 
            fontWeight: 600, 
            marginBottom: '0.5rem',
            color: '#F5F2EC'
          }}>
            Nightly Debrief
          </h1>
          <p style={{ 
            fontSize: '0.9rem', 
            color: 'rgba(245, 242, 236, 0.6)',
            marginBottom: '2rem'
          }}>
            Your 2-minute end-of-day checkpoint
          </p>

          {/* Purpose */}
          <div style={{
            backgroundColor: 'rgba(255, 158, 25, 0.1)',
            border: '1px solid rgba(255, 158, 25, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
            textAlign: 'left',
          }}>
            <p style={{ 
              fontSize: '0.9rem', 
              lineHeight: 1.7,
              color: 'rgba(245, 242, 236, 0.9)',
              margin: 0,
            }}>
              This practice encodes today's learning into insight before rest. 
              Your nervous system will consolidate it during sleep.
            </p>
          </div>

          {/* Instructions */}
          <div style={{
            textAlign: 'left',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '2rem',
            fontSize: '0.9rem',
            lineHeight: 1.7,
          }}>
            <div style={{ marginBottom: '0.75rem' }}>1. Dim the lights if you haven't</div>
            <div style={{ marginBottom: '0.75rem' }}>2. Sit or lie down comfortably</div>
            <div style={{ marginBottom: '0.75rem' }}>3. Take a few slow breaths</div>
            <div>4. Let your mind glance back through the day</div>
          </div>

          <button
            onClick={startBreathing}
            style={{
              padding: '1rem 2.5rem',
              fontSize: '1rem',
              fontWeight: 500,
              backgroundColor: '#ff9e19',
              border: 'none',
              borderRadius: '8px',
              color: '#0a0a0a',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Begin
          </button>
        </div>
      )}

      {/* BREATHE PHASE */}
      {phase === 'breathe' && (
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{
            width: '150px',
            height: '150px',
            margin: '0 auto 2rem',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 158, 25, 0.15)',
            border: '2px solid rgba(255, 158, 25, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'breathePulse 10s ease-in-out infinite',
          }}>
            <span style={{ fontSize: '3rem' }}>🌙</span>
          </div>
          
          <style>{`
            @keyframes breathePulse {
              0%, 100% { transform: scale(1); opacity: 0.8; }
              40% { transform: scale(1.15); opacity: 1; }
            }
          `}</style>

          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: 500, 
            marginBottom: '0.5rem',
            color: 'rgba(245, 242, 236, 0.9)'
          }}>
            Settle in...
          </h2>
          <p style={{ 
            fontSize: '0.9rem', 
            color: 'rgba(245, 242, 236, 0.5)',
            marginBottom: '0.5rem'
          }}>
            Inhale for 4... Exhale for 6...
          </p>
          <p style={{ 
            fontSize: '0.8rem', 
            color: 'rgba(245, 242, 236, 0.4)',
            marginBottom: '2rem'
          }}>
            Breath {breathCount + 1} of 3
          </p>

          <button
            onClick={skipToReflect}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.8rem',
              backgroundColor: 'transparent',
              border: '1px solid rgba(245, 242, 236, 0.2)',
              borderRadius: '6px',
              color: 'rgba(245, 242, 236, 0.5)',
              cursor: 'pointer',
            }}
          >
            I'm settled
          </button>
        </div>
      )}

      {/* REFLECT PHASE */}
      {phase === 'reflect' && (
        <div style={{ maxWidth: '500px', textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 600, 
            marginBottom: '0.5rem',
            color: '#ff9e19'
          }}>
            What did reality teach me today?
          </h2>
          <p style={{ 
            fontSize: '0.85rem', 
            color: 'rgba(245, 242, 236, 0.5)',
            marginBottom: '2rem'
          }}>
            Don't overthink it. What's the one lesson, insight, or pattern that wants to be named?
          </p>

          <textarea
            value={lesson}
            onChange={(e) => setLesson(e.target.value)}
            placeholder="Today I learned..."
            autoFocus
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '1rem',
              fontSize: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 158, 25, 0.3)',
              borderRadius: '8px',
              color: '#F5F2EC',
              resize: 'vertical',
              marginBottom: '1.5rem',
              fontFamily: 'inherit',
              lineHeight: 1.6,
            }}
          />

          <button
            onClick={handleComplete}
            disabled={!lesson.trim()}
            style={{
              padding: '1rem 2.5rem',
              fontSize: '1rem',
              fontWeight: 500,
              backgroundColor: lesson.trim() ? '#ff9e19' : 'rgba(255, 158, 25, 0.3)',
              border: 'none',
              borderRadius: '8px',
              color: lesson.trim() ? '#0a0a0a' : 'rgba(10, 10, 10, 0.5)',
              cursor: lesson.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
            }}
          >
            Integrate & Rest
          </button>
        </div>
      )}

      {/* COMPLETE PHASE */}
      {phase === 'complete' && (
        <div style={{ textAlign: 'center', maxWidth: '450px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: 600, 
            marginBottom: '1rem',
            color: '#22c55e'
          }}>
            Lesson received — day integrated
          </h2>
          
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            fontStyle: 'italic',
            color: 'rgba(245, 242, 236, 0.8)',
            fontSize: '0.95rem',
            lineHeight: 1.6,
          }}>
            "{lesson}"
          </div>
          
          <p style={{ 
            fontSize: '0.9rem', 
            color: 'rgba(245, 242, 236, 0.5)'
          }}>
            Rest well 🌙
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MODAL WRAPPER
// ============================================================================

interface NightlyDebriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (lesson: string) => void;
}

export function NightlyDebriefModal({ isOpen, onClose, onComplete }: NightlyDebriefModalProps) {
  const hasCompletedRef = useRef(false);

  if (!isOpen) {
    hasCompletedRef.current = false;
    return null;
  }

  const handleSessionComplete = (lesson: string) => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;

    console.log('[NightlyDebriefModal] Session complete, triggering onComplete');
    
    if (onComplete) {
      onComplete(lesson);
    }

    setTimeout(() => {
      onClose();
    }, 2500);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999 }}>
      <NightlyDebriefPractice onComplete={handleSessionComplete} />
      
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

export function useNightlyDebrief() {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return {
    isOpen,
    open,
    close,
    Modal: ({ onComplete }: { onComplete?: (lesson: string) => void }) => (
      <NightlyDebriefModal isOpen={isOpen} onClose={close} onComplete={onComplete} />
    ),
  };
}

export default NightlyDebriefModal;
