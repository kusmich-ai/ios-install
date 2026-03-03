export interface Practice {
  id: string;
  name: string;
  shortName: string;
  duration: number; // in minutes
  icon: string;
  description: string;
}

export interface Stage {
  number: number;
  name: string;
  tagline: string;
  practices: Practice[];
  unlockCriteria: {
    adherence: number; // percentage
    days: number;
    deltaThreshold: number;
    additionalConditions?: string[];
  };
}

export const STAGES: Stage[] = [
  {
    number: 1,
    name: 'Neural Priming',
    tagline: 'Stabilize the signal. Teach your nervous system calm coherence.',
    practices: [
      {
        id: 'hrvb',
        name: 'Resonance Breathing',
        shortName: 'Resonance',
        duration: 5,
        icon: '🫁',
        description: 'Builds vagal tone, coherence, and autonomic balance'
      },
      {
        id: 'awareness_rep',
        name: 'Awareness Rep',
        shortName: 'Awareness',
        duration: 2,
        icon: '👁️',
        description: 'Anchors nervous system in awareness, not reactivity'
      }
    ],
    unlockCriteria: {
      adherence: 80,
      days: 14,
      deltaThreshold: 0.3
    }
  },
  {
    number: 2,
    name: 'Embodied Awareness',
    tagline: 'Bring awareness into motion.',
    practices: [
      {
        id: 'hrvb',
        name: 'Resonance Breathing',
        shortName: 'Resonance',
        duration: 5,
        icon: '🫁',
        description: 'Builds vagal tone'
      },
      {
        id: 'somatic_flow',
        name: 'Somatic Flow',
        shortName: 'Somatic',
        duration: 2,
        icon: '🧘',
        description: 'Flow movements with breath'
      },
      {
        id: 'awareness_rep',
        name: 'Awareness Rep',
        shortName: 'Awareness',
        duration: 2,
        icon: '👁️',
        description: 'Meta-awareness training'
      }
    ],
    unlockCriteria: {
      adherence: 80,
      days: 14,
      deltaThreshold: 0.5
    }
  },
  {
    number: 3,
    name: 'Cue Training',
    tagline: 'Catch patterns before they become you.',
    practices: [
      {
        id: 'hrvb',
        name: 'Resonance Breathing',
        shortName: 'Resonance',
        duration: 5,
        icon: '🫁',
        description: 'Builds vagal tone'
      },
      {
        id: 'somatic_flow',
        name: 'Somatic Flow',
        shortName: 'Somatic',
        duration: 2,
        icon: '🧘',
        description: 'Movement with breath'
      },
      {
        id: 'awareness_rep',
        name: 'Awareness Rep',
        shortName: 'Awareness',
        duration: 2,
        icon: '👁️',
        description: 'Meta-awareness training'
      },
      {
        id: 'micro_action',
        name: 'IOS Cue',
        shortName: 'Cue',
        duration: 2,
        icon: '⚡',
        description: 'RAS detection training'
      }
    ],
    unlockCriteria: {
      adherence: 80,
      days: 14,
      deltaThreshold: 0.5
    }
  },
  {
    number: 4,
    name: 'Flow Mode',
    tagline: 'Train sustained attention on performance drivers.',
    practices: [
      {
        id: 'hrvb',
        name: 'Resonance Breathing',
        shortName: 'Resonance',
        duration: 5,
        icon: '🫁',
        description: 'Builds vagal tone'
      },
      {
        id: 'somatic_flow',
        name: 'Somatic Flow',
        shortName: 'Somatic',
        duration: 2,
        icon: '🧘',
        description: 'Movement with breath'
      },
      {
        id: 'awareness_rep',
        name: 'Awareness Rep',
        shortName: 'Awareness',
        duration: 2,
        icon: '👁️',
        description: 'Meta-awareness training'
      },
      {
        id: 'micro_action',
        name: 'IOS Cue',
        shortName: 'Cue',
        duration: 2,
        icon: '⚡',
        description: 'RAS detection training'
      },
      {
        id: 'flow_block',
        name: 'Flow Block',
        shortName: 'Flow',
        duration: 60,
        icon: '🎯',
        description: 'Deep work session'
      }
    ],
    unlockCriteria: {
      adherence: 80,
      days: 14,
      deltaThreshold: 0.6
    }
  },
  {
    number: 5,
    name: 'Relational Coherence',
    tagline: 'Train the nervous system to stay open in connection.',
    practices: [
      {
        id: 'hrvb',
        name: 'Resonance Breathing',
        shortName: 'Resonance',
        duration: 5,
        icon: '🫁',
        description: 'Builds vagal tone'
      },
      {
        id: 'somatic_flow',
        name: 'Somatic Flow',
        shortName: 'Somatic',
        duration: 2,
        icon: '🧘',
        description: 'Movement with breath'
      },
      {
        id: 'awareness_rep',
        name: 'Awareness Rep',
        shortName: 'Awareness',
        duration: 2,
        icon: '👁️',
        description: 'Meta-awareness training'
      },
      {
        id: 'micro_action',
        name: 'IOS Cue',
        shortName: 'Cue',
        duration: 2,
        icon: '⚡',
        description: 'RAS detection training'
      },
      {
        id: 'flow_block',
        name: 'Flow Block',
        shortName: 'Flow',
        duration: 60,
        icon: '🎯',
        description: 'Deep work session'
      },
      {
        id: 'co_regulation',
        name: 'Intrapersonal Co-Regulation',
        shortName: 'Co-Reg',
        duration: 2,
        icon: '💞',
        description: 'Compassion practice'
      }
    ],
    unlockCriteria: {
      adherence: 85,
      days: 14,
      deltaThreshold: 0.7
    }
  },
  {
    number: 6,
    name: 'Integration',
    tagline: 'Convert insight into stable trait-level awareness.',
    practices: [
      {
        id: 'hrvb',
        name: 'Resonance Breathing',
        shortName: 'Resonance',
        duration: 5,
        icon: '🫁',
        description: 'Builds vagal tone'
      },
      {
        id: 'somatic_flow',
        name: 'Somatic Flow',
        shortName: 'Somatic',
        duration: 2,
        icon: '🧘',
        description: 'Movement with breath'
      },
      {
        id: 'awareness_rep',
        name: 'Awareness Rep',
        shortName: 'Awareness',
        duration: 2,
        icon: '👁️',
        description: 'Meta-awareness training'
      },
      {
        id: 'micro_action',
        name: 'IOS Cue',
        shortName: 'Cue',
        duration: 2,
        icon: '⚡',
        description: 'RAS detection training'
      },
      {
        id: 'flow_block',
        name: 'Flow Block',
        shortName: 'Flow',
        duration: 60,
        icon: '🎯',
        description: 'Deep work session'
      },
      {
        id: 'co_regulation',
        name: 'Intrapersonal Co-Regulation',
        shortName: 'Co-Reg',
        duration: 2,
        icon: '💞',
        description: 'Compassion practice'
      },
      {
        id: 'nightly_debrief',
        name: 'Nightly Debrief',
        shortName: 'Debrief',
        duration: 2,
        icon: '🌙',
        description: 'Daily integration'
      }
    ],
    unlockCriteria: {
      adherence: 85,
      days: 14,
      deltaThreshold: 0.7
    }
  },
  {
    number: 7,
    name: 'Accelerated Expansion',
    tagline: 'Awareness engineers itself.',
    practices: [], // Stage 7 is custom/supervised
    unlockCriteria: {
      adherence: 85,
      days: 21,
      deltaThreshold: 0.8
    }
  }
];

