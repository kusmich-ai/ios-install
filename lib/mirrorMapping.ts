// ============================================
// lib/mirrorMapping.ts
// Maps identified patterns to IOS stages and practices
// ============================================

// IOS Stage definitions with what they address
export const IOS_STAGE_MAPPING = {
  1: {
    name: "Neural Priming",
    tagline: "Stabilize the signal. Teach your nervous system calm.",
    addresses: [
      "Nervous system dysregulation",
      "Stress reactivity",
      "Fight/flight/freeze patterns",
      "Inability to self-regulate",
      "Poor recovery from stress",
      "Autonomic instability"
    ],
    practices: ["HRVB Breathing", "Awareness Rep"],
    keywords: ["stress", "anxiety", "panic", "dysregulation", "nervous", "fight", "flight", "freeze", "reactive", "overwhelm", "calm"]
  },
  2: {
    name: "Embodied Awareness",
    tagline: "Bring awareness into motion.",
    addresses: [
      "Disconnection from body",
      "Lack of somatic awareness",
      "Living in head only",
      "Ignoring body signals",
      "Dissociation from physical experience"
    ],
    practices: ["Somatic Flow", "HRVB Breathing", "Awareness Rep"],
    keywords: ["body", "somatic", "disconnected", "numb", "physical", "sensation", "embodiment", "dissociation"]
  },
  3: {
    name: "Identity Mode",
    tagline: "Act from coherence.",
    addresses: [
      "Identity fusion",
      "Limiting self-concepts",
      "Role entrapment",
      "Self-fulfilling prophecies",
      "Imposter patterns",
      "Fixed mindset about self"
    ],
    practices: ["Morning Micro-Action", "Decentering Practice", "Reframe Protocol"],
    keywords: ["identity", "self-concept", "role", "imposter", "limiting belief", "I am", "always been", "just a", "type of person"]
  },
  4: {
    name: "Flow Mode",
    tagline: "Train sustained attention on performance drivers.",
    addresses: [
      "Attention leaks",
      "Focus fragmentation",
      "Procrastination patterns",
      "Mental tab overload",
      "Inability to sustain deep work",
      "Distraction addiction"
    ],
    practices: ["Flow Block", "Thought Hygiene"],
    keywords: ["focus", "attention", "distract", "procrastin", "scattered", "overwhelm", "tabs", "concentrate", "deep work"]
  },
  5: {
    name: "Relational Coherence",
    tagline: "Train the nervous system to stay open in connection.",
    addresses: [
      "Relational patterns",
      "Attachment issues",
      "Boundary problems",
      "Conflict avoidance",
      "People-pleasing",
      "Withdrawal under stress",
      "Communication breakdowns"
    ],
    practices: ["Co-Regulation Practice", "Decentering Practice"],
    keywords: ["relationship", "attachment", "boundary", "conflict", "people-pleas", "withdraw", "connect", "intimacy", "trust"]
  },
  6: {
    name: "Integration",
    tagline: "Convert insight into stable trait-level awareness.",
    addresses: [
      "Pattern integration",
      "Insight consolidation",
      "Sustainable change",
      "Deep shadow material",
      "Core pattern resolution"
    ],
    practices: ["Nightly Debrief", "Meta-Reflection"],
    keywords: ["integrate", "pattern", "deep", "core", "shadow", "unconscious", "root"]
  },
  7: {
    name: "Accelerated Expansion",
    tagline: "Awareness engineers itself.",
    addresses: [
      "Advanced optimization",
      "Peak performance",
      "Consciousness expansion"
    ],
    practices: ["Advanced protocols (application required)"],
    keywords: ["expand", "optimize", "peak", "transcend", "advance"]
  }
};

// On-demand tools and what they address
export const IOS_TOOLS_MAPPING = {
  "Decentering Practice": {
    unlocks_at: 1,
    addresses: [
      "Identity fusion",
      "Thought identification",
      "Role entrapment",
      "Emotional overwhelm",
      "Conflating sensation with identity"
    ],
    keywords: ["I am", "identity", "trapped", "stuck", "can't stop thinking", "overwhelm"]
  },
  "Reframe Protocol": {
    unlocks_at: 3,
    addresses: [
      "Cognitive distortions",
      "Catastrophizing",
      "Absolutist thinking",
      "Negative interpretation bias",
      "Rumination loops"
    ],
    keywords: ["always", "never", "everyone", "disaster", "ruined", "catastroph", "worst", "black and white"]
  },
  "Thought Hygiene": {
    unlocks_at: 4,
    addresses: [
      "Mental clutter",
      "Cognitive overload",
      "Racing thoughts",
      "Post-flow mental residue",
      "Background anxiety loops"
    ],
    keywords: ["scattered", "overwhelm", "too much", "racing", "can't think", "mental tabs", "clutter"]
  },
  "Meta-Reflection": {
    unlocks_at: 2,
    addresses: [
      "Lack of self-awareness",
      "Pattern blindness",
      "Unintegrated experiences",
      "Weekly integration needs"
    ],
    keywords: ["pattern", "awareness", "reflect", "understand", "why do I", "keep doing"]
  }
};

