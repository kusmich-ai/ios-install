import React, { useState, useEffect, useRef } from 'react';

/**
 * SomaticFlowAnimation v4
 * 
 * Fixes from v3:
 * - Cat-Cow head now moves correctly (up on inhale/Cow, down on exhale/Cat)
 * - Cat-Cow is now a seamless continuous loop (like squat)
 * - Breath mapping verified: Inhale = Cow (spine down), Exhale = Cat (spine up)
 */

export default function SomaticFlowV4() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [phase, setPhase] = useState('intro');
  const animationRef = useRef(null);
  const lastTimeRef = useRef(Date.now());

  const DURATION = 290;
  const BREATH_CYCLE = 10; // 4s inhale + 6s exhale

  const PHASES = {
    intro: { start: 0, end: 28 },
    catcow: { start: 28, end: 88 },
    transition: { start: 88, end: 95 },
    squat: { start: 95, end: 155 },
    closing: { start: 155, end: 290 }
  };

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      const now = Date.now();
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setCurrentTime(prev => {
        const newTime = prev + delta;
        if (newTime >= DURATION) {
          setIsPlaying(false);
          return 0;
        }
        return newTime;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = Date.now();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  // Update phase
  useEffect(() => {
    const time = currentTime;
    if (time < PHASES.catcow.start) setPhase('intro');
    else if (time < PHASES.transition.start) setPhase('catcow');
    else if (time < PHASES.squat.start) setPhase('transition');
    else if (time < PHASES.closing.start) setPhase('squat');
    else setPhase('closing');
  }, [currentTime]);

  const togglePlay = () => {
    if (!isPlaying && currentTime >= DURATION) setCurrentTime(0);
    setIsPlaying(!isPlaying);
  };

  const jumpToPhase = (phaseName) => {
    const phaseData = PHASES[phaseName];
    if (phaseData) setCurrentTime(phaseData.start + 0.5);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // CONTINUOUS POSITION CALCULATIONS
  // Both return -1 to 1 using smooth sine wave

  const getCatCowPosition = () => {
    // Returns: -1 = Cow (spine down, head UP), +1 = Cat (spine up, head DOWN)
    // SYNCED to breath timer: Inhale (0-4s) = Cow, Exhale (4-10s) = Cat
    const timeInCycle = currentTime % BREATH_CYCLE;
    
    if (timeInCycle < 4) {
      // INHALE: transition from Cat (+1) to Cow (-1)
      const progress = timeInCycle / 4;
      const eased = (1 - Math.cos(progress * Math.PI)) / 2;
      return 1 - eased * 2; // +1 → -1
    } else {
      // EXHALE: transition from Cow (-1) to Cat (+1)
      const progress = (timeInCycle - 4) / 6;
      const eased = (1 - Math.cos(progress * Math.PI)) / 2;
      return -1 + eased * 2; // -1 → +1
    }
  };

  const getSquatPosition = () => {
    // Returns: 0 = standing tall (arms up), 1 = deep squat (arms forward)
    // SYNCED to breath timer: Inhale (0-4s) = sink down, Exhale (4-10s) = rise up
    const timeInCycle = currentTime % BREATH_CYCLE;
    
    if (timeInCycle < 4) {
      // INHALE: rise up (0) → sink down (1)
      const progress = timeInCycle / 4;
      const eased = (1 - Math.cos(progress * Math.PI)) / 2;
      return eased; // 0 → 1
    } else {
      // EXHALE: sink down (1) → rise up (0)
      const progress = (timeInCycle - 4) / 6;
      const eased = (1 - Math.cos(progress * Math.PI)) / 2;
      return 1 - eased; // 1 → 0
    }
  };

  // Determine which breath phase we're in (for UI display only)
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
      <div style={styles.header}>
        <p style={styles.label}>SOMATIC FLOW</p>
        <h1 style={styles.phaseTitle}>{getPhaseLabel()}</h1>
      </div>

      <div style={styles.phaseNav}>
        {['intro', 'catcow', 'squat', 'closing'].map((p) => (
          <button
            key={p}
            onClick={() => jumpToPhase(p)}
            style={{
              ...styles.phaseButton,
              borderColor: (phase === p || (p === 'catcow' && phase === 'transition')) ? '#ff9e19' : '#2a2a2a',
              color: (phase === p || (p === 'catcow' && phase === 'transition')) ? '#ff9e19' : '#555',
              background: phase === p ? 'rgba(255,158,25,0.1)' : 'transparent',
            }}
          >
            {p === 'catcow' ? 'CAT-COW' : p === 'squat' ? 'SQUAT' : p.toUpperCase()}
          </button>
        ))}
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
            {(phase === 'intro' || phase === 'catcow') && (
              <CatCowContinuous position={getCatCowPosition()} isIntro={phase === 'intro'} />
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
          {formatTime(currentTime)} <span style={{color: '#444'}}>/ {formatTime(DURATION)}</span>
        </span>
      </div>

      <div 
        style={styles.progressContainer}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          setCurrentTime(pct * DURATION);
        }}
      >
        <div style={{ ...styles.progressFill, width: `${(currentTime / DURATION) * 100}%` }} />
        {Object.values(PHASES).map((p, i) => (
          <div key={i} style={{ ...styles.marker, left: `${(p.start / DURATION) * 100}%` }} />
        ))}
      </div>

      <p style={styles.note}>Preview mode · Production syncs to audio</p>
    </div>
  );
}

/**
 * CAT-COW - Continuous seamless loop
 * 
 * position: -1 to +1
 *   -1 = COW pose (Inhale): spine dips DOWN, head goes UP
 *   +1 = CAT pose (Exhale): spine rounds UP, head goes DOWN
 * 
 * The SPINE is the main visual element that moves.
 * Head follows naturally - UP when spine dips, DOWN when spine rounds.
 */
function CatCowContinuous({ position, isIntro }) {
  const intensity = isIntro ? 0.4 : 1;
  const p = position * intensity;
  
  // Spine curve amount: negative p = dip down (Cow), positive p = round up (Cat)
  // p of -1 should give us max dip, p of +1 should give max round
  const spineArc = p * -25; // Flip sign: when p is -1 (Cow), spineArc is +25 (control point goes DOWN in SVG)
                            // when p is +1 (Cat), spineArc is -25 (control point goes UP in SVG)
  
  // Wait, SVG Y increases downward. So:
  // - Larger Y = lower on screen
  // - For COW (spine dips): the middle of spine should have LARGER Y (lower)
  // - For CAT (spine rounds): the middle of spine should have SMALLER Y (higher)
  
  // So: spineArc positive = spine dips (Cow), spineArc negative = spine rounds (Cat)
  // p = -1 (Cow) should give positive spineArc
  // p = +1 (Cat) should give negative spineArc
  // Therefore: spineArc = -p * 25
  
  const spineControlY = 85 + (-p * 40); // Cow: p=-1 → 85+40=125 (lower, dipped)
                                         // Cat: p=+1 → 85-40=45 (higher, rounded)
  
  // Head position: 
  // COW (p=-1): head should go UP (smaller Y)
  // CAT (p=+1): head should go DOWN (larger Y)
  // So headY should increase as p increases
  const headBaseY = 70;
  const headY = headBaseY + (p * 25); // Cow: 70 + (-25) = 45 (up)
                                       // Cat: 70 + 25 = 95 (down)
  
  // Shoulder and hip positions - they move slightly with the spine
  const shoulderY = 82 + (p * 3);  // Slight movement
  const hipY = 82 + (p * 3);
  
  const spineStartX = 85;
  const spineEndX = 215;
  const headX = spineStartX - 30;

  return (
    <g>
      {/* Hands - planted on ground */}
      <circle cx={spineStartX - 15} cy="158" r="5" fill="#ff9e19" />
      
      {/* Front arm: hand → elbow → shoulder */}
      <line 
        x1={spineStartX - 15} y1="158" 
        x2={spineStartX - 5} y2="125" 
        stroke="#ff9e19" strokeWidth="6" strokeLinecap="round" 
      />
      <line 
        x1={spineStartX - 5} y1="125" 
        x2={spineStartX} y2={shoulderY} 
        stroke="#ff9e19" strokeWidth="7" strokeLinecap="round" 
      />

      {/* Knees - planted on ground */}
      <circle cx={spineEndX + 15} cy="158" r="5" fill="#ff9e19" />
      
      {/* Back leg: knee → hip */}
      <line 
        x1={spineEndX + 15} y1="158" 
        x2={spineEndX + 5} y2="125" 
        stroke="#ff9e19" strokeWidth="6" strokeLinecap="round" 
      />
      <line 
        x1={spineEndX + 5} y1="125" 
        x2={spineEndX} y2={hipY} 
        stroke="#ff9e19" strokeWidth="7" strokeLinecap="round" 
      />

      {/* THE SPINE - main animated element */}
      <path
        d={`M ${spineStartX} ${shoulderY} 
            Q 150 ${spineControlY} 
            ${spineEndX} ${hipY}`}
        stroke="#ff9e19"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />

      {/* Pelvis */}
      <ellipse cx={spineEndX} cy={hipY} rx="10" ry="7" fill="#ff9e19" />

      {/* Neck */}
      <line
        x1={spineStartX}
        y1={shoulderY}
        x2={headX + 15}
        y2={headY + 8}
        stroke="#ff9e19"
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* Head */}
      <ellipse
        cx={headX}
        cy={headY}
        rx="14"
        ry="12"
        fill="#ff9e19"
      />
    </g>
  );
}

