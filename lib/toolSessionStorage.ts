// lib/toolSessionStorage.ts
// Utility for saving tool session outcomes as "capacity signals"
// This prevents analytics/dashboard from reinforcing "it worked/failed" framing

import { createClient } from '@/lib/supabase-client';

// ============================================
// TYPES
// ============================================

export type ToolType = 
  | 'reframe'
  | 'thought_hygiene'
  | 'decentering'
  | 'loop_de_looping'
  | 'meta_reflection'
  | 'co_regulation';

export interface CapacitySignals {
  clarity_rating?: number | null;           // 1-5 scale (optional for some tools)
  was_signal_named: boolean;                // Did user identify the raw signal/sensation?
  was_interpretation_identified: boolean;   // Did user recognize their story/interpretation?
  action_selected: boolean;                 // Did user choose a next step?
  session_duration_seconds?: number;        // How long the session took
}

export interface ToolSessionRecord {
  id?: string;
  user_id: string;
  tool_type: ToolType;
  started_at: string;
  completed_at?: string;
  session_data: CapacitySignals;
}

// ============================================
// SAVE TOOL SESSION
// ============================================

/**
 * Save a completed tool session with capacity signals
 * Call this when the user ends/completes a tool session
 */
export async function saveToolSession(
  userId: string,
  toolType: ToolType,
  signals: CapacitySignals,
  startedAt: Date
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  const sessionRecord = {
    user_id: userId,
    tool_type: toolType,
    started_at: startedAt.toISOString(),
    completed_at: new Date().toISOString(),
    session_data: {
      clarity_rating: signals.clarity_rating ?? null,
      was_signal_named: signals.was_signal_named,
      was_interpretation_identified: signals.was_interpretation_identified,
      action_selected: signals.action_selected,
      session_duration_seconds: signals.session_duration_seconds ?? 
        Math.floor((Date.now() - startedAt.getTime()) / 1000)
    }
  };

  const { error } = await supabase
    .from('tool_sessions')
    .insert(sessionRecord);

  if (error) {
    console.error('[saveToolSession] Error:', error);
    return { success: false, error: error.message };
  }

  console.log('[saveToolSession] Saved:', {
    tool: toolType,
    signals: sessionRecord.session_data
  });

  return { success: true };
}

// ============================================
// GET SESSIONS TODAY (for 3+ usage detection)
// ============================================

/**
 * Get count of tool sessions for a specific tool today
 * Used to detect if user has used tool 3+ times (trigger low-result frame)
 */
export async function getToolSessionsToday(
  userId: string,
  toolType: ToolType
): Promise<number> {
  const supabase = createClient();
  
  // Get start of today in user's timezone
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { count, error } = await supabase
    .from('tool_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('tool_type', toolType)
    .gte('created_at', today.toISOString());

  if (error) {
    console.error('[getToolSessionsToday] Error:', error);
    return 0;
  }

  return count || 0;
}

// ============================================
// CHECK IF FIRST TIME USING TOOL
// ============================================

/**
 * Check if user has ever used this tool before
 * Used to show first-time vs returning message
 */
export async function isFirstTimeUsingTool(
  userId: string,
  toolType: ToolType
): Promise<boolean> {
  const supabase = createClient();
  
  const { count, error } = await supabase
    .from('tool_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('tool_type', toolType);

  if (error) {
    console.error('[isFirstTimeUsingTool] Error:', error);
    return true; // Default to first-time if error
  }

  return (count || 0) === 0;
}

// ============================================
// GET RECENT SESSIONS (for pattern detection)
// ============================================

/**
 * Get recent tool sessions for pattern analysis
 * Useful for detecting recurring themes or low clarity patterns
 */
export async function getRecentToolSessions(
  userId: string,
  toolType?: ToolType,
  limit: number = 10
): Promise<ToolSessionRecord[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('tool_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (toolType) {
    query = query.eq('tool_type', toolType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[getRecentToolSessions] Error:', error);
    return [];
  }

  return data || [];
}

// ============================================
// HELPER: Create capacity signals from modal state
// ============================================

/**
 * Helper to create capacity signals object from modal session state
 * Each modal can use this with its specific tracking
 */
export function createCapacitySignals(params: {
  clarityRating?: number | null;
  wasSignalNamed: boolean;
  wasInterpretationIdentified: boolean;
  actionSelected: boolean;
  sessionStartTime: Date;
}): CapacitySignals {
  return {
    clarity_rating: params.clarityRating ?? null,
    was_signal_named: params.wasSignalNamed,
    was_interpretation_identified: params.wasInterpretationIdentified,
    action_selected: params.actionSelected,
    session_duration_seconds: Math.floor(
      (Date.now() - params.sessionStartTime.getTime()) / 1000
    )
  };
}
