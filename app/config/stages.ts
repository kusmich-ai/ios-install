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
    tagline: 'Stabilize the signal. Teach your nervous system calm.',
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
        id: 'awareness_rep',
        name: 'Awareness Rep',
        shortName: 'Awareness',
        duration: 2,
        icon: '👁️',
        description: 'Meta-awareness training'
      },
      {
        id: 'somatic_flow',
        name: 'Somatic Flow',
        shortName: 'Somatic',
        duration: 3,
        icon: '🧘',
        description: 'Cat-Cow + Squat-to-Reach with breath'
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
    name: 'Identity Mode',
    tagline: 'Act from coherence.',
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
        id: 'awareness_rep',
        name: 'Awareness Rep',
        shortName: 'Awareness',
        duration: 2,
        icon: '👁️',
        description: 'Meta-awareness training'
      },
      {
        id: 'somatic_flow',
        name: 'Somatic Flow',
        shortName: 'Somatic',
        duration: 3,
        icon: '🧘',
        description: 'Movement with breath'
      },
      {
        id: 'micro_action',
        name: 'Morning Micro-Action',
        shortName: 'Micro',
        duration: 2,
        icon: '⚡',
        description: 'Identity proof action'
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
        id: 'awareness_rep',
        name: 'Awareness Rep',
        shortName: 'Awareness',
        duration: 2,
        icon: '👁️',
        description: 'Meta-awareness training'
      },
      {
        id: 'somatic_flow',
        name: 'Somatic Flow',
        shortName: 'Somatic',
        duration: 3,
        icon: '🧘',
        description: 'Movement with breath'
      },
      {
        id: 'micro_action',
        name: 'Morning Micro-Action',
        shortName: 'Micro',
        duration: 2,
        icon: '⚡',
        description: 'Identity proof action'
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
        id: 'awareness_rep',
        name: 'Awareness Rep',
        shortName: 'Awareness',
        duration: 2,
        icon: '👁️',
        description: 'Meta-awareness training'
      },
      {
        id: 'somatic_flow',
        name: 'Somatic Flow',
        shortName: 'Somatic',
        duration: 3,
        icon: '🧘',
        description: 'Movement with breath'
      },
      {
        id: 'micro_action',
        name: 'Morning Micro-Action',
        shortName: 'Micro',
        duration: 2,
        icon: '⚡',
        description: 'Identity proof action'
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
        duration: 3,
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
        id: 'awareness_rep',
        name: 'Awareness Rep',
        shortName: 'Awareness',
        duration: 2,
        icon: '👁️',
        description: 'Meta-awareness training'
      },
      {
        id: 'somatic_flow',
        name: 'Somatic Flow',
        shortName: 'Somatic',
        duration: 3,
        icon: '🧘',
        description: 'Movement with breath'
      },
      {
        id: 'micro_action',
        name: 'Morning Micro-Action',
        shortName: 'Micro',
        duration: 2,
        icon: '⚡',
        description: 'Identity proof action'
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
        duration: 3,
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
    description: 'Recognize thoughts as objects in awareness',
    unlockedAt: 1
  },
  {
    id: 'meta_reflection',
    name: 'Meta-Reflection',
    shortName: 'Meta',
    icon: '📊',
    description: 'Weekly system check-in',
    unlockedAt: 2
  },
  {
    id: 'reframe',
    name: 'Reframe Protocol',
    shortName: 'Reframe',
    icon: '🔄',
    description: 'Update limiting interpretations',
    unlockedAt: 3
  },
  {
    id: 'thought_hygiene',
    name: 'Thought Hygiene',
    shortName: 'Hygiene',
    icon: '🧠',
    description: 'Clear mental cache',
    unlockedAt: 4
  }
];

export function getStagePractices(stageNumber: number): Practice[] {
  const stage = STAGES.find(s => s.number === stageNumber);
  return stage?.practices || [];
}

export function getUnlockedOnDemandTools(stageNumber: number) {
  return ON_DEMAND_TOOLS.filter(tool => tool.unlockedAt <= stageNumber);
}
