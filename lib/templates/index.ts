// /lib/templates/index.ts
// Main export file for the template system

// Core template processing
export { processTemplate, hasUnreplacedVariables, getUnreplacedVariables } from './processTemplate';
export type { TemplateContext } from './processTemplate';

// Template selection engine
export { 
  selectTemplate, 
  selectAndProcessTemplate,
  shouldUseTemplate,
  mightNeedAPIAfterTemplate
} from './selectTemplate';
export type { 
  TemplateTrigger, 
  TemplateTriggerType, 
  SelectionContext, 
  TemplateSelectionResult 
} from './selectTemplate';

// Template library with all template strings
export { 
  templateLibrary,
  practiceTemplates,
  stageTemplates,
  weeklyDeltaTemplates,
  toolTemplates,
  foundationTemplates,
  getStreakMessage,
  getNextPracticePrompt
} from './templateLibrary';

// Helper functions
export {
  // Stage info
  getStageName,
  getStageTagline,
  
  // Practices
  getPracticesForStage,
  getMorningPracticesForStage,
  getPracticeById,
  getNextPractice,
  areAllPracticesComplete,
  getRitualListForStage,
  getMorningRitualTime,
  
  // Unlock criteria
  getUnlockCriteriaForStage,
  checkUnlockEligibility,
  
  // Tools
  getToolsForStage,
  getToolById,
  isToolUnlocked,
  
  // Time helpers
  calculateDaysInStage,
  isWeeklyCheckInDue,
  getTimeOfDayGreeting,
  
  // Status
  getStatusTier,
  getStatusColor
} from './helpers';

export type { Practice, UnlockCriteria, Tool } from './helpers';

/ Voice library for scenario-based responses
export * from './voiceLibrary';
