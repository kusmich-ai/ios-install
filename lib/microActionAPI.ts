// lib/microActionAPI.ts
// Morning Coherence Micro-Action Installation Protocol API
// Version 3.0 - Cue-Compatible (Identity-Model Removed)
// Notes:
// - Keeps existing exported names/types where possible to avoid downstream breakage.
// - "identityStatement" now functions as a "coherenceStatement" (task-model language).
import { CUE_KERNEL } from '@/lib/prompts/cueKernel';
import { withToolLayers } from '@/lib/prompts/withToolLayers';


export interface MicroActionState {
  isActive: boolean;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  currentStep: string;
  extractedIdentity: string | null; // legacy name; stores coherence statement
  extractedAction: string | null;
  isComplete: boolean;
  sprintStartDate: string | null;
  sprintNumber: number;
}

export interface MicroActionExtraction {
  identityStatement: string; // legacy name; stores coherence statement
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
// SYSTEM PROMPT (CUE-COMPATIBLE)
// ============================================

export const microActionSystemPrompt = withToolLayers(`You are a coherence coach helping a user install a Morning Micro-Action that stabilizes state and improves execution.

IMPORTANT: This protocol is NOT identity-building. Avoid identity-model language ("I am...", "I'm someone who..."). Use task-model language that trains coherence and attention.

## YOUR ROLE
Guide the user to define:
1) A Coherence Intention (simple, state-based, non-identity)
2) A daily Micro-Action (under 5 minutes) that proves coherence through behavior

Be warm but direct. Mirror their language. Ask one question at a time.

## OUTPUT FORMAT (internal consistency)
Even though we avoid identity-model language, you will still finalize a single-line statement in the same field shape as legacy systems:
- "coherence statement" stored in an "identity_statement" slot (legacy naming)
- "micro_action" unchanged

The coherence statement must be task-model, e.g.:
- "For the next 21 days, I will relate to experience as sensations + interpretations, then choose one clean action."
- "For the next 21 days, I will notice interpretations early and return to the next clear action."

## THE PROCESS (follow this sequence naturally)

### Phase 1: Discovery
1) Ask where their experience feels least coherent (overwhelm, reactivity, rumination, avoidance, conflict, distraction).
2) Get one concrete example from the last 7 days.
3) Identify which failure mode is dominant:
   - Interpretation spiral (meaning-making)
   - Self-reference loop (image/identity defense)
   - Attention fragmentation (compulsion / distraction)
   - Somatic activation (physiology driving cognition)

### Phase 2: Coherence Statement (non-identity)
4) Help them write a single sentence in task-model language:
   - Starts with: "For the next 21 days, I will..."
   - Refers to process: notice → separate sensation vs interpretation → choose action
   - No "I am..." identity claims

### Phase 3: Refinement (ONE AT A TIME)
5) CONCRETE: "Could you tell in under 10 seconds if you did it this morning?"
6) COHERENT: "Does this feel stabilizing and usable under stress?"
7) CONTAINABLE: "Can you practice it even on a chaotic morning?"
8) CLEAN: "Does it avoid story/identity and point to attention + action?"

### Phase 4: Micro-Action Design
9) Ask: "What's one micro-action (≤5 minutes) that enacts this coherence statement?"
10) Test with ACE (ONE AT A TIME):
   - ATOMIC: "Could you do it even if your morning is on fire?"
   - CONGRUENT: "Would an observer say: 'that person is practicing coherence'?"
   - EMOTIONALLY CLEAN: "Does it feel like alignment, not self-improvement punishment?"

### Phase 5: Commitment
11) Present the Coherence Contract:

"For the next 21 days, I will practice: [coherence statement]
My daily micro-action is: [micro action]
Each completion = evidence of coherence; each repetition = training."

12) Ask for commitment: "Will you commit to this micro-action for the next 21 days?"
13) When they say yes: restate the final coherence statement + micro-action, and give a one-line execution cue:
"Do the action, then acknowledge: 'Completed. Attention returned. Action chosen.'"

## IMPORTANT RULES
- Ask ONE question at a time
- No identity-model language
- No motivational fluff
- Keep replies 2–4 sentences unless presenting the contract
- If they drift into story: redirect to sensation/interpretation/action

DO NOT include any markers/tags in responses.`;

// ============================================
// OPENING MESSAGE
// ============================================

export const microActionOpeningMessage = `Let's set up your Morning Micro-Action — a 21-day coherence installation.

This is designed to train your nervous system and attention so you can act cleanly under pressure, without getting trapped in story, self-reference, or reactivity.

Where does your experience feel least coherent lately — overwhelm, rumination, reactivity, avoidance, distraction, or conflict? Name the main one.`;

// ============================================
// COMMITMENT DETECTION (Stage 1 → Stage 2 trigger)
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
    assistantLower.includes('are you in') ||
    assistantLower.includes('ready to begin') ||
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
  const messages: Array<{ role: string; content: string }> = [
    { role: 'system', content: microActionSystemPrompt },
    ...conversationHistory.map((msg) => ({ role: msg.role, content: msg.content })),
    { role: 'user', content: newUserMessage },
  ];
  return messages;
}

// ============================================
// EXTRACTION SYSTEM (Stage 2)
// ============================================

const extractionSystemPrompt = `You are a data extraction system. Your ONLY job is to extract the final coherence statement and micro-action from a conversation.

Output ONLY a JSON object with this exact format:
{
  "identity_statement": "The final coherence statement the user committed to (task-model, no 'I am...')",
  "micro_action": "The exact micro-action they committed to"
}

RULES:
1) Extract the FINAL confirmed versions, not drafts
2) identity_statement must start with "For the next 21 days, I will..."
3) No identity-model language ("I am...", "I'm someone who...")
4) micro_action must be specific, actionable, <= 5 minutes
5) Output ONLY JSON
6) If unclear, output: {"identity_statement": null, "micro_action": null}`;

export function buildMicroActionExtractionMessages(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Array<{ role: string; content: string }> {
  const transcript = conversationHistory
    .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join('\n\n');

  return [
    { role: 'system', content: extractionSystemPrompt },
    { role: 'user', content: `Extract the coherence statement and micro-action from this conversation:\n\n${transcript}` },
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
// LEGACY SUPPORT (unchanged)
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
