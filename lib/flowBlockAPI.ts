// flowBlockAPI.ts
// 100% API-driven Flow Block Integration Protocol v2.4
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
  identityLink: string;  // 'Direct', 'Indirect', 'Autonomous'
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
// SYSTEM PROMPT v2.4 (Cleaner - no marker instructions)
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
After they commit, give a brief motivating close. Reference their specific setup and first block day.

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
- All blocks in one domain → Redistribute across domains`;

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
    {"day": "Monday", "domain": "Professional Work", "task": "Task description", "flowType": "Strategic", "category": "Goal", "identityLink": "Direct", "duration": 90},
    {"day": "Tuesday", "domain": "Domain", "task": "Task", "flowType": "Type", "category": "Category", "identityLink": "Link", "duration": 60},
    {"day": "Wednesday", "domain": "Domain", "task": "Task", "flowType": "Type", "category": "Category", "identityLink": "Link", "duration": 90},
    {"day": "Thursday", "domain": "Domain", "task": "Task", "flowType": "Type", "category": "Category", "identityLink": "Link", "duration": 60},
    {"day": "Friday", "domain": "Domain", "task": "Task", "flowType": "Type", "category": "Category", "identityLink": "Link", "duration": 60}
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
- identityLink must be: "Direct", "Indirect", or "Autonomous"
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
