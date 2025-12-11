/**
 * Resistance Pattern Detection System
 * 
 * Tracks and analyzes user resistance patterns to enable
 * targeted coaching interventions.
 */

import { createClient } from '@/lib/supabase-client';

// ============================================
// TYPES
// ============================================

export type ResistanceEventType = 
  | 'practice_skip'    // Required practice not completed
  | 'tool_decline'     // User declined offered on-demand tool
  | 'reschedule'       // User moved scheduled block
  | 'excuse'           // User provided reason for missing
  | 'missed_days'      // Multi-day gap in practice
  | 'early_exit';      // User exited practice/protocol early

export type TargetType = 
  | 'hrvb'
  | 'awareness_rep'
  | 'somatic_flow'
  | 'micro_action'
  | 'flow_block'
  | 'co_regulation'
  | 'nightly_debrief'
  | 'decentering'
  | 'meta_reflection'
  | 'reframe'
  | 'thought_hygiene'
  | 'weekly_checkin'
  | 'general';

export type ExcuseCategory = 
  | 'time'
  | 'energy'
  | 'motivation'
  | 'life_event'
  | 'forgot'
  | 'other';

export interface ResistanceEvent {
  id?: string;
  user_id: string;
  event_type: ResistanceEventType;
  target_type: TargetType;
  reason?: string;
  context?: string;
  day_of_week?: number;
  time_of_day?: 'morning' | 'afternoon' | 'evening';
  stage?: number;
  created_at?: string;
}

export interface ResistancePattern {
  type: 'same_practice' | 'same_excuse' | 'same_day' | 'tool_decline' | 'general_avoidance';
  target?: string;
  count: number;
  timeframe: string;
  details: string;
  intervention: string;
}

// ============================================
// LOGGING FUNCTIONS
// ============================================

/**
 * Log a resistance event to the database
 */
export async function logResistanceEvent(event: Omit<ResistanceEvent, 'id' | 'created_at'>): Promise<boolean> {
  try {
    const supabase = createClient();
    
    // Add time context
    const now = new Date();
    const hour = now.getHours();
    let timeOfDay: 'morning' | 'afternoon' | 'evening' = 'morning';
    if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17) timeOfDay = 'evening';
    
    const { error } = await supabase
      .from('resistance_events')
      .insert({
        ...event,
        day_of_week: now.getDay(),
        time_of_day: timeOfDay
      });
    
    if (error) {
      console.error('[ResistanceTracking] Failed to log event:', error);
      return false;
    }
    
    console.log('[ResistanceTracking] Logged event:', event.event_type, event.target_type);
    return true;
  } catch (error) {
    console.error('[ResistanceTracking] Error:', error);
    return false;
  }
}

/**
 * Log a practice skip (end of day check)
 */
export async function logPracticeSkip(
  userId: string, 
  practiceId: TargetType, 
  stage: number
): Promise<boolean> {
  return logResistanceEvent({
    user_id: userId,
    event_type: 'practice_skip',
    target_type: practiceId,
    stage
  });
}

/**
 * Log when user declines an offered tool
 */
export async function logToolDecline(
  userId: string, 
  toolId: TargetType, 
  context?: string,
  stage?: number
): Promise<boolean> {
  return logResistanceEvent({
    user_id: userId,
    event_type: 'tool_decline',
    target_type: toolId,
    context,
    stage
  });
}

/**
 * Log an excuse/reason provided by user
 */
export async function logExcuse(
  userId: string,
  reason: string,
  category: ExcuseCategory,
  targetType: TargetType = 'general',
  stage?: number
): Promise<boolean> {
  return logResistanceEvent({
    user_id: userId,
    event_type: 'excuse',
    target_type: targetType,
    reason: category,
    context: reason,
    stage
  });
}

/**
 * Log a multi-day gap
 */
export async function logMissedDays(
  userId: string,
  daysMissed: number,
  reason?: string,
  stage?: number
): Promise<boolean> {
  return logResistanceEvent({
    user_id: userId,
    event_type: 'missed_days',
    target_type: 'general',
    reason: reason,
    context: `${daysMissed} days missed`,
    stage
  });
}

/**
 * Log a reschedule event
 */
export async function logReschedule(
  userId: string,
  targetType: TargetType,
  context?: string,
  stage?: number
): Promise<boolean> {
  return logResistanceEvent({
    user_id: userId,
    event_type: 'reschedule',
    target_type: targetType,
    context,
    stage
  });
}

// ============================================
// PATTERN DETECTION FUNCTIONS
// ============================================

/**
 * Get all resistance events for a user within a timeframe
 */
