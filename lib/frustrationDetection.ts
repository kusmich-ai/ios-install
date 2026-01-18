// lib/frustrationDetection.ts
// Detects attribution drift and tool frustration patterns
// Used by /api/chat to inject appropriate context for Claude

// ============================================
// FRUSTRATION TRIGGERS
// ============================================

const frustrationTriggers = [
  // Tool attribution drift
  "isn't working",
  "not working",
  "doesn't work",
  "didn't work",
  "nothing is changing",
  "doesn't help",
  "didn't help",
  "not helping",
  "i feel worse",
  "made it worse",
  "making it worse",
  "waste of time",
  "this is stupid",
  "this is pointless",
  "what's the point",
  
  // Confusion/overwhelm
  "i'm confused",
  "i don't get it",
  "i don't understand",
  "too complicated",
  "too much",
  
  // Self-blame spirals
  "why am i not feeling",
  "i keep failing",
  "i can't do this",
  "i'm doing it wrong",
  "what am i doing wrong",
  "i must be broken",
  "something's wrong with me",
  
  // Giving up signals
  "forget it",
  "never mind",
  "this is hopeless",
  "i give up",
  "what's the use"
];

// ============================================
// DETECTION FUNCTION
// ============================================

/**
 * Detect if user message contains frustration/attribution drift signals
 * @param text - The user's message
 * @returns boolean - true if frustration detected
 */
export function detectAttributionDrift(text: string): boolean {
  const t = text.toLowerCase();
  return frustrationTriggers.some(p => t.includes(p));
}

/**
 * Get the specific frustration type for more targeted responses
 * @param text - The user's message
 * @returns object with frustration type and matched trigger
 */
export function getFrustrationContext(text: string): {
  detected: boolean;
  type: 'tool_blame' | 'confusion' | 'self_blame' | 'giving_up' | null;
  trigger: string | null;
} {
  const t = text.toLowerCase();
  
  // Tool blame patterns
  const toolBlamePatterns = [
    "isn't working", "not working", "doesn't work", "didn't work",
    "nothing is changing", "doesn't help", "didn't help", "not helping",
    "i feel worse", "made it worse", "making it worse",
    "waste of time", "this is stupid", "this is pointless", "what's the point"
  ];
  
  // Confusion patterns
  const confusionPatterns = [
    "i'm confused", "i don't get it", "i don't understand",
    "too complicated", "too much"
  ];
  
  // Self-blame patterns
  const selfBlamePatterns = [
    "why am i not feeling", "i keep failing", "i can't do this",
    "i'm doing it wrong", "what am i doing wrong",
    "i must be broken", "something's wrong with me"
  ];
  
  // Giving up patterns
  const givingUpPatterns = [
    "forget it", "never mind", "this is hopeless",
    "i give up", "what's the use"
  ];
  
  for (const pattern of toolBlamePatterns) {
    if (t.includes(pattern)) {
      return { detected: true, type: 'tool_blame', trigger: pattern };
    }
  }
  
  for (const pattern of confusionPatterns) {
    if (t.includes(pattern)) {
      return { detected: true, type: 'confusion', trigger: pattern };
    }
  }
  
  for (const pattern of selfBlamePatterns) {
    if (t.includes(pattern)) {
      return { detected: true, type: 'self_blame', trigger: pattern };
    }
  }
  
  for (const pattern of givingUpPatterns) {
    if (t.includes(pattern)) {
      return { detected: true, type: 'giving_up', trigger: pattern };
    }
  }
  
  return { detected: false, type: null, trigger: null };
}

// ============================================
// RESPONSE CONTEXT INJECTION
// ============================================

/**
 * Get additional system prompt context when frustration is detected
 * This helps Claude respond appropriately to attribution drift
 */
