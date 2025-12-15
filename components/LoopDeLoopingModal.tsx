// components/LoopDeLoopingModal.tsx
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';

// ============================================
// TYPES
// ============================================

type LoopMechanism = 'prediction' | 'evaluation' | 'protection' | null;

type SessionPhase = 
  | 'mechanism_identification'
  | 'physiological_interrupt'
  | 'de_identification'
  | 'precision_inquiry'
  // Prediction dissolution steps
  | 'prediction_step_1'  // "The system is trying to control the uncontrollable"
  | 'prediction_step_2'  // "Outcome is undefined..."
  | 'prediction_step_3'  // "There is no future event here..."
  // Evaluation dissolution steps
  | 'evaluation_step_1'  // Source verification (a or b)
  | 'evaluation_step_2'  // "The meaning is manufactured..."
  | 'evaluation_step_3'  // Alternative meaning
  | 'evaluation_step_4'  // "There is no objective meaning here..."
  // Protection dissolution steps
  | 'protection_step_1'  // Present-moment verification (yes/no)
  | 'protection_step_2'  // "No verified threat exists..."
  | 'protection_step_3'  // "Vigilance cannot create safety..."
  | 'protection_step_4'  // "There is no threat here..."
  // Final
  | 'final_reset'
  | 'complete';

interface LoopDeLoopingSession {
  isActive: boolean;
  isFirstTime: boolean;
  phase: SessionPhase;
  mechanism: LoopMechanism;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  sessionStartTime: Date | null;
  // Stored claims for reference
  predictionClaim: string | null;
  meaningClaim: string | null;
  threatClaim: string | null;
  // For evaluation loop
  meaningSourceAnswer: 'a' | 'b' | null;
}

const initialSession: LoopDeLoopingSession = {
  isActive: false,
  isFirstTime: true,
  phase: 'mechanism_identification',
  mechanism: null,
  conversationHistory: [],
  sessionStartTime: null,
  predictionClaim: null,
  meaningClaim: null,
  threatClaim: null,
  meaningSourceAnswer: null
};

// ============================================
// OPENING MESSAGES
// ============================================

const firstTimeMessage = `**Loop De-Looping Protocol** — a 3-5 minute process to dissolve worry loops, rumination cycles, and anticipatory anxiety spirals.

This doesn't solve the problem — it dissolves the loop *mechanism* so you can think clearly again.

**Three mechanisms sustain loops. Tell me which one applies:**

**1. Prediction Loop** — mind keeps projecting future outcomes
*"What if...", "I'm worried that...", "What's going to happen..."*

**2. Evaluation Loop** — mind keeps analyzing what something "means"
*"This means...", "They think...", "What does this say about me..."*

**3. Protection Loop** — nervous system stays on threat-monitor
*"Something feels wrong", "I can't relax", physical anxiety without clear cause*

State the mechanism number (1, 2, or 3).

If unsure: Is the loop focused on what *might happen* (1), what something *means* (2), or a general sense of *threat* without clear cause (3)?`;

const returningMessage = `**Loop De-Looping Protocol**

Three mechanisms sustain loops. Which one is active right now?

**1. Prediction Loop** — projecting future outcomes
**2. Evaluation Loop** — analyzing what something "means"
**3. Protection Loop** — scanning for threat

State the mechanism number (1, 2, or 3).`;

// ============================================
// PHASE MESSAGES
// ============================================

const breathingInstruction = `Worry loops are sustained by autonomic arousal. This step is non-negotiable.

**Resonance Breathing Protocol**
• Inhale 6 seconds
• Exhale 6 seconds
• Duration: 2 minutes
• Nose only
• Slow, silent, no force

Complete this now. Type **"done"** when finished.`;

const deIdentificationInstruction = `Good. Now break the ownership cycle.

Say this sentence exactly, without modification:

**"A worry is being experienced. I cannot verify that it belongs to a me."**

Say it out loud or internally. Type **"confirm"** when done.`;

// Precision Inquiry prompts
const predictionInquiry = `Now identify the loop's target.

**"The mind is predicting ______."**

Fill in the blank with the specific outcome the mind is projecting.

One sentence only. No justification, no elaboration.`;

const evaluationInquiry = `Now identify the loop's target.

**"The mind is claiming this means ______."**

Fill in the blank with the specific meaning or interpretation the mind is manufacturing.

One sentence only. No justification, no elaboration.`;

