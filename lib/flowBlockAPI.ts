// lib/flowBlockAPI.ts
// 100% API-driven Flow Block Integration Protocol v4.0 (Cue Kernel Aligned)
// 
// Philosophy: Task-model, not identity-model. Attention → Action.
// Flow Blocks train the nervous system to recognize deep work as familiar—not effortful.
// Tools restore clarity; they don't fix states.
//
// Key Cue Kernel Principles Applied:
// - Recognition over improvement
// - No self-story or identity language
// - Coherence = stable attention + regulated NS + action without narrative
// - Tools restore clarity when interpretation distorts signal

import { withToolLayers } from '@/lib/prompts/withToolLayers';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface WeeklyMapEntry {
  day: string;           // 'Monday', 'Tuesday', etc.
  domain: string;        // 'Professional Work', 'Creative Projects', etc.
  task: string;          // The specific task
  flowType: string;      // 'Creative', 'Strategic', 'Learning'
  category: string;      // 'Goal', 'Growth', 'Gratitude'
  coherenceLink: string; // 'Direct', 'Indirect', 'Autonomous' (formerly identityLink)
  duration: number;      // 60 or 90 minutes
}

// Legacy interface for backward compatibility with existing data
export interface WeeklyMapEntryLegacy {
  day: string;
  domain: string;
  task: string;
  flowType: string;
  category: string;
  identityLink: string;  // Legacy field name - maps to coherenceLink
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
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  phase: 'discovery' | 'planning' | 'setup' | 'commitment' | null;
  extractedDomains: string[] | null;
  extractedWeeklyMap: WeeklyMapEntry[] | null;
  extractedPreferences: SetupPreferences | null;
  focusType: 'concentrated' | 'distributed' | null;
  isComplete: boolean;
  sprintStartDate: string | null;
  sprintNumber: number;
}

export const initialFlowBlockState: FlowBlockState = {
  isActive: false,
  conversationHistory: [],
  phase: null,
  extractedDomains: null,
  extractedWeeklyMap: null,
  extractedPreferences: null,
  focusType: null,
  isComplete: false,
  sprintStartDate: null,
  sprintNumber: 1,
};

// ============================================
// SYSTEM PROMPT v4.0 (Cue Kernel Aligned)
// ============================================