export const ON_DEMAND_TOOLS = [
  {
    id: 'decentering',
    name: 'Decentering Practice',
    shortName: 'Decenter',
    icon: '💭',
    description: 'Helps you relate differently to thoughts, emotions, and roles — without trying to change or fix them.',
    when: 'When you notice yourself getting caught up in a thought, emotion, role',
    unlockedAt: 1
  },
  {
    id: 'nos_glide',
    name: 'NOS Glide',
    shortName: 'Glide',
    icon: '🌊',
    description: 'Physiological transition sequence that guides your nervous system from daytime activation into parasympathetic rest.',
    when: 'When your system won\'t shut off at night — racing mind, restless body, "wired but tired"',
    unlockedAt: 1
  },
  {
    id: 'worry_loop_dissolver',
    name: 'Worry Loop Dissolver',
    shortName: 'Loop',
    icon: '🔄',
    description: 'Collapse worry loops (rumination, catastrophizing, anticipatory anxiety) so thinking becomes clear again.',
    when: 'When the same concern keeps re-forming as a story',
    unlockedAt: 1
  },
  {
    id: 'meta_reflection',
    name: 'Meta-Reflection',
    shortName: 'Meta',
    icon: '📊',
    description: 'Helps you look back and see where you got caught in stories about events.',
    when: 'When reflecting on the week or after a meaningful shift',
    unlockedAt: 2
  },
  {
    id: 'reframe',
    name: 'Reframe Protocol',
    shortName: 'Reframe',
    icon: '🔀',
    description: '2-minute interpretation audit that separates what actually happened from what the mind added.',
    when: 'When a situation feels sticky, charged, or personal',
    unlockedAt: 3
  },
  {
    id: 'thought_hygiene',
    name: 'MOS Dump (Thought Hygiene)',
    shortName: 'Hygiene',
    icon: '🧠',
    description: 'For clearing cognitive residue after heavy mental load.',
    when: 'When the mind feels busy after effort or focus blocks',
    unlockedAt: 4
  }
];

