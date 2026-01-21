// lib/flowBlockAPI.ts
// v2.4 Clean - Two-Stage Extraction Pattern
// NO cue kernel, NO withToolLayers - just a clean installer prompt
// Uses coherenceLink (not identityLink)

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
// SYSTEM PROMPT v2.4 (Clean - No Cue Kernel)
// ============================================

export const flowBlockSystemPrompt = `You are a performance coach helping a user set up their Flow Block system — the "performance element" of the Mental Operating System (MOS).

Flow Blocks are deep work sessions (60-90 minutes) designed to train the nervous system to recognize sustained attention as familiar and safe—not effortful. By the end of 21 days, dropping into focus becomes automatic because the environmental cues do the work.

## YOUR ROLE

You operate in two modes:
1. **Strategist** — Help identify the right Flow Blocks aligned with their goals and life domains
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
- **Coherence Link:** Direct (task requires deliberate focus) | Indirect (task supports focus indirectly) | Autonomous (task independent of other work)

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
- If user seems overwhelmed, simplify: start with just 3 blocks per week
- If they resist structure, emphasize that the protocol IS the point (nervous system learns through consistency)
- If they want to change their map mid-setup, accommodate but remind them the first 21 days should be consistent

## TONE & STYLE
- Direct, grounded, systems-coach voice
- No hype or motivation-speak
- Practical over inspirational
- "Train consistency, not heroics"

## CONVERSATION FLOW SUMMARY
1. Identify top 3 life domains
2. Get ONE high-leverage task per domain
3. Classify each task (Flow Type, 3G, Coherence Link)
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

Time to build your deep work architecture — the system that trains your nervous system to drop into focus on command.

**Pick your top 3 life domains** (give me the numbers in priority order):
1. Professional Work
2. Personal Development
3. Relationships
4. Creative Projects
5. Learning
6. Health

Example: "1, 4, 2" = Professional Work first, Creative Projects second, Personal Development third.`;

// For users who already have an identity/coherence anchor from Micro-Action
export function getFlowBlockOpeningWithAnchor(anchor: string, action: string): string {
  return `**Flow Mode Unlocked** 🎯

Your coherence anchor: "${anchor}"
Your daily proof: "${action}"

Now let's build the deep work architecture that reinforces this.

**Pick your top 3 life domains** (numbers in priority order):
1. Professional Work
2. Personal Development
3. Relationships
4. Creative Projects
5. Learning
6. Health

Which three matter most right now?`;
}
// Legacy alias for backward compatibility
export const getFlowBlockOpeningWithIdentity = getFlowBlockOpeningWithAnchor;
// ============================================
// COMMITMENT DETECTION (Two-Stage Extraction)
// ============================================

export interface FlowBlockExtraction {
  domains: string[];
  weeklyMap: WeeklyMapEntry[];
  setupPreferences: SetupPreferences;
  focusType: 'concentrated' | 'distributed';
}

// Check if user's message indicates commitment
export function isCommitmentResponse(userMessage: string, lastAssistantMessage: string): boolean {
  const commitmentPhrases = [
    'yes', 'yeah', 'yep', 'yup', 'sure', 'absolutely', 'definitely',
    'i commit', 'i\'m in', 'im in', 'let\'s do it', 'lets do it',
    'let\'s go', 'lets go', 'i\'m ready', 'im ready', 'count me in',
    'deal', 'done', 'agreed', 'sounds good', 'perfect', 'locked in'
  ];
  
  const lowerMessage = userMessage.toLowerCase().trim();
  const hasCommitmentPhrase = commitmentPhrases.some(phrase => 
    lowerMessage.includes(phrase) || lowerMessage === phrase
  );
  
  // Also check if assistant just asked for commitment
  const lowerAssistant = lastAssistantMessage.toLowerCase();
  const wasCommitmentQuestion = 
    lowerAssistant.includes('are you in') ||
    lowerAssistant.includes('do you commit') ||
    lowerAssistant.includes('ready to commit') ||
    lowerAssistant.includes('ready to lock') ||
    lowerAssistant.includes('sound good');
  
  return hasCommitmentPhrase && wasCommitmentQuestion;
}

// ============================================
// API MESSAGE BUILDERS
// ============================================

// Build messages for the main conversation API call
export function buildFlowBlockAPIMessages(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  userMessage: string,
  _currentIdentity?: string // Optional third param for backward compatibility (unused in v2.4)
): Array<{ role: 'user' | 'assistant' | 'system'; content: string }> {
  const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
    { role: 'system', content: flowBlockSystemPrompt }
  ];
  
  // Add conversation history
  for (const msg of conversationHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }
  
  // Add current user message
  messages.push({ role: 'user', content: userMessage });
  
  return messages;
}

// Build messages for the silent extraction API call
export function buildFlowBlockExtractionMessages(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Array<{ role: 'user' | 'assistant' | 'system'; content: string }> {
  const extractionPrompt = `Based on the conversation above, extract the Flow Block setup data in this exact JSON format:

{
  "domains": ["Domain 1", "Domain 2", "Domain 3"],
  "weeklyMap": [
    {
      "day": "Monday",
      "domain": "Professional Work",
      "task": "The specific task",
      "flowType": "Creative|Strategic|Learning",
      "category": "Goal|Growth|Gratitude",
      "coherenceLink": "Direct|Indirect|Autonomous",
      "duration": 90
    }
  ],
  "setupPreferences": {
    "professionalLocation": "home office",
    "personalLocation": "same or different location",
    "playlist": "their playlist choice",
    "timerMethod": "phone timer",
    "notificationsOff": true
  },
  "focusType": "concentrated|distributed"
}

IMPORTANT:
- Extract EXACTLY what was discussed, don't invent data
- If something wasn't mentioned, use reasonable defaults
- weeklyMap should have one entry per day discussed (usually Mon-Fri)
- Use "coherenceLink" (not "identityLink")
- Return ONLY the JSON, no other text`;

  const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
    { role: 'system', content: 'You are a data extraction assistant. Extract structured data from conversations.' }
  ];
  
  // Add full conversation as context
  for (const msg of conversationHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }
  
  // Add extraction request
  messages.push({ role: 'user', content: extractionPrompt });
  
  return messages;
}

