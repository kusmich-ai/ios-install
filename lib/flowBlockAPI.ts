// lib/flowBlockAPI.ts
// Flow Block Integration Protocol v5.0 - STRICT INSTALLER MODE
// 
// CRITICAL: This is a SYSTEM SETUP flow, not a coaching session.
// The AI must collect structured data, build a weekly map, and save.
// NO strategy diving. NO lengthy explanations. INSTALLER MODE ONLY.

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
// SYSTEM PROMPT v5.0 - STRICT INSTALLER MODE
// ============================================

export const flowBlockSystemPrompt = withToolLayers(`You are a SYSTEM INSTALLER setting up a user's Flow Block configuration.

## ⛔ CRITICAL CONSTRAINTS - READ CAREFULLY

You are NOT a coach. You are NOT a strategist. You are an INSTALLER.
Your ONLY job is to collect structured data and build a weekly Flow Block schedule.

FORBIDDEN BEHAVIORS:
- Do NOT give strategy advice about their work/projects
- Do NOT create detailed plans for their tasks
- Do NOT explain HOW to do their work
- Do NOT write long paragraphs of advice
- Do NOT ask multiple questions at once
- Do NOT skip any required steps
- Do NOT proceed to commitment until ALL data is collected

REQUIRED BEHAVIORS:
- Keep responses SHORT (3-5 lines max, except for the weekly map table)
- Ask exactly ONE question per message
- Wait for answer before proceeding
- Follow the EXACT step sequence below
- Present weekly map as a TABLE before commitment
- Use EXACT commitment phrase at the end

## RESPONSE LENGTH RULE
Every response must be 5 lines or fewer, EXCEPT:
- The weekly map table (Step 8)
- The final commitment summary (Step 14)

If you catch yourself writing more than 5 lines, STOP and simplify.

---

## MANDATORY STEP SEQUENCE

### PHASE 1: DOMAIN DISCOVERY (Steps 1-4)

**STEP 1:** Ask for top 3 domains.
"Pick your top 3 from this list (in priority order):
1. Professional Work
2. Personal Development
3. Relationships
4. Creative Projects
5. Learning
6. Health"

**STEP 2:** Confirm their selection.
"Got it: 1) [Domain A], 2) [Domain B], 3) [Domain C]. Correct?"

**STEP 3:** Get ONE task for Domain A.
"For [Domain A]: What ONE task, if you focused on it for 60-90 mins, would move the needle most this week?"

**STEP 4:** Get ONE task for Domain B.
"For [Domain B]: Same question—ONE high-impact task for a 60-90 min block?"

**STEP 5:** Get ONE task for Domain C.
"For [Domain C]: And the third—ONE task worth 60-90 mins of deep focus?"

---

### PHASE 2: CLASSIFICATION (Steps 6-7)

**STEP 6:** Classify all three tasks. Present as a simple list:
"Here's how I'd classify these:

• [Task 1]: [Creative/Strategic/Learning] | [Goal/Growth/Gratitude]
• [Task 2]: [Creative/Strategic/Learning] | [Goal/Growth/Gratitude]
• [Task 3]: [Creative/Strategic/Learning] | [Goal/Growth/Gratitude]

Look right?"

**STEP 7:** Ask about schedule.
"How many days per week for Flow Blocks? (Default: 5, Mon-Fri)
And what time works best?"

---

### PHASE 3: WEEKLY MAP (Step 8)

**STEP 8:** Present the weekly map as a TABLE. This is the ONE exception to the short-response rule.

"Here's your Weekly Flow Block Map:

| Day | Domain | Task | Type | Category | Duration |
|-----|--------|------|------|----------|----------|
| Mon | [Domain] | [Task] | [Type] | [Cat] | 90 min |
| Tue | [Domain] | [Task] | [Type] | [Cat] | 60 min |
| Wed | [Domain] | [Task] | [Type] | [Cat] | 90 min |
| Thu | [Domain] | [Task] | [Type] | [Cat] | 60 min |
| Fri | [Domain] | [Task] | [Type] | [Cat] | 90 min |

Any changes needed?"

IMPORTANT: Distribute the 3 tasks across 5 days. Primary domain gets 3 days, secondary gets 2.

---

### PHASE 4: ENVIRONMENT SETUP (Steps 9-13)

Ask these ONE AT A TIME. Short responses only.

**STEP 9:** "Where will you do these blocks? (desk, office, etc.)"

**STEP 10:** "Do you have a focus playlist or want a suggestion?"
(If they need one: "Try Spotify's 'Deep Focus' or 'Brain Food'")

**STEP 11:** "How will you track time? Phone timer, app, or physical timer?"

**STEP 12:** "Can you commit to phone on airplane mode during blocks?"

**STEP 13:** Confirm setup:
"Setup locked:
• Location: [X]
• Playlist: [X]
• Timer: [X]
• Phone: Airplane mode ✓"

---

### PHASE 5: COMMITMENT (Step 14)

**STEP 14:** Present final summary and ask for commitment using EXACT phrase.

"Your Flow Block System:

| Day | Task | Time | Duration |
|-----|------|------|----------|
| Mon | [Task] | [Time] | [Dur] |
| Tue | [Task] | [Time] | [Dur] |
| Wed | [Task] | [Time] | [Dur] |
| Thu | [Task] | [Time] | [Dur] |
| Fri | [Task] | [Time] | [Dur] |

Environment: [Location] | [Playlist] | [Timer] | Phone off

21-day sprint starts tomorrow.

**Do you commit? Are you in?**"

YOU MUST include "Do you commit?" or "Are you in?" - this triggers the save.

**STEP 15:** After they confirm:
"Flow Blocks: INSTALLED ✓

Day 1 starts tomorrow at [time]. 
After each block, mark it complete in the sidebar.
See you on the other side."

Keep this short. No long motivational speeches.

---

## RECOVERY RULES

If user tries to skip ahead:
"Let me grab [current step info] first, then we'll keep moving."

If user gives unclear answer:
"Quick clarification: [specific question]"

If user asks strategy questions:
"Good question—that's exactly what your Flow Blocks are for. Let's finish setup first. [Return to current step]"

---

## LANGUAGE RULES
- No identity language ("becoming", "who you are")
- No improvement language ("get better", "optimize")
- Short, direct sentences
- No emojis except ✓ for confirmations`);

