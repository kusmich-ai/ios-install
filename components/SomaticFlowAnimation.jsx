import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * SomaticFlowAnimation - Production Component
 * 
 * Place in: components/SomaticFlowAnimation.jsx
 * Audio at: public/audio/SomaticS.mp3
 * 
 * Usage:
 *   import SomaticFlowAnimation from '@/components/SomaticFlowAnimation';
 *   <SomaticFlowAnimation onComplete={() => console.log('done')} />
 */

export default function SomaticFlowAnimation({ onComplete }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(290);
  const [phase, setPhase] = useState('intro');
  const [audioReady, setAudioReady] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const animationFrameRef = useRef(null);

  const BREATH_CYCLE = 10; // 4s inhale + 6s exhale
  const AUDIO_FILE = "/audio/SomaticS.mp3";

  const PHASES = {
    intro: { start: 0, end: 28 },
    catcow: { start: 28, end: 88 },
    transition: { start: 88, end: 95 },
    squat: { start: 95, end: 155 },
    closing: { start: 155, end: 290 }
  };

  // Create and preload audio - matching ResonanceBreathing pattern
  useEffect(() => {
    audioRef.current = new Audio(AUDIO_FILE);
    audioRef.current.volume = 0.7;
    audioRef.current.preload = "auto";

    audioRef.current.addEventListener("canplaythrough", () => {
      console.log('[SomaticFlow] Audio ready to play');
      setAudioReady(true);
    });

    audioRef.current.addEventListener("loadedmetadata", () => {
      console.log('[SomaticFlow] Audio metadata loaded, duration:', audioRef.current.duration);
      setDuration(audioRef.current.duration);
    });

    audioRef.current.addEventListener("ended", () => {
      console.log('[SomaticFlow] Audio ended');
      setIsPlaying(false);
      setCurrentTime(0);
      if (onComplete) onComplete();
    });

    audioRef.current.addEventListener("error", (e) => {
      console.error('[SomaticFlow] Audio error:', e);
      setAudioError('Failed to load audio file');
    });

    // Trigger load
    audioRef.current.load();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onComplete]);

  // Animation loop - sync visuals to audio currentTime
  const animate = useCallback(() => {
    if (!audioRef.current || !isPlaying) return;

    const time = audioRef.current.currentTime;
    setCurrentTime(time);

    // Update phase
    if (time < PHASES.catcow.start) setPhase('intro');
    else if (time < PHASES.transition.start) setPhase('catcow');
    else if (time < PHASES.squat.start) setPhase('transition');
    else if (time < PHASES.closing.start) setPhase('squat');
    else setPhase('closing');

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isPlaying]);

  // Start/stop animation loop
  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, animate]);

  const togglePlay = () => {
    if (!audioRef.current) {
      console.error('[SomaticFlow] Audio ref not found');
      return;
    }
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Reset to beginning if needed
      if (audioRef.current.currentTime >= audioRef.current.duration - 1) {
        audioRef.current.currentTime = 0;
      }
      
      audioRef.current.play()
        .then(() => {
          console.log('[SomaticFlow] Audio playing');
          setIsPlaying(true);
        })
        .catch(err => {
          console.error('[SomaticFlow] Play failed:', err);
          setAudioError('Playback failed: ' + err.message);
        });
    }
  };

  const seekTo = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      
      // Update phase immediately
      if (time < PHASES.catcow.start) setPhase('intro');
      else if (time < PHASES.transition.start) setPhase('catcow');
      else if (time < PHASES.squat.start) setPhase('transition');
      else if (time < PHASES.closing.start) setPhase('squat');
      else setPhase('closing');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Animation position calculations - SYNCED to audio time
  const getCatCowPosition = () => {
    const timeInCycle = currentTime % BREATH_CYCLE;
    
    if (timeInCycle < 4) {
      // INHALE: Cat → Cow
      const progress = timeInCycle / 4;
      const eased = (1 - Math.cos(progress * Math.PI)) / 2;
      return 1 - eased * 2;
    } else {
      // EXHALE: Cow → Cat
      const progress = (timeInCycle - 4) / 6;
      const eased = (1 - Math.cos(progress * Math.PI)) / 2;
      return -1 + eased * 2;
    }
  };

  const getSquatPosition = () => {
    const timeInCycle = currentTime % BREATH_CYCLE;
    
    if (timeInCycle < 4) {
      // INHALE: up → down
      const progress = timeInCycle / 4;
      const eased = (1 - Math.cos(progress * Math.PI)) / 2;
      return eased;
    } else {
      // EXHALE: down → up
      const progress = (timeInCycle - 4) / 6;
      const eased = (1 - Math.cos(progress * Math.PI)) / 2;
      return 1 - eased;
    }
  };

  const getBreathPhase = () => {
    const timeInCycle = currentTime % BREATH_CYCLE;
    return timeInCycle < 4 ? 'inhale' : 'exhale';
  };

  const getBreathProgress = () => {
    const timeInCycle = currentTime % BREATH_CYCLE;
    if (timeInCycle < 4) return timeInCycle / 4;
    return (timeInCycle - 4) / 6;
  };

  const breathPhase = getBreathPhase();
  const breathProgress = getBreathProgress();

  const getPhaseLabel = () => {
    switch(phase) {
      case 'intro': return 'SETUP';
      case 'catcow': return 'CAT-COW';
      case 'transition': return 'STAND UP';
      case 'squat': return 'SQUAT-REACH';
      case 'closing': return 'STILLNESS';
      default: return '';
    }
  };

  const getInstruction = () => {
    switch(phase) {
      case 'intro': return 'Hands & knees · Find your breath';
      case 'catcow': 
        return breathPhase === 'inhale' 
          ? 'INHALE · Spine dips down, head lifts' 
          : 'EXHALE · Spine rounds up, head drops';
      case 'transition': return 'Slowly rise to standing...';
      case 'squat': 
        return breathPhase === 'inhale'
          ? 'INHALE · Sink into squat'
          : 'EXHALE · Rise and expand';
      case 'closing': return 'Rest · Awareness settles';
      default: return '';
    }
  };

  return (
    <div style={styles.container}>
      {/* Audio is created programmatically in useEffect */}

      <div style={styles.header}>
        <p style={styles.label}>SOMATIC FLOW</p>
        <h1 style={styles.phaseTitle}>{getPhaseLabel()}</h1>
      </div>

      <div style={styles.animationArea}>
        <svg viewBox="0 0 300 180" style={styles.svg}>
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <radialGradient id="pulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff9e19" stopOpacity={0.06 + breathProgress * 0.1} />
              <stop offset="100%" stopColor="#ff9e19" stopOpacity="0" />
            </radialGradient>
          </defs>

          <ellipse cx="150" cy="100" rx="130" ry="80" fill="url(#pulse)" />
          <line x1="30" y1="160" x2="270" y2="160" stroke="#1a1a1a" strokeWidth="2" />

          <g filter="url(#glow)">
            {phase === 'intro' && (
              <TabletopStatic />
            )}
            {phase === 'catcow' && (
              <CatCowContinuous position={getCatCowPosition()} />
            )}
            {phase === 'transition' && (
              <TransitionFigure progress={(currentTime - PHASES.transition.start) / 7} />
            )}
            {phase === 'squat' && (
              <SquatContinuous position={getSquatPosition()} />
            )}
            {phase === 'closing' && (
              <StandingStill time={currentTime} />
            )}
          </g>
        </svg>
      </div>

      <p style={styles.instruction}>{getInstruction()}</p>

      <div style={styles.breathContainer}>
        <div style={styles.breathTrack}>
          <div 
            style={{
              ...styles.breathFill,
              width: `${breathProgress * 100}%`,
              background: breathPhase === 'inhale' 
                ? 'linear-gradient(90deg, #ff9e19, #ffb84d)' 
                : 'linear-gradient(90deg, #ff9e1980, #ff9e1940)',
            }}
          />
        </div>
        <div style={styles.breathLabels}>
          <span style={{ color: breathPhase === 'inhale' ? '#ff9e19' : '#444' }}>IN · 4</span>
          <span style={{ color: breathPhase === 'exhale' ? '#ff9e19' : '#444' }}>OUT · 6</span>
        </div>
      </div>

      <div style={styles.controls}>
        <button onClick={togglePlay} style={styles.playButton}>
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <span style={styles.time}>
          {formatTime(currentTime)} <span style={{color: '#444'}}>/ {formatTime(duration)}</span>
        </span>
      </div>

      <div 
        style={styles.progressContainer}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          seekTo(pct * duration);
        }}
      >
        <div style={{ ...styles.progressFill, width: `${(currentTime / duration) * 100}%` }} />
      </div>

      {/* Audio status indicator - remove after debugging */}
      {audioError && (
        <p style={{ color: '#ff4444', fontSize: '12px', marginTop: '16px' }}>
          ⚠️ {audioError} - Check that /audio/SomaticS.mp3 exists
        </p>
      )}
      {!audioReady && !audioError && (
        <p style={{ color: '#666', fontSize: '12px', marginTop: '16px' }}>
          Loading audio...
        </p>
      )}
    </div>
  );
}

