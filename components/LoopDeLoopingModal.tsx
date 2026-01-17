// components/LoopDeLoopingModal.tsx
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { toolUniversalFrame, lowResultFrame } from '@/lib/toolFraming';

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
  | 'prediction_step_1'
  | 'prediction_step_2'
  | 'prediction_step_3'
  // Evaluation dissolution steps
  | 'evaluation_step_1'
  | 'evaluation_step_2'
  | 'evaluation_step_3'
  | 'evaluation_step_4'
  // Protection dissolution steps
  | 'protection_step_1'
  | 'protection_step_2'
  | 'protection_step_3'
  | 'protection_step_4'
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

  // Store Signal for continuity
  signal: string | null;
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
  meaningSourceAnswer: null,
  signal: null
};

// ============================================
// OPENING MESSAGES (CUE-KERNEL ALIGNED)
// ============================================

const firstTimeMessage = `**Loop De-Looping Protocol** — a 3-5 minute process to dissolve worry loops, rumination cycles, and anticipatory anxiety spirals.

${toolUniversalFrame}

This doesn't solve the problem — it dissolves the loop *mechanism* so you can think clearly again.

Start with Signal (verifiable, right now):
**Signal:** one body sensation or emotion you can confirm (e.g., tight chest, buzzing, dread, pressure, heat, nausea).

Then choose the loop mechanism:

**1. Prediction Loop** — mind keeps projecting future outcomes
*"What if...", "I'm worried that...", "What's going to happen..."*

**2. Evaluation Loop** — mind keeps analyzing what something "means" / interpreting intent
*"This means...", "They think...", "What does this say about me..."*

**3. Protection Loop** — nervous system stays on threat-monitor
*"Something feels wrong", "I can't relax", physical anxiety without clear cause*

Reply in this format:
**Signal:** ___
**Mechanism:** 1 / 2 / 3

If unsure: is the loop focused on what *might happen* (1), what something *means* (2), or a sense of *threat* without clear cause (3)?`;

const returningMessage = `**Loop De-Looping Protocol**

Start with Signal:
**Signal:** one body sensation or emotion you can verify right now.

Then choose the mechanism:

**1. Prediction Loop** — projecting future outcomes
**2. Evaluation Loop** — assigning meaning / interpreting intent
**3. Protection Loop** — scanning for threat

Reply in this format:
**Signal:** ___
**Mechanism:** 1 / 2 / 3`;

// ============================================
// PHASE MESSAGES (CUE-KERNEL ALIGNED)
// ============================================

const breathingInstruction = `Worry loops are sustained by autonomic arousal. This step is non-negotiable.

**Resonance Breathing Protocol**
• Inhale 6 seconds
• Exhale 6 seconds
• Duration: 2 minutes
• Nose only
• Slow, silent, no force

Complete this now. Type **"done"** when finished.`;

const deIdentificationInstruction = `Good. Now break fusion (Signal vs Interpretation).

Say this sentence exactly, without modification:

**"Signal is present. A worry-story is being generated. I will treat it as an Interpretation, not a fact."**

Say it out loud or internally. Type **"confirm"** when done.`;

// Precision Inquiry prompts
const predictionInquiry = `Now identify the loop's target.

**"The mind is predicting ______."**

Fill in the blank with the specific outcome the mind is projecting.

One sentence only. No justification, no elaboration.`;

const evaluationInquiry = `Now identify the loop's target.

**"The mind is claiming this means ______."**

Fill in the blank with the specific meaning or implication the mind is adding.

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
**"No future event is verifiable right now. This is a prediction appearing now."**

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

The mind added implication/intent and is treating it as fact. It is not fact.

Say this sentence exactly:
**"The added meaning is unverifiable. This is an Interpretation, not a fact."**

Type **"confirm"** when done.`;

const evaluationStep2_a = `Even if someone said something, your mind is adding implication/intent beyond their words.

That added meaning is still not verifiable as true.

Say this sentence exactly:
**"The added meaning is unverifiable. This is an Interpretation, not a fact."**

Type **"confirm"** when done.`;

const evaluationStep3 = `Now demonstrate the arbitrary nature of meaning-making.

If the mind can generate one meaning, it can generate others.

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

const protectionStep2_no = `Threat is not verified in the immediate environment right now.

Your nervous system may be responding to an anticipated, remembered, or imagined scenario — not a present verified danger.

Say this sentence exactly:
**"No immediate threat is verified in this moment."**

