import BreathPacer from '@/components/BreathPacer';

// Where the breathing step renders:
<BreathPacer
  duration={120}
  inhaleSeconds={4}
  exhaleSeconds={6}
  onComplete={() => {
    // Advance to next step in the loop dissolver
  }}
  onSkip={() => {
    // Skip breathing, advance to next step
  }}
/>
