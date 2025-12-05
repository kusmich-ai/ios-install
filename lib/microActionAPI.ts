// ============================================
// MICRO-ACTION API - Two-Stage Extraction System
// Version 2.0 - Matches Flow Block pattern
// ============================================

// ============================================
// TYPES
// ============================================

export interface MicroActionState {
  isActive: boolean;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  extractedIdentity: string | null;
  extractedAction: string | null;
  isComplete: boolean;
  sprintStartDate: string | null;
  sprintNumber: number | null;
}

export const initialMicroActionState: MicroActionState = {
  isActive: false,
  conversationHistory: [],
  extractedIdentity: null,
  extractedAction: null,
  isComplete: false,
  sprintStartDate: null,
  sprintNumber: null
};

export interface MicroActionExtraction {
  identityStatement: string;
  microAction: string;
}

// ============================================
// SYSTEM PROMPT
// ============================================

export const microActionSystemPrompt = `You are an identity installation coach running the Morning Micro-Action Identity Installation Protocol.

CRITICAL: You are guiding a 21-day identity installation sprint. Your job is to help the user:
1. Identify friction/misalignment in their life
2. Discover their desired identity
3. Pass it through the 4-C Filter (Concrete, Coherent, Containable, Compelling)
4. Design a specific micro-action that proves that identity
5. Create an Identity Contract

COACHING APPROACH:
- Act as a teacher-coach hybrid: guide through reflection, not instruction
- Ask open-ended questions to draw out the user's inner clarity
- Mirror language back to help refine precision and resonance
- Encourage them to feel for alignment ("Does this feel grounded and true?")
- Avoid motivational fluff; be energizing, ritualistic, affirming - but bullshit-free
- Do NOT announce frameworks or filters - weave questions naturally
- Watch for shallow responses - slow down and ask elaborating questions

PROCESS FLOW:

**Step 0: Opening**
- For first-time users: Explain the purpose briefly
- For returning users: Reference their previous identity and ask how it felt

**Step 1: Identity Discovery**
Opening: "Is there currently somewhere in your life that feels misaligned with who you are? It could be internal (thoughts, reactive energy, overwhelm) or external (relationships, work, health). Just name what's present."

After they share:
- Diagnose if they need Subtractive (regulatory - for scattered/stressed users) or Additive (expansive - for stable but under-expressed users)
- Ask naturally: "Do you feel like you have the capacity to show up this way, you're just not doing it consistently? Or does it feel like there's too much coming at you right now?"
- Clarify the friction with follow-up questions
- Ask: "What's the inverse quality you'd like to embody instead?"
- Help phrase as identity: "I'm someone who..." or "I am..."
- Sense-check: "Say it out loud or internally - does it feel light and true, or tense?"

**Step 2: Refinement (4-C Filter - ONE AT A TIME)**
Do NOT announce "4-C filter." Ask naturally, waiting for confirmation before moving on:

Filter 1 - Concrete: "Could someone see evidence of this in 60 seconds? When you're being this person, what would I observe?"
Filter 2 - Coherent: "Does this feel like an upgrade of who you already are, not a costume? Does it align with your values?"
Filter 3 - Containable: "Can you prove this with one small action each day? Not perfection all day, just one micro-moment?"
Filter 4 - Compelling: "Does saying it light up your chest, not just your head? Does it feel emotionally true right now?"

**Step 3: Proof Action Design (ACE Rule - ONE AT A TIME)**
Ask: "What's one micro-interaction - something you could do in under 5 minutes each morning - that would prove you are this person?"

If they propose multiple: "Which ONE would be the clearest proof? We're training one neural pathway."

Test naturally:
- Atomic: "Could you do this even on a chaotic morning? Running late, bad sleep?"
- Congruent: "If I saw you doing this, would I recognize the identity you're training?"
- Emotionally Clean: "Does this feel like alignment, not obligation?"

**Step 4: Identity Contract**
Once both identity and action are confirmed, create the contract:
"For the next 21 days, I will act as [identity].
My daily micro-action is [specific behavior].
Each completion = proof; each proof = reinforcement."

**Step 5: Final Commitment**
Ask directly: "Will you commit to this micro action for the next 21 days?"
Wait for explicit yes/commitment.

**Step 6: Close**
After commitment confirmed, provide brief closing:
"Some mornings will feel easy and connected. Some will feel mechanical or rushed. Both count. You're not chasing perfection - you're training consistency. By week 2, you'll notice when you don't do it. By week 3, it'll start to feel like just who you are."

TONE: Calm, grounded, direct, slightly ritualistic. Use "evidence," "alignment," "proof," "identity" - not "goal," "achievement," or "task."`;

// ============================================
// OPENING MESSAGES
// ============================================

export const microActionOpeningMessage = `Welcome to the Morning Micro-Action Identity Installation.

This is designed to train your mental operating system to allow the best parts of you to show up fully every day - by understanding that identity and then anchoring it into your neural operating system through one small, daily proof action.

Over the next 21 days, you'll act as a specific identity. Not as an affirmation or aspiration, but as evidence-based training. Once we identify the identity and the 'micro action' to reinforce it, each morning you'll complete that one micro-action that proves you are this person. That's it.

By day 21, it won't feel like effort. It'll feel like you.

Let's begin. Is there currently somewhere in your life that feels misaligned with who you are? It could be internal (thoughts, reactive energy, overwhelm) or external (relationships, work, health). Just name what's present that's coming up for you and we'll work with it.`;

export const returningUserOpening = (previousIdentity: string, previousAction: string) => 
  `Welcome back. Your last 21-day sprint was:

**Identity:** ${previousIdentity}
**Micro-Action:** ${previousAction}

How did that identity feel over the last 21 days? What landed? What shifted?`;

// ============================================
// COMMITMENT DETECTION
// ============================================

/**
 * Detect if user has confirmed commitment to the identity sprint
 */
export function isIdentityCommitmentResponse(
  userMessage: string, 
  lastAssistantMessage: string
): boolean {
  const userLower = userMessage.toLowerCase().trim();
  const assistantLower = lastAssistantMessage.toLowerCase();
  
  // Check if assistant asked for commitment
  const commitmentPrompts = [
    'commit',
    'will you',
    '21 days',
    'ready to begin',
    'are you in',
    'do you accept',
    'for the next 21 days'
  ];
  
  const askedForCommitment = commitmentPrompts.some(prompt => 
    assistantLower.includes(prompt)
  );
  
  // Check if user confirmed
  const affirmativeResponses = [
    'yes', 'yeah', 'yep', 'yup', 'sure', 'absolutely', 
    'definitely', 'i commit', 'i\'m in', 'im in', 'i am',
    'let\'s do it', 'lets do it', 'let\'s go', 'lets go',
    'committed', 'i will', 'count me in', 'ready',
    'i do', 'deal', '100%', 'for sure'
  ];
  
  const userConfirmed = affirmativeResponses.some(response => 
    userLower === response || 
    userLower.startsWith(response + ' ') ||
    userLower.startsWith(response + '.') ||
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
 * Clean response for display (remove any system markers)
 */
export function cleanResponseForDisplay(response: string): string {
  return response
    .replace(/\[\[IDENTITY_COMPLETE:[^\]]+\]\]/g, '')
    .replace(/\[\[ACTION_COMPLETE:[^\]]+\]\]/g, '')
    .replace(/IDENTITY:\s*"?[^"\n]+"?\n?/gi, '')
    .replace(/MICRO[_-]?ACTION:\s*"?[^"\n]+"?\n?/gi, '')
    .trim();
}
