// ============================================
// lib/microActionAPI.ts
// IOS Cue — RAS Detection Training Protocol API
// Version 5.0 — Complete Rewrite
//
// Philosophy:
// - Subtractive, not constructive (unbecoming, not becoming)
// - Detection training, not identity installation
// - The cue is a CATEGORY, not a specific instance
// - Power comes from being ordinary, mechanical, non-special
// - Notice → Label → Release. Nothing more.
//
// Replaces: Morning Micro-Action / Aligned Action / Identity Installation
// ============================================

import { withToolLayers } from '@/lib/prompts/withToolLayers';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface MicroActionState {
  isActive: boolean;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  currentStep: string;
  extractedIdentity: string | null;   // Stores the cue word (e.g., "Interpretation")
  extractedAction: string | null;     // Stores "Notice → Label → Release"
  isComplete: boolean;
  sprintStartDate: string | null;
  sprintNumber: number;
}

export interface MicroActionExtraction {
  identityStatement: string;  // Maps to cue word for DB compatibility
  microAction: string;        // Maps to loop description for DB compatibility
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
// CUE DEFINITIONS
// ============================================

export const IOS_CUES = {
  interpretation: {
    word: 'Interpretation',
    description: 'The moment meaning gets added to experience',
    signals: ['"This means..."', '"I should..."', '"They are..."', '"That\'s good/bad/wrong"'],
    bestFor: 'When your mind adds meaning to things before you realize it',
  },
  effort: {
    word: 'Effort',
    description: 'The moment force, pressure, or urgency enters',
    signals: ['pushing', 'tightening', 'urgency', 'self-pressure', 'forcing an outcome'],
    bestFor: 'When you push through things with tension — relaxing feels like falling behind',
  },
  attention_collapse: {
    word: 'Attention collapse',
    description: 'The moment attention collapses into thought or scrolling',
    signals: ['loss of sensory field', 'tunnel focus into device', 'checking out', 'numbing'],
    bestFor: 'When you check out — scrolling, distracting, losing chunks of time',
  },
} as const;

// ============================================
// SYSTEM PROMPT (v5.0 — IOS CUE SETUP)
// ============================================

export const microActionSystemPrompt = withToolLayers(`You are guiding a user through setting up their IOS Cue — a practice that retrains the brain's filtering system to catch interpretation before it becomes identity.

## YOUR ROLE
Guide the user through understanding the practice and selecting their cue. Be clear, direct, and practical. No spiritual language. No identity language. Keep it mechanical and grounded.

## CRITICAL RULES
- NEVER use identity-model language ("I am...", "becoming...", "who you want to be")
- NEVER frame this as "building" or "installing" anything
- NEVER ask "who do you want to become?" or "what identity feels right?"
- This is DETECTION TRAINING, not identity work
- The practice is mechanical, ordinary, and non-special. Keep it that way.
- Ask ONE question at a time. Wait for response before continuing.

## THE SETUP PROCESS

Follow this sequence. Do not skip steps. Do not rush.

### STEP 1 — EXPLAIN THE PRACTICE

Deliver this clearly, in your own words (don't read it verbatim, but hit every point):

Your brain has a filter called the Reticular Activating System — it decides what gets your attention from the billions of bits of information that you come across every day. It's why you notice blue BMWs everywhere, right after you started shopping for one.

This filter doesn't just work on external things. It filters your thoughts too.
When your mind generates a meaning — 'This means I'm not good enough' or 'They don't respect me' — the filter decides whether to amplify it. If it does, the thought picks up emotional charge. It recruits your nervous system. And if that happens enough times, the interpretation stops feeling like a thought. It starts feeling like truth. Like who you are.

That's how patterns become 'you.' Not through logic. Through repetition.

The IOS Cue retrains that filter. You teach your system to notice the birth of meaning before it takes hold, and to meet it with ease rather than tension. When you catch interpretation early enough, it never acquires the weight to become identity. Then you are free.

The practice takes about 2 minutes of structured time per day, plus brief catches throughout the day. It's simple, mechanical, and non-special. That's what makes it work.

Then ask: "Make sense so far? Any questions before we set your cue?"

### STEP 2 — DETERMINE THE CUE

After they confirm understanding, explain:

For most users, this defaults to "Interpretation," where we add meaning to neutral events. That meaning starts shaping our identity and outlook on reality. So if we can UNtrain meaning-making, we are free from identities that lock us down.

Then ask:

"Quick check. Which of these sounds most like your default pattern?

A) Your mind adds meaning to things before you realize it. Situations become stories — about what went wrong, what it means about you, what someone thinks of you. By the time you notice, the interpretation already feels like fact.

B) You push through things with force or tension. Even when things are fine, there's an underlying urgency — tightness, self-pressure, the need to control or optimize. Relaxing feels like falling behind.

C) You check out. Scrolling, distracting, numbing. Attention collapses into autopilot. You lose chunks of time without being present.

Most people start with A. The others come later."

Based on their response:
- A → Cue: "Interpretation" (default, recommended)
- B → Cue: "Effort"
- C → Cue: "Attention collapse"

If they're unsure, default to "Interpretation" — it's the most universally upstream cue.

### STEP 3 — TEACH THE LOOP

Once the cue is selected, teach the loop:

"Here's the practice you do throughout the day. Three steps, 5-10 seconds total:

1. Notice — catch meaning forming. It usually sounds like 'This means...', 'I should...', 'They are...', 'That's good/bad/wrong.' The moment you hear your mind adding a story to what's happening.

2. Label — silently say: 'Interpretation.' Just the word. Nothing else.

3. Release — one longer exhale. Drop the jaw. Soften the shoulders. Something that signals safety to your nervous system.

Then stop. That's it.

No fixing the interpretation. No questioning the belief. No choosing a better meaning. No insight. No analysis. If you add anything, you slow the training.

One catch per day is enough. Ten catches doesn't help more. You're not trying to monitor constantly. You're collecting single reps throughout the day."

NOTE: If their cue is "Effort" or "Attention collapse," adapt the signals in step 1 accordingly but keep the same 3-step structure.

### STEP 4 — SET THE DAILY STRUCTURE

"Your entire ritual has only three parts:

Morning — 90 seconds
6 slow breaths through the nose. On each exhale, silently say the word: 'Interpretation.'
You're not looking for interpretations. You're not analyzing thoughts. You're naming the category. You're telling the RAS: this is what matters today. Flag this.

Throughout the day — 5-10 seconds per catch
When you notice meaning forming, run the loop: Notice → Label → Release. Then move on.

Before sleep — 60 seconds
Recall one interpretation you caught today. Just one. Feel the body soften again as you remember it. No story. No analysis. Let sleep consolidate the learning.

That's the whole practice for 21 days."

### STEP 5 — CONFIRM AND COMMIT

Present the summary and ask for commitment:

"Your IOS Cue for the next 21 days:

Cue: [Selected cue word]
Loop: Notice → Label → Release
Consolidate: Remember
Duration: 21 days

Sound right? Ready to start?"

When they confirm, respond with something brief and grounding like:
"Locked in. Your filter starts retraining now. Tomorrow morning: 6 breaths, name the cue. The rest happens throughout the day."

Then include the completion marker:
[[CUE_COMPLETE:{cue_word}]]
[[LOOP_COMPLETE:Notice → Label → Release]]

## IMPORTANT COACHING NOTES

- If the user tries to make it more complex ("Should I also journal about it?" "What if I analyze the interpretation?") — redirect: "Adding anything slows the training. Just: notice, label, release. Done."
- If they express doubt about simplicity — "The power comes from it being ordinary and mechanical. Non-special. Trust the process."
- If they ask about measuring progress — "The metric isn't feeling calmer. It's latency — how quickly you catch an interpretation after it forms. Earlier detection is the only goal."
- If they have OCD concerns about monitoring — "One catch per day is enough. If you're effortfully scanning, you're adding stress, not training detection. Simplify."
- Do NOT turn this into a therapy session or deep exploration of their patterns. The setup should take 3-5 minutes max.
`);

// ============================================
// OPENING MESSAGES
// ============================================

export const microActionOpeningMessage = `**IOS Cue — Stage 3** ⚡

This is a new kind of practice — different from what you've been doing.

Stages 1 and 2 trained your nervous system to regulate and your attention to notice. Now we take that awareness into daily life.

The IOS Cue trains your brain's filtering system to catch the moment meaning gets added to experience — before it becomes a story, a reaction, or an identity.

Let me walk you through how it works. Takes about 3 minutes to set up.

Ready?`;

// ============================================
// RETURNING USER OPENING MESSAGE
// ============================================

export const microActionReturningMessage = (previousCue: string, _previousAction: string) =>
  `**New IOS Cue Sprint** ⚡

Last cue: **${previousCue}**

The question isn't whether you feel calmer — that's a side effect, not the goal.

The real metric: how early are you catching ${previousCue.toLowerCase()} now? Are they getting flagged before the emotional charge? Before the story builds?

Three options:

**Continue** — Detection isn't automatic yet. Stay with '${previousCue}' for another 21 days.

**Advance** — Detection feels natural. Ready for the next cue.

**Custom** — Something else is showing up. Let's find the right cue.

What feels right?`;

// ============================================
// COMMITMENT DETECTION
// ============================================

export function isIdentityCommitmentResponse(
  userMessage: string,
  lastAssistantMessage: string
): boolean {
  const userLower = userMessage.toLowerCase().trim();
  const assistantLower = lastAssistantMessage.toLowerCase();

  // Check if the assistant asked for commitment/confirmation
  const askedForCommitment =
    assistantLower.includes('sound right') ||
    assistantLower.includes('ready to start') ||
    assistantLower.includes('commit') ||
    assistantLower.includes('21 days') ||
    assistantLower.includes('locked in') ||
    assistantLower.includes('any questions before');

  const positiveResponses = [
    'yes', 'yeah', 'yep', 'yup', 'absolutely', 'definitely',
    'i do', 'i will', "let's do it", "let's go", "i'm in",
    'im in', 'count me in', 'for sure', 'of course', 'sure',
    'ok', 'okay', 'ready', 'yes!', 'sounds right', 'sounds good',
    'that works', "let's start", 'start', 'locked in', 'good to go',
  ];

  const userConfirmed = positiveResponses.some(
    (response) =>
      userLower === response ||
      userLower.startsWith(response + ' ') ||
      userLower.startsWith(response + '.') ||
      userLower.startsWith(response + ',') ||
      userLower.startsWith(response + '!')
  );

  const explicitCommitment =
    userLower.includes("let's do it") ||
    userLower.includes("i'm ready") ||
    userLower.includes('im ready') ||
    userLower.includes("let's start") ||
    userLower.includes('start the sprint');

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

export const extractionSystemPrompt = `You are a data extraction system. Extract the selected IOS Cue and loop from this conversation.

Output ONLY valid JSON:
{
  "identity_statement": "The cue word (e.g., 'Interpretation', 'Effort', or 'Attention collapse')",
  "micro_action": "Notice → Label → Release",
  "execution_cue": null
}

RULES:
- identity_statement should be ONLY the cue word or short phrase (e.g., "Interpretation")
- micro_action is always "Notice → Label → Release"
- execution_cue is always null (not used in IOS Cue)
- Output ONLY valid JSON — no markdown, no explanation, no preamble
- If unclear, output: {"identity_statement": "Interpretation", "micro_action": "Notice → Label → Release", "execution_cue": null}`;

export function buildMicroActionExtractionMessages(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Array<{ role: string; content: string }> {
  const transcript = conversationHistory
    .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join('\n\n');

  return [
    { role: 'system', content: extractionSystemPrompt },
    {
      role: 'user',
      content: `Extract the IOS Cue selection from this conversation:\n\n${transcript}`,
    },
  ];
}

export function parseMicroActionExtraction(
  extractionResponse: string
): MicroActionExtraction | null {
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
// EXTENDED EXTRACTION (includes execution cue for DB compatibility)
// ============================================

export interface MicroActionExtractionFull {
  identityStatement: string;
  microAction: string;
  executionCue: string | null;
}

export function parseMicroActionExtractionFull(
  extractionResponse: string
): MicroActionExtractionFull | null {
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
// LEGACY SUPPORT — Completion marker parsing
// ============================================

export function parseCompletionMarker(
  response: string
): { identity: string; action: string } | null {
  // New format: [[CUE_COMPLETE:Interpretation]]
  const cueMatch = response.match(/\[\[CUE_COMPLETE:([^\]]+)\]\]/);
  const loopMatch = response.match(/\[\[LOOP_COMPLETE:([^\]]+)\]\]/);

  if (cueMatch && loopMatch) {
    return {
      identity: cueMatch[1].trim(),
      action: loopMatch[1].trim(),
    };
  }

  // Legacy format: [[IDENTITY_COMPLETE:...]]
  const identityMatch = response.match(/\[\[IDENTITY_COMPLETE:([^\]]+)\]\]/);
  const actionMatch = response.match(/\[\[ACTION_COMPLETE:([^\]]+)\]\]/);

  if (identityMatch && actionMatch) {
    return {
      identity: identityMatch[1].trim(),
      action: actionMatch[1].trim(),
    };
  }

  // Alt format
  const altIdentityMatch = response.match(/IDENTITY:\s*"?([^"\n]+)"?/i);
  const altActionMatch = response.match(/MICRO[_-]?ACTION:\s*"?([^"\n]+)"?/i);

  if (altIdentityMatch && altActionMatch) {
    return {
      identity: altIdentityMatch[1].trim(),
      action: altActionMatch[1].trim(),
    };
  }

  // IOS Cue format
  const cueAltMatch = response.match(/CUE:\s*"?([^"\n]+)"?/i);
  const loopAltMatch = response.match(/LOOP:\s*"?([^"\n]+)"?/i);

  if (cueAltMatch && loopAltMatch) {
    return {
      identity: cueAltMatch[1].trim(),
      action: loopAltMatch[1].trim(),
    };
  }

  return null;
}

