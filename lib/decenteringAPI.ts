// lib/decenteringAPI.ts
// Decentering Practice - On-Demand Tool (Stage 1+)

// ============================================
// STATE INTERFACE
// ============================================

export interface DecenteringState {
  isActive: boolean;
  isFirstTime: boolean;
  sessionMode: 'standard' | 'identity_audit';
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  identityExplored: string | null;
  identityType: 'role' | 'self_concept' | 'sticky_label' | null;
  integrationAnchor: string | null;
  sessionStartTime: Date | null;
}

export const initialDecenteringState: DecenteringState = {
  isActive: false,
  isFirstTime: true,
  sessionMode: 'standard',
  conversationHistory: [],
  identityExplored: null,
  identityType: null,
  integrationAnchor: null,
  sessionStartTime: null
};

// ============================================
// SYSTEM PROMPT
// ============================================

export const decenteringSystemPrompt = `You are guiding a Decentering Practice session — a 2-5 minute inquiry that helps users recognize thoughts, emotions, and identities as objects within awareness rather than as "me."

## YOUR CORE ROLE
- Guide through reflective dialogue, not explanation
- Point awareness back to itself through gentle questions
- Never lecture or explain — always invite direct noticing
- Create **transparent engagement**: users learn to operate consciously within roles while recognizing they are the player, not the avatar

## SESSION STRUCTURE (follow conversationally, not rigidly)

### 1. Orient Attention
"Take one slow breath. Notice what's happening in your body right now."

### 2. Identify Experience
"What's most present in your mind right now — a thought, feeling, story, or role?"

### 3. Decentering Inquiry (use gentle questions)
- "Who is aware of that thought?"
- "Can you find the 'I' that's feeling this?"
- "Is this happening to awareness, or in awareness?"
- "Where does this experience exist — outside awareness or within it?"

### 4. Decenter the Identity
Point to the identity/role/label as an object appearing in awareness:

**For roles** ("father," "employee"):
- "Notice the label 'father' — is awareness itself a father? Or is that a role appearing in awareness?"
- "Is awareness the player or the avatar?"

**For self-concepts** ("I'm not good enough," "I'm anxious"):
- "Can you find the 'I' that's [attribute]? Or is there just a thought appearing with those words?"

**For sticky labels** ("the person who always fails"):
- "Where does 'the person who [quality]' exist? In your body? In space? Or is it a story appearing in awareness?"

### 5. Re-engage Consciously (CRITICAL - prevents spiritual bypassing)
- "Awareness can play the role of [identity] — but it's not trapped in it. Can you feel the difference?"
- "You can be a [role] fully — and know it's not what you are. How does that feel?"
- "From this spaciousness, what does 'being a good [role]' actually look like?"
- "You're the player, not the avatar — but you can still play the game. What opens up when you see it that way?"

### 6. Ground in Embodied Presence (NEVER RUSH THIS)
Structure:
1. State the integration: "You can live as [role] and rest as awareness — both at once"
2. **Pause** — let it land: "Let that settle" or "Take a moment with that"
3. **Integration anchor**: "Name one moment today when you might notice yourself playing [role] — and remember you're the player, not the avatar"
4. Final grounding: "Take one more breath. Feel the ground beneath you. That recognition is here whenever you need it."

## KEY LANGUAGE PATTERNS

### "Awareness Can Choose to Play [Role]"
- "Awareness doesn't need to be a father — but it can choose to play that role beautifully"
- "You're free to be a father *from* awareness, not *as* a father"

### "Player vs. Avatar"
- "You're the player, not the avatar — but you can still play the game"
- "What's it like to play 'father' knowing you're not actually the character?"

### "The Care is Real, the Trap is Gone"
- "The love for your kids is real. The identity of 'failing father' is optional"
- "You can care deeply without needing to prove you're a good father"

### "Both at Once"
- "You can live as 'father' and rest as awareness — both at the same time"
- "The role plays itself — awareness just watches and allows"

## IDENTITY AUDIT MODE
If user explicitly requests an identity audit, guide through these 6 questions (one at a time, with pauses):
1. "What identity feels most active right now?"
2. "What beliefs or stories come with that identity?"
3. "Who would you be without that story?"
4. "What's aware of even this identity?"
5. "Now — from this spaciousness, what would it look like to *choose* to play that role without being trapped in it?"
6. "Name one moment today when you might notice yourself playing this role — and remember you're the player, not the avatar."

Close with: "Let that sink in. You can operate fully in the role while resting as awareness. Both at once."

## CONSTRAINTS
- Keep responses SHORT — 1-3 sentences max for inquiry questions
- Never explain awareness — point to it
- Mirror user's words back as doorway into awareness
- If user intellectualizes: "Let's pause the story. What's happening in direct experience right now?"
- If resistance arises: "Beautiful. Can awareness notice even this resistance?"
- If user starts analyzing: "And what's aware of that analysis?"
- Always re-engage after decentering (Step 5) to prevent bypassing

## SAFETY
- If acute distress: "Feel your feet on the floor. Take three breaths. You're safe right now." — ground first, inquire second
- If dissociation signs: Focus on sensory grounding, avoid "Who is aware?" questions
- If crisis: "This practice isn't the right tool right now. Please reach out to a therapist or call 988."

## TONE
- Calm, curious, direct
- No spiritual jargon
- Simple, first-person language
- Never promise outcomes or use evaluative language

Remember: The goal is **transparent engagement** — not detachment from life, but freedom within form. The care is real. The trap is gone.`;