// Pattern category to stage mapping
export const CATEGORY_STAGE_MAPPING: Record<string, number[]> = {
  nervous_system_patterns: [1, 2],
  awareness_blind_spots: [2, 3, 6],
  identity_loops: [3, 5],
  attention_leaks: [4],
  relational_patterns: [5],
  emotional_outlook: [1, 3, 5],
  shadow_material: [6, 3]
};

// Severity thresholds for prioritization
export const SEVERITY_PRIORITY = {
  5: "critical", // Must address immediately
  4: "high",     // Primary focus
  3: "moderate", // Secondary focus
  2: "low",      // Monitor
  1: "minimal"   // Background awareness
};

// ============================================
// MAPPING FUNCTIONS
// ============================================

interface Pattern {
  id?: string;
  name: string;
  description?: string;
  evidence?: string;
  severity: number;
  connected_to?: string[];
  ios_stages?: number[];
  ios_practices?: string[];
}

interface ParsedPatterns {
  nervous_system_patterns: { patterns: Pattern[] };
  awareness_blind_spots: { patterns: Pattern[] };
  identity_loops: { patterns: Pattern[] };
  attention_leaks: { patterns: Pattern[] };
  relational_patterns: { patterns: Pattern[] };
  emotional_outlook: { patterns: Pattern[] };
  shadow_material: { patterns: Pattern[] };
  core_pattern?: Pattern;
}

interface IOSRoadmap {
  priority_stages: number[];
  stage_mapping: Record<string, {
    addresses: string[];
    pattern_ids: string[];
    primary_patterns: string[];
  }>;
  recommended_tools: {
    tool: string;
    reason: string;
    unlocks_at: string;
  }[];
}

/**
 * Maps a single pattern to relevant IOS stages based on keywords and category
 */
export function mapPatternToStages(pattern: Pattern, category: string): number[] {
  const stages = new Set<number>();
  
  // Add default stages for the category
  const categoryStages = CATEGORY_STAGE_MAPPING[category] || [];
  categoryStages.forEach(s => stages.add(s));
  
  // Scan pattern name and description for keywords
  const searchText = `${pattern.name} ${pattern.description || ''} ${pattern.evidence || ''}`.toLowerCase();
  
  for (const [stageNum, stageInfo] of Object.entries(IOS_STAGE_MAPPING)) {
    for (const keyword of stageInfo.keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        stages.add(parseInt(stageNum));
        break;
      }
    }
  }
  
  return Array.from(stages).sort((a, b) => a - b);
}

/**
 * Maps a pattern to relevant IOS practices/tools
 */
export function mapPatternToPractices(pattern: Pattern, stages: number[]): string[] {
  const practices = new Set<string>();
  const searchText = `${pattern.name} ${pattern.description || ''}`.toLowerCase();
  
  // Add practices from mapped stages
  stages.forEach(stage => {
    const stageInfo = IOS_STAGE_MAPPING[stage as keyof typeof IOS_STAGE_MAPPING];
    if (stageInfo) {
      stageInfo.practices.forEach(p => practices.add(p));
    }
  });
  
  // Check on-demand tools
  for (const [toolName, toolInfo] of Object.entries(IOS_TOOLS_MAPPING)) {
    for (const keyword of toolInfo.keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        practices.add(toolName);
        break;
      }
    }
  }
  
  return Array.from(practices);
}

/**
 * Generates the complete IOS Roadmap from parsed patterns
 */
