// lib/crisisDetection.ts
// Comprehensive crisis detection and safety guardrails for coach conversations

// ============================================
// CRISIS INDICATORS (HIGHEST PRIORITY)
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
  "don't want to be here anymore",
  'no reason to live',
  'nothing to live for',
  'suicide',
  'suicidal',
  'take my own life',
  'not worth living',
  'can\'t do this anymore',
  'want it to be over',
  'want to go to sleep and never wake up',
  
  // Self-harm
  'hurt myself',
  'hurting myself',
  'cutting myself',
  'self-harm',
  'self harm',
  'burn myself',
  'punish myself physically',
  
  // Harm to others
  'want to kill',
  'going to kill',
  'hurt someone',
  'going to hurt',
  
  // Immediate danger
  'have a gun',
  'have a knife',
  'have pills',
  'about to take',
  'standing on',
  'on the ledge',
  'on the bridge',
  'going to jump',
  'wrote a note',
  'goodbye letter',
  'given away my things',
];

// Medium-risk phrases that need careful attention
const CONCERN_PHRASES = [
  'hopeless',
  'no hope',
  'no way out',
  'trapped',
  'burden to everyone',
  'everyone would be better',
  "can't go on",
  "can't take it anymore",
  "can't do this",
  'given up',
  'giving up',
  'no point',
  'pointless',
  'worthless',
  'hate myself',
  'despise myself',
  'want to disappear',
  'want to run away from everything',
  'escape from everything',
  'don\'t see a future',
  'no future',
  'what\'s the point',
  'nobody cares',
  'no one would notice',
  'invisible',
  'empty inside',
  'numb',
  'dead inside',
];

// ============================================
// EATING DISORDER INDICATORS
// ============================================

const EATING_DISORDER_PHRASES = [
  // Restriction
  'how many calories should i eat',
  'lowest calories',
  'not eating',
  'stopped eating',
  'afraid to eat',
  'scared of food',
  'fasting for days',
  'water fast',
  'haven\'t eaten in',
  'skip meals',
  'skipping meals',
  
  // Purging
  'purging',
  'make myself throw up',
  'throwing up after',
  'laxatives to lose',
  'how to purge',
  
  // Extreme restriction
  'want to be thinner',
  'still too fat',
  'need to lose more',
  'can\'t stop losing',
  'ana',
  'mia',
  'thinspo',
  'pro ana',
  
  // Body dysmorphia signals
  'disgusted by my body',
  'hate my body',
  'can\'t look in the mirror',
  'fat even though',
];

// ============================================
// SUBSTANCE ABUSE INDICATORS
// ============================================

const SUBSTANCE_ABUSE_PHRASES = [
  // Active use concerns
  'can\'t stop drinking',
  'can\'t stop using',
  'using again',
  'relapsed',
  'relapsing',
  'drinking every day',
  'need it to function',
  'withdrawal',
  'withdrawing',
  'detox',
  'blackout',
  'blacking out',
  
  // Seeking help signals
  'how to quit',
  'how to stop drinking',
  'how to stop using',
  'am i an alcoholic',
  'am i addicted',
  'addiction',
  'sober',
  'sobriety',
  'AA',
  'NA',
  'rehab',
  'treatment center',
  
  // Dangerous combinations
  'mixing pills',
  'mixing drugs',
  'pills and alcohol',
  'overdose',
  'OD',
];

// ============================================
// ABUSE SITUATION INDICATORS
// ============================================

const ABUSE_SITUATION_PHRASES = [
  // Physical abuse
  'partner hit me',
  'partner hits me',
  'he hit me',
  'she hit me',
  'beats me',
  'beating me',
  'physically hurts me',
  'chokes me',
  'choked me',
  'strangled',
  'afraid of my partner',
  'scared of my husband',
  'scared of my wife',
  'scared of my boyfriend',
  'scared of my girlfriend',
  
  // Coercive control
  'controls my money',
  'won\'t let me leave',
  'won\'t let me see',
  'isolates me',
  'threatens me',
  'threatens to hurt',
  'threatens the kids',
  'says he\'ll kill',
  'says she\'ll kill',
  
  // Emotional/psychological
  'calls me worthless',
  'tells me i\'m nothing',
  'humiliates me',
  'degrades me',
  'gaslighting',
  'makes me think i\'m crazy',
  
  // Sexual abuse
  'forces me to',
  'forced sex',
  'didn\'t consent',
  'without my consent',
  'raped',
  'rape',
  'molested',
  'sexually abused',
];

