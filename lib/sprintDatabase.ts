// lib/sprintDatabase.ts
// Database functions for sprint tracking

import { createClient } from '@/lib/supabase/client';
import type { WeeklyMapEntry, SetupPreferences } from '@/lib/flowBlockAPI';

// ============================================
// TYPES
// ============================================

export interface MicroActionSprintRecord {
  id: string;
  user_id: string;
  sprint_number: number;
  identity: string;
  action: string;
  start_date: string;
  end_date: string | null;
  completion_status: 'active' | 'completed' | 'abandoned';
  adherence_percent: number | null;
  notes: string | null;
  created_at: string;
}

export interface FlowBlockSprintRecord {
  id: string;
  user_id: string;
  sprint_number: number;
  weekly_map: WeeklyMapEntry[];
  preferences: SetupPreferences;
  domains: string[];
  focus_type: 'concentrated' | 'distributed';
  start_date: string;
  end_date: string | null;
  completion_status: 'active' | 'completed' | 'abandoned';
  total_blocks_completed: number;
  adherence_percent: number | null;
  notes: string | null;
  created_at: string;
}

export interface FlowBlockCompletionRecord {
  id: string;
  user_id: string;
  sprint_id: string;
  completion_date: string;
  day_of_week: string;
  task_completed: string;
  domain: string;
  duration_minutes: number;
  focus_quality: number;
  challenge_skill_balance: number;
  energy_after: number;
  flow_presence: number;
  reflection: string | null;
  created_at: string;
}

// ============================================
// MICRO-ACTION SPRINT FUNCTIONS
// ============================================

/**
 * Get the currently active MicroAction sprint for a user
 */
export async function getCurrentMicroActionSprint(userId: string): Promise<MicroActionSprintRecord | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('micro_action_sprints')
    .select('*')
    .eq('user_id', userId)
    .eq('completion_status', 'active')
    .order('sprint_number', { ascending: false })
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('[Sprint] Error fetching current MicroAction sprint:', error);
    throw error;
  }
  
  return data;
}

/**
 * Get the highest sprint number for a user (to determine next sprint number)
 */
export async function getLatestMicroActionSprintNumber(userId: string): Promise<number> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('micro_action_sprints')
    .select('sprint_number')
    .eq('user_id', userId)
    .order('sprint_number', { ascending: false })
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('[Sprint] Error fetching latest sprint number:', error);
    throw error;
  }
  
  return data?.sprint_number || 0;
}

/**
 * Start a new MicroAction sprint
 * - Completes any active sprint first
 * - Creates new sprint with incremented number
 */
export async function startNewMicroActionSprint(
  userId: string,
  identity: string,
  action: string
): Promise<{ sprintNumber: number; startDate: string; sprintId: string }> {
  const supabase = createClient();
  
  // Complete any active sprint first
  const { error: updateError } = await supabase
    .from('micro_action_sprints')
    .update({ 
      completion_status: 'completed', 
      end_date: new Date().toISOString() 
    })
    .eq('user_id', userId)
    .eq('completion_status', 'active');
  
  if (updateError) {
    console.error('[Sprint] Error completing previous sprint:', updateError);
    // Don't throw - continue to create new sprint
  }
  
  // Get next sprint number
  const lastSprintNumber = await getLatestMicroActionSprintNumber(userId);
  const newSprintNumber = lastSprintNumber + 1;
  const startDate = new Date().toISOString();
  
  // Create new sprint
  const { data, error } = await supabase
    .from('micro_action_sprints')
    .insert({
      user_id: userId,
      sprint_number: newSprintNumber,
      identity,
      action,
      start_date: startDate,
      completion_status: 'active'
    })
    .select('id')
    .single();
  
  if (error) {
    console.error('[Sprint] Error creating new MicroAction sprint:', error);
    throw error;
  }
  
  console.log(`[Sprint] Started MicroAction Sprint ${newSprintNumber} for user ${userId}`);
  
  return { 
    sprintNumber: newSprintNumber, 
    startDate,
    sprintId: data.id
  };
}

/**
 * Get MicroAction sprint history for a user
 */
