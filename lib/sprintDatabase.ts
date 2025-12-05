// ============================================
// lib/sprintDatabase.ts
// Sprint tracking for Identity and Flow Block 21-day cycles
// Version 2.0 - Uses correct column names for Supabase tables
// ============================================

import { createClient } from '@/lib/supabase-client';

// ============================================
// TYPES
// ============================================

export interface MicroActionSprintResult {
  success: boolean;
  sprintNumber: number;
  startDate: string;
  error?: string;
}

export interface FlowBlockSprintResult {
  success: boolean;
  sprintNumber: number;
  startDate: string;
  error?: string;
}

export interface ActiveSprints {
  microAction: {
    isActive: boolean;
    sprintNumber: number;
    dayOfSprint: number;
    identityStatement: string | null;
    microAction: string | null;
    startDate: string | null;
  } | null;
  flowBlock: {
    isActive: boolean;
    sprintNumber: number;
    dayOfSprint: number;
    weeklyMap: any | null;
    preferences: any | null;
    startDate: string | null;
  } | null;
}

// ============================================
// MICRO-ACTION SPRINT FUNCTIONS
// ============================================

/**
 * Start a new Micro-Action identity sprint.
 * - Marks any existing active sprint as completed
 * - Creates new sprint with incremented sprint number
 * 
 * Table: identity_sprints
 * Columns: identity_statement, micro_action, start_date, completion_status
 */
