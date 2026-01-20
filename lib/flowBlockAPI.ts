// lib/flowBlockAPI.ts
// Flow Block Integration Protocol v6.0 - TEMPLATE-DRIVEN STATE MACHINE
// 
// Architecture: 80% Templates / 20% API (matches working ritual intro pattern)
// - Each step has a FIXED template message
// - User responses are parsed/validated locally  
// - State machine controls the flow
// - AI only called for classification (Step 6) and edge cases
// - Guarantees all data is collected before save

import { withToolLayers } from '@/lib/prompts/withToolLayers';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface WeeklyMapEntry {
  day: string;
  domain: string;
  task: string;
  flowType: string;
  category: string;
  coherenceLink: string;
  duration: number;
}

export interface WeeklyMapEntryLegacy {
  day: string;
  domain: string;
  task: string;
  flowType: string;
  category: string;
  identityLink: string;
  duration: number;
}

export interface SetupPreferences {
  professionalLocation: string;
  personalLocation: string;
  playlist: string;
  timerMethod: string;
  notificationsOff: boolean;
}

export interface FlowBlockState {
  isActive: boolean;
  step: number; // 0-15 state machine
  // Collected data
  domains: string[];
  tasks: string[];
  taskClassifications: Array<{ flowType: string; category: string; coherenceLink: string }>;
  schedule: { daysPerWeek: number; time: string };
  focusType: 'concentrated' | 'distributed' | null;
  weeklyMap: WeeklyMapEntry[];
  preferences: SetupPreferences;
  // Legacy fields for compatibility
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  phase: 'discovery' | 'planning' | 'setup' | 'commitment' | null;
  extractedDomains: string[] | null;
  extractedWeeklyMap: WeeklyMapEntry[] | null;
  extractedPreferences: SetupPreferences | null;
  isComplete: boolean;
  sprintStartDate: string | null;
  sprintNumber: number;
}

export const initialFlowBlockState: FlowBlockState = {
  isActive: false,
  step: 0,
  domains: [],
  tasks: [],
  taskClassifications: [],
  schedule: { daysPerWeek: 5, time: '9:00 AM' },
  focusType: null,
  weeklyMap: [],
  preferences: {
    professionalLocation: '',
    personalLocation: '',
    playlist: '',
    timerMethod: '',
    notificationsOff: false,
  },
  // Legacy
  conversationHistory: [],
  phase: null,
  extractedDomains: null,
  extractedWeeklyMap: null,
  extractedPreferences: null,
  isComplete: false,
  sprintStartDate: null,
  sprintNumber: 1,
};

// ============================================
// STEP TEMPLATES (Fixed Messages)
// ============================================