Feel the statement in your body. Type **"confirm"** when done.`;

const protectionStep2_yes = `If there is an actual immediate physical threat, this protocol is not appropriate — take action to ensure your safety.

However, if what you're describing is a *potential* threat, a *remembered* threat, or an *anticipated* threat — that is not the same as a present verified danger.

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
**"No immediate threat is verified in this moment. Only sensation is present."**

Type **"confirm"** when done.`;

// ============================================
// FINAL RESET
// ============================================

const finalResetInstruction = `**Loop collapse acknowledged.**

Final step: anchor your system in present sensory input. This replaces imagined content with verifiable data and helps prevent loop reactivation.

Perform this exactly:
1. Identify **one visual object** in your immediate environment
2. Identify **one sound** currently present
3. Identify **one physical sensation** (temperature, pressure, contact)

State them in this format:
**"Seeing ___. Hearing ___. Feeling ___."**

No interpretation. No story. Pure sensory data.`;

const completionMessage = `**Final reset verified.**

Signal: Use what you just reported (Seeing / Hearing / Feeling).
Interpretation: "This loop content is an Interpretation (prediction / meaning / threat), not a verified fact."
Action: Choose one next step within 24h:
- If action is required: write the smallest concrete step in one sentence.
- If no action is required: return to your next activity slowly for 10 seconds, feeling your feet.

If a new loop reactivates, return and restart with:
**Signal:** ___
**Mechanism:** 1 / 2 / 3`;

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

function extractSignalFromInput(input: string): string | null {
  const match = input.match(/signal\s*:\s*([^\n\r]+)/i);
  if (!match) return null;
  const value = match[1]?.trim();
  return value && value.length > 0 ? value : null;
}

function parseMechanismFromInput(input: string): LoopMechanism {
  const lower = input.toLowerCase();

  const m = lower.match(/mechanism\s*:\s*([123])/);
  if (m?.[1] === '1') return 'prediction';
  if (m?.[1] === '2') return 'evaluation';
  if (m?.[1] === '3') return 'protection';

  const d = lower.match(/\b([123])\b/);
  if (d?.[1] === '1') return 'prediction';
  if (d?.[1] === '2') return 'evaluation';
  if (d?.[1] === '3') return 'protection';

  if (lower.includes('prediction') || lower.includes('what if') || lower.includes('future')) return 'prediction';
  if (lower.includes('evaluation') || lower.includes('meaning') || lower.includes('they think')) return 'evaluation';
  if (lower.includes('protection') || lower.includes('threat') || lower.includes('unsafe') || lower.includes('scanning')) return 'protection';

  return null;
}

function isConfirmation(input: string): boolean {
  const lower = input.toLowerCase().trim();
  const confirmWords = ['done', 'confirmed', 'confirm', 'complete', 'completed', 'ok', 'okay', 'finished', 'did it', 'said it', 'grounded'];
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
  const normalized = input.toLowerCase();
  const hasSeeing = normalized.includes('seeing');
  const hasHearing = normalized.includes('hearing');
  const hasFeeling = normalized.includes('feeling');
  return hasSeeing && hasHearing && hasFeeling;
}

function extractSessionData(session: LoopDeLoopingSession) {
  return {
    mechanism: session.mechanism,
    signal: session.signal,
    predictionClaim: session.predictionClaim,
    meaningClaim: session.meaningClaim,
    threatClaim: session.threatClaim,
    completedPhase: session.phase,
    completed: session.phase === 'complete',
    // Capacity signals (not success/fail)
    was_signal_named: session.signal !== null,
    was_interpretation_identified: session.predictionClaim !== null || session.meaningClaim !== null || session.threatClaim !== null,
    action_selected: session.phase === 'complete'
  };
}

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
    'prediction_step_1': { order: 5, label: 'Dissolution 1/3' },
    'prediction_step_2': { order: 6, label: 'Dissolution 2/3' },
    'prediction_step_3': { order: 7, label: 'Dissolution 3/3' },
    'evaluation_step_1': { order: 5, label: 'Dissolution 1/4' },
    'evaluation_step_2': { order: 6, label: 'Dissolution 2/4' },
    'evaluation_step_3': { order: 7, label: 'Dissolution 3/4' },
    'evaluation_step_4': { order: 8, label: 'Dissolution 4/4' },
    'protection_step_1': { order: 5, label: 'Dissolution 1/4' },
    'protection_step_2': { order: 6, label: 'Dissolution 2/4' },
    'protection_step_3': { order: 7, label: 'Dissolution 3/4' },
    'protection_step_4': { order: 8, label: 'Dissolution 4/4' },
    'final_reset': { order: 9, label: 'Sensory Reset' },
    'complete': { order: 10, label: 'Complete' }
  };

  const totalSteps = 10;
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
  const [sessionsToday, setSessionsToday] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!loading && isOpen) {
      inputRef.current?.focus();
    }
  }, [loading, isOpen]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeSession();
    }
  }, [isOpen]);

  const initializeSession = async () => {
    let isFirstTime = true;
    let todayCount = 0;

    if (userId) {
      try {
        const supabase = createClient();
        const { count } = await supabase
          .from('tool_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('tool_type', 'loop_delooping');

        isFirstTime = (count || 0) === 0;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { count: todaySessionCount } = await supabase
          .from('tool_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('tool_type', 'loop_delooping')
          .gte('created_at', today.toISOString());
        
        todayCount = todaySessionCount || 0;
        setSessionsToday(todayCount);
      } catch (error) {
        console.error('[LoopDeLooping] Error checking first time:', error);
      }
    }

    // Step 2.2: Universal frame in first-time message only
    let openingMessage = isFirstTime ? firstTimeMessage : returningMessage;
    
    // Step 2.3: Add low-result frame if 3+ sessions today
    if (todayCount >= 3) {
      openingMessage += `\n\n*${lowResultFrame}*`;
    }

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

    let response = '';
    let nextPhase: SessionPhase = session.phase;
    const updatedSession: LoopDeLoopingSession = { ...session };

    switch (session.phase) {
      case 'mechanism_identification': {
        const signal = extractSignalFromInput(userMessage);
        if (signal) updatedSession.signal = signal;

        const mechanism = parseMechanismFromInput(userMessage);
        if (mechanism) {
          updatedSession.mechanism = mechanism;
          nextPhase = 'physiological_interrupt';
          response = breathingInstruction;
        } else {
          response = `I need the mechanism number to proceed.

