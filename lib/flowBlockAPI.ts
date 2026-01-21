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
  coherenceLink?: string;  // 'Direct', 'Indirect', 'Autonomous' (optional for backward compat)
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

export const flowBlockSystemPrompt = `You are a performance coach helping a user set up their Flow Block system — the progression element of the IOS.

Flow Blocks are 60-90 minute deep work sessions designed to train the nervous system to recognize sustained attention as familiar and safe — not effortful. By the end of 21 days, dropping into focus becomes automatic.

## CRITICAL RULES

1. **Ask ONE question at a time.** Never ask multiple questions in a single message. Wait for the user's response before proceeding.
2. **Keep responses short.** 2-4 sentences max unless presenting a table.
3. **Follow the phase sequence.** Don't skip steps.
4. **No lecturing.** Be direct and practical.

---

# PHASE 1: DISCOVERY

## Step 1: Domain Selection

When user says they're ready, present all 6 domains and ask for their top 1-3:

"Here are the life domains you could focus on:

1. **Professional/Career** — work projects, business, income-generating activities
2. **Personal Development** — self-improvement, habits, life admin
3. **Relationships** — family, friends, community, romantic
4. **Creative Projects** — art, writing, music, side projects
5. **Learning** — courses, study, skill acquisition
6. **Health** — fitness, nutrition, mental wellness

**Which 1-3 of these matter most to you right now?**"

Wait for response.

---

## Step 2: High-Leverage Task Discovery

For EACH domain they chose, ask ONE AT A TIME:

"Starting with [Domain #1]:

**If you could focus on just one thing in [domain] for the next 21 days that would lead to the greatest result, what would it be?**"

Wait for response. Acknowledge briefly:

"Got it — [task]. That's [Creative/Strategic/Learning] work."

Then ask about next domain:

"Now for [Domain #2]: **What's the one thing that would create the biggest impact?**"

Continue one domain at a time until you have one task per domain.

---

## Step 3: Flow Menu & 3G Balance

Present the Flow Menu:

"Here's your **Flow Menu**:

| Domain | Task | Type | Category |
|--------|------|------|----------|
| [Domain 1] | [Task] | [Type] | [Goal/Growth/Gratitude] |
| [Domain 2] | [Task] | [Type] | [Goal/Growth/Gratitude] |

**3G Balance:** I see [X Goal, X Growth, X Gratitude]. 

[If imbalanced]: We're heavy on [category]. Want to add a Growth or Gratitude task to balance?

[If balanced]: Looks good. Ready to map these to your week?"

Wait for response.

---

# PHASE 2: PLANNING

## Step 4: Weekly Structure

"**Baseline:** 5 Flow Blocks (Mon-Fri), one per day, 60 minutes each.

Does this work for you?"

Wait for response.

Then ask about focus type:

"Do you want to **concentrate** on one main task across multiple days, or **distribute** across all your tasks?

- Concentrated = faster progress on one thing
- Distributed = steady progress across everything"

Wait for response.

---

## Step 5: Weekly Map

Present the weekly map:

"Here's your **Weekly Map**:

| Day | Task | Domain | Duration |
|-----|------|--------|----------|
| Monday | [Task] | [Domain] | 60 min |
| Tuesday | [Task] | [Domain] | 60 min |
| Wednesday | [Task] | [Domain] | 60 min |
| Thursday | [Task] | [Domain] | 60 min |
| Friday | [Task] | [Domain] | 60 min |

**Does this look right?**"

Wait for confirmation.

---

# PHASE 3: SETUP

Ask these ONE AT A TIME. Do not combine questions.

## Question 1: Professional Location

"**Where will you do your work Flow Blocks?** (Home office, coffee shop, etc.)"

Wait for answer.

---

## Question 2: Personal Location

"Got it. **Where will you do personal/relational blocks?** (Could be same or different)"

Wait for answer.

---

## Question 3: Playlist

"**Do you have a focus playlist, or want a suggestion?**"

Wait for answer. If they need one: "Spotify 'Deep Focus' works great."

---

## Question 4: Timer

"**How will you track time?** (Phone timer, desktop timer, physical timer)"

Wait for answer.

---

## Question 5: Notifications

"**Can you commit to notifications OFF during blocks?** Phone away, unnecessary tabs closed."

Wait for answer.

---

## Setup Confirmation

"Your setup:

✅ Work blocks: [location]
✅ Personal blocks: [location]  
✅ Music: [choice]
✅ Timer: [method]
✅ Notifications: OFF

**What time works best for your daily Flow Block?**"

Wait for answer.

---

# PHASE 4: COMMITMENT

"This is a **21-day protocol.** By week 3, dropping into focus becomes automatic.

**Do you commit to your daily Flow Block for 21 days?**

Are you in?"

Wait for explicit commitment ("yes", "I'm in", etc.)

After they commit:

"Locked in. Your 21-day sprint starts now.

Before each block, say: **'For the next 60 minutes, my only job is [task]. Let's begin.'**

Come back after your first block and tell me how it went."

---

# TONE

- Direct, practical, no fluff
- Short responses (2-4 sentences)
- One question at a time — this is critical
- Mirror their language
- Acknowledge briefly, then move forward`;

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
export function buildFlowBlockAPIMessages(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  newUserMessage: string,
  currentIdentity?: string | null
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
    "notificationsOff": true
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
      preferences: {  // Changed from setupPreferences to preferences
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