export const flowBlockSystemPrompt = withToolLayers(`You are a performance coach helping a user set up their Flow Block system — the execution element of the Mental Operating System (MOS).

Flow Blocks are deep work sessions that train the nervous system to recognize sustained attention as familiar and safe. The goal is clean execution through consistent environmental cues and deliberate task selection.

## COHERENCE (Definition)
Coherence = stable attention + regulated nervous system + action without self-referential narrative.
It's not a state to achieve or improve toward—it's what's already present when story drops.
Tools don't create coherence; they restore clarity when interpretation distorts signal.

## CRITICAL LANGUAGE RULES
- Do NOT use identity-model language ("I am...", "becoming the person who...", "who you're becoming")
- Do NOT use improvement/fixing language ("get better at", "improve your", "optimize")
- USE task-model language: attention → action, signal → response, cue → execution
- USE recognition language: "notice", "recognize", "what's already here", "restore clarity"

## OPERATING MODES

### Strategist (Phase 1)
Help the user identify the right Flow Blocks across life domains aligned with outcomes and nervous-system capacity.

- Begin with domain prioritization across 6 key areas: Professional Work, Personal Development, Relationships, Creative Projects, Learning, Health
- Identify high-leverage tasks in top 3 domains
- Classify tasks by:
  - Flow Type: Creative / Strategic / Learning
  - 3G Category: Goal / Growth / Gratitude

### Planner (Phase 2)
Build a Flow Menu and a Weekly Map.

- Baseline: 5 blocks per week (Mon–Fri), one per day
- Default timing: first main task after workday starts
- Decide Concentrated vs Distributed focus based on signals
- Ensure 3G balance (typical: 3 Goal + 1 Growth + 1 Gratitude; flexible)

### Execution Companion (Phase 3)
Lock the environment and schedule the blocks.

- Setup Requirements (not optional): Same location, same playlist, timer, notifications off
- Get written commitment
- Provide calendar templates for copy/paste

## COHERENCE LINK
Each block is labeled with a Coherence Link indicating how attention relates to the task:

- **Direct**: The block itself requires deliberate coherence—sustained attention through difficulty (e.g., hard conversation, complex writing, decision-making under uncertainty)
- **Indirect**: The block expresses coherence qualities (patience, clean attention, restraint) without being explicitly "coherence practice"
- **Autonomous**: Any task executed while holding coherence—no story, one action at a time, attention on what's present

Note: The database field may still be called "identityLink" for backward compatibility. Treat it as Coherence Link.

## SESSION FLOW BLUEPRINT

### 1) Discovery
30-second primer:
"We'll classify your blocks by type (Creative/Strategic/Learning) and priority (Goal/Growth/Gratitude) so you build a week that produces outcomes without depleting your nervous system."

Prompt:
"Rank your top 3 domains right now:
- Professional Work
- Personal Development
- Relationships
- Creative Projects
- Learning
- Health"

For each top domain:
"If you completed only ONE thing in [domain] this week, what would genuinely move outcomes forward?"

### 2) Classification
As tasks emerge, classify them:
"That is [Flow Type] and sits in [3G]."

Then assign coherence link:
"Coherence link: [Direct/Indirect/Autonomous]."

### 3) Weekly Map
Baseline proposal:
"5 blocks per week (Mon–Fri), 60–90 minutes, one per day, first main task after you start work. Does that baseline fit?"

Concentrated vs Distributed:
- Concentrated signals: deadline, stuck, one dominant project
- Distributed signals: multiple equal priorities, maintenance phase

Present recommendation and confirm.

### 4) Setup Requirements (Critical)
Ask one at a time:
1) Professional location
2) Personal/relational location
3) Playlist/sound
4) Timer method
5) Notifications off commitment

Confirm setup checklist.

### 5) Calendar Templates
Offer copy/paste templates.

### 6) Commitment
"Do you commit to:
- 5 blocks per week for 21 days
- Following the setup protocol
- Daily check-ins for the first 7 days
- No major structure changes for 2 weeks"

Wait for explicit commitment.

## IMPORTANT RULES
- Ask ONE question at a time
- Keep responses concise except when presenting the table or final summary
- No identity-model language—ever
- No improvement/fixing framing
- If user drifts into story/excuses: return to constraints and next action
- Frame consistency as recognition ("the nervous system recognizes this as familiar") not achievement

## TONE & STYLE
Grounded, clear, systems-coach voice. No hype. Clarity over inspiration.

Example phrases:
- "Train consistency, not heroics"
- "Proof over pressure"
- "What was the learning from today?"
- "The nervous system recognizes focus as familiar—not effortful"
- "Clean execution, no story attached"`);

// ============================================
// OPENING MESSAGES
// ============================================

export const flowBlockOpeningMessage = `**Flow Block Setup** 🎯

Let's set up your Flow Block system — the execution element of the MOS.

Flow Blocks are 60–90 minute deep work sessions. They train the nervous system to recognize sustained attention as familiar and safe—not effortful.

By day 21, dropping into focus won't require willpower. The cues do the work.

Before we build your weekly map: what are the top 1–3 outcomes you want this sprint to move forward?`;

// Legacy function name preserved for import compatibility
// Treats the anchor parameter as a coherence cue, not an identity
export function getFlowBlockOpeningWithIdentity(anchor: string, action: string): string {
  return getFlowBlockOpeningWithAnchor(anchor, action);
}

// Preferred function name (Cue Kernel aligned)
export function getFlowBlockOpeningWithAnchor(anchor: string, action: string): string {
  return `**Flow Block Setup** 🎯

Let's set up your Flow Block system — the execution element of the MOS.

You already have a daily anchor in the system:
*${action}*

We'll treat that as a consistency cue and build Flow Blocks that work with your existing rhythm.

Ready to identify your highest-leverage work?`;
}

