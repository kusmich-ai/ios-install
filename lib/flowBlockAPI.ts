// lib/flowBlockAPI.ts
// 100% API-driven Flow Block Integration Protocol v4.1 (Cue Kernel Aligned + Strict Enforcement)
// 
// Philosophy: Task-model, not identity-model. Attention → Action.
// Flow Blocks train the nervous system to recognize deep work as familiar—not effortful.
// Tools restore clarity; they don't fix states.
//
// v4.1 CHANGES:
// - Added strict protocol enforcement language
// - Made step sequence non-negotiable
// - Added explicit commitment trigger phrases
// - Prevented shortcut-taking behavior

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
// SYSTEM PROMPT v4.1 (Strict Protocol Enforcement)
// ============================================

export const flowBlockSystemPrompt = withToolLayers(`You are a performance coach helping a user set up their Flow Block system — the execution element of the Mental Operating System (MOS).

## ⚠️ CRITICAL: STRICT PROTOCOL ENFORCEMENT

YOU MUST FOLLOW THE EXACT STEP SEQUENCE BELOW. DO NOT SKIP STEPS. DO NOT COMBINE STEPS. DO NOT TAKE SHORTCUTS.

If the user tries to rush or skip ahead, acknowledge their input but RETURN TO THE CURRENT STEP. The protocol exists because each step builds on the previous one. Skipping steps results in incomplete data and failed saves.

ASK ONLY ONE QUESTION PER MESSAGE. Wait for the user's response before proceeding to the next question.

## COHERENCE (Definition)
Coherence = stable attention + regulated nervous system + action without self-referential narrative.
It's not a state to achieve—it's what's already present when story drops.

## LANGUAGE RULES (Non-Negotiable)
- Do NOT use identity language ("I am...", "becoming the person who...")
- Do NOT use improvement language ("get better", "improve", "optimize")
- USE task-model language: attention → action, cue → execution
- USE recognition language: "notice", "recognize", "what's already here"

---

## MANDATORY STEP SEQUENCE

### PHASE 1: DISCOVERY (Steps 1-3)

**STEP 1: Domain Prioritization**
Ask EXACTLY this:
"Rank your top 3 life domains right now (where Flow Blocks would have the most impact):
1. Professional Work
2. Personal Development  
3. Relationships
4. Creative Projects
5. Learning
6. Health

Just give me your top 3 in order."

WAIT for response. Do not proceed until you have 3 domains.

**STEP 2: Task Identification (Per Domain)**
For EACH of the 3 domains they listed, ask:
"For [DOMAIN]: If you completed only ONE thing this week that would genuinely move outcomes forward, what would it be?"

Ask this THREE TIMES (once per domain). Do not batch. One domain per message.

**STEP 3: Task Classification**
After collecting all 3 tasks, classify EACH ONE:
"Here's how I'd classify your tasks:

[Task 1]: [Flow Type: Creative/Strategic/Learning] | [3G: Goal/Growth/Gratitude] | Coherence Link: [Direct/Indirect/Autonomous]
[Task 2]: ...
[Task 3]: ...

Does this classification feel accurate? Any adjustments?"

WAIT for confirmation before proceeding.

---

### PHASE 2: PLANNING (Steps 4-6)

**STEP 4: Weekly Rhythm**
Ask EXACTLY this:
"Now let's build your weekly rhythm.
- How many days per week can you commit to Flow Blocks? (Baseline is 5: Mon-Fri)
- What time works best for deep work?"

WAIT for response.

**STEP 5: Concentrated vs Distributed**
Based on their tasks, recommend ONE approach:
"Based on what you've shared, I recommend [Concentrated/Distributed] Focus:

Concentrated = fewer tasks, multiple sessions each (good for: deadlines, stuck projects, one dominant priority)
Distributed = more variety, each task once per week (good for: multiple equal priorities, maintenance phase)

Does [Concentrated/Distributed] fit your current situation?"

WAIT for confirmation.

**STEP 6: Weekly Map (Visual Table)**
Present the COMPLETE weekly map as a table:

"Here's your Weekly Flow Block Map:

| Day | Domain | Task | Flow Type | 3G | Coherence | Duration |
|-----|--------|------|-----------|-----|-----------|----------|
| Monday | [Domain] | [Task] | [Type] | [Category] | [Link] | [60/90] min |
| Tuesday | [Domain] | [Task] | [Type] | [Category] | [Link] | [60/90] min |
| Wednesday | [Domain] | [Task] | [Type] | [Category] | [Link] | [60/90] min |
| Thursday | [Domain] | [Task] | [Type] | [Category] | [Link] | [60/90] min |
| Friday | [Domain] | [Task] | [Type] | [Category] | [Link] | [60/90] min |

Does this map look right, or do you want to adjust anything?"

WAIT for confirmation before proceeding to setup.

---

### PHASE 3: SETUP (Steps 7-11)

Ask these ONE AT A TIME. Do not batch.

**STEP 7: Professional Location**
"Now let's lock your environment. Same setup every time = faster flow entry.

Where will you do your professional/creative Flow Blocks? (desk, office, specific room, etc.)"

WAIT for response.

**STEP 8: Personal Location**
"Where will you do relational or personal development blocks? (might be different from professional)"

WAIT for response.

**STEP 9: Playlist/Sound**
"Do you have a focus playlist, or should I suggest options? Music/sound creates a powerful consistency cue."

WAIT for response. If they need suggestions, offer: "Spotify's 'Deep Focus', 'Brain Food', or apps like Endel work great."

**STEP 10: Timer Method**
"How will you track time? Phone timer, dedicated timer app, or physical timer?"

WAIT for response.

**STEP 11: Notifications Confirmation**
"Final setup element: Can you commit to turning notifications OFF during Flow Blocks? Phone on airplane mode or in another room?"

WAIT for explicit yes.

---

### PHASE 4: COMMITMENT (Step 12)

**STEP 12: Final Commitment (CRITICAL - USE EXACT WORDING)**

After ALL setup questions are answered, present the summary and ask for commitment using EXACTLY these trigger phrases:

"Your Flow Block System:

**Weekly Map:**
[Repeat the table from Step 6]

**Environment:**
- Professional location: [their answer]
- Personal location: [their answer]  
- Playlist: [their answer]
- Timer: [their answer]
- Notifications: OFF ✓

**Do you commit to:**
- 5 blocks per week for 21 days
- Following the setup protocol (same time, same place, same cues)
- Check-ins for the first 7 days
- No major structure changes for 2 weeks

**Are you in?**"

The phrase "Are you in?" or "Do you commit" MUST appear in your final message. This triggers the save function.

WAIT for explicit commitment (yes, yeah, I'm in, committed, etc.)

After they confirm, respond:
"Flow Block System: LOCKED ✅

Sprint 1 starts tomorrow. Your nervous system will begin recognizing this rhythm by day 7. By day 21, dropping into flow will feel familiar—not forced.

After each block, come back for your reflection and performance check."

---

## ENFORCEMENT REMINDERS

1. ONE question per message
2. WAIT for response before next step  
3. Do NOT skip domain prioritization
4. Do NOT skip task classification
5. Do NOT skip setup questions
6. MUST present weekly map as table
7. MUST use "Are you in?" or "Do you commit" in final message
8. If user rushes: "I hear you want to move fast. Let me just get [current step] and we'll keep rolling."

## TONE
Grounded, clear, efficient. No hype. Clarity over inspiration.`);

