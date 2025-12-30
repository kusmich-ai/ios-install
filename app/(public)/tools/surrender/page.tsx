'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

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
const WARMUP_DURATION = 120; // 2 minutes
const RECOVERY_DURATION = 30; // 30 seconds between holds
const OPENING_DURATION = 12; // seconds
const MESSAGE_DURATION = 10; // "Let this happen" visible duration
const CLOSING_DURATION = 8; // How long closing text shows before complete
const BREATH_CYCLE = 10; // 4s inhale + 6s exhale

// ============================================
// AUDIO UTILITY - Web Audio API Bell Tone
// ============================================

function createBellTone(audioContext: AudioContext, frequency: number = 800, duration: number = 0.8) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.type = 'sine';
  
  // Bell-like envelope: quick attack, longer decay
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

// ============================================
// BREATHING ORB COMPONENT
// ============================================

function BreathingOrb({ isActive }: { isActive: boolean }) {
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (!isActive) return;
    
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const cyclePosition = elapsed % BREATH_CYCLE;
      
      if (cyclePosition < 4) {
        setBreathPhase('inhale');
        setProgress(cyclePosition / 4); // 0 to 1 over 4 seconds
      } else {
        setBreathPhase('exhale');
        setProgress((cyclePosition - 4) / 6); // 0 to 1 over 6 seconds
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [isActive]);
  
  // Calculate orb scale: 1.0 at rest, 1.4 at full inhale
  const scale = breathPhase === 'inhale' 
    ? 1 + (progress * 0.4)  // Expanding: 1.0 → 1.4
    : 1.4 - (progress * 0.4); // Contracting: 1.4 → 1.0
  
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Orb container */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Outer glow */}
        <div 
          className="absolute rounded-full bg-[#ff9e19]/10 blur-xl transition-transform duration-300"
          style={{ 
            width: `${scale * 180}px`, 
            height: `${scale * 180}px`,
          }}
        />
        {/* Inner orb */}
        <div 
          className="absolute rounded-full bg-gradient-to-br from-[#ff9e19]/30 to-[#ff9e19]/10 border border-[#ff9e19]/40 transition-transform duration-300"
          style={{ 
            width: `${scale * 120}px`, 
            height: `${scale * 120}px`,
          }}
        />
        {/* Core */}
        <div 
          className="absolute rounded-full bg-[#ff9e19]/20 transition-transform duration-300"
          style={{ 
            width: `${scale * 60}px`, 
            height: `${scale * 60}px`,
          }}
        />
      </div>
      
      {/* Breath cue */}
      <p className="text-gray-500 text-sm mt-8 tracking-widest uppercase">
        {breathPhase === 'inhale' ? 'Inhale' : 'Exhale'}
      </p>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function CO2SurrenderPage() {
  const [phase, setPhase] = useState<Phase>('instructions');
  const [currentRound, setCurrentRound] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [messageOpacity, setMessageOpacity] = useState(1);
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
    createBellTone(ctx, 600, 1.2); // Soft, lower frequency bell
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
          // Start first hold
          playTone();
          setCurrentRound(1);
          return 'hold';
        
        case 'hold':
          // End of hold - play release tone
          playTone();
          
          // After round 3, show message
          if (currentRound === 3) {
            setShowMessage(true);
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
          // Message fades, continue to recovery
          setShowMessage(false);
          return 'recovery';
        
        case 'recovery':
          // Start next hold
          playTone();
          setCurrentRound(r => r + 1);
          return 'hold';
        
        case 'closing':
          return 'complete';
        
        default:
          return currentPhase;
      }
    });
  }, [currentRound, playTone, clearTimer]);

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
      case 'hold':
        duration = HOLD_DURATIONS[currentRound - 1] * 1000;
        break;
      case 'recovery':
        duration = RECOVERY_DURATION * 1000;
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
    setShowMessage(false);
    setMessageOpacity(1);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      
      {/* INSTRUCTIONS SCREEN */}
      {phase === 'instructions' && (
        <div className="max-w-md text-center">
          <h1 className="text-white text-2xl md:text-3xl font-light mb-2">
            CO₂ Surrender Simulation
          </h1>
          <p className="text-[#ff9e19] text-sm tracking-widest uppercase mb-8">
            Awaken with 5
          </p>
          
          <div className="text-gray-400 text-sm space-y-4 mb-12 text-left">
            <p>
              This practice conditions your nervous system to surrender under rising intensity rather than fight or manage discomfort.
            </p>
            <p>
              You'll begin with 2 minutes of slow breathing, followed by 5 progressive breath holds (10 to 30 seconds). A tone signals when to hold and when to release.
            </p>
            <p className="text-gray-500">
              <strong className="text-gray-400">Duration:</strong> ~8 minutes<br />
              <strong className="text-gray-400">Position:</strong> Seated, eyes closed preferred
            </p>
          </div>
          
          <button
            onClick={handleStart}
            className="px-8 py-4 bg-[#ff9e19] text-black font-medium rounded-full hover:bg-[#ffb347] transition-colors"
          >
            Begin Practice
          </button>
        </div>
      )}

      {/* OPENING TEXT */}
      {phase === 'opening' && (
        <div className="max-w-sm text-center">
          <p className="text-white text-xl md:text-2xl font-light leading-relaxed">
            This is a surrender practice.
          </p>
          <p className="text-white text-xl md:text-2xl font-light leading-relaxed mt-4">
            Allow discomfort to rise.
          </p>
          <p className="text-white text-xl md:text-2xl font-light leading-relaxed mt-4">
            Do not manage it.
          </p>
        </div>
      )}

      {/* WARMUP - Breathing with orb */}
      {phase === 'warmup' && (
        <BreathingOrb isActive={true} />
      )}

      {/* HOLD */}
      {phase === 'hold' && (
        <div className="text-center">
          <p className="text-white text-3xl md:text-4xl font-light tracking-widest">
            HOLD
          </p>
        </div>
      )}

      {/* RECOVERY - Black screen */}
      {phase === 'recovery' && (
        <div /> // Intentionally empty - black screen
      )}

      {/* MESSAGE - "Let this happen." after round 3 */}
      {phase === 'message' && (
        <div 
          className="text-center transition-opacity duration-[3000ms]"
          style={{ opacity: messageOpacity }}
        >
          <p className="text-white text-xl md:text-2xl font-light">
            Let this happen.
          </p>
        </div>
      )}

      {/* CLOSING */}
      {phase === 'closing' && (
        <div className="max-w-sm text-center">
          <p className="text-white text-xl md:text-2xl font-light leading-relaxed">
            Return to natural breathing.
          </p>
          <p className="text-white text-xl md:text-2xl font-light leading-relaxed mt-4">
            Stay seated until your body settles on its own.
          </p>
        </div>
      )}

      {/* COMPLETE */}
      {phase === 'complete' && (
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#ff9e19]/10 flex items-center justify-center">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-white text-xl mb-2">Practice Complete</h2>
          <p className="text-gray-400 text-sm mb-8">
            Surrender capacity expanded.
          </p>
          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border border-gray-700 text-gray-300 rounded-full hover:border-[#ff9e19] hover:text-[#ff9e19] transition-all"
          >
            Start Over
          </button>
        </div>
      )}

      {/* Footer - only on instructions and complete */}
      {(phase === 'instructions' || phase === 'complete') && (
        <div className="absolute bottom-6 text-center">
          <p className="text-gray-600 text-xs">
            Part of the{' '}
            <a
              href="https://unbecoming.app"
              className="text-[#ff9e19] hover:underline"
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