export async function getResistanceEvents(
  userId: string,
  daysBack: number = 7
): Promise<ResistanceEvent[]> {
  try {
    const supabase = createClient();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    
    const { data, error } = await supabase
      .from('resistance_events')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('[ResistanceTracking] Failed to fetch events:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('[ResistanceTracking] Error:', error);
    return [];
  }
}

/**
 * Detect patterns in resistance events
 */
export async function detectResistancePatterns(
  userId: string,
  daysBack: number = 7
): Promise<ResistancePattern[]> {
  const events = await getResistanceEvents(userId, daysBack);
  const patterns: ResistancePattern[] = [];
  
  if (events.length === 0) return patterns;
  
  // 1. Same practice skipped multiple times
  const practiceSkips = events.filter(e => e.event_type === 'practice_skip');
  const skipsByTarget = groupBy(practiceSkips, 'target_type');
  
  for (const [target, skips] of Object.entries(skipsByTarget)) {
    if (skips.length >= 3) {
      const practiceName = getPracticeName(target as TargetType);
      patterns.push({
        type: 'same_practice',
        target,
        count: skips.length,
        timeframe: `${daysBack} days`,
        details: `Skipped ${practiceName} ${skips.length} times`,
        intervention: getSkipIntervention(target as TargetType, skips.length)
      });
    }
  }
  
  // 2. Same excuse used multiple times
  const excuses = events.filter(e => e.event_type === 'excuse');
  const excusesByReason = groupBy(excuses, 'reason');
  
  for (const [reason, instances] of Object.entries(excusesByReason)) {
    if (instances.length >= 3 && reason) {
      patterns.push({
        type: 'same_excuse',
        target: reason,
        count: instances.length,
        timeframe: `${daysBack} days`,
        details: `Used "${getExcuseLabel(reason)}" ${instances.length} times`,
        intervention: getExcuseIntervention(reason, instances.length)
      });
    }
  }
  
  // 3. Same day of week pattern
  const daySkips = events.filter(e => 
    e.event_type === 'practice_skip' || e.event_type === 'missed_days'
  );
  const skipsByDay = groupBy(daySkips, 'day_of_week');
  
  for (const [day, skips] of Object.entries(skipsByDay)) {
    if (skips.length >= 3) {
      const dayName = getDayName(parseInt(day));
      patterns.push({
        type: 'same_day',
        target: dayName,
        count: skips.length,
        timeframe: `${daysBack} days`,
        details: `${skips.length} skips on ${dayName}s`,
        intervention: getDayIntervention(dayName, skips.length)
      });
    }
  }
  
  // 4. Tool decline pattern
  const toolDeclines = events.filter(e => e.event_type === 'tool_decline');
  const declinesByTarget = groupBy(toolDeclines, 'target_type');
  
  for (const [target, declines] of Object.entries(declinesByTarget)) {
    if (declines.length >= 3) {
      const toolName = getToolName(target as TargetType);
      patterns.push({
        type: 'tool_decline',
        target,
        count: declines.length,
        timeframe: `${daysBack} days`,
        details: `Declined ${toolName} ${declines.length} times`,
        intervention: getToolDeclineIntervention(target as TargetType, declines.length)
      });
    }
  }
  
  // 5. General avoidance (high total events)
  if (events.length >= 10) {
    patterns.push({
      type: 'general_avoidance',
      count: events.length,
      timeframe: `${daysBack} days`,
      details: `${events.length} resistance events recorded`,
      intervention: getGeneralAvoidanceIntervention(events.length)
    });
  }
  
  return patterns;
}

/**
 * Get the most relevant pattern for immediate intervention
 */
export async function getMostRelevantPattern(
  userId: string
): Promise<ResistancePattern | null> {
  const patterns = await detectResistancePatterns(userId, 7);
  
  if (patterns.length === 0) return null;
  
  // Priority: same_practice > tool_decline > same_excuse > same_day > general
  const priority = ['same_practice', 'tool_decline', 'same_excuse', 'same_day', 'general_avoidance'];
  
  for (const type of priority) {
    const match = patterns.find(p => p.type === type);
    if (match) return match;
  }
  
  return patterns[0];
}

/**
 * Check if a specific practice has been skipped multiple times recently
 */
export async function checkPracticeResistance(
  userId: string,
  practiceId: TargetType,
  threshold: number = 3
): Promise<{ hasPattern: boolean; count: number; intervention: string | null }> {
  const events = await getResistanceEvents(userId, 7);
  
  const skips = events.filter(
    e => e.event_type === 'practice_skip' && e.target_type === practiceId
  );
  
  if (skips.length >= threshold) {
    return {
      hasPattern: true,
      count: skips.length,
      intervention: getSkipIntervention(practiceId, skips.length)
    };
  }
  
  return { hasPattern: false, count: skips.length, intervention: null };
}

/**
 * Check if user has declined a specific tool multiple times
 */
export async function checkToolResistance(
  userId: string,
  toolId: TargetType,
  threshold: number = 3
): Promise<{ hasPattern: boolean; count: number; intervention: string | null }> {
  const events = await getResistanceEvents(userId, 14); // 2 weeks for tools
  
  const declines = events.filter(
    e => e.event_type === 'tool_decline' && e.target_type === toolId
  );
  
  if (declines.length >= threshold) {
    return {
      hasPattern: true,
      count: declines.length,
      intervention: getToolDeclineIntervention(toolId, declines.length)
    };
  }
  
  return { hasPattern: false, count: declines.length, intervention: null };
}

// ============================================
// INTERVENTION MESSAGES
// ============================================

function getSkipIntervention(target: TargetType, count: number): string {
  const name = getPracticeName(target);
  
  const messages: { [key: string]: string } = {
    hrvb: `${count} times this week you've skipped Resonance Breathing. Here's the thing — your nervous system doesn't care about your reasons. It only knows what you train. What's actually in the way?`,
    awareness_rep: `Third time this week you've "forgotten" the Awareness Rep. Your resistance IS the practice. What are you avoiding by staying in autopilot?`,
    somatic_flow: `You've skipped Somatic Flow ${count} times. Your body is trying to stay disconnected. What would it mean to actually inhabit it?`,
    micro_action: `${count} identity proof skips. You're telling your nervous system your chosen identity doesn't matter. Is that true?`,
    flow_block: `You've rescheduled or skipped Flow Blocks ${count} times. Deep work is uncomfortable — that's the point. What are you protecting yourself from?`,
    nightly_debrief: `${count} nights without integration. Your nervous system is losing the day's learning. What's the resistance to reflection?`,
    default: `You've skipped ${name} ${count} times this week. Your resistance is information. What's it telling you?`
  };
  
  return messages[target] || messages.default;
}

function getExcuseIntervention(reason: string, count: number): string {
  const messages: { [key: string]: string } = {
    time: `You've said "no time" ${count} times now. Here's the truth: you have the same 24 hours as everyone else. This isn't about time — it's about priority. What would have to change for this to become non-negotiable?`,
    energy: `"Too tired" has come up ${count} times. I get it — energy is real. But here's what's also real: these practices *give* energy when done consistently. You're stuck in a depletion loop. What's one thing draining you that you could cut?`,
    motivation: `You've mentioned motivation ${count} times. Motivation is unreliable — it comes and goes. Systems don't need motivation. What would it look like to show up even when you don't feel like it?`,
    life_event: `Life keeps happening — ${count} disruptions logged. That's real. But the question is: will there ever be a "perfect" time? Or do you build the practice *through* the chaos?`,
    forgot: `"Forgot" ${count} times. Your brain is deprioritizing this. That's not an accident — it's a choice your unconscious is making. What would make this impossible to forget?`,
    other: `You've had ${count} reasons to skip. At some point, the reasons become the pattern. What would it take to break through?`
  };
  
  return messages[reason] || messages.other;
}

function getDayIntervention(dayName: string, count: number): string {
  return `I notice ${dayName}s are consistently tough for you — ${count} skips on that day. What's different about ${dayName}s? Is it schedule, energy, or something else? Understanding this pattern could unlock your consistency.`;
}

function getToolDeclineIntervention(tool: TargetType, count: number): string {
  const name = getToolName(tool);
  
  const messages: { [key: string]: string } = {
    reframe: `You've declined the Reframe Protocol ${count} times when it seemed like you needed it. What are you afraid might shift if you actually examined those interpretations?`,
    decentering: `${count} times you've said no to Decentering. Staying fused with your thoughts and roles feels safer — but it's keeping you stuck. What would it mean to see them as objects rather than "you"?`,
    thought_hygiene: `You've passed on Thought Hygiene ${count} times. Holding onto mental clutter is a choice. What are you getting from staying scattered?`,
    meta_reflection: `${count} reflection declines. Looking inward can be uncomfortable — but that discomfort is where growth lives. What are you avoiding seeing?`,
    default: `You've declined ${name} ${count} times. The tool exists because it works. Your resistance to using it is worth examining.`
  };
  
  return messages[tool] || messages.default;
}

function getGeneralAvoidanceIntervention(count: number): string {
  return `I've logged ${count} resistance events in the past week. That's a lot of friction. Something bigger might be at play here — fear of change, protection of identity, something else. Want to dig into what's actually going on?`;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function groupBy<T>(array: T[], key: keyof T): { [key: string]: T[] } {
  return array.reduce((result, item) => {
    const groupKey = String(item[key] ?? 'unknown');
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as { [key: string]: T[] });
}

function getPracticeName(target: TargetType): string {
  const names: { [key: string]: string } = {
    hrvb: 'Resonance Breathing',
    awareness_rep: 'Awareness Rep',
    somatic_flow: 'Somatic Flow',
    micro_action: 'Morning Micro-Action',
    flow_block: 'Flow Block',
    co_regulation: 'Co-Regulation Practice',
    nightly_debrief: 'Nightly Debrief'
  };
  return names[target] || target;
}

function getToolName(target: TargetType): string {
  const names: { [key: string]: string } = {
    decentering: 'Decentering Practice',
    meta_reflection: 'Meta-Reflection',
    reframe: 'Reframe Protocol',
    thought_hygiene: 'Thought Hygiene'
  };
  return names[target] || target;
}

function getExcuseLabel(reason: string): string {
  const labels: { [key: string]: string } = {
    time: 'no time',
    energy: 'too tired',
    motivation: 'not motivated',
    life_event: 'life event',
    forgot: 'forgot',
    other: 'other reason'
  };
  return labels[reason] || reason;
}

function getDayName(day: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day] || 'Unknown';
}

// ============================================
// DAILY SKIP DETECTION
// ============================================

/**
 * Check what practices were skipped today and log them
 * Call this at end of day or start of next day
 */
export async function logDailySkips(
  userId: string,
  stage: number,
  completedPractices: string[]
): Promise<string[]> {
  // Required practices by stage
  const requiredByStage: { [key: number]: TargetType[] } = {
    1: ['hrvb', 'awareness_rep'],
    2: ['hrvb', 'somatic_flow', 'awareness_rep'],
    3: ['hrvb', 'somatic_flow', 'awareness_rep', 'micro_action'],
    4: ['hrvb', 'somatic_flow', 'awareness_rep', 'micro_action', 'flow_block'],
    5: ['hrvb', 'somatic_flow', 'awareness_rep', 'micro_action', 'flow_block', 'co_regulation'],
    6: ['hrvb', 'somatic_flow', 'awareness_rep', 'micro_action', 'flow_block', 'co_regulation', 'nightly_debrief'],
    7: ['hrvb', 'somatic_flow', 'awareness_rep', 'micro_action', 'flow_block', 'co_regulation', 'nightly_debrief']
  };
  
  const required = requiredByStage[stage] || requiredByStage[1];
  const skipped: string[] = [];
  
  for (const practice of required) {
    if (!completedPractices.includes(practice)) {
      await logPracticeSkip(userId, practice, stage);
      skipped.push(practice);
    }
  }
  
  return skipped;
}

/**
 * Categorize user's excuse text into a category
 */
export function categorizeExcuse(text: string): ExcuseCategory {
  const lower = text.toLowerCase();
  
  if (lower.includes('time') || lower.includes('busy') || lower.includes('schedule') || lower.includes('work')) {
    return 'time';
  }
  if (lower.includes('tired') || lower.includes('exhaust') || lower.includes('energy') || lower.includes('sleep')) {
    return 'energy';
  }
  if (lower.includes('motivation') || lower.includes('feel like') || lower.includes('want to') || lower.includes('why')) {
    return 'motivation';
  }
  if (lower.includes('happen') || lower.includes('life') || lower.includes('family') || lower.includes('emergency') || lower.includes('sick')) {
    return 'life_event';
  }
  if (lower.includes('forgot') || lower.includes('remember') || lower.includes('slipped')) {
    return 'forgot';
  }
  
  return 'other';
}

// ============================================
// EXPORTS FOR PATTERN SURFACING
// ============================================

/**
 * Get a formatted summary of patterns for display
 */
export async function getPatternSummary(userId: string): Promise<string | null> {
  const patterns = await detectResistancePatterns(userId, 7);
  
  if (patterns.length === 0) return null;
  
  const summaryParts: string[] = [];
  
  for (const pattern of patterns.slice(0, 3)) { // Top 3 patterns
    summaryParts.push(`• ${pattern.details}`);
  }
  
  return `**Resistance Patterns Detected:**\n${summaryParts.join('\n')}`;
}

/**
 * Check if we should surface a pattern intervention now
 */
export async function shouldSurfacePattern(userId: string): Promise<{
  should: boolean;
  pattern: ResistancePattern | null;
}> {
  const pattern = await getMostRelevantPattern(userId);
  
  if (!pattern) {
    return { should: false, pattern: null };
  }
  
  // Only surface patterns with 3+ occurrences
  if (pattern.count >= 3) {
    return { should: true, pattern };
  }
  
  return { should: false, pattern: null };
}