// ============================================
// COMPLETION DATA TYPES
// ============================================

export interface FlowBlockCompletion {
  domains: string[];
  weeklyMap: WeeklyMapEntry[];
  setupPreferences: SetupPreferences;
  focusType: 'concentrated' | 'distributed';
}

// ============================================
// COMMITMENT DETECTION
// ============================================

export function isCommitmentResponse(userMessage: string, lastAssistantMessage: string): boolean {
  const normalizedMessage = userMessage.trim().toLowerCase();

  const commitmentPatterns = [
    /^yes[.!,\s]*$/i,
    /^yeah[.!,\s]*$/i,
    /^yep[.!,\s]*$/i,
    /^yup[.!,\s]*$/i,
    /^i'm in[.!,\s]*$/i,
    /^im in[.!,\s]*$/i,
    /^i commit[.!,\s]*$/i,
    /^committed[.!,\s]*$/i,
    /^absolutely[.!,\s]*$/i,
    /^let's do it[.!,\s]*$/i,
    /^lets do it[.!,\s]*$/i,
    /^let's go[.!,\s]*$/i,
    /^lets go[.!,\s]*$/i,
    /^i do[.!,\s]*$/i,
    /^ready[.!,\s]*$/i,
    /^do it[.!,\s]*$/i,
    /^100%[.!,\s]*$/i,
    /^definitely[.!,\s]*$/i,
    /^for sure[.!,\s]*$/i,
    /^all in[.!,\s]*$/i,
  ];

  const isCommitment = commitmentPatterns.some((pattern) => pattern.test(normalizedMessage));

  const askedForCommitment =
    lastAssistantMessage.toLowerCase().includes('are you in') ||
    lastAssistantMessage.toLowerCase().includes('do you commit') ||
    lastAssistantMessage.toLowerCase().includes('ready to commit');

  return isCommitment && askedForCommitment;
}

// ============================================
// API MESSAGE BUILDERS
// ============================================

export function buildFlowBlockAPIMessages(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  newUserMessage: string,
  currentAnchor?: string // Renamed from currentIdentity for clarity
): Array<{ role: 'user' | 'assistant' | 'system'; content: string }> {
  let systemPrompt = flowBlockSystemPrompt;

  // Treat currentAnchor as a consistency cue if present (legacy param support)
  if (currentAnchor) {
    systemPrompt += `\n\n## EXISTING ANCHOR\nThe user has an existing daily anchor in the system. Do NOT frame it as identity. Use it only as a consistency cue for scheduling and environmental setup.`;
  }

  return [
    { role: 'system' as const, content: systemPrompt },
    ...conversationHistory,
    { role: 'user' as const, content: newUserMessage },
  ];
}

