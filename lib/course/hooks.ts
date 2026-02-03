// lib/course/hooks.ts
// React hooks for course data fetching and state management

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@/lib/hooks/useUser';
import {
  getAllTutorials,
  getUserProgress,
  markTutorialComplete,
  updateWatchProgress,
  getUserCompletionStats,
  findTutorialByKeywords
} from './queries';
import type { 
  CourseTutorial, 
  CourseProgress, 
  TutorialWithProgress,
  CourseModule 
} from './types';
import { MODULE_INFO } from './types';

// ============================================
// MAIN COURSE HOOK
// ============================================

interface UseCourseReturn {
  tutorials: TutorialWithProgress[];
  modules: CourseModule[];
  progress: Record<string, CourseProgress>;
  loading: boolean;
  error: Error | null;
  stats: {
    totalTutorials: number;
    completedTutorials: number;
    completionPercentage: number;
    accessibleTutorials: number;
  };
  // Actions
  markComplete: (tutorialId: string, source?: 'library' | 'ai_suggestion' | 'modal') => Promise<void>;
  updateProgress: (tutorialId: string, percentage: number, positionSeconds: number) => Promise<void>;
  refetch: () => Promise<void>;
  // Helpers
  canAccess: (tutorial: CourseTutorial) => boolean;
  isCompleted: (tutorialId: string) => boolean;
  getNextTutorial: () => TutorialWithProgress | null;
  getTutorialById: (id: string) => TutorialWithProgress | undefined;
}

export function useCourse(): UseCourseReturn {
  const { user, userProgress } = useUser();
  const currentStage = userProgress?.current_stage || 1;
  
  const [tutorials, setTutorials] = useState<CourseTutorial[]>([]);
  const [progress, setProgress] = useState<Record<string, CourseProgress>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [tutorialsData, progressData] = await Promise.all([
        getAllTutorials(),
        getUserProgress(user.id)
      ]);
      
      setTutorials(tutorialsData);
      
      // Convert progress array to lookup object
      const progressMap: Record<string, CourseProgress> = {};
      for (const p of progressData) {
        progressMap[p.tutorial_id] = p;
      }
      setProgress(progressMap);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch course data'));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper functions
  const canAccess = useCallback((tutorial: CourseTutorial): boolean => {
    return currentStage >= tutorial.unlock_stage;
  }, [currentStage]);

  const isCompleted = useCallback((tutorialId: string): boolean => {
    return progress[tutorialId]?.completed_at != null;
  }, [progress]);

  // Enrich tutorials with progress and accessibility
  const tutorialsWithProgress = useMemo((): TutorialWithProgress[] => {
    return tutorials.map(tutorial => ({
      ...tutorial,
      progress: progress[tutorial.id] || null,
      isCompleted: isCompleted(tutorial.id),
      isAccessible: canAccess(tutorial)
    }));
  }, [tutorials, progress, isCompleted, canAccess]);

  // Group tutorials into modules
  const modules = useMemo((): CourseModule[] => {
    const moduleMap: Record<number, TutorialWithProgress[]> = {};
    
    for (const tutorial of tutorialsWithProgress) {
      if (!moduleMap[tutorial.module_number]) {
        moduleMap[tutorial.module_number] = [];
      }
      moduleMap[tutorial.module_number].push(tutorial);
    }
    
    return Object.entries(moduleMap).map(([num, tuts]) => {
      const moduleNum = parseInt(num);
      const info = MODULE_INFO[moduleNum] || { title: `Module ${moduleNum}`, description: '' };
      const completedCount = tuts.filter(t => t.isCompleted).length;
      const minStage = Math.min(...tuts.map(t => t.unlock_stage));
      
      return {
        number: moduleNum,
        title: info.title,
        description: info.description,
        tutorials: tuts.sort((a, b) => a.sort_order - b.sort_order),
        isLocked: currentStage < minStage,
        completedCount,
        totalCount: tuts.length
      };
    }).sort((a, b) => a.number - b.number);
  }, [tutorialsWithProgress, currentStage]);

  // Calculate stats
  const stats = useMemo(() => {
    const accessible = tutorialsWithProgress.filter(t => t.isAccessible);
    const completed = tutorialsWithProgress.filter(t => t.isCompleted);
    
    return {
      totalTutorials: tutorials.length,
      completedTutorials: completed.length,
      completionPercentage: accessible.length > 0 
        ? Math.round((completed.filter(t => t.isAccessible).length / accessible.length) * 100)
        : 0,
      accessibleTutorials: accessible.length
    };
  }, [tutorialsWithProgress, tutorials.length]);

  // Get next uncompleted tutorial
  const getNextTutorial = useCallback((): TutorialWithProgress | null => {
    return tutorialsWithProgress.find(t => t.isAccessible && !t.isCompleted) || null;
  }, [tutorialsWithProgress]);

  // Get tutorial by ID
  const getTutorialById = useCallback((id: string): TutorialWithProgress | undefined => {
    return tutorialsWithProgress.find(t => t.id === id);
  }, [tutorialsWithProgress]);

  // Action: Mark complete
  const markComplete = useCallback(async (
    tutorialId: string, 
    source: 'library' | 'ai_suggestion' | 'modal' = 'library'
  ) => {
    if (!user?.id) return;
    
    try {
      const updatedProgress = await markTutorialComplete(user.id, tutorialId, source);
      setProgress(prev => ({
        ...prev,
        [tutorialId]: updatedProgress
      }));
    } catch (err) {
      console.error('Error marking tutorial complete:', err);
      throw err;
    }
  }, [user?.id]);

  // Action: Update progress
  const updateProgressAction = useCallback(async (
    tutorialId: string,
    percentage: number,
    positionSeconds: number
  ) => {
    if (!user?.id) return;
    
    try {
      const updatedProgress = await updateWatchProgress(
        user.id, 
        tutorialId, 
        percentage, 
        positionSeconds,
        'library'
      );
      setProgress(prev => ({
        ...prev,
        [tutorialId]: updatedProgress
      }));
    } catch (err) {
      console.error('Error updating progress:', err);
      // Don't throw - this is called frequently during playback
    }
  }, [user?.id]);

  return {
    tutorials: tutorialsWithProgress,
    modules,
    progress,
    loading,
    error,
    stats,
    markComplete,
    updateProgress: updateProgressAction,
    refetch: fetchData,
    canAccess,
    isCompleted,
    getNextTutorial,
    getTutorialById
  };
}

