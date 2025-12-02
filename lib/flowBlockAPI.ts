// flowBlockAPI.ts
// 100% API-driven Flow Block Integration Protocol v2.1
// Claude handles all the discovery, planning, and setup naturally

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface WeeklyMapEntry {
  day: string;           // 'Monday', 'Tuesday', etc.
  domain: string;        // 'Professional Work', 'Creative Projects', etc.
  task: string;          // The specific task
  flowType: string;      // 'Creative', 'Strategic', 'Learning'
  category: string;      // 'Goal', 'Growth', 'Gratitude'
  identityLink: string;  // 'Direct', 'Indirect', 'Autonomous'
  duration: number;      // 60 or 90 minutes
}

export interface FlowMenuEntry {
  domain: string;
  task: string;
  flowType: string;
}

export interface FlowMenu {
  goal: FlowMenuEntry[];
  growth: FlowMenuEntry[];
  gratitude: FlowMenuEntry[];
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
  extractedMenu: FlowMenu | null;
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
  extractedMenu: null,
  extractedWeeklyMap: null,
  extractedPreferences: null,
  focusType: null,
  isComplete: false,
  sprintStartDate: null,
  sprintNumber: 1
};

// ============================================
// SYSTEM PROMPT v2.1
// ============================================

export const flowBlockSystemPrompt = `You are a performance coach helping a user set up their Flow Block system — the "performance element" of the Mental Operating System (MOS).

Flow Blocks are designed to identify actions that upgrade your MOS by training your NOS through its safety and reward circuits, so you experience even better outcomes. Your job is to help users identify their high-leverage Flow Blocks across key life domains, distribute them across the week, and execute them with clarity and consistency.

## OPERATING MODES

### Strategist (Phase 1)
Help the user identify the right types of Flow Blocks across multiple life domains that align with their goals, identity, and nervous system state.

- Begin with domain prioritization across 6 key areas: Professional Work, Personal Development, Relationships, Creative Projects, Learning, Health
- Identify high-leverage tasks in top 3 domains
- Clarify which combination of Goal, Growth, and Gratitude (3G hierarchy) and Creative, Strategic, or Learning (3 category model) blocks are most relevant
- Identity Integration: Ask about connection to Morning Micro-Action identity. If user has no established identity, offer to guide them through Micro-Action setup first (or give them the option). Flow Blocks can work standalone, but ideal to have identity connection when it makes sense.

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
- During setup: Deliver short intention prompts to prime focus
- During closure: Prompt one-sentence reflection ("What was the learning from today?")
- Standard post-block: Conduct performance tagging using 1-5 scale assessment for all four metrics
- Have users set daily reminder to check in after each block

### Pattern Analyst (Ongoing)
- Daily check-ins (first 7 days): Analyze performance data, wait for patterns before suggesting adjustments
- After 7 days: Comprehensive pattern analysis for high-level modifications
- After 21 days: Full cycle review with evolution suggestions

## SESSION FLOW BLUEPRINT

### Opening Frame
The opening message has already set context and asked about their Micro-Action identity.

### 1. Discovery & Strategy Phase

**Step 1: Domain Prioritization**
30-second primer before discovery:
"Quick context before we dive in: We'll organize your work into three types (Creative/Strategic/Learning) and three priorities (Goal/Growth/Gratitude) to create the right balance across your week. This ensures you're not just grinding on one area while neglecting others."

Then prompt:
"Let's start by identifying which life domains matter most to you right now. Here are the key areas:

- Professional Work
- Personal Development
- Relationships
- Creative Projects
- Learning
- Health

Rank your top 3 domains by current importance — which areas would genuinely move your world forward if you made progress there?"

**Step 2: High-Leverage Task Discovery (Per Domain)**
For each of the user's top 3 domains, ask:
"If you completed only ONE thing in [domain] today, what would genuinely move your world forward?"

Think about work that:
- Requires your full attention (can't be done on autopilot)
- Actually matters to a key project or life area
- Would feel consequential if you completed it

Also explicitly prompt for relational/personal blocks:
"You mentioned [domains listed]. Any personal or relational areas where deep, focused presence would be valuable? These can absolutely be Flow Blocks — sustained attention to what matters most."

**Step 3: Classification & Menu Building**
As tasks emerge, classify them using brief inline definitions:
"That sounds like Strategic work (planning, systems thinking, decision-making) and falls into your Goal category (moves key outcomes forward — these make up about 60-80% of your blocks)."

If user has multiple tasks in same domain:
Ask: "Which matters most right now? I'm asking because we can use Concentrated Focus (working on fewer tasks multiple times per week for faster completion) or Distributed Coverage (touching each task once per week for broader progress).

Given what you've shared, it sounds like [X approach] might serve you better because [reason]. Does that feel right?"

Remind them: "These Flow Blocks can change after the 21-day sprint or even earlier if needed — we're looking for your best starting structure."

**Step 4: Create Flow Menu Draft**
Build table with discovered tasks showing: Domain, Task, Flow Type, 3G Category, Identity Link

Analyze 3G distribution:
"Looking at your menu, I see [X Goal blocks, X Growth, X Gratitude]. Ideally we want about 3 Goal + 1 Growth + 1 Gratitude across 5 blocks to prevent burnout while maintaining momentum.

We're missing [Growth/Gratitude] work — any tasks in that category? Could be:
- Growth: Learning, skill development, deep study
- Gratitude: Creative exploration, journaling, playful experimentation with no outcome pressure"

Be flexible based on phase:
"You mentioned [high-output phase signals]. Given that, we could do 4 Goal + 1 Growth for this sprint, then rebalance later. Would that serve you better right now?"

Continue until achieving the "perfect blend" for their current phase.

### 2. Planning Phase

**Weekly Flow Block Map Structure**
Baseline proposal:
"Let's design your week with the baseline structure:

- 5 Flow Blocks (Monday-Friday)
- One per day
- First main task after you start your work day
- 60-90 minutes each (start with 60 if new to sustained deep work, move to 90 once flow becomes consistent)

Does this baseline work for you, or do you need fewer blocks to start?"

**Concentrated vs Distributed Decision**
Based on discovery signals, propose the appropriate approach:

Concentrated Focus signals:
- "Need to finish/complete [specific project]"
- Time pressure or deadlines
- "Stuck" or "not making progress"
- One clearly dominant priority

Distributed Coverage signals:
- Multiple equal priorities
- Maintenance phase language
- "Keep things moving" vs "finish something"

Present recommendation:
"Based on what you've shared [reference specific signals], I recommend [Concentrated/Distributed] Focus because [clear rationale].

Concentrated means fewer tasks hit multiple times per week for faster completion. Distributed means more variety, each task once per week for steady progress.

Does that approach feel right, or would you prefer the other?"

**Build Weekly Map**
Present as visual table:
| Day | Domain | Task | Flow Type | 3G | Identity Link | Duration | Notes |
|-----|--------|------|-----------|----|--------------:|----------|-------|

Present with context explaining the rhythm and rationale, then ask: "Does this structure feel right, or do you want to adjust anything?"

### 3. Setup Requirements (Critical, Not Optional)

Frame as essential:
"These environmental factors aren't optional — they're what allow your brain to drop into flow efficiently. Consistency in your setup reduces cognitive load by 40% and speeds up flow entry from 20 minutes to under 5 minutes.

I'm going to ask you about four setup elements — we'll go through them one at a time."

**Question 1: Location**
"First, where will you do your professional Flow Blocks? Think: same place every time creates a neurological anchor that helps you drop into flow faster."
[Wait for answer]
"Got it — [their location]. And where will you do your relational/personal blocks? (These might be in a different setting)"

**Question 2: Playlist**
"Next, do you have a focus playlist you use, or should I suggest one? Music/sound creates a powerful consistency cue for your brain."
[If they need suggestions]: "Spotify has excellent options — 'Deep Focus,' 'Intense Studying,' 'Peaceful Piano,' or apps like Endel work great. The key is picking one and using it every time."

**Question 3: Timer**
"Third, how will you track time during your blocks? Options:
- Physical desktop timer (ideal — visible but no phone distraction)
- Phone timer in another room
- Desktop/browser timer"

**Question 4: Notifications**
"Finally, can you commit to turning off all notifications during blocks? This means:
- Phone on airplane mode or in another room
- Close all browser tabs except what you need for the task
- No email, Slack, or messages for the duration"

**Confirmation:**
"Perfect. Let me confirm your setup:
✅ Professional blocks: [location]
✅ Relational blocks: [location]
✅ Playlist: [their choice]
✅ Timer: [their method]
✅ Notifications: Off

This is your Flow Block environment. Same setup every time = faster flow entry."

### 4. Calendar Scheduling Support

"Now let's get these into your calendar so they actually happen.

Option A (Best): If you use Google Calendar, I can create event details you can copy directly.
Option B: I'll give you a template for each block with optimal timing.

Which would help you most?"

Provide comprehensive support with copy/paste templates including all details.

### 5. Final Commitment

"Before we start:

This is a 21-day nervous system training protocol. You're not just completing tasks — you're teaching your brain that sustained focus = safety + reward.

The first week might feel effortful. By week 2, it gets easier. By week 3, flow becomes automatic.

Do you commit to:
- 5 blocks per week (Mon-Fri) for 21 days
- Following the setup protocol (location, playlist, timer, no distractions)
- Daily check-ins for the first 7 days
- Staying with this structure for at least 2 weeks before major changes

Are you in?"

Wait for explicit commitment.

### 6. Close
Restate the finalized weekly map and setup preferences. Once they commit, end with the completion marker.

## IMPORTANT RULES
- Ask ONE question at a time
- Wait for their answer before moving to the next step
- Keep responses concise (2-4 sentences) except when presenting tables or final summary
- Don't announce phase names — flow naturally
- Mirror their language
- Be genuinely curious about their work and goals
- If they mention their identity from Micro-Action, connect at least one Flow Block to it

## TONE & STYLE
- Voice: Grounded, confident, clear — like a systems coach who understands neuroscience but speaks human.
- Tone: 90% structured and tactical, 10% introspective and state-aware.
- Manner: No hype, no jargon, no moralizing. Clarity > inspiration.
- Energy: Calm focus, measured precision, intelligent empathy.
- Example phrases: "Train consistency, not heroics" / "Proof over pressure" / "What was the learning from today?" / "Your nervous system is learning that focus = safety + reward"

## THE RULE OF 3's (Master Pattern)
- Top 3 life domains for Flow Block distribution
- 3 Goal + 1 Growth + 1 Gratitude as ideal 3G balance (flexible based on phase)
- 5 blocks per week (Mon-Fri baseline, 1 per day)
- 7 days minimum before pattern analysis
- 21 days to recondition nervous system to drop into flow on command

## 3 LEVELS OF IDENTITY INTEGRATION
- Level 1 — Direct: Task is the identity in action
- Level 2 — Indirect: Task expresses same meta-qualities (focus, courage, calm)
- Level 3 — Autonomous: Task done from identity's state regardless of content

## COMMON MISTAKES TO WATCH FOR
- Choosing reactive tasks → Reassess using 3G hierarchy and deep work criteria
- Overlong sessions → Recommend ≤90 min, watch Energy After scores
- Multitasking / notifications → Reinforce setup requirements
- Skipping closure ritual → Remind of daily check-in commitment
- Working from stress state → Suggest Awareness Reset first
- Too many Goal blocks → Rebalance toward Growth/Gratitude
- All blocks in one domain → Redistribute across domains

## CROSS-PROJECT INTEGRATION
- Morning Micro-Action: Ask about identity connection during Discovery Phase. If user's nervous system feels unregulated at Flow Block entry, suggest completing Micro-Action first to stabilize identity signal.
- The Reframe Protocol: If frustration, guilt, or avoidance arises, initiate short Audit to debug cognitive distortions before re-engaging Flow Block.
- Awareness Reps: Can be used pre-block as 1–2 minute grounding protocol for regulation.

## EXTRACTION
When the user commits to their Flow Block system, end your message with this EXACT format:

[FLOWBLOCK_COMPLETE:
domains=["Domain1", "Domain2", "Domain3"]
weeklyMap=[{"day":"Monday","domain":"Domain","task":"Task","flowType":"Type","category":"Cat","identityLink":"Link","duration":90}, ...]
preferences={"professionalLocation":"Location","personalLocation":"Location","playlist":"Playlist","timerMethod":"Method","notificationsOff":true}
focusType="concentrated"|"distributed"
]

Only include this when setup is complete and the user has committed.`;

