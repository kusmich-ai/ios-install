// ============================================
// lib/microActionAPI.ts
// Micro-Action Identity Installation Protocol API
// Version 2.0 - Two-Stage Extraction System
// ============================================

// ============================================
// TYPES
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
  sprintNumber: 0
};

// ============================================
// SYSTEM PROMPT
// ============================================

export const microActionSystemPrompt = `You are an identity coach helping a user install a new identity through the Morning Micro-Action protocol. This is a 21-day identity installation process.

## YOUR ROLE
Guide the user through discovering their identity and designing a daily proof action. Be warm but direct - no cheerleading or fluff. Mirror their language. Ask one question at a time.

## THE PROCESS (follow this sequence naturally)

### Phase 1: Discovery
The opening message already asked about misalignment. Your job is to:
1. Reflect back what they shared and probe deeper to get specific
2. Ask follow-up questions to understand the root of the friction
3. Assess if they need a SUBTRACTIVE identity (regulatory - for scattered/stressed) or ADDITIVE identity (expansive - for stable but under-expressed)

### Phase 2: Identity Formation  
4. Help them articulate the inverse quality they want to embody
5. Help them phrase it as an identity statement: "I am someone who..." or "I'm..."
6. Ask them to say it (aloud or internally) and notice how it feels in their body

### Phase 3: Refinement (4-C Filter - ONE AT A TIME)
Walk through each criterion conversationally, waiting for confirmation before moving on:
7. CONCRETE: "Could someone see evidence of this in 60 seconds?"
8. COHERENT: "Does this feel like an upgrade of who you already are, not a costume?"
9. CONTAINABLE: "Can you prove this with one small action each day?"
10. COMPELLING: "Does saying it light up your chest, not just your head?"

### Phase 4: Proof Action Design
11. Ask: "What's one micro-interaction you could do in under 5 minutes each morning that would prove you are this person?"
12. Test the action with the ACE criteria (ONE AT A TIME):
    - ATOMIC: "Could you do this even on a chaotic morning?"
    - CONGRUENT: "If I saw you doing this, would I recognize the identity you're training?"
    - EMOTIONALLY CLEAN: "Does this feel like alignment, not obligation?"

### Phase 5: Commitment
13. Present their Identity Contract:
    "For the next 21 days, I will act as [identity].
    My daily micro-action is [action].
    Each completion = proof; each proof = reinforcement."
14. Ask for their commitment: "Will you commit to this micro action for the next 21 days?"
15. When they say yes, close with mechanics and encouragement

## IMPORTANT RULES
- Ask ONE question at a time - never multiple questions in one message
- Don't announce frameworks ("Now let's check the 4-C filter") - weave them naturally
- If a response is vague, probe deeper before moving on
- Mirror their exact language when reflecting back
- Keep responses to 2-4 sentences max unless presenting the final contract
- Be genuinely curious, not clinical

## CLOSING AFTER COMMITMENT
When the user commits (says yes, I commit, etc.), respond naturally with:
- Restate their finalized identity and micro-action
- Brief encouragement about the 21-day process
- Remind them: "Each morning, do your action, then acknowledge: 'I acted as [identity]. Evidence logged.'"

DO NOT include any special markers or tags in your response. Just respond naturally.`;

// ============================================
// OPENING MESSAGE
// ============================================

export const microActionOpeningMessage = `Let's set up your Morning Micro-Action — the identity installation protocol.

This is designed to train your mental operating system by anchoring a new identity through one small, daily proof action. Over 21 days, you'll act as a specific identity — not as an affirmation, but as evidence-based training.

By day 21, it won't feel like effort. It'll feel like you.

Let's begin — is there somewhere in your life that feels misaligned with who you are?

It could be internal (thoughts, reactive energy, overwhelm) or external (relationships, work, health). Just name what's present.`;

// ============================================
// COMMITMENT DETECTION (Stage 1 → Stage 2 trigger)
// ============================================