export const FLOW_BLOCK_TEMPLATES = {
  // Step 0: Opening
  opening: `**Flow Block Setup**

Let's build your weekly deep work schedule. Takes about 3 minutes.

**Pick your top 3 domains** (give me the numbers in priority order):
1. Professional Work
2. Personal Development
3. Relationships
4. Creative Projects
5. Learning
6. Health

Example: "1, 4, 2" means Professional first, then Creative, then Personal Dev.`,

  // Step 1: Confirm domains
  confirmDomains: (domains: string[]) => `Got it:
1. **${domains[0]}**
2. **${domains[1]}**
3. **${domains[2]}**

Correct? (yes/no)`,

  // Step 2: Task for domain 1
  taskDomain1: (domain: string) => `**${domain}** — What ONE task would make the biggest impact if you focused on it for 60-90 minutes this week?

Just name the task (e.g., "finish proposal", "write chapter 3", "plan Q1 strategy").`,

  // Step 3: Task for domain 2
  taskDomain2: (domain: string) => `**${domain}** — Same question: ONE high-impact task worth 60-90 min of deep focus?`,

  // Step 4: Task for domain 3
  taskDomain3: (domain: string) => `**${domain}** — And the third: ONE task worth focused time?`,

  // Step 5: Schedule
  schedule: `Quick scheduling:
• How many days per week? (Default: 5, Mon-Fri)
• What time works best? (e.g., "9:30am", "morning", "after lunch")

Give me both (e.g., "5 days, 9:30am").`,

  // Step 6: Show classifications (AI-assisted, but we have fallback)
  classifications: (tasks: string[], classifications: Array<{ flowType: string; category: string }>) => {
    let msg = `Here's how I'd classify these:\n\n`;
    tasks.forEach((task, i) => {
      const c = classifications[i] || { flowType: 'Strategic', category: 'Goal' };
      msg += `• **${task}**: ${c.flowType} | ${c.category}\n`;
    });
    msg += `\nLook right? (yes/no or tell me what to change)`;
    return msg;
  },

  // Step 7: Weekly Map
  weeklyMap: (map: WeeklyMapEntry[], time: string) => {
    let table = `**Your Weekly Flow Block Map:**\n\n`;
    table += `| Day | Task | Duration |\n`;
    table += `|-----|------|----------|\n`;
    map.forEach(entry => {
      table += `| ${entry.day} | ${entry.task} | ${entry.duration} min |\n`;
    });
    table += `\n*All blocks at ${time}*\n\n`;
    table += `Any changes? (yes to continue, or tell me what to adjust)`;
    return table;
  },

  // Step 8: Location
  location: `**Environment setup** (same setup every time = faster focus)

Where will you do your Flow Blocks? (desk, office, coffee shop, etc.)`,

  // Step 9: Playlist
  playlist: `Do you have a focus playlist, or want a suggestion?

(If you have one, just name it. If not, say "suggest" and I'll recommend some.)`,

  playlistSuggestion: `Try one of these:
• Spotify: "Deep Focus" or "Brain Food"
• YouTube: "lofi hip hop beats"
• App: Endel or Brain.fm

Pick one or name your own:`,

  // Step 10: Timer
  timer: `How will you track time?
• Phone timer
• Computer timer
• Physical timer
• App (Forest, Toggl, etc.)`,

  // Step 11: Notifications
  notifications: `Last one: Can you commit to **phone on airplane mode** (or in another room) during blocks?

(yes/no)`,

  // Step 12: Setup summary
  setupSummary: (prefs: SetupPreferences) => `**Setup locked:**
• Location: ${prefs.professionalLocation}
• Playlist: ${prefs.playlist}
• Timer: ${prefs.timerMethod}
• Phone: ${prefs.notificationsOff ? 'Airplane mode ✓' : 'Off during blocks'}`,

  // Step 13: Final commitment
  commitment: (map: WeeklyMapEntry[], time: string, prefs: SetupPreferences) => {
    let msg = `**Your Flow Block System:**\n\n`;
    msg += `| Day | Task | Duration |\n`;
    msg += `|-----|------|----------|\n`;
    map.forEach(entry => {
      msg += `| ${entry.day} | ${entry.task} | ${entry.duration} min |\n`;
    });
    msg += `\n**Schedule:** ${time}, Mon-Fri\n`;
    msg += `**Location:** ${prefs.professionalLocation}\n`;
    msg += `**Playlist:** ${prefs.playlist}\n`;
    msg += `**Timer:** ${prefs.timerMethod}\n\n`;
    msg += `21-day sprint starts tomorrow.\n\n`;
    msg += `**Do you commit? Are you in?**`;
    return msg;
  },

  // Step 14: Complete
  complete: (time: string) => `**Flow Blocks: INSTALLED ✓**

Day 1 starts tomorrow at ${time}.
Mark each block complete in the sidebar when done.

See you on the other side.`,
};

// ============================================
// DOMAIN MAPPING
// ============================================

const DOMAIN_MAP: { [key: string]: string } = {
  '1': 'Professional Work',
  '2': 'Personal Development',
  '3': 'Relationships',
  '4': 'Creative Projects',
  '5': 'Learning',
  '6': 'Health',
  'professional': 'Professional Work',
  'professional work': 'Professional Work',
  'work': 'Professional Work',
  'personal': 'Personal Development',
  'personal development': 'Personal Development',
  'development': 'Personal Development',
  'relationships': 'Relationships',
  'relationship': 'Relationships',
  'creative': 'Creative Projects',
  'creative projects': 'Creative Projects',
  'learning': 'Learning',
  'health': 'Health',
  'fitness': 'Health',
};

// ============================================
// RESPONSE PARSERS
// ============================================

