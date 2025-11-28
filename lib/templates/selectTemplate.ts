// /lib/templates/selectTemplate.ts
// Template selection logic - decides which template to use based on context

import { templateLibrary, getNextPracticePrompt } from './templateLibrary';
import { 
  getPracticesForStage, 
  getNextPractice, 
  areAllPracticesComplete,
  getPracticeById,
  isToolUnlocked,
  getToolById
} from './helpers';
import { processTemplate, TemplateContext } from './processTemplate';

// ============================================
// TEMPLATE TRIGGER TYPES
// ============================================

export type TemplateTriggerType = 
  | 'practice_click'      // User clicked to start a practice
  | 'practice_completed'  // User marked a practice as done
  | 'tool_click'          // User clicked an on-demand tool
  | 'stage_intro'         // New stage intro needed
  | 'daily_prompt'        // Daily opening message
  | 'weekly_check_in'     // Weekly delta check-in
  | 'stage_unlock_check'  // Check unlock eligibility
  | 'identity_needed'     // Identity sprint needs setup
  | 'flow_block_setup';   // Flow block system needs setup

export interface TemplateTrigger {
  type: TemplateTriggerType;
  practiceId?: string;
  practiceName?: string;
  toolId?: string;
  stage?: number;
}

// ============================================
// SELECTION CONTEXT
// ============================================

export interface SelectionContext {
  // Current state
  currentStage: number;
  daysInStage: number;
  
  // Progress
  adherence: number;
  consecutiveDays: number;
  
  // Today's status
  practicesCompletedToday: string[];
  
  // Stage intro status
  stageIntroCompleted: boolean;
  
  // Identity (Stage 3+)
  hasIdentitySet: boolean;
  identityDayInCycle?: number;
  
  // Flow Block (Stage 4+)
  flowBlockSetupCompleted: boolean;
  
  // Tool intro tracking
  toolsIntroduced: string[];
  
  // Weekly check-in
  weeklyCheckInDue: boolean;
  
  // Platform
  isMobile: boolean;
}

// ============================================
// TEMPLATE SELECTION RESULT
// ============================================

export interface TemplateSelectionResult {
  // The selected template (null means use API)
  template: string | null;
  
  // Whether this template needs processing
  needsProcessing: boolean;
  
  // Additional context to pass to processTemplate
  additionalContext?: Record<string, any>;
  
  // If there's a follow-up action needed
  followUpAction?: 'show_quick_reply' | 'wait_for_input' | 'trigger_api';
  
  // Quick reply button config (if applicable)
  quickReply?: {
    buttonLabel: string;
    nextTrigger: TemplateTrigger;
  };
}

// ============================================
// MAIN SELECTION FUNCTION
// ============================================

/**
 * Select the appropriate template based on trigger and context.
 * Returns null for template if API should be used instead.
 */
export function selectTemplate(
  trigger: TemplateTrigger,
  context: SelectionContext
): TemplateSelectionResult {
  
  switch (trigger.type) {
    
    // ----------------------------------------
    // PRACTICE CLICK - User wants to start a practice
    // ----------------------------------------
    case 'practice_click':
      return selectPracticeStartTemplate(trigger, context);
    
    // ----------------------------------------
    // PRACTICE COMPLETED - User marked practice done
    // ----------------------------------------
    case 'practice_completed':
      return selectPracticeCompletionTemplate(trigger, context);
    
    // ----------------------------------------
    // TOOL CLICK - User clicked an on-demand tool
    // ----------------------------------------
    case 'tool_click':
      return selectToolTemplate(trigger, context);
    
    // ----------------------------------------
    // STAGE INTRO - New stage needs introduction
    // ----------------------------------------
    case 'stage_intro':
      return selectStageIntroTemplate(trigger, context);
    
    // ----------------------------------------
    // DAILY PROMPT - Opening message for the day
    // ----------------------------------------
    case 'daily_prompt':
      return selectDailyPromptTemplate(trigger, context);
    
    // ----------------------------------------
    // WEEKLY CHECK-IN
    // ----------------------------------------
    case 'weekly_check_in':
      return {
        template: templateLibrary.weeklyDelta.checkInPrompt,
        needsProcessing: true,
        followUpAction: 'wait_for_input'
      };
    
    // ----------------------------------------
    // STAGE UNLOCK CHECK
    // ----------------------------------------
    case 'stage_unlock_check':
      return selectUnlockTemplate(trigger, context);
    
    // ----------------------------------------
    // IDENTITY NEEDED (Stage 3+)
    // ----------------------------------------
    case 'identity_needed':
      return {
        template: templateLibrary.practices.micro_action.identityNeeded,
        needsProcessing: true,
        followUpAction: 'wait_for_input'
      };
    
    // ----------------------------------------
    // FLOW BLOCK SETUP NEEDED (Stage 4+)
    // ----------------------------------------
    case 'flow_block_setup':
      return {
        template: templateLibrary.practices.flow_block.setupNeeded,
        needsProcessing: true,
        followUpAction: 'wait_for_input'
      };
    
    // ----------------------------------------
    // DEFAULT - Use API
    // ----------------------------------------
    default:
      return {
        template: null,
        needsProcessing: false,
        followUpAction: 'trigger_api'
      };
  }
}

