// ============================================
// BREATH PACER COMPONENT
// ============================================
// Visual breath pacer with expanding/contracting circle
// 4s inhale / 6s exhale cycle with countdown timer
// ============================================

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface BreathPacerProps {
  /** Duration in seconds (default: 120 = 2 minutes) */
  duration?: number;
  /** Inhale duration in seconds (default: 4) */
  inhaleSeconds?: number;
  /** Exhale duration in seconds (default: 6) */
  exhaleSeconds?: number;
  /** Called when timer completes */
  onComplete?: () => void;
  /** Optional: show a "Skip" button */
  onSkip?: () => void;
  /** Optional: custom title */
  title?: string;
  /** Optional: custom subtitle */
  subtitle?: string;
}

export default function BreathPacer({
  duration = 120,
  inhaleSeconds = 4,
  exhaleSeconds = 6,
  onComplete,
  onSkip,
  title = 'Resonance Breathing',
  subtitle = 'Follow the circle. Breathe through your nose.'
}: BreathPacerProps) {
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [phaseTime, setPhaseTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const phaseStartRef = useRef<number>(0);
  const timerStartRef = useRef<number>(0);

  const cycleLength = inhaleSeconds + exhaleSeconds;

  // ============================================
  // ANIMATION LOOP
  // ============================================

  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
      phaseStartRef.current = timestamp;
      timerStartRef.current = timestamp;
    }

    // Update countdown timer
    const elapsed = (timestamp - timerStartRef.current) / 1000;
    const remaining = Math.max(0, duration - elapsed);
    setTimeRemaining(Math.ceil(remaining));

    if (remaining <= 0) {
      setIsActive(false);
      setIsComplete(true);
      if (onComplete) onComplete();
      return;
    }

    // Calculate breath phase
    const cycleElapsed = ((timestamp - startTimeRef.current) / 1000) % cycleLength;
    
    if (cycleElapsed < inhaleSeconds) {
      setPhase('inhale');
      setPhaseTime(cycleElapsed / inhaleSeconds); // 0 to 1
    } else {
      setPhase('exhale');
      setPhaseTime((cycleElapsed - inhaleSeconds) / exhaleSeconds); // 0 to 1
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [duration, inhaleSeconds, exhaleSeconds, cycleLength, onComplete]);

  // ============================================
  // START / STOP
  // ============================================

  const handleStart = () => {
    setIsActive(true);
    setIsComplete(false);
    setTimeRemaining(duration);
    startTimeRef.current = 0;
    phaseStartRef.current = 0;
    timerStartRef.current = 0;
    animationRef.current = requestAnimationFrame(animate);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // ============================================
  // CALCULATE CIRCLE SIZE
  // ============================================

  // Scale: inhale expands 0.5 → 1.0, exhale contracts 1.0 → 0.5
  const getScale = () => {
    if (!isActive) return 0.5;
    if (phase === 'inhale') {
      // Ease in-out for smooth breathing feel
      const eased = 0.5 - 0.5 * Math.cos(Math.PI * phaseTime);
      return 0.5 + 0.5 * eased;
    } else {
      const eased = 0.5 - 0.5 * Math.cos(Math.PI * phaseTime);
      return 1.0 - 0.5 * eased;
    }
  };

  // ============================================
  // FORMAT TIME
  // ============================================

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================
  // RENDER: COMPLETE STATE
  // ============================================

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-28 h-28 rounded-full bg-[#ff9e19]/20 border-2 border-[#ff9e19] flex items-center justify-center mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff9e19" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-white font-medium text-lg mb-1">Breathing Complete</p>
        <p className="text-gray-500 text-sm">Nervous system reset. Ready to continue.</p>
      </div>
    );
  }

  // ============================================
  // RENDER: READY STATE
  // ============================================

  if (!isActive) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-white font-semibold text-lg mb-2">{title}</p>
        <p className="text-gray-400 text-sm mb-6 text-center max-w-xs">{subtitle}</p>
        
        <div className="flex items-center gap-4 text-gray-500 text-sm mb-8">
          <span>{inhaleSeconds}s in</span>
          <span className="text-gray-700">•</span>
          <span>{exhaleSeconds}s out</span>
          <span className="text-gray-700">•</span>
          <span>{formatTime(duration)}</span>
        </div>

        <button
          onClick={handleStart}
          className="px-8 py-3 bg-[#ff9e19] text-black font-semibold rounded-lg hover:bg-[#ffb347] transition-colors"
        >
          Begin
        </button>

        {onSkip && (
          <button
            onClick={onSkip}
            className="mt-4 text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            Skip breathing
          </button>
        )}
      </div>
    );
  }

  // ============================================
  // RENDER: ACTIVE BREATHING
  // ============================================

  const scale = getScale();
  const circleSize = 160; // base size in px
  const glowOpacity = phase === 'inhale' ? 0.15 + 0.25 * phaseTime : 0.4 - 0.25 * phaseTime;

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Phase label */}
      <p className="text-gray-500 text-sm uppercase tracking-widest mb-8 h-5">
        {phase === 'inhale' ? 'Breathe In' : 'Breathe Out'}
      </p>

      {/* Breathing circle */}
      <div className="relative flex items-center justify-center mb-8" style={{ width: circleSize * 1.3, height: circleSize * 1.3 }}>
        {/* Outer glow */}
        <div
          className="absolute rounded-full transition-none"
          style={{
            width: circleSize * scale * 1.3,
            height: circleSize * scale * 1.3,
            background: `radial-gradient(circle, rgba(255, 158, 25, ${glowOpacity}) 0%, transparent 70%)`,
          }}
        />
        
        {/* Main circle */}
        <div
          className="absolute rounded-full border-2 transition-none"
          style={{
            width: circleSize * scale,
            height: circleSize * scale,
            borderColor: `rgba(255, 158, 25, ${0.4 + scale * 0.6})`,
            background: `radial-gradient(circle at 40% 40%, rgba(255, 158, 25, ${0.08 + scale * 0.12}) 0%, rgba(255, 158, 25, 0.02) 70%)`,
          }}
        />

        {/* Inner dot */}
        <div
          className="absolute rounded-full bg-[#ff9e19]"
          style={{
            width: 8,
            height: 8,
            opacity: 0.6 + scale * 0.4,
          }}
        />
      </div>

      {/* Timer */}
      <p className="text-white font-mono text-2xl mb-2">
        {formatTime(timeRemaining)}
      </p>

      {/* Progress bar */}
      <div className="w-48 h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#ff9e19] transition-none rounded-full"
          style={{ width: `${((duration - timeRemaining) / duration) * 100}%` }}
        />
      </div>
    </div>
  );
}
