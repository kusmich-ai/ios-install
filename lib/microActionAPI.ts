// lib/microActionAPI.ts
// Morning Micro-Action (Coherence Constraint) Protocol API
// Version 3.0 - Cue-Compatible (No Identity Installation) + Two-Stage Extraction

// ============================================
// TYPES
// ============================================

export interface MicroActionState {
  isActive: boolean;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  currentStep: string;

  extractedCoherenceTarget: string | null;
  extractedAction: string | null;
  extractedAcknowledgment: string | null;

  isComplete: boolean;
  sprintStartDate: string | null;
  sprintNumber: number;
}

export interface MicroActionExtraction {
  coherenceTarget: string;
  microAction: string;
  acknowledgment: string;
}

export const initialMicroActionState: MicroActionState = {
  isActive: false,
  conversationHistory: [],
  currentStep: 'discovery',

  extractedCoherenceTarget: null,
  extractedAction: null,
  extractedAcknowledgment: null,

  isComplete: false,
  sprintStartDate: null,
  sprintNumber: 0
};

// ============================================
// SYSTEM PROMPT (Cue-Compatible)
// ============================================

export const microActionSystemPrompt = `You are a coherence coach helping a user set a Morning Micro-Action — a 21-day behavioral constraint that trains stability and aligned action.

This is NOT identity installation. Do not frame it as becoming someone. Do not use “I am…” statements. Do not use affirmation language.

## YOUR ROLE
Guide the user to choose:
1) A friction point (where reactivity, avoidance, or drift shows up)
2) One tiny daily action (<5 minutes) that reduces that friction
3) A single acknowledgement line after completion (“Evidence logged.”)

Be direct. No cheerleading or fluff. Mirror their language. Ask one question at a time.

## THE PROCESS (follow naturally)

### Phase 1: Find the friction
- Reflect what they shared and make it specific.
- Ask: “Where does the system slip most often — morning, midday, or evening?”

### Phase 2: Choose the coherence target (non-identity)
Define the target as a behavior/state constraint, not a self.
Examples:
- “Start clean” (no phone first 10 minutes)
- “Single-tab focus”
- “Slow the first response”
- “Body-first for 60 seconds”

Ask: “What would ‘coherence’ look like in that moment, in one short phrase?”

### Phase 3: Design the micro-action (behavior only)
Ask: “What’s one action under 5 minutes each morning that proves coherence in that moment?”

Test with ACE (one at a time):
- ATOMIC: doable on worst mornings
- CONGRUENT: directly reduces the identified friction
- CLEAN: no moral pressure, no self-judgment required

### Phase 4: Contract + commitment
Present:
“For 21 days:
- My coherence target: [target phrase]
- My morning micro-action: [action]
- After I do it: I say ‘Evidence logged.’”

Ask: “Commit for 21 days? (yes/no)”

## IMPORTANT RULES
- One question per message.
- No identity language (“I am…”, “be the kind of person…”, “install identity”, “proof of who you are”).
- If they drift into meaning/identity: redirect: “No story. What’s the smallest action?”

## CLOSING AFTER COMMITMENT
Restate target + action + acknowledgement line. Keep it short.`;

// ============================================
// OPENING MESSAGE
// ============================================

export const microActionOpeningMessage = `Let's set up your Morning Micro-Action — a 21-day coherence constraint.

This trains your mental operating system by reducing friction at a specific failure point using one small daily action. No affirmations. Just repeatable evidence.

Let's begin — where does your system slip most often right now?

It could be internal (reactivity, overwhelm, loops) or external (work, relationships, health). Name the friction.`;

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
    'i do', 'i will', 'i commit', 'committed', 'let\'s do it',
    'let\'s go', 'i\'m in', 'im in', 'count me in', 'for sure',
    'of course', 'sure', 'ok', 'okay', 'ready', 'yes!'
  ];

  const userConfirmed = positiveResponses.some(response =>
    userLower === response ||
    userLower.startsWith(response + ' ') ||
    userLower.startsWith(response + '.') ||
    userLower.startsWith(response + ',') ||
    userLower.startsWith(response + '!')
  );

  const explicitCommitment =
    userLower.includes('i commit') ||
    userLower.includes('i will commit') ||
    userLower.includes('i\'m committed') ||
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
    { role: 'system', content: microActionSystemPrompt }
  ];

  for (const msg of conversationHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }

  messages.push({ role: 'user', content: newUserMessage });

  return messages;
}

// ============================================
// EXTRACTION SYSTEM (Stage 2)
// ============================================

const extractionSystemPrompt = `You are a data extraction system. Output ONLY JSON.

Extract the FINAL confirmed:
- coherence_target: the short phrase they are training (e.g., "Start clean", "Slow the first response")
- micro_action: the exact micro-action they committed to
- acknowledgment: the exact completion line (default "Evidence logged.")

Format:
{
  "coherence_target": "string or null",
  "micro_action": "string or null",
  "acknowledgment": "string or null"
}

Rules:
1. Extract FINAL confirmed versions only (not intermediate drafts)
2. Output ONLY the JSON object (no markdown, no explanation)
3. If unclear: output nulls`;

export function buildMicroActionExtractionMessages(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Array<{ role: string; content: string }> {
  const transcript = conversationHistory
    .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join('\n\n');

  return [
    { role: 'system', content: extractionSystemPrompt },
    { role: 'user', content: `Extract the fields from this conversation:\n\n${transcript}` }
  ];
}

export function parseMicroActionExtraction(
  extractionResponse: string
): MicroActionExtraction | null {
  try {
    const jsonMatch = extractionResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[MicroAction] No JSON found in extraction response');
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.coherence_target || !parsed.micro_action) {
      console.error('[MicroAction] Missing required fields in extraction');
      return null;
    }

    return {
      coherenceTarget: parsed.coherence_target,
      microAction: parsed.micro_action,
      acknowledgment: parsed.acknowledgment || 'Evidence logged.'
    };
  } catch (error) {
    console.error('[MicroAction] Failed to parse extraction:', error);
    return null;
  }
}

// ============================================
// LEGACY SUPPORT (optional)
// ============================================

/**
 * @deprecated Legacy function to parse inline completion markers.
 * Kept for backward compatibility.
 */
export function parseCompletionMarker(response: string): { identity: string; action: string } | null {
  const identityMatch = response.match(/\[\[IDENTITY_COMPLETE:([^\]]+)\]\]/);
  const actionMatch = response.match(/\[\[ACTION_COMPLETE:([^\]]+)\]\]/);

  if (identityMatch && actionMatch) {
    return {
      identity: identityMatch[1].trim(),
      action: actionMatch[1].trim()
    };
  }

  const altIdentityMatch = response.match(/IDENTITY:\s*"?([^"\n]+)"?/i);
  const altActionMatch = response.match(/MICRO[_-]?ACTION:\s*"?([^"\n]+)"?/i);

  if (altIdentityMatch && altActionMatch) {
    return {
      identity: altIdentityMatch[1].trim(),
      action: altActionMatch[1].trim()
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