// ============================================
// PRACTICE START TEMPLATE SELECTION
// ============================================

function selectPracticeStartTemplate(
  trigger: TemplateTrigger,
  context: SelectionContext
): TemplateSelectionResult {
  const practiceId = trigger.practiceId;
  
  if (!practiceId) {
    return { template: null, needsProcessing: false };
  }
  
  // Special case: Micro Action needs identity set first
  if (practiceId === 'micro_action' && !context.hasIdentitySet) {
    return {
      template: templateLibrary.practices.micro_action.identityNeeded,
      needsProcessing: true,
      followUpAction: 'wait_for_input'
    };
  }
  
  // Special case: Flow Block needs setup first
  if (practiceId === 'flow_block' && !context.flowBlockSetupCompleted) {
    return {
      template: templateLibrary.practices.flow_block.setupNeeded,
      needsProcessing: true,
      followUpAction: 'wait_for_input'
    };
  }
  
  // Get the practice template
  const practiceTemplates = templateLibrary.practices[practiceId as keyof typeof templateLibrary.practices];
  
  if (!practiceTemplates || !practiceTemplates.startPrompt) {
    // No template for this practice - use API
    return { template: null, needsProcessing: false, followUpAction: 'trigger_api' };
  }
  
  return {
    template: practiceTemplates.startPrompt,
    needsProcessing: true,
    followUpAction: 'wait_for_input'
  };
}

// ============================================
// PRACTICE COMPLETION TEMPLATE SELECTION
// ============================================

function selectPracticeCompletionTemplate(
  trigger: TemplateTrigger,
  context: SelectionContext
): TemplateSelectionResult {
  const practiceId = trigger.practiceId;
  
  if (!practiceId) {
    return { template: null, needsProcessing: false };
  }
  
  // Get the practice template
  const practiceTemplates = templateLibrary.practices[practiceId as keyof typeof templateLibrary.practices];
  
  if (!practiceTemplates || !practiceTemplates.completionResponse) {
    return { template: null, needsProcessing: false, followUpAction: 'trigger_api' };
  }
  
  // Determine what's next
  const completedToday = [...context.practicesCompletedToday, practiceId];
  const allComplete = areAllPracticesComplete(context.currentStage, completedToday);
  const nextPractice = getNextPractice(practiceId, context.currentStage, completedToday);
  
  // Generate the next practice prompt
  const nextPracticePrompt = getNextPracticePrompt(
    nextPractice ? { id: nextPractice.id, name: nextPractice.name } : null,
    allComplete
  );
  
  // Replace the {{nextPracticePrompt}} in the completion response
  let template = practiceTemplates.completionResponse;
  template = template.replace('{{nextPracticePrompt}}', nextPracticePrompt);
  
  return {
    template,
    needsProcessing: true,
    additionalContext: {
      nextPractice: nextPractice?.id || '',
      nextPracticeName: nextPractice?.name || '',
      allComplete
    }
  };
}

// ============================================
// TOOL TEMPLATE SELECTION
// ============================================

function selectToolTemplate(
  trigger: TemplateTrigger,
  context: SelectionContext
): TemplateSelectionResult {
  const toolId = trigger.toolId;
  
  if (!toolId) {
    return { template: null, needsProcessing: false };
  }
  
  // Check if tool is unlocked for this stage
  if (!isToolUnlocked(toolId, context.currentStage)) {
    return {
      template: `This tool unlocks at a later stage. Keep progressing through your current practices.`,
      needsProcessing: false
    };
  }
  
  const toolTemplates = templateLibrary.tools[toolId as keyof typeof templateLibrary.tools];
  
  if (!toolTemplates) {
    return { template: null, needsProcessing: false, followUpAction: 'trigger_api' };
  }
  
  // Check if tool has been introduced before
  const hasBeenIntroduced = context.toolsIntroduced.includes(toolId);
  
  if (!hasBeenIntroduced && toolTemplates.unlockIntro) {
    // First time - show introduction
    return {
      template: toolTemplates.unlockIntro,
      needsProcessing: true,
      additionalContext: {
        markToolIntroduced: toolId
      },
      followUpAction: 'wait_for_input',
      quickReply: {
        buttonLabel: 'Start Now',
        nextTrigger: { type: 'tool_click', toolId }
      }
    };
  }
  
  // Tool already introduced - show start prompt, then hand to API
  // Most tools need dynamic API execution after the intro
  if (toolTemplates.startPrompt) {
    return {
      template: toolTemplates.startPrompt,
      needsProcessing: true,
      followUpAction: 'wait_for_input' // Wait for user response, then API takes over
    };
  }
  
  // No template - use API directly
  return { template: null, needsProcessing: false, followUpAction: 'trigger_api' };
}