export function parseDomainSelection(input: string): string[] | null {
  const normalized = input.toLowerCase().trim();
  
  // Try to parse comma/space separated numbers: "1, 4, 2" or "1 4 2"
  const numbers = normalized.match(/[1-6]/g);
  if (numbers && numbers.length >= 3) {
    const unique = [...new Set(numbers)].slice(0, 3);
    if (unique.length === 3) {
      return unique.map(n => DOMAIN_MAP[n]).filter(Boolean);
    }
  }
  
  // Try to parse words
  const words = normalized.split(/[,\s]+/).filter(w => w.length > 2);
  const domains: string[] = [];
  for (const word of words) {
    if (DOMAIN_MAP[word] && !domains.includes(DOMAIN_MAP[word])) {
      domains.push(DOMAIN_MAP[word]);
    }
    if (domains.length === 3) break;
  }
  
  if (domains.length === 3) return domains;
  return null;
}

export function parseSchedule(input: string): { daysPerWeek: number; time: string } | null {
  const normalized = input.toLowerCase().trim();
  
  // Extract days
  let days = 5; // default
  const dayMatch = normalized.match(/(\d)\s*(days?|x)/i);
  if (dayMatch) {
    days = parseInt(dayMatch[1]);
    if (days < 1 || days > 7) days = 5;
  }
  
  // Extract time
  let time = '9:00 AM';
  const timeMatch = normalized.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1]);
    const mins = timeMatch[2] || '00';
    const ampm = timeMatch[3]?.toLowerCase();
    
    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;
    
    const ampmStr = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    time = `${displayHour}:${mins} ${ampmStr}`;
  } else if (normalized.includes('morning')) {
    time = '9:00 AM';
  } else if (normalized.includes('afternoon') || normalized.includes('after lunch')) {
    time = '1:00 PM';
  } else if (normalized.includes('evening')) {
    time = '6:00 PM';
  }
  
  return { daysPerWeek: days, time };
}

export function isAffirmative(input: string): boolean {
  const normalized = input.toLowerCase().trim();
  const affirmatives = [
    'yes', 'yeah', 'yep', 'yup', 'y', 'sure', 'ok', 'okay', 
    'correct', 'right', 'good', 'looks good', 'sounds good',
    'perfect', 'great', 'fine', 'continue', 'let\'s go', 'lets go'
  ];
  return affirmatives.some(a => normalized.includes(a));
}

export function isNegative(input: string): boolean {
  const normalized = input.toLowerCase().trim();
  const negatives = ['no', 'nope', 'nah', 'wrong', 'incorrect', 'change', 'adjust'];
  return negatives.some(n => normalized.includes(n));
}

export function isCommitmentResponse(userMessage: string, lastAssistantMessage: string): boolean {
  const normalizedAssistant = lastAssistantMessage.toLowerCase();
  if (!normalizedAssistant.includes('are you in') && !normalizedAssistant.includes('do you commit')) {
    return false;
  }
  return isAffirmative(userMessage);
}

// ============================================
// WEEKLY MAP BUILDER
// ============================================

export function buildWeeklyMap(
  domains: string[],
  tasks: string[],
  classifications: Array<{ flowType: string; category: string; coherenceLink: string }>,
  daysPerWeek: number = 5
): WeeklyMapEntry[] {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const map: WeeklyMapEntry[] = [];
  
  // Distribution: Primary domain gets 3 days, secondary 2 (for 5-day week)
  // Adjust for other day counts
  const distribution = daysPerWeek === 5 
    ? [0, 1, 0, 2, 0] // Mon=D1, Tue=D2, Wed=D1, Thu=D3, Fri=D1
    : daysPerWeek === 4
    ? [0, 1, 0, 2]
    : daysPerWeek === 3
    ? [0, 1, 2]
    : [0, 1, 0, 2, 0, 1, 2]; // 6-7 days
  
  for (let i = 0; i < Math.min(daysPerWeek, distribution.length); i++) {
    const domainIndex = distribution[i];
    const task = tasks[domainIndex] || tasks[0];
    const classification = classifications[domainIndex] || { flowType: 'Strategic', category: 'Goal', coherenceLink: 'Direct' };
    
    map.push({
      day: days[i],
      domain: domains[domainIndex] || domains[0],
      task: task,
      flowType: classification.flowType,
      category: classification.category,
      coherenceLink: classification.coherenceLink,
      duration: i % 2 === 0 ? 90 : 60, // Alternate 90/60
    });
  }
  
  return map;
}