// ========== FIGURE COMPONENTS ==========

// Static tabletop pose for intro - just getting into position
function TabletopStatic() {
  const spineStartX = 85;
  const spineEndX = 215;
  const shoulderY = 82;
  const hipY = 82;
  const headX = spineStartX - 30;
  const headY = 70;

  return (
    <g>
      <circle cx={spineStartX - 15} cy="158" r="5" fill="#ff9e19" />
      <line x1={spineStartX - 15} y1="158" x2={spineStartX - 5} y2="125" stroke="#ff9e19" strokeWidth="6" strokeLinecap="round" />
      <line x1={spineStartX - 5} y1="125" x2={spineStartX} y2={shoulderY} stroke="#ff9e19" strokeWidth="7" strokeLinecap="round" />

      <circle cx={spineEndX + 15} cy="158" r="5" fill="#ff9e19" />
      <line x1={spineEndX + 15} y1="158" x2={spineEndX + 5} y2="125" stroke="#ff9e19" strokeWidth="6" strokeLinecap="round" />
      <line x1={spineEndX + 5} y1="125" x2={spineEndX} y2={hipY} stroke="#ff9e19" strokeWidth="7" strokeLinecap="round" />

      {/* Flat spine - neutral position */}
      <path
        d={`M ${spineStartX} ${shoulderY} Q 150 85 ${spineEndX} ${hipY}`}
        stroke="#ff9e19"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />

      <ellipse cx={spineEndX} cy={hipY} rx="10" ry="7" fill="#ff9e19" />

      <line
        x1={spineStartX}
        y1={shoulderY}
        x2={headX + 15}
        y2={headY + 8}
        stroke="#ff9e19"
        strokeWidth="7"
        strokeLinecap="round"
      />

      <ellipse cx={headX} cy={headY} rx="14" ry="12" fill="#ff9e19" />
    </g>
  );
}

