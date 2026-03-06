// app/hooks/useUserProgress.ts
// Updated to read identity_statement from identity_sprints table (displayed as aligned action in UI)
// Includes stage attribution "seen" flags for show-once unlock modals
// v2: Added streak freeze logic (Step 7)
// v3: Added milestone message logic (Step 8)
// v4: Added weeklyCheckInDue (Step 13)
// v5: Added baselineScores + patternProfile for Stage 1→2 unlock flow
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase-client';

// ============================================
// TYPES
// ============================================

export interface UserProgress {
  currentStage: number;
  stageStartDate: string | null;
  adherencePercentage: number;
  consecutiveDays: number;
  rewiredIndex: number;
  rewiredDelta: number;
  tier: string;
  domainScores: {
    regulation: number;
    awareness: number;
    outlook: number;
    attention: number;
  };
  domainDeltas: {
    regulation: number;
    awareness: number;
    outlook: number;
    attention: number;
    average: number;
  };
  unlockedTools: string[];
  dailyPractices: {
    id: string;
    name: string;
    completed: boolean;
  }[];
  unlockEligible: boolean;
  dataDate: string;
  createdAt: string | null;
  
  // Aligned Action Sprint fields (updated from Identity)
  coherenceStatement: string | null;  // NEW - primary field
  currentIdentity: string | null;     // KEEP for backwards compatibility
  microAction: string | null;
  sprintDay: number | null;           // NEW - primary field
  identitySprintDay: number | null;   // KEEP for backwards compatibility
  identitySprintNumber: number | null;
  identitySprintStart: string | null;
  
  // Flow Block fields
  hasFlowBlockConfig: boolean;
  flowBlockSprintNumber: number | null;
  flowBlockSprintStart: string | null;
  flowBlockSprintDay: number | null;
  
  // Practice completion counts (for adaptive UI - e.g. video-mandatory vs self-guided)
  somaticFlowCompletions: number;
  
  // Progress tracking
  daysInStage: number;
  unlockProgress: {
    adherenceMet: boolean;
    daysMet: boolean;
    deltaMet: boolean;
    qualitativeMet: boolean;
    requiredAdherence: number;
    requiredDays: number;
    requiredDelta: number;
    isAccelerated: boolean;
    acceleratedDays: number | null;
  };
  
  // Streak freeze
  streakFreezeUsed: boolean;
  streakFreezeDate: string | null;
  streakFreezeAvailable: boolean;

  // Milestone messages (Step 8)
  milestonePendingDay: number | null;
  milestoneMessagesSent: number[];

  // Weekly check-in status (Step 13)
  // true = Stage 2+ and no check-in recorded for the current calendar week
  weeklyCheckInDue: boolean;
  
  // Stage attribution "seen" flags (for show-once unlock modals)
  stage_1_attribution_seen: boolean;
  stage_2_attribution_seen: boolean;
  stage_3_attribution_seen: boolean;
  stage_4_attribution_seen: boolean;
  stage_5_attribution_seen: boolean;
  stage_6_attribution_seen: boolean;

  // Baseline scores (raw, for unlock flow transformation mirror)
  baselineScores: {
    regulation: number;
    awareness: number;
    outlook: number;
    attention: number;
    rewiredIndex: number;
  };

  // Pattern profile (from Mirror onboarding)
  patternProfile: {
    primaryPattern: string | null;
    coreChallenge: string | null;
    mirrorSummary: string | null;
  } | null;
}

// ============================================
// CONSTANTS
// ============================================

interface AcceleratedThreshold {
  adherence: number;
  days: number;
  delta: number;
  qualitative: number;
}