export function buildFlowBlockExtractionMessages(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Array<{ role: 'user' | 'assistant' | 'system'; content: string }> {
  const extractionPrompt = `Based on the Flow Block setup conversation above, extract ALL the data into this exact JSON format.

IMPORTANT: Output ONLY valid JSON. No markdown, no explanation, no backticks. Just the JSON object.

{
  "domains": ["Domain1", "Domain2", "Domain3"],
  "weeklyMap": [
    {"day": "Monday", "domain": "Professional Work", "task": "Task description", "flowType": "Strategic", "category": "Goal", "identityLink": "Direct", "duration": 90},
    {"day": "Tuesday", "domain": "Domain", "task": "Task", "flowType": "Type", "category": "Category", "identityLink": "Indirect", "duration": 60},
    {"day": "Wednesday", "domain": "Domain", "task": "Task", "flowType": "Type", "category": "Category", "identityLink": "Autonomous", "duration": 90},
    {"day": "Thursday", "domain": "Domain", "task": "Task", "flowType": "Type", "category": "Category", "identityLink": "Direct", "duration": 60},
    {"day": "Friday", "domain": "Domain", "task": "Task", "flowType": "Type", "category": "Category", "identityLink": "Indirect", "duration": 60}
  ],
  "preferences": {
    "professionalLocation": "Their work location from conversation",
    "personalLocation": "Their home/personal location from conversation",
    "playlist": "Their playlist choice from conversation",
    "timerMethod": "Their timer method from conversation",
    "notificationsOff": true
  },
  "focusType": "concentrated"
}

Rules:
- Extract the ACTUAL data from the conversation, not placeholders
- domains: The 3 life domains they prioritized
- weeklyMap: All 5 days with the exact tasks they agreed to
- flowType must be: "Creative", "Strategic", or "Learning"
- category must be: "Goal", "Growth", or "Gratitude"
- identityLink values: "Direct", "Indirect", "Autonomous" (this maps to Coherence Link internally)
- duration: Use the actual durations discussed (60 or 90)
- preferences: Their actual answers for location, playlist, timer
- focusType: "concentrated" or "distributed" based on what was decided

Output the JSON now:`;

  return [
    {
      role: 'system' as const,
      content: 'You are a data extraction assistant. Output only valid JSON based on conversation data. No markdown, no explanation.',
    },
    ...conversationHistory,
    { role: 'user' as const, content: extractionPrompt },
  ];
}

// ============================================
// EXTRACTION PARSING
// ============================================

// Helper to normalize legacy identityLink to coherenceLink
function normalizeWeeklyMapEntry(entry: WeeklyMapEntryLegacy | WeeklyMapEntry): WeeklyMapEntry {
  if ('identityLink' in entry && !('coherenceLink' in entry)) {
    return {
      day: entry.day,
      domain: entry.domain,
      task: entry.task,
      flowType: entry.flowType,
      category: entry.category,
      coherenceLink: entry.identityLink, // Map legacy field
      duration: entry.duration,
    };
  }
  return entry as WeeklyMapEntry;
}

export function parseFlowBlockExtraction(response: string): FlowBlockCompletion | null {
  try {
    let cleanResponse = response.trim();

    if (cleanResponse.startsWith('```json')) cleanResponse = cleanResponse.slice(7);
    else if (cleanResponse.startsWith('```')) cleanResponse = cleanResponse.slice(3);

    if (cleanResponse.endsWith('```')) cleanResponse = cleanResponse.slice(0, -3);
    cleanResponse = cleanResponse.trim();

    const startIndex = cleanResponse.indexOf('{');
    const endIndex = cleanResponse.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1) return null;

    const jsonString = cleanResponse.substring(startIndex, endIndex + 1);
    const parsed = JSON.parse(jsonString);

    if (!parsed.domains || !parsed.weeklyMap || !parsed.preferences) return null;

    // Normalize weeklyMap entries to use coherenceLink
    const normalizedMap = parsed.weeklyMap.map(normalizeWeeklyMapEntry);

    return {
      domains: parsed.domains || [],
      weeklyMap: normalizedMap,
      setupPreferences: {
        professionalLocation: parsed.preferences?.professionalLocation || '',
        personalLocation: parsed.preferences?.personalLocation || '',
        playlist: parsed.preferences?.playlist || '',
        timerMethod: parsed.preferences?.timerMethod || '',
        notificationsOff: parsed.preferences?.notificationsOff !== false,
      },
      focusType: parsed.focusType === 'distributed' ? 'distributed' : 'concentrated',
    };
  } catch {
    return null;
  }
}

export function parseFlowBlockCompletion(response: string): FlowBlockCompletion | null {
  const markerIndex = response.indexOf('[FLOWBLOCK_SETUP_COMPLETE]');
  if (markerIndex === -1) return null;

  const afterMarker = response.substring(markerIndex + '[FLOWBLOCK_SETUP_COMPLETE]'.length).trim();
  const jsonMatch = afterMarker.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    const normalizedMap = (parsed.weeklyMap || []).map(normalizeWeeklyMapEntry);
    
    return {
      domains: parsed.domains || [],
      weeklyMap: normalizedMap,
      setupPreferences: parsed.preferences || {
        professionalLocation: '',
        personalLocation: '',
        playlist: '',
        timerMethod: '',
        notificationsOff: true,
      },
      focusType: parsed.focusType || 'distributed',
    };
  } catch {
    return null;
  }
}

