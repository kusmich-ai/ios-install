// ============================================
// AWARENESS REP ROTATION SYSTEM
// ============================================
// Manages automatic rotation of 11 Awareness Rep scripts
// across 3 progressive tiers based on user's current stage.
//
// Tier 1 (Foundation):   Stages 1-2  → F1, F2, F3, F4  (~2 min each)
// Tier 2 (Recognition):  Stages 3-5  → R1, R2, R3, R4  (~2.5 min each)
// Tier 3 (Integration):  Stages 6-7  → I1, I2, I3      (~3 min each)
//
// Rotation is sequential within tier. When a user does multiple
// reps in one day, it advances to the next script each time.
// ============================================

export type AwarenessRepScript =
  | 'F1' | 'F2' | 'F3' | 'F4'
  | 'R1' | 'R2' | 'R3' | 'R4'
  | 'I1' | 'I2' | 'I3';

export type AwarenessRepTier = 1 | 2 | 3;

// ---- Tier Definitions ----

const TIER_SCRIPTS: Record<AwarenessRepTier, AwarenessRepScript[]> = {
  1: ['F1', 'F2', 'F3', 'F4'],
  2: ['R1', 'R2', 'R3', 'R4'],
  3: ['I1', 'I2', 'I3'],
};

const TIER_LABELS: Record<AwarenessRepTier, string> = {
  1: 'Foundation',
  2: 'Recognition',
  3: 'Integration',
};

// Script display names (for UI/logs if needed)
const SCRIPT_NAMES: Record<AwarenessRepScript, string> = {
  F1: 'Breath Entry',
  F2: 'Sound Entry',
  F3: 'Body Scan Micro',
  F4: 'Visual Field Entry',
  R1: 'Direct Interpretation Detection',
  R2: 'Activation-Compatible',
  R3: 'Minimal Instruction',
  R4: 'Movement-Compatible',
  I1: 'Near-Silent',
  I2: 'Choiceless Awareness',
  I3: 'Daily Life Integration',
};

// Audio file paths — files live in /public/audio/awareness-rep/
const SCRIPT_AUDIO_PATHS: Record<AwarenessRepScript, string> = {
  F1: '/audio/awareness-rep/F1.mp3',
  F2: '/audio/awareness-rep/F2.mp3',
  F3: '/audio/awareness-rep/F3.mp3',
  F4: '/audio/awareness-rep/F4.mp3',
  R1: '/audio/awareness-rep/R1.mp3',
  R2: '/audio/awareness-rep/R2.mp3',
  R3: '/audio/awareness-rep/R3.mp3',
  R4: '/audio/awareness-rep/R4.mp3',
  I1: '/audio/awareness-rep/I1.mp3',
  I2: '/audio/awareness-rep/I2.mp3',
  I3: '/audio/awareness-rep/I3.mp3',
};

// ---- Core Logic ----

/**
 * Determine which tier a user belongs to based on their current stage.
 */
export function getTierForStage(currentStage: number): AwarenessRepTier {
  if (currentStage <= 2) return 1;
  if (currentStage <= 5) return 2;
  return 3;
}

/**
 * Get the next script in rotation for a given user.
 *
 * @param currentStage - User's current IOS stage (1-7)
 * @param lastScript - The last script played (from user_progress.last_awareness_rep_script), or null if never played
 * @returns The next script to play
 *
 * Logic:
 * 1. Determine the user's tier from their stage
 * 2. If they have no last script, or their last script was from a different tier
 *    (e.g., they just unlocked a new stage), start at the first script of their tier
 * 3. Otherwise, advance to the next script in the tier's rotation (wrapping around)
 */
export function getNextScript(
  currentStage: number,
  lastScript: AwarenessRepScript | null
): AwarenessRepScript {
  const tier = getTierForStage(currentStage);
  const scripts = TIER_SCRIPTS[tier];

  // No history, or last script was from a different tier → start at beginning
  if (!lastScript || !scripts.includes(lastScript)) {
    return scripts[0];
  }

  // Advance to next in rotation (wrap around)
  const currentIndex = scripts.indexOf(lastScript);
  const nextIndex = (currentIndex + 1) % scripts.length;
  return scripts[nextIndex];
}

/**
 * Get the audio file path for a given script.
 */
export function getScriptAudioPath(script: AwarenessRepScript): string {
  return SCRIPT_AUDIO_PATHS[script];
}

/**
 * Get display-friendly info about a script.
 */
export function getScriptInfo(script: AwarenessRepScript) {
  const tier = script.startsWith('F') ? 1 : script.startsWith('R') ? 2 : 3;
  return {
    id: script,
    name: SCRIPT_NAMES[script],
    tier,
    tierLabel: TIER_LABELS[tier as AwarenessRepTier],
    audioPath: SCRIPT_AUDIO_PATHS[script],
  };
}

/**
 * Get all scripts available for a given stage.
 * Returns the tier's scripts plus optionally previous tiers' scripts.
 */
export function getAvailableScripts(currentStage: number): {
  current: AwarenessRepScript[];
  previous: AwarenessRepScript[];
} {
  const tier = getTierForStage(currentStage);
  const current = TIER_SCRIPTS[tier];

  // Collect all previous tier scripts (available but not default)
  const previous: AwarenessRepScript[] = [];
  for (let t = 1; t < tier; t++) {
    previous.push(...TIER_SCRIPTS[t as AwarenessRepTier]);
  }

  return { current, previous };
}

/**
 * Get a summary string for logging/debugging.
 */
export function getRotationSummary(
  currentStage: number,
  lastScript: AwarenessRepScript | null
): string {
  const tier = getTierForStage(currentStage);
  const next = getNextScript(currentStage, lastScript);
  const info = getScriptInfo(next);
  return `Stage ${currentStage} → Tier ${tier} (${TIER_LABELS[tier]}) → Next: ${info.id} "${info.name}"`;
}