// ============================================
// DEFAULT CLASSIFICATIONS (Fallback if API fails)
// ============================================

export function getDefaultClassification(domain: string): { flowType: string; category: string; coherenceLink: string } {
  const map: { [key: string]: { flowType: string; category: string; coherenceLink: string } } = {
    'Professional Work': { flowType: 'Strategic', category: 'Goal', coherenceLink: 'Direct' },
    'Personal Development': { flowType: 'Learning', category: 'Growth', coherenceLink: 'Indirect' },
    'Relationships': { flowType: 'Creative', category: 'Growth', coherenceLink: 'Direct' },
    'Creative Projects': { flowType: 'Creative', category: 'Goal', coherenceLink: 'Autonomous' },
    'Learning': { flowType: 'Learning', category: 'Growth', coherenceLink: 'Indirect' },
    'Health': { flowType: 'Strategic', category: 'Gratitude', coherenceLink: 'Autonomous' },
  };
  return map[domain] || { flowType: 'Strategic', category: 'Goal', coherenceLink: 'Direct' };
}

// ============================================
// STATE MACHINE PROCESSOR
// ============================================

export interface StepResult {
  nextStep: number;
  message: string;
  updatedState: Partial<FlowBlockState>;
  isComplete?: boolean;
  needsAPICall?: boolean;
  apiContext?: string;
}

