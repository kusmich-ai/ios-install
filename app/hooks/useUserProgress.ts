'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface UserProgress {
  currentStage: number;
  stageStartDate: string;
  adherencePercentage: number;
  rewiredIndex: number;
  rewiredDelta: number;
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
  
  const supabase = createClientComponentClient();

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
        .eq('date', today);

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

      // Fetch latest weekly delta for REwired Index
      const { data: deltaData } = await supabase
        .from('weekly_deltas')
        .select('*')
        .eq('user_id', user.id)
        .order('week_start', { ascending: false })
        .limit(1)
        .single();

      // Calculate REwired Index
      const rewiredIndex = deltaData 
        ? Math.round(((deltaData.regulation + deltaData.awareness + deltaData.outlook + deltaData.attention) / 4) * 20)
        : 0;

      // Get baseline for delta calculation
      const { data: baselineData } = await supabase
        .from('baseline_assessments')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const baselineIndex = baselineData
        ? Math.round(((baselineData.regulation + baselineData.awareness + baselineData.outlook + baselineData.attention) / 4) * 20)
        : 0;

      const rewiredDelta = rewiredIndex - baselineIndex;

      // Determine unlocked tools based on stage
      const unlockedTools = getUnlockedTools(progressData.current_stage);

      setProgress({
        currentStage: progressData.current_stage,
        stageStartDate: progressData.stage_start_date,
        adherencePercentage: progressData.adherence_percentage || 0,
        rewiredIndex,
        rewiredDelta,
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
