// lib/toolSessionsDatabase.ts
// Database functions for on-demand tool session storage

import { createClient } from '@/lib/supabase-client';

// ============================================
// TYPES
// ============================================

export type ToolType = 'decentering' | 'meta_reflection' | 'reframe' | 'thought_hygiene';

export interface ToolSession {
  id: string;
  user_id: string;
  tool_type: ToolType;
  created_at: string;
  session_mode: string | null;
  duration_seconds: number | null;
  session_data: Record<string, any> | null;
  recurring_themes: string[] | null;
  clarity_rating: number | null;
}

export interface DecenteringSessionData {
  identity_explored: string | null;
  identity_type: 'role' | 'self_concept' | 'sticky_label' | null;
  integration_anchor: string | null;
  themes: string[];
}

// ============================================
// SAVE SESSION
// ============================================

/**
 * Save a tool session to the database
 */
export async function saveToolSession(
  userId: string,
  toolType: ToolType,
  sessionData: {
    sessionMode?: string;
    durationSeconds?: number;
    data?: Record<string, any>;
    themes?: string[];
    clarityRating?: number;
  }
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('tool_sessions')
      .insert({
        user_id: userId,
        tool_type: toolType,
        session_mode: sessionData.sessionMode || 'standard',
        duration_seconds: sessionData.durationSeconds || null,
        session_data: sessionData.data || null,
        recurring_themes: sessionData.themes || null,
        clarity_rating: sessionData.clarityRating || null
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('[ToolSessions] Save error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('[ToolSessions] Session saved:', data.id);
    return { success: true, sessionId: data.id };
    
  } catch (err) {
    console.error('[ToolSessions] Unexpected error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// ============================================
// GET PAST SESSIONS
// ============================================

/**
 * Get recent sessions for a specific tool type
 */
export async function getRecentToolSessions(
  userId: string,
  toolType: ToolType,
  limit: number = 10
): Promise<ToolSession[]> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('tool_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('tool_type', toolType)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('[ToolSessions] Fetch error:', error);
      return [];
    }
    
    return data || [];
    
  } catch (err) {
    console.error('[ToolSessions] Unexpected error:', err);
    return [];
  }
}

/**
 * Get all sessions for pattern analysis across tool types
 */
export async function getAllRecentSessions(
  userId: string,
  limit: number = 20
): Promise<ToolSession[]> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('tool_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('[ToolSessions] Fetch error:', error);
      return [];
    }
    
    return data || [];
    
  } catch (err) {
    console.error('[ToolSessions] Unexpected error:', err);
    return [];
  }
}

// ============================================
// PATTERN ANALYSIS
// ============================================

/**
 * Get recurring themes from past sessions
 */
export async function getRecurringThemes(
  userId: string,
  toolType: ToolType
): Promise<{ theme: string; count: number }[]> {
  const sessions = await getRecentToolSessions(userId, toolType, 20);
  
  const themeCounts: Record<string, number> = {};
  
  for (const session of sessions) {
    const themes = session.recurring_themes || [];
    for (const theme of themes) {
      themeCounts[theme] = (themeCounts[theme] || 0) + 1;
    }
  }
  
  // Sort by count and return
  return Object.entries(themeCounts)
    .map(([theme, count]) => ({ theme, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Check if this is the user's first time using a tool
 */
export async function isFirstTimeUsingTool(
  userId: string,
  toolType: ToolType
): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { count, error } = await supabase
      .from('tool_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('tool_type', toolType);
    
    if (error) {
      console.error('[ToolSessions] Count error:', error);
      return true; // Assume first time if error
    }
    
    return (count || 0) === 0;
    
  } catch (err) {
    console.error('[ToolSessions] Unexpected error:', err);
    return true;
  }
}

/**
 * Get session count for a tool
 */
export async function getToolSessionCount(
  userId: string,
  toolType: ToolType
): Promise<number> {
  try {
    const supabase = createClient();
    
    const { count, error } = await supabase
      .from('tool_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('tool_type', toolType);
    
    if (error) {
      console.error('[ToolSessions] Count error:', error);
      return 0;
    }
    
    return count || 0;
    
  } catch (err) {
    console.error('[ToolSessions] Unexpected error:', err);
    return 0;
  }
}

// ============================================
// DECENTERING-SPECIFIC HELPERS
// ============================================

/**
 * Get recurring identities from decentering sessions
 */
export async function getRecurringIdentities(
  userId: string
): Promise<{ identity: string; type: string; count: number }[]> {
  const sessions = await getRecentToolSessions(userId, 'decentering', 20);
  
  const identityCounts: Record<string, { type: string; count: number }> = {};
  
  for (const session of sessions) {
    const data = session.session_data as DecenteringSessionData | null;
    if (data?.identity_explored) {
      const key = data.identity_explored;
      if (identityCounts[key]) {
        identityCounts[key].count++;
      } else {
        identityCounts[key] = { 
          type: data.identity_type || 'unknown', 
          count: 1 
        };
      }
    }
  }
  
  return Object.entries(identityCounts)
    .map(([identity, { type, count }]) => ({ identity, type, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Check for pattern to surface (returns message if pattern found)
 */
export async function checkForPatternToSurface(
  userId: string,
  currentThemes: string[]
): Promise<string | null> {
  const recurringThemes = await getRecurringThemes(userId, 'decentering');
  const recurringIdentities = await getRecurringIdentities(userId);
  
  // Check if any current theme has appeared 3+ times before
  for (const theme of currentThemes) {
    const found = recurringThemes.find(t => t.theme === theme && t.count >= 3);
    if (found) {
      return `I notice the theme of "${theme}" has come up ${found.count} times in our sessions. This pattern might be worth exploring more deeply.`;
    }
  }
  
  // Check for recurring identity (3+ times)
  const frequentIdentity = recurringIdentities.find(i => i.count >= 3);
  if (frequentIdentity) {
    return `The "${frequentIdentity.identity}" identity has appeared ${frequentIdentity.count} times. There might be something deeper to explore here.`;
  }
  
  return null;
}
