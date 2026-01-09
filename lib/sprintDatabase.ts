// ============================================
// lib/sprintDatabase.ts
// Sprint tracking for Aligned Action and Flow Block 21-day cycles
// Version 3.0 - Refactored: Identity → Coherence/Aligned Action
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
    coherenceStatement: string | null;  // RENAMED
    microAction: string | null;
    startDate: string | null;
  } | null;
  flowBlock: {
    isActive: boolean;
    sprintNumber: number;
    dayOfSprint: number;
    weeklyMap: any | null;
    preferences: any | null;
    domains: string[] | null;
    focusType: string | null;
    startDate: string | null;
  } | null;
}

// ============================================
// MICRO-ACTION SPRINT FUNCTIONS
// ============================================

/**
 * Start a new Micro-Action sprint (Aligned Action).
 * - Marks any existing active sprint as completed
 * - Creates new sprint with incremented sprint number
 * 
 * Table: micro_action_sprints
 * Columns: coherence_statement, action, start_date, completion_status
 */
export async function startNewMicroActionSprint(
  userId: string,
  coherenceStatement: string,  // RENAMED from identityStatement
  microAction: string
): Promise<MicroActionSprintResult> {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // 1. Get current highest sprint number for this user
    const { data: existingSprints, error: fetchError } = await supabase
      .from('micro_action_sprints')  // CORRECT TABLE NAME
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
      .from('micro_action_sprints')
      .update({ 
        completion_status: 'completed',
        end_date: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('completion_status', 'active');
    
    if (updateError) {
      console.error('[SprintDB] Error updating old sprints:', updateError);
    }
    
    // 4. Insert new sprint
    const { data: newSprint, error: insertError } = await supabase
      .from('micro_action_sprints')
      .insert({
        user_id: userId,
        sprint_number: nextSprintNumber,
        coherence_statement: coherenceStatement,  // CORRECT COLUMN NAME
        action: microAction,  // CORRECT COLUMN NAME
        start_date: today,
        completion_status: 'active'
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('[SprintDB] Error inserting new sprint:', insertError);
      throw insertError;
    }
    
    console.log('[SprintDB] New aligned action sprint created:', {
      sprintNumber: nextSprintNumber,
      coherenceStatement: coherenceStatement,
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
 * Continue an existing Micro-Action sprint with the SAME coherence statement
 */
export async function continueMicroActionSprint(
  userId: string
): Promise<MicroActionSprintResult> {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // 1. Get current active sprint
    const { data: currentSprint, error: fetchError } = await supabase
      .from('micro_action_sprints')
      .select('*')
      .eq('user_id', userId)
      .eq('completion_status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (fetchError || !currentSprint) {
      throw new Error('No active sprint found to continue');
    }
    
    // 2. Mark current sprint as completed
    await supabase
      .from('micro_action_sprints')
      .update({ 
        completion_status: 'completed',
        end_date: new Date().toISOString()
      })
      .eq('id', currentSprint.id);
    
    // 3. Create new sprint with same coherence statement
    const nextSprintNumber = currentSprint.sprint_number + 1;
    
    const { error: insertError } = await supabase
      .from('micro_action_sprints')
      .insert({
        user_id: userId,
        sprint_number: nextSprintNumber,
        coherence_statement: currentSprint.coherence_statement,
        action: currentSprint.action,
        start_date: today,
        completion_status: 'active'
      });
    
    if (insertError) throw insertError;
    
    console.log('[SprintDB] Aligned action sprint continued:', {
      sprintNumber: nextSprintNumber,
      coherenceStatement: currentSprint.coherence_statement
    });
    
    return {
      success: true,
      sprintNumber: nextSprintNumber,
      startDate: today
    };
    
  } catch (error) {
    console.error('[SprintDB] continueMicroActionSprint failed:', error);
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
      .from('micro_action_sprints')
      .select('*')
      .eq('user_id', userId)
      .eq('completion_status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
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
      .from('micro_action_sprints')
      .update({
        completion_status: 'completed',
        adherence_percent: adherencePercent,
        notes: notes,
        end_date: new Date().toISOString()
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
// FLOW BLOCK SPRINT FUNCTIONS (unchanged)
// ============================================
// ... keep your existing flow block functions ...

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
      coherenceStatement: microActionSprint.coherence_statement,  // RENAMED
      microAction: microActionSprint.action,  // CORRECT COLUMN
      startDate: microActionSprint.start_date
    } : null,
    flowBlock: flowBlockSprint ? {
      isActive: true,
      sprintNumber: flowBlockSprint.sprint_number,
      dayOfSprint: flowBlockDayOfSprint,
      weeklyMap: flowBlockSprint.weekly_map,
      preferences: flowBlockSprint.preferences,
      domains: flowBlockSprint.domains,
      focusType: flowBlockSprint.focus_type,
      startDate: flowBlockSprint.start_date
    } : null
  };
}
