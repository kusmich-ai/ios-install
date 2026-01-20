// lib/flowBlockAPI.ts
// 100% API-driven Flow Block Integration Protocol v2.4
// Claude handles all the discovery, planning, and setup naturally
// v2.4: Two-stage completion - natural response + silent extraction call

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface WeeklyMapEntry {
  day: string;           // 'Monday', 'Tuesday', etc.
  domain: string;        // 'Professional Work', 'Creative Projects', etc.
  task: string;          // The specific task
  flowType: string;      // 'Creative', 'Strategic', 'Learning'
  category: string;      // 'Goal', 'Growth', 'Gratitude'
  coherenceLink: string; // 'Direct', 'Indirect', 'Autonomous'
  duration: number;      // 60 or 90 minutes
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
// SYSTEM PROMPT v2.5 (Tighter Step Sequence)
// ============================================

export const flowBlockSystemPrompt = `You are a performance coach helping a user set up their Flow Block system — the "performance element" of the Mental Operating System (MOS).

Flow Blocks are deep work sessions (60-90 minutes) designed to train the nervous system to recognize sustained attention as familiar and safe—not effortful. By the end of 21 days, dropping into focus becomes automatic because the environmental cues do the work.

## CRITICAL: FOLLOW THIS EXACT SEQUENCE

You MUST complete ALL steps in order. Do NOT skip steps. Do NOT combine questions. Ask ONE question, wait for answer, then proceed.

---

### STEP 1: Confirm Domain Selection
When user provides their 3 domains, confirm them:
"Got it: 1) [Domain], 2) [Domain], 3) [Domain]. Correct?"

If they give numbers like "1, 3, 2", these are MENU SELECTIONS:
- "1, 3, 2" = Professional Work, Relationships, Personal Development

---

### STEP 2: Task for Domain 1
"For **[Domain 1]**: If you completed only ONE thing this week that would genuinely move outcomes forward, what would it be?"

Wait for answer.

---

### STEP 3: Task for Domain 2
"For **[Domain 2]**: Same question — ONE thing this week?"

Wait for answer.

---

### STEP 4: Task for Domain 3
"For **[Domain 3]**: And the third — ONE high-leverage task?"

Wait for answer.

---

### STEP 5: Classification
Present all 3 tasks classified:

"Here's how I'd classify your tasks:

**[Task 1]** ([Domain 1])
→ Flow Type: Creative/Strategic/Learning
→ Category: Goal/Growth/Gratitude  
→ Coherence Link: Direct/Indirect/Autonomous

**[Task 2]** ([Domain 2])
→ Flow Type: Creative/Strategic/Learning
→ Category: Goal/Growth/Gratitude
→ Coherence Link: Direct/Indirect/Autonomous

**[Task 3]** ([Domain 3])
→ Flow Type: Creative/Strategic/Learning
→ Category: Goal/Growth/Gratitude
→ Coherence Link: Direct/Indirect/Autonomous

Look right?"

Wait for confirmation.

---

### STEP 6: Schedule
"How many days per week for Flow Blocks? And what time works best?"

Wait for answer.

---

### STEP 7: Weekly Map Table
Build and present the table:

"Here's your weekly map:

| Day | Domain | Task | Duration |
|-----|--------|------|----------|
| Monday | [Domain] | [Task] | 90 min |
| Tuesday | [Domain] | [Task] | 60 min |
| Wednesday | [Domain] | [Task] | 90 min |
| Thursday | [Domain] | [Task] | 60 min |
| Friday | [Domain] | [Task] | 60 min |

Any changes needed?"

Wait for confirmation.

---

### STEP 8: Location
"Where will you do your Flow Blocks? (home office, coffee shop, etc.)"

Wait for answer.

---

### STEP 9: Playlist
"Focus playlist — do you have one, or want a suggestion?"

Wait for answer.

---

### STEP 10: Timer
"How will you track time? (phone timer, app, watch)"

Wait for answer.

---

### STEP 11: Phone
"Will you commit to phone on airplane mode during blocks?"

Wait for answer.

---

### STEP 12: Final Summary & Commitment
Present everything and ask for commitment:

"**Your Flow Block System:**

**Weekly Map:**
[Table from Step 7]

**Setup Protocol:**
- Location: [X]
- Sound: [X]
- Timer: [X]
- Phone: Airplane mode ✓

**21-Day Commitment:**
- [X] blocks per week
- Same setup every session
- No major changes for 2 weeks

**Are you in?**"

IMPORTANT: You MUST end with "Are you in?" — this triggers the save.

---

## RULES
- ONE question per message
- Do NOT skip steps
- Do NOT improvise extra steps
- Keep responses SHORT (2-4 sentences max except for tables/summaries)
- ALWAYS end setup with "Are you in?"

## TONE
Direct. Grounded. No hype. Systems-coach voice.`;

// ============================================
// OPENING MESSAGES
// ============================================

export const flowBlockOpeningMessage = `**Flow Block Setup** 🎯

Let's build your weekly deep work schedule. Takes about 3 minutes.

**Pick your top 3 life domains** (give me the numbers in priority order):
1. Professional Work
2. Personal Development
3. Relationships
4. Creative Projects
5. Learning
6. Health

Example: "1, 4, 2" = Professional Work first, Creative Projects second, Personal Development third.`;

// Opening message with identity context
export function getFlowBlockOpeningWithIdentity(identity: string, microAction: string): string {
  return `**Flow Block Setup** 🎯

Let's build your weekly deep work schedule. Takes about 3 minutes.

You're currently operating as: **${identity}**
Daily proof: *${microAction}*

We'll connect your Flow Blocks to your coherence statement where it makes sense.

**Pick your top 3 life domains** (numbers in priority order):
1. Professional Work
2. Personal Development
3. Relationships
4. Creative Projects
5. Learning
6. Health

Example: "1, 4, 2" = Professional Work first, Creative Projects second, Personal Development third.`;
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

// Check if user message is a commitment response
export function isCommitmentResponse(
  userMessage: string, 
  lastAssistantMessage: string
): boolean {
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
    /^ready[.!,\s]*$/i,
    /^locked[.!,\s]*$/i,
    /^done[.!,\s]*$/i,
    /^100%[.!,\s]*$/i,
  ];

  const isCommitment = commitmentPatterns.some(pattern => pattern.test(normalizedMessage));
  
  const askedForCommitment = 
    lastAssistantMessage.toLowerCase().includes('are you in') ||
    lastAssistantMessage.toLowerCase().includes('do you commit') ||
    lastAssistantMessage.toLowerCase().includes('ready to commit');

  return isCommitment && askedForCommitment;
}

// ============================================
// API MESSAGE BUILDERS
// ============================================

// Build messages for the main conversation
export function buildFlowBlockAPIMessages(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  newUserMessage: string,
  currentIdentity?: string
): Array<{ role: 'user' | 'assistant' | 'system'; content: string }> {
  // Add identity context to system prompt if available
  let systemPrompt = flowBlockSystemPrompt;
  if (currentIdentity) {
    systemPrompt += `\n\n## IDENTITY CONTEXT\nThe user's current Micro-Action identity is: "${currentIdentity}". Look for opportunities to connect one of their Flow Blocks to this identity if it makes sense.`;
  }

  return [
    { role: 'system' as const, content: systemPrompt },
    ...conversationHistory,
    { role: 'user' as const, content: newUserMessage }
  ];
}

// Build messages for the silent extraction call (stage 2)
export function buildFlowBlockExtractionMessages(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Array<{ role: 'user' | 'assistant' | 'system'; content: string }> {
  
  const extractionPrompt = `Based on the Flow Block setup conversation above, extract ALL the data into this exact JSON format.

IMPORTANT: Output ONLY valid JSON. No markdown, no explanation, no backticks. Just the JSON object.

{
  "domains": ["Domain1", "Domain2", "Domain3"],
  "weeklyMap": [
    {"day": "Monday", "domain": "Professional Work", "task": "Task description", "flowType": "Strategic", "category": "Goal", "coherenceLink": "Direct", "duration": 90},
    {"day": "Tuesday", "domain": "Domain", "task": "Task", "flowType": "Type", "category": "Category", "coherenceLink": "Link", "duration": 60},
    {"day": "Wednesday", "domain": "Domain", "task": "Task", "flowType": "Type", "category": "Category", "coherenceLink": "Link", "duration": 90},
    {"day": "Thursday", "domain": "Domain", "task": "Task", "flowType": "Type", "category": "Category", "coherenceLink": "Link", "duration": 60},
    {"day": "Friday", "domain": "Domain", "task": "Task", "flowType": "Type", "category": "Category", "coherenceLink": "Link", "duration": 60}
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
- coherenceLink must be: "Direct", "Indirect", or "Autonomous"
- duration: Use the actual durations discussed (60 or 90)
- preferences: Their actual answers for location, playlist, timer
- focusType: "concentrated" or "distributed" based on what was decided

Output the JSON now:`;

  return [
    { role: 'system' as const, content: 'You are a data extraction assistant. Your only job is to output valid JSON based on conversation data. No explanation, no markdown formatting, just pure JSON.' },
    ...conversationHistory,
    { role: 'user' as const, content: extractionPrompt }
  ];
}

// ============================================
// EXTRACTION PARSING
// ============================================

// Parse the extraction response (expects pure JSON)
export function parseFlowBlockExtraction(response: string): FlowBlockCompletion | null {
  try {
    // Clean up any markdown formatting that might have slipped through
    let cleanResponse = response.trim();
    
    // Remove markdown code blocks if present
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.slice(7);
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.slice(3);
    }
    if (cleanResponse.endsWith('```')) {
      cleanResponse = cleanResponse.slice(0, -3);
    }
    cleanResponse = cleanResponse.trim();
    
    // Find JSON object boundaries
    const startIndex = cleanResponse.indexOf('{');
    const endIndex = cleanResponse.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
      console.error('[FlowBlock] No JSON object found in extraction response');
      return null;
    }
    
    const jsonString = cleanResponse.substring(startIndex, endIndex + 1);
    const parsed = JSON.parse(jsonString);
    
    // Validate required fields exist
    if (!parsed.domains || !parsed.weeklyMap || !parsed.preferences) {
      console.error('[FlowBlock] Missing required fields in extraction');
      return null;
    }
    
    return {
      domains: parsed.domains || [],
      weeklyMap: parsed.weeklyMap || [],
      setupPreferences: {
        professionalLocation: parsed.preferences?.professionalLocation || '',
        personalLocation: parsed.preferences?.personalLocation || '',
        playlist: parsed.preferences?.playlist || '',
        timerMethod: parsed.preferences?.timerMethod || '',
        notificationsOff: parsed.preferences?.notificationsOff !== false
      },
      focusType: parsed.focusType === 'distributed' ? 'distributed' : 'concentrated'
    };
  } catch (error) {
    console.error('[FlowBlock] Error parsing extraction JSON:', error);
    console.error('[FlowBlock] Raw response:', response);
    return null;
  }
}