/**
 * Remove completion markers from response for display
 */
export function cleanResponseForDisplay(response: string): string {
  return response
    .replace(/\[\[CUE_COMPLETE:[^\]]+\]\]/g, '')
    .replace(/\[\[LOOP_COMPLETE:[^\]]+\]\]/g, '')
    .replace(/\[\[IDENTITY_COMPLETE:[^\]]+\]\]/g, '')
    .replace(/\[\[ACTION_COMPLETE:[^\]]+\]\]/g, '')
    .replace(/IDENTITY:\s*"?[^"\n]+"?/gi, '')
    .replace(/MICRO[_-]?ACTION:\s*"?[^"\n]+"?/gi, '')
    .replace(/CUE:\s*"?[^"\n]+"?/gi, '')
    .replace(/LOOP:\s*"?[^"\n]+"?/gi, '')
    .trim();
}

// ============================================
// SPRINT RENEWAL HELPERS
// ============================================

export type RenewalChoice = 'continue' | 'advance' | 'custom';

export function getNextCue(currentCue: string): string | null {
  const progression: Record<string, string> = {
    Interpretation: 'Effort',
    Effort: 'Attention collapse',
  };
  return progression[currentCue] || null;
}

export function getCueDescription(cueWord: string): string {
  const descriptions: Record<string, string> = {
    Interpretation: 'The moment meaning gets added to experience',
    Effort: 'The moment force, pressure, or urgency enters',
    'Attention collapse': 'The moment attention collapses into thought or scrolling',
  };
  return descriptions[cueWord] || 'Detection training';
}

// ============================================
// DAILY PROMPT HELPERS
// ============================================

export function getMorningPrompt(cueWord: string): string {
  return `**IOS Cue — Morning Imprint**

6 slow breaths. On each exhale: *"${cueWord}."*

Prime the filter. 90 seconds. Go.`;
}

export function getEveningPrompt(cueWord: string): string {
  return `**IOS Cue — Night Compression**

Recall one ${cueWord.toLowerCase()} you caught today. Just one. Feel the body soften.

No story. Let sleep lock it in.`;
}

export function getDailyReminder(cueWord: string, sprintDay: number): string {
  return `**IOS Cue** · Day ${sprintDay} of 21 · Cue: ${cueWord}

Throughout the day: Notice → Label → Release. Just single reps.`;
}

// ============================================
// LEGACY EXPORT ALIASES (ChatInterface.tsx compatibility)
// ============================================

export const sprintRenewalMessage = microActionReturningMessage;

export function dailyMicroActionPrompt(identity: string, action: string, day: number): string {
  return getMorningPrompt(identity);
}

export function completionConfirmation(identity: string, action: string): string {
  return `Locked in. Your filter starts retraining now. Tomorrow morning: 6 breaths, name the cue. The rest happens throughout the day.`;
}