const protectionInquiry = `Now identify the loop's target.

**"The system is scanning for ______."**

Fill in the blank with the specific threat the nervous system is monitoring for.

One sentence only. No justification, no elaboration.`;

// ============================================
// PREDICTION DISSOLUTION MESSAGES
// ============================================

const getPredictionStep1 = (claim: string) => `The mind is predicting: *"${claim}"*

**Verification check:** This prediction is not verifiable now.

The loop persists because the system believes it can control the future through anticipation. It cannot.

Say this sentence exactly:
**"The system is trying to control the uncontrollable."**

Type **"confirm"** when done.`;

const predictionStep2 = `Good. Now dissolve the false certainty mechanism.

The loop requires a defined outcome to persist. Remove it.

Say this sentence exactly:
**"Outcome is undefined. The loop cannot continue without a defined outcome."**

Type **"confirm"** when done.`;

const predictionStep3 = `Final dissolution step.

This removes the temporal structure the loop requires to persist.

Say this sentence exactly:
**"There is no future event here. Only a thought appearing now."**

Type **"confirm"** when done.`;

// ============================================
// EVALUATION DISSOLUTION MESSAGES
// ============================================

const getEvaluationStep1 = (claim: string) => `The mind is claiming this means: *"${claim}"*

**Source verification:** Where did this meaning come from?

**(a)** Directly stated by another person — they literally said these words to you
**(b)** Generated by your mind — an interpretation you created

Answer **a** or **b** only.`;

const evaluationStep2_b = `This meaning was generated by your mind, not verified by reality.

The mind manufactured an interpretation and is treating it as fact. It is not fact.

Say this sentence exactly:
**"The meaning is manufactured. I cannot verify it as true."**

Type **"confirm"** when done.`;

const evaluationStep2_a = `Even if someone said something, your mind has added interpretation to their words.

The meaning you're looping on is still manufactured — you cannot verify their internal intent or what it "really means."

Say this sentence exactly:
**"The meaning is manufactured. I cannot verify it as true."**

Type **"confirm"** when done.`;

const evaluationStep3 = `Now demonstrate the arbitrary nature of meaning-making.

If the mind can manufacture one meaning, it can manufacture others.

**Name one alternative meaning** for the same situation that is equally unverifiable but less distressing.

Just state it. One sentence.`;

const getEvaluationStep4 = (alternative: string) => `Good: *"${alternative}"*

Both interpretations are equally unverifiable. The original has no special claim to truth.

Final dissolution step. Say this sentence exactly:
**"There is no objective meaning here. Only interpretation appearing now."**

Type **"confirm"** when done.`;

// ============================================
// PROTECTION DISSOLUTION MESSAGES
// ============================================

const getProtectionStep1 = (claim: string) => `The system is scanning for: *"${claim}"*

**Present-moment verification:**

Is this threat present in your immediate physical environment right now?

Look around the room. Is the danger *here*, in this space, at this moment?

Answer **yes** or **no**.`;

const protectionStep2_no = `Correct. The threat is anticipated, remembered, or imagined — not present.

Your nervous system is responding to a scenario that does not currently exist in physical reality.

Say this sentence exactly:
**"No verified threat exists in this moment."**

Feel the truth of that statement in your body. Type **"confirm"** when done.`;

const protectionStep2_yes = `If there is an actual immediate physical threat, this protocol is not appropriate — take action to ensure your safety.

However, if what you're describing is a *potential* threat, a *remembered* threat, or an *anticipated* threat — that is not the same as a present-moment verified danger.

Is there an *actual physical danger* in your immediate environment right now that requires action?

Answer **yes** (take action, close this session) or **no** (continue protocol).`;

const protectionStep3 = `Now release the vigilance pattern.

The nervous system believes that constant scanning creates safety. It does not. Vigilance is exhausting and changes nothing about actual threats.

Say this sentence exactly:
**"Vigilance cannot create safety. The system can stand down."**

Type **"confirm"** when done.`;

const protectionStep4 = `Final dissolution step.

This removes the protective structure the loop requires to persist.

Say this sentence exactly:
**"There is no threat here. Only sensation appearing now."**

Type **"confirm"** when done.`;

// ============================================
// FINAL RESET
// ============================================

