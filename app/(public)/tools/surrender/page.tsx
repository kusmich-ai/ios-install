'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';

// ============================================
// TYPES & CONSTANTS
// ============================================

type Phase = 
  | 'instructions'
  | 'opening'
  | 'warmup'
  | 'hold'
  | 'recovery'
  | 'message'
  | 'closing'
  | 'complete';

const HOLD_DURATIONS = [10, 15, 20, 25, 30]; // seconds per round
const WARMUP_DURATION = 60000; // 1 minute
const RECOVERY_DURATION = 30000; // 30 seconds between holds
const OPENING_DURATION = 12000; // 12 seconds
const MESSAGE_DURATION = 10000; // "Let this happen" visible
const CLOSING_DURATION = 8000; // closing text duration
const INHALE_DURATION = 4000; // 4 seconds
const EXHALE_DURATION = 6000; // 6 seconds
const BREATH_CYCLE = 10000; // Full breath cycle

// Colors
const COLORS = {
  background: "#000000",
  orbBase: "#F5F2EC",
  accent: "#ff9e19",
  accentDim: "rgba(255, 158, 25, 0.12)",
  textPrimary: "#F5F2EC",
  textDim: "rgba(245, 242, 236, 0.4)",
};

// ============================================
// EASING FUNCTION
// ============================================

const easeInOutQuad = (t: number): number => {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
};

// ============================================
// AUDIO - Bell Tones (two distinct tones)
// ============================================

function createHoldTone(audioContext: AudioContext) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 1.5);
}

function createReleaseTone(audioContext: AudioContext) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.12, audioContext.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.2);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 1.2);
}

// ============================================
// BREATHING ORB COMPONENT (SVG-based)
// ============================================

interface BreathingOrbProps {
  orbScale: number;
  phase: 'inhale' | 'exhale' | 'idle';
}

function BreathingOrb({ orbScale, phase }: BreathingOrbProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: '200px',
        height: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Outer glow */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.accentDim} 0%, transparent 70%)`,
          transform: `scale(${orbScale * 1.4})`,
          willChange: 'transform',
        }}
      />

      {/* Main orb */}
      <svg
        viewBox="0 0 200 200"
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${orbScale})`,
          willChange: 'transform',
        }}
      >
        <defs>
          <radialGradient id="orbGradient" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.12" />
            <stop offset="50%" stopColor={COLORS.orbBase} stopOpacity="0.08" />
            <stop offset="100%" stopColor="#D4CFC7" stopOpacity="0.04" />
          </radialGradient>

          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx="100" cy="100" r="80" fill="url(#orbGradient)" />
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke={COLORS.accent}
          strokeWidth="1"
          opacity="0.6"
          filter="url(#softGlow)"
        />
        <circle
          cx="100"
          cy="100"
          r="50"
          fill="none"
          stroke={COLORS.accent}
          strokeWidth="0.5"
          opacity="0.3"
        />
      </svg>

      {/* Phase label */}
      {phase !== 'idle' && (
        <p
          style={{
            position: 'absolute',
            bottom: '-3rem',
            fontSize: '0.7rem',
            fontWeight: 400,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: COLORS.textDim,
            fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          {phase === 'inhale' ? 'Inhale' : 'Exhale'}
        </p>
      )}
    </div>
  );
}

// ============================================
// BACK BUTTON COMPONENT
// ============================================

