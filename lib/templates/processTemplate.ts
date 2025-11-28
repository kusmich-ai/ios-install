// /lib/templates/processTemplate.ts
// Template variable replacement system

export interface TemplateContext {
  // ===========================================
  // FLAT PROPERTIES (preferred, simpler to use)
  // ===========================================
  
  // User info
  userName?: string;
  
  // Stage info
  currentStage?: number;
  stageName?: string;
  daysInStage?: number;
  
  // Progress metrics
  adherence?: number;
  consecutiveDays?: number;
  
  // REwired Index
  rewiredIndex?: number;
  statusTier?: string;
  
  // Domain scores (0-5)
  regulationScore?: number;
  awarenessScore?: number;
  outlookScore?: number;
  attentionScore?: number;
  
  // Delta tracking
  regulationDelta?: number;
  awarenessDelta?: number;
  outlookDelta?: number;
  attentionDelta?: number;
  avgDelta?: number;
  
  // Identity tracking (Stage 3+)
  currentIdentity?: string;
  microAction?: string;
  identityDayInCycle?: number;
  identityDaysRemaining?: number;
  
  // Platform
  isMobile?: boolean;
  toolsReference?: string;
  
  // Context-specific data (passed for specific templates)
  practiceId?: string;
  practiceName?: string;
  nextPractice?: string;
  nextPracticeName?: string;
  allComplete?: boolean;
  
  // ===========================================
  // NESTED PROPERTIES (backward compatibility)
  // ===========================================
  
  // User info (nested)
  user?: {
    id?: string;
    user_metadata?: {
      first_name?: string;
    };
    email?: string;
  };
  
  // Baseline data (nested)
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
  
  // Progress data (nested)
  progress?: {
    adherence_percentage?: number;
    consecutive_days?: number;
    stage_start_date?: string;
    current_stage?: number;
    practices_completed_today?: string[];
    latest_regulation_delta?: number;
    latest_awareness_delta?: number;
    latest_outlook_delta?: number;
    latest_attention_delta?: number;
    latest_avg_delta?: number;
    current_identity?: string;
    micro_action?: string;
    identity_sprint_start?: string;
  };
  
  // Weekly check-in results
  deltas?: {
    regulation: number;
    awareness: number;
    outlook: number;
    attention: number;
  };
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
  
  // Allow any additional properties for flexibility
  [key: string]: any;
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
  // Support both flat properties (preferred) and nested (backward compatible)
  const {
    // Flat properties
    userName,
    currentStage: flatCurrentStage,
    stageName: flatStageName,
    daysInStage: flatDaysInStage,
    adherence: flatAdherence,
    consecutiveDays: flatConsecutiveDays,
    rewiredIndex: flatRewiredIndex,
    statusTier,
    regulationScore: flatRegulationScore,
    awarenessScore: flatAwarenessScore,
    outlookScore: flatOutlookScore,
    attentionScore: flatAttentionScore,
    regulationDelta: flatRegulationDelta,
    awarenessDelta: flatAwarenessDelta,
    outlookDelta: flatOutlookDelta,
    attentionDelta: flatAttentionDelta,
    avgDelta: flatAvgDelta,
    currentIdentity: flatCurrentIdentity,
    microAction: flatMicroAction,
    identityDayInCycle: flatIdentityDayInCycle,
    identityDaysRemaining: flatIdentityDaysRemaining,
    isMobile,
    toolsReference,
    practiceId,
    practiceName,
    nextPractice,
    nextPracticeName,
    allComplete,
    
    // Nested properties (backward compatible)
    user,
    baselineData,
    progress,
    deltas,
    newScores,
    unlockCriteria,
    currentStatus
  } = context;

  // Resolve values: prefer flat, fall back to nested
  const resolvedUserName = userName || user?.user_metadata?.first_name || '';
  const resolvedCurrentStage = flatCurrentStage || baselineData?.currentStage || progress?.current_stage || 1;
  const resolvedStageName = flatStageName || getStageName(resolvedCurrentStage);
  const resolvedDaysInStage = flatDaysInStage || calculateDaysInStage(progress?.stage_start_date);
  const resolvedAdherence = flatAdherence ?? progress?.adherence_percentage ?? 0;
  const resolvedConsecutiveDays = flatConsecutiveDays ?? progress?.consecutive_days ?? 0;
  const resolvedRewiredIndex = flatRewiredIndex ?? baselineData?.rewiredIndex ?? 0;
  const resolvedTier = statusTier || baselineData?.tier || 'Baseline Mode';
  