const finalResetInstruction = `**Loop collapse acknowledged.**

Final step: anchor your system in present sensory input. This replaces the imagined content with verifiable data and prevents loop reactivation.

Perform this exactly:
1. Identify **one visual object** in your immediate environment
2. Identify **one sound** currently present
3. Identify **one physical sensation** (temperature, pressure, contact)

State them in this format:
**"Seeing ___. Hearing ___. Feeling ___."**

No interpretation. No story. Pure sensory data.`;

const completionMessage = `**Final reset verified.**

Your system is now anchored in present sensory input, which removes the temporal and cognitive fuel required for the loop to continue.

No further steps required at this time.

If a new loop reactivates, return and provide the mechanism number — we'll run the appropriate protocol.`;

// ============================================
// SAFETY MESSAGES
// ============================================

const crisisMessage = `I'm noticing signs that this may be more than a worry loop.

**This protocol is for everyday worry loops, not crisis states.**

If you're experiencing:
• Thoughts of self-harm
• Severe panic or dissociation
• Feeling unsafe in a way that feels overwhelming

Please reach out to a mental health professional or contact:
**988 Suicide & Crisis Lifeline** (call or text 988)

This tool will be here when you're ready. Take care of yourself first.`;

const dissociationMessage = `Let's pause the cognitive work and ground first.

**Feel your feet on the floor.**
**Press your hands together firmly.**
**Name 5 things you can see right now.**

Take your time. Type **"grounded"** when you feel more present.`;

// ============================================
// HELPER FUNCTIONS
// ============================================

function parseMechanismFromInput(input: string): LoopMechanism {
  const lower = input.toLowerCase().trim();
  
  if (lower === '1' || lower.includes('prediction') || lower.includes('future') || 
      lower.includes('what if') || lower.includes('might happen') || lower.includes('worried that')) {
    return 'prediction';
  }
  if (lower === '2' || lower.includes('evaluation') || lower.includes('meaning') || 
      lower.includes('means') || lower.includes('they think') || lower.includes('says about')) {
    return 'evaluation';
  }
  if (lower === '3' || lower.includes('protection') || lower.includes('threat') || 
      lower.includes('danger') || lower.includes('unsafe') || lower.includes('wrong') ||
      lower.includes('vigilant') || lower.includes('scanning')) {
    return 'protection';
  }
  
  return null;
}

function isConfirmation(input: string): boolean {
  const lower = input.toLowerCase().trim();
  const confirmWords = ['done', 'confirmed', 'confirm', 'complete', 'completed', 'yes', 'ok', 'okay', 'finished', 'did it', 'said it', 'grounded'];
  return confirmWords.some(word => lower.includes(word));
}

function isYes(input: string): boolean {
  const lower = input.toLowerCase().trim();
  return lower === 'yes' || lower === 'y' || lower === 'yeah' || lower === 'yep';
}

function isNo(input: string): boolean {
  const lower = input.toLowerCase().trim();
  return lower === 'no' || lower === 'n' || lower === 'nope' || lower === 'nah';
}

function isAnswerA(input: string): boolean {
  const lower = input.toLowerCase().trim();
  return lower === 'a' || lower.includes('(a)') || lower.includes('directly stated') || lower.includes('they said');
}

function isAnswerB(input: string): boolean {
  const lower = input.toLowerCase().trim();
  return lower === 'b' || lower.includes('(b)') || lower.includes('generated') || lower.includes('my mind') || lower.includes('i created');
}

function detectCrisisSignals(input: string): boolean {
  const lower = input.toLowerCase();
  const crisisTerms = ['kill myself', 'suicide', 'want to die', 'end it all', 'hurt myself', 'self harm', 'cutting', "can't go on", 'no point living'];
  return crisisTerms.some(term => lower.includes(term));
}

function detectDissociationSignals(input: string): boolean {
  const lower = input.toLowerCase();
  const dissociationTerms = ["don't feel real", 'not in my body', 'floating', 'watching myself', 'numb', 'disconnected', "can't feel anything", 'foggy', 'unreal'];
  return dissociationTerms.some(term => lower.includes(term));
}

function hasSensoryFormat(input: string): boolean {
  const lower = input.toLowerCase();
  return (lower.includes('seeing') || lower.includes('see')) && 
         (lower.includes('hearing') || lower.includes('hear')) && 
         (lower.includes('feeling') || lower.includes('feel'));
}