// Parse the extraction response
export function parseFlowBlockExtraction(response: string): FlowBlockExtraction | null {
  try {
    // Try to find JSON in the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[FlowBlock] No JSON found in extraction response');
      return null;
    }
    
    const data = JSON.parse(jsonMatch[0]);
    
    // Validate required fields
    if (!data.domains || !Array.isArray(data.domains)) {
      console.error('[FlowBlock] Missing or invalid domains');
      return null;
    }
    
    if (!data.weeklyMap || !Array.isArray(data.weeklyMap)) {
      console.error('[FlowBlock] Missing or invalid weeklyMap');
      return null;
    }
    
    // Normalize weeklyMap entries - handle both identityLink and coherenceLink
    const normalizedMap: WeeklyMapEntry[] = data.weeklyMap.map((entry: Record<string, unknown>) => ({
      day: String(entry.day || ''),
      domain: String(entry.domain || ''),
      task: String(entry.task || ''),
      flowType: String(entry.flowType || 'Strategic'),
      category: String(entry.category || 'Goal'),
      coherenceLink: String(entry.coherenceLink || entry.identityLink || 'Direct'),
      duration: Number(entry.duration) || 60
    }));
    
    return {
      domains: data.domains,
      weeklyMap: normalizedMap,
      setupPreferences: data.setupPreferences || {
        professionalLocation: 'home office',
        personalLocation: 'home office',
        playlist: 'focus playlist',
        timerMethod: 'phone timer',
        notificationsOff: true
      },
      focusType: data.focusType || 'distributed'
    };
  } catch (error) {
    console.error('[FlowBlock] Failed to parse extraction:', error);
    return null;
  }
}

// ============================================
// LEGACY COMPLETION MARKER (for backward compatibility)
// ============================================

export interface FlowBlockCompletion {
  domains: string[];
  weeklyMap: WeeklyMapEntry[];
  setupPreferences: SetupPreferences;
  focusType: 'concentrated' | 'distributed';
}

export function parseFlowBlockCompletion(response: string): FlowBlockCompletion | null {
  // Legacy parser for inline completion markers
  const completionMatch = response.match(/\[FLOW_BLOCK_COMPLETE:\s*(\{[\s\S]*?\})\s*\]/);
  if (!completionMatch) return null;
  
  try {
    return JSON.parse(completionMatch[1]);
  } catch {
    return null;
  }
}

// Clean response for display (remove any completion markers)
export function cleanFlowBlockResponseForDisplay(response: string): string {
  return response
    .replace(/\[FLOW_BLOCK_COMPLETE:[\s\S]*?\]/g, '')
    .replace(/\[FLOWBLOCK_COMPLETE:[\s\S]*?\]/g, '')
    .trim();
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Get today's scheduled block
export function getTodaysBlock(weeklyMap: WeeklyMapEntry[]): WeeklyMapEntry | null {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[new Date().getDay()];
  return weeklyMap.find(entry => entry.day === today) || null;
}

// Format weekly map for display
export function formatWeeklyMapForDisplay(weeklyMap: WeeklyMapEntry[]): string {
  if (!weeklyMap || weeklyMap.length === 0) return 'No weekly map configured';
  
  const header = '| Day | Domain | Task | Type | Duration |';
  const divider = '|-----|--------|------|------|----------|';
  const rows = weeklyMap.map(entry => 
    `| ${entry.day} | ${entry.domain} | ${entry.task} | ${entry.flowType} | ${entry.duration}min |`
  );
  
  return [header, divider, ...rows].join('\n');
}

// ============================================
// DAILY FLOW BLOCK PROMPTS
// ============================================

export function getDailyFlowBlockPrompt(block: WeeklyMapEntry, dayNumber: number): string {
  return `**Day ${dayNumber} Flow Block**

Today's focus: **${block.task}** (${block.domain})

**Setup Protocol:**
1. Go to your designated location
2. Start your focus playlist
3. Set timer for ${block.duration} minutes
4. Phone on airplane mode
5. Say: "For the next ${block.duration} minutes, my only job is ${block.task}."

Ready to begin?`;
}

export const postBlockReflectionPrompt = `Flow Block complete.

Quick debrief:
1. Focus quality (1-5)?
2. Challenge vs skill balance — too easy, balanced, or too hard?
3. One sentence: what did you learn or produce?`;

// ============================================
// SPRINT TRACKING
// ============================================

export function getSprintDayNumber(startDate: string): number {
  const start = new Date(startDate);
  const today = new Date();
  const diffTime = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.min(diffDays + 1, 21); // Cap at 21
}

export function isSprintComplete(startDate: string): boolean {
  return getSprintDayNumber(startDate) >= 21;
}

export function sprintCompleteMessage(sprintNumber: number): string {
  return `**21-Day Flow Block Sprint ${sprintNumber} Complete** 🎯

Your nervous system has been trained. The environmental cues are now doing the heavy lifting.

**Review:**
- Which blocks produced the cleanest focus?
- Where did distraction show up most?
- What environmental tweaks helped?
- Which domains got the most traction?

**Options:**
1) **Continue** — Same map, keep the momentum
2) **Evolve** — Adjust tasks, timing, or domains
3) **Redesign** — Full new discovery if priorities shifted

Which direction?`;
}
