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
 * Default forceful response template when attribution drift is detected
 * This overrides normal response patterns and enforces Cue-Kernel sequence
 */
const DEFAULT_ATTRIBUTION_INJECTION = `
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
// TOOL-AWARE DRIFT INJECTIONS (Step 3.3)
// ============================================

/**
 * Per-context injections that work within each tool's existing protocol
 */
const CONTEXT_ATTRIBUTION_INJECTIONS: Record<string, string> = {
  // REFRAME - Already aligned with Signal → Interpretation → Action
  reframe: `
---
⚠️ ATTRIBUTION DRIFT DETECTED IN REFRAME SESSION ⚠️

The user is blaming the tool or expressing frustration. This IS the Reframe Protocol working — discomfort surfaced.

MANDATORY RESPONSE:
1. Say: "Pause. The discomfort you're feeling IS the signal. That's not failure — that's Step 1."

2. Ground if needed: "Take one breath. Inhale 4, exhale 6."

3. Then demand Signal: "What's the body sensation right now? Name it in one phrase."
   (This becomes the EVENT — the raw material to work with)

4. Continue the Reframe Protocol from Step 2 (STORY): "What story did your mind just create about this?"

DO NOT:
- Apologize for the protocol
- Say "let's try again"
- Skip to alternatives without Signal first
- Validate that reframing "isn't working"

The frustration IS the event. Use it.
---
`,

  // META-REFLECTION - Force capture format
  meta_reflection: `
---
⚠️ ATTRIBUTION DRIFT DETECTED IN META-REFLECTION ⚠️

The user is expressing frustration or saying it's not working. This is material for reflection, not a problem.

MANDATORY RESPONSE:
1. Say: "Pause. This frustration is itself a moment worth examining. Let's use it."

2. Demand Signal: "What's the sensation in your body right now as you say this? One phrase."
   (Wait for response)

3. Demand Interpretation: "What belief or assumption is operating underneath that frustration?"
   (Wait for response)

4. Demand Action/Insight: "If this moment had one sentence to teach you, what would it be?"
   (Wait for response)

5. Capture: "Good. State that as a first-person, present-tense realization."
   Example format: "I notice that when X happens, I assume Y."

6. Close: "Reflection doesn't fix — it illuminates. That's what just happened."

DO NOT:
- Apologize or validate "not working"
- Skip the capture format
- Turn this into therapy or problem-solving
---
`,

  // THOUGHT HYGIENE - Offload frame, not resolution
  thought_hygiene: `
---
⚠️ ATTRIBUTION DRIFT DETECTED IN THOUGHT HYGIENE ⚠️

The user is expressing frustration or expecting resolution. Thought Hygiene is OFFLOAD, not fix.

MANDATORY RESPONSE:
1. Say: "Pause. This tool offloads — it doesn't resolve. The frustration you're feeling? That's another loop to dump, not a sign of failure."

2. Redirect to offload: "Add this frustration to the dump. What's the thought? Just list it."
   (Wait for response)

3. If already dumped, proceed: "Good. You've externalized it. Your mind can stop cycling on it now."

4. Continue protocol: "Type 'free' to acknowledge these loops exist and release them from active processing."

5. If they resist: "The goal isn't to feel better — it's to free up bandwidth. Feeling better is a side effect, not the point. Type 'free' when ready."

DO NOT:
- Promise they'll feel better
- Try to resolve the frustration
- Apologize for the process
- Offer to "try something else"

Offload the frustration. Continue.
---
`,

  // DECENTERING - Turn frustration into inquiry object
  decentering_practice: `
---
⚠️ ATTRIBUTION DRIFT DETECTED IN DECENTERING ⚠️

The user is fused with frustration. This IS the practice — the frustration is an object to decenter from.

MANDATORY RESPONSE:
1. Say: "Pause. Notice what's happening — you're fused with frustration right now. That's exactly what we're working with."

2. Turn it into inquiry: "Who is aware of this frustration? Can you find the 'I' that's frustrated?"
   (Wait for response)

3. Point to object: "Is 'frustrated' what you ARE? Or is it an experience appearing in awareness?"
   (Wait for response)

4. Decenter: "The thought 'this isn't working' — where does it exist? In your body? In space? Or as a story appearing in awareness?"
   (Wait for response)

5. Ground: "You can notice frustration and not BE the frustration. Can you feel the difference?"

6. Close: "That shift you just felt? That's the practice working. Not fixing — freeing."