// ============================================
// OPENING MESSAGE (Starts with Step 1)
// ============================================

export const flowBlockOpeningMessage = `**Flow Block Setup**

Let's build your weekly deep work schedule. Takes about 3 minutes.

Pick your top 3 domains (in priority order):
1. Professional Work
2. Personal Development
3. Relationships
4. Creative Projects
5. Learning
6. Health

Which 3 matter most right now?`;

export function getFlowBlockOpeningWithIdentity(anchor: string, action: string): string {
  return getFlowBlockOpeningWithAnchor(anchor, action);
}

export function getFlowBlockOpeningWithAnchor(anchor: string, action: string): string {
  return `**Flow Block Setup**

You have a daily anchor: *${action}*

Let's build Flow Blocks around that rhythm. Takes about 3 minutes.

Pick your top 3 domains (in priority order):
1. Professional Work
2. Personal Development
3. Relationships
4. Creative Projects
5. Learning
6. Health

Which 3 matter most right now?`;
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
  const normalizedAssistant = lastAssistantMessage.toLowerCase();

  // Check if assistant asked for commitment
  const askedForCommitment =
    normalizedAssistant.includes('are you in') ||
    normalizedAssistant.includes('do you commit') ||
    normalizedAssistant.includes('ready to commit') ||
    normalizedAssistant.includes('ready to lock') ||
    normalizedAssistant.includes('lock this in');

  if (!askedForCommitment) return false;

  // Strict commitment patterns (short responses)
  const strictPatterns = [
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
    /^ready[.!,\s]*$/i,
    /^locked[.!,\s]*$/i,
    /^done[.!,\s]*$/i,
    /^100%[.!,\s]*$/i,
  ];

  // Loose patterns (commitment phrases within longer messages)
  const loosePatterns = [
    /\byes\b/i,
    /\bi'm in\b/i,
    /\bim in\b/i,
    /\bi commit\b/i,
    /\bsounds good\b/i,
    /\blooks good\b/i,
    /\bworks for me\b/i,
    /\blet's do/i,
    /\blets do/i,
  ];

  const isStrictMatch = strictPatterns.some(p => p.test(normalizedMessage));
  const isLooseMatch = loosePatterns.some(p => p.test(normalizedMessage));

  return isStrictMatch || isLooseMatch;
}

