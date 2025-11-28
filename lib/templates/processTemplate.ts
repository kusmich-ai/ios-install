// /lib/templates/processTemplate.ts
// Template variable replacement system

export interface TemplateContext {
  // User info
  user?: {
    id?: string;
    user_metadata?: {
      first_name?: string;
    };
    email?: string;
  };
  
  // Baseline data
  baselineData?: {
    rewiredIndex: number;
    tier: string;
    currentStage: number;
    domainScores: {
      regulation: number;
      awareness: number;
      outlook: number;
      attention: number;
    };
  };
  
  // Progress data
  progress?: {
    adherence_percentage?: number;
    consecutive_days?: number;
    stage_start_date?: string;
    current_stage?: number;
    practices_completed_today?: string[];
    // Delta tracking
    latest_regulation_delta?: number;
    latest_awareness_delta?: number;
    latest_outlook_delta?: number;
    latest_attention_delta?: number;
    latest_avg_delta?: number;
    // Identity tracking (Stage 3+)
    current_identity?: string;
    micro_action?: string;
    identity_sprint_start?: string;
  };
  
  // Platform
  isMobile?: boolean;
  
  // Context-specific data (passed for specific templates)
  practiceId?: string;
  practiceName?: string;
  nextPractice?: string;
  nextPracticeName?: string;
  
  // Weekly check-in results
  deltas?: {
    regulation: number;
    awareness: number;
    outlook: number;
    attention: number;
  };
  avgDelta?: number;
  newScores?: {
    regulation: number;
    awareness: number;
    outlook: number;
    attention: number;
  };
  
  // Unlock status
  unlockCriteria?: {
    adherenceThreshold: number;
    deltaThreshold: number;
    minimumDays: number;
  };
  currentStatus?: {
    adherence: number;
    avgDelta: number;
    consecutiveDays: number;
  };
}

// Stage name lookup
function getStageName(stage: number): string {
  const names: { [key: number]: string } = {
    1: 'Neural Priming',
    2: 'Embodied Awareness',
    3: 'Identity Mode',
    4: 'Flow Mode',
    5: 'Relational Coherence',
    6: 'Integration',
    7: 'Accelerated Expansion'
  };
  return names[stage] || `Stage ${stage}`;
}

// Calculate days in current stage
function calculateDaysInStage(stageStartDate?: string): number {
  if (!stageStartDate) return 1;
  const startDate = new Date(stageStartDate);
  const now = new Date();
  return Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

// Calculate identity days remaining (21-day cycle)
function calculateIdentityDaysRemaining(sprintStart?: string): number {
  if (!sprintStart) return 21;
  const startDate = new Date(sprintStart);
  const now = new Date();
  const daysPassed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, 21 - daysPassed);
}

// Calculate identity day in cycle (1-21)
function calculateIdentityDayInCycle(sprintStart?: string): number {
  if (!sprintStart) return 1;
  const startDate = new Date(sprintStart);
  const now = new Date();
  const daysPassed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(21, daysPassed + 1);
}

// Format delta with + or - sign
function formatDelta(delta?: number): string {
  if (delta === undefined || delta === null) return '+0.0';
  const sign = delta >= 0 ? '+' : '';
  return `${sign}${delta.toFixed(1)}`;
}

/**
 * Process a template string by replacing all {{variable}} placeholders
 * with their actual values from the context.
 */