function extractSessionData(session: LoopDeLoopingSession) {
  return {
    mechanism: session.mechanism,
    predictionClaim: session.predictionClaim,
    meaningClaim: session.meaningClaim,
    threatClaim: session.threatClaim,
    completedPhase: session.phase,
    completed: session.phase === 'complete'
  };
}

// Simple markdown renderer
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#ff9e19]">$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em class="text-gray-300">$1</em>')
    .replace(/^[•]\s+(.*)$/gm, '<div class="ml-4">• $1</div>')
    .replace(/\n/g, '<br />');
}

// ============================================
// PHASE PROGRESS CALCULATION
// ============================================

function getPhaseProgress(phase: SessionPhase, mechanism: LoopMechanism): { current: number; total: number; label: string } {
  const phases: Record<string, { order: number; label: string }> = {
    'mechanism_identification': { order: 1, label: 'Identify Mechanism' },
    'physiological_interrupt': { order: 2, label: 'Breathing Reset' },
    'de_identification': { order: 3, label: 'De-Identification' },
    'precision_inquiry': { order: 4, label: 'Precision Inquiry' },
    // Prediction
    'prediction_step_1': { order: 5, label: 'Dissolution 1/3' },
    'prediction_step_2': { order: 6, label: 'Dissolution 2/3' },
    'prediction_step_3': { order: 7, label: 'Dissolution 3/3' },
    // Evaluation
    'evaluation_step_1': { order: 5, label: 'Dissolution 1/4' },
    'evaluation_step_2': { order: 6, label: 'Dissolution 2/4' },
    'evaluation_step_3': { order: 7, label: 'Dissolution 3/4' },
    'evaluation_step_4': { order: 8, label: 'Dissolution 4/4' },
    // Protection
    'protection_step_1': { order: 5, label: 'Dissolution 1/4' },
    'protection_step_2': { order: 6, label: 'Dissolution 2/4' },
    'protection_step_3': { order: 7, label: 'Dissolution 3/4' },
    'protection_step_4': { order: 8, label: 'Dissolution 4/4' },
    // Final
    'final_reset': { order: 9, label: 'Sensory Reset' },
    'complete': { order: 10, label: 'Complete' }
  };

  const totalSteps = mechanism === 'prediction' ? 8 : 9; // Prediction has 3 dissolution steps, others have 4
  const current = phases[phase]?.order || 1;
  const label = phases[phase]?.label || 'Processing';

  return { current: Math.min(current, totalSteps), total: totalSteps, label };
}

// ============================================
// MODAL COMPONENT
// ============================================

interface LoopDeLoopingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

