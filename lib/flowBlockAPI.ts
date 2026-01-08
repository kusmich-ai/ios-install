// flowBlockAPI.ts
// 100% API-driven Flow Block Integration Protocol v2.5 (Cue-Compatible Coherence Link)
// v2.5: Replace Identity Integration with Coherence Link + extraction schema update

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface WeeklyMapEntry {
  day: string;           // 'Monday', 'Tuesday', etc.
  domain: string;        // 'Professional Work', 'Creative Projects', etc.
  task: string;          // The specific task
  flowType: string;      // 'Creative', 'Strategic', 'Learning'
  category: string;      // 'Goal', 'Growth', 'Gratitude'
  coherenceLink: string; // 'Direct', 'Indirect', 'Standalone'
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
  sprintNumber: 1
};

// ============================================
// SYSTEM PROMPT v2.5 (Coherence Link)
// ============================================

export const flowBlockSystemPrompt = `You are a performance coach helping a user set up their Flow Block system — the "performance element" of the Mental Operating System (MOS).

Flow Blocks identify actions that upgrade the MOS by training the NOS through its safety and reward circuits. Your job is to help users identify high-leverage Flow Blocks across key life domains, distribute them across the week, and execute them with clarity and consistency.

## OPERATING MODES

### Strategist (Phase 1)
Help the user identify the right Flow Blocks across multiple life domains that align with their goals, coherence constraints, and nervous system state.

- Begin with domain prioritization across 6 key areas: Professional Work, Personal Development, Relationships, Creative Projects, Learning, Health
- Identify high-leverage tasks in top 3 domains
- Clarify which combination of Goal, Growth, and Gratitude (3G hierarchy) and Creative, Strategic, or Learning (3 category model) blocks are most relevant

**Coherence Link (optional):**
- If the user has a Morning Micro-Action, treat it as a behavioral constraint (“today’s coherence proof”), not an identity.
- Flow Blocks work standalone; linking is optional.

### Planner (Phase 2)
Build a Flow Menu — a categorized list of approved deep work tasks organized across domains and by the 3G model.

- Design a Weekly Flow Block Map with baseline of 5 blocks per week (Mon-Fri), one per day
- Timing default: First main task after work day starts
- Present Weekly Map as visual table by default for clarity
- Determine whether Concentrated Focus (fewer tasks, multiple sessions) or Distributed Coverage (more tasks, once each) is best based on discovery signals
- Ensure 3G balance: Ideally 3 Goal + 1 Growth + 1 Gratitude across all domains (flexible based on phase)

### Execution Companion (Phase 3)
Guide users through pre-block preparation, secure commitment, and support calendar scheduling.

- Setup Requirements (not optional): Same location, same playlist, timer usage, notifications off
- Get written commitment to protocol
- Support calendar scheduling with templates and guidance

## SESSION FLOW BLUEPRINT

### Opening Frame
The opening message has already set context and asked about their Morning Micro-Action (if any).

### 1. Discovery & Strategy Phase

**Step 1: Domain Prioritization**
30-second primer before discovery:
"Quick context before we dive in: We'll organize your work into three types (Creative/Strategic/Learning) and three priorities (Goal/Growth/Gratitude) to create the right balance across your week."

Then prompt:
"Rank your top 3 domains by current importance — which areas would genuinely move your world forward if you made progress there?

- Professional Work
- Personal Development
- Relationships
- Creative Projects
- Learning
- Health"

**Step 2: High-Leverage Task Discovery (Per Domain)**
For each of the user's top 3 domains, ask:
"If you completed only ONE thing in [domain] today, what would genuinely move your world forward?"

Also explicitly prompt for relational/personal blocks:
"Any personal or relational areas where deep, focused presence would be valuable? These can absolutely be Flow Blocks."

**Step 3: Classification & Menu Building**
Classify tasks using brief inline definitions.

If user has multiple tasks in same domain:
Ask: "Which matters most right now? We can use Concentrated Focus (fewer tasks multiple times) or Distributed Coverage (more variety once each)."

**Step 4: Create Flow Menu Draft**
Build table with discovered tasks showing: Domain, Task, Flow Type, 3G Category, Coherence Link

Analyze 3G distribution and adjust as needed.

### 2. Planning Phase

Present weekly map as a table:
| Day | Domain | Task | Flow Type | 3G | Coherence Link | Duration | Notes |
|-----|--------|------|-----------|----|---------------|----------|-------|

### 3. Setup Requirements (Critical, Not Optional)
(keep your existing setup flow)

### 4. Calendar Scheduling Support
(keep your existing scheduling flow)

### 5. Final Commitment
(keep your existing commitment flow)

## IMPORTANT RULES
- Ask ONE question at a time
- Wait for their answer before moving to the next step
- Keep responses concise (2-4 sentences) except when presenting tables or final summary
- Don't announce phase names — flow naturally
- Mirror their language

## 3 LEVELS OF COHERENCE LINK (optional)
- Direct: Task is a direct expression of the Morning Micro-Action constraint
- Indirect: Task expresses the same meta-quality (focus, courage, calm)
- Standalone: Task chosen by 3G fit; no linkage required

## COMMON MISTAKES TO WATCH FOR
(keep your existing list, but remove “identity” wording where present)
`;