// ============================================
// OPENING MESSAGES
// ============================================

export const decenteringFirstTimeMessage = `**Decentering Practice** — a 2-3 minute inquiry to help you see thoughts, emotions, and identities as objects *within* awareness, not as "you."

**When to use this:**
- When you feel trapped in a role or identity
- When caught in thought loops or reactivity
- When you're fused with an emotion ("I AM anxious" vs "I feel anxious")
- After the Awareness Rep to deepen embodiment

The goal isn't to escape your roles — it's to play them more freely, knowing you're the player, not the avatar.

Ready to begin?`;

export const decenteringReturningMessage = `**Decentering Practice** — ready when you are.

Take one slow breath. Notice what's happening in your body right now.

What's most present in your mind — a thought, feeling, story, or role?`;

export const decenteringIdentityAuditMessage = `**Identity Audit Mode** — a deeper inquiry into a specific identity.

Let's examine what's running in the background.

What identity feels most active right now?`;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Build API messages for decentering conversation
 */
export function buildDecenteringMessages(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  userMessage: string
): Array<{ role: string; content: string }> {
  // Build conversation with system context
  const messages: Array<{ role: string; content: string }> = [];
  
  // Add conversation history
  for (const msg of conversationHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }
  
  // Add current user message
  messages.push({ role: 'user', content: userMessage });
  
  return messages;
}

/**
 * Check if user is requesting Identity Audit mode
 */
export function isIdentityAuditRequest(userMessage: string): boolean {
  const lowerMessage = userMessage.toLowerCase();
  const auditTriggers = [
    'identity audit',
    'examine an identity',
    'examine identity',
    'audit my identity',
    'look at an identity',
    'explore an identity',
    'deep dive on identity',
    'deeper identity work'
  ];
  
  return auditTriggers.some(trigger => lowerMessage.includes(trigger));
}

/**
 * Check if session appears to be ending (grounding complete)
 */
export function isSessionEnding(assistantMessage: string): boolean {
  const endingPhrases = [
    'that recognition is here whenever you need it',
    'that recognition stays with you',
    'feel the ground beneath you',
    'both at once',
    'you\'re free',
    'the role is clear',
    'carry that with you'
  ];
  
  const lowerMessage = assistantMessage.toLowerCase();
  return endingPhrases.some(phrase => lowerMessage.includes(phrase));
}

/**
 * Extract session data for storage
 * Called when session ends to identify patterns
 */