export function processTemplate(template: string, context: TemplateContext): string {
  const {
    user,
    baselineData,
    progress,
    isMobile,
    practiceId,
    practiceName,
    nextPractice,
    nextPracticeName,
    deltas,
    avgDelta,
    newScores,
    unlockCriteria,
    currentStatus
  } = context;

  // Build variable map
  const variables: { [key: string]: string } = {
    // User info
    '{{userName}}': user?.user_metadata?.first_name || '',
    '{{userFirstName}}': user?.user_metadata?.first_name || '',
    
    // Stage info
    '{{currentStage}}': String(baselineData?.currentStage || progress?.current_stage || 1),
    '{{stageName}}': getStageName(baselineData?.currentStage || progress?.current_stage || 1),
    '{{daysInStage}}': String(calculateDaysInStage(progress?.stage_start_date)),
    
    // Progress info
    '{{adherence}}': String(Math.round(progress?.adherence_percentage || 0)),
    '{{consecutiveDays}}': String(progress?.consecutive_days || 0),
    '{{rewiredIndex}}': String(baselineData?.rewiredIndex || 0),
    '{{tier}}': baselineData?.tier || 'Baseline Mode',
    
    // Domain scores (current)
    '{{regulationScore}}': (baselineData?.domainScores?.regulation || 0).toFixed(1),
    '{{awarenessScore}}': (baselineData?.domainScores?.awareness || 0).toFixed(1),
    '{{outlookScore}}': (baselineData?.domainScores?.outlook || 0).toFixed(1),
    '{{attentionScore}}': (baselineData?.domainScores?.attention || 0).toFixed(1),
    
    // Deltas (from progress or passed in)
    '{{regulationDelta}}': formatDelta(deltas?.regulation ?? progress?.latest_regulation_delta),
    '{{awarenessDelta}}': formatDelta(deltas?.awareness ?? progress?.latest_awareness_delta),
    '{{outlookDelta}}': formatDelta(deltas?.outlook ?? progress?.latest_outlook_delta),
    '{{attentionDelta}}': formatDelta(deltas?.attention ?? progress?.latest_attention_delta),
    '{{avgDelta}}': formatDelta(avgDelta ?? progress?.latest_avg_delta),
    
    // New scores (from weekly check-in)
    '{{newRegulationScore}}': newScores?.regulation?.toFixed(1) || '0.0',
    '{{newAwarenessScore}}': newScores?.awareness?.toFixed(1) || '0.0',
    '{{newOutlookScore}}': newScores?.outlook?.toFixed(1) || '0.0',
    '{{newAttentionScore}}': newScores?.attention?.toFixed(1) || '0.0',
    
    // Identity (Stage 3+)
    '{{currentIdentity}}': progress?.current_identity || '[Identity not set]',
    '{{microAction}}': progress?.micro_action || '[Action not set]',
    '{{identityDaysRemaining}}': String(calculateIdentityDaysRemaining(progress?.identity_sprint_start)),
    '{{identityDayInCycle}}': String(calculateIdentityDayInCycle(progress?.identity_sprint_start)),
    
    // Platform-specific references
    '{{toolbarReference}}': isMobile 
      ? 'lightning bolt icon at the bottom right' 
      : 'Daily Rituals toolbar on the right',
    '{{dashboardReference}}': isMobile
      ? 'hamburger menu in the top left'
      : 'dashboard on the left',
    '{{desktopOrMobile}}': isMobile ? 'mobile' : 'desktop',
    
    // Practice-specific (when completing a practice)
    '{{practiceId}}': practiceId || '',
    '{{practiceName}}': practiceName || '',
    '{{nextPractice}}': nextPractice || '',
    '{{nextPracticeName}}': nextPracticeName || '',
    
    // Unlock criteria (when checking unlock eligibility)
    '{{adherenceThreshold}}': String(unlockCriteria?.adherenceThreshold || 80),
    '{{deltaThreshold}}': String(unlockCriteria?.deltaThreshold || 0.3),
    '{{minimumDays}}': String(unlockCriteria?.minimumDays || 14),
    '{{currentAdherence}}': String(Math.round(currentStatus?.adherence || 0)),
    '{{currentAvgDelta}}': formatDelta(currentStatus?.avgDelta),
    '{{currentConsecutiveDays}}': String(currentStatus?.consecutiveDays || 0),
  };

  // Replace all variables in template
  let result = template;
  for (const [variable, value] of Object.entries(variables)) {
    // Escape special regex characters in the variable name
    const escapedVariable = variable.replace(/[{}]/g, '\\$&');
    result = result.replace(new RegExp(escapedVariable, 'g'), value);
  }

  // Handle conditional blocks: {{#if condition}}...{{/if}}
  // Simple implementation - just removes the block markers for now
  // A more sophisticated version could evaluate conditions
  result = result.replace(/\{\{#if\s+\w+\}\}/g, '');
  result = result.replace(/\{\{\/if\}\}/g, '');

  // Clean up any remaining unreplaced variables (set to empty string)
  result = result.replace(/\{\{[^}]+\}\}/g, '');

  return result;
}

/**
 * Check if a template contains any unreplaced variables
 * Useful for debugging
 */
export function hasUnreplacedVariables(text: string): boolean {
  return /\{\{[^}]+\}\}/.test(text);
}

/**
 * Get list of all unreplaced variables in a template
 * Useful for debugging
 */
export function getUnreplacedVariables(text: string): string[] {
  const matches = text.match(/\{\{[^}]+\}\}/g);
  return matches ? [...new Set(matches)] : [];
}
