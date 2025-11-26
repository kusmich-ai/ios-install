// app/hooks/useUserProgress.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
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
}

interface PracticeLog {
  practice_type: string;
  completed: boolean;
  completed_at?: string;
  practice_date?: string;
}

interface UserDataItem {
  key: string;
  value: string;
}

export function useUserProgress() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('No user logged in');
        setLoading(false);
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
        return;
      }

      // Fetch today's practice logs - use LOCAL date, not UTC
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
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
        (practicesData as PracticeLog[]).forEach((practice: PracticeLog) => {
          dailyPractices[practice.practice_type] = {
            completed: practice.completed,
            time: practice.completed_at
          };
        });
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

      // Fetch latest weekly delta
      const { data: latestDelta, error: deltaError } = await supabase
        .from('weekly_deltas')
        .select('*')
        .eq('user_id', user.id)
        .order('week_start_date', { ascending: false })
        .limit(1)
        .single();

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

      // Calculate deltas from progress data or compute
      const domainDeltas = {
        regulation: progressData.regulation_delta || 0,
        awareness: progressData.awareness_delta || 0,
        outlook: progressData.outlook_delta || 0,
        attention: progressData.attention_delta || 0,
        average: 0
      };
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

      // Check unlock eligibility (simplified check)
      const unlockEligible = checkBasicUnlockEligibility(
        progressData.current_stage,
        progressData.adherence_percentage,
        progressData.consecutive_days,
        domainDeltas.average
      );

      setProgress({
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
        unlockEligible
      });

      setLoading(false);
    } catch (err) {
      console.error('Error in fetchProgress:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const refetchProgress = useCallback(() => {
    fetchProgress();
  }, [fetchProgress]);

  return { progress, loading, error, refetchProgress };
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
function checkBasicUnlockEligibility(
  stage: number,
  adherence: number,
  consecutiveDays: number,
  avgDelta: number
): boolean {
  if (stage >= 7) return false;

  const thresholds: { [key: number]: { adherence: number; days: number; delta: number } } = {
    1: { adherence: 80, days: 14, delta: 0.3 },
    2: { adherence: 80, days: 14, delta: 0.5 },
    3: { adherence: 80, days: 14, delta: 0.5 },
    4: { adherence: 80, days: 14, delta: 0.6 },
    5: { adherence: 85, days: 14, delta: 0.7 },
    6: { adherence: 85, days: 21, delta: 0.8 }
  };

  const threshold = thresholds[stage];
  if (!threshold) return false;

  return (
    adherence >= threshold.adherence &&
    consecutiveDays >= threshold.days &&
    avgDelta >= threshold.delta
  );
}
