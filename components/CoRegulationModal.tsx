"use client";
import React, { useState, useRef, useEffect } from "react";

// ============================================================================
// CO-REGULATION PRACTICE COMPONENT
// 3-5 minute compassion practice with 5-day rotation
// Two paths: Guided (with audio) or Self-Guided (simple instructions)
// ============================================================================

const CO_REG_ROTATION = [
  { day: 1, target: "Friend", description: "Someone you care about deeply" },
  { day: 2, target: "Neutral person", description: "Someone you see regularly but don't know well" },
  { day: 3, target: "Yourself", description: "Direct this compassion inward" },
  { day: 4, target: "Difficult person", description: "Someone you find challenging" },
  { day: 5, target: "All beings", description: "Expand to include everyone" },
];

function getTodaysTarget() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const rotationIndex = dayOfYear % 5;
  return CO_REG_ROTATION[rotationIndex];
}

interface CoRegulationPracticeProps {
  onComplete: () => void;
}

function CoRegulationPractice({ onComplete }: CoRegulationPracticeProps) {
  const [phase, setPhase] = useState<'intro' | 'guided' | 'self-guided' | 'reflection' | 'complete'>('intro');
  const [reflection, setReflection] = useState('');
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'exhale'>('inhale');
  const breathRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const todaysTarget = getTodaysTarget();

  // Breath cycle for guided mode only
  useEffect(() => {
    if (phase === 'guided') {
      const breathCycle = () => {
        setBreathPhase('inhale');
        setTimeout(() => setBreathPhase('exhale'), 4000);
      };
      breathCycle();
      breathRef.current = setInterval(breathCycle, 10000);
      return () => {
        if (breathRef.current) clearInterval(breathRef.current);
      };
    }
  }, [phase]);

  const startGuided = () => {
    setPhase('guided');
  };

  const startSelfGuided = () => {
    setPhase('self-guided');
  };

  const skipToReflection = () => {
    if (breathRef.current) clearInterval(breathRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPhase('reflection');
  };

  const handleComplete = () => {
    setPhase('complete');
    setTimeout(() => {
      onComplete();
    }, 2000);
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
      {/* ── INTRO PHASE ─────────────────────────────────── */}
      {phase === 'intro' && (
        <div style={{ maxWidth: '500px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💞</div>
          <h1 style={{ 
            fontSize: '1.75rem', 
            fontWeight: 600, 
            marginBottom: '0.5rem',
            color: '#F5F2EC'
          }}>
            Co-Regulation Practice
          </h1>
          <p style={{ 
            fontSize: '0.9rem', 
            color: 'rgba(245, 242, 236, 0.6)',
            marginBottom: '2rem'
          }}>
            Train your social nervous system to stay open in connection
          </p>

          {/* Today's Target */}
          <div style={{
            backgroundColor: 'rgba(255, 158, 25, 0.1)',
            border: '1px solid rgba(255, 158, 25, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}>
            <div style={{ 
              fontSize: '0.75rem', 
              textTransform: 'uppercase', 
              letterSpacing: '0.1em',
              color: '#ff9e19',
              marginBottom: '0.5rem'
            }}>
              Day {todaysTarget.day} of 5 — Today's Focus
            </div>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: 600,
              marginBottom: '0.25rem'
            }}>
              {todaysTarget.target}
            </div>
            <div style={{ 
              fontSize: '0.85rem', 
              color: 'rgba(245, 242, 236, 0.6)'
            }}>
              {todaysTarget.description}
            </div>
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
            <div style={{ marginBottom: '0.75rem' }}>1. Bring <strong>{todaysTarget.target.toLowerCase()}</strong> to mind — visualize their face</div>
            <div style={{ marginBottom: '0.75rem' }}>2. Place hand on your chest</div>
            <div style={{ marginBottom: '0.75rem' }}>3. On each <strong>inhale</strong>: "Be blessed"</div>
            <div style={{ marginBottom: '0.75rem' }}>4. On each <strong>exhale</strong>: "I wish you peace and love"</div>
            <div>5. Notice any warmth or softness (don't force it)</div>
          </div>

          {/* Dual Path Buttons */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '0.75rem', 
            alignItems: 'center',
          }}>
            <button
              onClick={startSelfGuided}
              style={{
                width: '100%',
                maxWidth: '320px',
                padding: '1rem 2rem',
                fontSize: '0.9rem',
                fontWeight: 500,
                backgroundColor: '#ff9e19',
                border: 'none',
                borderRadius: '10px',
                color: '#0a0a0a',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Start Ritual
            </button>
            <button
              onClick={startGuided}
              style={{
                padding: '0.6rem 1.25rem',
                fontSize: '0.8rem',
                backgroundColor: 'transparent',
                border: '1px solid rgba(245, 242, 236, 0.15)',
                borderRadius: '8px',
                color: 'rgba(245, 242, 236, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="8,5 19,12 8,19" />
              </svg>
              Start with Audio Guide
            </button>
          </div>
        </div>
      )}

      {/* ── GUIDED PHASE (with audio) ────────────────────── */}
      {phase === 'guided' && (
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <audio
            ref={audioRef}
            autoPlay
            src="/audio/Relational.mp3"
            style={{ display: 'none' }}
            onEnded={() => {
              if (breathRef.current) clearInterval(breathRef.current);
              setPhase('reflection');
            }}
          />

          <div style={{ marginBottom: '3rem' }}>
            <div style={{
              width: '150px',
              height: '150px',
              margin: '0 auto 2rem',
              borderRadius: '50%',
              backgroundColor: breathPhase === 'inhale' 
                ? 'rgba(255, 158, 25, 0.2)' 
                : 'rgba(255, 158, 25, 0.1)',
              border: '2px solid #ff9e19',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.5s ease',
              transform: breathPhase === 'inhale' ? 'scale(1.1)' : 'scale(1)',
            }}>
              <span style={{ fontSize: '3rem' }}>💞</span>
            </div>
            
            <div style={{
              fontSize: '1.1rem',
              color: 'rgba(245, 242, 236, 0.9)',
              lineHeight: 1.8,
              marginBottom: '2rem',
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: '#ff9e19', fontWeight: 500 }}>Inhale</span> — "Be Blessed"
              </div>
              <div>
                <span style={{ color: '#ff9e19', fontWeight: 500 }}>Exhale</span> — "I wish you peace and love"
              </div>
            </div>
          </div>

          <div style={{
            fontSize: '0.9rem',
            color: 'rgba(245, 242, 236, 0.6)',
            marginBottom: '2rem',
          }}>
            <span style={{ color: 'rgba(245, 242, 236, 0.4)' }}>Focus:</span> {todaysTarget.target}
          </div>

          <button
            onClick={skipToReflection}
            style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.8rem',
              backgroundColor: 'transparent',
              border: '1px solid rgba(245, 242, 236, 0.2)',
              borderRadius: '6px',
              color: 'rgba(245, 242, 236, 0.5)',
              cursor: 'pointer',
            }}
          >
            End Early
          </button>
        </div>
      )}

      {/* ── SELF-GUIDED PHASE (simple instructions) ──────── */}
      {phase === 'self-guided' && (
        <div style={{ textAlign: 'center', maxWidth: '420px' }}>
          {/* Title */}
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 300,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#F5F2EC',
            marginBottom: '0.25rem',
          }}>
            Co-Regulation
          </h2>
          <p style={{
            fontSize: '0.8rem',
            color: 'rgba(245, 242, 236, 0.5)',
            marginBottom: '2rem',
            letterSpacing: '0.05em',
          }}>
            Self-Guided Practice
          </p>

          {/* Today's Target - compact pill */}
          <div style={{
            display: 'inline-block',
            padding: '0.4rem 1rem',
            backgroundColor: 'rgba(255, 158, 25, 0.1)',
            border: '1px solid rgba(255, 158, 25, 0.25)',
            borderRadius: '20px',
            fontSize: '0.8rem',
            color: '#ff9e19',
            marginBottom: '2rem',
          }}>
            Day {todaysTarget.day} · Focus: {todaysTarget.target}
          </div>

          {/* Instructions Card */}
          <div style={{
            width: '100%',
            padding: '1.75rem 1.5rem',
            backgroundColor: 'rgba(245, 242, 236, 0.04)',
            border: '1px solid rgba(245, 242, 236, 0.1)',
            borderRadius: '16px',
            textAlign: 'left',
            marginBottom: '2rem',
          }}>
            <div style={{
              fontSize: '0.85rem',
              color: 'rgba(245, 242, 236, 0.7)',
              lineHeight: 1.9,
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                Bring <strong style={{ color: '#F5F2EC' }}>{todaysTarget.target.toLowerCase()}</strong> to mind. Hand on chest.
              </div>

              <div style={{ height: '1px', backgroundColor: 'rgba(245, 242, 236, 0.08)', margin: '0.75rem 0' }} />

              <div style={{ marginBottom: '0.35rem' }}>
                <span style={{ color: 'rgba(255, 158, 25, 0.9)' }}>Inhale →</span>{" "}
                "Be blessed"
              </div>
              <div>
                <span style={{ color: 'rgba(255, 158, 25, 0.9)' }}>Exhale →</span>{" "}
                "I wish you peace and love"
              </div>

              <div style={{ height: '1px', backgroundColor: 'rgba(245, 242, 236, 0.08)', margin: '0.75rem 0' }} />

              <div style={{ 
                fontSize: '0.8rem', 
                color: 'rgba(245, 242, 236, 0.4)',
                fontStyle: 'italic',
                textAlign: 'center',
              }}>
                Repeat 3–5 times · Notice any warmth or softness
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <button
              onClick={skipToReflection}
              style={{
                width: '100%',
                maxWidth: '320px',
                padding: '1rem 2rem',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#0a0a0a',
                backgroundColor: '#ff9e19',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              Complete Ritual
            </button>

            <button
              onClick={startGuided}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.75rem',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'rgba(245, 242, 236, 0.3)',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="8,5 19,12 8,19" />
              </svg>
              Switch to Audio Guide
            </button>
          </div>
        </div>
      )}

      {/* ── REFLECTION PHASE ─────────────────────────────── */}
      {phase === 'reflection' && (
        <div style={{ maxWidth: '500px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✨</div>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 600, 
            marginBottom: '1rem' 
          }}>
            Ritual Complete
          </h2>
          <p style={{ 
            fontSize: '0.9rem', 
            color: 'rgba(245, 242, 236, 0.6)',
            marginBottom: '2rem'
          }}>
            How did that land? Any warmth, softness, or resistance? (Optional)
          </p>

          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Share your reflection... (optional)"
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '1rem',
              fontSize: '0.9rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(245, 242, 236, 0.2)',
              borderRadius: '8px',
              color: '#F5F2EC',
              resize: 'vertical',
              marginBottom: '1.5rem',
              fontFamily: 'inherit',
            }}
          />

          <button
            onClick={handleComplete}
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
            Complete Ritual
          </button>
        </div>
      )}

      {/* ── COMPLETE PHASE ───────────────────────────────── */}
      {phase === 'complete' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💞</div>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 600, 
            marginBottom: '0.5rem',
            color: '#22c55e'
          }}>
            Co-Regulation Complete
          </h2>
          <p style={{ 
            fontSize: '0.9rem', 
            color: 'rgba(245, 242, 236, 0.6)'
          }}>
            Your relational circuitry is rewiring...
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MODAL WRAPPER
// ============================================================================

interface CoRegulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export function CoRegulationModal({ isOpen, onClose, onComplete }: CoRegulationModalProps) {
  const hasCompletedRef = useRef(false);

  if (!isOpen) {
    hasCompletedRef.current = false;
    return null;
  }

  const handleSessionComplete = () => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;

    console.log('[CoRegulationModal] Session complete, triggering onComplete');
    
    if (onComplete) {
      onComplete();
    }

    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999 }}>
      <CoRegulationPractice onComplete={handleSessionComplete} />
      
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

export function useCoRegulation() {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return {
    isOpen,
    open,
    close,
    Modal: ({ onComplete }: { onComplete?: () => void }) => (
      <CoRegulationModal isOpen={isOpen} onClose={close} onComplete={onComplete} />
    ),
  };
}

export default CoRegulationModal;