/**
 * SQUAT - Continuous seamless loop
 * position: 0 = standing (arms up), 1 = squat (arms forward)
 */
function SquatContinuous({ position }) {
  const p = position;
  
  const hipY = 95 + p * 40;
  const headY = hipY - 55 + p * 10;
  const kneeSpread = p * 20;
  const armY = headY + 20 - (1-p) * 40;

  return (
    <g>
      {/* Left leg */}
      <line x1={150 - 8 - kneeSpread * 0.3} y1={hipY} x2={150 - 20 - kneeSpread} y2={hipY + 25 + p * 10} stroke="#ff9e19" strokeWidth="8" strokeLinecap="round" />
      <line x1={150 - 20 - kneeSpread} y1={hipY + 25 + p * 10} x2={150 - 15 - kneeSpread * 0.4} y2="160" stroke="#ff9e19" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx={150 - 15 - kneeSpread * 0.4} cy="162" rx="8" ry="4" fill="#ff9e19" />

      {/* Right leg */}
      <line x1={150 + 8 + kneeSpread * 0.3} y1={hipY} x2={150 + 20 + kneeSpread} y2={hipY + 25 + p * 10} stroke="#ff9e19" strokeWidth="8" strokeLinecap="round" />
      <line x1={150 + 20 + kneeSpread} y1={hipY + 25 + p * 10} x2={150 + 15 + kneeSpread * 0.4} y2="160" stroke="#ff9e19" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx={150 + 15 + kneeSpread * 0.4} cy="162" rx="8" ry="4" fill="#ff9e19" />

      {/* Torso */}
      <line x1="150" y1={hipY} x2="150" y2={headY + 15} stroke="#ff9e19" strokeWidth="10" strokeLinecap="round" />

      {/* Left arm */}
      <line x1="145" y1={headY + 18} x2={145 - 30 + p * 10} y2={armY} stroke="#ff9e19" strokeWidth="6" strokeLinecap="round" />
      <circle cx={145 - 30 + p * 10} cy={armY} r="5" fill="#ff9e19" />

      {/* Right arm */}
      <line x1="155" y1={headY + 18} x2={155 + 30 - p * 10} y2={armY} stroke="#ff9e19" strokeWidth="6" strokeLinecap="round" />
      <circle cx={155 + 30 - p * 10} cy={armY} r="5" fill="#ff9e19" />

      {/* Head */}
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
  phaseNav: { display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'center' },
  phaseButton: {
    padding: '8px 14px',
    fontSize: '9px',
    fontWeight: '600',
    letterSpacing: '0.08em',
    border: '1px solid #2a2a2a',
    borderRadius: '16px',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
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
    overflow: 'visible',
  },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #ff9e19, #ffb84d)', borderRadius: '3px', transition: 'width 0.1s linear' },
  marker: { position: 'absolute', top: '-2px', width: '2px', height: '10px', background: '#333', borderRadius: '1px' },
  note: { marginTop: '20px', fontSize: '10px', color: '#444', letterSpacing: '0.1em' },
};
