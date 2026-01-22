// ============================================
// lib/sprintDatabase.ts
// Sprint tracking for Identity and Flow Block 21-day cycles
// Version 4.0 - Full execution_cue support for Cue Kernel alignment
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
    coherenceStatement: string | null;
    identityStatement: string | null;  // Alias for backwards compat
    microAction: string | null;
    executionCue: string | null;       // NEW: v4.0
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
 * Start a new Micro-Action identity sprint.
 * - Marks any existing active sprint as completed
 * - Creates new sprint with incremented sprint number
 * 
 * Table: identity_sprints
 * Columns: identity_statement, micro_action, execution_cue, start_date, completion_status
 */
export async function startNewMicroActionSprint(
  userId: string,
  coherenceStatement: string,
  microAction: string,
  executionCue?: string  // NEW: v4.0 - optional execution cue
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
    
    // 4. Build insert object (only include execution_cue if provided)
    const insertData: any = {
      user_id: userId,
      sprint_number: nextSprintNumber,
      identity_statement: coherenceStatement,  // DB column name (legacy)
      micro_action: microAction,
      start_date: today,
      completion_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add execution_cue if provided (column must exist in DB)
    if (executionCue) {
      insertData.execution_cue = executionCue;
    }
    
    // 5. Insert new sprint
    const { data: newSprint, error: insertError } = await supabase
      .from('identity_sprints')
      .insert(insertData)
      .select()
      .single();
    
    if (insertError) {
      console.error('[SprintDB] Error inserting new sprint:', insertError);
      throw insertError;
    }
    
    console.log('[SprintDB] New Micro-Action sprint created:', {
      sprintNumber: nextSprintNumber,
      coherenceStatement,
      microAction,
      executionCue: executionCue || '(none)',
      startDate: today
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
    
    if (error) {
      throw error;
    }
    
    return data?.[0] || null;
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
    
    // 2. Mark any active sprints as completed
    await supabase
      .from('flow_block_sprints')
      .update({
        completion_status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('completion_status', 'active');
    
    // 3. Insert new sprint
    const { error: insertError } = await supabase
      .from('flow_block_sprints')
      .insert({
        user_id: userId,
        sprint_number: nextSprintNumber,
        weekly_map: weeklyMap,
        preferences: preferences,
        domains: domains,
        focus_type: focusType,
        start_date: today,
        completion_status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (insertError) throw insertError;
    
    console.log('[SprintDB] New Flow Block sprint created:', {
      sprintNumber: nextSprintNumber,
      domains,
      focusType,
      startDate: today
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
      .maybeSingle()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found - not an error
        return null;
      }
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
  adherencePercent?: number,
  notes?: string
): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('flow_block_sprints')
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
    console.error('[SprintDB] completeFlowBlockSprint failed:', error);
    return false;
  }
}

// ============================================
// COMBINED SPRINT LOADER
// ============================================

/**
 * Load both active sprints for a user
 * Used by ChatInterface to display current sprint status
 */
export async function loadActiveSprintsForUser(userId: string): Promise<ActiveSprints> {
  const [microActionSprint, flowBlockSprint] = await Promise.all([
    getCurrentMicroActionSprint(userId),
    getCurrentFlowBlockSprint(userId)
  ]);
  
  const today = new Date();
  
  // Calculate day of sprint (1-21)
  const calculateDayOfSprint = (startDate: string | null): number => {
    if (!startDate) return 1;
    const start = new Date(startDate);
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.min(Math.max(diffDays + 1, 1), 21); // Clamp between 1-21
  };
  
  const microActionDayOfSprint = microActionSprint 
    ? calculateDayOfSprint(microActionSprint.start_date)
    : 1;
    
  const flowBlockDayOfSprint = flowBlockSprint
    ? calculateDayOfSprint(flowBlockSprint.start_date)
    : 1;
  
  return {
    microAction: microActionSprint ? {
      isActive: true,
      sprintNumber: microActionSprint.sprint_number,
      dayOfSprint: microActionDayOfSprint,
      coherenceStatement: microActionSprint.identity_statement,   // DB column: identity_statement
      identityStatement: microActionSprint.identity_statement,    // Alias for backwards compat
      microAction: microActionSprint.micro_action,                // DB column: micro_action
      executionCue: microActionSprint.execution_cue || null,      // NEW: v4.0
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

// ============================================
// SPRINT CONTINUATION FUNCTIONS
// ============================================

/**
 * Continue/renew an existing Micro-Action sprint with the same or updated values
 * Used when a user wants to extend their current sprint for another 21 days
 */
export async function continueMicroActionSprint(
  userId: string,
  coherenceStatement?: string,
  microAction?: string,
  executionCue?: string  // NEW: v4.0
): Promise<MicroActionSprintResult> {
  try {
    // Get current active sprint
    const currentSprint = await getCurrentMicroActionSprint(userId);
    
    if (!currentSprint) {
      // No active sprint to continue - start a new one if values provided
      if (coherenceStatement && microAction) {
        return startNewMicroActionSprint(userId, coherenceStatement, microAction, executionCue);
      }
      return {
        success: false,
        sprintNumber: 0,
        startDate: '',
        error: 'No active sprint to continue and no new values provided'
      };
    }
    
    // Use existing values if not provided
    const newCoherenceStatement = coherenceStatement || currentSprint.identity_statement;
    const newMicroAction = microAction || currentSprint.micro_action;
    const newExecutionCue = executionCue || currentSprint.execution_cue;
    
    // Start a new sprint (this will mark current as completed)
    return startNewMicroActionSprint(userId, newCoherenceStatement, newMicroAction, newExecutionCue);
    
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
 * Continue/renew an existing Flow Block sprint with the same or updated values
 */
export async function continueFlowBlockSprint(
  userId: string,
  weeklyMap?: any,
  preferences?: any,
  domains?: string[],
  focusType?: 'concentrated' | 'distributed'
): Promise<FlowBlockSprintResult> {
  try {
    // Get current active sprint
    const currentSprint = await getCurrentFlowBlockSprint(userId);
    
    if (!currentSprint) {
      // No active sprint to continue
      if (weeklyMap && preferences && domains && focusType) {
        return startNewFlowBlockSprint(userId, weeklyMap, preferences, domains, focusType);
      }
      return {
        success: false,
        sprintNumber: 0,
        startDate: '',
        error: 'No active sprint to continue and no new values provided'
      };
    }
    
    // Use existing values if not provided
    const newWeeklyMap = weeklyMap || currentSprint.weekly_map;
    const newPreferences = preferences || currentSprint.preferences;
    const newDomains = domains || currentSprint.domains;
    const newFocusType = focusType || currentSprint.focus_type;
    
    // Start a new sprint (this will mark current as completed)
    return startNewFlowBlockSprint(userId, newWeeklyMap, newPreferences, newDomains, newFocusType);
    
  } catch (error) {
    console.error('[SprintDB] continueFlowBlockSprint failed:', error);
    return {
      success: false,
      sprintNumber: 0,
      startDate: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ============================================
// SPRINT RENEWAL CHECK FUNCTIONS
// ============================================

/**
 * Check if a micro-action sprint needs renewal (day 21+)
 */
export function checkMicroActionSprintRenewal(startDate: string | null): {
  needsRenewal: boolean;
  daysComplete: number;
} {
  if (!startDate) {
    return { needsRenewal: false, daysComplete: 0 };
  }
  
  const start = new Date(startDate);
  const today = new Date();
  const diffTime = today.getTime() - start.getTime();
  const daysComplete = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  return {
    needsRenewal: daysComplete >= 21,
    daysComplete
  };
}

/**
 * Check if a flow block sprint needs renewal (day 21+)
 */
export function checkFlowBlockSprintRenewal(startDate: string | null): {
  needsRenewal: boolean;
  daysComplete: number;
} {
  if (!startDate) {
    return { needsRenewal: false, daysComplete: 0 };
  }
  
  const start = new Date(startDate);
  const today = new Date();
  const diffTime = today.getTime() - start.getTime();
  const daysComplete = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  return {
    needsRenewal: daysComplete >= 21,
    daysComplete
  };
}

// ============================================
// UTILITY: Update execution cue for existing sprint
// ============================================

/**
 * Update just the execution cue for the current active sprint
 * Useful if cue was extracted after initial save
 */
export async function updateMicroActionExecutionCue(
  userId: string,
  executionCue: string
): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('identity_sprints')
      .update({
        execution_cue: executionCue,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('completion_status', 'active');
    
    if (error) throw error;
    
    console.log('[SprintDB] Execution cue updated:', executionCue);
    return true;
  } catch (error) {
    console.error('[SprintDB] updateMicroActionExecutionCue failed:', error);
    return false;
  }
}