function CatCowContinuous({ position }) {
  const p = position;
  
  const spineControlY = 85 + (-p * 40);
  const headBaseY = 70;
  const headY = headBaseY + (p * 25);
  const shoulderY = 82 + (p * 3);
  const hipY = 82 + (p * 3);
  
  const spineStartX = 85;
  const spineEndX = 215;
  const headX = spineStartX - 30;

  return (
    <g>
      <circle cx={spineStartX - 15} cy="158" r="5" fill="#ff9e19" />
      <line x1={spineStartX - 15} y1="158" x2={spineStartX - 5} y2="125" stroke="#ff9e19" strokeWidth="6" strokeLinecap="round" />
      <line x1={spineStartX - 5} y1="125" x2={spineStartX} y2={shoulderY} stroke="#ff9e19" strokeWidth="7" strokeLinecap="round" />

      <circle cx={spineEndX + 15} cy="158" r="5" fill="#ff9e19" />
      <line x1={spineEndX + 15} y1="158" x2={spineEndX + 5} y2="125" stroke="#ff9e19" strokeWidth="6" strokeLinecap="round" />
      <line x1={spineEndX + 5} y1="125" x2={spineEndX} y2={hipY} stroke="#ff9e19" strokeWidth="7" strokeLinecap="round" />

      <path
        d={`M ${spineStartX} ${shoulderY} Q 150 ${spineControlY} ${spineEndX} ${hipY}`}
        stroke="#ff9e19"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />

      <ellipse cx={spineEndX} cy={hipY} rx="10" ry="7" fill="#ff9e19" />

      <line
        x1={spineStartX}
        y1={shoulderY}
        x2={headX + 15}
        y2={headY + 8}
        stroke="#ff9e19"
        strokeWidth="7"
        strokeLinecap="round"
      />

      <ellipse cx={headX} cy={headY} rx="14" ry="12" fill="#ff9e19" />
    </g>
  );
}

function SquatContinuous({ position }) {
  const p = position;
  
  const hipY = 95 + p * 40;
  const headY = hipY - 55 + p * 10;
  const kneeSpread = p * 20;
  const armY = headY + 20 - (1-p) * 40;

  return (
    <g>
      <line x1={150 - 8 - kneeSpread * 0.3} y1={hipY} x2={150 - 20 - kneeSpread} y2={hipY + 25 + p * 10} stroke="#ff9e19" strokeWidth="8" strokeLinecap="round" />
      <line x1={150 - 20 - kneeSpread} y1={hipY + 25 + p * 10} x2={150 - 15 - kneeSpread * 0.4} y2="160" stroke="#ff9e19" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx={150 - 15 - kneeSpread * 0.4} cy="162" rx="8" ry="4" fill="#ff9e19" />

      <line x1={150 + 8 + kneeSpread * 0.3} y1={hipY} x2={150 + 20 + kneeSpread} y2={hipY + 25 + p * 10} stroke="#ff9e19" strokeWidth="8" strokeLinecap="round" />
      <line x1={150 + 20 + kneeSpread} y1={hipY + 25 + p * 10} x2={150 + 15 + kneeSpread * 0.4} y2="160" stroke="#ff9e19" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx={150 + 15 + kneeSpread * 0.4} cy="162" rx="8" ry="4" fill="#ff9e19" />

      <line x1="150" y1={hipY} x2="150" y2={headY + 15} stroke="#ff9e19" strokeWidth="10" strokeLinecap="round" />

      <line x1="145" y1={headY + 18} x2={145 - 30 + p * 10} y2={armY} stroke="#ff9e19" strokeWidth="6" strokeLinecap="round" />
      <circle cx={145 - 30 + p * 10} cy={armY} r="5" fill="#ff9e19" />

      <line x1="155" y1={headY + 18} x2={155 + 30 - p * 10} y2={armY} stroke="#ff9e19" strokeWidth="6" strokeLinecap="round" />
      <circle cx={155 + 30 - p * 10} cy={armY} r="5" fill="#ff9e19" />

      <circle cx="150" cy={headY} r="14" fill="#ff9e19" />
    </g>
  );
}

