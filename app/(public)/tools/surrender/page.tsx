'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// ============================================
// TYPES & CONSTANTS
// ============================================

type Phase = 
  | 'instructions'
  | 'opening'
  | 'warmup'
  | 'leadExhale'
  | 'hold'
  | 'recovery'
  | 'message'
  | 'closing'
  | 'complete';

const HOLD_DURATIONS = [10, 15, 20, 25, 30]; // seconds per round
const WARMUP_DURATION = 60; // 1 minute
const RECOVERY_DURATION = 30; // 30 seconds between holds
const OPENING_DURATION = 12; // seconds
const MESSAGE_DURATION = 10; // "Let this happen" visible duration
const CLOSING_DURATION = 8; // How long closing text shows before complete
const LEAD_EXHALE_DURATION = 6; // 6 second exhale before hold

// ============================================
// LUXURY FONT STYLES
// ============================================

const fontStyles = {
  heading: {
    fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif",
    fontWeight: 300,
    letterSpacing: '0.02em',
  },
  body: {
    fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif",
    fontWeight: 400,
    letterSpacing: '0.01em',
  },
  label: {
    fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif",
    fontWeight: 500,
    letterSpacing: '0.15em',
  },
};

// ============================================
// AUDIO UTILITY - Web Audio API Bell Tone
// ============================================

function createBellTone(audioContext: AudioContext, frequency: number = 520, duration: number = 1.5) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.type = 'sine';
  
  // Soft bell envelope
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

// ============================================
// MINIMAL BREATHING ORB COMPONENT
// ============================================

function BreathingOrb({ phase }: { phase: 'inhale' | 'exhale' | 'static' }) {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (phase === 'static') {
      setProgress(0);
      return;
    }
    
    const duration = phase === 'inhale' ? 4000 : 6000;
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
    }, 16);
    
    return () => clearInterval(interval);
  }, [phase]);
  
  // Scale: 1.0 at rest (exhaled), 1.35 at full inhale
  let scale: number;
  if (phase === 'inhale') {
    scale = 1 + (progress * 0.35);
  } else if (phase === 'exhale') {
    scale = 1.35 - (progress * 0.35);
  } else {
    scale = 1;
  }
  
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Single clean orb */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Subtle outer glow */}
        <div 
          className="absolute rounded-full transition-all duration-100 ease-out"
          style={{ 
            width: `${scale * 140}px`, 
            height: `${scale * 140}px`,
            background: 'radial-gradient(circle, rgba(255,158,25,0.08) 0%, transparent 70%)',
          }}
        />
        {/* Main circle - single clean ring */}
        <div 
          className="absolute rounded-full transition-all duration-100 ease-out"
          style={{ 
            width: `${scale * 100}px`, 
            height: `${scale * 100}px`,
            border: '1px solid rgba(255,158,25,0.6)',
            background: 'radial-gradient(circle, rgba(255,158,25,0.03) 0%, transparent 60%)',
          }}
        />
      </div>
      
      {/* Breath cue - minimal styling */}
      {phase !== 'static' && (
        <p 
          className="mt-10 text-gray-500 text-xs uppercase"
          style={fontStyles.label}
        >
          {phase === 'inhale' ? 'Inhale' : 'Exhale'}
        </p>
      )}
    </div>
  );
}

// ============================================
// CONTINUOUS BREATHING ORB (for warmup)
// ============================================

