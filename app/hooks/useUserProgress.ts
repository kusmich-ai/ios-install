// app/hooks/useUserProgress.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase-client';

export interface UserProgress {
  currentStage: number;
  stageStartDate: string;
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
    [key: string]: {
      completed: boolean;
      time?: string;
    };
  };
  unlockEligible: boolean;
  // Track the date this data is for
  dataDate: string;
  // Identity fields for Micro-Action
  currentIdentity: string | null;
  microAction: string | null;
  identitySprintStart: string | null;
  // NEW: Flow Block field
  hasFlowBlockConfig: boolean;
}

interface PracticeLog {
  practice_type: string;
  completed: boolean;
  completed_at?: string;
  practice_date?: string;
}

// Helper to get local date string in YYYY-MM-DD format
function getLocalDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function useUserProgress() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Track the last fetch time and date for cache-busting
  const lastFetchTime = useRef<number>(0);
  const lastFetchDate = useRef<string>('');
  
  const supabase = createClient();

  const fetchProgress = useCallback(async (forceRefresh: boolean = false) => {
    try {
      // Prevent rapid re-fetches (debounce) unless forced
      const now = Date.now();
      if (!forceRefresh && now - lastFetchTime.current < 1000) {
        console.log('[useUserProgress] Debounced - too soon since last fetch');
        return;
      }
      lastFetchTime.current = now;
      
      // If not initial load, show refreshing state instead of full loading
      if (progress) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('No user logged in');
        setLoading(false);
        setIsRefreshing(false);
        return;
      }

      // Fetch from user_progress table
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (progressError) {
        console.error('Error fetching progress:', progressError);
        setError(progressError.message);
        setLoading(false);
        setIsRefreshing(false);
        return;
      }

      // Fetch today's practice logs - use LOCAL date, not UTC
      const today = getLocalDateString();
      
      console.log('[useUserProgress] Fetching practices for date:', today);
      
      const { data: practicesData, error: practicesError } = await supabase
        .from('practice_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('practice_date', today);

      if (practicesError) {
        console.error('Error fetching practices:', practicesError);
      }

      // Transform practice logs into dailyPractices format
      const dailyPractices: UserProgress['dailyPractices'] = {};
      if (practicesData) {
        console.log('[useUserProgress] Found practices:', practicesData.length, practicesData);
        (practicesData as PracticeLog[]).forEach((practice: PracticeLog) => {
          console.log('[useUserProgress] Mapping practice:', practice.practice_type, practice.completed);
          dailyPractices[practice.practice_type] = {
            completed: practice.completed,
            time: practice.completed_at
          };
        });
        console.log('[useUserProgress] Final dailyPractices:', dailyPractices);
      }

      // Fetch baseline data
      const { data: baselineData, error: baselineError } = await supabase
        .from('baseline_assessments')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (baselineError && baselineError.code !== 'PGRST116') {
        console.error('Error fetching baseline:', baselineError);
      }

      // NEW: Fetch Flow Block config to check if setup is complete
      const { data: flowBlockConfig } = await supabase
        .from('flow_block_config')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      // Fetch latest 2 weekly deltas to calculate week-over-week change
      const { data: weeklyDeltas } = await supabase
        .from('weekly_deltas')
        .select('*')
        .eq('user_id', user.id)
        .order('week_of', { ascending: false })
        .limit(2);

      const latestDelta = weeklyDeltas?.[0] || null;
      const previousDelta = weeklyDeltas?.[1] || null;

      // Calculate domain scores (use latest delta if available, otherwise baseline)
      let domainScores = {
        regulation: 0,
        awareness: 0,
        outlook: 0,
        attention: 0
      };

      if (latestDelta) {
        domainScores = {
          regulation: latestDelta.regulation_score || 0,
          awareness: latestDelta.awareness_score || 0,
          outlook: latestDelta.outlook_score || 0,
          attention: latestDelta.attention_score || 0
        };
      } else if (baselineData) {
        domainScores = {
          regulation: baselineData.calm_core_score || 0,
          awareness: baselineData.observer_index_score || 0,
          outlook: baselineData.vitality_index_score || 0,
          attention: ((baselineData.focus_diagnostic_score || 0) + (baselineData.presence_test_score || 0)) / 2
        };
      }

      // Calculate REwired Index (average of 4 domains × 20 to get 0-100)
      const avgScore = (domainScores.regulation + domainScores.awareness + 
                        domainScores.outlook + domainScores.attention) / 4;
      const rewiredIndex = Math.round(avgScore * 20);

      // Determine tier
      let tier = 'Baseline Mode';
      if (rewiredIndex >= 81) tier = 'Integrated';
      else if (rewiredIndex >= 61) tier = 'Optimized';
      else if (rewiredIndex >= 41) tier = 'Operational';
      else if (rewiredIndex >= 21) tier = 'Baseline Mode';
      else tier = 'System Offline';

      // Calculate week-over-week deltas
      // Priority: weekly_deltas comparison > user_progress deltas > zero
      let domainDeltas = {
        regulation: 0,
        awareness: 0,
        outlook: 0,
        attention: 0,
        average: 0
      };

      if (latestDelta && previousDelta) {
        // Week-over-week comparison from weekly_deltas table
        domainDeltas = {
          regulation: (latestDelta.regulation_score || 0) - (previousDelta.regulation_score || 0),
          awareness: (latestDelta.awareness_score || 0) - (previousDelta.awareness_score || 0),
          outlook: (latestDelta.outlook_score || 0) - (previousDelta.outlook_score || 0),
          attention: (latestDelta.attention_score || 0) - (previousDelta.attention_score || 0),
          average: 0
        };
      } else if (latestDelta && baselineData) {
        // Compare latest week to baseline (for users with only 1 week of data)
        domainDeltas = {
          regulation: (latestDelta.regulation_score || 0) - (baselineData.calm_core_score || 0),
          awareness: (latestDelta.awareness_score || 0) - (baselineData.observer_index_score || 0),
          outlook: (latestDelta.outlook_score || 0) - (baselineData.vitality_index_score || 0),
          attention: (latestDelta.attention_score || 0) - (((baselineData.focus_diagnostic_score || 0) + (baselineData.presence_test_score || 0)) / 2),
          average: 0
        };
      } else {
        // Fallback to user_progress deltas (cumulative from baseline)
        domainDeltas = {
          regulation: progressData.regulation_delta || 0,
          awareness: progressData.awareness_delta || 0,
          outlook: progressData.outlook_delta || 0,
          attention: progressData.attention_delta || 0,
          average: 0
        };
      }
      domainDeltas.average = (domainDeltas.regulation + domainDeltas.awareness + 
                              domainDeltas.outlook + domainDeltas.attention) / 4;

      // Calculate REwired delta from baseline
      let rewiredDelta = 0;
      if (baselineData) {
        const baselineAvg = (
          (baselineData.calm_core_score || 0) +
          (baselineData.observer_index_score || 0) +
          (baselineData.vitality_index_score || 0) +
          (((baselineData.focus_diagnostic_score || 0) + (baselineData.presence_test_score || 0)) / 2)
        ) / 4;
        const baselineRewired = Math.round(baselineAvg * 20);
        rewiredDelta = rewiredIndex - baselineRewired;
      }

      // Determine unlocked tools based on stage
      const unlockedTools = getUnlockedTools(progressData.current_stage);

      // Get latest qualitative rating from weekly check-in
      const latestQualitativeRating = latestDelta?.qualitative_rating || null;

      // Check unlock eligibility (includes qualitative threshold + competence check)
      const unlockEligible = checkBasicUnlockEligibility(
        progressData.current_stage,
        progressData.adherence_percentage,
        progressData.consecutive_days,
        domainDeltas.average,
        latestQualitativeRating,
        avgScore // Current average score for competence check
      );

      // Update last fetch date
      lastFetchDate.current = today;

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
        // Identity fields for Micro-Action
        currentIdentity: progressData.current_identity || null,
        microAction: progressData.micro_action || null,
        identitySprintStart: progressData.identity_sprint_start || null,
        // NEW: Flow Block field
        hasFlowBlockConfig: !!flowBlockConfig
      };

      console.log('[useUserProgress] Setting progress:', {
        date: today,
        dailyPractices,
        adherence: newProgress.adherencePercentage,
        consecutiveDays: newProgress.consecutiveDays,
        domainScores: newProgress.domainScores,
        domainDeltas: newProgress.domainDeltas,
        rewiredIndex: newProgress.rewiredIndex,
        rewiredDelta: newProgress.rewiredDelta,
        hasWeeklyData: !!latestDelta,
        hasPreviousWeek: !!previousDelta,
        hasFlowBlockConfig: newProgress.hasFlowBlockConfig
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
      
      // If the date has changed since we last fetched, refresh
      if (lastFetchDate.current && lastFetchDate.current !== today) {
        console.log('[useUserProgress] New day detected! Refreshing...', {
          was: lastFetchDate.current,
          now: today
        });
        fetchProgress(true); // Force refresh
      }
    };

    // Check immediately
    checkNewDay();
    
    // Then check every minute
    const interval = setInterval(checkNewDay, 60000);
    
    return () => clearInterval(interval);
  }, [fetchProgress]);

  // Also refresh when window regains focus (user comes back to tab)
  useEffect(() => {
    const handleFocus = () => {
      const today = getLocalDateString();
      
      // If it's a new day or it's been more than 5 minutes, refresh
      const timeSinceLastFetch = Date.now() - lastFetchTime.current;
      const isNewDay = lastFetchDate.current !== today;
      const isStale = timeSinceLastFetch > 5 * 60 * 1000; // 5 minutes
      
      if (isNewDay || isStale) {
        console.log('[useUserProgress] Window focused, refreshing...', {
          isNewDay,
          isStale,
          minutesSinceLastFetch: Math.round(timeSinceLastFetch / 60000)
        });
        fetchProgress(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchProgress]);

  // Public refetch function - always forces refresh
  const refetchProgress = useCallback(() => {
    console.log('[useUserProgress] Manual refetch triggered');
    return fetchProgress(true);
  }, [fetchProgress]);

  return { 
    progress, 
    loading, 
    error, 
    refetchProgress,
    isRefreshing // Expose refreshing state for UI feedback
  };
}

// Helper function to determine unlocked tools based on stage
function getUnlockedTools(stage: number): string[] {
  const tools: string[] = ['decentering']; // Unlocked from Stage 1
  
  if (stage >= 2) {
    tools.push('meta_reflection');
  }
  
  if (stage >= 3) {
    tools.push('reframe');
  }
  
  if (stage >= 4) {
    tools.push('thought_hygiene');
  }
  
  return tools;
}

// Simplified unlock eligibility check
// Uses hybrid approach: unlock via improvement (delta) OR existing competence (high score)
function checkBasicUnlockEligibility(
  stage: number,
  adherence: number,
  consecutiveDays: number,
  avgDelta: number,
  qualitativeRating: number | null,
  currentAvgScore: number
): boolean {
  // Stage 7 is manual unlock only - never auto-eligible
  if (stage >= 6) return false;

  const thresholds: { [key: number]: { adherence: number; days: number; delta: number; qualitative: number } } = {
    1: { adherence: 80, days: 14, delta: 0.3, qualitative: 3 },
    2: { adherence: 80, days: 14, delta: 0.5, qualitative: 3 },
    3: { adherence: 80, days: 14, delta: 0.5, qualitative: 3 },
    4: { adherence: 80, days: 14, delta: 0.6, qualitative: 3 },
    5: { adherence: 85, days: 14, delta: 0.7, qualitative: 3 }
    // Stage 6→7 is manual review only - not in this table
  };

  const threshold = thresholds[stage];
  if (!threshold) return false;

  // Qualitative rating is required for unlock - must have completed at least one weekly check-in
  const meetsQualitative = qualitativeRating !== null && qualitativeRating >= threshold.qualitative;
  
  // HYBRID TRANSFORMATION CHECK:
  // Either show improvement (delta) OR demonstrate existing competence (high score)
  // This prevents high performers from being penalized for starting strong,
  // while still rewarding improvement for those starting lower
  const COMPETENCE_THRESHOLD = 4.0; // Score of 4.0+ out of 5.0 = already competent
  const meetsTransformation = avgDelta >= threshold.delta;
  const alreadyCompetent = currentAvgScore >= COMPETENCE_THRESHOLD;

  return (
    adherence >= threshold.adherence &&
    consecutiveDays >= threshold.days &&
    (meetsTransformation || alreadyCompetent) &&
    meetsQualitative
  );
}