// ============================================
// SINGLE TUTORIAL HOOK
// ============================================

interface UseTutorialReturn {
  tutorial: TutorialWithProgress | null;
  loading: boolean;
  error: Error | null;
  markComplete: (source?: 'library' | 'ai_suggestion' | 'modal') => Promise<void>;
  updateProgress: (percentage: number, positionSeconds: number) => Promise<void>;
}

export function useTutorial(tutorialId: string | null): UseTutorialReturn {
  const { getTutorialById, markComplete, updateProgress, loading, error } = useCourse();
  
  const tutorial = tutorialId ? getTutorialById(tutorialId) || null : null;
  
  const handleMarkComplete = useCallback(async (
    source: 'library' | 'ai_suggestion' | 'modal' = 'library'
  ) => {
    if (!tutorialId) return;
    await markComplete(tutorialId, source);
  }, [tutorialId, markComplete]);
  
  const handleUpdateProgress = useCallback(async (
    percentage: number, 
    positionSeconds: number
  ) => {
    if (!tutorialId) return;
    await updateProgress(tutorialId, percentage, positionSeconds);
  }, [tutorialId, updateProgress]);
  
  return {
    tutorial,
    loading,
    error,
    markComplete: handleMarkComplete,
    updateProgress: handleUpdateProgress
  };
}

// ============================================
// AI SUGGESTION HOOK
// ============================================

interface UseAISuggestionReturn {
  suggestTutorial: (userMessage: string) => Promise<CourseTutorial | null>;
  canSuggest: (tutorial: CourseTutorial) => boolean;
}

export function useAISuggestion(): UseAISuggestionReturn {
  const { userProgress } = useUser();
  const currentStage = userProgress?.current_stage || 1;
  
  const canSuggest = useCallback((tutorial: CourseTutorial): boolean => {
    return currentStage >= tutorial.unlock_stage;
  }, [currentStage]);
  
  const suggestTutorial = useCallback(async (userMessage: string): Promise<CourseTutorial | null> => {
    // Extract potential keywords from message
    const words = userMessage.toLowerCase().split(/\s+/);
    
    // Find matching tutorial
    const tutorial = await findTutorialByKeywords(words);
    
    // Only suggest if user has access
    if (tutorial && !canSuggest(tutorial)) {
      return null;
    }
    
    return tutorial;
  }, [canSuggest]);
  
  return {
    suggestTutorial,
    canSuggest
  };
}

// ============================================
// COMPLETION STATS HOOK
// ============================================

interface UseCompletionStatsReturn {
  stats: {
    totalTutorials: number;
    completedTutorials: number;
    completionPercentage: number;
    byModule: Record<number, { completed: number; total: number }>;
    bySource: Record<string, number>;
  } | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useCompletionStats(): UseCompletionStatsReturn {
  const { user } = useUser();
  const [stats, setStats] = useState<UseCompletionStatsReturn['stats']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchStats = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const data = await getUserCompletionStats(user.id);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch stats'));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);
  
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  
  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}
