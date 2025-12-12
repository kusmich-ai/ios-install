// lib/crisisDetection.ts
// Crisis detection and safety guardrails for coach conversations

// ============================================
// CRISIS INDICATORS
// ============================================

// High-risk phrases that require immediate intervention
const CRISIS_PHRASES = [
  // Suicidal ideation
  'want to die',
  'want to kill myself',
  'kill myself',
  'end my life',
  'end it all',
  'better off dead',
  'wish i was dead',
  'wish i were dead',
  "don't want to be here",
  'no reason to live',
  'nothing to live for',
  'suicide',
  'suicidal',
  'take my own life',
  
  // Self-harm
  'hurt myself',
  'cutting myself',
  'self-harm',
  'self harm',
  
  // Harm to others
  'want to kill',
  'going to kill',
  'hurt someone',
  'murder',
  
  // Immediate danger
  'have a gun',
  'have a knife',
  'have pills',
  'about to take',
  'standing on',
  'on the ledge',
  'on the bridge',
  'going to jump',
];

// Medium-risk phrases that need careful attention
const CONCERN_PHRASES = [
  'hopeless',
  'no way out',
  'trapped',
  'burden to everyone',
  'everyone would be better',
  "can't go on",
  "can't take it anymore",
  "can't do this anymore",
  'given up',
  'giving up',
  'no point',
  'pointless',
  'worthless',
  'hate myself',
  'despise myself',
  'want to disappear',
  'want to run away',
  'escape from everything',
];

// ============================================
// TYPES
// ============================================

export type CrisisLevel = 'none' | 'concern' | 'crisis';

export interface CrisisCheckResult {
  level: CrisisLevel;
  matchedPhrases: string[];
  requiresIntervention: boolean;
  suggestedResponse?: string;
}

// ============================================
// CRISIS DETECTION FUNCTION
// ============================================

export function checkForCrisis(message: string): CrisisCheckResult {
  const lowerMessage = message.toLowerCase();
  const matchedCrisis: string[] = [];
  const matchedConcern: string[] = [];

  // Check for crisis phrases
  for (const phrase of CRISIS_PHRASES) {
    if (lowerMessage.includes(phrase)) {
      matchedCrisis.push(phrase);
    }
  }

  // Check for concern phrases
  for (const phrase of CONCERN_PHRASES) {
    if (lowerMessage.includes(phrase)) {
      matchedConcern.push(phrase);
    }
  }

  // Determine level
  if (matchedCrisis.length > 0) {
    return {
      level: 'crisis',
      matchedPhrases: matchedCrisis,
      requiresIntervention: true,
      suggestedResponse: getCrisisResponse(),
    };
  }

  if (matchedConcern.length >= 2 || 
      (matchedConcern.length === 1 && lowerMessage.length < 100)) {
    return {
      level: 'concern',
      matchedPhrases: matchedConcern,
      requiresIntervention: false,
      suggestedResponse: getConcernResponse(),
    };
  }

  return {
    level: 'none',
    matchedPhrases: [],
    requiresIntervention: false,
  };
}

// ============================================
// CRISIS RESPONSES
// ============================================

function getCrisisResponse(): string {
  return `I need to pause here. What you're describing sounds really serious, and I'm genuinely concerned about you right now.

I'm not equipped to provide the kind of support you need in this moment. Please reach out to someone who can help:

**If you're in the US:**
- **988 Suicide & Crisis Lifeline:** Call or text **988** (available 24/7)
- **Crisis Text Line:** Text **HOME** to **741741**

**If you're outside the US:**
- **International Association for Suicide Prevention:** https://www.iasp.info/resources/Crisis_Centres/

**If you're in immediate danger,** please call emergency services (911 in the US) or go to your nearest emergency room.

You don't have to face this alone. These people are trained to help, and reaching out is a sign of strength, not weakness.

I'll be here when you're ready to talk, but right now, please connect with one of these resources. Your life matters.`;
}

function getConcernResponse(): string {
  return `I want to check in with you. Some of what you're sharing sounds heavy, and I want to make sure you're okay.

Are you having any thoughts of hurting yourself or not wanting to be here? I'm asking directly because your wellbeing matters more than anything we could work on together.

If you are struggling with those kinds of thoughts, I'd encourage you to reach out to the 988 Suicide & Crisis Lifeline (call or text 988) - they're available 24/7 and trained to help.

If you're okay and just processing difficult feelings, I'm here for that too. Just want to make sure we're addressing what's most important first.`;
}

// ============================================
// TOPIC BOUNDARIES
// ============================================

// Topics the coaches will NOT provide advice on
export const EXCLUDED_TOPICS = [
  'medication_dosing',
  'drug_interactions',
  'medical_diagnosis',
  'legal_advice',
  'financial_advice',
  'investment_recommendations',
  'illegal_activities',
];