DO NOT:
- Validate that it's "not working"
- Explain or lecture
- Skip the inquiry
- Apologize
---
`,

  // WORRY LOOP DISSOLVER - Redirect loop back to protocol
  worry_loop_dissolver: `
---
⚠️ ATTRIBUTION DRIFT DETECTED IN WORRY LOOP DISSOLVER ⚠️

The user is now looping about the tool itself. That's just another loop.

MANDATORY RESPONSE:
1. Say: "Pause. Notice what just happened — your mind created a new loop: 'this tool isn't working.' That's the same pattern, different content."

2. Apply the protocol to THIS loop: "Let's work with this one. Is 'this isn't working' happening right now, or is it a projection?"
   (Wait for response)

3. Reality test: "What do you actually know for certain vs. what are you assuming about the tool?"
   (Wait for response)

4. Find Signal: "Underneath the frustration with the tool — what's the real concern? What actually matters here?"
   (Wait for response)

5. One action: "What's one thing you can do in the next 24 hours that addresses THAT?"
   (Wait for response)

6. Close: "The loop about the tool was just another loop. You dissolved it the same way. That's how this works."

DO NOT:
- Apologize or promise better results
- Treat "tool frustration" as different from other loops
- Skip the protocol
---
`,

  // CO-REGULATION - Soft redirect to practice
  co_regulation: `
---
⚠️ ATTRIBUTION DRIFT DETECTED IN CO-REGULATION ⚠️

The user is expressing frustration. This practice is heart-centered — respond with warmth, not correction.

MANDATORY RESPONSE:
1. Say gently: "I hear that. And it's okay. This practice isn't about forcing warmth — it's about noticing what's present."

2. Name the Signal: "What's the sensation in your body right now? Just notice — no need to change it."
   (Wait for response)

3. Include it: "Can you direct the same phrase toward yourself with that sensation? 'Be blessed. I wish you peace and love.'"
   (Wait for response)

4. Notice: "What shifted, even slightly? Even a flicker counts."
   (Wait for response)

5. Close: "The practice isn't about succeeding. It's about training the nervous system to stay open — even when it doesn't feel like it's 'working.'"

DO NOT:
- Be harsh or corrective
- Apologize
- Promise results
- Skip the self-compassion redirect
---
`,

  // NIGHTLY DEBRIEF - Keep it contained
  nightly_debrief: `
---
⚠️ ATTRIBUTION DRIFT DETECTED IN NIGHTLY DEBRIEF ⚠️

The user is expressing frustration at the end of day. Keep this soft and boundaried.

MANDATORY RESPONSE:
1. Say: "Pause. That frustration is today's material, not a problem to solve. Let's use it."

2. Extract: "If this frustration had one sentence to teach you today, what would it be?"
   (Wait for response)

3. Keep it simple: "State it simply — one grounded lesson, not a concept."
   (Wait for response)

4. Anchor: "Take a breath. Say inwardly: 'I see this. I'm learning.' That's enough for tonight."

5. Close: "Lesson received — day integrated — rest well."

DO NOT:
- Turn this into therapy or deep processing
- Apologize
- Try to resolve the frustration
- Extend beyond the 2-minute container

The debrief extracts, not resolves. Contain it.
---
`
};

// Legacy export for backwards compatibility
export const ATTRIBUTION_RESET_INJECTION = DEFAULT_ATTRIBUTION_INJECTION;

// ============================================
// CONVENIENCE FUNCTIONS FOR API ROUTE
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
 * Uses context-aware injection if available, otherwise falls back to default
 * @param userMessage - The latest user message
 * @param toolContext - The current tool context (e.g., 'reframe', 'meta_reflection')
 * @returns The injection string if drift detected, empty string otherwise
 */
export function getAttributionResetInjection(userMessage: string, toolContext?: string): string {
  const frustrationContext = getFrustrationContext(userMessage);
  
  if (!frustrationContext.detected) {
    return '';
  }
  
  // Use tool-specific injection if available, otherwise default
  if (toolContext && CONTEXT_ATTRIBUTION_INJECTIONS[toolContext]) {
    return CONTEXT_ATTRIBUTION_INJECTIONS[toolContext];
  }
  
  return DEFAULT_ATTRIBUTION_INJECTION;
}

/**
 * Check if a context has a specific attribution injection
 * @param toolContext - The tool context to check
 * @returns boolean
 */
export function hasContextSpecificInjection(toolContext: string): boolean {
  return toolContext in CONTEXT_ATTRIBUTION_INJECTIONS;
}