const UNLOCK_THRESHOLDS: { [stage: number]: {
  adherence: number; days: number; delta: number; qualitative: number;
  accelerated?: AcceleratedThreshold;
} } = {
  1: {
    adherence: 70, days: 7, delta: 0.3, qualitative: 3,
    accelerated: { adherence: 90, days: 5, delta: 0.3, qualitative: 3 }
  },
  2: {
    adherence: 80, days: 14, delta: 0.5, qualitative: 3,
    accelerated: { adherence: 90, days: 10, delta: 0.5, qualitative: 4 }
  },
  3: {
    adherence: 80, days: 14, delta: 0.5, qualitative: 3,
    accelerated: { adherence: 90, days: 10, delta: 0.5, qualitative: 4 }
  },
  4: { adherence: 80, days: 14, delta: 0.6, qualitative: 3 },
  5: {
    adherence: 85, days: 14, delta: 0.7, qualitative: 3,
    accelerated: { adherence: 90, days: 12, delta: 0.7, qualitative: 4 }
  },
  6: { adherence: 85, days: 14, delta: 0.7, qualitative: 3 }
};

const STAGE_TOOLS: { [stage: number]: string[] } = {
  1: ['decentering', 'nos_glide', 'worry_loop_dissolver'],
  2: ['decentering', 'nos_glide', 'worry_loop_dissolver', 'meta_reflection'],
  3: ['decentering', 'nos_glide', 'worry_loop_dissolver', 'meta_reflection', 'reframe'],
  4: ['decentering', 'nos_glide', 'worry_loop_dissolver', 'meta_reflection', 'reframe', 'thought_hygiene'],
  5: ['decentering', 'nos_glide', 'worry_loop_dissolver', 'meta_reflection', 'reframe', 'thought_hygiene'],
  6: ['decentering', 'nos_glide', 'worry_loop_dissolver', 'meta_reflection', 'reframe', 'thought_hygiene'],
  7: ['decentering', 'nos_glide', 'worry_loop_dissolver', 'meta_reflection', 'reframe', 'thought_hygiene']
};

const MILESTONE_DAYS = [1, 2, 4, 5, 6];

// ============================================
// HELPER FUNCTIONS
// ============================================

function getLocalDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// Returns the Monday of the current calendar week as YYYY-MM-DD
// Exported so ChatInterface can use the same logic for mini check-in saves
export function getCurrentWeekMonday(): string {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
}

function getTierFromIndex(index: number): string {
  if (index <= 20) return 'System Offline';
  if (index <= 40) return 'Baseline Mode';
  if (index <= 60) return 'Operational';
  if (index <= 80) return 'Optimized';
  return 'Integrated';
}

// Helper: determine calm rating trend direction over last 3 data points
function getCalmRatingTrend(ratings: number[]): 'up' | 'flat' | 'down' | 'insufficient' {
  if (ratings.length < 3) return 'insufficient';
  const last3 = ratings.slice(-3);
  let upMoves = 0;
  let downMoves = 0;
  for (let i = 1; i < last3.length; i++) {
    if (last3[i] > last3[i - 1]) upMoves++;
    else if (last3[i] < last3[i - 1]) downMoves++;
  }
  if (downMoves >= 2) return 'down';
  if (upMoves >= 2) return 'up';
  return 'flat';
}

