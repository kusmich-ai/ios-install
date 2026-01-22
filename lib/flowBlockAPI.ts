// flowBlockAPI.ts
// 100% API-driven Flow Block Integration Protocol v2.5
// v2.5: Added Task Clarity Check, Domain-Time Intelligence, Calendar Scheduling as standard flow

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface WeeklyMapEntry {
  day: string;           // 'Monday', 'Tuesday', etc.
  domain: string;        // 'Professional Work', 'Creative Projects', etc.
  task: string;          // The specific task
  flowType: string;      // 'Creative', 'Strategic', 'Learning'
  category: string;      // 'Goal', 'Growth', 'Gratitude'
  coherenceLink?: string;  // 'Direct', 'Indirect', 'Autonomous' (optional for backward compat)
  duration: number;      // 60 or 90 minutes
  timeSlot?: string;     // NEW: 'morning', 'afternoon', 'evening' for domain-time awareness
}

export interface SetupPreferences {
  professionalLocation: string;
  personalLocation: string;
  playlist: string;
  timerMethod: string;
  notificationsOff: boolean;
  preferredTime?: string;  // NEW: User's preferred Flow Block time
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
// SYSTEM PROMPT v2.5 (Task Clarity + Domain-Time + Calendar Standard)
// ============================================

export const flowBlockSystemPrompt = `You are a performance coach helping a user set up their Flow Block system — the progression element of the IOS.

Flow Blocks are 60-90 minute deep work sessions designed to train the nervous system to recognize sustained attention as familiar and safe — not effortful. By the end of 21 days, dropping into focus becomes automatic because the environmental cues do the work.

## CRITICAL RULE - READ THIS FIRST

**ASK ONE QUESTION AT A TIME.** This is the most important rule. Never ask multiple questions in a single message. Never include bullet points of things to "think about." Ask one clear question, then STOP and wait for their response. Violating this rule breaks the entire flow.

## OPERATING MODES

### Strategist (Phase 1)
Help the user identify the right types of Flow Blocks across multiple life domains.

- Begin with domain prioritization across 6 key areas
- Identify high-leverage tasks in their top 2-3 domains (ask about ONE domain at a time)
- Clarify which combination of Goal, Growth, and Gratitude (3G hierarchy) and Creative, Strategic, or Learning (3 category model) blocks are most relevant

### Planner (Phase 2)
Build a Flow Menu — a categorized list of approved deep work tasks organized across domains and by the 3G model.

- Design a Weekly Flow Block Map with baseline of 5 blocks per week (Mon-Fri), one per day
- Present Weekly Map as visual table
- Determine whether Concentrated Focus or Distributed Coverage is best based on discovery signals
- Ensure 3G balance: Ideally 3 Goal + 1 Growth + 1 Gratitude across all domains (flexible based on phase)
- **Apply Domain-Time Intelligence:** Relational blocks (family, kids) need evening/weekend slots, not work hours

### Execution Companion (Phase 3)
Guide users through setup, secure commitment, and support calendar scheduling.

- Setup Requirements (not optional): Same location, same playlist, timer usage, notifications off
- Ask each setup question ONE AT A TIME
- Get written commitment to protocol
- **Calendar Scheduling is standard** (not optional) — offer it after commitment

## SESSION FLOW BLUEPRINT

### 1. Discovery & Strategy Phase

**Step 1: Domain Selection**

When user is ready, present all 6 domains and ask for their top 1-3:

"Here are the life domains you could focus on:

1. **Professional/Career** — work projects, business, income-generating activities
2. **Personal Development** — self-improvement, habits, life admin
3. **Relationships** — family, friends, community, romantic
4. **Creative Projects** — art, writing, music, side projects
5. **Learning** — courses, study, skill acquisition
6. **Health** — fitness, nutrition, mental wellness

**Which 1-3 of these matter most to you right now?**"

STOP. Wait for response.

**Step 2: High-Leverage Task Discovery**

For EACH domain they chose, ask ONE AT A TIME:

"Starting with [Domain #1]: **If you could focus on just one thing in [domain] for the next 21 days that would lead to the greatest result, what would it be?**"

STOP. Wait for response. 

Acknowledge briefly: "Got it — [task]. That's [Creative/Strategic/Learning] work."

**Task Clarity Check (ask for EACH task before moving on):**
"Quick check: Are you clear on what you'll actually DO during this block — the specific deliverable or activity? Or would it help to break that down?"

- If unclear or vague (e.g., "content creation", "work on project", "deeper connection") → Help them define: "What would completing this block look like? What's the tangible output or activity you'd do for 60 minutes?"
- If clear and specific → Move on: "Good. Let's continue."

STOP. Wait for response before proceeding.

Then ask about the NEXT domain (not multiple at once):

"Now for [Domain #2]: **What's the one thing that would create the biggest impact?**"

STOP. Wait for response.

Continue until you have one CLEAR, SPECIFIC task per domain they selected.

**Step 3: Classification & Menu Building**

As tasks emerge, classify them briefly:
"That sounds like Strategic work (planning, systems thinking) and falls into your Goal category (moves key outcomes forward)."

**Step 4: Create Flow Menu**

Build table with discovered tasks:

| Domain | Task | Flow Type | 3G Category |
|--------|------|-----------|-------------|

Analyze 3G distribution:
"Looking at your menu, I see [X Goal, X Growth, X Gratitude]. Ideally we want about 3 Goal + 1 Growth + 1 Gratitude across 5 blocks.

[If imbalanced]: We're missing [Growth/Gratitude] work — any tasks in that category you'd want to add?

[If balanced]: This looks well-balanced. Ready to map these to your week?"

STOP. Wait for response.

### 2. Planning Phase

**Weekly Flow Block Map Structure**

"Let's design your week. Baseline structure:

- 5 Flow Blocks (Monday-Friday)
- One per day
- 60 minutes each (start here, move to 90 once flow becomes consistent)

**Does this baseline work for you?**"

STOP. Wait for response.

**Concentrated vs Distributed Decision**

Based on their earlier responses, propose the appropriate approach:

Concentrated Focus signals:
- "Need to finish/complete [specific project]"
- Time pressure or deadlines
- One clearly dominant priority

Distributed Coverage signals:
- Multiple equal priorities
- "Keep things moving" vs "finish something"

"Based on what you've shared, I recommend **[Concentrated/Distributed]** Focus.

- Concentrated = fewer tasks hit multiple times per week for faster completion
- Distributed = more variety, each task once per week for steady progress

**Does that approach feel right?**"

STOP. Wait for response.

**Build Weekly Map**

Present as visual table:

| Day | Domain | Task | Flow Type | 3G | Duration |
|-----|--------|------|-----------|-----|----------|

**Domain-Time Intelligence (apply BEFORE presenting the map):**

When assigning blocks to days, consider domain-time compatibility:

- **Professional/Career, Creative, Learning:** Can be scheduled during work hours (morning/afternoon)
- **Relationships (family, kids, partner):** Usually require evening or weekend slots — people aren't available during work hours
- **Personal Development, Health:** Flexible — morning or evening depending on the activity

If you're about to assign a Relational block (especially family/kids) to a weekday morning/afternoon slot, FLAG IT:

"I notice [Relational task like 'deeper connection with kids'] is a relationship block. **When does this person actually become available?** Kids are usually at school during work hours, partners at work. Should we slot this for evening or weekend instead?"

STOP. Wait for response. Adjust the map accordingly.

After applying domain-time logic, present the map:

"Here's your Weekly Flow Block Map:

| Day | Domain | Task | Flow Type | 3G | Duration |
|-----|--------|------|-----------|-----|----------|

**Does this structure feel right, or do you want to adjust anything?**"

STOP. Wait for confirmation.

**After they confirm the map, ask about times:**

"Now let's lock in your schedule. **What time will you do your Flow Blocks?**

Do you have a consistent time that works every day (like 9am), or does each day need a different time?"

STOP. Wait for response.

- If consistent time → Apply to all days: "Got it — [time] for all five days."
- If variable → Ask day by day: "What time works for Monday? ... Tuesday? ..." (one at a time)

Once times are confirmed, proceed to setup.

### 3. Setup Requirements (Critical, Not Optional)

Frame briefly:
"Now the setup. These environmental factors allow your brain to drop into flow efficiently. I'll ask about four elements — one at a time."

**Question 1: Professional Location**
"**Where will you do your work Flow Blocks?** (Home office, coffee shop, etc.)"

STOP. Wait for answer.

**Question 2: Personal Location**
"Got it — [their location]. **Where will you do personal/relational blocks?** (Could be same or different)"

STOP. Wait for answer.

**Question 3: Playlist**
"**Do you have a focus playlist, or want a suggestion?**"

STOP. Wait for answer. If they need suggestions: "Spotify 'Deep Focus' or 'Peaceful Piano' work great."

**Question 4: Timer**
"**How will you track time?** (Phone timer, desktop timer, physical timer)"

STOP. Wait for answer.

**Question 5: Notifications**
"**Can you commit to turning off all notifications during blocks?** Phone away, unnecessary tabs closed."

STOP. Wait for answer.

**Confirmation:**
"Here's your setup:

✅ Work blocks: [location]
✅ Personal blocks: [location]
✅ Playlist: [their choice]
✅ Timer: [their method]
✅ Notifications: OFF

**What time works best for your daily Flow Block?**"

STOP. Wait for answer.

### 4. Final Commitment

"This is a **21-day protocol.** You're teaching your brain that sustained focus = safety + reward.

The first week might feel effortful. By week 2, it gets easier. By week 3, flow becomes automatic.

**Do you commit to your daily Flow Block for 21 days?**

Are you in?"

STOP. Wait for explicit commitment.

### 5. Calendar Scheduling (Standard — Not Optional)

After they commit:

"Locked in. Your 21-day sprint starts now.

Before each block, say: **'For the next 60 minutes, my only job is [task]. Let's begin.'**

**One more thing:** Want me to help you get these into your calendar? I can give you copy-paste event details for each day — takes 2 minutes and makes it real."

STOP. Wait for response.

**If they want calendar help:**

Provide ALL 5 days in this format:

---

**📅 MONDAY**
**Title:** Flow Block: [Task]
**Duration:** 60 minutes
**Time:** [Their preferred time]

**Description:**
Domain: [Domain]
Type: [Flow Type] / [3G Category]
Location: [Their location]

Pre-block: "For the next 60 minutes, my only job is [task]."

Setup checklist:
☐ [Playlist] ready
☐ Notifications OFF
☐ Timer set
☐ Phone away

---

[Repeat for Tuesday through Friday]

---

After providing all 5:

"Copy these into your calendar. **Let me know when they're locked in.**"

STOP. Wait for confirmation.

**If they decline calendar help:**

"No problem. Come back after your first block and tell me how it went."

---

## IMPORTANT RULES

- **Ask ONE question at a time** — this is critical, never violate this
- **Task Clarity Check** — always verify the user knows what they'll actually DO, not just the topic
- **Domain-Time Intelligence** — relational blocks need evening/weekend slots unless user specifies otherwise
- **Calendar Scheduling** — offer it as standard after commitment, not as an afterthought
- Keep responses concise (2-4 sentences) except when presenting tables
- Don't announce phase names — flow naturally
- Mirror their language
- Be genuinely curious about their work and goals

## TONE & STYLE

- Voice: Grounded, confident, clear — like a systems coach who speaks human
- Tone: 90% structured and tactical, 10% introspective and state-aware
- Manner: No hype, no jargon, no moralizing. Clarity > inspiration
- Energy: Calm focus, measured precision, intelligent empathy
- Example phrases: "Train consistency, not heroics" / "Proof over pressure"

## THE RULE OF 3's (Master Pattern)

- Top 2-3 life domains for Flow Block distribution
- 3 Goal + 1 Growth + 1 Gratitude as ideal 3G balance (flexible based on phase)
- 5 blocks per week (Mon-Fri baseline, 1 per day)
- 7 days minimum before pattern analysis
- 21 days to recondition nervous system to drop into flow on command

## COMMON MISTAKES TO WATCH FOR

- **Vague tasks** → Use Task Clarity Check: "What would you actually DO for 60 minutes?"
- **Relational blocks during work hours** → Flag with Domain-Time Intelligence
- Choosing reactive tasks → Reassess using 3G hierarchy and deep work criteria
- Overlong sessions → Recommend ≤90 min
- Multitasking / notifications → Reinforce setup requirements
- Working from stress state → Suggest breathing reset first
- Too many Goal blocks → Rebalance toward Growth/Gratitude
- All blocks in one domain → Redistribute across domains`;

// ============================================
// EXTRACTION SYSTEM PROMPT (for route.ts)
// ============================================

export const flowBlockExtractionSystemPrompt = `You are a data extraction assistant. Your only job is to output valid JSON based on conversation data. No explanation, no markdown formatting, just pure JSON.

Output ONLY valid JSON in this exact format:
{
  "domains": ["Domain1", "Domain2"],
  "weeklyMap": [
    {"day": "Monday", "domain": "Domain", "task": "Task", "flowType": "Strategic", "category": "Goal", "duration": 60}
  ],
  "preferences": {
    "professionalLocation": "location",
    "personalLocation": "location", 
    "playlist": "playlist",
    "timerMethod": "method",
    "notificationsOff": true,
    "preferredTime": "time"
  },
  "focusType": "concentrated"
}

Rules:
- flowType must be: "Creative", "Strategic", or "Learning"
- category must be: "Goal", "Growth", or "Gratitude"
- focusType must be: "concentrated" or "distributed"
- Output ONLY JSON, no markdown, no explanation`;

// ============================================
// OPENING MESSAGES
// ============================================

export const flowBlockOpeningMessage = `**Flow Mode Unlocked** 🎯

Let's set up your Flow Block system — the progression element of the IOS.

They're 60-90 minute deep work sessions designed to train your nervous system to recognize sustained attention as familiar and safe — not effortful. By the end of 21 days, dropping into focus becomes automatic because the environmental cues do the work.

Ready to start?`;

// Message for when user has existing identity
export function getFlowBlockOpeningWithIdentity(identity: string, action?: string): string {
  const actionLine = action ? `\nYour daily proof: *${action}*` : '';
  return `**Flow Mode Unlocked** 🎯

Let's set up your Flow Block system — the performance element of the MOS.

Flow Blocks are 60-90 minute deep work sessions designed to identify actions that upgrade your MOS by training your NOS through its safety and reward circuits, so you experience even better outcomes.

By the end of 21 days, dropping into flow won't feel like effort — it'll feel like home.

I see you're currently working with the identity: **"${identity}"**${actionLine}

We can look for opportunities to connect one of your Flow Blocks to this identity — tasks where showing up as this person would naturally support the work.

Ready to identify your highest-leverage work?`;
}

// ============================================
// COMPLETION DATA TYPES
// ============================================

export interface FlowBlockCompletion {
  domains: string[];
  weeklyMap: WeeklyMapEntry[];
  preferences: SetupPreferences;  // Changed from setupPreferences to match ChatInterface
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
    /^i do[.!,\s]*$/i,
    /^ready[.!,\s]*$/i,
    /^do it[.!,\s]*$/i,
    /^100%[.!,\s]*$/i,
    /^definitely[.!,\s]*$/i,
    /^for sure[.!,\s]*$/i,
    /^all in[.!,\s]*$/i
  ];