// ============================================
// API MESSAGE BUILDERS
// ============================================

export function buildFlowBlockAPIMessages(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  newUserMessage: string,
  currentAnchor?: string
): Array<{ role: 'user' | 'assistant' | 'system'; content: string }> {
  let systemPrompt = flowBlockSystemPrompt;

  if (currentAnchor) {
    systemPrompt += `\n\n## EXISTING ANCHOR\nUser has daily anchor: "${currentAnchor}". Reference it briefly but stay in installer mode.`;
  }

  // Add conversation length context to help AI know where it is
  const messageCount = conversationHistory.length;
  if (messageCount < 4) {
    systemPrompt += `\n\n## CURRENT PHASE: DOMAIN DISCOVERY\nYou should be in Steps 1-5. Collect domains and tasks.`;
  } else if (messageCount < 8) {
    systemPrompt += `\n\n## CURRENT PHASE: CLASSIFICATION & SCHEDULE\nYou should be in Steps 6-7. Classify tasks and get schedule.`;
  } else if (messageCount < 10) {
    systemPrompt += `\n\n## CURRENT PHASE: WEEKLY MAP\nYou should be presenting the weekly map table (Step 8).`;
  } else if (messageCount < 18) {
    systemPrompt += `\n\n## CURRENT PHASE: ENVIRONMENT SETUP\nYou should be in Steps 9-13. Ask about location, playlist, timer, phone.`;
  } else {
    systemPrompt += `\n\n## CURRENT PHASE: COMMITMENT\nYou should be presenting final summary and asking "Do you commit? Are you in?"`;
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
  const extractionPrompt = `Extract the Flow Block setup data from this conversation into JSON.

IMPORTANT: Output ONLY valid JSON. No markdown, no explanation, no backticks.

{
  "domains": ["Domain1", "Domain2", "Domain3"],
  "weeklyMap": [
    {"day": "Monday", "domain": "Domain", "task": "Task description", "flowType": "Strategic", "category": "Goal", "identityLink": "Direct", "duration": 90},
    {"day": "Tuesday", "domain": "Domain", "task": "Task", "flowType": "Creative", "category": "Growth", "identityLink": "Indirect", "duration": 60},
    {"day": "Wednesday", "domain": "Domain", "task": "Task", "flowType": "Learning", "category": "Goal", "identityLink": "Autonomous", "duration": 90},
    {"day": "Thursday", "domain": "Domain", "task": "Task", "flowType": "Strategic", "category": "Gratitude", "identityLink": "Direct", "duration": 60},
    {"day": "Friday", "domain": "Domain", "task": "Task", "flowType": "Creative", "category": "Goal", "identityLink": "Indirect", "duration": 90}
  ],
  "preferences": {
    "professionalLocation": "their location answer",
    "personalLocation": "their location answer or same as professional",
    "playlist": "their playlist answer",
    "timerMethod": "their timer answer",
    "notificationsOff": true
  },
  "focusType": "distributed"
}

Rules:
- Extract ACTUAL data from conversation
- domains: The 3 domains they chose in priority order
- weeklyMap: All 5 days with actual tasks discussed
- flowType: "Creative", "Strategic", or "Learning"
- category: "Goal", "Growth", or "Gratitude"
- identityLink: "Direct", "Indirect", or "Autonomous"
- duration: 60 or 90 based on what was discussed
- preferences: Their actual setup answers
- focusType: Usually "distributed" unless they said otherwise

Output JSON now:`;

  return [
    {
      role: 'system' as const,
      content: 'You are a data extraction assistant. Output only valid JSON. No explanation.',
    },
    ...conversationHistory,
    { role: 'user' as const, content: extractionPrompt },
  ];
}

// ============================================
// EXTRACTION PARSING
// ============================================

function normalizeWeeklyMapEntry(entry: WeeklyMapEntryLegacy | WeeklyMapEntry): WeeklyMapEntry {
  if ('identityLink' in entry && !('coherenceLink' in entry)) {
    return {
      day: entry.day,
      domain: entry.domain,
      task: entry.task,
      flowType: entry.flowType,
      category: entry.category,
      coherenceLink: entry.identityLink,
      duration: entry.duration,
    };
  }
  return entry as WeeklyMapEntry;
}

export function parseFlowBlockExtraction(response: string): FlowBlockCompletion | null {
  try {
    let cleanResponse = response.trim();

    // Remove markdown code blocks if present
    if (cleanResponse.startsWith('```json')) cleanResponse = cleanResponse.slice(7);
    else if (cleanResponse.startsWith('```')) cleanResponse = cleanResponse.slice(3);
    if (cleanResponse.endsWith('```')) cleanResponse = cleanResponse.slice(0, -3);
    cleanResponse = cleanResponse.trim();

    // Find JSON object
    const startIndex = cleanResponse.indexOf('{');
    const endIndex = cleanResponse.lastIndexOf('}');
    if (startIndex === -1 || endIndex === -1) return null;

    const jsonString = cleanResponse.substring(startIndex, endIndex + 1);
    const parsed = JSON.parse(jsonString);

    // Validate required fields
    if (!parsed.domains || !Array.isArray(parsed.domains) || parsed.domains.length < 1) return null;
    if (!parsed.weeklyMap || !Array.isArray(parsed.weeklyMap) || parsed.weeklyMap.length < 1) return null;
    if (!parsed.preferences) return null;

    const normalizedMap = parsed.weeklyMap.map(normalizeWeeklyMapEntry);

    return {
      domains: parsed.domains,
      weeklyMap: normalizedMap,
      setupPreferences: {
        professionalLocation: parsed.preferences?.professionalLocation || 'Not specified',
        personalLocation: parsed.preferences?.personalLocation || parsed.preferences?.professionalLocation || 'Not specified',
        playlist: parsed.preferences?.playlist || 'Not specified',
        timerMethod: parsed.preferences?.timerMethod || 'Phone timer',
        notificationsOff: parsed.preferences?.notificationsOff !== false,
      },
      focusType: parsed.focusType === 'concentrated' ? 'concentrated' : 'distributed',
    };
  } catch (e) {
    console.error('[FlowBlock] Extraction parse error:', e);
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
  const coherenceLink = 'coherenceLink' in block ? block.coherenceLink : (block as unknown as WeeklyMapEntryLegacy).identityLink;

  return `**Today's Flow Block: ${block.task}**

${block.duration} min | ${block.domain} | ${block.flowType}

**Setup:**
• Location: ${preferences.professionalLocation}
• Playlist: ${preferences.playlist}
• Timer: ${preferences.timerMethod}
• Phone: Off

**Start with:** "For the next ${block.duration} minutes, my only job is ${block.task}."

Mark complete when done.`;
}

export const postBlockReflectionPrompt = `**Block complete.**

Quick check (30 sec):

1. One sentence: What was the learning?

2. Ratings 1-5:
• Focus Quality
• Challenge-Skill Balance  
• Energy After
• Flow Presence

Example: "4, 3, 4, 5 - Realized I work better with outline first"`;

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

export const sprintCompleteMessage = (sprintNumber: number) => `**Sprint ${sprintNumber} Complete**

Quick review:
• Which blocks hit flow fastest?
• Where did resistance show up?
• What needs adjustment?

Options:
1. Continue (same map)
2. Evolve (adjust tasks/times)
3. Redesign (new discovery)

Which?`;

// ============================================
// LEGACY EXPORTS
// ============================================

export const getFlowBlockOpeningWithCoherenceAnchor = getFlowBlockOpeningWithAnchor;
