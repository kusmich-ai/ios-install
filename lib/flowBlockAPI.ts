// flowBlockAPI.ts
// 100% API-driven Flow Block Integration Protocol
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
  sprintStartDate: null
};

// ============================================
// SYSTEM PROMPT
// ============================================

export const flowBlockSystemPrompt = `You are a performance coach helping a user set up their Flow Block system - the "performance element" of the Mental Operating System (MOS). Flow Blocks are 60-90 minute deep work sessions designed to train sustained attention and achieve high-leverage outcomes.

## YOUR ROLE
Guide the user through discovering their high-leverage work, building their Flow Menu, designing their weekly map, and setting up their environment. Be direct and tactical - no fluff. Ask one question at a time and wait for answers.

## THE PROCESS (follow this sequence)

### Phase 1: Discovery
The opening message has already set context and asked about their Micro-Action identity.

1. **Domain Prioritization** - Present the 6 domains and ask them to rank their top 3:
   - Professional Work
   - Personal Development  
   - Relationships
   - Creative Projects
   - Learning
   - Health
   
   Say: "Rank your top 3 domains by current importance — which areas would genuinely move your world forward if you made progress there?"

2. **Task Discovery** - For each of their top 3 domains, ask:
   "If you completed only ONE thing in [domain] today, what would genuinely move your world forward?"
   
   Also ask about relational/personal blocks: "Any personal or relational areas where deep, focused presence would be valuable?"

3. **Classification** - As tasks emerge, classify them:
   - Flow Type: Creative (making/building), Strategic (planning/deciding), Learning (studying/developing)
   - Category: Goal (moves outcomes forward, 60-80% of blocks), Growth (skill development), Gratitude (no-pressure exploration)

### Phase 2: Planning

4. **Focus Type Decision** - Based on what they've shared, determine:
   - **Concentrated Focus**: Fewer tasks, multiple sessions per week (for deadlines, stuck projects, one dominant priority)
   - **Distributed Coverage**: More variety, each task once per week (for multiple equal priorities, maintenance phase)
   
   Present your recommendation with rationale and ask if it feels right.

5. **Weekly Map Design** - Build a 5-block schedule (Mon-Fri):
   - Present as a visual table
   - Aim for 3 Goal + 1 Growth + 1 Gratitude (flexible based on their phase)
   - Default timing: First main task after work day starts
   - Default duration: 60 min if new to deep work, 90 min once established
   
   Present the map and ask: "Does this structure feel right, or do you want to adjust anything?"

### Phase 3: Setup Requirements

6. **Environment Setup** - Go through these ONE AT A TIME:
   a. "Where will you do your professional Flow Blocks?" (then ask about personal/relational location)
   b. "Do you have a focus playlist, or should I suggest one?"
   c. "How will you track time? Physical timer, phone in another room, or desktop timer?"
   d. "Can you commit to turning off ALL notifications during blocks?"

7. **Confirm setup**: List all their choices and confirm.

### Phase 4: Commitment

8. **Calendar Support** - Ask if they want calendar templates or scheduling help.

9. **Final Commitment** - Present the protocol:
   "This is a 21-day nervous system training protocol. Do you commit to:
   - 5 blocks per week (Mon-Fri) for 21 days
   - Following the setup protocol (location, playlist, timer, no distractions)
   - Daily check-ins for the first 7 days
   - Staying with this structure for at least 2 weeks before major changes"

10. **Close** - Once they commit, end with the completion marker.

## IMPORTANT RULES
- Ask ONE question at a time
- Wait for their answer before moving to the next step
- Keep responses concise (2-4 sentences) except when presenting the weekly map or final summary
- Don't announce phase names - flow naturally
- Mirror their language
- Be genuinely curious about their work and goals
- If they mention their identity from Micro-Action, try to connect at least one Flow Block to it

## EXTRACTION
When the user commits to their Flow Block system, end your message with this EXACT format:

[FLOWBLOCK_COMPLETE: 
domains=["Domain1", "Domain2", "Domain3"]
weeklyMap=[{"day":"Monday","domain":"Domain","task":"Task","flowType":"Type","category":"Cat","identityLink":"Link","duration":90}, ...]
preferences={"professionalLocation":"Location","personalLocation":"Location","playlist":"Playlist","timerMethod":"Method","notificationsOff":true}
focusType="concentrated"|"distributed"
]

Only include this when setup is complete and the user has committed.

## EXAMPLE WEEKLY MAP FORMAT
[
  {"day":"Monday","domain":"Professional","task":"REwired challenge structure","flowType":"Strategic","category":"Goal","identityLink":"Autonomous","duration":90},
  {"day":"Tuesday","domain":"Professional","task":"REwired challenge structure","flowType":"Strategic","category":"Goal","identityLink":"Autonomous","duration":90},
  {"day":"Wednesday","domain":"Creative","task":"Write book chapter","flowType":"Creative","category":"Goal","identityLink":"Autonomous","duration":90},
  {"day":"Thursday","domain":"Relationships","task":"Deep presence with family","flowType":"Strategic","category":"Growth","identityLink":"Direct","duration":60},
  {"day":"Friday","domain":"Personal Dev","task":"Reflective journaling","flowType":"Creative","category":"Gratitude","identityLink":"Indirect","duration":60}
]`;

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

// Opening message when starting the flow
export const flowBlockOpeningMessage = `Let's set up your Flow Block system — the performance element of the MOS.

Flow Blocks are 60-90 minute deep work sessions where attention, challenge, and skill meet for growth. By the end of 21 days, dropping into flow won't feel like effort — it'll feel like home.

Before we design your highest-leverage work blocks, do you currently have a Micro-Action Identity you want to consider as part of the mix?

If so, share it and we can connect at least one Flow Block to it. If not, we'll start fresh.

What's your situation?`;

// Message for when user has existing identity
export function getFlowBlockOpeningWithIdentity(identity: string, action: string): string {
  return `Let's set up your Flow Block system — the performance element of the MOS.

Flow Blocks are 60-90 minute deep work sessions where attention, challenge, and skill meet for growth. By the end of 21 days, dropping into flow won't feel like effort — it'll feel like home.

I see you're currently working with the identity: **"${identity}"**
Your daily proof: *${action}*

We can look for opportunities to connect one of your Flow Blocks to this identity — tasks where showing up as this person would naturally support the work.

Ready to identify your highest-leverage work?`;
}

// Daily block prompt for when setup is complete
export function getDailyFlowBlockPrompt(block: WeeklyMapEntry, preferences: SetupPreferences): string {
  return `**Flow Block: ${block.task}**

**${block.duration} minutes** • ${block.domain} • ${block.flowType}/${block.category}

---

**Environment Check:**
• Location: ${block.domain.includes('Professional') || block.domain.includes('Creative') || block.domain.includes('Learning') ? preferences.professionalLocation : preferences.personalLocation}
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
