'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

// ============================================
// TYPES & CONSTANTS
// ============================================

type Phase = 
  | 'instructions'
  | 'orientation'
  | 'prompt'
  | 'somatic'
  | 'exit';

const ORIENTATION_DURATION = 10000; // 10 seconds
const PROMPT_DURATION = 180000; // 3 minutes
const SOMATIC_DURATION = 60000; // 60 seconds
const SOMATIC_FADE_IN = 2000; // 2 second fade in
const SOMATIC_FADE_OUT = 3000; // 3 second fade out

// Prompts - one randomly selected per session
const PROMPTS = [
  "Without my current story — what remains?",
  "What is here before I name it?",
  "Who am I without roles right now?",
  "What's left if I stop narrating?",
  "What is aware of this experience?",
];

// Colors
const COLORS = {
  background: "#000000",
  textPrimary: "#F5F2EC",
  textDim: "rgba(245, 242, 236, 0.4)",
  accent: "#ff9e19",
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function IdentitySofteningPage() {
  const [phase, setPhase] = useState<Phase>('instructions');
  const [somaticOpacity, setSomaticOpacity] = useState(0);
  
  // Select random prompt once on mount
  const selectedPrompt = useMemo(() => {
    return PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
  }, []);
  
  // Refs
  const phaseStartTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const phaseRef = useRef<Phase>('instructions');

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const cancelAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const transitionToPhase = useCallback((newPhase: Phase) => {
    cancelAnimation();
    phaseStartTimeRef.current = performance.now();
    setPhase(newPhase);
    phaseRef.current = newPhase;
    
    // Reset somatic opacity when entering that phase
    if (newPhase === 'somatic') {
      setSomaticOpacity(0);
    }
  }, [cancelAnimation]);

  // Animation loop
  const animate = useCallback((timestamp: number) => {
    const elapsed = timestamp - phaseStartTimeRef.current;
    const currentPhase = phaseRef.current;

    switch (currentPhase) {
      case 'orientation': {
        if (elapsed >= ORIENTATION_DURATION) {
          transitionToPhase('prompt');
        }
        break;
      }

      case 'prompt': {
        if (elapsed >= PROMPT_DURATION) {
          transitionToPhase('somatic');
        }
        break;
      }

      case 'somatic': {
        // Fade in during first 2 seconds
        if (elapsed < SOMATIC_FADE_IN) {
          setSomaticOpacity(elapsed / SOMATIC_FADE_IN);
        } 
        // Hold visible
        else if (elapsed < SOMATIC_DURATION - SOMATIC_FADE_OUT) {
          setSomaticOpacity(1);
        }
        // Fade out during last 3 seconds
        else if (elapsed < SOMATIC_DURATION) {
          const fadeElapsed = elapsed - (SOMATIC_DURATION - SOMATIC_FADE_OUT);
          setSomaticOpacity(1 - (fadeElapsed / SOMATIC_FADE_OUT));
        }
        // Transition to exit
        else {
          transitionToPhase('exit');
          return;
        }
        break;
      }

      case 'exit':
        return;
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [transitionToPhase]);

  useEffect(() => {
    if (phase !== 'instructions' && phase !== 'exit') {
      phaseStartTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    return cancelAnimation;
  }, [phase, animate, cancelAnimation]);

  const handleStart = () => {
    transitionToPhase('orientation');
  };

  const handleDone = () => {
    // Could redirect or just reset
    window.location.reload(); // Fresh prompt on next session
  };

  // ============================================
  // RENDER
  // ============================================

  const fontHeading = {
    fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontWeight: 300 as const,
    letterSpacing: '0.02em',
  };

  const fontBody = {
    fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontWeight: 400 as const,
    letterSpacing: '0.01em',
  };

  const fontLabel = {
    fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontWeight: 500 as const,
    letterSpacing: '0.15em',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: COLORS.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        color: COLORS.textPrimary,
      }}
    >
      {/* INSTRUCTIONS */}
      {phase === 'instructions' && (
        <div style={{ maxWidth: '420px', textAlign: 'center' }}>
          <p
            style={{
              ...fontLabel,
              color: COLORS.accent,
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}
          >
            Awaken with 5
          </p>
          <h1
            style={{
              ...fontHeading,
              fontSize: 'clamp(1.5rem, 5vw, 1.875rem)',
              marginBottom: '2.5rem',
            }}
          >
            Identity Softening
          </h1>
          
          <div
            style={{
              ...fontBody,
              color: 'rgba(245, 242, 236, 0.7)',
              fontSize: '0.9rem',
              lineHeight: 1.7,
              textAlign: 'left',
              marginBottom: '2rem',
            }}
          >
            <p style={{ marginBottom: '1rem' }}>
              This practice interrupts narrative continuity and allows identity to loosen.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              A single prompt will appear. Do not attempt to answer it. Simply let the question rest in awareness.
            </p>
            <p>
              Silence is the mechanism.
            </p>
          </div>

          <div
            style={{
              ...fontBody,
              color: COLORS.textDim,
              fontSize: '0.85rem',
              marginBottom: '2.5rem',
            }}
          >
            <span style={{ color: 'rgba(245, 242, 236, 0.6)' }}>Duration:</span> ~5 minutes<br />
            <span style={{ color: 'rgba(245, 242, 236, 0.6)' }}>Position:</span> Seated comfortably, eyes open or closed
          </div>
          
          <button
            onClick={handleStart}
            style={{
              ...fontBody,
              padding: '1rem 2.5rem',
              fontSize: '0.9rem',
              fontWeight: 500,
              backgroundColor: COLORS.accent,
              color: '#000',
              border: 'none',
              borderRadius: '100px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ffb347';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.accent;
            }}
          >
            Begin Practice
          </button>
        </div>
      )}

      {/* ORIENTATION */}
      {phase === 'orientation' && (
        <div style={{ maxWidth: '380px', textAlign: 'center' }}>
          <p
            style={{
              ...fontHeading,
              fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
              lineHeight: 1.6,
            }}
          >
            Sit comfortably. Allow the body to settle.
          </p>
        </div>
      )}

      {/* PROMPT - stays visible during 3 min silence */}
      {phase === 'prompt' && (
        <div style={{ maxWidth: '480px', textAlign: 'center', padding: '0 1rem' }}>
          <p
            style={{
              ...fontHeading,
              fontSize: 'clamp(1.5rem, 5vw, 2rem)',
              lineHeight: 1.5,
              fontStyle: 'italic',
            }}
          >
            {selectedPrompt}
          </p>
        </div>
      )}

      {/* SOMATIC ANCHOR */}
      {phase === 'somatic' && (
        <div
          style={{
            maxWidth: '380px',
            textAlign: 'center',
            opacity: somaticOpacity,
            transition: 'opacity 0.1s linear',
          }}
        >
          <p
            style={{
              ...fontHeading,
              fontSize: 'clamp(1.125rem, 3.5vw, 1.375rem)',
              lineHeight: 1.8,
            }}
          >
            Nothing needs to be held together.
          </p>
          <p
            style={{
              ...fontBody,
              fontSize: 'clamp(0.95rem, 3vw, 1.1rem)',
              lineHeight: 2,
              marginTop: '2rem',
              color: 'rgba(245, 242, 236, 0.7)',
            }}
          >
            Soften the jaw.<br />
            Soften the throat.<br />
            Soften the belly.<br />
            Soften behind the eyes.
          </p>
        </div>
      )}

      {/* EXIT */}
      {phase === 'exit' && (
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              ...fontHeading,
              fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
              lineHeight: 1.6,
              marginBottom: '3rem',
            }}
          >
            Simply notice what is here.
          </p>
          <button
            onClick={handleDone}
            style={{
              ...fontBody,
              padding: '1rem 2.5rem',
              fontSize: '0.9rem',
              fontWeight: 500,
              backgroundColor: 'transparent',
              color: COLORS.textPrimary,
              border: `1px solid rgba(245, 242, 236, 0.3)`,
              borderRadius: '100px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 158, 25, 0.5)';
              e.currentTarget.style.color = COLORS.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(245, 242, 236, 0.3)';
              e.currentTarget.style.color = COLORS.textPrimary;
            }}
          >
            Done
          </button>
        </div>
      )}

      {/* Footer - only on instructions */}
      {phase === 'instructions' && (
        <div style={{ position: 'absolute', bottom: '2rem', textAlign: 'center' }}>
          <p
            style={{
              ...fontBody,
              fontSize: '0.7rem',
              color: 'rgba(245, 242, 236, 0.25)',
            }}
          >
            Part of the{' '}
            <a
              href="https://unbecoming.app"
              style={{
                color: 'rgba(255, 158, 25, 0.6)',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
              }}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = COLORS.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 158, 25, 0.6)';
              }}
            >
              IOS System
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