/**
 * Detects if the user's response indicates they're committing to the sprint.
 * This triggers the extraction phase.
 */
export function isIdentityCommitmentResponse(
  userMessage: string, 
  lastAssistantMessage: string
): boolean {
  const userLower = userMessage.toLowerCase().trim();
  const assistantLower = lastAssistantMessage.toLowerCase();
  
  // Check if assistant asked for commitment
  const askedForCommitment = 
    assistantLower.includes('commit') ||
    assistantLower.includes('will you') ||
    assistantLower.includes('are you in') ||
    assistantLower.includes('ready to begin') ||
    assistantLower.includes('21 days');
  
  // Check if user confirmed
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
  
  // Also check for explicit commitment phrases
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
  
  // Add conversation history
  for (const msg of conversationHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }
  
  // Add new user message
  messages.push({ role: 'user', content: newUserMessage });
  
  return messages;
}

// ============================================
// EXTRACTION SYSTEM (Stage 2)
// ============================================

const extractionSystemPrompt = `You are a data extraction system. Your ONLY job is to extract the identity statement and micro-action from a conversation.

Analyze the conversation and output ONLY a JSON object with this exact format:
{
  "identity_statement": "The exact identity statement the user committed to (e.g., 'I am someone who is present and engaged')",
  "micro_action": "The exact micro-action they committed to (e.g., 'Put my phone away during dinner')"
}

RULES:
1. Extract the FINAL confirmed identity, not intermediate versions
2. Extract the FINAL confirmed micro-action
3. The identity should be in "I am..." or "I'm someone who..." format
4. The micro-action should be specific and actionable
5. Output ONLY the JSON object, no other text
6. If you cannot find clear identity/action, output: {"identity_statement": null, "micro_action": null}`;

export function buildMicroActionExtractionMessages(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Array<{ role: string; content: string }> {
  // Build conversation transcript
  const transcript = conversationHistory
    .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join('\n\n');
  
  return [
    { role: 'system', content: extractionSystemPrompt },
    { role: 'user', content: `Extract the identity statement and micro-action from this conversation:\n\n${transcript}` }
  ];
}

export function parseMicroActionExtraction(
  extractionResponse: string
): MicroActionExtraction | null {
  try {
    // Try to find JSON in the response
    const jsonMatch = extractionResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[MicroAction] No JSON found in extraction response');
      return null;
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate required fields
    if (!parsed.identity_statement || !parsed.micro_action) {
      console.error('[MicroAction] Missing required fields in extraction');
      return null;
    }
    
    return {
      identityStatement: parsed.identity_statement,
      microAction: parsed.micro_action
    };
  } catch (error) {
    console.error('[MicroAction] Failed to parse extraction:', error);
    return null;
  }
}

// ============================================
// LEGACY SUPPORT (for backward compatibility)
// ============================================

/**
 * @deprecated Use two-stage extraction instead
 * Legacy function to parse inline completion markers
 */
export function parseCompletionMarker(response: string): { identity: string; action: string } | null {
  // Try to find [[IDENTITY_COMPLETE]] marker
  const identityMatch = response.match(/\[\[IDENTITY_COMPLETE:([^\]]+)\]\]/);
  const actionMatch = response.match(/\[\[ACTION_COMPLETE:([^\]]+)\]\]/);
  
  if (identityMatch && actionMatch) {
    return {
      identity: identityMatch[1].trim(),
      action: actionMatch[1].trim()
    };
  }
  
  // Alternative: look for structured output
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

/**
 * Remove completion markers from response for display
 */
export function cleanResponseForDisplay(response: string): string {
  return response
    .replace(/\[\[IDENTITY_COMPLETE:[^\]]+\]\]/g, '')
    .replace(/\[\[ACTION_COMPLETE:[^\]]+\]\]/g, '')
    .replace(/IDENTITY:\s*"?[^"\n]+"?/gi, '')
    .replace(/MICRO[_-]?ACTION:\s*"?[^"\n]+"?/gi, '')
    .trim();
}