// ============================================
// PSYCHOTIC SYMPTOM INDICATORS
// ============================================

const PSYCHOTIC_SYMPTOM_PHRASES = [
  // Paranoid delusions
  'government is watching',
  'being followed',
  'they\'re tracking me',
  'cameras everywhere',
  'listening to my thoughts',
  'reading my mind',
  'people are after me',
  'trying to poison',
  'everyone is against me',
  'conspiracy against me',
  
  // Grandiose delusions
  'i am god',
  'i am jesus',
  'i am chosen',
  'special mission',
  'special powers',
  'can read minds',
  'can control',
  'receiving messages',
  'messages from',
  'told by voices',
  
  // Hallucinations
  'hearing voices',
  'voices tell me',
  'voices telling me',
  'seeing things that aren\'t there',
  'seeing people who aren\'t there',
  'shadows following',
  'entities',
  'demons talking',
  
  // Disorganized thinking signals
  'they implanted',
  'chip in my brain',
  'signals being sent',
];

// ============================================
// TRAUMA CONTENT INDICATORS
// ============================================

const DEEP_TRAUMA_PHRASES = [
  // Explicit trauma
  'my assault',
  'when i was assaulted',
  'when i was raped',
  'my abuse',
  'when i was abused',
  'childhood abuse',
  'molested as a child',
  'sexually abused as',
  'my trauma',
  'traumatic memory',
  'flashback',
  'flashbacks',
  'ptsd',
  'triggered',
  'night terrors',
  'nightmares about',
  'can\'t stop thinking about what happened',
  'the incident',
  'what he did to me',
  'what she did to me',
  'what they did to me',
];

// ============================================
// CHILD SAFETY INDICATORS (CRITICAL)
// ============================================

const CHILD_SAFETY_PHRASES = [
  // Harm to child
  'want to hurt my child',
  'hurt my child',
  'hurt my kid',
  'shake the baby',
  'hit my child',
  'hit my kid',
  'can\'t stop yelling at my kid',
  'going to snap',
  'lose control with my kids',
  'scared i\'ll hurt',
  
  // Child being harmed
  'my child is being abused',
  'someone is hurting my child',
  'touching my child',
  'molesting my child',
  'inappropriate with my child',
  'child abuse',
  'hurting my kids',
  
  // Concerning content about minors
  'attracted to children',
  'attracted to kids',
  'minor',
  'underage',
];

// ============================================
// INAPPROPRIATE CONTENT INDICATORS
// ============================================

const SEXUAL_CONTENT_PHRASES = [
  'sexual fantasy',
  'sex with you',
  'dirty talk',
  'roleplay sexual',
  'explicit',
  'turn me on',
  'aroused',
  'masturbat',
  'orgasm',
  'porn',
  'fetish',
  'kink advice',
  'bdsm',
];

const ILLEGAL_ACTIVITY_PHRASES = [
  'how to get drugs',
  'where to buy drugs',
  'how to make drugs',
  'how to steal',
  'how to hack',
  'fake id',
  'forge documents',
  'evade police',
  'hide from police',
  'launder money',
  'tax evasion',
  'how to hurt someone',
  'how to kill someone',
  'get away with',
];

// ============================================
// DIAGNOSIS-SEEKING INDICATORS
// ============================================