function checkBasicUnlockEligibility(
  stage: number,
  adherence: number,
  daysInStage: number,
  avgDelta: number,
  qualitativeRating: number | null,
  avgScore: number,
  recentCalmRatings: number[] = [],
  baselineCalmScore: number = 2.5
): boolean {
  const threshold = UNLOCK_THRESHOLDS[stage];
  if (!threshold) return false;

  // ============================================
  // STAGE 1: 3-gate, 4-path logic
  // Primary signal = daily calm ratings (no weekly check-in required)
  // ============================================
  if (stage === 1) {
    // GATE 1 — Adherence (standard OR accelerated path)
    const standardAdherenceMet = adherence >= 70 && daysInStage >= 7;
    const acceleratedAdherenceMet = adherence >= 90 && daysInStage >= 5;
    const gate1 = standardAdherenceMet || acceleratedAdherenceMet;
    if (!gate1) return false;

    // GATE 3 — No regression (sustained downward trend = not ready)
    const trend = getCalmRatingTrend(recentCalmRatings);
    if (trend === 'down') return false;

    // GATE 2 — Signal shift (first passing path wins)
    // Path A: avg calm ratings >= baseline regulation + 0.3 (no check-in needed)
    const avgCalm = recentCalmRatings.length >= 3
      ? recentCalmRatings.reduce((s, r) => s + r, 0) / recentCalmRatings.length
      : null;
    const pathA = avgCalm !== null && avgCalm >= baselineCalmScore + 0.3;

    // Path B: weekly check-in avg delta >= 0.3 (if check-in was completed)
    const pathB = avgDelta >= 0.3;

    // Path C: competence bypass — already operating at high level
    const pathC = avgScore >= 4.0;

    // Path D: hard-week path — high adherence + not declining (no delta required)
    const pathD = adherence >= 85 && (trend === 'up' || trend === 'flat' || trend === 'insufficient');

    const gate2 = pathA || pathB || pathC || pathD;
    return gate2;
  }

  // ============================================
  // STAGES 2–6: Original hybrid logic (unchanged)
  // ============================================
  const COMPETENCE_THRESHOLD = 4.0;

  // Accelerated path check
  if (threshold.accelerated) {
    const accel = threshold.accelerated;
    const accelAdherence = adherence >= accel.adherence;
    const accelDays = daysInStage >= accel.days;
    const accelDelta = avgDelta >= accel.delta || avgScore >= COMPETENCE_THRESHOLD;
    const accelQual = qualitativeRating !== null && qualitativeRating >= accel.qualitative;
    if (accelAdherence && accelDays && accelDelta && accelQual) return true;
  }

  // Standard path
  const adherenceMet = adherence >= threshold.adherence;
  const daysMet = daysInStage >= threshold.days;
  const deltaMet = avgDelta >= threshold.delta || avgScore >= COMPETENCE_THRESHOLD;
  const qualMet = qualitativeRating !== null && qualitativeRating >= threshold.qualitative;

  return adherenceMet && daysMet && deltaMet && qualMet;
}

// ============================================
// HOOK
// ============================================