export async function getMicroActionSprintHistory(userId: string): Promise<MicroActionSprintRecord[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('micro_action_sprints')
    .select('*')
    .eq('user_id', userId)
    .order('sprint_number', { ascending: false });
  
  if (error) {
    console.error('[Sprint] Error fetching MicroAction history:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Update MicroAction sprint (e.g., mark as completed, add notes)
 */
export async function updateMicroActionSprint(
  sprintId: string,
  updates: Partial<Pick<MicroActionSprintRecord, 'completion_status' | 'end_date' | 'adherence_percent' | 'notes'>>
): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('micro_action_sprints')
    .update(updates)
    .eq('id', sprintId);
  
  if (error) {
    console.error('[Sprint] Error updating MicroAction sprint:', error);
    throw error;
  }
}


// ============================================
// FLOW BLOCK SPRINT FUNCTIONS
// ============================================

/**
 * Get the currently active FlowBlock sprint for a user
 */
export async function getCurrentFlowBlockSprint(userId: string): Promise<FlowBlockSprintRecord | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('flow_block_sprints')
    .select('*')
    .eq('user_id', userId)
    .eq('completion_status', 'active')
    .order('sprint_number', { ascending: false })
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('[Sprint] Error fetching current FlowBlock sprint:', error);
    throw error;
  }
  
  return data;
}

/**
 * Get the highest FlowBlock sprint number for a user
 */
export async function getLatestFlowBlockSprintNumber(userId: string): Promise<number> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('flow_block_sprints')
    .select('sprint_number')
    .eq('user_id', userId)
    .order('sprint_number', { ascending: false })
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('[Sprint] Error fetching latest FlowBlock sprint number:', error);
    throw error;
  }
  
  return data?.sprint_number || 0;
}

/**
 * Start a new FlowBlock sprint
 * - Completes any active sprint first
 * - Creates new sprint with incremented number
 */
export async function startNewFlowBlockSprint(
  userId: string,
  weeklyMap: WeeklyMapEntry[],
  preferences: SetupPreferences,
  domains: string[],
  focusType: 'concentrated' | 'distributed'
): Promise<{ sprintNumber: number; startDate: string; sprintId: string }> {
  const supabase = createClient();
  
  // Complete any active sprint first
  const { error: updateError } = await supabase
    .from('flow_block_sprints')
    .update({ 
      completion_status: 'completed', 
      end_date: new Date().toISOString() 
    })
    .eq('user_id', userId)
    .eq('completion_status', 'active');
  
  if (updateError) {
    console.error('[Sprint] Error completing previous FlowBlock sprint:', updateError);
    // Don't throw - continue to create new sprint
  }
  
  // Get next sprint number
  const lastSprintNumber = await getLatestFlowBlockSprintNumber(userId);
  const newSprintNumber = lastSprintNumber + 1;
  const startDate = new Date().toISOString();
  
  // Create new sprint
  const { data, error } = await supabase
    .from('flow_block_sprints')
    .insert({
      user_id: userId,
      sprint_number: newSprintNumber,
      weekly_map: weeklyMap,
      preferences,
      domains,
      focus_type: focusType,
      start_date: startDate,
      completion_status: 'active'
    })
    .select('id')
    .single();
  
  if (error) {
    console.error('[Sprint] Error creating new FlowBlock sprint:', error);
    throw error;
  }
  
  console.log(`[Sprint] Started FlowBlock Sprint ${newSprintNumber} for user ${userId}`);
  
  return { 
    sprintNumber: newSprintNumber, 
    startDate,
    sprintId: data.id
  };
}

/**
 * Log a daily FlowBlock completion with performance metrics
 */