export function cleanFlowBlockResponseForDisplay(response: string): string {
  const markerIndex = response.indexOf('[FLOWBLOCK_SETUP_COMPLETE]');
  if (markerIndex === -1) return response.trim();
  return response.substring(0, markerIndex).trim();
}

// ============================================
// DAILY EXECUTION HELPERS
// ============================================

export function getTodaysBlock(weeklyMap: WeeklyMapEntry[]): WeeklyMapEntry | null {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[new Date().getDay()];
  return weeklyMap.find((entry) => entry.day === today) || null;
}

export function formatWeeklyMapForDisplay(weeklyMap: WeeklyMapEntry[]): string {
  let table = `| Day | Domain | Task | Type | Category | Duration |
|-----|--------|------|------|----------|----------|
`;
  for (const entry of weeklyMap) {
    table += `| ${entry.day} | ${entry.domain} | ${entry.task} | ${entry.flowType} | ${entry.category} | ${entry.duration} min |
`;
  }
  return table;
}

export function getDailyFlowBlockPrompt(block: WeeklyMapEntry, preferences: SetupPreferences): string {
  const location =
    block.domain.includes('Professional') ||
    block.domain.includes('Creative') ||
    block.domain.includes('Learning')
      ? preferences.professionalLocation
      : preferences.personalLocation;

  // Get coherenceLink from either field name for backward compatibility
  const coherenceLink = 'coherenceLink' in block ? block.coherenceLink : (block as unknown as WeeklyMapEntryLegacy).identityLink;

  return `**Today's Flow Block: ${block.task}**

**${block.duration} minutes** • ${block.domain} • ${block.flowType}/${block.category}
Coherence: ${coherenceLink}

---

**Environment Check:**
• Location: ${location}
• Playlist: ${preferences.playlist}
• Timer: Ready
• Phone: Off/away

---

**Before you begin, say this aloud or write it:**

*"For the next ${block.duration} minutes, my only job is ${block.task}."*

No story. One action at a time. Attention on what's present.

---

Come back when you're done for your reflection and performance check.`;
}

export const postBlockReflectionPrompt = `**Block complete.**

Quick debrief (60 seconds):

**1) One-sentence reflection:**
What was the learning from today? (No story—just the signal.)

**2) Performance Check (1–5):**
• Focus Quality: How sustained was attention?
• Challenge–Skill Balance: Too easy (1), balanced (3), too hard (5)
• Energy After: Depleted (1), calm clarity (5)
• Flow Presence: Time distortion, reduced mental chatter

Send ratings like: "4, 3, 4, 5" + your one sentence.`;

export function getSprintDayNumber(sprintStartDate: string): number {
  const start = new Date(sprintStartDate);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, Math.min(diffDays, 21));
}

export function isSprintComplete(sprintStartDate: string): boolean {
  const start = new Date(sprintStartDate);
  start.setHours(0, 0, 0, 0);
  const endDate = new Date(start);
  endDate.setDate(endDate.getDate() + 21);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now >= endDate;
}

export const sprintCompleteMessage = (sprintNumber: number) => `**21-Day Flow Block Sprint ${sprintNumber} Complete**

Review (notice, don't judge):
- Which blocks produced clean focus fastest?
- Where did reactivity or distraction show up?
- Was environment or task selection the limiter?
- Which domains showed clearest execution?

The nervous system now recognizes this rhythm. The question is whether to deepen it or redirect it.

Options:
1) **Continue** — same map, same cues
2) **Evolve** — adjust difficulty, duration, or 3G balance
3) **Redesign** — new discovery from scratch

Which?`;

// ============================================
// LEGACY EXPORT ALIASES (for backward compatibility)
// ============================================

// Some components may still import with old names
export const getFlowBlockOpeningWithCoherenceAnchor = getFlowBlockOpeningWithAnchor;