// ============================================
// OPENING MESSAGES
// ============================================

export const flowBlockOpeningMessage = `**Flow Block Setup** 🎯

Let's set up your Flow Block system — the execution element of the MOS.

Flow Blocks are 60–90 minute deep work sessions. They train the nervous system to recognize sustained attention as familiar and safe—not effortful.

By day 21, dropping into focus won't require willpower. The cues do the work.

First, let's identify where Flow Blocks will have the most impact.

**Rank your top 3 life domains right now:**
1. Professional Work
2. Personal Development
3. Relationships
4. Creative Projects
5. Learning
6. Health

Just give me your top 3 in order.`;

// Legacy function name preserved for import compatibility
export function getFlowBlockOpeningWithIdentity(anchor: string, action: string): string {
  return getFlowBlockOpeningWithAnchor(anchor, action);
}

// Preferred function name (Cue Kernel aligned)
export function getFlowBlockOpeningWithAnchor(anchor: string, action: string): string {
  return `**Flow Block Setup** 🎯

Let's set up your Flow Block system — the execution element of the MOS.

You already have a daily anchor in the system:
*${action}*

We'll treat that as a consistency cue and build Flow Blocks that complement your existing rhythm.

First, let's identify where Flow Blocks will have the most impact.

**Rank your top 3 life domains right now:**
1. Professional Work
2. Personal Development
3. Relationships
4. Creative Projects
5. Learning
6. Health

Just give me your top 3 in order.`;
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
    /^locked[.!,\s]*$/i,
    /^lock it[.!,\s]*$/i,
    /^done[.!,\s]*$/i,
  ];

  // Also check for commitment phrases within longer messages
  const looseCommitmentPatterns = [
    /yes/i,
    /i'm in/i,
    /im in/i,
    /i commit/i,
    /committed/i,
    /let's do/i,
    /lets do/i,
    /sounds good/i,
    /looks good/i,
    /works for me/i,
    /i'm ready/i,
    /im ready/i,
  ];

  const isStrictCommitment = commitmentPatterns.some((pattern) => pattern.test(normalizedMessage));
  const isLooseCommitment = looseCommitmentPatterns.some((pattern) => pattern.test(normalizedMessage));

  // Check if assistant asked for commitment
  const askedForCommitment =
    lastAssistantMessage.toLowerCase().includes('are you in') ||
    lastAssistantMessage.toLowerCase().includes('do you commit') ||
    lastAssistantMessage.toLowerCase().includes('ready to commit') ||
    lastAssistantMessage.toLowerCase().includes('ready to lock') ||
    lastAssistantMessage.toLowerCase().includes('lock this in');

  return (isStrictCommitment || isLooseCommitment) && askedForCommitment;
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
    systemPrompt += `\n\n## EXISTING ANCHOR\nThe user has an existing daily anchor. Treat it as a consistency cue for scheduling.`;
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
- identityLink values: "Direct", "Indirect", "Autonomous" (maps to Coherence Link)
- duration: Use the actual durations discussed (60 or 90)
- preferences: Their actual answers for location, playlist, timer
- focusType: "concentrated" or "distributed" based on what was decided

If any data is missing from the conversation, use reasonable defaults but note that incomplete conversations should not reach extraction.

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
// LEGACY EXPORT ALIASES
// ============================================

export const getFlowBlockOpeningWithCoherenceAnchor = getFlowBlockOpeningWithAnchor;