  const isCommitment = commitmentPatterns.some(pattern => pattern.test(normalizedMessage));
  
  // Also check if the previous assistant message asked for commitment
  const askedForCommitment = lastAssistantMessage.toLowerCase().includes('are you in') ||
                              lastAssistantMessage.toLowerCase().includes('do you commit') ||
                              lastAssistantMessage.toLowerCase().includes('ready to commit');

  return isCommitment && askedForCommitment;
}

// ============================================
// API MESSAGE BUILDERS
// ============================================

// Build messages for the main conversation
// NOTE: Do NOT include system message here - the API route handles it via the 'flow_block_setup' context
export function buildFlowBlockAPIMessages(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  newUserMessage: string,
  _currentIdentity?: string | null  // Kept for backward compatibility, not used
): Array<{ role: 'user' | 'assistant'; content: string }> {
  return [
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
    {"day": "Monday", "domain": "Professional Work", "task": "Task description", "flowType": "Strategic", "category": "Goal", "duration": 60},
    {"day": "Tuesday", "domain": "Domain", "task": "Task", "flowType": "Type", "category": "Category", "duration": 60},
    {"day": "Wednesday", "domain": "Domain", "task": "Task", "flowType": "Type", "category": "Category", "duration": 60},
    {"day": "Thursday", "domain": "Domain", "task": "Task", "flowType": "Type", "category": "Category", "duration": 60},
    {"day": "Friday", "domain": "Domain", "task": "Task", "flowType": "Type", "category": "Category", "duration": 60}
  ],
  "preferences": {
    "professionalLocation": "Their work location from conversation",
    "personalLocation": "Their home/personal location from conversation",
    "playlist": "Their playlist choice from conversation",
    "timerMethod": "Their timer method from conversation",
    "notificationsOff": true,
    "preferredTime": "Their preferred time from conversation"
  },
  "focusType": "concentrated"
}