Reply in this format:
**Signal:** ___
**Mechanism:** 1 / 2 / 3

Mechanisms:
**1** — what *might happen* (future outcomes)
**2** — what something *means* (interpretation)
**3** — a sense of *threat* (danger without clear cause)`;
        }
        break;
      }

      case 'physiological_interrupt': {
        if (isConfirmation(userMessage)) {
          nextPhase = 'de_identification';
          response = deIdentificationInstruction;
        } else {
          response = `The breathing step is required first.

**Inhale 6 seconds. Exhale 6 seconds. 2 minutes. Nose only.**

Type **"done"** when complete.`;
        }
        break;
      }

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

**"Signal is present. A worry-story is being generated. I will treat it as an Interpretation, not a fact."**

Then type **"confirm"**.`;
        }
        break;
      }

      case 'precision_inquiry': {
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

**"No future event is verifiable right now. This is a prediction appearing now."**

Type **"confirm"** when done.`;
        }
        break;
      }

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

**"The added meaning is unverifiable. This is an Interpretation, not a fact."**

Type **"confirm"** when done.`;
        }
        break;
      }

      case 'evaluation_step_3': {
        if (userMessage.length > 5) {
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

      case 'protection_step_1': {
        if (isNo(userMessage)) {
          nextPhase = 'protection_step_2';
          response = protectionStep2_no;
        } else if (isYes(userMessage)) {
          nextPhase = 'protection_step_2';
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
          nextPhase = 'protection_step_3';
          response = protectionStep3;
        } else if (isYes(userMessage)) {
          response = `If there's actual immediate danger, take action to ensure your safety first.

This protocol is for perceived/anticipated threats, not real emergencies.

Close this session and address the real situation. Return when you're safe.`;
        } else {
          response = `Say the sentence exactly:

**"No immediate threat is verified in this moment."**

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

**"No immediate threat is verified in this moment. Only sensation is present."**

Type **"confirm"** when done.`;
        }
        break;
      }

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

      case 'complete': {
        response = completionMessage;
        break;
      }
    }

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

  const getPlaceholder = (): string => {
    switch (session.phase) {
      case 'mechanism_identification': return "Signal: ___. Mechanism: 1/2/3";
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
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-2xl h-[85vh] bg-gradient-to-b from-gray-900 to-[#0a0a0a] rounded-2xl border border-gray-700/50 flex flex-col overflow-hidden shadow-2xl shadow-black/50">

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

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3 ${msg.role === 'user'
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
