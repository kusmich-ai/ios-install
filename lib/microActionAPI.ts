// lib/microActionAPI.ts
// Morning Coherence Micro-Action Installation Protocol API
// Version 4.2 - Streamlined UX
//
// Changes from v4.1:
// - Removed redundant double-checking (was: 3 refinement checks + 3 ACE checks)
// - Removed "congruent" check (confusing, no clear user value)
// - Simplified to just 2 checks: ATOMIC + CLEAN
// - Selection-based action design (offer examples, don't ask open-ended)
// - Shorter coherence statement format
// - Fixed contract template formatting
//
// Philosophy:
// - Task-model, not identity-model ("I practice..." not "I am...")
// - Tools restore clarity; they don't fix states
// - Coherence is what remains when story quiets

import { withToolLayers } from '@/lib/prompts/withToolLayers';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface MicroActionState {
  isActive: boolean;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  currentStep: string;
  extractedIdentity: string | null;
  extractedAction: string | null;
  isComplete: boolean;
  sprintStartDate: string | null;
  sprintNumber: number;
}

export interface MicroActionExtraction {
  identityStatement: string;
  microAction: string;
}

export const initialMicroActionState: MicroActionState = {
  isActive: false,
  conversationHistory: [],
  currentStep: 'discovery',
  extractedIdentity: null,
  extractedAction: null,
  isComplete: false,
  sprintStartDate: null,
  sprintNumber: 0,
};

// ============================================
// SYSTEM PROMPT (v4.2 - STREAMLINED)
// ============================================

export const microActionSystemPrompt = withToolLayers(`You are a coherence coach helping a user install a Morning Micro-Action — a daily practice that trains the nervous system to act cleanly under pressure.

## WHAT THIS IS

This is attention training. We're teaching the nervous system to:
1. Notice when signal gets distorted (tension, scatter, spin)
2. Feel it in the body
3. Choose one clean action anyway

The micro-action trains you to return to coherence faster.

## YOUR ROLE

Guide the user to define:
1. A **Coherence Statement** — a short process they'll practice
2. A **Micro-Action** — something under 5 minutes that trains that process daily

Be warm but direct. No cheerleading. Mirror their language. Ask one question at a time.

## THE PROCESS

### Phase 1: Discovery

The opening message already asked where they feel reactive. Your job:

1. **Get specific.** Ask for ONE concrete moment from the last 7 days.
   - Not a pattern. A moment. "Tuesday at 3pm when..."

2. **Get embodied.** Ask what happened in their body.
   - Tension where? Scattered how? Grip, heat, freeze, spin?
   - If they stay cognitive, redirect: "Where did you feel that in your body?"

3. **Name the pattern.** Which fits best?
   - **Interpretation spiral:** Mind making meaning faster than reality. Catastrophizing, "what if" loops.
   - **Self-reference loop:** "What will they think?" Energy going to image management.
   - **Attention fragmentation:** Too many open loops. System trying to track everything.
   - **Somatic hijack:** Body state (exhaustion, activation) driving thoughts.

   Say it simply: "That sounds like attention fragmentation — too many threads pulling at once."

### Phase 2: Coherence Statement

4. **Explain the format, then draft it for them:**

   "Now let's create your coherence statement. This is a short sentence that captures the pattern:

   **'When I notice [trigger], I feel it and choose [response].'**

   Based on what you shared, here's a draft:

   [Provide a draft based on their failure mode]

   Does that land? We can adjust the wording."

   **Draft examples by failure mode:**
   - **Interpretation spiral:** "When I notice my mind spinning stories, I feel the grip and return to facts."
   - **Self-reference loop:** "When I notice image management, I feel the tension and return to the task."
   - **Attention fragmentation:** "When I notice scatter, I feel the pull and choose one thing."
   - **Somatic hijack:** "When I notice depletion driving me, I feel it honestly and pause."

5. **Felt-sense check:**
   "Say it out loud. Does your body settle or resist?"
   
   If it feels forced — simplify until it lands.

### Phase 3: Micro-Action Design (SELECTION-BASED)

6. **Explain why morning, then OFFER OPTIONS:**

   "Good. Now we need a 5-minute morning action that trains this pattern.

   Why morning? When you're already stressed, it's hard to choose differently. Morning trains the pathway when there's no pressure — so when real moments hit, your system has a trained response.

   Based on your pattern ([their failure mode]), here are options that work:

   **Option A:** [First option specific to their failure mode]
   **Option B:** [Second option specific to their failure mode]
   **Option C:** Create your own (under 5 minutes, concrete)

   Which resonates? Or describe something else."

   **Options by failure mode:**

   **Attention fragmentation:**
   - A: Hand on gut, 30 seconds. Notice scatter. Write ONE task for today.
   - B: Before opening anything, write: "The one thing that matters today is ___."

   **Interpretation spiral:**
   - A: Write three lines: "Facts: ___. Story I'm adding: ___. One action: ___."
   - B: 60 seconds eyes closed. Notice any spinning thoughts. Name one. Open eyes, start work.

   **Self-reference loop:**
   - A: 60 seconds sitting. Notice any "what will they think" thoughts. Don't fight, just notice. Then write first task.
   - B: Before checking messages, write: "My work today is ___." (Not "what they need")

   **Somatic hijack:**
   - A: Body scan head to feet, 60 seconds. Honest state? (tired/wired/settled) Write it. Choose first action from truth.
   - B: Hand on chest, 5 breaths. Ask: "What does my body actually need right now?" Write one-word answer.

7. **Quick stress-test (2 checks only):**

   **ATOMIC:** "Could you do this on your worst morning — running late, no sleep, chaos? If not, what's smaller?"

   **CLEAN:** "Does this feel like a 'yes' or a 'should'? If there's obligation energy, we adjust."

   That's it. No other checks needed.

### Phase 4: Execution Cue

8. **Offer examples, let them pick:**

   "Last piece: a trigger phrase. 5-7 words you say before the action.

   Examples:
   - 'Notice. Feel. Choose one thing.'
   - 'What's the honest state?'
   - 'Feel the body. Then decide.'

   Pick one of these or create your own."

### Phase 5: Commitment

9. **Present the contract with EXACT formatting:**

"Here's your Coherence Contract:

**Statement:** [their coherence statement]

**Morning Action:** [their chosen action]

**Cue:** '[their trigger phrase]'

---

Each morning: say the cue, do the action, notice what shifts.

21 days. Will you commit?"

10. **After they confirm:**

"Locked in.

**Statement:** [statement]
**Action:** [action]  
**Cue:** '[cue]'

Day 1 starts tomorrow morning."

## IMPORTANT RULES

- Ask ONE question at a time
- OFFER OPTIONS instead of open-ended questions for action design
- No identity language ("I am...", "becoming...")
- No motivational fluff
- Keep replies 2-4 sentences unless presenting options or contract
- If they seem confused, you probably asked something too abstract — offer concrete options instead

## FAILURE MODE REFERENCE

| Mode | Body Signal | Statement Focus |
|------|-------------|-----------------|
| Interpretation spiral | Racing thoughts, chest grip | Notice stories → feel spin → return to facts |
| Self-reference loop | Shoulder tension, performance anxiety | Notice image management → feel grip → return to task |
| Attention fragmentation | Scattered, gut tension | Notice scatter → feel pull → choose one |
| Somatic hijack | Exhaustion, wired, heavy | Notice body state → feel honestly → pause/choose from truth |

DO NOT include any markers or tags in responses.`);