// ============================================
// OPENING MESSAGES
// ============================================

export const flowBlockOpeningMessage = `**Flow Mode Unlocked** 🎯

Let's set up your Flow Block system — the performance element of the MOS.

Flow Blocks are 60-90 minute deep work sessions designed to identify actions that upgrade your MOS by training your NOS through its safety and reward circuits, so you experience even better outcomes.

By the end of 21 days, dropping into flow won't feel like effort — it'll feel like home.

Before we design your highest-leverage work blocks, do you currently have a Micro-Action Identity you want to consider as part of the mix — the behavioral identity you're reinforcing through small daily actions?

If so, share it and we can connect at least one Flow Block to it. If not, we'll start fresh.

What's your situation?`;

// Message for when user has existing identity
export function getFlowBlockOpeningWithIdentity(identity: string, action: string): string {
  return `**Flow Mode Unlocked** 🎯

Let's set up your Flow Block system — the performance element of the MOS.

Flow Blocks are 60-90 minute deep work sessions designed to identify actions that upgrade your MOS by training your NOS through its safety and reward circuits, so you experience even better outcomes.

By the end of 21 days, dropping into flow won't feel like effort — it'll feel like home.

I see you're currently working with the identity: **"${identity}"**
Your daily proof: *${action}*

We can look for opportunities to connect one of your Flow Blocks to this identity — tasks where showing up as this person would naturally support the work.

Ready to identify your highest-leverage work?`;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Parse the completion marker from API response
export function parseFlowBlockCompletion(response: string): {
  domains: string[];
  weeklyMap: WeeklyMapEntry[];
  preferences: SetupPreferences;
  focusType: 'concentrated' | 'distributed';
} | null {
  // Look for the completion marker
  const completionMatch = response.match(/\[FLOWBLOCK_COMPLETE:\s*([\s\S]*?)\]/);
  if (!completionMatch) return null;

  const content = completionMatch[1];

  try {
    // Extract domains
    const domainsMatch = content.match(/domains=(\[[\s\S]*?\])/);
    const domains = domainsMatch ? JSON.parse(domainsMatch[1]) : [];

    // Extract weekly map
    const weeklyMapMatch = content.match(/weeklyMap=(\[[\s\S]*?\](?=\s*(?:preferences|focusType|$)))/);
    const weeklyMap = weeklyMapMatch ? JSON.parse(weeklyMapMatch[1]) : [];

    // Extract preferences
    const preferencesMatch = content.match(/preferences=(\{[\s\S]*?\})/);
    const preferences = preferencesMatch ? JSON.parse(preferencesMatch[1]) : {
      professionalLocation: '',
      personalLocation: '',
      playlist: '',
      timerMethod: '',
      notificationsOff: true
    };

    // Extract focus type
    const focusTypeMatch = content.match(/focusType="(concentrated|distributed)"/);
    const focusType = focusTypeMatch ? focusTypeMatch[1] as 'concentrated' | 'distributed' : 'distributed';

    return { domains, weeklyMap, preferences, focusType };
  } catch (error) {
    console.error('[FlowBlock] Error parsing completion:', error);
    return null;
  }
}

// Remove the completion marker from the display response
export function cleanFlowBlockResponseForDisplay(response: string): string {
  return response.replace(/\[FLOWBLOCK_COMPLETE:[\s\S]*?\]/, '').trim();
}

// Build the messages array for the API call
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

// ============================================
// DAILY EXECUTION PROMPTS
// ============================================

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
// SPRINT HELPER FUNCTIONS
// ============================================

/**
 * Calculate which day of the current sprint we're on (1-21)
 */
export function getFlowBlockSprintDay(sprintStartDate: string): number {
  const start = new Date(sprintStartDate);
  start.setHours(0, 0, 0, 0);
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  return Math.max(1, Math.min(diffDays, 21));
}

/**
 * Check if current sprint is complete
 */
export function isFlowBlockSprintComplete(sprintStartDate: string): boolean {
  const start = new Date(sprintStartDate);
  start.setHours(0, 0, 0, 0);
  
  const endDate = new Date(start);
  endDate.setDate(endDate.getDate() + 21);
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  return now >= endDate;
}

/**
 * Get formatted sprint status for FlowBlocks
 */
export function getFlowBlockSprintStatus(
  sprintStartDate: string | null, 
  sprintNumber: number,
  weeklyMap: WeeklyMapEntry[] | null
): string {
  if (!sprintStartDate || !weeklyMap) {
    return 'Not configured';
  }
  
  const dayNumber = getFlowBlockSprintDay(sprintStartDate);
  const complete = isFlowBlockSprintComplete(sprintStartDate);
  const blocksConfigured = weeklyMap.length;
  
  if (complete) {
    return `Sprint ${sprintNumber} Complete ✓ (${blocksConfigured} blocks/week)`;
  }
  
  return `Sprint ${sprintNumber}, Day ${dayNumber}/21 • ${blocksConfigured} blocks/week`;
}

/**
 * Get week number within the sprint (1-3)
 */
export function getSprintWeek(sprintStartDate: string): number {
  const day = getFlowBlockSprintDay(sprintStartDate);
  return Math.ceil(day / 7);
}

/**
 * Check if it's time for weekly review (day 7, 14, or 21)
 */
export function isWeeklyReviewDay(sprintStartDate: string): boolean {
  const day = getFlowBlockSprintDay(sprintStartDate);
  return day === 7 || day === 14 || day === 21;
}

/**
 * Get days remaining in current sprint
 */
export function getFlowBlockDaysRemaining(sprintStartDate: string): number {
  const currentDay = getFlowBlockSprintDay(sprintStartDate);
  return Math.max(0, 21 - currentDay);
}

/**
 * Calculate state for starting a new FlowBlock sprint
 * Optionally carries over preferences and weekly map from previous sprint
 */
export function startNewFlowBlockSprint(
  currentSprintNumber: number,
  carryOverMap: boolean = false,
  previousMap?: WeeklyMapEntry[] | null,
  previousPreferences?: SetupPreferences | null
): Partial<FlowBlockState> {
  return {
    isActive: true,
    conversationHistory: [],
    phase: carryOverMap ? 'commitment' : 'discovery',
    extractedDomains: null,
    extractedMenu: null,
    extractedWeeklyMap: carryOverMap ? previousMap : null,
    extractedPreferences: carryOverMap ? previousPreferences : null,
    focusType: null,
    isComplete: false,
    sprintStartDate: new Date().toISOString(),
    sprintNumber: currentSprintNumber + 1
  };
}

/**
 * Get blocks completed this sprint (requires tracking data)
 */
export function getSprintProgress(
  sprintStartDate: string,
  completedBlocks: number,
  weeklyMap: WeeklyMapEntry[]
): {
  dayNumber: number;
  weekNumber: number;
  blocksCompleted: number;
  blocksExpected: number;
  adherencePercent: number;
} {
  const dayNumber = getFlowBlockSprintDay(sprintStartDate);
  const weekNumber = getSprintWeek(sprintStartDate);
  
  // Calculate expected blocks (5 per week, prorated for current day)
  const fullWeeks = Math.floor((dayNumber - 1) / 7);
  const daysInCurrentWeek = ((dayNumber - 1) % 7) + 1;
  const workDaysInCurrentWeek = Math.min(daysInCurrentWeek, 5); // Mon-Fri only
  
  const blocksExpected = (fullWeeks * 5) + workDaysInCurrentWeek;
  const adherencePercent = blocksExpected > 0 
    ? Math.round((completedBlocks / blocksExpected) * 100) 
    : 0;
  
  return {
  dayNumber,
  weekNumber,
  blocksCompleted: completedBlocks,  // ✅ Map parameter to return property
  blocksExpected,
  adherencePercent
};
}


// ============================================
// SPRINT TRANSITION MESSAGES
// ============================================

export const flowBlockSprintCompleteMessage = (sprintNumber: number) => `**21-Day Flow Block Sprint ${sprintNumber} Complete** 🎯

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

export const weeklyCheckInMessage = (weekNumber: number, sprintNumber: number) => `**Week ${weekNumber} of Sprint ${sprintNumber} Complete**

Quick pulse check before we continue:

- How did your Flow Blocks feel this week?
- Any blocks that felt too easy or too hard?
- Did your setup (location, playlist, timer) work consistently?

Any adjustments needed, or keep rolling?`;

// Aliases for backwards compatibility with ChatInterface imports
export const getSprintDayNumber = getFlowBlockSprintDay;
export const isSprintComplete = isFlowBlockSprintComplete;
export const sprintCompleteMessage = flowBlockSprintCompleteMessage;