export function processFlowBlockStep(
  currentStep: number,
  userInput: string,
  state: FlowBlockState
): StepResult {
  
  switch (currentStep) {
    
    // Step 0: Show opening (handled by startFlowBlockSetup)
    case 0:
      return {
        nextStep: 1,
        message: FLOW_BLOCK_TEMPLATES.opening,
        updatedState: { step: 1 }
      };
    
    // Step 1: Parse domain selection
    case 1: {
      const domains = parseDomainSelection(userInput);
      if (!domains) {
        return {
          nextStep: 1,
          message: `I didn't catch that. Please give me 3 numbers from the list (e.g., "1, 4, 2").`,
          updatedState: {}
        };
      }
      return {
        nextStep: 2,
        message: FLOW_BLOCK_TEMPLATES.confirmDomains(domains),
        updatedState: { step: 2, domains }
      };
    }
    
    // Step 2: Confirm domains
    case 2: {
      if (isNegative(userInput)) {
        return {
          nextStep: 1,
          message: FLOW_BLOCK_TEMPLATES.opening,
          updatedState: { step: 1, domains: [] }
        };
      }
      return {
        nextStep: 3,
        message: FLOW_BLOCK_TEMPLATES.taskDomain1(state.domains[0]),
        updatedState: { step: 3 }
      };
    }
    
    // Step 3: Task for domain 1
    case 3: {
      const task = userInput.trim();
      if (task.length < 2) {
        return {
          nextStep: 3,
          message: `What's a specific task for ${state.domains[0]}? (e.g., "write proposal", "plan strategy")`,
          updatedState: {}
        };
      }
      return {
        nextStep: 4,
        message: FLOW_BLOCK_TEMPLATES.taskDomain2(state.domains[1]),
        updatedState: { step: 4, tasks: [task] }
      };
    }
    
    // Step 4: Task for domain 2
    case 4: {
      const task = userInput.trim();
      if (task.length < 2) {
        return {
          nextStep: 4,
          message: `What task for ${state.domains[1]}?`,
          updatedState: {}
        };
      }
      return {
        nextStep: 5,
        message: FLOW_BLOCK_TEMPLATES.taskDomain3(state.domains[2]),
        updatedState: { step: 5, tasks: [...state.tasks, task] }
      };
    }
    
    // Step 5: Task for domain 3
    case 5: {
      const task = userInput.trim();
      if (task.length < 2) {
        return {
          nextStep: 5,
          message: `What task for ${state.domains[2]}?`,
          updatedState: {}
        };
      }
      return {
        nextStep: 6,
        message: FLOW_BLOCK_TEMPLATES.schedule,
        updatedState: { step: 6, tasks: [...state.tasks, task] }
      };
    }
    
    // Step 6: Parse schedule
    case 6: {
      const schedule = parseSchedule(userInput);
      if (!schedule) {
        return {
          nextStep: 6,
          message: `Just tell me days and time (e.g., "5 days, 9:30am").`,
          updatedState: {}
        };
      }
      
      // Generate default classifications
      const classifications = state.domains.map(d => getDefaultClassification(d));
      
      return {
        nextStep: 7,
        message: FLOW_BLOCK_TEMPLATES.classifications(state.tasks, classifications),
        updatedState: { 
          step: 7, 
          schedule,
          taskClassifications: classifications
        }
      };
    }
    
    // Step 7: Confirm classifications
    case 7: {
      // Build weekly map
      const weeklyMap = buildWeeklyMap(
        state.domains,
        state.tasks,
        state.taskClassifications,
        state.schedule.daysPerWeek
      );
      
      return {
        nextStep: 8,
        message: FLOW_BLOCK_TEMPLATES.weeklyMap(weeklyMap, state.schedule.time),
        updatedState: { step: 8, weeklyMap }
      };
    }
    
    // Step 8: Confirm weekly map
    case 8: {
      if (isNegative(userInput) && userInput.length > 5) {
        // They want changes - for now, just acknowledge and continue
        // Future: could parse specific changes
        return {
          nextStep: 8,
          message: `Got it. For now, let's continue with this map and you can adjust after the first week. Continue? (yes)`,
          updatedState: {}
        };
      }
      return {
        nextStep: 9,
        message: FLOW_BLOCK_TEMPLATES.location,
        updatedState: { step: 9 }
      };
    }
    
    // Step 9: Location
    case 9: {
      const location = userInput.trim();
      if (location.length < 2) {
        return {
          nextStep: 9,
          message: `Where will you do your Flow Blocks?`,
          updatedState: {}
        };
      }
      return {
        nextStep: 10,
        message: FLOW_BLOCK_TEMPLATES.playlist,
        updatedState: { 
          step: 10, 
          preferences: { ...state.preferences, professionalLocation: location, personalLocation: location }
        }
      };
    }
    
    // Step 10: Playlist
    case 10: {
      const input = userInput.toLowerCase().trim();
      if (input === 'suggest' || input === 'suggestion' || input.includes('suggest')) {
        return {
          nextStep: 10,
          message: FLOW_BLOCK_TEMPLATES.playlistSuggestion,
          updatedState: {}
        };
      }
      const playlist = userInput.trim() || 'Deep Focus';
      return {
        nextStep: 11,
        message: FLOW_BLOCK_TEMPLATES.timer,
        updatedState: { 
          step: 11,
          preferences: { ...state.preferences, playlist }
        }
      };
    }
    
    // Step 11: Timer
    case 11: {
      const timer = userInput.trim() || 'Phone timer';
      return {
        nextStep: 12,
        message: FLOW_BLOCK_TEMPLATES.notifications,
        updatedState: {
          step: 12,
          preferences: { ...state.preferences, timerMethod: timer }
        }
      };
    }
    
    // Step 12: Notifications
    case 12: {
      const notificationsOff = isAffirmative(userInput);
      const prefs = { ...state.preferences, notificationsOff };
      
      return {
        nextStep: 13,
        message: FLOW_BLOCK_TEMPLATES.setupSummary(prefs) + '\n\n' + FLOW_BLOCK_TEMPLATES.commitment(state.weeklyMap, state.schedule.time, prefs),
        updatedState: {
          step: 13,
          preferences: prefs
        }
      };
    }
    
    // Step 13: Final commitment
    case 13: {
      if (!isAffirmative(userInput)) {
        return {
          nextStep: 13,
          message: `No worries. Take your time. When you're ready to commit, just say "yes" or "I'm in."`,
          updatedState: {}
        };
      }
      
      return {
        nextStep: 14,
        message: FLOW_BLOCK_TEMPLATES.complete(state.schedule.time),
        updatedState: { 
          step: 14,
          isComplete: true,
          extractedDomains: state.domains,
          extractedWeeklyMap: state.weeklyMap,
          extractedPreferences: state.preferences,
          sprintStartDate: new Date().toISOString()
        },
        isComplete: true
      };
    }
    
    default:
      return {
        nextStep: 0,
        message: FLOW_BLOCK_TEMPLATES.opening,
        updatedState: { step: 1 }
      };
  }
}