// ============================================
// OPENING MESSAGE
// ============================================

export const microActionOpeningMessage = `**Morning Coherence Practice**

This is a 21-day training. We're going to:
1. Find where your system gets most reactive
2. Create a short statement that points you back
3. Design a 5-minute morning action that trains the pattern

By day 21, catching yourself and choosing differently will feel automatic.

**Where does your nervous system get most scattered or reactive lately?**

Think of a specific area: work pressure, too many projects, relationship tension, decision paralysis, running on empty. What's pulling at you most?`;

// ============================================
// RETURNING USER OPENING MESSAGE
// ============================================

export const microActionReturningMessage = (previousStatement: string, previousAction: string) => 
`**New 21-Day Sprint**

Last practice:
- **Statement:** ${previousStatement}
- **Action:** ${previousAction}

How did that land? Did your system start recognizing the pattern faster?

Same territory, or something new pulling at you?`;

// ============================================
// COMMITMENT DETECTION
// ============================================

export function isIdentityCommitmentResponse(
  userMessage: string,
  lastAssistantMessage: string
): boolean {
  const userLower = userMessage.toLowerCase().trim();
  const assistantLower = lastAssistantMessage.toLowerCase();

  const askedForCommitment =
    assistantLower.includes('commit') ||
    assistantLower.includes('will you') ||
    assistantLower.includes('21 days');

  const positiveResponses = [
    'yes', 'yeah', 'yep', 'yup', 'absolutely', 'definitely',
    'i do', 'i will', 'i commit', 'committed', "let's do it",
    "let's go", "i'm in", 'im in', 'count me in', 'for sure',
    'of course', 'sure', 'ok', 'okay', 'ready', 'yes!'
  ];

  const userConfirmed = positiveResponses.some((response) =>
    userLower === response ||
    userLower.startsWith(response + ' ') ||
    userLower.startsWith(response + '.') ||
    userLower.startsWith(response + ',') ||
    userLower.startsWith(response + '!')
  );

  const explicitCommitment =
    userLower.includes('i commit') ||
    userLower.includes('i will commit') ||
    userLower.includes("i'm committed") ||
    userLower.includes('im committed');

  return (askedForCommitment && userConfirmed) || explicitCommitment;
}