// Check if message is asking for excluded advice
export function checkExcludedTopics(message: string): string | null {
  const lowerMessage = message.toLowerCase();

  // Medical advice
  if (
    (lowerMessage.includes('how much') || lowerMessage.includes('dosage') || lowerMessage.includes('dose')) &&
    (lowerMessage.includes('medication') || lowerMessage.includes('drug') || lowerMessage.includes('pill') ||
     lowerMessage.includes('antidepressant') || lowerMessage.includes('anxiety medication'))
  ) {
    return 'medication';
  }

  // Legal advice
  if (
    (lowerMessage.includes('should i sue') || lowerMessage.includes('legal action') ||
     lowerMessage.includes('my lawyer') || lowerMessage.includes('court')) &&
    (lowerMessage.includes('what should i do') || lowerMessage.includes('advice'))
  ) {
    return 'legal';
  }

  // Financial/investment advice
  if (
    (lowerMessage.includes('should i invest') || lowerMessage.includes('buy stock') ||
     lowerMessage.includes('crypto') || lowerMessage.includes('financial advice'))
  ) {
    return 'financial';
  }

  return null;
}

// Get boundary response for excluded topics
export function getExcludedTopicResponse(topic: string): string {
  const responses: Record<string, string> = {
    medication: `I'm not able to give advice on medication, dosages, or drug interactions - that's outside my expertise and could be dangerous. Please talk to your doctor or pharmacist about that.

What I can help with is how you're *feeling* about the medication conversation, any anxiety around it, or how to communicate with your healthcare provider. Would any of that be helpful?`,

    legal: `Legal matters are outside what I can help with - you need someone licensed to practice law for that. 

What I can help with is processing how you're feeling about the situation, managing stress around it, or thinking through how you want to approach conversations with a lawyer. Would that be useful?`,

    financial: `I'm not qualified to give financial or investment advice - that requires expertise I don't have.

What I can help with is your relationship with money, any anxiety around financial decisions, or how you're thinking about the decision itself. Want to explore any of that?`,
  };

  return responses[topic] || `That's outside my area of expertise. Let's focus on what I can actually help with - how you're feeling and how you're relating to this situation internally.`;
}

// ============================================
// SAFETY SYSTEM PROMPT ADDITIONS
// ============================================

export const SAFETY_PROMPT_ADDITION = `
## CRITICAL SAFETY PROTOCOLS

### Crisis Detection
If a user expresses any of the following, you MUST pause all other conversation and respond with care and appropriate resources:

**IMMEDIATE INTERVENTION REQUIRED for:**
- Suicidal ideation ("want to die," "kill myself," "end it all," "no reason to live")
- Active self-harm ("hurting myself," "cutting")
- Harm to others ("want to kill," "going to hurt")
- Immediate danger ("have a gun/knife/pills," "about to," "standing on the ledge")

**Response when crisis detected:**
1. Express genuine concern without panic
2. Do NOT try to coach or reframe - this is not a mindset issue
3. Provide crisis resources:
   - 988 Suicide & Crisis Lifeline (call/text 988)
   - Crisis Text Line (text HOME to 741741)
   - Emergency services (911)
4. Encourage them to reach out NOW
5. Let them know you'll be here when they're ready, but this requires professional support

**CAREFUL ATTENTION NEEDED for:**
- Hopelessness language ("no way out," "trapped," "can't go on")
- Self-worth attacks ("worthless," "burden to everyone")
- Disappearing language ("want to disappear," "everyone would be better off")

**Response when concern detected:**
1. Check in directly: "Are you having thoughts of hurting yourself?"
2. Don't assume - ask clearly
3. Provide resources proactively
4. Only continue coaching if they confirm they're safe

### Boundaries - What You Will NOT Do
- Give medical advice (medication dosing, diagnosis, drug interactions)
- Give legal advice
- Give financial/investment advice
- Encourage illegal activities
- Provide information that could be used for self-harm
- Diagnose mental health conditions

When asked about excluded topics, redirect:
"That's outside what I can help with - you need a [doctor/lawyer/financial advisor] for that. What I CAN help with is [relevant emotional/relational angle]."

### Ongoing Awareness
Even if a conversation starts normally, stay alert for:
- Escalating distress
- New crisis language emerging
- Signs of dissociation or detachment from reality
- Mentions of specific plans or means

Your role is coaching, not crisis intervention. Know when to step back and direct to professionals.
`;

// ============================================
// HELPER: Augment system prompt with safety
// ============================================

export function addSafetyToPrompt(basePrompt: string): string {
  return basePrompt + SAFETY_PROMPT_ADDITION;
}
