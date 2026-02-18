"use client";
import React, { useState, useRef, useEffect } from "react";

// ============================================================================
// CO-REGULATION PRACTICE COMPONENT
// 3-5 minute compassion practice with 5-day rotation
// Two paths: Guided (with audio) or Self-Guided
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
  const [breathCount, setBreathCount] = useState(0);
  const breathRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const todaysTarget = getTodaysTarget();

  const SELF_GUIDED_BREATHS = 5; // 5 full breath cycles for self-guided

  // Breath cycle: 4s inhale, 6s exhale (used in both modes)
  useEffect(() => {
    if (phase === 'guided' || phase === 'self-guided') {
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

  // Track breath count for self-guided mode
  useEffect(() => {
    if (phase !== 'self-guided') return;

    // Count each full breath cycle (triggered on each inhale after the first)
    const countBreaths = () => {
      setBreathCount(prev => prev + 1);
    };

    // Start counting after first full cycle (10s)
    const initialDelay = setTimeout(() => {
      countBreaths(); // Count breath 1 after first full cycle
      const counter = setInterval(countBreaths, 10000);
      return () => clearInterval(counter);
    }, 10000);

    return () => clearTimeout(initialDelay);
  }, [phase]);

  const startGuided = () => {
    setPhase('guided');
  };

  const startSelfGuided = () => {
    setBreathCount(0);
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
          {/* Audio Player */}
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

          {/* Breath Guide */}
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
            
            {/* Breath Instructions */}
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

          {/* Target Reminder */}
          <div style={{
            fontSize: '0.9rem',
            color: 'rgba(245, 242, 236, 0.6)',
            marginBottom: '2rem',
          }}>
            <span style={{ color: 'rgba(245, 242, 236, 0.4)' }}>Focus:</span> {todaysTarget.target}
          </div>

          {/* End Early Button */}
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

      {/* ── SELF-GUIDED PHASE ────────────────────────────── */}
      {phase === 'self-guided' && (
        <div style={{ textAlign: 'center', maxWidth: '420px' }}>
          {/* Breathing Circle */}
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
            transition: 'all 0.8s ease',
            transform: breathPhase === 'inhale' ? 'scale(1.15)' : 'scale(0.95)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '1.1rem', 
                fontWeight: 600,
                color: '#ff9e19',
                transition: 'opacity 0.4s ease',
              }}>
                {breathPhase === 'inhale' ? 'Inhale' : 'Exhale'}
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: 'rgba(245, 242, 236, 0.6)',
                marginTop: '0.25rem',
              }}>
                {breathPhase === 'inhale' ? '4 seconds' : '6 seconds'}
              </div>
            </div>
          </div>

          {/* Phrase Display */}
          <div style={{
            fontSize: '1.25rem',
            fontWeight: 300,
            color: '#F5F2EC',
            marginBottom: '0.5rem',
            minHeight: '2rem',
            transition: 'opacity 0.4s ease',
          }}>
            {breathPhase === 'inhale' 
              ? '"Be Blessed"' 
              : '"I wish you peace and love"'
            }
          </div>

          {/* Target Reminder */}
          <div style={{
            fontSize: '0.85rem',
            color: 'rgba(245, 242, 236, 0.4)',
            marginBottom: '2.5rem',
          }}>
            Focus: <span style={{ color: 'rgba(245, 242, 236, 0.6)' }}>{todaysTarget.target}</span>
          </div>

          {/* Breath Counter */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '20px',
            marginBottom: '2rem',
          }}>
            {Array.from({ length: SELF_GUIDED_BREATHS }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: i < breathCount 
                    ? '#ff9e19' 
                    : 'rgba(245, 242, 236, 0.15)',
                  transition: 'background-color 0.3s ease',
                }}
              />
            ))}
            <span style={{
              fontSize: '0.7rem',
              color: 'rgba(245, 242, 236, 0.4)',
              marginLeft: '0.25rem',
            }}>
              {breathCount}/{SELF_GUIDED_BREATHS}
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            {/* Complete button - always visible, becomes prominent after enough breaths */}
            <button
              onClick={skipToReflection}
              style={{
                width: '100%',
                maxWidth: '280px',
                padding: '0.875rem 2rem',
                fontSize: '0.9rem',
                fontWeight: 500,
                backgroundColor: breathCount >= SELF_GUIDED_BREATHS ? '#ff9e19' : 'transparent',
                border: breathCount >= SELF_GUIDED_BREATHS 
                  ? 'none' 
                  : '1px solid rgba(245, 242, 236, 0.2)',
                borderRadius: '10px',
                color: breathCount >= SELF_GUIDED_BREATHS ? '#0a0a0a' : 'rgba(245, 242, 236, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.4s ease',
              }}
            >
              {breathCount >= SELF_GUIDED_BREATHS ? 'Complete Ritual' : 'Finish Early'}
            </button>

            {/* Switch to audio option */}
            <button
              onClick={() => {
                if (breathRef.current) clearInterval(breathRef.current);
                setBreathCount(0);
                startGuided();
              }}
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