const DIAGNOSIS_SEEKING_PHRASES = [
  'do i have adhd',
  'do i have add',
  'do i have bipolar',
  'do i have depression',
  'do i have anxiety disorder',
  'do i have ocd',
  'do i have ptsd',
  'do i have bpd',
  'do i have borderline',
  'do i have autism',
  'am i autistic',
  'am i bipolar',
  'am i depressed',
  'am i mentally ill',
  'diagnose me',
  'what disorder do i have',
  'what\'s wrong with me mentally',
  'am i crazy',
  'am i insane',
  'what mental illness',
];

// ============================================
// TYPES
// ============================================

export type CrisisLevel = 'none' | 'concern' | 'crisis';

export type BoundaryCategory = 
  | 'crisis'
  | 'concern'
  | 'eating_disorder'
  | 'substance_abuse'
  | 'abuse_situation'
  | 'psychotic_symptoms'
  | 'deep_trauma'
  | 'child_safety'
  | 'sexual_content'
  | 'illegal_activity'
  | 'diagnosis_seeking'
  | 'medication'
  | 'legal'
  | 'financial'
  | 'none';

export interface SafetyCheckResult {
  level: CrisisLevel;
  category: BoundaryCategory;
  matchedPhrases: string[];
  requiresIntervention: boolean;
  blockResponse: boolean;
  suggestedResponse?: string;
}

// ============================================
// MAIN SAFETY CHECK FUNCTION
// ============================================