// ============================================
// OPENING MESSAGE (Used by ChatInterface)
// ============================================

export const flowBlockOpeningMessage = FLOW_BLOCK_TEMPLATES.opening;

export function getFlowBlockOpeningWithIdentity(anchor: string, action: string): string {
  return `**Flow Block Setup**

You have a daily anchor: *${action}*

Let's build Flow Blocks around that rhythm. Takes about 3 minutes.

**Pick your top 3 domains** (give me the numbers in priority order):
1. Professional Work
2. Personal Development
3. Relationships
4. Creative Projects
5. Learning
6. Health

Example: "1, 4, 2"`;
}

export const getFlowBlockOpeningWithAnchor = getFlowBlockOpeningWithIdentity;

// ============================================
// COMPLETION DATA (For saving)
// ============================================

export interface FlowBlockCompletion {
  domains: string[];
  weeklyMap: WeeklyMapEntry[];
  setupPreferences: SetupPreferences;
  focusType: 'concentrated' | 'distributed';
}

export function getCompletionData(state: FlowBlockState): FlowBlockCompletion | null {
  if (!state.isComplete || !state.weeklyMap.length) return null;
  
  return {
    domains: state.domains,
    weeklyMap: state.weeklyMap,
    setupPreferences: state.preferences,
    focusType: state.focusType || 'distributed',
  };
}

// ============================================
// LEGACY FUNCTIONS (For compatibility)
// ============================================

// These are no longer used but kept for import compatibility
export const flowBlockSystemPrompt = ''; // Not used in template approach

export function buildFlowBlockAPIMessages(): Array<{ role: string; content: string }> {
  return []; // Not used
}

export function buildFlowBlockExtractionMessages(): Array<{ role: string; content: string }> {
  return []; // Not used
}

export function parseFlowBlockExtraction(): FlowBlockCompletion | null {
  return null; // Not used
}

export function parseFlowBlockCompletion(): FlowBlockCompletion | null {
  return null; // Not used
}

export function cleanFlowBlockResponseForDisplay(response: string): string {
  return response;
}

// ============================================
// DAILY HELPERS (Unchanged)
// ============================================

export function getTodaysBlock(weeklyMap: WeeklyMapEntry[]): WeeklyMapEntry | null {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[new Date().getDay()];
  return weeklyMap.find(entry => entry.day === today) || null;
}

export function formatWeeklyMapForDisplay(weeklyMap: WeeklyMapEntry[]): string {
  let table = `| Day | Task | Duration |\n|-----|------|----------|\n`;
  weeklyMap.forEach(entry => {
    table += `| ${entry.day} | ${entry.task} | ${entry.duration} min |\n`;
  });
  return table;
}

export function getDailyFlowBlockPrompt(block: WeeklyMapEntry, preferences: SetupPreferences): string {
  return `**Today's Flow Block: ${block.task}**

${block.duration} min | ${block.domain}

**Setup:**
• Location: ${preferences.professionalLocation}
• Playlist: ${preferences.playlist}
• Timer: ${preferences.timerMethod}
• Phone: Off

**Start with:** "For the next ${block.duration} minutes, my only job is ${block.task}."

Mark complete when done.`;
}

export const postBlockReflectionPrompt = `**Block complete.**

Quick check:
1. One sentence: What was the learning?
2. Ratings 1-5: Focus, Challenge-Skill, Energy, Flow Presence

Example: "4, 3, 4, 5 - Realized I work better with outline first"`;

export function getSprintDayNumber(sprintStartDate: string): number {
  const start = new Date(sprintStartDate);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.max(1, Math.min(Math.floor((now.getTime() - start.getTime()) / 86400000) + 1, 21));
}

export function isSprintComplete(sprintStartDate: string): boolean {
  return getSprintDayNumber(sprintStartDate) > 21;
}

export const sprintCompleteMessage = (sprintNumber: number) => `**Sprint ${sprintNumber} Complete**

• Which blocks hit flow fastest?
• Where did resistance show up?

Options:
1. Continue (same map)
2. Evolve (adjust)
3. Redesign (new setup)

Which?`;

// Legacy exports
export const getFlowBlockOpeningWithCoherenceAnchor = getFlowBlockOpeningWithAnchor;
