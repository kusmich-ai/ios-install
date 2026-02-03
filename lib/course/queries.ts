// lib/course/queries.ts
// Supabase queries for course tutorials and progress

import { createClient } from '@/lib/supabase-client';
import type { CourseTutorial, CourseProgress, ProgressUpdatePayload } from './types';

// ============================================
// TUTORIAL QUERIES
// ============================================

/**
 * Fetch all tutorials ordered by module and sort_order
 */
export async function getAllTutorials(): Promise<CourseTutorial[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('course_tutorials')
    .select('*')
    .order('module_number', { ascending: true })
    .order('sort_order', { ascending: true });
  
  if (error) {
    console.error('Error fetching tutorials:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Fetch tutorials for a specific module
 */
export async function getTutorialsByModule(moduleNumber: number): Promise<CourseTutorial[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('course_tutorials')
    .select('*')
    .eq('module_number', moduleNumber)
    .order('sort_order', { ascending: true });
  
  if (error) {
    console.error('Error fetching module tutorials:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Fetch a single tutorial by ID
 */
export async function getTutorialById(tutorialId: string): Promise<CourseTutorial | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('course_tutorials')
    .select('*')
    .eq('id', tutorialId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('Error fetching tutorial:', error);
    throw error;
  }
  
  return data;
}

/**
 * Fetch tutorial by module and tutorial number
 */
export async function getTutorialByNumber(
  moduleNumber: number, 
  tutorialNumber: number
): Promise<CourseTutorial | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('course_tutorials')
    .select('*')
    .eq('module_number', moduleNumber)
    .eq('tutorial_number', tutorialNumber)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching tutorial:', error);
    throw error;
  }
  
  return data;
}

/**
 * Search tutorials by title or keywords (for AI suggestions)
 */
export async function searchTutorials(query: string): Promise<CourseTutorial[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('course_tutorials')
    .select('*')
    .or(`title.ilike.%${query}%,ai_trigger_keywords.cs.{${query}}`)
    .order('sort_order', { ascending: true });
  
  if (error) {
    console.error('Error searching tutorials:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Find tutorials matching AI trigger keywords
 */
export async function findTutorialByKeywords(keywords: string[]): Promise<CourseTutorial | null> {
  const supabase = createClient();
  
  // Fetch all tutorials and check keywords in-memory
  // (More flexible than SQL array contains)
  const { data, error } = await supabase
    .from('course_tutorials')
    .select('*')
    .order('sort_order', { ascending: true });
  
  if (error) {
    console.error('Error fetching tutorials for keyword match:', error);
    throw error;
  }
  
  if (!data) return null;
  
  // Score each tutorial based on keyword matches
  const scored = data.map((tutorial: CourseTutorial) => {
    const tutorialKeywords = tutorial.ai_trigger_keywords as string[];
    let score = 0;
    
    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      for (const tk of tutorialKeywords) {
        if (tk.toLowerCase().includes(lowerKeyword) || lowerKeyword.includes(tk.toLowerCase())) {
          score++;
        }
      }
    }
    
    return { tutorial, score };
  });
  
  // Return highest scoring tutorial (if any matches)
  const best = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score)[0];
  return best?.tutorial || null;
}

// ============================================
// PROGRESS QUERIES
// ============================================

/**
 * Fetch all progress records for a user
 */
export async function getUserProgress(userId: string): Promise<CourseProgress[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('course_progress')
    .select('*')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching user progress:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Fetch progress for a specific tutorial
 */
export async function getTutorialProgress(
  userId: string, 
  tutorialId: string
): Promise<CourseProgress | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('course_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('tutorial_id', tutorialId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('Error fetching tutorial progress:', error);
    throw error;
  }
  
  return data;
}

/**
 * Create or update progress for a tutorial
 */
export async function upsertProgress(
  userId: string,
  tutorialId: string,
  payload: ProgressUpdatePayload
): Promise<CourseProgress> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('course_progress')
    .upsert({
      user_id: userId,
      tutorial_id: tutorialId,
      ...payload,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,tutorial_id'
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error upserting progress:', error);
    throw error;
  }
  
  return data;
}

/**
 * Mark a tutorial as complete
 */
export async function markTutorialComplete(
  userId: string,
  tutorialId: string,
  source: 'library' | 'ai_suggestion' | 'modal' = 'library'
): Promise<CourseProgress> {
  return upsertProgress(userId, tutorialId, {
    completed_at: new Date().toISOString(),
    watch_percentage: 100,
    source
  });
}

/**
 * Update watch progress (called during video playback)
 */
export async function updateWatchProgress(
  userId: string,
  tutorialId: string,
  percentage: number,
  positionSeconds: number,
  source: 'library' | 'ai_suggestion' | 'modal' = 'library'
): Promise<CourseProgress> {
  const payload: ProgressUpdatePayload = {
    watch_percentage: percentage,
    last_position_seconds: positionSeconds,
    source
  };
  
  // Auto-complete at 90%+
  if (percentage >= 90) {
    payload.completed_at = new Date().toISOString();
  }
  
  return upsertProgress(userId, tutorialId, payload);
}

/**
 * Reset progress for a tutorial (for re-watching)
 */
export async function resetTutorialProgress(
  userId: string,
  tutorialId: string
): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('course_progress')
    .delete()
    .eq('user_id', userId)
    .eq('tutorial_id', tutorialId);
  
  if (error) {
    console.error('Error resetting progress:', error);
    throw error;
  }
}

// ============================================
// ANALYTICS QUERIES
// ============================================

/**
 * Get completion statistics for a user
 */
export async function getUserCompletionStats(userId: string): Promise<{
  totalTutorials: number;
  completedTutorials: number;
  completionPercentage: number;
  byModule: Record<number, { completed: number; total: number }>;
  bySource: Record<string, number>;
}> {
  const supabase = createClient();
  
  // Get all tutorials
  const { data: tutorials } = await supabase
    .from('course_tutorials')
    .select('id, module_number');
  
  // Get user's completed progress
  const { data: progress } = await supabase
    .from('course_progress')
    .select('tutorial_id, source')
    .eq('user_id', userId)
    .not('completed_at', 'is', null);
  
  if (!tutorials) {
    return {
      totalTutorials: 0,
      completedTutorials: 0,
      completionPercentage: 0,
      byModule: {},
      bySource: {}
    };
  }
  
  const completedIds = new Set((progress || []).map(p => p.tutorial_id));
  
  // Calculate by module
  const byModule: Record<number, { completed: number; total: number }> = {};
  for (const t of tutorials) {
    if (!byModule[t.module_number]) {
      byModule[t.module_number] = { completed: 0, total: 0 };
    }
    byModule[t.module_number].total++;
    if (completedIds.has(t.id)) {
      byModule[t.module_number].completed++;
    }
  }
  
  // Calculate by source
  const bySource: Record<string, number> = {};
  for (const p of progress || []) {
    bySource[p.source] = (bySource[p.source] || 0) + 1;
  }
  
  const completedCount = completedIds.size;
  
  return {
    totalTutorials: tutorials.length,
    completedTutorials: completedCount,
    completionPercentage: Math.round((completedCount / tutorials.length) * 100),
    byModule,
    bySource
  };
}

/**
 * Get tutorials completed via AI suggestions (for analytics)
 */
export async function getAISuggestionStats(userId: string): Promise<{
  suggestedCount: number;
  acceptedCount: number;
  tutorials: Array<{ tutorialId: string; title: string; completedAt: string }>;
}> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('course_progress')
    .select(`
      tutorial_id,
      completed_at,
      course_tutorials (title)
    `)
    .eq('user_id', userId)
    .eq('source', 'ai_suggestion')
    .not('completed_at', 'is', null);
  
  if (error) {
    console.error('Error fetching AI suggestion stats:', error);
    return { suggestedCount: 0, acceptedCount: 0, tutorials: [] };
  }
  
  return {
    suggestedCount: data?.length || 0, // Would need separate tracking for shown vs accepted
    acceptedCount: data?.length || 0,
    tutorials: (data || []).map(d => ({
      tutorialId: d.tutorial_id,
      title: (d.course_tutorials as any)?.title || 'Unknown',
      completedAt: d.completed_at!
    }))
  };
}