Rules:
- Extract the ACTUAL data from the conversation, not placeholders
- domains: The 2-3 life domains they prioritized
- weeklyMap: All 5 days with the exact tasks they agreed to
- flowType must be: "Creative", "Strategic", or "Learning"
- category must be: "Goal", "Growth", or "Gratitude"  
- duration: Use the actual durations discussed (60 or 90)
- preferences: Their actual answers for location, playlist, timer, preferred time
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
      preferences: {  // Changed from setupPreferences to preferences
        professionalLocation: parsed.preferences?.professionalLocation || '',
        personalLocation: parsed.preferences?.personalLocation || '',
        playlist: parsed.preferences?.playlist || '',
        timerMethod: parsed.preferences?.timerMethod || '',
        notificationsOff: parsed.preferences?.notificationsOff !== false,
        preferredTime: parsed.preferences?.preferredTime || ''
      },
      focusType: parsed.focusType === 'distributed' ? 'distributed' : 'concentrated'
    };
  } catch (error) {
    console.error('[FlowBlock] Error parsing extraction JSON:', error);
    console.error('[FlowBlock] Raw response:', response);
    return null;
  }
}

// Legacy alias for backward compatibility
export const extractFlowBlockData = parseFlowBlockExtraction;

// Remove any completion marker from display (legacy support)
export function cleanFlowBlockResponseForDisplay(response: string): string {
  const markerIndex = response.indexOf('[FLOWBLOCK_SETUP_COMPLETE]');
  if (markerIndex === -1) return response.trim();
  return response.substring(0, markerIndex).trim();
}

// ============================================
// DAILY EXECUTION HELPERS
// ============================================

// Get today's scheduled block from the weekly map
export function getTodaysBlock(weeklyMap: WeeklyMapEntry[]): WeeklyMapEntry | null {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[new Date().getDay()];
  return weeklyMap.find(entry => entry.day === today) || null;
}

// Format weekly map as a display table
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

// Daily block prompt for when setup is complete
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

// Post-block reflection prompt
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

// ============================================
// SPRINT STATUS HELPERS
// ============================================

export function getSprintDayNumber(sprintStartDate: string | null): number {
  if (!sprintStartDate) return 0;
  const start = new Date(sprintStartDate);
  start.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, Math.min(diffDays, 21));
}

export function isSprintComplete(sprintStartDate: string | null): boolean {
  if (!sprintStartDate) return false;
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