// Legacy function for backward compatibility (if marker approach is ever used)
export function parseFlowBlockCompletion(response: string): FlowBlockCompletion | null {
  const markerIndex = response.indexOf('[FLOWBLOCK_SETUP_COMPLETE]');
  if (markerIndex === -1) return null;

  const afterMarker = response.substring(markerIndex + '[FLOWBLOCK_SETUP_COMPLETE]'.length).trim();
  const jsonMatch = afterMarker.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      domains: parsed.domains || [],
      weeklyMap: parsed.weeklyMap || [],
      setupPreferences: parsed.preferences || {
        professionalLocation: '',
        personalLocation: '',
        playlist: '',
        timerMethod: '',
        notificationsOff: true
      },
      focusType: parsed.focusType || 'distributed'
    };
  } catch (error) {
    console.error('[FlowBlock] Error parsing completion JSON:', error);
    return null;
  }
}

// Remove any completion marker from display (legacy support)
export function cleanFlowBlockResponseForDisplay(response: string): string {
  const markerIndex = response.indexOf('[FLOWBLOCK_SETUP_COMPLETE]');
  if (markerIndex === -1) return response.trim();
  return response.substring(0, markerIndex).trim();
}

// ============================================
// DAILY FLOW BLOCK HELPERS
// ============================================