export function checkForSafetyIssues(message: string): SafetyCheckResult {
  const lowerMessage = message.toLowerCase();

  // PRIORITY 1: Crisis/Suicidal (highest priority)
  const crisisMatches = findMatches(lowerMessage, CRISIS_PHRASES);
  if (crisisMatches.length > 0) {
    return {
      level: 'crisis',
      category: 'crisis',
      matchedPhrases: crisisMatches,
      requiresIntervention: true,
      blockResponse: true,
      suggestedResponse: getCrisisResponse(),
    };
  }

  // PRIORITY 2: Child Safety (critical)
  const childSafetyMatches = findMatches(lowerMessage, CHILD_SAFETY_PHRASES);
  if (childSafetyMatches.length > 0) {
    return {
      level: 'crisis',
      category: 'child_safety',
      matchedPhrases: childSafetyMatches,
      requiresIntervention: true,
      blockResponse: true,
      suggestedResponse: getChildSafetyResponse(childSafetyMatches),
    };
  }

  // PRIORITY 3: Psychotic Symptoms (needs careful handling)
  const psychoticMatches = findMatches(lowerMessage, PSYCHOTIC_SYMPTOM_PHRASES);
  if (psychoticMatches.length > 0) {
    return {
      level: 'crisis',
      category: 'psychotic_symptoms',
      matchedPhrases: psychoticMatches,
      requiresIntervention: true,
      blockResponse: true,
      suggestedResponse: getPsychoticSymptomsResponse(),
    };
  }

  // PRIORITY 4: Abuse Situations
  const abuseMatches = findMatches(lowerMessage, ABUSE_SITUATION_PHRASES);
  if (abuseMatches.length > 0) {
    return {
      level: 'crisis',
      category: 'abuse_situation',
      matchedPhrases: abuseMatches,
      requiresIntervention: true,
      blockResponse: true,
      suggestedResponse: getAbuseSituationResponse(),
    };
  }

  // PRIORITY 5: Sexual Content (block entirely)
  const sexualMatches = findMatches(lowerMessage, SEXUAL_CONTENT_PHRASES);
  if (sexualMatches.length > 0) {
    return {
      level: 'none',
      category: 'sexual_content',
      matchedPhrases: sexualMatches,
      requiresIntervention: false,
      blockResponse: true,
      suggestedResponse: getSexualContentResponse(),
    };
  }

  // PRIORITY 6: Illegal Activity (block entirely)
  const illegalMatches = findMatches(lowerMessage, ILLEGAL_ACTIVITY_PHRASES);
  if (illegalMatches.length > 0) {
    return {
      level: 'none',
      category: 'illegal_activity',
      matchedPhrases: illegalMatches,
      requiresIntervention: false,
      blockResponse: true,
      suggestedResponse: getIllegalActivityResponse(),
    };
  }

  // PRIORITY 7: Eating Disorders (redirect to specialist)
  const eatingDisorderMatches = findMatches(lowerMessage, EATING_DISORDER_PHRASES);
  if (eatingDisorderMatches.length > 0) {
    return {
      level: 'concern',
      category: 'eating_disorder',
      matchedPhrases: eatingDisorderMatches,
      requiresIntervention: true,
      blockResponse: true,
      suggestedResponse: getEatingDisorderResponse(),
    };
  }

  // PRIORITY 8: Substance Abuse (redirect to specialist)
  const substanceMatches = findMatches(lowerMessage, SUBSTANCE_ABUSE_PHRASES);
  if (substanceMatches.length > 0) {
    return {
      level: 'concern',
      category: 'substance_abuse',
      matchedPhrases: substanceMatches,
      requiresIntervention: true,
      blockResponse: true,
      suggestedResponse: getSubstanceAbuseResponse(),
    };
  }

  // PRIORITY 9: Deep Trauma (redirect to therapist)
  const traumaMatches = findMatches(lowerMessage, DEEP_TRAUMA_PHRASES);
  if (traumaMatches.length > 0) {
    return {
      level: 'concern',
      category: 'deep_trauma',
      matchedPhrases: traumaMatches,
      requiresIntervention: true,
      blockResponse: true,
      suggestedResponse: getDeepTraumaResponse(),
    };
  }

  // PRIORITY 10: Diagnosis Seeking (redirect)
  const diagnosisMatches = findMatches(lowerMessage, DIAGNOSIS_SEEKING_PHRASES);
  if (diagnosisMatches.length > 0) {
    return {
      level: 'none',
      category: 'diagnosis_seeking',
      matchedPhrases: diagnosisMatches,
      requiresIntervention: false,
      blockResponse: true,
      suggestedResponse: getDiagnosisSeekingResponse(),
    };
  }

  // PRIORITY 11: Concern-level distress (don't block, but flag)
  const concernMatches = findMatches(lowerMessage, CONCERN_PHRASES);
  if (concernMatches.length >= 2 || (concernMatches.length === 1 && lowerMessage.length < 150)) {
    return {
      level: 'concern',
      category: 'concern',
      matchedPhrases: concernMatches,
      requiresIntervention: false,
      blockResponse: false,
      suggestedResponse: getConcernResponse(),
    };
  }

  // PRIORITY 12: Professional advice topics
  const excludedTopic = checkExcludedTopics(message);
  if (excludedTopic) {
    return {
      level: 'none',
      category: excludedTopic as BoundaryCategory,
      matchedPhrases: [],
      requiresIntervention: false,
      blockResponse: true,
      suggestedResponse: getExcludedTopicResponse(excludedTopic),
    };
  }

  // No safety issues detected
  return {
    level: 'none',
    category: 'none',
    matchedPhrases: [],
    requiresIntervention: false,
    blockResponse: false,
  };
}