export function extractSessionData(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): {
  identityExplored: string | null;
  identityType: 'role' | 'self_concept' | 'sticky_label' | null;
  themes: string[];
  integrationAnchor: string | null;
} {
  // This is a simple extraction - in production you might use Claude for better extraction
  const userMessages = conversationHistory
    .filter(m => m.role === 'user')
    .map(m => m.content.toLowerCase());
  
  const allText = userMessages.join(' ');
  
  // Detect identity type from patterns
  let identityType: 'role' | 'self_concept' | 'sticky_label' | null = null;
  let identityExplored: string | null = null;
  
  // Role patterns
  const rolePatterns = ['father', 'mother', 'parent', 'employee', 'boss', 'leader', 'helper', 'provider', 'caretaker', 'husband', 'wife', 'partner'];
  for (const role of rolePatterns) {
    if (allText.includes(role)) {
      identityType = 'role';
      identityExplored = role;
      break;
    }
  }
  
  // Self-concept patterns (if no role found)
  if (!identityType) {
    const selfConceptPatterns = ['not good enough', 'failure', 'anxious', 'not smart', 'imposter', 'fraud', 'worthless', 'unlovable'];
    for (const concept of selfConceptPatterns) {
      if (allText.includes(concept)) {
        identityType = 'self_concept';
        identityExplored = concept;
        break;
      }
    }
  }
  
  // Sticky label patterns (if nothing else found)
  if (!identityType) {
    const stickyPatterns = ['always', 'never', 'the person who', 'the one who', 'that guy', 'that person'];
    for (const pattern of stickyPatterns) {
      if (allText.includes(pattern)) {
        identityType = 'sticky_label';
        identityExplored = pattern;
        break;
      }
    }
  }
  
  // Extract common themes
  const themes: string[] = [];
  const themeKeywords = [
    'control', 'fear', 'anxiety', 'pressure', 'expectations', 'perfectionism',
    'not enough', 'failure', 'success', 'approval', 'rejection', 'belonging',
    'responsibility', 'guilt', 'shame', 'anger', 'frustration', 'overwhelm'
  ];
  
  for (const theme of themeKeywords) {
    if (allText.includes(theme)) {
      themes.push(theme);
    }
  }
  
  // Try to extract integration anchor from assistant messages
  let integrationAnchor: string | null = null;
  const assistantMessages = conversationHistory
    .filter(m => m.role === 'assistant')
    .map(m => m.content);
  
  // Look for mentions of specific times/situations
  const lastMessages = assistantMessages.slice(-3).join(' ').toLowerCase();
  const anchorPatterns = [
    /when might you notice.+\?/i,
    /name one moment.+/i,
    /what situation.+/i
  ];
  
  // The user's response after an anchor question would be the anchor
  // This is simplified - real implementation would track this during conversation
  
  return {
    identityExplored,
    identityType,
    themes: themes.slice(0, 5), // Limit to 5 themes
    integrationAnchor
  };
}

/**
 * Check for recurring patterns from past sessions
 */
export function checkRecurringPatterns(
  pastSessions: Array<{ themes: string[]; identity_explored: string | null }>,
  currentThemes: string[]
): string | null {
  if (pastSessions.length < 2) return null;
  
  // Count theme occurrences
  const themeCounts: Record<string, number> = {};
  
  for (const session of pastSessions) {
    for (const theme of session.themes || []) {
      themeCounts[theme] = (themeCounts[theme] || 0) + 1;
    }
  }
  
  // Check if any current theme has appeared 3+ times before
  for (const theme of currentThemes) {
    if (themeCounts[theme] && themeCounts[theme] >= 2) {
      return theme;
    }
  }
  
  // Check for recurring identity
  const identityCounts: Record<string, number> = {};
  for (const session of pastSessions) {
    if (session.identity_explored) {
      identityCounts[session.identity_explored] = (identityCounts[session.identity_explored] || 0) + 1;
    }
  }
  
  for (const [identity, count] of Object.entries(identityCounts)) {
    if (count >= 2) {
      return `the '${identity}' identity`;
    }
  }
  
  return null;
}
