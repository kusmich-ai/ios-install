// /lib/templates/helpers.ts
// Utility functions for the template system

// ============================================
// STAGE INFORMATION
// ============================================

export function getStageName(stage: number): string {
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

export function getStageTagline(stage: number): string {
  const taglines: { [key: number]: string } = {
    1: 'Stabilize the signal. Teach your nervous system calm.',
    2: 'Bring awareness into motion.',
    3: 'Act from coherence.',
    4: 'Train sustained attention on performance drivers.',
    5: 'Train the nervous system to stay open in connection.',
    6: 'Convert insight into stable trait-level awareness.',
    7: 'Awareness engineers itself.'
  };
  return taglines[stage] || '';
}

// ============================================
// PRACTICES BY STAGE
// ============================================

export interface Practice {
  id: string;
  name: string;
  duration: string;
  timing: 'morning' | 'midday' | 'evening' | 'anytime';
  description: string;
  order: number; // Order within the morning sequence
}

const ALL_PRACTICES: Practice[] = [
  {
    id: 'hrvb',
    name: 'Resonance Breathing',
    duration: '5 mins',
    timing: 'morning',
    description: 'Heart rate variability training using 4s inhale, 6s exhale rhythm',
    order: 1
  },
  {
    id: 'awareness_rep',
    name: 'Awareness Rep',
    duration: '2 mins',
    timing: 'morning',
    description: 'Decentering practice to strengthen meta-awareness',
    order: 2
  },
  {
    id: 'somatic_flow',
    name: 'Somatic Flow',
    duration: '3 mins',
    timing: 'morning',
    description: 'Cat-Cow and Squat-to-Reach movements synced with breath',
    order: 3
  },
  {
    id: 'micro_action',
    name: 'Morning Micro-Action',
    duration: '2-3 mins',
    timing: 'morning',
    description: 'One small daily action proving your chosen identity',
    order: 4
  },
  {
    id: 'flow_block',
    name: 'Flow Block',
    duration: '60-90 mins',
    timing: 'midday',
    description: 'Single-task deep work session',
    order: 5
  },
  {
    id: 'co_regulation',
    name: 'Co-Regulation Practice',
    duration: '3-5 mins',
    timing: 'evening',
    description: 'Compassion practice to train the social nervous system',
    order: 6
  },
  {
    id: 'nightly_debrief',
    name: 'Nightly Debrief',
    duration: '2 mins',
    timing: 'evening',
    description: 'Reflection: "What did reality teach me today?"',
    order: 7
  }
];

// Which practices are available at each stage
const STAGE_PRACTICES: { [stage: number]: string[] } = {
  1: ['hrvb', 'awareness_rep'],
  2: ['hrvb', 'somatic_flow', 'awareness_rep'],
  3: ['hrvb', 'somatic_flow', 'awareness_rep', 'micro_action'],
  4: ['hrvb', 'somatic_flow', 'awareness_rep', 'micro_action', 'flow_block'],
  5: ['hrvb', 'somatic_flow', 'awareness_rep', 'micro_action', 'flow_block', 'co_regulation'],
  6: ['hrvb', 'somatic_flow', 'awareness_rep', 'micro_action', 'flow_block', 'co_regulation', 'nightly_debrief'],
  7: ['hrvb', 'somatic_flow', 'awareness_rep', 'micro_action', 'flow_block', 'co_regulation', 'nightly_debrief']
};

/**
 * Get all practices for a given stage, sorted by order
 */
export function getPracticesForStage(stage: number): Practice[] {
  const practiceIds = STAGE_PRACTICES[stage] || STAGE_PRACTICES[1];
  return ALL_PRACTICES
    .filter(p => practiceIds.includes(p.id))
    .sort((a, b) => a.order - b.order);
}

/**
 * Get morning practices for a stage (for daily ritual sequence)
 */
export function getMorningPracticesForStage(stage: number): Practice[] {
  return getPracticesForStage(stage).filter(p => p.timing === 'morning');
}

/**
 * Get a single practice by ID
 */
export function getPracticeById(practiceId: string): Practice | undefined {
  return ALL_PRACTICES.find(p => p.id === practiceId);
}

/**
 * Get the next practice after completing one
 */
export function getNextPractice(
  currentPracticeId: string,
  stage: number,
  completedToday: string[]
): Practice | null {
  const stagePractices = getPracticesForStage(stage);
  const currentIndex = stagePractices.findIndex(p => p.id === currentPracticeId);
  
  // Look for next incomplete practice after current one
  for (let i = currentIndex + 1; i < stagePractices.length; i++) {
    if (!completedToday.includes(stagePractices[i].id)) {
      return stagePractices[i];
    }
  }
  
  // If nothing after, check if any before current are incomplete (in case they did out of order)
  for (let i = 0; i < currentIndex; i++) {
    if (!completedToday.includes(stagePractices[i].id)) {
      return stagePractices[i];
    }
  }
  
  return null; // All complete
}

/**
 * Check if all practices for today are complete
 */
export function areAllPracticesComplete(stage: number, completedToday: string[]): boolean {
  const stagePractices = getPracticesForStage(stage);
  return stagePractices.every(p => completedToday.includes(p.id));
}

/**
 * Get formatted ritual list for a stage (used in opening messages)
 */
export function getRitualListForStage(stage: number): string {
  const practices = getPracticesForStage(stage);
  return practices
    .map((p, i) => `${i + 1}. **${p.name}** - ${p.duration}`)
    .join('\n');
}

/**
 * Get total time for morning rituals
 */
export function getMorningRitualTime(stage: number): string {
  const times: { [stage: number]: string } = {
    1: '7 minutes',
    2: '10 minutes',
    3: '12-13 minutes',
    4: '12-13 minutes morning + Flow Block',
    5: '12-13 minutes morning + Flow Block + evening practice',
    6: '12-13 minutes morning + Flow Block + evening practices',
    7: 'Custom schedule'
  };
  return times[stage] || times[1];
}

// ============================================
// UNLOCK CRITERIA
// ============================================

export interface UnlockCriteria {
  adherenceThreshold: number;  // Percentage (0-100)
  deltaThreshold: number;      // Average delta improvement required
  minimumDays: number;         // Minimum consecutive days
  qualitativeMarkers?: string[]; // Optional qualitative requirements
}

const UNLOCK_CRITERIA: { [stage: number]: UnlockCriteria } = {
  1: {
    adherenceThreshold: 80,
    deltaThreshold: 0.3,
    minimumDays: 14,
    qualitativeMarkers: ['Average calm rating ≥ 3/5']
  },
  2: {
    adherenceThreshold: 80,
    deltaThreshold: 0.5,
    minimumDays: 14,
    qualitativeMarkers: ['Felt-sense rating ≥ 3/5', 'Reports awareness remains through movement']
  },
  3: {
    adherenceThreshold: 80,
    deltaThreshold: 0.5,
    minimumDays: 14,
    qualitativeMarkers: ['Decreased emotional reactivity', 'Clear identity articulation']
  },
  4: {
    adherenceThreshold: 80,
    deltaThreshold: 0.6,
    minimumDays: 14,
    qualitativeMarkers: []
  },
  5: {
    adherenceThreshold: 85,
    deltaThreshold: 0.7,
    minimumDays: 14,
    qualitativeMarkers: []
  },
  6: {
    adherenceThreshold: 85,
    deltaThreshold: 0.7,
    minimumDays: 14,
    qualitativeMarkers: ['Manual review required', 'Application submission']
  },
  7: {
    adherenceThreshold: 0, // Manual only
    deltaThreshold: 0,
    minimumDays: 0,
    qualitativeMarkers: ['Manual unlock only', 'Live conversation required']
  }
};

/**
 * Get unlock criteria for advancing FROM a stage to the next
 */
export function getUnlockCriteriaForStage(stage: number): UnlockCriteria {
  return UNLOCK_CRITERIA[stage] || UNLOCK_CRITERIA[1];
}

/**
 * Check if user meets unlock criteria
 */
export function checkUnlockEligibility(
  stage: number,
  adherence: number,
  avgDelta: number,
  consecutiveDays: number
): { eligible: boolean; missing: string[] } {
  const criteria = getUnlockCriteriaForStage(stage);
  const missing: string[] = [];
  
  // Stage 6 and 7 require manual review
  if (stage >= 6) {
    return { eligible: false, missing: ['Manual review required'] };
  }
  
  if (adherence < criteria.adherenceThreshold) {
    missing.push(`Adherence: ${adherence.toFixed(0)}% (need ${criteria.adherenceThreshold}%)`);
  }
  
  if (avgDelta < criteria.deltaThreshold) {
    missing.push(`Avg Delta: ${avgDelta >= 0 ? '+' : ''}${avgDelta.toFixed(2)} (need +${criteria.deltaThreshold})`);
  }
  
  if (consecutiveDays < criteria.minimumDays) {
    missing.push(`Days: ${consecutiveDays} (need ${criteria.minimumDays})`);
  }
  
  return {
    eligible: missing.length === 0,
    missing
  };
}

// ============================================
// ON-DEMAND TOOLS
// ============================================

export interface Tool {
  id: string;
  name: string;
  description: string;
  unlockedAtStage: number;
  duration: string;
}

const ON_DEMAND_TOOLS: Tool[] = [
  {
    id: 'decentering',
    name: 'Decentering Practice',
    description: 'Recognize thoughts, emotions, and identities as objects within awareness',
    unlockedAtStage: 1,
    duration: '2-5 mins'
  },
  {
    id: 'reframe',
    name: 'Reframe Protocol',
    description: 'Interpret and recode the meaning of triggering experiences',
    unlockedAtStage: 3,
    duration: '5-10 mins'
  },
  {
    id: 'thought_hygiene',
    name: 'Thought Hygiene',
    description: 'Clear cognitive residue and reset after heavy mental load',
    unlockedAtStage: 4,
    duration: '2-3 mins'
  },
  {
    id: 'meta_reflection',
    name: 'Meta-Reflection',
    description: 'Weekly practice to deepen self-inquiry and integrate insights',
    unlockedAtStage: 2,
    duration: '5-10 mins'
  }
];

/**
 * Get tools available at a given stage
 */
export function getToolsForStage(stage: number): Tool[] {
  return ON_DEMAND_TOOLS.filter(t => t.unlockedAtStage <= stage);
}

/**
 * Get a tool by ID
 */
export function getToolById(toolId: string): Tool | undefined {
  return ON_DEMAND_TOOLS.find(t => t.id === toolId);
}

/**
 * Check if a tool is unlocked for a stage
 */
export function isToolUnlocked(toolId: string, stage: number): boolean {
  const tool = getToolById(toolId);
  return tool ? tool.unlockedAtStage <= stage : false;
}

// ============================================
// TIME & DATE HELPERS
// ============================================

/**
 * Calculate days in current stage
 */
export function calculateDaysInStage(stageStartDate?: string): number {
  if (!stageStartDate) return 1;
  const startDate = new Date(stageStartDate);
  const now = new Date();
  return Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Check if it's a new week (for weekly check-in)
 * Returns true if today is Sunday or if 7 days have passed since last check-in
 */
export function isWeeklyCheckInDue(lastCheckIn?: string): boolean {
  const today = new Date();
  
  // Option 1: It's Sunday
  if (today.getDay() === 0) {
    // Check if we already did it today
    if (lastCheckIn) {
      const lastDate = new Date(lastCheckIn);
      const isSameDay = 
        lastDate.getFullYear() === today.getFullYear() &&
        lastDate.getMonth() === today.getMonth() &&
        lastDate.getDate() === today.getDate();
      if (isSameDay) return false;
    }
    return true;
  }
  
  // Option 2: 7+ days since last check-in
  if (lastCheckIn) {
    const lastDate = new Date(lastCheckIn);
    const daysSince = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSince >= 7;
  }
  
  return false;
}

/**
 * Get greeting based on time of day
 */
export function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

// ============================================
// STATUS TIERS
// ============================================

export function getStatusTier(rewiredIndex: number): string {
  if (rewiredIndex <= 20) return 'System Offline';
  if (rewiredIndex <= 40) return 'Baseline Mode';
  if (rewiredIndex <= 60) return 'Operational';
  if (rewiredIndex <= 80) return 'Optimized';
  return 'Integrated';
}

export function getStatusColor(rewiredIndex: number): string {
  if (rewiredIndex <= 20) return 'text-red-400';
  if (rewiredIndex <= 40) return 'text-yellow-400';
  if (rewiredIndex <= 60) return 'text-blue-400';
  if (rewiredIndex <= 80) return 'text-green-400';
  return 'text-purple-400';
}
