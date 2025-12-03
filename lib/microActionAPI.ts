// microActionAPI.ts
// 100% API-driven Micro-Action Identity Installation Protocol
// No state machine - Claude handles all the coaching naturally

export interface MicroActionState {
  isActive: boolean;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  extractedIdentity: string | null;
  extractedAction: string | null;
  isComplete: boolean;
  sprintStartDate: string | null;
  sprintNumber: number;
}

export const initialMicroActionState: MicroActionState = {
  isActive: false,
  conversationHistory: [],
  extractedIdentity: null,
  extractedAction: null,
  isComplete: false,
  sprintStartDate: null,
  sprintNumber: 1
};

// System prompt for the Micro-Action Identity Installation
export const microActionSystemPrompt = `You are an identity coach helping a user install a new identity through the Morning Micro-Action protocol. This is a 21-day identity installation process.

## YOUR ROLE
Guide the user through discovering their identity and designing a daily proof action. Be warm but direct - no cheerleading or fluff. Mirror their language. Ask one question at a time.

## THE PROCESS (follow this sequence naturally)

### Phase 1: Discovery
The opening message already asked about misalignment. Your job is to:
1. Reflect back what they shared and probe deeper to get specific
2. Ask follow-up questions to understand the root of the friction
3. Don't re-ask "is there somewhere that feels misaligned" - they already answered that

### Phase 2: Identity Type Assessment  
4. Determine if they need a SUBTRACTIVE identity (calming, regulatory - for when they feel scattered/stressed) or ADDITIVE identity (expansive, expressive - for when they're stable but under-expressed)
5. Ask naturally: "Do you feel like you have the capacity to show up this way, you're just not doing it consistently? Or does it feel like there's too much coming at you - like your system needs to settle first?"

### Phase 3: Identity Phrasing
6. Help them phrase their identity as "I am someone who..." or "I am a..."
7. Have them say it out loud or internally and notice how it feels in their body
8. Refine until it passes the 4-C Filter (ask these ONE AT A TIME, naturally woven in):
   - CONCRETE: "Could someone see evidence of this in 60 seconds?"
   - COHERENT: "Does this feel like an upgrade of who you already are, not a costume?"
   - CONTAINABLE: "Can you prove this with one small action each day?"
   - COMPELLING: "Does saying it light up your chest, not just your head?"

### Phase 4: Micro-Action Design
9. Ask: "What's one micro-interaction - something you could do in under 5 minutes each morning - that would prove you are this person?"
10. Test the action with the ACE criteria (ONE AT A TIME):
    - ATOMIC: "Could you do this even on a chaotic morning?"
    - CONGRUENT: "If I saw you doing this, would I recognize the identity you're training?"
    - EMOTIONALLY CLEAN: "Does this feel like alignment, not obligation?"

### Phase 5: Commitment
11. Present their Identity Contract:
    "For the next 21 days, I will act as [identity].
    My daily micro-action is [action].
    Each completion = proof; each proof = reinforcement."
12. Ask for their commitment
13. Close with mechanics and encouragement

## IMPORTANT RULES
- Ask ONE question at a time - never multiple questions in one message
- Don't announce frameworks ("Now let's check the 4-C filter") - weave them naturally
- If a response is vague, probe deeper before moving on
- Mirror their exact language when reflecting back
- Keep responses to 2-4 sentences max unless presenting the final contract
- Be genuinely curious, not clinical

## EXTRACTION
When the user commits to their identity and action, end your message with this EXACT format on its own line:
[IDENTITY_COMPLETE: identity="Their chosen identity" action="Their chosen action"]

Only include this when BOTH identity AND action are clearly defined and the user has committed.

## EXAMPLE EXTRACTION
[IDENTITY_COMPLETE: identity="I am a present father" action="Make eye contact with each child and say good morning before checking my phone"]`;

// Parse the completion marker from API response
export function parseCompletionMarker(response: string): { identity: string; action: string } | null {
  const match = response.match(/\[IDENTITY_COMPLETE:\s*identity="([^"]+)"\s*action="([^"]+)"\]/);
  if (match) {
    return {
      identity: match[1],
      action: match[2]
    };
  }
  return null;
}