  // Domain scores
  const resolvedRegulationScore = flatRegulationScore ?? baselineData?.domainScores?.regulation ?? 0;
  const resolvedAwarenessScore = flatAwarenessScore ?? baselineData?.domainScores?.awareness ?? 0;
  const resolvedOutlookScore = flatOutlookScore ?? baselineData?.domainScores?.outlook ?? 0;
  const resolvedAttentionScore = flatAttentionScore ?? baselineData?.domainScores?.attention ?? 0;
  
  // Deltas
  const resolvedRegulationDelta = flatRegulationDelta ?? deltas?.regulation ?? progress?.latest_regulation_delta;
  const resolvedAwarenessDelta = flatAwarenessDelta ?? deltas?.awareness ?? progress?.latest_awareness_delta;
  const resolvedOutlookDelta = flatOutlookDelta ?? deltas?.outlook ?? progress?.latest_outlook_delta;
  const resolvedAttentionDelta = flatAttentionDelta ?? deltas?.attention ?? progress?.latest_attention_delta;
  const resolvedAvgDelta = flatAvgDelta ?? progress?.latest_avg_delta;
  
  // Identity
  const resolvedCurrentIdentity = flatCurrentIdentity || progress?.current_identity || '[Identity not set]';
  const resolvedMicroAction = flatMicroAction || progress?.micro_action || '[Action not set]';
  const resolvedIdentityDaysRemaining = flatIdentityDaysRemaining ?? calculateIdentityDaysRemaining(progress?.identity_sprint_start);
  const resolvedIdentityDayInCycle = flatIdentityDayInCycle ?? calculateIdentityDayInCycle(progress?.identity_sprint_start);

  // Build variable map
  const variables: { [key: string]: string } = {
    // User info
    '{{userName}}': resolvedUserName,
    '{{userFirstName}}': resolvedUserName,
    
    // Stage info
    '{{currentStage}}': String(resolvedCurrentStage),
    '{{stageName}}': resolvedStageName,
    '{{daysInStage}}': String(resolvedDaysInStage),
    
    // Progress info
    '{{adherence}}': String(Math.round(resolvedAdherence)),
    '{{consecutiveDays}}': String(resolvedConsecutiveDays),
    '{{rewiredIndex}}': String(resolvedRewiredIndex),
    '{{tier}}': resolvedTier,
    '{{statusTier}}': resolvedTier,
    
    // Domain scores (current)
    '{{regulationScore}}': resolvedRegulationScore.toFixed(1),
    '{{awarenessScore}}': resolvedAwarenessScore.toFixed(1),
    '{{outlookScore}}': resolvedOutlookScore.toFixed(1),
    '{{attentionScore}}': resolvedAttentionScore.toFixed(1),
    
    // Deltas
    '{{regulationDelta}}': formatDelta(resolvedRegulationDelta),
    '{{awarenessDelta}}': formatDelta(resolvedAwarenessDelta),
    '{{outlookDelta}}': formatDelta(resolvedOutlookDelta),
    '{{attentionDelta}}': formatDelta(resolvedAttentionDelta),
    '{{avgDelta}}': formatDelta(resolvedAvgDelta),
    
    // New scores (from weekly check-in)
    '{{newRegulationScore}}': newScores?.regulation?.toFixed(1) || '0.0',
    '{{newAwarenessScore}}': newScores?.awareness?.toFixed(1) || '0.0',
    '{{newOutlookScore}}': newScores?.outlook?.toFixed(1) || '0.0',
    '{{newAttentionScore}}': newScores?.attention?.toFixed(1) || '0.0',
    
    // Identity (Stage 3+)
    '{{currentIdentity}}': resolvedCurrentIdentity,
    '{{microAction}}': resolvedMicroAction,
    '{{identityDaysRemaining}}': String(resolvedIdentityDaysRemaining),
    '{{identityDayInCycle}}': String(resolvedIdentityDayInCycle),
    
    // Platform-specific references
    '{{toolbarReference}}': toolsReference || (isMobile 
      ? 'lightning bolt icon at the bottom right' 
      : 'Daily Rituals toolbar on the right'),
    '{{toolsReference}}': toolsReference || (isMobile 
      ? 'lightning bolt icon at the bottom right' 
      : 'Daily Rituals toolbar on the right'),
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
    '{{currentAdherence}}': String(Math.round(currentStatus?.adherence || resolvedAdherence)),
    '{{currentAvgDelta}}': formatDelta(currentStatus?.avgDelta ?? resolvedAvgDelta),
    '{{currentConsecutiveDays}}': String(currentStatus?.consecutiveDays || resolvedConsecutiveDays),
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
