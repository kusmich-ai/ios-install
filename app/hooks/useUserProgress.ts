// app/hooks/useUserProgress.ts
// Updated to read coherence_statement from identity_sprints table
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
  };
}

// ============================================
// CONSTANTS
// ============================================

const UNLOCK_THRESHOLDS: { [stage: number]: { adherence: number; days: number; delta: number; qualitative: number } } = {
  1: { adherence: 80, days: 14, delta: 0.3, qualitative: 3 },
  2: { adherence: 80, days: 14, delta: 0.5, qualitative: 3 },
  3: { adherence: 80, days: 14, delta: 0.5, qualitative: 3 },
  4: { adherence: 80, days: 14, delta: 0.6, qualitative: 3 },
  5: { adherence: 85, days: 14, delta: 0.7, qualitative: 3 },
  6: { adherence: 85, days: 14, delta: 0.7, qualitative: 3 }
};

// Stage-specific tools
const STAGE_TOOLS: { [stage: number]: string[] } = {
  1: ['decentering'],
  2: ['decentering', 'meta_reflection'],
  3: ['decentering', 'meta_reflection', 'reframe'],
  4: ['decentering', 'meta_reflection', 'reframe', 'thought_hygiene'],
  5: ['decentering', 'meta_reflection', 'reframe', 'thought_hygiene'],
  6: ['decentering', 'meta_reflection', 'reframe', 'thought_hygiene'],
  7: ['decentering', 'meta_reflection', 'reframe', 'thought_hygiene']
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function getLocalDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getTierFromIndex(index: number): string {
  if (index <= 20) return 'System Offline';
  if (index <= 40) return 'Baseline Mode';
  if (index <= 60) return 'Operational';
  if (index <= 80) return 'Optimized';
  return 'Integrated';
}

function checkBasicUnlockEligibility(
  stage: number,
  adherence: number,
  daysInStage: number,
  avgDelta: number,
  qualitativeRating: number | null,
  avgScore: number
): boolean {
  const threshold = UNLOCK_THRESHOLDS[stage];
  if (!threshold) return false;
  
  const COMPETENCE_THRESHOLD = 4.0;
  
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
    
    // Skip if we already have today's data (unless forcing refresh)
    if (!forceRefresh && progress?.dataDate === today) {
      return;
    }

    if (!forceRefresh) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Fetch user progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (progressError) {
        throw progressError;
      }

      // Fetch baseline data
      const { data: baselineData } = await supabase
        .from('user_data')
        .select('baseline_domain_scores, baseline_rewired_index')
        .eq('user_id', user.id)
        .single();

      // Fetch latest weekly delta
      const { data: latestDelta } = await supabase
        .from('weekly_deltas')
        .select('delta_regulation, delta_awareness, delta_outlook, delta_attention, qualitative_rating')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Fetch today's practice logs
      const { data: todayLogs } = await supabase
        .from('practice_logs')
        .select('practice_id')
        .eq('user_id', user.id)
        .eq('practice_date', today);

      // ============================================
      // FETCH ACTIVE IDENTITY SPRINT
      // Updated to read coherence_statement column
      // ============================================
      const { data: identitySprint } = await supabase
        .from('identity_sprints')
        .select('*')
        .eq('user_id', user.id)
        .eq('completion_status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Fetch active Flow Block sprint
      const { data: flowBlockSprint } = await supabase
        .from('flow_block_sprints')
        .select('*')
        .eq('user_id', user.id)
        .eq('completion_status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Calculate sprint days
      const calculateSprintDay = (startDate: string | null): number | null => {
        if (!startDate) return null;
        const start = new Date(startDate);
        const now = new Date();
        const diffTime = now.getTime() - start.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return Math.min(Math.max(diffDays, 1), 21);
      };

      const identitySprintDay = calculateSprintDay(identitySprint?.start_date);
      const flowBlockSprintDay = calculateSprintDay(flowBlockSprint?.start_date);

      // Calculate domain scores and deltas
      const baselineScores = baselineData?.baseline_domain_scores || {
        regulation: 2.5,
        awareness: 2.5,
        outlook: 2.5,
        attention: 2.5
      };

      const domainScores = {
        regulation: latestDelta?.delta_regulation !== undefined 
          ? baselineScores.regulation + (latestDelta.delta_regulation || 0)
          : baselineScores.regulation,
        awareness: latestDelta?.delta_awareness !== undefined
          ? baselineScores.awareness + (latestDelta.delta_awareness || 0)
          : baselineScores.awareness,
        outlook: latestDelta?.delta_outlook !== undefined
          ? baselineScores.outlook + (latestDelta.delta_outlook || 0)
          : baselineScores.outlook,
        attention: latestDelta?.delta_attention !== undefined
          ? baselineScores.attention + (latestDelta.delta_attention || 0)
          : baselineScores.attention
      };

      const domainDeltas = {
        regulation: latestDelta?.delta_regulation || 0,
        awareness: latestDelta?.delta_awareness || 0,
        outlook: latestDelta?.delta_outlook || 0,
        attention: latestDelta?.delta_attention || 0,
        average: latestDelta
          ? ((latestDelta.delta_regulation || 0) + 
             (latestDelta.delta_awareness || 0) + 
             (latestDelta.delta_outlook || 0) + 
             (latestDelta.delta_attention || 0)) / 4
          : 0
      };

      // Calculate REwired Index
      const avgScore = (domainScores.regulation + domainScores.awareness + 
                       domainScores.outlook + domainScores.attention) / 4;
      const rewiredIndex = Math.round(avgScore * 20);
      const baselineRewiredIndex = baselineData?.baseline_rewired_index || 50;
      const rewiredDelta = rewiredIndex - baselineRewiredIndex;
      const tier = getTierFromIndex(rewiredIndex);

      // Get unlocked tools for current stage
      const unlockedTools = STAGE_TOOLS[progressData.current_stage] || [];

      // Build daily practices list based on stage
      const completedIds = new Set((todayLogs || []).map(log => log.practice_id));
      const dailyPractices = buildDailyPractices(progressData.current_stage, completedIds);

      // Get latest qualitative rating
      const latestQualitativeRating = latestDelta?.qualitative_rating || null;

      // Calculate days in stage
      const stageStartDate = progressData.stage_start_date 
        ? new Date(progressData.stage_start_date) : new Date();
      const todayDate = new Date();
      const daysInStage = Math.floor((todayDate.getTime() - stageStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Calculate unlock progress
      const threshold = UNLOCK_THRESHOLDS[progressData.current_stage];
      const COMPETENCE_THRESHOLD = 4.0;
      
      const unlockProgress = threshold ? {
        adherenceMet: progressData.adherence_percentage >= threshold.adherence,
        daysMet: daysInStage >= threshold.days,
        deltaMet: latestDelta !== null && (domainDeltas.average >= threshold.delta || avgScore >= COMPETENCE_THRESHOLD),
        qualitativeMet: latestQualitativeRating !== null && latestQualitativeRating >= threshold.qualitative,
        requiredAdherence: threshold.adherence,
        requiredDays: threshold.days,
        requiredDelta: threshold.delta
      } : {
        adherenceMet: false,
        daysMet: false,
        deltaMet: false,
        qualitativeMet: false,
        requiredAdherence: 0,
        requiredDays: 0,
        requiredDelta: 0
      };

      // Check unlock eligibility
      const unlockEligible = checkBasicUnlockEligibility(
        progressData.current_stage,
        progressData.adherence_percentage,
        daysInStage,
        domainDeltas.average,
        latestQualitativeRating,
        avgScore
      );

      // Update last fetch date
      lastFetchDate.current = today;
      lastFetchTime.current = Date.now();

      // ============================================
      // BUILD PROGRESS OBJECT
      // Key change: Read coherence_statement, provide both new and old field names
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
        
        // ============================================
        // ALIGNED ACTION SPRINT FIELDS - UPDATED
        // Primary: coherence_statement column
        // Fallback: identity_statement for backwards compat
        // ============================================
        coherenceStatement: identitySprint?.coherence_statement || identitySprint?.identity_statement || null,
        currentIdentity: identitySprint?.coherence_statement || identitySprint?.identity_statement || null, // Backwards compat
        microAction: identitySprint?.action || identitySprint?.micro_action || null,
        sprintDay: identitySprintDay,
        identitySprintDay: identitySprintDay, // Backwards compat
        identitySprintNumber: identitySprint?.sprint_number || null,
        identitySprintStart: identitySprint?.start_date || null,
        
        // Flow Block fields
        hasFlowBlockConfig: !flowBlockSprint,
        flowBlockSprintNumber: flowBlockSprint?.sprint_number || null,
        flowBlockSprintStart: flowBlockSprint?.start_date || null,
        flowBlockSprintDay: flowBlockSprintDay,
        
        // Progress tracking fields
        daysInStage,
        unlockProgress
      };

      console.log('[useUserProgress] Setting progress:', {
        date: today,
        coherenceStatement: newProgress.coherenceStatement,
        currentIdentity: newProgress.currentIdentity,
        microAction: newProgress.microAction,
        sprintDay: newProgress.sprintDay,
        adherence: newProgress.adherencePercentage,
        unlockEligible: newProgress.unlockEligible
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

  // Initial fetch on mount
  useEffect(() => {
    fetchProgress();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Check for new day every minute and auto-refresh
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

  // Refresh when window regains focus
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