// ============================================
// PRACTICE SCHEDULE CONFIG
// ============================================
// Defines which days of the week each practice is active.
// 0 = Sunday, 1 = Monday, 2 = Tuesday, ..., 6 = Saturday
// If a practice is NOT listed here, it defaults to every day (0-6).

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAYS = [1, 2, 3, 4, 5]; // Mon-Fri

export const practiceSchedule: { [key: string]: number[] } = {
  flow_block: WEEKDAYS,
  // All other practices default to ALL_DAYS.
  // Add future schedule overrides here, e.g.:
  // co_regulation: WEEKDAYS,
};

/**
 * Get the scheduled days for a practice (defaults to every day)
 */
export function getPracticeScheduledDays(practiceId: string): number[] {
  return practiceSchedule[practiceId] || ALL_DAYS;
}

// ============================================
// STAGE HELPER FUNCTIONS
// ============================================

/**
 * Get ALL practices for a specific stage (regardless of schedule)
 */
export function getStagePractices(stageNumber: number): Practice[] {
  const stage = STAGES.find(s => s.number === stageNumber);
  return stage?.practices || [];
}

/**
 * Get practices SCHEDULED for a specific date (filters out off-day practices)
 * Use this for sidebar display and "remaining today" logic.
 */
export function getScheduledPracticesForDate(stageNumber: number, date?: Date): Practice[] {
  const targetDate = date || new Date();
  const dayOfWeek = targetDate.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

  const allPractices = getStagePractices(stageNumber);

  return allPractices.filter(practice => {
    const scheduledDays = getPracticeScheduledDays(practice.id);
    return scheduledDays.includes(dayOfWeek);
  });
}

/**
 * Get practice IDs scheduled for a specific date (used by progress-utils)
 */
export function getScheduledPracticeIdsForDate(stageNumber: number, date?: Date): string[] {
  const targetDate = date || new Date();
  const dayOfWeek = targetDate.getDay();

  const allPracticeIds = getStagePracticeIds(stageNumber);

  return allPracticeIds.filter(practiceId => {
    const scheduledDays = getPracticeScheduledDays(practiceId);
    return scheduledDays.includes(dayOfWeek);
  });
}

/**
 * Get on-demand tools unlocked at or before a specific stage
 */
export function getUnlockedOnDemandTools(stageNumber: number) {
  return ON_DEMAND_TOOLS.filter(tool => tool.unlockedAt <= stageNumber);
}

/**
 * Get stage name by number
 */
export function getStageName(stageNumber: number): string {
  const stage = STAGES.find(s => s.number === stageNumber);
  return stage?.name || `Stage ${stageNumber}`;
}

/**
 * Get stage tagline by number
 */