function LoopDeLoopingModalComponent({ isOpen, onClose, userId }: LoopDeLoopingModalProps) {
  const [session, setSession] = useState<LoopDeLoopingSession>(initialSession);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Refocus input after loading completes
  useEffect(() => {
    if (!loading && isOpen) {
      inputRef.current?.focus();
    }
  }, [loading, isOpen]);

  // Initialize session when modal opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeSession();
    }
  }, [isOpen]);

  const initializeSession = async () => {
    let isFirstTime = true;
    
    if (userId) {
      try {
        const supabase = createClient();
        const { count } = await supabase
          .from('tool_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('tool_type', 'loop_delooping');
        
        isFirstTime = (count || 0) === 0;
      } catch (error) {
        console.error('[LoopDeLooping] Error checking first time:', error);
      }
    }

    const openingMessage = isFirstTime ? firstTimeMessage : returningMessage;
    
    setSession({
      ...initialSession,
      isActive: true,
      isFirstTime,
      sessionStartTime: new Date(),
      conversationHistory: [{ role: 'assistant', content: openingMessage }]
    });
    
    setMessages([{ role: 'assistant', content: openingMessage }]);
  };

  const addMessages = (newMessages: Array<{ role: 'user' | 'assistant'; content: string }>) => {
    setMessages(prev => [...prev, ...newMessages]);
    setSession(prev => ({
      ...prev,
      conversationHistory: [...prev.conversationHistory, ...newMessages]
    }));
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Safety checks first
    if (detectCrisisSignals(userMessage)) {
      addMessages([
        { role: 'user', content: userMessage },
        { role: 'assistant', content: crisisMessage }
      ]);
      setLoading(false);
      return;
    }

    if (detectDissociationSignals(userMessage)) {
      addMessages([
        { role: 'user', content: userMessage },
        { role: 'assistant', content: dissociationMessage }
      ]);
      setLoading(false);
      return;
    }

    // Process based on current phase
    let response = '';
    let nextPhase: SessionPhase = session.phase;
    const updatedSession = { ...session };

    switch (session.phase) {
      // ==========================================
      // MECHANISM IDENTIFICATION
      // ==========================================
      case 'mechanism_identification': {
        const mechanism = parseMechanismFromInput(userMessage);
        if (mechanism) {
          updatedSession.mechanism = mechanism;
          nextPhase = 'physiological_interrupt';
          response = breathingInstruction;
        } else {
          response = `I need the mechanism number to proceed.

Is the loop focused on:
**1** — what *might happen* (future outcomes)
**2** — what something *means* (interpretation)
**3** — a general sense of *threat* (danger without clear cause)

Just give me the number: 1, 2, or 3.`;
        }
        break;
      }

      // ==========================================
      // PHYSIOLOGICAL INTERRUPT
      // ==========================================
      case 'physiological_interrupt': {
        if (isConfirmation(userMessage)) {
          nextPhase = 'de_identification';
          response = deIdentificationInstruction;
        } else {
          response = `The breathing step is non-negotiable. Loops are sustained by autonomic arousal — we must interrupt that first.

**Inhale 6 seconds. Exhale 6 seconds. 2 minutes. Nose only.**

Type **"done"** when complete.`;
        }
        break;
      }

      // ==========================================
      // DE-IDENTIFICATION
      // ==========================================
      case 'de_identification': {
        if (isConfirmation(userMessage)) {
          nextPhase = 'precision_inquiry';
          if (session.mechanism === 'prediction') {
            response = predictionInquiry;
          } else if (session.mechanism === 'evaluation') {
            response = evaluationInquiry;
          } else {
            response = protectionInquiry;
          }
        } else {
          response = `Say the sentence exactly as written:

**"A worry is being experienced. I cannot verify that it belongs to a me."**

Then type **"confirm"**.`;
        }
        break;
      }

      // ==========================================
      // PRECISION INQUIRY
      // ==========================================
      case 'precision_inquiry': {
        // Store the claim and move to dissolution
        if (session.mechanism === 'prediction') {
          updatedSession.predictionClaim = userMessage;
          nextPhase = 'prediction_step_1';
          response = getPredictionStep1(userMessage);
        } else if (session.mechanism === 'evaluation') {
          updatedSession.meaningClaim = userMessage;
          nextPhase = 'evaluation_step_1';
          response = getEvaluationStep1(userMessage);
        } else {
          updatedSession.threatClaim = userMessage;
          nextPhase = 'protection_step_1';
          response = getProtectionStep1(userMessage);
        }
        break;
      }

      // ==========================================
      // PREDICTION DISSOLUTION
      // ==========================================
      case 'prediction_step_1': {
        if (isConfirmation(userMessage)) {
          nextPhase = 'prediction_step_2';
          response = predictionStep2;
        } else {
          response = `Say the sentence exactly:

**"The system is trying to control the uncontrollable."**

Type **"confirm"** when done.`;
        }
        break;
      }

      case 'prediction_step_2': {
        if (isConfirmation(userMessage)) {
          nextPhase = 'prediction_step_3';
          response = predictionStep3;
        } else {
          response = `Say the sentence exactly:

**"Outcome is undefined. The loop cannot continue without a defined outcome."**

Type **"confirm"** when done.`;
        }
        break;
      }

      case 'prediction_step_3': {
        if (isConfirmation(userMessage)) {
          nextPhase = 'final_reset';
          response = finalResetInstruction;
        } else {
          response = `Say the sentence exactly:

**"There is no future event here. Only a thought appearing now."**

Type **"confirm"** when done.`;
        }
        break;
      }

      // ==========================================
      // EVALUATION DISSOLUTION
      // ==========================================
      case 'evaluation_step_1': {
        if (isAnswerA(userMessage)) {
          updatedSession.meaningSourceAnswer = 'a';
          nextPhase = 'evaluation_step_2';
          response = evaluationStep2_a;
        } else if (isAnswerB(userMessage)) {
          updatedSession.meaningSourceAnswer = 'b';
          nextPhase = 'evaluation_step_2';
          response = evaluationStep2_b;
        } else {
          response = `Answer with **a** or **b** only:

**(a)** Directly stated by another person
**(b)** Generated by your mind`;
        }
        break;
      }

      case 'evaluation_step_2': {
        if (isConfirmation(userMessage)) {
          nextPhase = 'evaluation_step_3';
          response = evaluationStep3;
        } else {
          response = `Say the sentence exactly:

**"The meaning is manufactured. I cannot verify it as true."**

Type **"confirm"** when done.`;
        }
        break;
      }

      case 'evaluation_step_3': {
        // User provides alternative meaning - store it and continue
        if (userMessage.length > 5) { // Basic check that they provided something
          nextPhase = 'evaluation_step_4';
          response = getEvaluationStep4(userMessage);
        } else {
          response = `Name one alternative meaning for the same situation — equally unverifiable but less distressing.

Just state it in one sentence.`;
        }
        break;
      }

      case 'evaluation_step_4': {
        if (isConfirmation(userMessage)) {
          nextPhase = 'final_reset';
          response = finalResetInstruction;
        } else {
          response = `Say the sentence exactly:

**"There is no objective meaning here. Only interpretation appearing now."**

Type **"confirm"** when done.`;
        }
        break;
      }

      // ==========================================
      // PROTECTION DISSOLUTION
      // ==========================================
      case 'protection_step_1': {
        if (isNo(userMessage)) {
          nextPhase = 'protection_step_2';
          response = protectionStep2_no;
        } else if (isYes(userMessage)) {
          // They claim threat is present - clarify
          response = protectionStep2_yes;
        } else {
          response = `Is this threat present in your immediate physical environment right now?

Look around. Is the danger *here*, in this room, at this moment?

Answer **yes** or **no**.`;
        }
        break;
      }

      case 'protection_step_2': {
        if (isConfirmation(userMessage) || isNo(userMessage)) {
          // If they answered "no" to the follow-up about actual danger, continue
          nextPhase = 'protection_step_3';
          response = protectionStep3;
        } else if (isYes(userMessage)) {
          // Actual immediate danger - end protocol
          response = `If there's actual immediate danger, take action to ensure your safety first.

This protocol is for perceived/anticipated threats, not real emergencies.

Close this session and address the real situation. Return when you're safe.`;
        } else {
          response = `Say the sentence exactly:

**"No verified threat exists in this moment."**

Type **"confirm"** when done.`;
        }
        break;
      }

      case 'protection_step_3': {
        if (isConfirmation(userMessage)) {
          nextPhase = 'protection_step_4';
          response = protectionStep4;
        } else {
          response = `Say the sentence exactly:

**"Vigilance cannot create safety. The system can stand down."**

Type **"confirm"** when done.`;
        }
        break;
      }

      case 'protection_step_4': {
        if (isConfirmation(userMessage)) {
          nextPhase = 'final_reset';
          response = finalResetInstruction;
        } else {
          response = `Say the sentence exactly:

**"There is no threat here. Only sensation appearing now."**

Type **"confirm"** when done.`;
        }
        break;
      }

      // ==========================================
      // FINAL RESET
      // ==========================================
      case 'final_reset': {
        if (hasSensoryFormat(userMessage)) {
          nextPhase = 'complete';
          response = completionMessage;
        } else {
          response = `Provide all three in this format:

**"Seeing ___. Hearing ___. Feeling ___."**

Pure sensory data. No interpretation, no story.`;
        }
        break;
      }

      // ==========================================
      // COMPLETE
      // ==========================================
      case 'complete': {
        response = `Session complete. The loop mechanism has been dissolved.

If you're experiencing a new loop, we can run the protocol again — just tell me the mechanism number (1, 2, or 3).

Otherwise, you're free to close this session.`;
        break;
      }
    }

    // Update session state
    updatedSession.phase = nextPhase;
    updatedSession.conversationHistory = [
      ...session.conversationHistory,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: response }
    ];
    
    setSession(updatedSession);
    setMessages(prev => [
      ...prev,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: response }
    ]);
    setLoading(false);
  };

  const handleEndSession = async () => {
    let durationSeconds = 0;
    if (session.sessionStartTime) {
      durationSeconds = Math.floor((Date.now() - session.sessionStartTime.getTime()) / 1000);
    }
    
    const sessionData = extractSessionData(session);
    
    if (userId) {
      try {
        const supabase = createClient();
        await supabase.from('tool_sessions').insert({
          user_id: userId,
          tool_type: 'loop_delooping',
          session_mode: session.mechanism || 'incomplete',
          duration_seconds: durationSeconds,
          session_data: sessionData,
          completed: session.phase === 'complete'
        });
      } catch (error) {
        console.error('[LoopDeLooping] Failed to save session:', error);
      }
    }
    
    setSession(initialSession);
    setMessages([]);
    setInput('');
    onClose();
  };

  const handleClose = () => {
    if (session.isActive && session.conversationHistory.length > 1) {
      handleEndSession();
    } else {
      setSession(initialSession);
      setMessages([]);
      setInput('');
      onClose();
    }
  };

  if (!isOpen) return null;

  const progress = getPhaseProgress(session.phase, session.mechanism);

  // Dynamic placeholder based on phase
  const getPlaceholder = (): string => {
    switch (session.phase) {
      case 'mechanism_identification': return "Enter 1, 2, or 3...";
      case 'physiological_interrupt': return "Type 'done' when breathing complete...";
      case 'de_identification': return "Type 'confirm' when done...";
      case 'precision_inquiry': return "One sentence only...";
      case 'evaluation_step_1': return "Type 'a' or 'b'...";
      case 'evaluation_step_3': return "One alternative meaning...";
      case 'protection_step_1': return "Type 'yes' or 'no'...";
      case 'final_reset': return "Seeing ___. Hearing ___. Feeling ___.";
      default: 
        if (session.phase.includes('step')) return "Type 'confirm' when done...";
        return "Type your response...";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl h-[85vh] bg-gradient-to-b from-gray-900 to-[#0a0a0a] rounded-2xl border border-gray-700/50 flex flex-col overflow-hidden shadow-2xl shadow-black/50">
        
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-gray-700/50">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff9e19]/50 to-transparent" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ff9e19]/20 flex items-center justify-center">
                <span className="text-xl">🔄</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Loop De-Looping</h2>
                <p className="text-sm text-gray-400">
                  {session.mechanism 
                    ? `${session.mechanism.charAt(0).toUpperCase() + session.mechanism.slice(1)} Loop → ${progress.label}`
                    : 'Mechanism-based dissolution'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {session.isActive && session.conversationHistory.length > 1 && (
                <button
                  onClick={handleEndSession}
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-600"
                >
                  End Session
                </button>
              )}
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {session.isActive && session.mechanism && (
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#ff9e19] rounded-full transition-all duration-500"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 min-w-[60px] text-right">
                  {progress.current}/{progress.total}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                  msg.role === 'user'
                    ? 'bg-[#ff9e19] text-white'
                    : 'bg-gray-800/80 text-gray-100 border border-gray-700/50'
                }`}
              >
                {msg.role === 'user' ? (
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                ) : (
                  <div 
                    className="leading-relaxed prose prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                  />
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800/80 border border-gray-700/50 rounded-2xl px-5 py-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-[#ff9e19]/60 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-[#ff9e19]/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-[#ff9e19]/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="border-t border-gray-700/50 p-4 bg-gray-900/50">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={getPlaceholder()}
              disabled={loading || session.phase === 'complete'}
              rows={1}
              className="flex-1 bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff9e19]/50 focus:border-[#ff9e19]/50 disabled:opacity-50 resize-none min-h-[48px] max-h-[120px] transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading || session.phase === 'complete'}
              className="px-5 py-3 bg-[#ff9e19] text-white rounded-xl font-medium hover:bg-orange-500 disabled:opacity-50 disabled:hover:bg-[#ff9e19] transition-colors shadow-lg shadow-[#ff9e19]/20"
            >
              Send
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {session.phase === 'complete' 
              ? 'Session complete • Click "End Session" to close'
              : 'Press Enter to send • Follow each step exactly'
            }
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// HOOK FOR USING THE MODAL
// ============================================

export function useLoopDeLooping() {
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();

  const open = useCallback((uid?: string) => {
    setUserId(uid);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const Modal = useCallback(() => (
    <LoopDeLoopingModalComponent 
      isOpen={isOpen} 
      onClose={close}
      userId={userId}
    />
  ), [isOpen, close, userId]);

  return { open, close, isOpen, Modal };
}

export default LoopDeLoopingModalComponent;