// ============================================
// OPENING MESSAGES
// ============================================

export const flowBlockOpeningMessage = `**Flow Mode Unlocked** 🎯

Let's set up your Flow Block system — the performance element of the MOS.

Flow Blocks are 60-90 minute deep work sessions designed to train sustained focus by linking attention to safety + reward circuitry.

Before we design your highest-leverage blocks, do you currently have a Morning Micro-Action (a coherence constraint) you want to factor in?

If so, share it and we'll optionally link one block to it. If not, we'll start fresh.

What's your situation?`;

// Message for when user has existing micro-action context
export function getFlowBlockOpeningWithIdentity(coherenceTarget: string, action: string): string {
  return `**Flow Mode Unlocked** 🎯

Let's set up your Flow Block system — the performance element of the MOS.

Flow Blocks are 60-90 minute deep work sessions designed to train sustained focus by linking attention to safety + reward circuitry.

I see you're currently training this coherence target: **"${coherenceTarget}"**
Your daily proof action: *${action}*

We can optionally link one Flow Block to this constraint where it naturally fits.

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
    /^i do[.!,\s]*$/i,
    /^ready[.!,\s]*$/i,
    /^do it[.!,\s]*$/i,
    /^100%[.!,\s]*$/i,
    /^definitely[.!,\s]*$/i,
    /^for sure[.!,\s]*$/i,
    /^all in[.!,\s]*$/i
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

export function buildFlowBlockAPIMessages(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  newUserMessage: string,
  currentCoherenceTarget?: string
): Array<{ role: 'user' | 'assistant' | 'system'; content: string }> {
  let systemPrompt = flowBlockSystemPrompt;
  if (currentCoherenceTarget) {
    systemPrompt += `\n\n## COHERENCE CONTEXT\nThe user's current Morning Micro-Action coherence target is: "${currentCoherenceTarget}". Linking Flow Blocks is optional; only link if it naturally fits.`;
  }

  return [
    { role: 'system' as const, content: systemPrompt },
    ...conversationHistory,
    { role: 'user' as const, content: newUserMessage }
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
    {"day": "Monday", "domain": "Professional Work", "task": "Task description", "flowType": "Strategic", "category": "Goal", "coherenceLink": "Standalone", "duration": 90},
    {"day": "Tuesday", "domain": "Domain", "task": "Task", "flowType": "Type", "category": "Category", "coherenceLink": "Indirect", "duration": 60},
    {"day": "Wednesday", "domain": "Domain", "task": "Task", "flowType": "Type", "category": "Category", "coherenceLink": "Direct", "duration": 90},
    {"day": "Thursday", "domain": "Domain", "task": "Task", "flowType": "Type", "category": "Category", "coherenceLink": "Standalone", "duration": 60},
    {"day": "Friday", "domain": "Domain", "task": "Task", "flowType": "Type", "category": "Category", "coherenceLink": "Standalone", "duration": 60}
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
- coherenceLink must be: "Direct", "Indirect", or "Standalone"
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

export function parseFlowBlockExtraction(response: string): FlowBlockCompletion | null {
  try {
    let cleanResponse = response.trim();

    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.slice(7);
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.slice(3);
    }
    if (cleanResponse.endsWith('```')) {
      cleanResponse = cleanResponse.slice(0, -3);
    }
    cleanResponse = cleanResponse.trim();

    const startIndex = cleanResponse.indexOf('{');
    const endIndex = cleanResponse.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1) {
      console.error('[FlowBlock] No JSON object found in extraction response');
      return null;
    }

    const jsonString = cleanResponse.substring(startIndex, endIndex + 1);
    const parsed = JSON.parse(jsonString);

    if (!parsed.domains || !parsed.weeklyMap || !parsed.preferences) {
      console.error('[FlowBlock] Missing required fields in extraction');
      return null;
    }

    return {
      domains: parsed.domains || [],
      weeklyMap: (parsed.weeklyMap || []).map((e: any) => ({
        day: e.day,
        domain: e.domain,
        task: e.task,
        flowType: e.flowType,
        category: e.category,
        coherenceLink: e.coherenceLink || 'Standalone',
        duration: e.duration
      })),
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

// Legacy support (marker approach)
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
      weeklyMap: (parsed.weeklyMap || []).map((e: any) => ({
        day: e.day,
        domain: e.domain,
        task: e.task,
        flowType: e.flowType,
        category: e.category,
        coherenceLink: e.coherenceLink || e.identityLink || 'Standalone',
        duration: e.duration
      })),
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
  return weeklyMap.find(entry => entry.day === today) || null;
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
  const location = block.domain.includes('Professional') ||
                   block.domain.includes('Creative') ||
                   block.domain.includes('Learning')
    ? preferences.professionalLocation
    : preferences.personalLocation;

  return `**Today's Flow Block: ${block.task}**

**${block.duration} minutes** • ${block.domain} • ${block.flowType}/${block.category}

---

**Environment Check:**
• Location: ${location}
• Playlist: ${preferences.playlist}
• Timer: Ready
• Phone: Off/away

---

**Before you begin, say this aloud or write it:**

*"For the next ${block.duration} minutes, my only job is ${block.task}. Let's begin."*

---

Come back when you're done for your reflection and performance tagging.`;
}

export const postBlockReflectionPrompt = `**Block complete.** Nice work.

Quick debrief (this takes 60 seconds):

**1. One-sentence reflection:**
What was the learning from today?

**2. Performance Tagging (1-5):**
• **Focus Quality:** How sustained was your attention?
• **Challenge-Skill Balance:** Too easy (1), balanced (3), too hard (5)?
• **Energy After:** Drained (1) or calm satisfaction (5)?
• **Flow Presence:** Did time distort? Did mental chatter fade?

Give me your ratings (e.g., "4, 3, 4, 5") and your reflection.`;

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

export const sprintCompleteMessage = (sprintNumber: number) => `**21-Day Flow Block Sprint ${sprintNumber} Complete** 🎉

You've completed a full cycle. Let's review what your nervous system learned.

**Reflection Questions:**
- Which Flow Block types felt most effortless?
- Where did focus drop most often?
- Did challenge or environment play a bigger role?
- How did different domains compare in terms of flow quality?

**Evolution Options for Sprint ${sprintNumber + 1}:**
- Keep the same weekly map (if it's working)
- Adjust task difficulty (if boredom or overwhelm appeared)
- Expand duration (60 → 75 → 90 min progression)
- Shift 3G distribution based on current life phase
- Add new domains or retire completed projects
- Switch between Concentrated ↔ Distributed focus

Would you like to:
1. **Continue** with the same weekly map for Sprint ${sprintNumber + 1}
2. **Evolve** - make adjustments to your current setup
3. **Redesign** - start fresh with new discovery

What feels right?`;