export function getStageTagline(stageNumber: number): string {
  const stage = STAGES.find(s => s.number === stageNumber);
  return stage?.tagline || '';
}

/**
 * Get array of practice IDs for a stage (simple string array, all practices)
 */
export function getStagePracticeIds(stageNumber: number): string[] {
  const stage = STAGES.find(s => s.number === stageNumber);
  return stage?.practices.map(p => p.id) || [];
}

/**
 * Normalize practice ID (handle variations like 'resonance_breathing' -> 'hrvb')
 */
export function normalizePracticeId(id: string): string {
  const normalized = id.toLowerCase().replace(/[\s-]/g, '_');
  if (normalized === 'resonance_breathing' || normalized === 'hrvb_breathing') {
    return 'hrvb';
  }
  return normalized;
}

/**
 * Get practice display name from ID
 */
export function getPracticeName(id: string): string {
  const normalizedId = normalizePracticeId(id);
  
  // Search all stages for the practice
  for (const stage of STAGES) {
    const practice = stage.practices.find(p => p.id === normalizedId);
    if (practice) return practice.name;
  }
  
  return id; // Fallback to original ID
}

/**
 * Get practice by ID
 */
export function getPracticeById(id: string): Practice | undefined {
  const normalizedId = normalizePracticeId(id);
  
  for (const stage of STAGES) {
    const practice = stage.practices.find(p => p.id === normalizedId);
    if (practice) return practice;
  }
  
  return undefined;
}

/**
 * Get stage by number
 */
export function getStageByNumber(stageNumber: number): Stage | undefined {
  return STAGES.find(s => s.number === stageNumber);
}

/**
 * Get unlock criteria for a stage
 */
export function getStageUnlockCriteria(stageNumber: number) {
  const stage = STAGES.find(s => s.number === stageNumber);
  return stage?.unlockCriteria;
}

// ============================================
// REWIRED INDEX TIERS
// ============================================

export const STATUS_TIERS = {
  SYSTEM_OFFLINE: { name: 'System Offline', min: 0, max: 20, color: 'text-red-400' },
  BASELINE_MODE: { name: 'Baseline Mode', min: 21, max: 40, color: 'text-orange-400' },
  OPERATIONAL: { name: 'Operational', min: 41, max: 60, color: 'text-yellow-400' },
  OPTIMIZED: { name: 'Optimized', min: 61, max: 80, color: 'text-green-400' },
  INTEGRATED: { name: 'Integrated', min: 81, max: 100, color: 'text-emerald-400' }
};

/**
 * Get status tier name based on REwired Index
 */
export function getStatusTier(index: number): string {
  if (index <= 20) return 'System Offline';
  if (index <= 40) return 'Baseline Mode';
  if (index <= 60) return 'Operational';
  if (index <= 80) return 'Optimized';
  return 'Integrated';
}

/**
 * Get status tier color class based on REwired Index
 */
export function getStatusColor(index: number): string {
  if (index <= 20) return 'text-red-400';
  if (index <= 40) return 'text-orange-400';
  if (index <= 60) return 'text-yellow-400';
  if (index <= 80) return 'text-green-400';
  return 'text-emerald-400';
}

// ============================================
// TIER INTERPRETATIONS (for baseline results)
// ============================================

export const TIER_INTERPRETATIONS: { [key: string]: string } = {
  'System Offline': "Uh oh! Your nervous system is in survival mode. You're operating on fumes. The IOS will teach you how to downshift into recovery.",
  'Baseline Mode': "You're functioning, but not optimized. Regulation is inconsistent, awareness is fragmented. The IOS will build your foundation.",
  'Operational': "You have some coherence, but it's not stable. The IOS will solidify what's working and upgrade what isn't.",
  'Optimized': "You're performing well. The IOS will take you from good to exceptional — making flow states and clarity your default.",
  'Integrated': "You're already operating at a high level. The IOS will help you sustain and expand this capacity across all domains."
};

/**
 * Get tier interpretation text based on tier name
 */
export function getTierInterpretation(tier: string): string {
  return TIER_INTERPRETATIONS[tier] || TIER_INTERPRETATIONS['Operational'];
}