export function getFrustrationResponseContext(
  frustrationContext: ReturnType<typeof getFrustrationContext>
): string {
  if (!frustrationContext.detected) return '';
  
  const baseContext = `
---
FRUSTRATION/ATTRIBUTION DRIFT DETECTED
The user's message contains signals of frustration or tool-misattribution ("${frustrationContext.trigger}").

CRITICAL RESPONSE GUIDELINES:
1. Do NOT apologize for the tool or promise it will "work better"
2. Do NOT validate that the tool "isn't working"
3. Instead, reframe what's happening through the Signal → Interpretation lens
`;

  switch (frustrationContext.type) {
    case 'tool_blame':
      return baseContext + `
TYPE: Tool Blame
The user is attributing their state to the tool's "failure."

Respond with something like:
- "The tool surfacing discomfort isn't failure — it means there's something here worth noticing."
- "Tools don't fix states. They restore clarity. What did you notice during the process?"
- "If nothing shifted, that's data. What's the interpretation your mind is adding right now?"
- Name what's happening: "I notice you're saying the tool isn't working. Let's look at what's actually present."

Do NOT promise the tool will work better next time or suggest trying harder.
---
`;

    case 'confusion':
      return baseContext + `
TYPE: Confusion/Overwhelm
The user feels lost in the process.

Respond with:
- Simplify radically: "Let's strip this down. One question: what's the body sensation right now?"
- Validate without abandoning framework: "That makes sense — let's slow down. What's the one thing you're most aware of?"
- Offer grounding first: "Before we continue, take one breath. What do you notice?"

Do NOT add more explanation or complexity.
---
`;

    case 'self_blame':
      return baseContext + `
TYPE: Self-Blame Spiral
The user is turning frustration inward ("I'm broken", "I can't do this").

Respond with:
- Name the pattern without validating the content: "Notice what your mind just did — it turned 'this is hard' into 'I'm defective.' That's an Interpretation, not a fact."
- Redirect to Signal: "Where do you feel this 'I can't do this' thought in your body?"
- Normalize without coddling: "This is what minds do. The question isn't whether you're broken — the question is: what's actually here right now?"

Do NOT reassure them they're "doing great" or offer false comfort.
---
`;

    case 'giving_up':
      return baseContext + `
TYPE: Giving Up
The user is ready to abandon the process.

Respond with:
- Honor the experience: "That frustration is real. Before you close this, can you name the sensation you're feeling right now?"
- Create tiny opening: "You don't have to continue. But if you had 10 seconds — what's one thing you noticed?"
- Name the meta-pattern if appropriate: "Giving up is also a response. What would staying with this discomfort reveal?"

Do NOT pressure them to continue or promise results.
---
`;

    default:
      return baseContext + `
Acknowledge the frustration, then redirect to Signal vs Interpretation.
---
`;
  }
}

// ============================================
// FORCED ATTRIBUTION RESET INJECTION (Step 3.2)
// ============================================

/**
 * Forceful response template when attribution drift is detected
 * This overrides normal response patterns and enforces Cue-Kernel sequence
 */
export const ATTRIBUTION_RESET_INJECTION = `
---
⚠️ ATTRIBUTION DRIFT DETECTED - MANDATORY RESPONSE PROTOCOL ⚠️

The user is showing signs of tool-misattribution or frustration. Do NOT encourage, motivate, apologize, or promise the tool will "work better."

FOLLOW THIS EXACT SEQUENCE (one question at a time, wait for response):

1. FIRST, say exactly: "Pause. This sounds like attribution drift — blaming the tool instead of examining the signal."

2. THEN ask for SIGNAL: "What's the body sensation or emotion you can verify right now? One phrase."
   (Wait for response)

3. THEN ask for INTERPRETATION: "What story is your mind adding to that sensation? One sentence."
   (Wait for response)

4. THEN ask for ACTION: "What's one small thing you can do in the next 24 hours — or name a deliberate non-action?"
   (Wait for response)

5. CLOSE with: "Signal → Interpretation → Action. That's the sequence. The tool didn't fail — it surfaced something worth noticing."

CRITICAL RULES:
- Do NOT skip steps or combine questions
- Do NOT apologize for the tool
- Do NOT validate that "it's not working"
- Do NOT offer to "try again" or promise better results
- Keep each response to 1-3 sentences max
- Stay direct, not harsh

If user resists or says "just tell me what to do":
→ "I hear that. And the answer is: name the Signal first. What's the sensation?"
---
`;

// ============================================
// CONVENIENCE FUNCTION FOR API ROUTE
// ============================================

/**
 * One-liner for the API route to get frustration context if present
 * @param userMessage - The latest user message
 * @returns string to append to system prompt (empty if no frustration)
 */
export function getAttributionDriftContext(userMessage: string): string {
  const context = getFrustrationContext(userMessage);
  return getFrustrationResponseContext(context);
}

/**
 * Get the forceful attribution reset injection when drift is detected
 * This is more aggressive than the standard context and enforces a specific sequence
 * @param userMessage - The latest user message
 * @returns The injection string if drift detected, empty string otherwise
 */
export function getAttributionResetInjection(userMessage: string): string {
  const context = getFrustrationContext(userMessage);
  if (context.detected) {
    return ATTRIBUTION_RESET_INJECTION;
  }
  return '';
}