function TransitionFigure({ progress }) {
  const p = Math.min(1, Math.max(0, progress));
  const ease = -(Math.cos(Math.PI * p) - 1) / 2;

  return (
    <g style={{ opacity: 0.8 }}>
      <ellipse cx="150" cy="100" rx="60" ry="25" fill="#ff9e19" opacity={0.3 * (1 - ease)} />
      <g style={{ opacity: ease }}>
        <line x1="145" y1="160" x2="147" y2="105" stroke="#ff9e19" strokeWidth="6" strokeLinecap="round" />
        <line x1="155" y1="160" x2="153" y2="105" stroke="#ff9e19" strokeWidth="6" strokeLinecap="round" />
        <line x1="150" y1="105" x2="150" y2="60" stroke="#ff9e19" strokeWidth="10" strokeLinecap="round" />
        <line x1="150" y1="65" x2="120" y2="85" stroke="#ff9e19" strokeWidth="6" strokeLinecap="round" />
        <line x1="150" y1="65" x2="180" y2="85" stroke="#ff9e19" strokeWidth="6" strokeLinecap="round" />
        <circle cx="150" cy="45" r="14" fill="#ff9e19" />
      </g>
    </g>
  );
}

function StandingStill({ time }) {
  const b = (Math.sin(time * 0.5) + 1) / 2 * 0.03;

  return (
    <g>
      <line x1="145" y1="160" x2="147" y2="105" stroke="#ff9e19" strokeWidth="6" strokeLinecap="round" />
      <line x1="155" y1="160" x2="153" y2="105" stroke="#ff9e19" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="145" cy="162" rx="8" ry="4" fill="#ff9e19" />
      <ellipse cx="155" cy="162" rx="8" ry="4" fill="#ff9e19" />
      <line x1="150" y1="105" x2="150" y2={58 - b * 100} stroke="#ff9e19" strokeWidth={10 + b * 30} strokeLinecap="round" />
      <line x1="147" y1="65" x2="130" y2="100" stroke="#ff9e19" strokeWidth="6" strokeLinecap="round" />
      <line x1="153" y1="65" x2="170" y2="100" stroke="#ff9e19" strokeWidth="6" strokeLinecap="round" />
      <circle cx="150" cy={45 - b * 50} r="14" fill="#ff9e19" />
    </g>
  );
}

function PlayIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#ff9e19">
      <polygon points="6,4 20,12 6,20" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#ff9e19">
      <rect x="5" y="4" width="5" height="16" rx="1" />
      <rect x="14" y="4" width="5" height="16" rx="1" />
    </svg>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0a0a0a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px 16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  header: { textAlign: 'center', marginBottom: '20px' },
  label: { fontSize: '11px', fontWeight: '600', letterSpacing: '0.3em', color: '#ff9e19', margin: '0 0 6px 0' },
  phaseTitle: { fontSize: '28px', fontWeight: '300', letterSpacing: '0.1em', color: '#fff', margin: 0 },
  animationArea: { width: '100%', maxWidth: '380px' },
  svg: { width: '100%', height: 'auto' },
  instruction: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#777',
    textAlign: 'center',
    margin: '20px 0',
    minHeight: '20px',
    letterSpacing: '0.02em',
  },
  breathContainer: { width: '100%', maxWidth: '260px' },
  breathTrack: { height: '5px', background: '#1a1a1a', borderRadius: '3px', overflow: 'hidden' },
  breathFill: { height: '100%', borderRadius: '3px', transition: 'width 0.15s ease-out' },
  breathLabels: { display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em' },
  controls: { display: 'flex', alignItems: 'center', gap: '20px', marginTop: '28px' },
  playButton: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: '#151515',
    border: '2px solid #ff9e19',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  time: { fontSize: '16px', fontWeight: '500', color: '#fff', fontVariantNumeric: 'tabular-nums' },
  progressContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: '300px',
    height: '6px',
    background: '#1a1a1a',
    borderRadius: '3px',
    marginTop: '24px',
    cursor: 'pointer',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #ff9e19, #ffb84d)', borderRadius: '3px', transition: 'width 0.1s linear' },
};
