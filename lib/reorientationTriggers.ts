// lib/reorientationTriggers.ts
// Step 4.1: Trigger rules for reorientation prompts
// Step 4.4: Compute which trigger is due

import { createClient } from '@/lib/supabase-client';

// ============================================
// TYPES
// ============================================

export type ReorientationType = 
  | 'day7'           // Day 7 after onboarding
  | 'day21'          // Day 21 after onboarding
  | 'missed_week'    // No rituals for 7+ days
  | 'stage4_unlock'; // Before Stage 4 unlock

export interface ReorientationContent {
  type: ReorientationType;
  title: string;
  body: string;
  seenField: keyof UserReorientationData;
}

export interface UserReorientationData {
  user_id: string;
  onboarding_started_at: string | null;
  last_ritual_completed_at: string | null;
  current_stage: number;
  stage_4_unlocked_at: string | null;
  reorientation_day7_seen: boolean;
  reorientation_day21_seen: boolean;
  reorientation_missedweek_seen: boolean;
  reorientation_stage4_seen: boolean;
}

// ============================================
// STEP 4.3: CANONICAL CONTENT (Single Version)
// ============================================

const CORE_MESSAGE = `Quick recalibration: This system doesn't reward effort or intention. It trains capacities. Life provides the exam. Nothing here is failing — it's revealing.`;

export const REORIENTATION_CONTENT: Record<ReorientationType, ReorientationContent> = {
  day7: {
    type: 'day7',
    title: 'Week 1 Checkpoint',
    body: `${CORE_MESSAGE}

One week in. The practices aren't about "doing it right." They're about noticing what happens when you show up consistently. What patterns have you started to notice?`,
    seenField: 'reorientation_day7_seen'
  },
  
  day21: {
    type: 'day21',
    title: '21-Day Checkpoint',
    body: `${CORE_MESSAGE}

Three weeks. Neural pathways don't respond to motivation — they respond to repetition. Whatever you've been training is now starting to wire. The question isn't "am I doing this right?" — it's "what capacity am I building?"`,
    seenField: 'reorientation_day21_seen'
  },
  
  missed_week: {
    type: 'missed_week',
    title: 'Welcome Back',
    body: `${CORE_MESSAGE}

You've been away. That's data, not failure. The nervous system doesn't judge gaps — it responds to what you do next. One practice today trains more than guilt about yesterday.`,
    seenField: 'reorientation_missedweek_seen'
  },
  
  stage4_unlock: {
    type: 'stage4_unlock',
    title: 'Entering Flow Mode',
    body: `${CORE_MESSAGE}

Stage 4 introduces sustained attention training. Flow Blocks don't train productivity — they train the capacity to hold focus without force. The goal isn't "getting things done." It's building the ability to direct attention at will.`,
    seenField: 'reorientation_stage4_seen'
  }
};

// ============================================
// STEP 4.1: TRIGGER RULES
// ============================================

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

/**
 * Compute which reorientation trigger is due (if any)
 * Priority: missed_week > stage4 > day21 > day7
 */
export function getDueReorientation(
  user: UserReorientationData
): ReorientationContent | null {
  
  const daysSinceOnboarding = daysSince(user.onboarding_started_at);
  const daysSinceLastRitual = daysSince(user.last_ritual_completed_at);

  // TRIGGER 1: Missed week (7+ days without ritual)
  // Only if they've done at least one ritual before
  if (
    user.last_ritual_completed_at &&
    daysSinceLastRitual !== null &&
    daysSinceLastRitual >= 7 &&
    !user.reorientation_missedweek_seen
  ) {
    return REORIENTATION_CONTENT.missed_week;
  }

  // TRIGGER 2: Stage 4 unlock preface
  // Show when user is at stage 3 (about to unlock 4) and hasn't seen it
  if (
    user.current_stage === 3 &&
    !user.stage_4_unlocked_at &&
    !user.reorientation_stage4_seen
  ) {
    return REORIENTATION_CONTENT.stage4_unlock;
  }

  // TRIGGER 3: Day 21 checkpoint
  if (
    daysSinceOnboarding !== null &&
    daysSinceOnboarding >= 21 &&
    !user.reorientation_day21_seen
  ) {
    return REORIENTATION_CONTENT.day21;
  }

  // TRIGGER 4: Day 7 checkpoint
  if (
    daysSinceOnboarding !== null &&
    daysSinceOnboarding >= 7 &&
    !user.reorientation_day7_seen
  ) {
    return REORIENTATION_CONTENT.day7;
  }

  return null;
}

/**
 * Check specifically for Stage 4 reorientation
 * Call this during Stage 4 unlock flow
 */
export function shouldShowStage4Reorientation(
  user: UserReorientationData
): boolean {
  return !user.reorientation_stage4_seen;
}

// ============================================
// DATABASE OPERATIONS
// ============================================

/**
 * Fetch user's reorientation data
 */
export async function fetchReorientationData(
  userId: string
): Promise<UserReorientationData | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('user_progress')
      .select(`
        user_id,
        onboarding_started_at,
        last_ritual_completed_at,
        current_stage,
        stage_4_unlocked_at,
        reorientation_day7_seen,
        reorientation_day21_seen,
        reorientation_missedweek_seen,
        reorientation_stage4_seen
      `)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.error('[Reorientation] Fetch error:', error);
      return null;
    }

    return data as UserReorientationData;
  } catch (err) {
    console.error('[Reorientation] Unexpected error:', err);
    return null;
  }
}

/**
 * Mark a reorientation as seen
 */
export async function markReorientationSeen(
  userId: string,
  type: ReorientationType
): Promise<boolean> {
  try {
    const supabase = createClient();
    const content = REORIENTATION_CONTENT[type];
    
    const { error } = await supabase
      .from('user_progress')
      .update({ [content.seenField]: true })
      .eq('user_id', userId);

    if (error) {
      console.error('[Reorientation] Mark seen error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[Reorientation] Unexpected error:', err);
    return false;
  }
}

/**
 * Set onboarding started timestamp
 * Call this when baseline/onboarding is completed
 */
export async function setOnboardingStarted(
  userId: string
): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('user_progress')
      .update({ onboarding_started_at: new Date().toISOString() })
      .eq('user_id', userId);

    return !error;
  } catch (err) {
    console.error('[Reorientation] Set onboarding error:', err);
    return false;
  }
}

/**
 * Update last ritual completed (also resets missed week flag)
 * Note: This is also done via database trigger on practice_logs insert
 */
export async function updateLastRitualCompleted(
  userId: string
): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('user_progress')
      .update({ 
        last_ritual_completed_at: new Date().toISOString(),
        reorientation_missedweek_seen: false // Reset so it can trigger again
      })
      .eq('user_id', userId);

    return !error;
  } catch (err) {
    console.error('[Reorientation] Update ritual error:', err);
    return false;
  }
}

/**
 * Record Stage 4 unlock timestamp
 */
export async function recordStage4Unlock(
  userId: string
): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('user_progress')
      .update({ stage_4_unlocked_at: new Date().toISOString() })
      .eq('user_id', userId);

    return !error;
  } catch (err) {
    console.error('[Reorientation] Stage 4 unlock error:', err);
    return false;
  }
}