export function getTodaysBlock(weeklyMap: WeeklyMapEntry[]): WeeklyMapEntry | null {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[new Date().getDay()];
  return weeklyMap.find(entry => entry.day === today) || null;
}

export function formatWeeklyMapForDisplay(weeklyMap: WeeklyMapEntry[]): string {
  let table = `| Day | Domain | Task | Type | Category | Duration |
|-----|--------|------|------|----------|----------|`;

  for (const entry of weeklyMap) {
    table += `\n| ${entry.day} | ${entry.domain} | ${entry.task} | ${entry.flowType} | ${entry.category} | ${entry.duration} min |`;
  }

  return table;
}

// Daily Flow Block prompt
export function getDailyFlowBlockPrompt(todaysBlock: WeeklyMapEntry, preferences: SetupPreferences): string {
  return `**Today's Flow Block** 🎯

**Task:** ${todaysBlock.task}
**Domain:** ${todaysBlock.domain}
**Duration:** ${todaysBlock.duration} minutes
**Type:** ${todaysBlock.flowType}

**Setup Checklist:**
- [ ] Location: ${preferences.professionalLocation || preferences.personalLocation}
- [ ] Sound: ${preferences.playlist}
- [ ] Timer: ${preferences.timerMethod}
- [ ] Phone: Airplane mode

**Intention:** For the next ${todaysBlock.duration} minutes, your only job is: ${todaysBlock.task}

Ready to start? Once you begin, I'll check in after you're done.`;
}