export function useUserProgress() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const supabase = createClient();
  const lastFetchDate = useRef<string | null>(null);
  const lastFetchTime = useRef<number>(0);

  const fetchProgress = useCallback(async (forceRefresh = false) => {
    const today = getLocalDateString();
    
    if (!forceRefresh && progress?.dataDate === today) {
      return;
    }

    if (!forceRefresh) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: baselineRows } = await supabase
        .from('user_data')
        .select('key, value')
        .eq('user_id', user.id)
        .in('key', ['ios:baseline:domain_scores', 'ios:baseline:rewired_index']);

      const baselineMap = (baselineRows || []).reduce((acc: Record<string, string>, row: { key: string; value: string }) => {
        acc[row.key] = row.value;
        return acc;
      }, {} as Record<string, string>);

      const baselineDomainScores = baselineMap['ios:baseline:domain_scores'] 
        ? JSON.parse(baselineMap['ios:baseline:domain_scores'])
        : { regulation: 2.5, awareness: 2.5, outlook: 2.5, attention: 2.5 };

      const baselineRewiredIndex = baselineMap['ios:baseline:rewired_index']
        ? JSON.parse(baselineMap['ios:baseline:rewired_index'])
        : 50;

      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (progressError) {
        throw progressError;
      }

      // ============================================
      // AUTO-RESET: If 7+ days since last practice, reset stage_start_date
      // so returning users get a fresh start instead of "40 days in Stage 1"
      // ============================================
      const { data: lastPracticeLog } = await supabase
        .from('practice_logs')
        .select('practice_date')
        .eq('user_id', user.id)
        .order('practice_date', { ascending: false })
        .limit(1)
        .single();

      if (lastPracticeLog?.practice_date) {
        const lastPracticeDate = new Date(lastPracticeLog.practice_date + 'T00:00:00');
        const now = new Date();
        const daysSinceLastPractice = Math.floor((now.getTime() - lastPracticeDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastPractice >= 7) {
          console.log(`[useUserProgress] Auto-reset: ${daysSinceLastPractice} days since last practice. Resetting stage_start_date.`);
          const newStartDate = new Date().toISOString();
          
          await supabase
            .from('user_progress')
            .update({
              stage_start_date: newStartDate,
              consecutive_days: 0
            })
            .eq('user_id', user.id);
          
          // Update local data so the rest of this fetch uses the new values
          progressData.stage_start_date = newStartDate;
          progressData.consecutive_days = 0;
        }
      }

      // NOTE: week_of included for weeklyCheckInDue calculation (Step 13)
      const { data: latestDelta } = await supabase
        .from('weekly_deltas')
        .select('week_of,regulation_score,awareness_score,outlook_score,attention_score,regulation_delta,awareness_delta,outlook_delta,attention_delta,average_delta,qualitative_rating')
        .eq('user_id', user.id)
        .order('week_of', { ascending: false })
        .limit(1)
        .single();

      const { data: todayLogs } = await supabase
        .from('practice_logs')
        .select('practice_type')
        .eq('user_id', user.id)
        .eq('practice_date', today);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

      const { data: signalCheckLogs } = await supabase
        .from('signal_checks')
        .select('calm_score, created_at')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      const recentCalmRatings: number[] = (signalCheckLogs || [])
        .map((log: { calm_score: number | null }) => log.calm_score)
        .filter((r: number | null): r is number => r !== null);

      const { count: somaticFlowCount, error: sfCountError } = await supabase
        .from('practice_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('practice_type', 'somatic_flow')
        .eq('completed', true);

      if (sfCountError) {
        console.error('Error fetching somatic flow count:', sfCountError);
      }

      // ============================================
      // FETCH ACTIVE IDENTITY SPRINT
      // Reads from identity_sprints table
      // ============================================
      const { data: identitySprintArray } = await supabase
        .from('identity_sprints')
        .select('*')
        .eq('user_id', user.id)
        .eq('completion_status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      const identitySprint = identitySprintArray?.[0] || null;

      const { data: flowBlockSprintArray } = await supabase
        .from('flow_block_sprints')
        .select('*')
        .eq('user_id', user.id)
        .eq('completion_status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      const flowBlockSprint = flowBlockSprintArray?.[0] || null;

      // ============================================
      // FETCH PATTERN PROFILE (Mirror onboarding data)
      // ============================================
      const { data: patternProfileData } = await supabase
        .from('pattern_profiles')
        .select('primary_pattern, core_challenge, mirror_summary')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const calculateSprintDay = (startDate: string | null): number | null => {
        if (!startDate) return null;
        const start = new Date(startDate);
        const now = new Date();
        const diffTime = now.getTime() - start.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return Math.max(diffDays, 1);
      };

      const identitySprintDay = calculateSprintDay(identitySprint?.start_date);
      const flowBlockSprintDay = calculateSprintDay(flowBlockSprint?.start_date);

      // Calculate domain scores - FIXED: Use actual scores if available, fallback to baseline + delta
      const baselineScores = baselineDomainScores || {
        regulation: 2.5, awareness: 2.5, outlook: 2.5, attention: 2.5
      };

      // FIXED: Prefer actual scores from weekly_deltas, fallback to baseline + delta calculation
      const domainScores = {
        regulation: latestDelta?.regulation_score != null 
          ? Number(latestDelta.regulation_score)
          : latestDelta?.regulation_delta != null
            ? baselineScores.regulation + Number(latestDelta.regulation_delta)
            : baselineScores.regulation,
        awareness: latestDelta?.awareness_score != null 
          ? Number(latestDelta.awareness_score)
          : latestDelta?.awareness_delta != null
            ? baselineScores.awareness + Number(latestDelta.awareness_delta)
            : baselineScores.awareness,
        outlook: latestDelta?.outlook_score != null 
          ? Number(latestDelta.outlook_score)
          : latestDelta?.outlook_delta != null
            ? baselineScores.outlook + Number(latestDelta.outlook_delta)
            : baselineScores.outlook,
        attention: latestDelta?.attention_score != null 
          ? Number(latestDelta.attention_score)
          : latestDelta?.attention_delta != null
            ? baselineScores.attention + Number(latestDelta.attention_delta)
            : baselineScores.attention
      };

      // Calculate deltas (for unlock progress checking)
      const domainDeltas = {
        regulation: latestDelta?.regulation_delta != null ? Number(latestDelta.regulation_delta) : domainScores.regulation - baselineScores.regulation,
        awareness: latestDelta?.awareness_delta != null ? Number(latestDelta.awareness_delta) : domainScores.awareness - baselineScores.awareness,
        outlook: latestDelta?.outlook_delta != null ? Number(latestDelta.outlook_delta) : domainScores.outlook - baselineScores.outlook,
        attention: latestDelta?.attention_delta != null ? Number(latestDelta.attention_delta) : domainScores.attention - baselineScores.attention,
        average: latestDelta?.average_delta != null 
          ? Number(latestDelta.average_delta)
          : ((domainScores.regulation - baselineScores.regulation) + 
             (domainScores.awareness - baselineScores.awareness) + 
             (domainScores.outlook - baselineScores.outlook) + 
             (domainScores.attention - baselineScores.attention)) / 4
      };

      const avgScore = (domainScores.regulation + domainScores.awareness + 
                       domainScores.outlook + domainScores.attention) / 4;
      const rewiredIndex = Math.round(avgScore * 20);
      const rewiredDelta = rewiredIndex - baselineRewiredIndex;
      const tier = getTierFromIndex(rewiredIndex);

      const unlockedTools = STAGE_TOOLS[progressData.current_stage] || [];

      const completedIds = new Set<string>((todayLogs || []).map((log: { practice_type: string }) => log.practice_type));
      const dailyPractices = buildDailyPractices(progressData.current_stage, completedIds);

      const latestQualitativeRating = latestDelta?.qualitative_rating != null ? Number(latestDelta.qualitative_rating) : null;

      const stageStartDate = progressData.stage_start_date 
        ? new Date(progressData.stage_start_date) : new Date();
      const todayDate = new Date();
      const daysInStage = Math.floor((todayDate.getTime() - stageStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // ============================================
      // STREAK FREEZE AVAILABILITY
      // ============================================
      const freezeWindowDays = progressData.current_stage === 1 ? 7 : 14;
      const daysSinceStageStart = Math.floor(
        (todayDate.getTime() - stageStartDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const currentFreezeWindow = Math.floor(daysSinceStageStart / freezeWindowDays);
      const freezeWindowStart = new Date(stageStartDate);
      freezeWindowStart.setDate(freezeWindowStart.getDate() + (currentFreezeWindow * freezeWindowDays));

      const freezeUsedInCurrentWindow = 
        progressData.streak_freeze_used === true &&
        progressData.streak_freeze_date != null &&
        new Date(progressData.streak_freeze_date) >= freezeWindowStart;

      const streakFreezeAvailable = !freezeUsedInCurrentWindow;

      // ============================================
      // MILESTONE MESSAGE AVAILABILITY (Step 8)
      // ============================================
      const milestoneMessagesSent: number[] = Array.isArray(progressData.milestone_messages_sent)
        ? progressData.milestone_messages_sent
        : [];

      const milestonePendingDay = (
        progressData.current_stage === 1 &&
        MILESTONE_DAYS.includes(daysInStage) &&
        !milestoneMessagesSent.includes(daysInStage)
      ) ? daysInStage : null;

      // ============================================
      // WEEKLY CHECK-IN STATUS (Step 13)
      // Stage 2+ only. Due if no check-in this calendar week.
      // Compares latestDelta.week_of against this Monday's date.
      // ============================================
      const thisMonday = getCurrentWeekMonday();
      const weeklyCheckInDue = progressData.current_stage >= 2 && (
        !latestDelta?.week_of || latestDelta.week_of < thisMonday
      );

      // ============================================
      // UNLOCK PROGRESS
      // ============================================
      const threshold = UNLOCK_THRESHOLDS[progressData.current_stage];
      const COMPETENCE_THRESHOLD = 4.0;
      
      // Determine if accelerated path is met
      const isAcceleratedEligible = threshold?.accelerated ? (
        progressData.adherence_percentage >= threshold.accelerated.adherence &&
        daysInStage >= threshold.accelerated.days &&
        (domainDeltas.average >= threshold.accelerated.delta || avgScore >= COMPETENCE_THRESHOLD) &&
        latestQualitativeRating !== null && latestQualitativeRating >= threshold.accelerated.qualitative
      ) : false;

      const unlockEligible = checkBasicUnlockEligibility(
        progressData.current_stage,
        progressData.adherence_percentage,
        daysInStage,
        domainDeltas.average,
        latestQualitativeRating,
        avgScore,
        recentCalmRatings,
        baselineScores.regulation
      );

      // Step 14: gate booleans must agree with unlockEligible.
      // If eligible (via any path — standard, accelerated, or Stage 1 multi-path),
      // force all gates green so the UI widget matches the AI's verdict.
      const unlockProgress = threshold ? {
        adherenceMet: unlockEligible || progressData.adherence_percentage >= threshold.adherence,
        daysMet: unlockEligible || daysInStage >= threshold.days,
        deltaMet: unlockEligible || (latestDelta !== null && (domainDeltas.average >= threshold.delta || avgScore >= COMPETENCE_THRESHOLD)),
        qualitativeMet: unlockEligible || (latestQualitativeRating !== null && latestQualitativeRating >= threshold.qualitative),
        requiredAdherence: threshold.adherence,
        requiredDays: threshold.days,
        requiredDelta: threshold.delta,
        isAccelerated: isAcceleratedEligible,
        acceleratedDays: threshold.accelerated?.days || null
      } : {
        adherenceMet: false,
        daysMet: false,
        deltaMet: false,
        qualitativeMet: false,
        requiredAdherence: 0,
        requiredDays: 0,
        requiredDelta: 0,
        isAccelerated: false,
        acceleratedDays: null
      };

      lastFetchDate.current = today;
      lastFetchTime.current = Date.now();

      // ============================================
      // BUILD PROGRESS OBJECT
      // Maps DB column 'identity_statement' to UI field 'coherenceStatement'
      // ============================================
      const newProgress: UserProgress = {
        currentStage: progressData.current_stage,
        stageStartDate: progressData.stage_start_date,
        adherencePercentage: progressData.adherence_percentage || 0,
        consecutiveDays: progressData.consecutive_days || 0,
        rewiredIndex,
        rewiredDelta,
        tier,
        domainScores,
        domainDeltas,
        unlockedTools,
        dailyPractices,
        unlockEligible,
        dataDate: today,
        createdAt: progressData.created_at || null,
        
        // ============================================
        // ALIGNED ACTION SPRINT FIELDS
        // Database columns: identity_statement, micro_action
        // UI displays as: coherenceStatement (aligned action)
        // ============================================
        coherenceStatement: identitySprint?.identity_statement || null,
        currentIdentity: identitySprint?.identity_statement || null,
        microAction: identitySprint?.micro_action || null,
        sprintDay: identitySprintDay,
        identitySprintDay: identitySprintDay,
        identitySprintNumber: identitySprint?.sprint_number || null,
        identitySprintStart: identitySprint?.start_date || null,
        
        hasFlowBlockConfig: !!flowBlockSprint,
        flowBlockSprintNumber: flowBlockSprint?.sprint_number || null,
        flowBlockSprintStart: flowBlockSprint?.start_date || null,
        flowBlockSprintDay: flowBlockSprintDay,
        
        somaticFlowCompletions: somaticFlowCount ?? 0,
        
        daysInStage,
        unlockProgress,

        streakFreezeUsed: progressData.streak_freeze_used || false,
        streakFreezeDate: progressData.streak_freeze_date || null,
        streakFreezeAvailable,

        milestonePendingDay,
        milestoneMessagesSent,

        // Step 13
        weeklyCheckInDue,
        
        stage_1_attribution_seen: progressData.stage_1_attribution_seen ?? false,
        stage_2_attribution_seen: progressData.stage_2_attribution_seen ?? false,
        stage_3_attribution_seen: progressData.stage_3_attribution_seen ?? false,
        stage_4_attribution_seen: progressData.stage_4_attribution_seen ?? false,
        stage_5_attribution_seen: progressData.stage_5_attribution_seen ?? false,
        stage_6_attribution_seen: progressData.stage_6_attribution_seen ?? false,

        // v5: Baseline scores for unlock transformation mirror
        baselineScores: {
          regulation: baselineScores.regulation,
          awareness: baselineScores.awareness,
          outlook: baselineScores.outlook,
          attention: baselineScores.attention,
          rewiredIndex: baselineRewiredIndex,
        },

        // v5: Pattern profile from Mirror onboarding
        patternProfile: patternProfileData ? {
          primaryPattern: patternProfileData.primary_pattern || null,
          coreChallenge: patternProfileData.core_challenge || null,
          mirrorSummary: patternProfileData.mirror_summary || null,
        } : null,
      };

      console.log('[useUserProgress] Setting progress:', {
        date: today,
        coherenceStatement: newProgress.coherenceStatement,
        sprintDay: newProgress.sprintDay,
        adherence: newProgress.adherencePercentage,
        unlockEligible: newProgress.unlockEligible,
        domainScores: newProgress.domainScores,
        somaticFlowCompletions: newProgress.somaticFlowCompletions,
        streakFreezeAvailable: newProgress.streakFreezeAvailable,
        milestonePendingDay: newProgress.milestonePendingDay,
        weeklyCheckInDue: newProgress.weeklyCheckInDue,
        baselineScores: newProgress.baselineScores,
        patternProfile: newProgress.patternProfile,
      });

      setProgress(newProgress);
      setLoading(false);
      setIsRefreshing(false);
      
    } catch (err) {
      console.error('Error in fetchProgress:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [supabase, progress]);

  useEffect(() => {
    fetchProgress();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const checkNewDay = () => {
      const today = getLocalDateString();
      if (lastFetchDate.current && lastFetchDate.current !== today) {
        console.log('[useUserProgress] New day detected! Refreshing...', {
          was: lastFetchDate.current,
          now: today
        });
        fetchProgress(true);
      }
    };

    checkNewDay();
    const interval = setInterval(checkNewDay, 60000);
    return () => clearInterval(interval);
  }, [fetchProgress]);

  useEffect(() => {
    const handleFocus = () => {
      const today = getLocalDateString();
      const timeSinceLastFetch = Date.now() - lastFetchTime.current;
      const isNewDay = lastFetchDate.current !== today;
      const isStale = timeSinceLastFetch > 5 * 60 * 1000;
      
      if (isNewDay || isStale) {
        console.log('[useUserProgress] Window focused, refreshing...');
        fetchProgress(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchProgress]);

  const refetchProgress = useCallback(() => {
    console.log('[useUserProgress] Manual refetch triggered');
    return fetchProgress(true);
  }, [fetchProgress]);

  return { 
    progress, 
    loading, 
    error, 
    refetchProgress,
    isRefreshing
  };
}

// ============================================
// HELPER: Build daily practices based on stage
// ============================================

function buildDailyPractices(stage: number, completedIds: Set<string>) {
  const practices: { id: string; name: string; completed: boolean }[] = [];
  
  // Stage 1+: HRVB + Awareness Rep
  practices.push(
    { id: 'hrvb', name: 'Resonance Breathing', completed: completedIds.has('hrvb') },
    { id: 'awareness_rep', name: 'Awareness Rep', completed: completedIds.has('awareness_rep') }
  );
  
  // Stage 2+: Somatic Flow
  if (stage >= 2) {
    practices.push({ id: 'somatic_flow', name: 'Somatic Flow', completed: completedIds.has('somatic_flow') });
  }
  
  // Stage 3+: Morning Micro-Action
  if (stage >= 3) {
    practices.push({ id: 'micro_action', name: 'Morning Aligned Action', completed: completedIds.has('micro_action') });
  }
  
  // Stage 4+: Flow Block
  if (stage >= 4) {
    practices.push({ id: 'flow_block', name: 'Flow Block', completed: completedIds.has('flow_block') });
  }
  
  // Stage 5+: Co-Regulation
  if (stage >= 5) {
    practices.push({ id: 'co_regulation', name: 'Co-Regulation', completed: completedIds.has('co_regulation') });
  }
  
  // Stage 6+: Nightly Debrief
  if (stage >= 6) {
    practices.push({ id: 'nightly_debrief', name: 'Nightly Debrief', completed: completedIds.has('nightly_debrief') });
  }
  
  return practices;
}

export default useUserProgress;