export async function startNewMicroActionSprint(
  userId: string,
  identityStatement: string,
  microAction: string
): Promise<MicroActionSprintResult> {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  try {
    // 1. Get current highest sprint number for this user
    const { data: existingSprints, error: fetchError } = await supabase
      .from('identity_sprints')
      .select('sprint_number, completion_status')
      .eq('user_id', userId)
      .order('sprint_number', { ascending: false })
      .limit(1);
    
    if (fetchError) {
      console.error('[SprintDB] Error fetching existing sprints:', fetchError);
      throw fetchError;
    }
    
    // 2. Calculate next sprint number
    const nextSprintNumber = existingSprints && existingSprints.length > 0 
      ? existingSprints[0].sprint_number + 1 
      : 1;
    
    // 3. Mark any active sprints as completed
    const { error: updateError } = await supabase
      .from('identity_sprints')
      .update({ 
        completion_status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('completion_status', 'active');
    
    if (updateError) {
      console.error('[SprintDB] Error updating old sprints:', updateError);
      // Continue anyway - not critical
    }
    
    // 4. Insert new sprint
    const { data: newSprint, error: insertError } = await supabase
      .from('identity_sprints')
      .insert({
        user_id: userId,
        sprint_number: nextSprintNumber,
        identity_statement: identityStatement,  // CORRECT column name
        micro_action: microAction,
        start_date: today,                      // CORRECT column name
        completion_status: 'active'             // CORRECT column name
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('[SprintDB] Error inserting new sprint:', insertError);
      throw insertError;
    }
    
    console.log('[SprintDB] New micro-action sprint created:', {
      sprintNumber: nextSprintNumber,
      identity: identityStatement,
      action: microAction
    });
    
    return {
      success: true,
      sprintNumber: nextSprintNumber,
      startDate: today
    };
    
  } catch (error) {
    console.error('[SprintDB] startNewMicroActionSprint failed:', error);
    return {
      success: false,
      sprintNumber: 0,
      startDate: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get the current active Micro-Action sprint for a user
 */
export async function getCurrentMicroActionSprint(userId: string) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('identity_sprints')
      .select('*')
      .eq('user_id', userId)
      .eq('completion_status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found - not an error
        return null;
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('[SprintDB] getCurrentMicroActionSprint failed:', error);
    return null;
  }
}

/**
 * Complete the current Micro-Action sprint
 */
export async function completeMicroActionSprint(
  userId: string,
  adherencePercent?: number,
  notes?: string
): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('identity_sprints')
      .update({
        completion_status: 'completed',
        adherence_percent: adherencePercent,
        notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('completion_status', 'active');
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[SprintDB] completeMicroActionSprint failed:', error);
    return false;
  }
}

// ============================================
// FLOW BLOCK SPRINT FUNCTIONS
// ============================================

/**
 * Start a new Flow Block sprint.
 * - Marks any existing active sprint as completed
 * - Creates new sprint with incremented sprint number
 * 
 * Table: flow_block_sprints
 * Columns: weekly_map, preferences, domains, focus_type, start_date, completion_status
 */
export async function startNewFlowBlockSprint(
  userId: string,
  weeklyMap: any,
  preferences: any,
  domains: string[],
  focusType: 'concentrated' | 'distributed'
): Promise<FlowBlockSprintResult> {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // 1. Get current highest sprint number
    const { data: existingSprints, error: fetchError } = await supabase
      .from('flow_block_sprints')
      .select('sprint_number')
      .eq('user_id', userId)
      .order('sprint_number', { ascending: false })
      .limit(1);
    
    if (fetchError) throw fetchError;
    
    const nextSprintNumber = existingSprints && existingSprints.length > 0
      ? existingSprints[0].sprint_number + 1
      : 1;
    
    // 2. Mark active sprints as completed
    await supabase
      .from('flow_block_sprints')
      .update({ 
        completion_status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('completion_status', 'active');
    
    // 3. Insert new sprint
    const { data: newSprint, error: insertError } = await supabase
      .from('flow_block_sprints')
      .insert({
        user_id: userId,
        sprint_number: nextSprintNumber,
        weekly_map: weeklyMap,
        preferences: preferences,
        domains: domains,
        focus_type: focusType,
        start_date: today,
        completion_status: 'active'
      })
      .select()
      .single();
    
    if (insertError) throw insertError;
    
    console.log('[SprintDB] New flow block sprint created:', {
      sprintNumber: nextSprintNumber,
      domains,
      focusType
    });
    
    return {
      success: true,
      sprintNumber: nextSprintNumber,
      startDate: today
    };
    
  } catch (error) {
    console.error('[SprintDB] startNewFlowBlockSprint failed:', error);
    return {
      success: false,
      sprintNumber: 0,
      startDate: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get the current active Flow Block sprint for a user
 */
export async function getCurrentFlowBlockSprint(userId: string) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('flow_block_sprints')
      .select('*')
      .eq('user_id', userId)
      .eq('completion_status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('[SprintDB] getCurrentFlowBlockSprint failed:', error);
    return null;
  }
}

/**
 * Complete the current Flow Block sprint
 */
export async function completeFlowBlockSprint(
  userId: string,
  totalBlocksCompleted?: number,
  adherencePercent?: number,
  notes?: string
): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('flow_block_sprints')
      .update({
        completion_status: 'completed',
        total_blocks_completed: totalBlocksCompleted,
        adherence_percent: adherencePercent,
        notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('completion_status', 'active');
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[SprintDB] completeFlowBlockSprint failed:', error);
    return false;
  }
}

// ============================================
// COMBINED LOADING FUNCTION
// ============================================

/**
 * Load all active sprints for a user in one call
 */
export async function loadActiveSprintsForUser(userId: string): Promise<ActiveSprints> {
  const [microActionSprint, flowBlockSprint] = await Promise.all([
    getCurrentMicroActionSprint(userId),
    getCurrentFlowBlockSprint(userId)
  ]);
  
  const today = new Date();
  
  // Calculate day of sprint for micro-action
  let microActionDayOfSprint = 0;
  if (microActionSprint?.start_date) {
    const startDate = new Date(microActionSprint.start_date);
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    microActionDayOfSprint = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  
  // Calculate day of sprint for flow block
  let flowBlockDayOfSprint = 0;
  if (flowBlockSprint?.start_date) {
    const startDate = new Date(flowBlockSprint.start_date);
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    flowBlockDayOfSprint = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  
  return {
    microAction: microActionSprint ? {
      isActive: true,
      sprintNumber: microActionSprint.sprint_number,
      dayOfSprint: microActionDayOfSprint,
      identityStatement: microActionSprint.identity_statement,
      microAction: microActionSprint.micro_action,
      startDate: microActionSprint.start_date
    } : null,
    flowBlock: flowBlockSprint ? {
      isActive: true,
      sprintNumber: flowBlockSprint.sprint_number,
      dayOfSprint: flowBlockDayOfSprint,
      weeklyMap: flowBlockSprint.weekly_map,
      preferences: flowBlockSprint.preferences,
      startDate: flowBlockSprint.start_date
    } : null
  };
}