function ContinuousBreathingOrb({ isActive }: { isActive: boolean }) {
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (!isActive) return;
    
    const startTime = Date.now();
    const BREATH_CYCLE = 10000; // 4s + 6s = 10s
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const cyclePosition = elapsed % BREATH_CYCLE;
      
      if (cyclePosition < 4000) {
        setBreathPhase('inhale');
        setProgress(cyclePosition / 4000);
      } else {
        setBreathPhase('exhale');
        setProgress((cyclePosition - 4000) / 6000);
      }
    }, 16);
    
    return () => clearInterval(interval);
  }, [isActive]);
  
  // Scale: 1.0 at rest, 1.35 at full inhale
  const scale = breathPhase === 'inhale' 
    ? 1 + (progress * 0.35)
    : 1.35 - (progress * 0.35);
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-40 h-40 flex items-center justify-center">
        <div 
          className="absolute rounded-full transition-all duration-75 ease-out"
          style={{ 
            width: `${scale * 140}px`, 
            height: `${scale * 140}px`,
            background: 'radial-gradient(circle, rgba(255,158,25,0.08) 0%, transparent 70%)',
          }}
        />
        <div 
          className="absolute rounded-full transition-all duration-75 ease-out"
          style={{ 
            width: `${scale * 100}px`, 
            height: `${scale * 100}px`,
            border: '1px solid rgba(255,158,25,0.6)',
            background: 'radial-gradient(circle, rgba(255,158,25,0.03) 0%, transparent 60%)',
          }}
        />
      </div>
      
      <p 
        className="mt-10 text-gray-500 text-xs uppercase"
        style={fontStyles.label}
      >
        {breathPhase === 'inhale' ? 'Inhale' : 'Exhale'}
      </p>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function SurrenderSimulationPage() {
  const [phase, setPhase] = useState<Phase>('instructions');
  const [currentRound, setCurrentRound] = useState(0);
  const [messageOpacity, setMessageOpacity] = useState(1);
  const [exhalePhase, setExhalePhase] = useState<'inhale' | 'exhale'>('inhale');
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio context on first interaction
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play bell tone
  const playTone = useCallback(() => {
    const ctx = initAudio();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    createBellTone(ctx, 520, 1.5);
  }, [initAudio]);

  // Clear any running timer
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Phase transition logic
  const advancePhase = useCallback(() => {
    clearTimer();
    
    setPhase(currentPhase => {
      switch (currentPhase) {
        case 'opening':
          return 'warmup';
        
        case 'warmup':
          // Start lead exhale for first hold
          setCurrentRound(1);
          setExhalePhase('inhale');
          return 'leadExhale';
        
        case 'leadExhale':
          // End of lead exhale - start hold
          playTone();
          return 'hold';
        
        case 'hold':
          // End of hold - play release tone
          playTone();
          
          // After round 3, show message (no additional tone)
          if (currentRound === 3) {
            setMessageOpacity(1);
            return 'message';
          }
          
          // After round 5, go to closing
          if (currentRound === 5) {
            return 'closing';
          }
          
          // Otherwise recovery
          return 'recovery';
        
        case 'message':
          // Message done, continue to remainder of recovery
          return 'recovery';
        
        case 'recovery':
          // Start lead exhale for next hold
          setCurrentRound(r => r + 1);
          setExhalePhase('inhale');
          return 'leadExhale';
        
        case 'closing':
          return 'complete';
        
        default:
          return currentPhase;
      }
    });
  }, [currentRound, playTone, clearTimer]);

  // Handle lead exhale phase timing (inhale 4s, then exhale 6s)
  useEffect(() => {
    if (phase !== 'leadExhale') return;
    
    // Start with inhale
    setExhalePhase('inhale');
    
    // After 4s, switch to exhale
    const inhaleTimer = setTimeout(() => {
      setExhalePhase('exhale');
    }, 4000);
    
    return () => clearTimeout(inhaleTimer);
  }, [phase]);

  // Timer management based on phase
  useEffect(() => {
    if (phase === 'instructions' || phase === 'complete') return;
    
    let duration = 0;
    
    switch (phase) {
      case 'opening':
        duration = OPENING_DURATION * 1000;
        break;
      case 'warmup':
        duration = WARMUP_DURATION * 1000;
        break;
      case 'leadExhale':
        duration = LEAD_EXHALE_DURATION * 1000 + 4000; // 4s inhale + 6s exhale
        break;
      case 'hold':
        duration = HOLD_DURATIONS[currentRound - 1] * 1000;
        break;
      case 'recovery':
        // After round 3, recovery is only 20s (10s was message)
        duration = (currentRound === 3 ? 20 : RECOVERY_DURATION) * 1000;
        break;
      case 'message':
        duration = MESSAGE_DURATION * 1000;
        // Start fade at 7 seconds
        setTimeout(() => {
          setMessageOpacity(0);
        }, 7000);
        break;
      case 'closing':
        duration = CLOSING_DURATION * 1000;
        break;
    }
    
    if (duration > 0) {
      timerRef.current = setTimeout(advancePhase, duration);
    }
    
    return clearTimer;
  }, [phase, currentRound, advancePhase, clearTimer]);

  // Start the practice
  const handleStart = () => {
    initAudio();
    setPhase('opening');
  };

  // Reset to beginning
  const handleRestart = () => {
    clearTimer();
    setPhase('instructions');
    setCurrentRound(0);
    setMessageOpacity(1);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      
      {/* INSTRUCTIONS SCREEN */}
      {phase === 'instructions' && (
        <div className="max-w-md text-center">
          <p 
            className="text-[#ff9e19] text-xs uppercase mb-3"
            style={fontStyles.label}
          >
            Awaken with 5
          </p>
          <h1 
            className="text-white text-2xl md:text-3xl mb-10"
            style={fontStyles.heading}
          >
            Surrender Simulation
          </h1>
          
          <div 
            className="text-gray-400 text-sm space-y-4 mb-12 text-left leading-relaxed"
            style={fontStyles.body}
          >
            <p>
              This practice conditions your nervous system to surrender under rising intensity rather than fight or manage discomfort.
            </p>
            <p>
              You'll begin with 1 minute of slow breathing, followed by 5 progressive breath holds (10 to 30 seconds). All holds are on the exhale with empty lungs. A tone signals when to hold and when to release.
            </p>
            <p className="text-gray-500 pt-2">
              <span className="text-gray-400">Duration:</span> ~6 minutes<br />
              <span className="text-gray-400">Position:</span> Seated comfortably. Follow prompts on screen.
            </p>
          </div>
          
          <button
            onClick={handleStart}
            className="px-10 py-4 bg-[#ff9e19] text-black rounded-full hover:bg-[#ffb347] transition-colors"
            style={{ ...fontStyles.body, fontWeight: 500 }}
          >
            Begin Practice
          </button>
        </div>
      )}

      {/* OPENING TEXT */}
      {phase === 'opening' && (
        <div className="max-w-sm text-center">
          <p 
            className="text-white text-xl md:text-2xl leading-relaxed"
            style={fontStyles.heading}
          >
            This is a surrender practice.
          </p>
          <p 
            className="text-white text-xl md:text-2xl leading-relaxed mt-6"
            style={fontStyles.heading}
          >
            Allow discomfort to rise.
          </p>
          <p 
            className="text-white text-xl md:text-2xl leading-relaxed mt-6"
            style={fontStyles.heading}
          >
            Do not manage it.
          </p>
        </div>
      )}

      {/* WARMUP - Continuous breathing with orb */}
      {phase === 'warmup' && (
        <ContinuousBreathingOrb isActive={true} />
      )}

      {/* LEAD EXHALE - One breath with orb before hold */}
      {phase === 'leadExhale' && (
        <BreathingOrb phase={exhalePhase} />
      )}

      {/* HOLD */}
      {phase === 'hold' && (
        <div className="text-center">
          <p 
            className="text-white text-2xl md:text-3xl tracking-widest"
            style={fontStyles.heading}
          >
            HOLD
          </p>
        </div>
      )}

      {/* RECOVERY - "breathe normally" text */}
      {phase === 'recovery' && (
        <div className="text-center">
          <p 
            className="text-gray-600 text-sm"
            style={fontStyles.body}
          >
            breathe normally
          </p>
        </div>
      )}

      {/* MESSAGE - "Let this happen." after round 3 */}
      {phase === 'message' && (
        <div 
          className="text-center transition-opacity duration-[3000ms]"
          style={{ opacity: messageOpacity }}
        >
          <p 
            className="text-white text-xl md:text-2xl"
            style={fontStyles.heading}
          >
            Let this happen.
          </p>
        </div>
      )}

      {/* CLOSING */}
      {phase === 'closing' && (
        <div className="max-w-sm text-center">
          <p 
            className="text-white text-xl md:text-2xl leading-relaxed"
            style={fontStyles.heading}
          >
            Return to natural breathing.
          </p>
          <p 
            className="text-white text-xl md:text-2xl leading-relaxed mt-6"
            style={fontStyles.heading}
          >
            Stay seated until your body settles on its own.
          </p>
        </div>
      )}

      {/* COMPLETE */}
      {phase === 'complete' && (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-[#ff9e19]/30 flex items-center justify-center">
            <svg 
              className="w-6 h-6 text-[#ff9e19]" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 
            className="text-white text-xl mb-2"
            style={fontStyles.heading}
          >
            Practice Complete
          </h2>
          <p 
            className="text-gray-500 text-sm mb-10"
            style={fontStyles.body}
          >
            Surrender capacity expanded.
          </p>
          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border border-gray-800 text-gray-400 rounded-full hover:border-[#ff9e19]/50 hover:text-gray-300 transition-all"
            style={fontStyles.body}
          >
            Start Over
          </button>
        </div>
      )}

      {/* Footer - only on instructions and complete */}
      {(phase === 'instructions' || phase === 'complete') && (
        <div className="absolute bottom-8 text-center">
          <p 
            className="text-gray-700 text-xs"
            style={fontStyles.body}
          >
            Part of the{' '}
            <a
              href="https://unbecoming.app"
              className="text-[#ff9e19]/70 hover:text-[#ff9e19] transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              IOS System
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