// Legacy function for backward compatibility
export function checkForCrisis(message: string): SafetyCheckResult {
  return checkForSafetyIssues(message);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function findMatches(message: string, phrases: string[]): string[] {
  const matches: string[] = [];
  for (const phrase of phrases) {
    if (message.includes(phrase)) {
      matches.push(phrase);
    }
  }
  return matches;
}

// ============================================
// EXCLUDED TOPICS CHECK
// ============================================

export function checkExcludedTopics(message: string): string | null {
  const lowerMessage = message.toLowerCase();

  // Medical advice
  if (
    (lowerMessage.includes('how much') || lowerMessage.includes('dosage') || 
     lowerMessage.includes('dose') || lowerMessage.includes('should i take')) &&
    (lowerMessage.includes('medication') || lowerMessage.includes('drug') || 
     lowerMessage.includes('pill') || lowerMessage.includes('antidepressant') || 
     lowerMessage.includes('anxiety medication') || lowerMessage.includes('mg') ||
     lowerMessage.includes('prescription'))
  ) {
    return 'medication';
  }

  // Medical symptoms/treatment
  if (
    (lowerMessage.includes('is this normal') || lowerMessage.includes('should i see a doctor') ||
     lowerMessage.includes('what medicine') || lowerMessage.includes('treatment for')) &&
    (lowerMessage.includes('symptom') || lowerMessage.includes('pain') || 
     lowerMessage.includes('condition') || lowerMessage.includes('disease'))
  ) {
    return 'medication';
  }

  // Legal advice
  if (
    (lowerMessage.includes('should i sue') || lowerMessage.includes('legal action') ||
     lowerMessage.includes('take to court') || lowerMessage.includes('press charges') ||
     lowerMessage.includes('legal rights') || lowerMessage.includes('lawyer')) &&
    (lowerMessage.includes('what should i do') || lowerMessage.includes('advice') ||
     lowerMessage.includes('can i') || lowerMessage.includes('should i'))
  ) {
    return 'legal';
  }

  // Financial/investment advice
  if (
    (lowerMessage.includes('should i invest') || lowerMessage.includes('buy stock') ||
     lowerMessage.includes('sell stock') || lowerMessage.includes('crypto') || 
     lowerMessage.includes('bitcoin') || lowerMessage.includes('financial advice') ||
     lowerMessage.includes('retirement') || lowerMessage.includes('portfolio'))
  ) {
    return 'financial';
  }

  return null;
}

// ============================================
// RESPONSE GENERATORS
// ============================================

function getCrisisResponse(): string {
  return `I need to pause here. What you're sharing sounds really serious, and I'm genuinely concerned about your safety right now.

I'm not equipped to provide the kind of support you need in this moment. Please reach out to someone who can help:

**If you're in the US:**
• **988 Suicide & Crisis Lifeline:** Call or text **988** (available 24/7)
• **Crisis Text Line:** Text **HOME** to **741741**

**If you're outside the US:**
• **International Association for Suicide Prevention:** findahelpline.com

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

function getChildSafetyResponse(matches: string[]): string {
  // Check if it's about harming a child vs. a child being harmed
  const harmingChild = matches.some(m => 
    m.includes('want to hurt') || m.includes('hit my') || m.includes('shake') || 
    m.includes('snap') || m.includes('lose control')
  );
  
  const childBeingHarmed = matches.some(m => 
    m.includes('being abused') || m.includes('someone is hurting') || 
    m.includes('touching my child') || m.includes('molesting')
  );

  if (childBeingHarmed) {
    return `What you're describing is serious and your child needs protection right now.

**If your child is in immediate danger, call 911.**

**To report child abuse:**
• **Childhelp National Child Abuse Hotline:** 1-800-422-4453 (24/7)
• Contact your local Child Protective Services

You're doing the right thing by recognizing this. Your child needs an adult to advocate for them, and that's you. Please reach out to one of these resources - they can guide you on next steps to keep your child safe.

I'm not equipped to handle this situation, but these professionals are.`;
  }

  if (harmingChild) {
    return `I hear that you're struggling, and I want you to know that reaching out takes courage. The fact that you're aware of these feelings means there's a part of you that wants to protect your child.

**Right now, please:**
• **Step away from your child** if you feel you might lose control
• **Call the Childhelp National Hotline:** 1-800-422-4453 - they help parents too
• **Call a trusted friend or family member** who can come be with you

Parenting is incredibly hard, and feeling overwhelmed doesn't make you a bad person. But you need support from people trained to help with this - I'm not equipped for this situation.

Your awareness is the first step. Please reach out for help right now.`;
  }

  // Generic child safety concern
  return `This is outside what I can help with. Child safety situations require professionals with proper training and resources.

**For immediate concerns:** Call 911
**Childhelp National Hotline:** 1-800-422-4453 (24/7)

Please reach out to the appropriate resources.`;
}