// ============================================
// STAGE INTRO TEMPLATE SELECTION
// ============================================

function selectStageIntroTemplate(
  trigger: TemplateTrigger,
  context: SelectionContext
): TemplateSelectionResult {
  const stage = trigger.stage || context.currentStage;
  const stageTemplates = templateLibrary.stages[stage as keyof typeof templateLibrary.stages];
  
  if (!stageTemplates || !stageTemplates.ritualIntro) {
    return { template: null, needsProcessing: false };
  }
  
  return {
    template: stageTemplates.ritualIntro.intro,
    needsProcessing: true,
    followUpAction: 'show_quick_reply',
    quickReply: {
      buttonLabel: "Yes, let's learn the rituals",
      nextTrigger: { type: 'stage_intro', stage }
    }
  };
}

// ============================================
// DAILY PROMPT TEMPLATE SELECTION
// ============================================

function selectDailyPromptTemplate(
  trigger: TemplateTrigger,
  context: SelectionContext
): TemplateSelectionResult {
  const stage = context.currentStage;
  const stageTemplates = templateLibrary.stages[stage as keyof typeof templateLibrary.stages];
  
  if (!stageTemplates || !stageTemplates.dailyPrompts) {
    return { template: null, needsProcessing: false };
  }
  
  // Determine which daily prompt to use
  let template: string;
  
  // Use type assertion since not all stages have firstDay defined
  const dailyPrompts = stageTemplates.dailyPrompts as { 
    firstDay?: string; 
    standard: string; 
    allComplete: string;
  };
  
  if (context.daysInStage === 1 && dailyPrompts.firstDay) {
    template = dailyPrompts.firstDay;
  } else {
    template = dailyPrompts.standard;
  }
  
  // Add streak message
  const streakMessage = templateLibrary.getStreakMessage(
    context.consecutiveDays,
    context.adherence
  );
  
  return {
    template,
    needsProcessing: true,
    additionalContext: {
      streakMessage,
      greeting: getGreeting()
    }
  };
}

// ============================================
// UNLOCK TEMPLATE SELECTION
// ============================================

function selectUnlockTemplate(
  trigger: TemplateTrigger,
  context: SelectionContext
): TemplateSelectionResult {
  const stage = context.currentStage;
  const stageTemplates = templateLibrary.stages[stage as keyof typeof templateLibrary.stages];
  
  if (!stageTemplates || !stageTemplates.unlock) {
    return { template: null, needsProcessing: false };
  }
  
  // This would typically check unlock eligibility
  // For now, return the "not yet" template
  // The actual eligibility check happens in ChatInterface
  
  return {
    template: stageTemplates.unlock.notYet,
    needsProcessing: true
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Select and process a template in one call.
 * Returns the processed template string or null if API should be used.
 */
export function selectAndProcessTemplate(
  trigger: TemplateTrigger,
  selectionContext: SelectionContext,
  templateContext: TemplateContext
): { 
  content: string | null; 
  result: TemplateSelectionResult;
} {
  const result = selectTemplate(trigger, selectionContext);
  
  if (!result.template) {
    return { content: null, result };
  }
  
  // Merge additional context
  const mergedContext = {
    ...templateContext,
    ...result.additionalContext
  };
  
  const content = result.needsProcessing 
    ? processTemplate(result.template, mergedContext)
    : result.template;
  
  return { content, result };
}

/**
 * Check if a trigger type should use templates or API
 */
export function shouldUseTemplate(triggerType: TemplateTriggerType): boolean {
  // These always use templates
  const templateOnlyTriggers: TemplateTriggerType[] = [
    'practice_click',
    'practice_completed',
    'daily_prompt',
    'weekly_check_in',
    'stage_unlock_check',
    'identity_needed',
    'flow_block_setup'
  ];
  
  return templateOnlyTriggers.includes(triggerType);
}

/**
 * Check if a trigger type might need API after template
 */
export function mightNeedAPIAfterTemplate(triggerType: TemplateTriggerType): boolean {
  // These show a template first, then might need API
  const hybridTriggers: TemplateTriggerType[] = [
    'tool_click', // Tools need API for dynamic execution
    'stage_intro' // Complex intro flows might need API for questions
  ];
  
  return hybridTriggers.includes(triggerType);
}
