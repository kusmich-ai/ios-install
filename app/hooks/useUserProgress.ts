'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client'; // ← Using your existing setup

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
  unlockedTools: string[];
  dailyPractices: {
    [key: string]: {
      completed: boolean;
      time?: string;
    };
  };
}

export function useUserProgress() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient(); // ← Using your existing client

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      
      // Get current user
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

      // Fetch today's practice logs
      const today = new Date().toISOString().split('T')[0];
      const { data: practicesData, error: practicesError } = await supabase
        .from('practice_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('practice_date', today);

      if (practicesError) {
        console.error('Error fetching practices:', practicesError);
      }

      // Transform practice logs into dailyPractices format
      const dailyPractices: UserProgress['dailyPractices'] = {};
      if (practicesData) {
        practicesData.forEach(practice => {
          dailyPractices[practice.practice_type] = {
            completed: practice.completed,
            time: practice.completed_at
          };
        });
      }

      // Fetch baseline and latest delta data from user_data table
      const { data: userData, error: userDataError } = await supabase
        .from('user_data')
        .select('key, value')
        .eq('user_id', user.id)
        .in('key', [
          'ios:baseline:rewired_index',
          'ios:baseline:tier',
          'ios:baseline:domain_scores'
        ]);

      if (userDataError) {
        console.error('Error fetching user data:', userDataError);
      }

      // Parse user_data into usable format
      const dataMap = userData?.reduce((acc, item) => {
        try {
          acc[item.key] = JSON.parse(item.value);
        } catch {
          acc[item.key] = item.value;
        }
        return acc;
      }, {} as Record<string, any>) || {};

      const rewiredIndex = dataMap['ios:baseline:rewired_index'] || 0;
      const tier = dataMap['ios:baseline:tier'] || 'Baseline Mode';
      const domainScores = dataMap['ios:baseline:domain_scores'] || {
        regulation: 0,
        awareness: 0,
        outlook: 0,
        attention: 0
      };

      // For now, delta is 0 (we'll calculate from weekly_deltas later)
      const rewiredDelta = 0;

      // Determine unlocked tools based on stage
      const unlockedTools = getUnlockedTools(progressData.current_stage);

      setProgress({
        currentStage: progressData.current_stage,
        stageStartDate: progressData.stage_start_date,
        adherencePercentage: progressData.adherence_percentage || 0,
        consecutiveDays: progressData.consecutive_days || 0,
        rewiredIndex,
        rewiredDelta,
        tier,
        domainScores,
        unlockedTools,
        dailyPractices
      });

      setLoading(false);
    } catch (err) {
      console.error('Error in fetchProgress:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  const refetchProgress = () => {
    fetchProgress();
  };

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