function getPsychoticSymptomsResponse(): string {
  return `I want to be honest with you - some of what you're describing sounds like it would really benefit from talking to a mental health professional who can meet with you in person.

I'm not able to properly help with experiences like hearing voices, feeling monitored, or receiving special messages. Not because these experiences aren't real to you, but because this is specialized territory that requires in-person care.

**Please consider reaching out to:**
• Your doctor or a psychiatrist
• **NAMI Helpline:** 1-800-950-6264
• **988 Suicide & Crisis Lifeline:** Call or text 988 (they help with all mental health crises, not just suicide)

If you're not currently connected with a mental health provider, these resources can help you find one.

I care about your wellbeing, which is exactly why I'm encouraging you to connect with someone who can properly support you.`;
}

function getAbuseSituationResponse(): string {
  return `I'm really glad you told me this, and I want to be clear: what you're describing is not okay, and it's not your fault.

I'm not equipped to advise you on what to do in this situation - that requires specialized support from people trained in domestic violence. What I can tell you is that you deserve to be safe.

**Please reach out to:**
• **National Domestic Violence Hotline:** 1-800-799-7233 (24/7) or text START to 88788
• **RAINN (for sexual assault):** 1-800-656-4673

These are confidential, and they can help you think through your options and make a safety plan - whether you're ready to leave or not. They won't pressure you.

**If you're in immediate danger, please call 911.**

You don't have to figure this out alone. Would you be willing to reach out to one of these resources?`;
}

function getEatingDisorderResponse(): string {
  return `I want to be careful here. What you're describing sounds like it could be related to disordered eating, and this is territory that really needs specialized support - not because I don't care, but because I'm not equipped to help safely.

Eating disorders are serious and complex, and the right support can make a huge difference.

**Please consider reaching out to:**
• **National Eating Disorders Association Helpline:** 1-800-931-2237
• **NEDA Chat:** nationaleatingdisorders.org/help-support/contact-helpline (click "chat")
• A therapist who specializes in eating disorders

What I *can* help with is the emotional stuff underneath - stress, perfectionism, control, self-worth. But the eating behaviors themselves need specialized care.

Would you be open to reaching out to one of these resources?`;
}

function getSubstanceAbuseResponse(): string {
  return `I appreciate you being honest about this. Substance use is something that really benefits from specialized support - not because I'm judging you, but because I'm not equipped to help safely with addiction and recovery.

**Resources that can help:**
• **SAMHSA National Helpline:** 1-800-662-4357 (free, confidential, 24/7)
• **AA:** aa.org (Alcoholics Anonymous)
• **NA:** na.org (Narcotics Anonymous)
• **Smart Recovery:** smartrecovery.org (alternative to 12-step)

These resources are confidential and judgment-free. They've helped millions of people.

What I *can* help with is the underlying emotional landscape - what's driving the use, stress management, building a life you don't need to escape from. But the substance use itself needs specialized support.

Would you be willing to reach out to one of these resources?`;
}

function getDeepTraumaResponse(): string {
  return `Thank you for trusting me with something this significant. What you've experienced matters, and it makes sense that it's still affecting you.

I want to be honest: deep trauma processing really needs to happen with a trained therapist, ideally one who specializes in trauma (like EMDR or somatic experiencing). Not because I don't want to help, but because trauma work done wrong can actually make things worse, and I'm not equipped to hold this safely.

**Resources to find trauma-specialized support:**
• **Psychology Today Therapist Finder:** psychologytoday.com/us/therapists (filter by "trauma")
• **RAINN:** 1-800-656-4673 (if related to sexual assault)
• **SAMHSA Treatment Locator:** findtreatment.samhsa.gov

What I *can* help with is the day-to-day - managing triggers, building regulation, navigating relationships while you're healing. But the deep processing work needs a trained professional.

Do you currently have a therapist, or would it help to talk about finding one?`;
}

function getDiagnosisSeekingResponse(): string {
  return `I'm not able to diagnose mental health conditions - that requires a proper evaluation by a psychiatrist or psychologist who can assess you in person.

What I can tell you is that seeking to understand yourself is healthy. If you're noticing patterns that concern you, that's worth exploring with a professional.

**To get a proper assessment:**
• Talk to your primary care doctor for a referral
• **Psychology Today:** psychologytoday.com/us/therapists (find a therapist or psychiatrist)
• **NAMI Helpline:** 1-800-950-6264 (can help you navigate finding care)

What I *can* help with is how you're relating to these patterns - the frustration, the impact on your life, building systems that work for your brain. But the diagnostic question needs a professional.

What feels most useful right now?`;
}