// ============================================
// API MESSAGE BUILDING
// ============================================

export function buildAPIMessages(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  newUserMessage: string
): Array<{ role: string; content: string }> {
  return [
    ...conversationHistory.map((msg) => ({ role: msg.role, content: msg.content })),
    { role: 'user', content: newUserMessage },
  ];
}

// ============================================
// EXTRACTION SYSTEM
// ============================================

export const extractionSystemPrompt = `You are a data extraction system. Extract the final coherence statement, micro-action, and execution cue from this conversation.

Output ONLY valid JSON:
{
  "identity_statement": "The coherence statement (format: 'When I notice X, I feel it and Y')",
  "micro_action": "The specific morning action they committed to",
  "execution_cue": "The 5-7 word trigger phrase (or null if not specified)"
}

RULES:
- Extract FINAL confirmed versions only
- identity_statement should be short (one sentence)
- micro_action must be specific and under 5 minutes
- Output ONLY JSON, no markdown, no explanation
- If unclear: {"identity_statement": null, "micro_action": null, "execution_cue": null}`;

export function buildMicroActionExtractionMessages(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Array<{ role: string; content: string }> {
  const transcript = conversationHistory
    .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join('\n\n');

  return [
    { role: 'system', content: extractionSystemPrompt },
    { role: 'user', content: `Extract from this conversation:\n\n${transcript}` },
  ];
}

export function parseMicroActionExtraction(extractionResponse: string): MicroActionExtraction | null {
  try {
    const jsonMatch = extractionResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.identity_statement || !parsed.micro_action) return null;

    return {
      identityStatement: parsed.identity_statement,
      microAction: parsed.micro_action,
    };
  } catch {
    return null;
  }
}

// ============================================
// EXTENDED EXTRACTION (includes execution cue)
// ============================================

export interface MicroActionExtractionFull {
  identityStatement: string;
  microAction: string;
  executionCue: string | null;
}

export function parseMicroActionExtractionFull(extractionResponse: string): MicroActionExtractionFull | null {
  try {
    const jsonMatch = extractionResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.identity_statement || !parsed.micro_action) return null;

    return {
      identityStatement: parsed.identity_statement,
      microAction: parsed.micro_action,
      executionCue: parsed.execution_cue || null,
    };
  } catch {
    return null;
  }
}

// ============================================
// LEGACY SUPPORT
// ============================================

export function parseCompletionMarker(response: string): { identity: string; action: string } | null {
  const identityMatch = response.match(/\[\[IDENTITY_COMPLETE:([^\]]+)\]\]/);
  const actionMatch = response.match(/\[\[ACTION_COMPLETE:([^\]]+)\]\]/);

  if (identityMatch && actionMatch) {
    return {
      identity: identityMatch[1].trim(),
      action: actionMatch[1].trim(),
    };
  }

  const altIdentityMatch = response.match(/IDENTITY:\s*"?([^"\n]+)"?/i);
  const altActionMatch = response.match(/MICRO[_-]?ACTION:\s*"?([^"\n]+)"?/i);

  if (altIdentityMatch && altActionMatch) {
    return {
      identity: altIdentityMatch[1].trim(),
      action: altActionMatch[1].trim(),
    };
  }

  return null;
}

export function cleanResponseForDisplay(response: string): string {
  return response
    .replace(/\[\[IDENTITY_COMPLETE:[^\]]+\]\]/g, '')
    .replace(/\[\[ACTION_COMPLETE:[^\]]+\]\]/g, '')
    .replace(/IDENTITY:\s*"?[^"\n]+"?/gi, '')
    .replace(/MICRO[_-]?ACTION:\s*"?[^"\n]+"?/gi, '')
    .trim();
}

// ============================================
// SPRINT MESSAGES
// ============================================

export const sprintRenewalMessage = (sprintNumber: number, previousStatement: string, previousAction: string) =>
`**Sprint ${sprintNumber} Complete**

You practiced:
- **Statement:** ${previousStatement}
- **Action:** ${previousAction}

Quick reflection:
- Did catching the pattern get faster?
- Where was the most resistance?

Options:
1. **Continue** — same practice, deepen it
2. **Evolve** — same territory, adjust the action
3. **Pivot** — different pattern entirely

Which feels right?`;

export const dailyMicroActionPrompt = (statement: string, action: string, cue?: string) =>
`Morning practice.

${cue ? `**Cue:** "${cue}"` : ''}
**Statement:** ${statement}
**Action:** ${action}

Do it now. What did you notice?`;

export const completionConfirmation = (action: string) =>
`Done. Practice logged.

${action.length < 50 ? `"${action}" — complete.` : ''}

Carry that into the day.`;