// Remove the completion marker from the display response
export function cleanResponseForDisplay(response: string): string {
  return response.replace(/\[IDENTITY_COMPLETE:\s*identity="[^"]+"\s*action="[^"]+"\]/, '').trim();
}

// Build the messages array for the API call
export function buildAPIMessages(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  newUserMessage: string
): Array<{ role: 'user' | 'assistant' | 'system'; content: string }> {
  return [
    { role: 'system' as const, content: microActionSystemPrompt },
    ...conversationHistory,
    { role: 'user' as const, content: newUserMessage }
  ];
}

// Opening message when starting the flow
export const microActionOpeningMessage = `Is there somewhere in your life that feels misaligned with who you are right now?

It could be internal (thoughts, reactivity, overwhelm) or external (relationships, work, health). Just name what's present.`;


// ============================================
// SPRINT HELPER FUNCTIONS
// ============================================

/**
 * Calculate which day of the current sprint we're on (1-21)
 */
export function getSprintDayNumber(sprintStartDate: string): number {
  const start = new Date(sprintStartDate);
  start.setHours(0, 0, 0, 0); // Normalize to start of day
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 because day 1 is start date
  
  return Math.max(1, Math.min(diffDays, 21)); // Clamp between 1-21
}

/**
 * Check if current sprint is complete (past 21 days)
 */
export function isSprintComplete(sprintStartDate: string): boolean {
  const start = new Date(sprintStartDate);
  start.setHours(0, 0, 0, 0);
  
  const endDate = new Date(start);
  endDate.setDate(endDate.getDate() + 21);
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  return now >= endDate;
}

/**
 * Get formatted sprint status string
 */
export function getSprintStatus(sprintStartDate: string | null, sprintNumber: number): string {
  if (!sprintStartDate) {
    return 'Not started';
  }
  
  const dayNumber = getSprintDayNumber(sprintStartDate);
  const complete = isSprintComplete(sprintStartDate);
  
  if (complete) {
    return `Sprint ${sprintNumber} Complete ✓`;
  }
  
  return `Sprint ${sprintNumber}, Day ${dayNumber}/21`;
}

/**
 * Get days remaining in current sprint
 */
export function getDaysRemaining(sprintStartDate: string): number {
  const currentDay = getSprintDayNumber(sprintStartDate);
  return Math.max(0, 21 - currentDay);
}

/**
 * Calculate state for starting a new sprint
 */
export function startNewSprint(currentSprintNumber: number): Partial<MicroActionState> {
  return {
    isActive: true,
    conversationHistory: [],
    extractedIdentity: null,
    extractedAction: null,
    isComplete: false,
    sprintStartDate: new Date().toISOString(),
    sprintNumber: currentSprintNumber + 1
  };
}

// Context to add to system prompt for returning users
export const returningUserContext = (sprintNumber: number, previousIdentity: string, previousAction: string) => `

## RETURNING USER CONTEXT
This user is starting Sprint ${sprintNumber}. Their previous identity was: "${previousIdentity}"
Their previous micro-action was: "${previousAction}"

When opening, acknowledge their previous sprint and ask:
1. How did that identity feel over the last 21 days?
2. What landed? What shifted?
3. Based on their response, suggest either:
   - Evolution (stretching the same identity forward)
   - Layering (stacking a new one on a stable foundation)
   - Complete pivot (if the previous one didn't resonate)
`;

// Sprint complete message
export const sprintCompleteMessage = (sprintNumber: number, identity: string) => `**🎉 21-Day Identity Sprint ${sprintNumber} Complete!**

Your sprint as "${identity}" is complete.

How did it feel? Ready to:
1. **Continue** - Keep the same identity for another 21 days
2. **Evolve** - Build on it with a deeper or expanded version  
3. **Pivot** - Choose a completely new identity

What feels right for Sprint ${sprintNumber + 1}?`;