function getSexualContentResponse(): string {
  return `That's not something I can engage with. I'm here for coaching support - mindset, emotions, performance, relationships - but not sexual content.

Is there something else I can help you with?`;
}

function getIllegalActivityResponse(): string {
  return `I can't help with that.

If there's something else going on - stress, feeling trapped, financial pressure - I'm happy to explore that. But I won't provide information about illegal activities.

What's actually going on for you?`;
}

export function getExcludedTopicResponse(topic: string): string {
  const responses: Record<string, string> = {
    medication: `I'm not able to give advice on medication, dosages, or medical treatment - that's outside my expertise and could be dangerous. Please talk to your doctor or pharmacist about that.

What I *can* help with is how you're feeling about the medication conversation, any anxiety around it, or how to communicate with your healthcare provider. Would any of that be helpful?`,

    legal: `Legal matters are outside what I can help with - you need someone licensed to practice law for that. 

What I *can* help with is processing how you're feeling about the situation, managing stress around it, or thinking through how you want to approach conversations with a lawyer. Would that be useful?`,

    financial: `I'm not qualified to give financial or investment advice - that requires expertise I don't have.

What I *can* help with is your relationship with money, any anxiety around financial decisions, or how you're thinking about the decision itself. Want to explore any of that?`,
  };

  return responses[topic] || `That's outside my area of expertise. Let's focus on what I can actually help with - how you're feeling and how you're relating to this situation internally.`;
}

// ============================================
// SAFETY SYSTEM PROMPT ADDITION
// ============================================

export const SAFETY_PROMPT_ADDITION = `
## CRITICAL SAFETY PROTOCOLS

### Priority 1: Crisis Detection (HIGHEST PRIORITY)
If a user expresses ANY of the following, you MUST pause all coaching and respond with care and resources:

**IMMEDIATE INTERVENTION - provide resources and stop coaching:**
- Suicidal ideation ("want to die," "kill myself," "end it all," "no reason to live")
- Active self-harm ("hurting myself," "cutting myself")
- Harm to others ("want to kill," "going to hurt")
- Immediate danger ("have a gun/knife/pills," "about to," "on the ledge")

### Priority 2: Child Safety (CRITICAL)
Any mention of harming a child or a child being harmed - stop immediately and provide appropriate resources (Childhelp: 1-800-422-4453, CPS, 911).

### Priority 3: Psychotic Symptoms
If user describes hearing voices, paranoid beliefs about being watched/tracked, grandiose delusions, or receiving special messages - do NOT engage with the content. Gently redirect to professional help.

### Priority 4: Abuse Situations
Do NOT advise whether to stay or leave an abusive relationship. Provide resources (National DV Hotline: 1-800-799-7233) and express concern for their safety.

### Priority 5: Block Entirely
- Sexual content - decline and redirect
- Illegal activities - decline firmly
- Requests for diagnosis - explain you can't diagnose, redirect to professionals

### Priority 6: Redirect to Specialists
These require specialized care beyond coaching:
- Eating disorders → NEDA: 1-800-931-2237
- Substance abuse/addiction → SAMHSA: 1-800-662-4357
- Deep trauma processing → Trauma-specialized therapist

### Boundaries - What You Will NOT Do
- Medical advice (medication, dosing, diagnosis, treatment)
- Legal advice
- Financial/investment advice
- Diagnose mental health conditions
- Process deep trauma (redirect to therapist)
- Engage with delusions or psychotic content

### Ongoing Vigilance
Watch for escalating distress, new crisis language, or signs of dissociation. Your role is coaching, not crisis intervention.
`;

export function addSafetyToPrompt(basePrompt: string): string {
  return basePrompt + SAFETY_PROMPT_ADDITION;
}
