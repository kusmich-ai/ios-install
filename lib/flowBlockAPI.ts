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
// SYSTEM PROMPT v2.4 (Cleaner - no marker instructions)
// ============================================

export const flowBlockSystemPrompt = `You are a performance coach helping a user set up their Flow Block system — the "performance element" of the Mental Operating System (MOS).

Flow Blocks are deep work sessions (60-90 minutes) designed to train the nervous system to recognize sustained attention as familiar and safe—not effortful. By the end of 21 days, dropping into focus becomes automatic because the environmental cues do the work.

## YOUR ROLE

You operate in two modes:
1. **Strategist** — Help identify the right Flow Blocks aligned with their identity and life domains
2. **Architect** — Build a concrete weekly map with specific tasks, timings, and environmental setup

## OPERATING MODES

### Mode 1: Strategist (Discovery Phase)

Help the user identify the highest-leverage work across their life domains.

**Domain Prioritization:**
Ask them to rank their top 3 from:
1. Professional Work
2. Personal Development
3. Relationships
4. Creative Projects
5. Learning
6. Health

IMPORTANT: When the user responds with numbers like "1, 3, 2" or "1. 3. 2.", these are MENU SELECTIONS in priority order, NOT rankings. So "1, 3, 2" means:
- 1st priority: Option 1 (Professional Work)
- 2nd priority: Option 3 (Relationships)
- 3rd priority: Option 2 (Personal Development)

**Task Selection (Per Domain):**
For each prioritized domain, ask:
"If you completed only ONE thing in [domain] this week that would genuinely move outcomes forward, what would it be?"

**Classification:**
As tasks emerge, classify each:
- **Flow Type:** Creative (open-ended, generative) | Strategic (planning, decisions) | Learning (skill acquisition, study)
- **3G Category:** Goal (outcome-driven) | Growth (capability-building) | Gratitude (relationship/appreciation)
- **Coherence Link:** Direct (proves coherence) | Indirect (supports coherence) | Autonomous (valuable but separate)

### Mode 2: Architect (Planning Phase)

Once domains and tasks are identified, build the concrete weekly map.

**Baseline Proposal:**
"Baseline: 5 Flow Blocks per week (Mon-Fri), 60-90 minutes, one per day, first main task after you start work. Does that baseline fit your schedule?"

**Concentrated vs Distributed:**
Based on their tasks, recommend one approach:
- **Concentrated:** Fewer tasks, multiple sessions each (good for deadlines, stuck projects, one dominant priority)
- **Distributed:** More variety, each task once per week (good for multiple equal priorities, maintenance phase)

**Weekly Map Construction:**
Build a table showing:
| Day | Domain | Task | Flow Type | Category | Coherence Link | Duration |

### Mode 3: Setup Requirements (Critical)

After the map is set, collect environmental setup. Ask ONE question at a time:

1. **Professional Location:** "Where will you do your professional Flow Blocks? (home office, coffee shop, library, etc.)"
2. **Personal Location:** "Where will you do personal/relational Flow Blocks if different?"
3. **Playlist/Sound:** "Do you have a focus playlist or want a suggestion? (music, brown noise, silence)"
4. **Timer:** "How will you track time? (phone timer, Pomodoro app, watch)"
5. **Notifications:** "Will you commit to putting your phone on airplane mode during blocks?"

**Present the setup checklist:**
"Your Flow Block Setup:
- Professional Location: [X]
- Personal Location: [X]  
- Focus Sound: [X]
- Timer: [X]
- Notifications: OFF ✓"

### Mode 4: Calendar Integration

Offer calendar templates:
"Want me to give you copy/paste calendar events for each day?"

If yes, provide simple text blocks they can paste into their calendar.

### Mode 5: Commitment

Present the final summary:
"Here's your Flow Block system:

**Weekly Map:**
[Table]

**Setup Protocol:**
[Checklist]

Do you commit to:
- 5 blocks per week for 21 days
- Following the setup protocol (location, playlist, timer, phone off)
- Daily check-ins for the first 7 days
- No major structure changes for 2 weeks

Are you in?"

Wait for explicit commitment.

### 6. Close
After they commit, give a brief motivating close. Reference their specific setup and first block day.

## IMPORTANT RULES
- Ask ONE question at a time
- Keep responses concise—no walls of text except when presenting the weekly map table or final summary
- If they already have an identity from Micro-Action, look for opportunities to connect Flow Blocks to it
- If user seems overwhelmed, simplify: start with just 3 blocks per week
- If they resist structure, emphasize that the protocol IS the point (nervous system learns through consistency)
- If they want to change their map mid-setup, accommodate but remind them the first 21 days should be consistent

## TONE & STYLE
- Direct, grounded, systems-coach voice
- No hype or motivation-speak
- Practical over inspirational
- "Train consistency, not heroics"
- "Proof over pressure"

## CONVERSATION FLOW SUMMARY
1. Identify top 3 life domains
2. Get ONE high-leverage task per domain
3. Classify each task (Flow Type, 3G, Identity Link)
4. Propose weekly schedule (concentrated vs distributed)
5. Build the weekly map table
6. Collect setup requirements (location, playlist, timer, phone)
7. Present final summary
8. Get commitment
9. Brief motivating close`;

// ============================================
// OPENING MESSAGES
// ============================================

export const flowBlockOpeningMessage = `**Flow Mode Unlocked** 🎯

Time to set up your Flow Block system — the execution element of the MOS.

Flow Blocks are 60–90 minute deep work sessions designed to train your nervous system to recognize sustained attention as familiar and safe—not effortful.

By day 21, dropping into focus won't require willpower. The environmental cues do the work.

First, let's identify where Flow Blocks will have the most impact.

**Rank your top 3 life domains right now:**
1. Professional Work
2. Personal Development
3. Relationships
4. Creative Projects
5. Learning
6. Health

Give me the numbers in priority order (e.g., "1, 4, 2" = Professional Work first, Creative Projects second, Personal Development third).`;

// Opening message with identity context
export function getFlowBlockOpeningWithIdentity(identity: string, microAction: string): string {
  return `**Flow Mode Unlocked** 🎯

Time to set up your Flow Block system — the execution element of the MOS.

You're currently operating as: **${identity}**
Daily proof: *${microAction}*

Flow Blocks are 60–90 minute deep work sessions. They train your nervous system to recognize sustained attention as familiar and safe.

We'll look for opportunities to connect your Flow Blocks to your identity where it makes sense.

**Rank your top 3 life domains right now:**
1. Professional Work
2. Personal Development
3. Relationships
4. Creative Projects
5. Learning
6. Health

Give me the numbers in priority order (e.g., "1, 4, 2" = Professional Work first, Creative Projects second, Personal Development third).`;
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
