"use client";
import React, { useState, useRef, useEffect } from "react";

// ============================================================================
// CO-REGULATION PRACTICE COMPONENT
// 3-5 minute compassion practice with 5-day rotation
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
  const [phase, setPhase] = useState<'intro' | 'practice' | 'reflection' | 'complete'>('intro');
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes default
  const [selectedDuration, setSelectedDuration] = useState(180);
  const [reflection, setReflection] = useState('');
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'exhale'>('inhale');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const breathRef = useRef<NodeJS.Timeout | null>(null);

  const todaysTarget = getTodaysTarget();

  // Breath cycle: 4s inhale, 6s exhale
  useEffect(() => {
    if (phase === 'practice') {
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

  // Timer countdown
  useEffect(() => {
    if (phase === 'practice' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setPhase('reflection');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [phase, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startPractice = (duration: number) => {
    setSelectedDuration(duration);
    setTimeRemaining(duration);
    setPhase('practice');
  };

  const skipToReflection = () => {
    if (timerRef.current) clearInterval(timerRef.current);
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
      {/* INTRO PHASE */}
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

          {/* Duration Selection */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => startPractice(180)}
              style={{
                padding: '0.875rem 1.75rem',
                fontSize: '0.9rem',
                fontWeight: 500,
                backgroundColor: '#ff9e19',
                border: 'none',
                borderRadius: '8px',
                color: '#0a0a0a',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              3 Minutes
            </button>
            <button
              onClick={() => startPractice(300)}
              style={{
                padding: '0.875rem 1.75rem',
                fontSize: '0.9rem',
                fontWeight: 500,
                backgroundColor: 'transparent',
                border: '1px solid rgba(245, 242, 236, 0.3)',
                borderRadius: '8px',
                color: '#F5F2EC',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              5 Minutes
            </button>
          </div>
        </div>
      )}

      {/* PRACTICE PHASE */}
      {phase === 'practice' && (
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          {/* Timer */}
          <div style={{
            fontSize: '4rem',
            fontWeight: 300,
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            marginBottom: '2rem',
            color: '#ff9e19',
          }}>
            {formatTime(timeRemaining)}
          </div>

          {/* Breath Guide */}
          <div style={{
            marginBottom: '3rem',
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              margin: '0 auto 1.5rem',
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
              <span style={{ fontSize: '2rem' }}>💞</span>
            </div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: 500,
              color: '#ff9e19',
              marginBottom: '0.5rem',
            }}>
              {breathPhase === 'inhale' ? 'Inhale...' : 'Exhale...'}
            </div>
            <div style={{
              fontSize: '1rem',
              color: 'rgba(245, 242, 236, 0.8)',
              fontStyle: 'italic',
            }}>
              {breathPhase === 'inhale' ? '"Be blessed"' : '"I wish you peace and love"'}
            </div>
          </div>

          {/* Target Reminder */}
          <div style={{
            fontSize: '0.85rem',
            color: 'rgba(245, 242, 236, 0.5)',
            marginBottom: '2rem',
          }}>
            Focus: {todaysTarget.target}
          </div>

          {/* Skip Button */}
          <button
            onClick={skipToReflection}
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
            End Early
          </button>
        </div>
      )}

      {/* REFLECTION PHASE */}
      {phase === 'reflection' && (
        <div style={{ maxWidth: '500px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✨</div>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 600, 
            marginBottom: '1rem' 
          }}>
            Practice Complete
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
            Complete Practice
          </button>
        </div>
      )}

      {/* COMPLETE PHASE */}
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