// Post-block reflection prompt
export const postBlockReflectionPrompt = `**Flow Block Complete** ✓

Quick debrief (takes 30 seconds):

1. **One-sentence reflection:** What was the learning from today?

2. **Performance Tags (1-5):**
   - Focus Quality: How sustained was attention?
   - Challenge-Skill Balance: Too easy (1), balanced (3), too hard (5)?
   - Energy After: Drained (1) or calm satisfaction (5)?
   - Flow Presence: Did time distort? Did mental chatter fade?

Give me your ratings (e.g., "4, 3, 4, 5") and your reflection.`;

// ============================================
// SPRINT STATUS HELPERS
// ============================================

// Calculate which day of the current sprint we're on (1-21)
export function getSprintDayNumber(sprintStartDate: string): number {
  const start = new Date(sprintStartDate);
  start.setHours(0, 0, 0, 0);
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  return Math.max(1, Math.min(diffDays, 21));
}

// Check if current sprint is complete
export function isSprintComplete(sprintStartDate: string): boolean {
  const start = new Date(sprintStartDate);
  start.setHours(0, 0, 0, 0);
  
  const endDate = new Date(start);
  endDate.setDate(endDate.getDate() + 21);
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  return now >= endDate;
}

// Sprint complete message
export const sprintCompleteMessage = (sprintNumber: number) => `**21-Day Flow Block Sprint ${sprintNumber} Complete** 🎉

You've completed a full cycle. Let's review what your nervous system learned.

**Reflection Questions:**
- Which blocks felt most natural by the end?
- Which domain improved most?
- What environmental factor made the biggest difference?
- Where did resistance show up, and what did you learn from it?

**Options:**
1) **Continue** — Keep the same map for another 21 days
2) **Evolve** — Adjust tasks/durations while keeping structure
3) **Redesign** — New discovery phase with different domains

Which path forward?`;