export async function logFlowBlockCompletion(
  userId: string,
  sprintId: string,
  completion: {
    dayOfWeek: string;
    taskCompleted: string;
    domain: string;
    durationMinutes: number;
    focusQuality: number;
    challengeSkillBalance: number;
    energyAfter: number;
    flowPresence: number;
    reflection?: string;
  }
): Promise<void> {
  const supabase = createClient();
  
  // Insert completion record
  const { error: insertError } = await supabase
    .from('flow_block_completions')
    .insert({
      user_id: userId,
      sprint_id: sprintId,
      completion_date: new Date().toISOString().split('T')[0],
      day_of_week: completion.dayOfWeek,
      task_completed: completion.taskCompleted,
      domain: completion.domain,
      duration_minutes: completion.durationMinutes,
      focus_quality: completion.focusQuality,
      challenge_skill_balance: completion.challengeSkillBalance,
      energy_after: completion.energyAfter,
      flow_presence: completion.flowPresence,
      reflection: completion.reflection || null
    });
  
  if (insertError) {
    console.error('[Sprint] Error logging FlowBlock completion:', insertError);
    throw insertError;
  }
  
  // Increment total blocks completed on sprint
  const { error: rpcError } = await supabase
    .rpc('increment_sprint_blocks', { p_sprint_id: sprintId });
  
  if (rpcError) {
    console.error('[Sprint] Error incrementing sprint blocks:', rpcError);
    // Don't throw - the completion was logged
  }
  
  console.log(`[Sprint] Logged FlowBlock completion for sprint ${sprintId}`);
}

/**
 * Get FlowBlock sprint history with completions
 */
export async function getFlowBlockSprintHistory(userId: string): Promise<(FlowBlockSprintRecord & { completions: FlowBlockCompletionRecord[] })[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('flow_block_sprints')
    .select(`
      *,
      completions:flow_block_completions(*)
    `)
    .eq('user_id', userId)
    .order('sprint_number', { ascending: false });
  
  if (error) {
    console.error('[Sprint] Error fetching FlowBlock history:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Get completions for a specific sprint
 */
export async function getSprintCompletions(sprintId: string): Promise<FlowBlockCompletionRecord[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('flow_block_completions')
    .select('*')
    .eq('sprint_id', sprintId)
    .order('completion_date', { ascending: true });
  
  if (error) {
    console.error('[Sprint] Error fetching sprint completions:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Update FlowBlock sprint (e.g., mark as completed, update adherence)
 */
export async function updateFlowBlockSprint(
  sprintId: string,
  updates: Partial<Pick<FlowBlockSprintRecord, 'completion_status' | 'end_date' | 'adherence_percent' | 'notes' | 'weekly_map' | 'preferences'>>
): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('flow_block_sprints')
    .update(updates)
    .eq('id', sprintId);
  
  if (error) {
    console.error('[Sprint] Error updating FlowBlock sprint:', error);
    throw error;
  }
}


// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Load both active sprints for a user (for initial app state)
 */
export async function loadActiveSprintsForUser(userId: string): Promise<{
  microActionSprint: MicroActionSprintRecord | null;
  flowBlockSprint: FlowBlockSprintRecord | null;
}> {
  const [microActionSprint, flowBlockSprint] = await Promise.all([
    getCurrentMicroActionSprint(userId),
    getCurrentFlowBlockSprint(userId)
  ]);
  
  return { microActionSprint, flowBlockSprint };
}

/**
 * Calculate adherence percentage for a sprint
 */
export function calculateAdherence(
  sprintStartDate: string,
  completedDays: number,
  type: 'microAction' | 'flowBlock'
): number {
  const start = new Date(sprintStartDate);
  start.setHours(0, 0, 0, 0);
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const diffTime = now.getTime() - start.getTime();
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const cappedDays = Math.min(totalDays, 21);
  
  if (type === 'microAction') {
    // MicroAction: expect completion every day
    return cappedDays > 0 ? Math.round((completedDays / cappedDays) * 100) : 0;
  } else {
    // FlowBlock: expect 5 completions per week (Mon-Fri)
    const fullWeeks = Math.floor((cappedDays - 1) / 7);
    const remainingDays = ((cappedDays - 1) % 7) + 1;
    const workDaysRemaining = Math.min(remainingDays, 5);
    const expectedBlocks = (fullWeeks * 5) + workDaysRemaining;
    
    return expectedBlocks > 0 ? Math.round((completedDays / expectedBlocks) * 100) : 0;
  }
}