function BackButton() {
  return (
    <Link 
      href="/tools/awaken-with-5"
      style={{
        position: 'absolute',
        top: '1.5rem',
        left: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'rgba(245, 242, 236, 0.4)',
        textDecoration: 'none',
        fontSize: '0.85rem',
        fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
        transition: 'color 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = COLORS.accent;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'rgba(245, 242, 236, 0.4)';
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span>Back to Guide</span>
    </Link>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function SurrenderSimulationPage() {
  const [phase, setPhase] = useState<Phase>('instructions');
  const [currentRound, setCurrentRound] = useState(0);
  const [messageOpacity, setMessageOpacity] = useState(1);
  
  // Animation state (only used during warmup)
  const [orbScale, setOrbScale] = useState(1);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'exhale' | 'idle'>('idle');
  
  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const phaseStartTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const phaseRef = useRef<Phase>('instructions');
  const currentRoundRef = useRef<number>(0);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    currentRoundRef.current = currentRound;
  }, [currentRound]);

  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playHoldTone = useCallback(() => {
    const ctx = initAudio();
    if (ctx.state === 'suspended') ctx.resume();
    createHoldTone(ctx);
  }, [initAudio]);

  const playReleaseTone = useCallback(() => {
    const ctx = initAudio();
    if (ctx.state === 'suspended') ctx.resume();
    createReleaseTone(ctx);
  }, [initAudio]);

  const cancelAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const transitionToPhase = useCallback((newPhase: Phase, round?: number) => {
    cancelAnimation();
    phaseStartTimeRef.current = performance.now();
    
    if (round !== undefined) {
      setCurrentRound(round);
      currentRoundRef.current = round;
    }
    
    setPhase(newPhase);
    phaseRef.current = newPhase;

    // Reset orb state when not in warmup
    if (newPhase !== 'warmup') {
      setOrbScale(1);
      setBreathPhase('idle');
    }

    // Play tones
    if (newPhase === 'hold') {
      playHoldTone();
    }
  }, [cancelAnimation, playHoldTone]);

  // Main animation loop
  const animate = useCallback((timestamp: number) => {
    const elapsed = timestamp - phaseStartTimeRef.current;
    const currentPhase = phaseRef.current;
    const round = currentRoundRef.current;

    switch (currentPhase) {
      case 'opening': {
        if (elapsed >= OPENING_DURATION) {
          transitionToPhase('warmup');
        }
        break;
      }

      case 'warmup': {
        // Breathing animation
        const cycleTime = elapsed % BREATH_CYCLE;
        let scale: number;
        let bPhase: 'inhale' | 'exhale';

        if (cycleTime < INHALE_DURATION) {
          const progress = cycleTime / INHALE_DURATION;
          const eased = easeInOutQuad(progress);
          scale = 1 + eased * 0.35;
          bPhase = 'inhale';
        } else {
          const progress = (cycleTime - INHALE_DURATION) / EXHALE_DURATION;
          const eased = easeInOutQuad(progress);
          scale = 1.35 - eased * 0.35;
          bPhase = 'exhale';
        }

        setOrbScale(scale);
        setBreathPhase(bPhase);

        if (elapsed >= WARMUP_DURATION) {
          transitionToPhase('hold', 1);
        }
        break;
      }

      case 'hold': {
        const holdDuration = HOLD_DURATIONS[round - 1] * 1000;
        
        if (elapsed >= holdDuration) {
          playReleaseTone();
          
          if (round === 5) {
            transitionToPhase('closing');
          } else if (round === 3) {
            setMessageOpacity(1);
            transitionToPhase('message');
          } else {
            transitionToPhase('recovery');
          }
        }
        break;
      }

      case 'recovery': {
        // After round 3, recovery is only 20s (10s was message phase)
        const recoveryTime = currentRoundRef.current === 3 ? 20000 : RECOVERY_DURATION;
        
        if (elapsed >= recoveryTime) {
          transitionToPhase('hold', round + 1);
        }
        break;
      }

      case 'message': {
        // Fade starting at 7s
        if (elapsed >= 7000 && elapsed < MESSAGE_DURATION) {
          const fadeProgress = (elapsed - 7000) / 3000;
          setMessageOpacity(1 - fadeProgress);
        }
        
        if (elapsed >= MESSAGE_DURATION) {
          // Continue to recovery for remaining 20s
          transitionToPhase('recovery');
        }
        break;
      }

      case 'closing': {
        if (elapsed >= CLOSING_DURATION) {
          transitionToPhase('complete');
          return;
        }
        break;
      }

      case 'complete':
        return;
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [transitionToPhase, playReleaseTone]);

  useEffect(() => {
    if (phase !== 'instructions' && phase !== 'complete') {
      phaseStartTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    return cancelAnimation;
  }, [phase, animate, cancelAnimation]);

  const handleStart = () => {
    initAudio();
    transitionToPhase('opening');
  };

  const handleRestart = () => {
    cancelAnimation();
    setPhase('instructions');
    setCurrentRound(0);
    setOrbScale(1);
    setBreathPhase('idle');
    setMessageOpacity(1);
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

  // Show back button on instructions and complete screens only
  const showBackButton = phase === 'instructions' || phase === 'complete';

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
      {/* Back Button */}
      {showBackButton && <BackButton />}

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
            Surrender Simulation
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
              This practice conditions your nervous system to surrender under rising intensity rather than fight or manage discomfort.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              You'll begin with 1 minute of guided breathing, followed by 5 progressive breath holds (10 to 30 seconds).
            </p>
          </div>

          {/* Key instruction - emphasized */}
          <div
            style={{
              backgroundColor: 'rgba(255, 158, 25, 0.08)',
              border: '1px solid rgba(255, 158, 25, 0.2)',
              borderRadius: '8px',
              padding: '1rem 1.25rem',
              marginBottom: '2rem',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                ...fontBody,
                color: COLORS.accent,
                fontSize: '0.85rem',
                lineHeight: 1.6,
              }}
            >
              When a tone sounds, allow the breath to empty and hold at the end of the exhale.
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
            <span style={{ color: 'rgba(245, 242, 236, 0.6)' }}>Duration:</span> ~6 minutes<br />
            <span style={{ color: 'rgba(245, 242, 236, 0.6)' }}>Position:</span> Seated comfortably
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

      {/* OPENING */}
      {phase === 'opening' && (
        <div style={{ maxWidth: '340px', textAlign: 'center' }}>
          <p style={{ ...fontHeading, fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', lineHeight: 1.6 }}>
            This is a surrender practice.
          </p>
          <p style={{ ...fontHeading, fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', lineHeight: 1.6, marginTop: '1.5rem' }}>
            Allow discomfort to rise.
          </p>
          <p style={{ ...fontHeading, fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', lineHeight: 1.6, marginTop: '1.5rem' }}>
            Do not manage it.
          </p>
        </div>
      )}

      {/* WARMUP - Orb */}
      {phase === 'warmup' && (
        <BreathingOrb orbScale={orbScale} phase={breathPhase} />
      )}

      {/* HOLD */}
      {phase === 'hold' && (
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              ...fontHeading,
              fontSize: 'clamp(1.75rem, 6vw, 2.5rem)',
              letterSpacing: '0.3em',
            }}
          >
            HOLD
          </p>
        </div>
      )}

      {/* RECOVERY */}
      {phase === 'recovery' && (
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              ...fontBody,
              fontSize: '0.9rem',
              color: 'rgba(245, 242, 236, 0.4)',
            }}
          >
            breathe normally
          </p>
        </div>
      )}

      {/* MESSAGE - after round 3 */}
      {phase === 'message' && (
        <div
          style={{
            textAlign: 'center',
            opacity: messageOpacity,
            transition: 'opacity 0.5s ease',
          }}
        >
          <p
            style={{
              ...fontHeading,
              fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
            }}
          >
            Let this happen.
          </p>
        </div>
      )}

      {/* CLOSING */}
      {phase === 'closing' && (
        <div style={{ maxWidth: '340px', textAlign: 'center' }}>
          <p style={{ ...fontHeading, fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', lineHeight: 1.6 }}>
            Return to natural breathing.
          </p>
          <p style={{ ...fontHeading, fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', lineHeight: 1.6, marginTop: '1.5rem' }}>
            Stay seated until your body settles on its own.
          </p>
        </div>
      )}

      {/* COMPLETE */}
      {phase === 'complete' && (
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 1.5rem',
              borderRadius: '50%',
              border: '1px solid rgba(255, 158, 25, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke={COLORS.accent}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2
            style={{
              ...fontHeading,
              fontSize: '1.25rem',
              marginBottom: '0.5rem',
            }}
          >
            Practice Complete
          </h2>
          <p
            style={{
              ...fontBody,
              fontSize: '0.85rem',
              color: COLORS.textDim,
              marginBottom: '2.5rem',
            }}
          >
            Surrender capacity expanded.
          </p>
          <button
            onClick={handleRestart}
            style={{
              ...fontBody,
              padding: '0.75rem 1.5rem',
              fontSize: '0.8rem',
              backgroundColor: 'transparent',
              color: 'rgba(245, 242, 236, 0.5)',
              border: '1px solid rgba(245, 242, 236, 0.2)',
              borderRadius: '100px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 158, 25, 0.5)';
              e.currentTarget.style.color = 'rgba(245, 242, 236, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(245, 242, 236, 0.2)';
              e.currentTarget.style.color = 'rgba(245, 242, 236, 0.5)';
            }}
          >
            Start Over
          </button>
        </div>
      )}

      {/* Footer */}
      {showBackButton && (
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
              href="https://awakenwith5.com"
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
              Awaken with 5
            </a>
            {' '}experience
          </p>
        </div>
      )}
    </div>
  );
}