export function generateIOSRoadmap(parsedPatterns: ParsedPatterns): IOSRoadmap {
  const stagePatternMap: Record<number, { patterns: Pattern[]; addresses: Set<string> }> = {};
  const allPatterns: Pattern[] = [];
  const toolReasons: Record<string, string[]> = {};
  
  // Initialize stage mapping
  for (let i = 1; i <= 7; i++) {
    stagePatternMap[i] = { patterns: [], addresses: new Set() };
  }
  
  // Process each category
  const categories = [
    'nervous_system_patterns',
    'awareness_blind_spots', 
    'identity_loops',
    'attention_leaks',
    'relational_patterns',
    'emotional_outlook',
    'shadow_material'
  ];
  
  categories.forEach(category => {
    const categoryData = parsedPatterns[category as keyof ParsedPatterns];
    if (categoryData && 'patterns' in categoryData) {
      categoryData.patterns.forEach((pattern: Pattern) => {
        // Generate unique ID if not present
        if (!pattern.id) {
          pattern.id = `${category}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        
        // Map to stages
        const stages = mapPatternToStages(pattern, category);
        pattern.ios_stages = stages;
        
        // Map to practices
        pattern.ios_practices = mapPatternToPractices(pattern, stages);
        
        // Add to stage mapping
        stages.forEach(stage => {
          stagePatternMap[stage].patterns.push(pattern);
          
          // Add what this stage addresses for this pattern
          const stageInfo = IOS_STAGE_MAPPING[stage as keyof typeof IOS_STAGE_MAPPING];
          if (stageInfo) {
            stageInfo.addresses.forEach(addr => {
              stagePatternMap[stage].addresses.add(addr);
            });
          }
        });
        
        // Track tool recommendations
        pattern.ios_practices?.forEach(practice => {
          if (IOS_TOOLS_MAPPING[practice as keyof typeof IOS_TOOLS_MAPPING]) {
            if (!toolReasons[practice]) toolReasons[practice] = [];
            toolReasons[practice].push(pattern.name);
          }
        });
        
        allPatterns.push(pattern);
      });
    }
  });
  
  // Calculate priority stages based on pattern severity and count
  const stagePriorities: { stage: number; score: number }[] = [];
  
  for (let stage = 1; stage <= 6; stage++) { // Exclude Stage 7 from auto-prioritization
    const patterns = stagePatternMap[stage].patterns;
    if (patterns.length > 0) {
      const avgSeverity = patterns.reduce((sum, p) => sum + p.severity, 0) / patterns.length;
      const score = avgSeverity * patterns.length; // Weight by both severity and count
      stagePriorities.push({ stage, score });
    }
  }
  
  stagePriorities.sort((a, b) => b.score - a.score);
  const priorityStages = stagePriorities.slice(0, 3).map(sp => sp.stage);
  
  // Ensure Stage 1 is always included if user has any nervous system patterns
  if (!priorityStages.includes(1) && stagePatternMap[1].patterns.length > 0) {
    priorityStages.unshift(1);
  }
  
  // Build stage_mapping output
  const stageMapping: Record<string, {
    addresses: string[];
    pattern_ids: string[];
    primary_patterns: string[];
  }> = {};
  
  for (let stage = 1; stage <= 6; stage++) {
    const data = stagePatternMap[stage];
    if (data.patterns.length > 0) {
      stageMapping[stage.toString()] = {
        addresses: Array.from(data.addresses),
        pattern_ids: data.patterns.map(p => p.id!),
        primary_patterns: data.patterns
          .sort((a, b) => b.severity - a.severity)
          .slice(0, 3)
          .map(p => p.name)
      };
    }
  }
  
  // Build recommended_tools output
  const recommendedTools = Object.entries(toolReasons)
    .filter(([_, reasons]) => reasons.length > 0)
    .map(([tool, reasons]) => ({
      tool,
      reason: reasons.slice(0, 2).join(", "),
      unlocks_at: `Stage ${IOS_TOOLS_MAPPING[tool as keyof typeof IOS_TOOLS_MAPPING]?.unlocks_at || 1}`
    }));
  
  return {
    priority_stages: priorityStages,
    stage_mapping: stageMapping,
    recommended_tools: recommendedTools
  };
}

/**
 * Calculates a quality score for the Mirror analysis
 * Returns 1-5 based on depth and completeness
 */
export function calculateMirrorQuality(parsedPatterns: ParsedPatterns): number {
  let totalPatterns = 0;
  let categoriesWithPatterns = 0;
  let avgSeverity = 0;
  let hasEvidence = 0;
  
  const categories = [
    'nervous_system_patterns',
    'awareness_blind_spots',
    'identity_loops', 
    'attention_leaks',
    'relational_patterns',
    'emotional_outlook',
    'shadow_material'
  ];
  
  categories.forEach(category => {
    const categoryData = parsedPatterns[category as keyof ParsedPatterns];
    if (categoryData && 'patterns' in categoryData && categoryData.patterns.length > 0) {
      categoriesWithPatterns++;
      categoryData.patterns.forEach((pattern: Pattern) => {
        totalPatterns++;
        avgSeverity += pattern.severity;
        if (pattern.evidence && pattern.evidence.length > 20) {
          hasEvidence++;
        }
      });
    }
  });
  
  if (totalPatterns === 0) return 1;
  
  avgSeverity = avgSeverity / totalPatterns;
  const evidenceRatio = hasEvidence / totalPatterns;
  
  // Quality scoring:
  // - At least 3 patterns across 2+ categories = baseline 2
  // - Good evidence = +1
  // - 5+ patterns across 4+ categories = +1
  // - Core pattern identified with substance = +1
  
  let quality = 1;
  
  if (totalPatterns >= 3 && categoriesWithPatterns >= 2) quality = 2;
  if (evidenceRatio >= 0.5) quality++;
  if (totalPatterns >= 5 && categoriesWithPatterns >= 4) quality++;
  if (parsedPatterns.core_pattern?.name && parsedPatterns.core_pattern?.evidence) quality++;
  
  return Math.min(5, quality);
}

export default {
  IOS_STAGE_MAPPING,
  IOS_TOOLS_MAPPING,
  CATEGORY_STAGE_MAPPING,
  mapPatternToStages,
  mapPatternToPractices,
  generateIOSRoadmap,
  calculateMirrorQuality
};
