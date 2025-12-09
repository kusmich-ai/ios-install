'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useIsMobile } from '@/app/hooks/useIsMobile';
import { useUserProgress } from '@/app/hooks/useUserProgress';
import ToolsSidebar from '@/components/ToolsSidebar';
import FloatingActionButton from '@/components/FloatingActionButton';
import MobileDashboard from '@/components/MobileDashboard';
import { createClient } from '@/lib/supabase-client';

// ============================================
// TEMPLATE SYSTEM IMPORTS
// ============================================
import {
  processTemplate,
  selectTemplate,
  templateLibrary,
  getPracticesForStage,
  getNextPractice,
  areAllPracticesComplete,
  getPracticeById,
  isToolUnlocked,
  type TemplateContext,
  type SelectionContext
} from '@/lib/templates';
import { 
  startNewMicroActionSprint, 
  startNewFlowBlockSprint,
  getCurrentMicroActionSprint,
  getCurrentFlowBlockSprint,
  loadActiveSprintsForUser
} from '@/lib/sprintDatabase';

// ============================================
// MICRO-ACTION SETUP IMPORTS (100% API version)
// ============================================
import {
  MicroActionState,
  initialMicroActionState,
  microActionSystemPrompt,
  microActionOpeningMessage,
  parseCompletionMarker,
  cleanResponseForDisplay,
  buildAPIMessages,
  // NEW: Two-stage extraction functions
  isIdentityCommitmentResponse,
  buildMicroActionExtractionMessages,
  parseMicroActionExtraction
} from '@/lib/microActionAPI';

// ============================================
// FLOW BLOCK SETUP IMPORTS (100% API version)
// ============================================
import {
  FlowBlockState,
  initialFlowBlockState,
  WeeklyMapEntry,
  SetupPreferences,
  flowBlockSystemPrompt,
  flowBlockOpeningMessage,
  getFlowBlockOpeningWithIdentity,
  isCommitmentResponse,
  buildFlowBlockAPIMessages,
  buildFlowBlockExtractionMessages,
  parseFlowBlockExtraction,
  cleanFlowBlockResponseForDisplay,
  getTodaysBlock,
  getDailyFlowBlockPrompt,
  postBlockReflectionPrompt,
  getSprintDayNumber,
  isSprintComplete,
  sprintCompleteMessage
} from '@/lib/flowBlockAPI';

// ============================================
// ON-DEMAND TOOL MODALS
// ============================================
import { useDecentering } from '@/components/DecenteringModal';
import { useMetaReflection, isWeeklyReflectionDue, isSunday } from '@/components/MetaReflectionModal';



// ============================================
// DEV LOGGING UTILITY
// ============================================
const isDev = process.env.NODE_ENV === 'development';
const devLog = (tag: string, ...args: any[]) => {
  if (isDev) console.log(tag, ...args);
};

// ============================================
// EXTENDED FLOW BLOCK STATE (adds todaysBlock for local tracking)
// ============================================
interface ExtendedFlowBlockState extends FlowBlockState {
  todaysBlock: WeeklyMapEntry | null;
}

const initialExtendedFlowBlockState: ExtendedFlowBlockState = {
  ...initialFlowBlockState,
  todaysBlock: null
};

// Simple markdown renderer for chat messages
function renderMarkdown(text: string): string {
  return text
    // Remove excessive box-drawing characters (═ ─ │ etc.)
    .replace(/^[═─│┌┐└┘├┤┬┴┼]{3,}$/gm, '')
    // Bold: **text** or __text__
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#ff9e19]">$1</strong>')
    .replace(/__(.*?)__/g, '<strong class="text-[#ff9e19]">$1</strong>')
    // Italic: *text* or _text_
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/_([^_\n]+)_/g, '<em>$1</em>')
    // Section headers (lines that are all caps or end with colon)
    .replace(/^([A-Z][A-Z\s&]+):?\s*$/gm, '<div class="text-[#ff9e19] font-semibold mt-4 mb-1">$1</div>')
    // Bullet points
    .replace(/^[•\-]\s+(.*)$/gm, '<div class="ml-4">• $1</div>')
    // Progress indicators like "Stage: X" or "Score: Y"
    .replace(/^(Stage|Score|Status|Adherence|Days|Index):\s*(.*)$/gm, '<div><span class="text-gray-400">$1:</span> <span class="font-medium">$2</span></div>')
    // Clean up multiple consecutive line breaks
    .replace(/\n{3,}/g, '\n\n')
    // Line breaks
    .replace(/\n/g, '<br />');
}

// Get stage name from number
function getStageName(stage: number): string {
  const names: { [key: number]: string } = {
    1: 'Neural Priming',
    2: 'Embodied Awareness',
    3: 'Identity Mode',
    4: 'Flow Mode',
    5: 'Relational Coherence',
    6: 'Integration',
    7: 'Accelerated Expansion'
  };
  return names[stage] || `Stage ${stage}`;
}

// Get status tier based on REwired Index
function getStatusTier(index: number): string {
  if (index <= 20) return 'System Offline';
  if (index <= 40) return 'Baseline Mode';
  if (index <= 60) return 'Operational';
  if (index <= 80) return 'Optimized';
  return 'Integrated';
}

// Get status color based on REwired Index
function getStatusColor(index: number): string {
  if (index <= 20) return 'text-red-400';
  if (index <= 40) return 'text-yellow-400';
  if (index <= 60) return 'text-blue-400';
  if (index <= 80) return 'text-green-400';
  return 'text-purple-400';
}

// ============================================
// OPENING MESSAGE GENERATORS
// ============================================

interface BaselineData {
  rewiredIndex: number;
  tier: string;
  domainScores: {
    regulation: number;
    awareness: number;
    outlook: number;
    attention: number;
  };
  currentStage: number;
}

interface ProgressData {
  adherence_percentage?: number;
  consecutive_days?: number;
  stage_start_date?: string;
}

// Tier interpretations
const tierInterpretations: { [key: string]: string } = {
  'System Offline': "Uh oh! Your nervous system is in survival mode. You're operating on fumes. The IOS will teach you how to downshift into recovery.",
  'Baseline Mode': "You're functioning, but not optimized. Regulation is inconsistent, awareness is fragmented. The IOS will build your foundation.",
  'Operational': "You have some coherence, but it's not stable. The IOS will solidify what's working and upgrade what isn't.",
  'Optimized': "You're performing well. The IOS will take you from good to exceptional — making flow states and clarity your default.",
  'Integrated': "You're already operating at a high level. The IOS will help you sustain and expand this capacity across all domains."
};

// Stage rituals - using "Resonance Breathing" consistently
const stageRituals: { [key: number]: { list: string; total: string } } = {
  1: {
    list: `1. **Resonance Breathing** - 5 mins
2. **Awareness Rep** - 2 mins`,
    total: '7 minutes'
  },
  2: {
    list: `1. **Resonance Breathing** - 5 mins
2. **Somatic Flow** - 3 mins
3. **Awareness Rep** - 2 mins`,
    total: '10 minutes'
  },
  3: {
    list: `1. **Resonance Breathing** - 5 mins
2. **Somatic Flow** - 3 mins
3. **Awareness Rep** - 2 mins
4. **Morning Micro-Action** - 2-3 mins`,
    total: '12-13 minutes'
  },
  4: {
    list: `1. **Resonance Breathing** - 5 mins
2. **Somatic Flow** - 3 mins
3. **Awareness Rep** - 2 mins
4. **Morning Micro-Action** - 2-3 mins
5. **Flow Block** - 60-90 mins (scheduled)`,
    total: '12-13 minutes morning + Flow Block'
  },
  5: {
    list: `1. **Resonance Breathing** - 5 mins
2. **Somatic Flow** - 3 mins
3. **Awareness Rep** - 2 mins
4. **Morning Micro-Action** - 2-3 mins
5. **Flow Block** - 60-90 mins (scheduled)
6. **Co-Regulation Practice** - 3-5 mins (evening)`,
    total: '12-13 minutes morning + Flow Block + evening practice'
  },
  6: {
    list: `1. **Resonance Breathing** - 5 mins
2. **Somatic Flow** - 3 mins
3. **Awareness Rep** - 2 mins
4. **Morning Micro-Action** - 2-3 mins
5. **Flow Block** - 60-90 mins (scheduled)
6. **Co-Regulation Practice** - 3-5 mins (evening)
7. **Nightly Debrief** - 2 mins (before sleep)`,
    total: '12-13 minutes morning + Flow Block + evening practices'
  },
  7: {
    list: `All Stage 6 rituals + personalized advanced protocols`,
    total: 'Custom schedule'
  }
};

// Required practice IDs by stage (for checking completion)
// IDs must match what's stored in practice_logs.practice_type
const stagePracticeIds: { [key: number]: string[] } = {
  1: ['hrvb', 'awareness_rep'],
  2: ['hrvb', 'somatic_flow', 'awareness_rep'],
  3: ['hrvb', 'somatic_flow', 'awareness_rep', 'micro_action'],
  4: ['hrvb', 'somatic_flow', 'awareness_rep', 'micro_action', 'flow_block'],
  5: ['hrvb', 'somatic_flow', 'awareness_rep', 'micro_action', 'flow_block', 'co_regulation'],
  6: ['hrvb', 'somatic_flow', 'awareness_rep', 'micro_action', 'flow_block', 'co_regulation', 'nightly_debrief'],
  7: ['hrvb', 'somatic_flow', 'awareness_rep', 'micro_action', 'flow_block', 'co_regulation', 'nightly_debrief']
};

// ============================================
// WEEKLY CHECK-IN CONSTANTS
// ============================================

// Stage-specific qualitative questions
const stageQualitativeQuestions: { [key: number]: string } = {
  1: "How easily can you return to calm when stressed?",
  2: "Does awareness stay present during movement?",
  3: "Is your chosen identity feeling more automatic?",
  4: "Can you drop into focused flow reliably?",
  5: "Do you stay regulated in difficult conversations?",
  6: "Is awareness stable across all life contexts?",
  7: "Does awareness feel like your natural baseline?"
};

// Domain questions for weekly check-in
const weeklyDomainQuestions = {
  regulation: "**Regulation:** How easily could you calm yourself when stressed this week? (0 = couldn't at all, 5 = instantly)",
  awareness: "**Awareness:** How quickly did you notice when lost in thought? (0 = never noticed, 5 = immediately)",
  outlook: "**Outlook:** How open and positive did you feel toward life? (0 = closed/negative, 5 = open/positive)",
  attention: "**Attention:** How focused were you on what truly matters? (0 = scattered, 5 = laser-focused)"
};

// ============================================
// RITUAL INTRODUCTION TEMPLATES (Stage 1)
// ============================================

const ritualIntroTemplates = {
  // Step 1: Introduction to Ritual 1 (Resonance Breathing)
  ritual1Intro: `Perfect. Let's walk through each one.

---

**RITUAL 1: RESONANCE BREATHING - 5 MINS**

**What it does:**
Stimulates your vagus nerve, increases heart rate variability, raises RMSSD. Translation: trains your nervous system to shift from stress to calm coherence on command.

**When:** First thing after waking, before anything else.

**How:**
Sit up in bed or in a chair. Spine long, shoulders relaxed.
We're using a 4-second inhale, 6-second exhale rhythm — this hits your resonance frequency and maximizes vagal tone.

**Here is a guided video:** [Resonance Breathing Video](https://www.unbecoming.app/breathe)

When ready, you can also initiate this with the Daily Ritual tools on the right (desktop) or with the lightning icon (mobile).

That's ritual one. Make sense?`,

  // Step 2: Introduction to Ritual 2 (Awareness Rep)
  ritual2Intro: `Great.

---

**RITUAL 2: AWARENESS REP - 2 MINS**

**What it does:**
Strengthens meta-awareness circuitry (insula-PCC connectivity). Trains your brain to notice when you're lost in thought and return to present awareness.

**When:** Right after Resonance Breathing, while still seated.

**How:**
A decentering practice that notices whatever is here — sounds, sensations, thoughts — and helps separate you from those things.

You're not trying to change anything or "get somewhere." Just notice that you're noticing.

When you drift into thought (you will), notice that too, and return.

That's the practice. Recognizing you're the observer.

**This audio will guide you through the process when ready:** [Awareness Rep Audio](https://www.unbecoming.app/awareness)

You can also initiate this with the Daily Ritual tools on the right (desktop) or with the lightning icon (mobile).

Make sense?`,

  // Step 3: Wrap-up and set expectations
  wrapUp: `Great!

That's your **Stage 1 morning ritual**. 7 minutes. Every day.

**Same sequence:**
1. Wake up
2. Resonance Breathing - 5 mins
3. Awareness Rep - 2 mins
4. Then check in with me

Your toolbar will let you know if you have completed them for the day and your progress.

**Starting tomorrow morning** — do both rituals, then come back and let me know how it went.

See you then. Your nervous system is about to start learning.`
};

// Quick reply button configurations for each intro step
const introQuickReplies: { [key: number]: { text: string; buttonLabel: string } | null } = {
  0: { text: "Yes, let's learn the rituals", buttonLabel: "Yes, let's go" },
  1: { text: "Got it, makes sense. What's next?", buttonLabel: "Got it, next ritual" },
  2: { text: "Makes sense, I'm ready", buttonLabel: "Got it, I'm ready" },
  3: null, // No button after wrap-up - free text enabled
  4: null  // Intro complete
};

// Redirect messages to get user back on track after answering their question
function getIntroRedirectMessage(currentStep: number): string {
  switch (currentStep) {
    case 0:
      return `---

Now, back to your rituals. Ready to learn them?`;
    case 1:
      return `---

Back to the walkthrough. Make sense so far? Ready for the next ritual?`;
    case 2:
      return `---

Okay, back to wrapping up. Ready to get started?`;
    default:
      return '';
  }
}

// ============================================
// FIRST-TIME OPENING MESSAGE
// ============================================

async function getFirstTimeOpeningMessage(baselineData: BaselineData, userName: string): Promise<string> {
  const tier = getStatusTier(baselineData.rewiredIndex);
  const tierInterpretation = tierInterpretations[tier] || tierInterpretations['Operational'];
  const rituals = stageRituals[1] || stageRituals[1];
  
  return `Hey${userName ? `, ${userName}` : ''}. Welcome to the IOS.

Your baseline diagnostic is complete. Here's where you're starting:

**REwired Index: ${baselineData.rewiredIndex}/100** — *${tier}*

${tierInterpretation}

**Your Stage 1 morning rituals:**
${rituals.list}

**Total: ${rituals.total}**

Ready to learn each ritual?`;
}

// ============================================
// SAME-DAY RETURN MESSAGE
// ============================================

function getSameDayReturnMessage(
  baselineData: BaselineData,
  progressData: ProgressData | null,
  currentStage: number,
  practicesCompletedToday: string[]
): string {
  const adherence = progressData?.adherence_percentage || 0;
  const requiredPractices = stagePracticeIds[currentStage] || stagePracticeIds[1];
  const completedCount = practicesCompletedToday.filter(p => requiredPractices.includes(p)).length;
  const totalRequired = requiredPractices.length;
  
  if (completedCount >= totalRequired) {
    return `Welcome back. You've completed all your rituals for today — nice work.

**${completedCount}/${totalRequired}** practices done. That's consistency in action.

What else can I help you with?`;
  }
  
  const remaining = requiredPractices.filter(p => !practicesCompletedToday.includes(p));
  const remainingNames = remaining.map(id => {
    const nameMap: { [key: string]: string } = {
      'hrvb': 'Resonance Breathing',
      'awareness_rep': 'Awareness Rep',
      'somatic_flow': 'Somatic Flow',
      'micro_action': 'Morning Micro-Action',
      'flow_block': 'Flow Block',
      'co_regulation': 'Co-Regulation Practice',
      'nightly_debrief': 'Nightly Debrief'
    };
    return nameMap[id] || id;
  });
  
  return `Welcome back. You've done **${completedCount}/${totalRequired}** practices today.

Still remaining: ${remainingNames.join(', ')}.

Use the toolbar to start, or let me know how I can help.`;
}

// ============================================
// NEW-DAY MORNING MESSAGE
// ============================================

function getNewDayMorningMessage(
  baselineData: BaselineData,
  progressData: ProgressData | null,
  userName: string,
  currentStage: number
): string {
  const adherence = progressData?.adherence_percentage || 0;
  const consecutiveDays = progressData?.consecutive_days || 0;
  const rituals = stageRituals[currentStage] || stageRituals[1];
  
  let streakMessage = '';
  if (consecutiveDays > 0) {
    streakMessage = `**${consecutiveDays}-day streak** going. `;
  }
  
  let adherenceMessage = '';
  if (adherence > 0) {
    adherenceMessage = `Current adherence: **${adherence}%**. `;
  }
  
  return `Good morning${userName ? `, ${userName}` : ''}. New day, new training session.

${streakMessage}${adherenceMessage}

**Stage ${currentStage} Rituals:**
${rituals.list}

Ready to start? Use the toolbar or let me know what you need.`;
}

// ============================================
// STAGE INTRO MESSAGE
// ============================================

function getStageIntroMessage(stage: number, userName: string): string {
  const rituals = stageRituals[stage] || stageRituals[1];
  const stageName = getStageName(stage);
  
  return `${userName ? `${userName}, ` : ''}Welcome to **Stage ${stage}: ${stageName}**.

Your new daily rituals:
${rituals.list}

**Total: ${rituals.total}**

Ready to begin? Type "yes" or use the tool to get started.`;
}

// Determine which opening to use
function determineOpeningType(
  lastVisit: string | null,
  hasCompletedOnboarding: boolean
): 'first_time' | 'same_day' | 'new_day' {
  // Only show first_time if they truly haven't completed onboarding
  // (Don't require lastVisit - Stage 2+ users have completed onboarding)
  if (!hasCompletedOnboarding) {
    return 'first_time';
  }
  
  // If no lastVisit but completed onboarding, treat as new_day
  if (!lastVisit) {
    console.log('[ChatInterface] No lastVisit but onboarding completed - treating as new_day');
    return 'new_day';
  }
  
  const lastVisitDate = new Date(lastVisit);
  const today = new Date();
  
  // Check if same calendar day
  const isSameDay = 
    lastVisitDate.getFullYear() === today.getFullYear() &&
    lastVisitDate.getMonth() === today.getMonth() &&
    lastVisitDate.getDate() === today.getDate();
  
  return isSameDay ? 'same_day' : 'new_day';
}

// ============================================
// PRACTICE NAME MAPPING
// ============================================

const practiceIdToName: { [key: string]: string } = {
  'hrvb': 'Resonance Breathing',
  'resonance_breathing': 'Resonance Breathing',
  'awareness_rep': 'Awareness Rep',
  'somatic_flow': 'Somatic Flow',
  'micro_action': 'Morning Micro-Action',
  'flow_block': 'Flow Block',
  'co_regulation': 'Co-Regulation Practice',
  'nightly_debrief': 'Nightly Debrief'
};

// Normalize practice ID (handle variations)
function normalizePracticeId(id: string): string {
  const normalized = id.toLowerCase().replace(/[\s-]/g, '_');
  // Map common variations
  if (normalized === 'resonance_breathing' || normalized === 'hrvb_breathing') {
    return 'hrvb';
  }
  return normalized;
}

// ============================================
// FLOW BLOCK HELPER FUNCTIONS
// ============================================
// All Flow Block functions now imported from @/lib/flowBlockAPI

// ============================================
// MAIN COMPONENT
// ============================================

interface ChatInterfaceProps {
  user: any;
  baselineData: BaselineData;
}

type Message = {
  role: string;
  content: string;
};

export default function ChatInterface({ user, baselineData }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [openingType, setOpeningType] = useState<'first_time' | 'same_day' | 'new_day'>('first_time');
  
  // Track position in ritual introduction flow
  // 0 = waiting for "yes" to learn rituals
  // 1 = showed ritual 1, waiting for confirmation
  // 2 = showed ritual 2, waiting for confirmation
  // 3 = showed wrap-up, intro complete
  // 4+ = intro complete, free text mode
  const [introStep, setIntroStep] = useState<number>(0);
  
  // Track practices completed today (for template context)
  const [practicesCompletedToday, setPracticesCompletedToday] = useState<string[]>([]);
  
  // ============================================
  // UNLOCK FLOW STATE
  // ============================================
  // Track unlock flow: 'none' | 'eligible_shown' | 'confirmed' | 'intro_started'
  const [unlockFlowState, setUnlockFlowState] = useState<'none' | 'eligible_shown' | 'confirmed' | 'intro_started'>('none');
  const [pendingUnlockStage, setPendingUnlockStage] = useState<number | null>(null);
  const hasCheckedUnlock = useRef<boolean>(false);
  const hasCheckedWeeklyMilestone = useRef<boolean>(false);
  
  // ============================================
  // MICRO-ACTION SETUP STATE (100% API version)
  // ============================================
  const [microActionState, setMicroActionState] = useState<MicroActionState>(initialMicroActionState);
  const [awaitingMicroActionStart, setAwaitingMicroActionStart] = useState(false);
  const [awaitingSprintRenewal, setAwaitingSprintRenewal] = useState(false);
  
  // ============================================
  // FLOW BLOCK SETUP STATE (100% API version)
  // Using extended state that adds todaysBlock
  // ============================================
  const [flowBlockState, setFlowBlockState] = useState<ExtendedFlowBlockState>(initialExtendedFlowBlockState);
  const [awaitingFlowBlockStart, setAwaitingFlowBlockStart] = useState(false);
  
  // ============================================
  // WEEKLY CHECK-IN STATE
  // ============================================
  const [weeklyCheckInActive, setWeeklyCheckInActive] = useState(false);
  const [weeklyCheckInStep, setWeeklyCheckInStep] = useState(0);
  const [weeklyCheckInScores, setWeeklyCheckInScores] = useState<{
    regulation: number | null;
    awareness: number | null;
    outlook: number | null;
    attention: number | null;
    qualitative: number | null;
  }>({
    regulation: null,
    awareness: null,
    outlook: null,
    attention: null,
    qualitative: null
  });
  const hasCheckedWeeklyDue = useRef<boolean>(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasInitialized = useRef<boolean>(false);

  const isMobile = useIsMobile();
  const { progress, loading: progressLoading, error: progressError, refetchProgress, isRefreshing } = useUserProgress();

  // ============================================
  // ON-DEMAND TOOL MODALS
  // ============================================
  const { open: openDecentering, Modal: DecenteringModal } = useDecentering();
  const { open: openMetaReflection, Modal: MetaReflectionModal } = useMetaReflection();
  
  // Track if we've prompted for Sunday reflection
  const hasCheckedSundayReflection = useRef<boolean>(false);

  // Get user's name
  const getUserName = () => user?.user_metadata?.first_name || '';

  // Get current quick reply configuration
  const currentQuickReply = openingType === 'first_time' && introStep < 3 ? introQuickReplies[introStep] : null;

  // ============================================
  // BUILD TEMPLATE CONTEXT
  // ============================================
  
  const buildTemplateContext = useCallback((): TemplateContext => {
    const userName = user?.user_metadata?.first_name || '';
    
    // Type assertion for extended progress properties that may not be in the base type yet
    const extendedProgress = progress as any;
    
    // Calculate days in stage
    let daysInStage = 1;
    if (extendedProgress?.stageStartDate) {
      const startDate = new Date(extendedProgress.stageStartDate);
      const now = new Date();
      daysInStage = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }
    
    return {
      userName,
      currentStage: progress?.currentStage || 1,
      stageName: getStageName(progress?.currentStage || 1),
      adherence: extendedProgress?.adherencePercentage || 0,
      consecutiveDays: extendedProgress?.consecutiveDays || 0,
      daysInStage,
      rewiredIndex: baselineData.rewiredIndex,
      statusTier: getStatusTier(baselineData.rewiredIndex),
      regulationScore: baselineData.domainScores.regulation,
      awarenessScore: baselineData.domainScores.awareness,
      outlookScore: baselineData.domainScores.outlook,
      attentionScore: baselineData.domainScores.attention,
      regulationDelta: extendedProgress?.latestRegulationDelta || 0,
      awarenessDelta: extendedProgress?.latestAwarenessDelta || 0,
      outlookDelta: extendedProgress?.latestOutlookDelta || 0,
      attentionDelta: extendedProgress?.latestAttentionDelta || 0,
      avgDelta: extendedProgress?.latestAvgDelta || 0,
      currentIdentity: extendedProgress?.currentIdentity || '',
      microAction: extendedProgress?.microAction || '',
      identityDayInCycle: extendedProgress?.identitySprintStart 
        ? Math.floor((Date.now() - new Date(extendedProgress.identitySprintStart).getTime()) / (1000 * 60 * 60 * 24)) + 1
        : 0,
      identityDaysRemaining: extendedProgress?.identitySprintStart
        ? Math.max(0, 21 - Math.floor((Date.now() - new Date(extendedProgress.identitySprintStart).getTime()) / (1000 * 60 * 60 * 24)))
        : 21,
      isMobile,
      toolsReference: isMobile ? 'the lightning bolt icon' : 'the Daily Ritual tools on the right'
    };
  }, [user, baselineData, progress, isMobile]);
  
  // ============================================
  // BUILD SELECTION CONTEXT
  // ============================================
  
  const buildSelectionContext = useCallback((): SelectionContext => {
    // Type assertion for extended progress properties
    const extendedProgress = progress as any;
    
    let daysInStage = 1;
    if (extendedProgress?.stageStartDate) {
      const startDate = new Date(extendedProgress.stageStartDate);
      const now = new Date();
      daysInStage = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }
    
    return {
      currentStage: progress?.currentStage || 1,
      daysInStage,
      adherence: extendedProgress?.adherencePercentage || 0,
      consecutiveDays: extendedProgress?.consecutiveDays || 0,
      practicesCompletedToday,
      stageIntroCompleted: extendedProgress?.ritualIntroCompleted || introStep >= 4,
      hasIdentitySet: !!(extendedProgress?.currentIdentity),
      identityDayInCycle: extendedProgress?.identitySprintStart 
        ? Math.floor((Date.now() - new Date(extendedProgress.identitySprintStart).getTime()) / (1000 * 60 * 60 * 24)) + 1
        : undefined,
      flowBlockSetupCompleted: extendedProgress?.flowBlockSetupCompleted || flowBlockState.isComplete,
      toolsIntroduced: extendedProgress?.toolsIntroduced || [],
      weeklyCheckInDue: (() => {
  const lastCheckin = extendedProgress?.lastWeeklyCheckin;
  const now = new Date();
  const today = now.getDay(); // 0 = Sunday
  
  // If never done a check-in, due after 7 days in stage
  if (!lastCheckin) {
    return daysInStage >= 7;
  }
  
  const lastCheckinDate = new Date(lastCheckin);
  const daysSinceCheckin = Math.floor((now.getTime() - lastCheckinDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Due if 7+ days since last check-in
  if (daysSinceCheckin >= 7) {
    return true;
  }
  
  // Also due if it's Sunday and last check-in was before this week started
  if (today === 0) { // Sunday
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Go back to Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    return lastCheckinDate < startOfWeek;
  }
  
  return false;
})(),
      isMobile
    };
  }, [baselineData, progress, practicesCompletedToday, introStep, isMobile, flowBlockState.isComplete]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Refocus textarea after messages update (unless on mobile where keyboard behavior differs)
    if (!isMobile && textareaRef.current && !loading) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [messages, loading, isMobile]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Update practices completed today when progress changes
  useEffect(() => {
    const extendedProgress = progress as any;
    if (extendedProgress?.practicesCompletedToday) {
      setPracticesCompletedToday(extendedProgress.practicesCompletedToday);
    }
  }, [progress]);

  // Load Flow Block setup status from database
  useEffect(() => {
    const loadFlowBlockStatus = async () => {
      if (!user?.id) return;
      
      try {
        const supabase = createClient();
        const { data: config } = await supabase
          .from('flow_block_config')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();
        
        if (config) {
          devLog('[FlowBlock]', 'Loaded existing config:', config);
          setFlowBlockState(prev => ({
            ...prev,
            isComplete: true,
            extractedWeeklyMap: config.weekly_map || [],
            extractedPreferences: config.setup_preferences || {},
            extractedDomains: config.domains || [],
            focusType: config.focus_type || 'distributed',
            sprintStartDate: config.sprint_start_date,
            sprintNumber: config.sprint_number || 1
          }));
        }
      } catch (error) {
        devLog('[FlowBlock]', 'No existing config found (expected for new users)');
      }
    };
    
    loadFlowBlockStatus();
  }, [user?.id]);

  // Load Micro-Action setup status from database
  useEffect(() => {
    const loadMicroActionStatus = async () => {
      if (!user?.id) return;
      
      try {
        const supabase = createClient();
        const { data: sprint } = await supabase
          .from('identity_sprints')
          .select('*')
          .eq('user_id', user.id)
          .eq('completion_status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (sprint) {
          devLog('[MicroAction]', 'Loaded existing sprint:', sprint);
          setMicroActionState(prev => ({
            ...prev,
            isComplete: true,
            extractedIdentity: sprint.identity_statement,
            extractedAction: sprint.micro_action,
            sprintStartDate: sprint.start_date,
            sprintNumber: sprint.sprint_number || 1
          }));
        }
      } catch (error) {
        devLog('[MicroAction]', 'No existing sprint found (expected for new users)');
      }
    };
    
    loadMicroActionStatus();
  }, [user?.id]);

  // ============================================
  // CHECK FOR UNLOCK ELIGIBILITY
  // ============================================
  
  useEffect(() => {
    // Only check once, and only when we have progress data
    if (hasCheckedUnlock.current || !progress || progressLoading) return;
    
    const extendedProgress = progress as any;
    
    // Check if eligible for unlock
    if (extendedProgress?.unlockProgress?.isEligible && !extendedProgress?.unlockProgress?.alreadyUnlocked) {
      const nextStage = (progress.currentStage || 1) + 1;
      
      // Mark as checked so we don't show again
      hasCheckedUnlock.current = true;
      
      // Set up unlock flow state
      setPendingUnlockStage(nextStage);
      setUnlockFlowState('eligible_shown');
      
      // Show unlock message
      const unlockMessages: { [key: number]: string } = {
        2: `**Neural Priming stabilized.** Heart-mind coherence online.

You've hit the unlock criteria:
- ≥80% adherence over 14 consecutive days ✓
- ≥+0.3 average delta improvement ✓

You're ready to bring awareness into motion.

**Unlock Stage 2: Embodied Awareness?**`,
        3: `**Embodiment achieved.** The body is now connected awareness.

You've hit the unlock criteria:
- ≥80% adherence over 14 consecutive days ✓
- ≥+0.5 average delta improvement ✓

Time to act from coherence.

**Unlock Stage 3: Identity Mode?**`,
        4: `**Identity proof installed.** You now act from awareness, not toward it.

You've hit the unlock criteria:
- ≥80% adherence over 14 consecutive days ✓
- ≥+0.5 average delta improvement ✓

Ready to integrate high-level performance?

**Unlock Stage 4: Flow Mode?**`,
        5: `**Flow performance stabilized.** The mind is no longer the operator - it's the tool.

You've hit the unlock criteria:
- ≥80% adherence over 14 consecutive days ✓
- ≥+0.6 average delta improvement ✓

Ready to train relational coherence?

**Unlock Stage 5: Relational Coherence?**`,
        6: `**Relational coherence stabilized.** You are now connected.

You've hit the unlock criteria:
- ≥85% adherence over 14 consecutive days ✓
- ≥+0.7 average delta improvement ✓

Ready for full integration?

**Unlock Stage 6: Integration?**`
      };
      
      const message = unlockMessages[nextStage] || `Congratulations! You're eligible to unlock Stage ${nextStage}.`;
      
      // Add unlock message after a short delay to not interrupt other flows
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: message }]);
      }, 1000);
    }
  }, [progress, progressLoading]);

  // ============================================
  // CHECK FOR WEEKLY MILESTONE
  // ============================================
  
  useEffect(() => {
    // Only check once per session
    if (hasCheckedWeeklyMilestone.current || !progress || progressLoading) return;
    
    const extendedProgress = progress as any;
    const consecutiveDays = extendedProgress?.consecutiveDays || 0;
    
    // Check for 7-day milestone (only show once)
    if (consecutiveDays === 7 && !extendedProgress?.shownWeekMilestone) {
      hasCheckedWeeklyMilestone.current = true;
      
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `**7-Day Milestone!** 🎯

You've completed a full week of consistent practice. Your nervous system is starting to recognize the new pattern.

Keep going - the real rewiring happens in weeks 2-4.`
        }]);
      }, 2000);
    }
  }, [progress, progressLoading]);

  // ============================================
  // HANDLE UNLOCK CONFIRMATION
  // ============================================
  
  const handleUnlockConfirmation = async (confirmed: boolean) => {
    if (confirmed && pendingUnlockStage) {
      try {
        const supabase = createClient();
        
        // Update user's stage
        const { error } = await supabase
          .from('user_progress')
          .update({ 
            current_stage: pendingUnlockStage,
            stage_start_date: new Date().toISOString()
          })
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        // Refresh progress
        if (refetchProgress) {
          await refetchProgress();
        }
        
        setUnlockFlowState('confirmed');
        
        // Show confirmation message
        const stageName = getStageName(pendingUnlockStage);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `**Stage ${pendingUnlockStage}: ${stageName} unlocked!** 🔓

Your new practices are now available.`
        }]);
      } catch (err) {
        console.error('Failed to unlock stage:', err);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "There was an error unlocking the stage. Please try again." 
        }]);
        setUnlockFlowState('none');
        setPendingUnlockStage(null);
      }
    } else {
      // User declined unlock
      setUnlockFlowState('none');
      setPendingUnlockStage(null);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "No problem. Take your time. You can unlock when you're ready - just ask or wait for the next check." 
      }]);
    }
  };

  // ============================================
  // HANDLE START NEW STAGE INTRO
  // ============================================
  
  const handleStartNewStageIntro = async () => {
    if (!pendingUnlockStage) return;
    
    setUnlockFlowState('intro_started');
    
    // Get the stage introduction from templates
    const newStageTemplates = templateLibrary.stages[pendingUnlockStage as keyof typeof templateLibrary.stages];
    
    // Type-safe access (Stage 1 uses 'ritualIntro', other stages use 'intro')
    if (newStageTemplates && 'intro' in newStageTemplates && typeof newStageTemplates.intro === 'string') {
      const templateContext = buildTemplateContext();
      const processedMessage = processTemplate(newStageTemplates.intro, templateContext);
      setMessages(prev => [...prev, { role: 'assistant', content: processedMessage }]);
    }
    
    // Handle stage-specific setup flows
    if (pendingUnlockStage === 3) {
      // Stage 3: Go directly to Micro-Action setup (confirmation template already asked)
      startMicroActionSetup();
    } else if (pendingUnlockStage === 4) {
      // Stage 4: Trigger Flow Block setup
      setAwaitingFlowBlockStart(true);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `The new practice for Stage 4 is the **Flow Block** — a 60-90 minute deep work session that trains sustained attention.

Ready to set up your Flow Block system? This involves identifying your highest-leverage work and building a weekly schedule.`
      }]);
    }
    
    // Clear pending state
    setPendingUnlockStage(null);
  };

  // ============================================
  // MICRO-ACTION SETUP HANDLERS
  // ============================================
  
  // Start Micro-Action setup flow (100% API version)
  const startMicroActionSetup = useCallback(async () => {
    devLog('[MicroAction]', 'Starting setup flow (100% API)');
    
    // Initialize state
    setMicroActionState(prev => ({
      ...prev,
      isActive: true,
      conversationHistory: []
    }));
    
    // Show opening message
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: microActionOpeningMessage
    }]);
  }, []);

  // ============================================
  // PROCESS MICRO-ACTION RESPONSE (TWO-STAGE PATTERN)
  // ============================================
  const processMicroActionResponse = useCallback(async (userResponse: string) => {
    if (!microActionState.isActive) return;
    
    devLog('[MicroAction]', 'Processing response (API):', userResponse);
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userResponse }]);
    setLoading(true);
    
    // Get last assistant message to check for commitment question
    const lastAssistantMsg = microActionState.conversationHistory
      .filter(m => m.role === 'assistant')
      .pop()?.content || '';
    
    // Check if this is a commitment response
    const isCommitment = isIdentityCommitmentResponse(userResponse, lastAssistantMsg);
    devLog('[MicroAction]', 'Is commitment response:', isCommitment);
    
    // Build updated history with user message
    const updatedHistory = [
      ...microActionState.conversationHistory,
      { role: 'user' as const, content: userResponse }
    ];
    
    try {
      // STAGE 1: Get natural response from Claude
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: buildAPIMessages(microActionState.conversationHistory, userResponse),
          context: 'micro_action_setup'
        })
      });
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const data = await response.json();
      let assistantResponse = data.response || data.content || '';
      
      devLog('[MicroAction]', 'API response:', assistantResponse);
      
      // Clean and display response
      const cleanResponse = cleanResponseForDisplay(assistantResponse);
      setMessages(prev => [...prev, { role: 'assistant', content: cleanResponse }]);
      
      // Update conversation history with assistant response
      const fullHistory = [...updatedHistory, { role: 'assistant' as const, content: cleanResponse }];
      
      // STAGE 2: If commitment detected, run extraction
      if (isCommitment) {
        devLog('[MicroAction]', 'Commitment detected, running extraction...');
        
        const extractionMessages = buildMicroActionExtractionMessages(fullHistory);
        
        const extractionResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: extractionMessages,
            context: 'micro_action_extraction'
          })
        });
        
        if (extractionResponse.ok) {
          const extractionData = await extractionResponse.json();
          const extractionText = extractionData.response || extractionData.content || '';
          
          devLog('[MicroAction]', 'Extraction response:', extractionText);
          
          const extracted = parseMicroActionExtraction(extractionText);
          
          if (extracted) {
            devLog('[MicroAction]', 'Extraction successful:', extracted);
            
            // Save to database using the sprint database function
            const sprintResult = await startNewMicroActionSprint(
  user.id,
  extracted.identityStatement,
  extracted.microAction
);
            
            devLog('[MicroAction]', 'Sprint saved:', sprintResult);
            
            // Also update user_progress for backward compatibility
           await updateUserProgressIdentity(extracted.identityStatement, extracted.microAction);
            
            // Update state to complete
            setMicroActionState(prev => ({
              ...prev,
              conversationHistory: fullHistory,
              extractedIdentity: extracted.identityStatement,
extractedAction: extracted.microAction,
              isComplete: true,
              isActive: false,
              sprintStartDate: sprintResult.startDate,
              sprintNumber: sprintResult.sprintNumber
            }));
            
            // Refresh progress to update sidebar
            if (refetchProgress) {
              await refetchProgress();
            }
          } else {
            devLog('[MicroAction]', 'Extraction parsing failed, continuing conversation');
            setMicroActionState(prev => ({
              ...prev,
              conversationHistory: fullHistory
            }));
          }
        } else {
          devLog('[MicroAction]', 'Extraction API call failed');
          setMicroActionState(prev => ({
            ...prev,
            conversationHistory: fullHistory
          }));
        }
      } else {
        // Normal response - just update conversation history
        setMicroActionState(prev => ({
          ...prev,
          conversationHistory: fullHistory
        }));
      }
    } catch (error) {
      console.error('[MicroAction] API call failed:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I had trouble processing that. Let's continue - what were you saying?" 
      }]);
    }
    
    setLoading(false);
  }, [microActionState, user?.id, refetchProgress]);

  // ============================================
  // UPDATE USER PROGRESS IDENTITY (HELPER)
  // ============================================
  const updateUserProgressIdentity = async (identity: string, microAction: string) => {
    try {
      const supabase = createClient();
      await supabase
        .from('user_progress')
        .update({ 
          current_identity: identity,
          micro_action: microAction,
          identity_sprint_start: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      devLog('[MicroAction]', 'Updated user_progress with identity');
    } catch (error) {
      console.error('[MicroAction] Failed to update user_progress:', error);
    }
  };

  // Cancel Micro-Action setup (if user wants to exit)
  const cancelMicroActionSetup = useCallback(() => {
    devLog('[MicroAction]', 'Setup cancelled');
    setMicroActionState(initialMicroActionState);
  }, []);

  // ============================================
  // FLOW BLOCK SETUP HANDLERS
  // ============================================
  
  // Start Flow Block setup flow (100% API version)
  const startFlowBlockSetup = useCallback(async () => {
    devLog('[FlowBlock]', 'Starting setup flow (100% API)');
    
    // Initialize state with opening message in conversation history
    setFlowBlockState(prev => ({
      ...prev,
      isActive: true,
      conversationHistory: [
        { role: 'assistant', content: flowBlockOpeningMessage }
      ]
    }));
    
    // Show opening message
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: flowBlockOpeningMessage
    }]);
  }, []);

  // Process user response in Flow Block setup (100% API version)
  const processFlowBlockResponse = useCallback(async (userResponse: string) => {
    if (!flowBlockState.isActive) return;
    
    devLog('[FlowBlock]', 'Processing response (API):', userResponse);
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userResponse }]);
    setLoading(true);
    
    // Get last assistant message to check for commitment question
    const lastAssistantMsg = flowBlockState.conversationHistory
      .filter(m => m.role === 'assistant')
      .pop()?.content || '';
    
    // Check if this is a commitment response
    const isCommitment = isCommitmentResponse(userResponse, lastAssistantMsg);
    devLog('[FlowBlock]', 'Is commitment response:', isCommitment);
    
    // Build updated history with user message
    const updatedHistory = [
      ...flowBlockState.conversationHistory,
      { role: 'user' as const, content: userResponse }
    ];
    
    try {
      // STAGE 1: Get natural response from Claude
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: buildFlowBlockAPIMessages(flowBlockState.conversationHistory, userResponse),
          context: 'flow_block_setup'
        })
      });
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const data = await response.json();
      let assistantResponse = data.response || data.content || '';
      
      devLog('[FlowBlock]', 'API response:', assistantResponse);
      
      // Clean and display response
      const cleanResponse = cleanFlowBlockResponseForDisplay(assistantResponse);
      setMessages(prev => [...prev, { role: 'assistant', content: cleanResponse }]);
      
      // Update conversation history with assistant response
      const fullHistory = [...updatedHistory, { role: 'assistant' as const, content: cleanResponse }];
      
      // STAGE 2: If commitment detected, run extraction
      if (isCommitment) {
        devLog('[FlowBlock]', 'Commitment detected, running extraction...');
        
        const extractionMessages = buildFlowBlockExtractionMessages(fullHistory);
        
        const extractionResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: extractionMessages,
            context: 'flow_block_extraction'
          })
        });
        
        if (extractionResponse.ok) {
          const extractionData = await extractionResponse.json();
          const extractionText = extractionData.response || extractionData.content || '';
          
          devLog('[FlowBlock]', 'Extraction response:', extractionText);
          
          const extracted = parseFlowBlockExtraction(extractionText);
          
          if (extracted) {
            devLog('[FlowBlock]', 'Extraction successful:', extracted);
            
            // Save to database
            const sprintResult = await startNewFlowBlockSprint(
              user.id,
              extracted.weeklyMap,
              extracted.setupPreferences,
              extracted.domains,
              extracted.focusType
            );
            
            devLog('[FlowBlock]', 'Sprint saved:', sprintResult);
            
            // Update state to complete
            setFlowBlockState(prev => ({
              ...prev,
              conversationHistory: fullHistory,
              extractedDomains: extracted.domains,
              extractedWeeklyMap: extracted.weeklyMap,
              extractedPreferences: extracted.setupPreferences,
              focusType: extracted.focusType,
              isComplete: true,
              isActive: false,
              sprintStartDate: sprintResult.startDate,
              sprintNumber: sprintResult.sprintNumber
            }));
          } else {
            devLog('[FlowBlock]', 'Extraction parsing failed, continuing conversation');
            setFlowBlockState(prev => ({
              ...prev,
              conversationHistory: fullHistory
            }));
          }
        } else {
          devLog('[FlowBlock]', 'Extraction API call failed');
          setFlowBlockState(prev => ({
            ...prev,
            conversationHistory: fullHistory
          }));
        }
      } else {
        // Normal response - just update conversation history
        setFlowBlockState(prev => ({
          ...prev,
          conversationHistory: fullHistory
        }));
      }
    } catch (error) {
      console.error('[FlowBlock] API call failed:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I had trouble processing that. Let's continue - what were you saying?" 
      }]);
    }
    
    setLoading(false);
  }, [flowBlockState, user?.id]);

  // ============================================
  // WEEKLY CHECK-IN HANDLERS
  // ============================================
  
  const processWeeklyCheckInResponse = async (response: string) => {
    const rating = parseFloat(response);
    const currentStage = progress?.currentStage || 1;
    
    // Validate rating
    if (weeklyCheckInStep === 0) {
      // User confirmed they're ready to start
      const isReady = ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'ready', 'let\'s go', 'lets go', 'y'].some(
        word => response.toLowerCase().includes(word)
      );
      
      if (isReady) {
        setWeeklyCheckInStep(1);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: weeklyDomainQuestions.regulation
        }]);
      } else {
        setWeeklyCheckInActive(false);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "No problem. We can do the check-in later. Just say 'weekly check-in' when you're ready."
        }]);
      }
      return;
    }
    
    // Validate rating is a number between 0-5
    if (weeklyCheckInStep >= 1 && weeklyCheckInStep <= 5) {
      if (isNaN(rating) || rating < 0 || rating > 5) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "Please enter a number between 0 and 5."
        }]);
        return;
      }
    }
    
    switch (weeklyCheckInStep) {
      case 1: // Regulation
        setWeeklyCheckInScores(prev => ({ ...prev, regulation: rating }));
        setWeeklyCheckInStep(2);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: weeklyDomainQuestions.awareness
        }]);
        break;
        
      case 2: // Awareness
        setWeeklyCheckInScores(prev => ({ ...prev, awareness: rating }));
        setWeeklyCheckInStep(3);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: weeklyDomainQuestions.outlook
        }]);
        break;
        
      case 3: // Outlook
        setWeeklyCheckInScores(prev => ({ ...prev, outlook: rating }));
        setWeeklyCheckInStep(4);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: weeklyDomainQuestions.attention
        }]);
        break;
        
      case 4: // Attention
        setWeeklyCheckInScores(prev => ({ ...prev, attention: rating }));
        setWeeklyCheckInStep(5);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `**Stage-specific question:**\n\n${stageQualitativeQuestions[currentStage]} (0-5)`
        }]);
        break;
        
      case 5: // Qualitative
        const finalScores = { ...weeklyCheckInScores, qualitative: rating };
        await saveWeeklyCheckIn(finalScores);
        break;

        case 6: // All-at-once format (from auto-prompt)
        // Parse all 4 numbers from response like "4 3 4 5"
        const numbers = response.match(/\d+(\.\d+)?/g);
        if (!numbers || numbers.length < 4) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: "Please enter 4 numbers between 0-5, separated by spaces (e.g., '4 3 4 5')."
          }]);
          return;
        }
        
        const [reg, aware, out, att] = numbers.map(n => parseFloat(n));
        
        // Validate all are in range
        if ([reg, aware, out, att].some(n => n < 0 || n > 5)) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: "All numbers must be between 0 and 5. Please try again."
          }]);
          return;
        }
        
        // Save these scores
        const allAtOnceScores = {
          regulation: reg,
          awareness: aware,
          outlook: out,
          attention: att,
          qualitative: null // Skip qualitative for auto-prompt version
        };
        
        await saveWeeklyCheckIn(allAtOnceScores);
        break;
    }
  };
  
  // Save weekly check-in to database
  const saveWeeklyCheckIn = async (scores: typeof weeklyCheckInScores) => {
    try {
      const supabase = createClient();
      
      // Save to weekly_checkins table
      const { error: insertError } = await supabase
        .from('weekly_checkins')
        .insert({
          user_id: user.id,
          regulation_score: scores.regulation,
          awareness_score: scores.awareness,
          outlook_score: scores.outlook,
          attention_score: scores.attention,
          qualitative_score: scores.qualitative,
          stage: progress?.currentStage || 1
        });
      
      if (insertError) throw insertError;
      
      // Update last_weekly_checkin in user_progress
      await supabase
        .from('user_progress')
        .update({ last_weekly_checkin: new Date().toISOString() })
        .eq('user_id', user.id);
      
      // Calculate deltas from baseline
      const regulationDelta = (scores.regulation || 0) - baselineData.domainScores.regulation;
      const awarenessDelta = (scores.awareness || 0) - baselineData.domainScores.awareness;
      const outlookDelta = (scores.outlook || 0) - baselineData.domainScores.outlook;
      const attentionDelta = (scores.attention || 0) - baselineData.domainScores.attention;
      const avgDelta = (regulationDelta + awarenessDelta + outlookDelta + attentionDelta) / 4;
      
      // Calculate new REwired Index
      const avgScore = ((scores.regulation || 0) + (scores.awareness || 0) + (scores.outlook || 0) + (scores.attention || 0)) / 4;
      const newRewiredIndex = Math.round(avgScore * 20);
      
      // Show results
      const resultMessage = `**Weekly Check-In Complete!**

**Your Scores:**
- Regulation: ${scores.regulation}/5 (${regulationDelta >= 0 ? '+' : ''}${regulationDelta.toFixed(1)} from baseline)
- Awareness: ${scores.awareness}/5 (${awarenessDelta >= 0 ? '+' : ''}${awarenessDelta.toFixed(1)} from baseline)
- Outlook: ${scores.outlook}/5 (${outlookDelta >= 0 ? '+' : ''}${outlookDelta.toFixed(1)} from baseline)
- Attention: ${scores.attention}/5 (${attentionDelta >= 0 ? '+' : ''}${attentionDelta.toFixed(1)} from baseline)

**Average Delta: ${avgDelta >= 0 ? '+' : ''}${avgDelta.toFixed(2)}**
**Current REwired Index: ${newRewiredIndex}/100**

${avgDelta >= 0.3 ? '📈 Great progress! Keep the consistency going.' : avgDelta >= 0 ? '📊 Moving in the right direction. Stay consistent.' : '📉 Some regression this week. That\'s normal - focus on consistency.'}`;

      setMessages(prev => [...prev, { role: 'assistant', content: resultMessage }]);
      
      // Reset check-in state
      setWeeklyCheckInActive(false);
      setWeeklyCheckInStep(0);
      setWeeklyCheckInScores({
        regulation: null,
        awareness: null,
        outlook: null,
        attention: null,
        qualitative: null
      });
      
      // Refresh progress
      if (refetchProgress) {
        await refetchProgress();
      }
    } catch (error) {
      console.error('Failed to save weekly check-in:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "There was an error saving your check-in. Please try again."
      }]);
    }
  };

  // ============================================
  // INITIALIZE CHAT
  // ============================================

  useEffect(() => {
    if (hasInitialized.current) return;
    if (!user || progressLoading) return;
    
    hasInitialized.current = true;
    
    const initializeChat = async () => {
      try {
        const supabase = createClient();
        
        // Get user progress from database
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        // Get today's completed practices
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data: todayPractices } = await supabase
          .from('practice_logs')
          .select('practice_type')
          .eq('user_id', user.id)
          .gte('completed_at', today.toISOString());
        
        const completedToday = todayPractices?.map((p: { practice_type: string }) => p.practice_type) || [];
        setPracticesCompletedToday(completedToday);
        
        // Determine opening type
        const hasCompletedOnboarding = progressData?.ritual_intro_completed || (progressData?.current_stage && progressData.current_stage > 1);
        const type = determineOpeningType(progressData?.last_visit || null, hasCompletedOnboarding);
        setOpeningType(type);
        
        // If they've completed onboarding, set intro step to 4 (complete)
        if (hasCompletedOnboarding) {
          setIntroStep(4);
        }
        
        devLog('[ChatInterface]', 'Opening type:', type, 'hasCompletedOnboarding:', hasCompletedOnboarding);
        
        const userName = getUserName();
        const currentStage = progress?.currentStage || progressData?.current_stage || 1;
        
        // Apply same baseline correction
        const correctedBaselineData = {
          ...baselineData,
          rewiredIndex: baselineData.rewiredIndex > 0 ? baselineData.rewiredIndex : 45,
          domainScores: {
            regulation: baselineData.domainScores.regulation > 0 ? baselineData.domainScores.regulation : 2.5,
            awareness: baselineData.domainScores.awareness > 0 ? baselineData.domainScores.awareness : 2.0,
            outlook: baselineData.domainScores.outlook > 0 ? baselineData.domainScores.outlook : 2.5,
            attention: baselineData.domainScores.attention > 0 ? baselineData.domainScores.attention : 2.0
          }
        };
        
        let openingMessage: string;

// Check if weekly check-in is due (for returning users)
const extendedProgress = progress as any;
let daysInStage = 1;
if (extendedProgress?.stageStartDate) {
  const startDate = new Date(extendedProgress.stageStartDate);
  const now = new Date();
  daysInStage = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

const isWeeklyCheckInDue = (() => {
  // Don't show check-in for first-time users
  if (type === 'first_time') return false;
  
  const lastCheckin = progressData?.last_weekly_checkin;
  const now = new Date();
  const today = now.getDay(); // 0 = Sunday
  
  // If never done check-in, due after 7 days in stage
  if (!lastCheckin) {
    return daysInStage >= 7;
  }
  
  const lastCheckinDate = new Date(lastCheckin);
  const daysSinceCheckin = Math.floor((now.getTime() - lastCheckinDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Due if 7+ days since last check-in
  if (daysSinceCheckin >= 7) {
    return true;
  }
  
  // Also due if Sunday and last check-in before this week started
  if (today === 0) {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return lastCheckinDate < startOfWeek;
  }
  
  return false;
})();

if (isWeeklyCheckInDue) {
  // Weekly check-in takes priority - activate check-in flow
  openingMessage = `Hey${userName ? `, ${userName}` : ''}. It's time for your weekly check-in.

Rate each domain **0-5** based on this past week:

1. **Regulation:** How easily could you calm yourself when stressed? (0 = couldn't, 5 = instantly)
2. **Awareness:** How quickly did you notice when lost in thought? (0 = never, 5 = immediately)  
3. **Outlook:** How open and positive did you feel toward life? (0 = closed/negative, 5 = open/positive)
4. **Attention:** How focused were you on what truly matters? (0 = scattered, 5 = laser-focused)

Give me your four numbers (e.g., "4 3 4 5").`;
  
  // Activate the weekly check-in state
  setWeeklyCheckInActive(true);
  setWeeklyCheckInStep(6);
  
} else if (type === 'first_time') {
  openingMessage = await getFirstTimeOpeningMessage(correctedBaselineData, userName);
} else if (type === 'same_day') {
  openingMessage = getSameDayReturnMessage(correctedBaselineData, progressData, currentStage, completedToday);
} else {
  openingMessage = getNewDayMorningMessage(correctedBaselineData, progressData, userName, currentStage);
}

setMessages([{ role: 'assistant', content: openingMessage }]);
        
        // Update last visit timestamp
        await supabase
          .from('user_progress')
          .update({ last_visit: new Date().toISOString() })
          .eq('user_id', user.id);
        
      } catch (err) {
        console.error('Chat initialization error:', err);
        // Fallback opening
        setMessages([{ 
          role: 'assistant', 
          content: `Hey${getUserName() ? `, ${getUserName()}` : ''}. Welcome to the IOS. How can I help you today?` 
        }]);
      }
      
      setIsInitializing(false);
    };
    
    initializeChat();
  }, [user, baselineData, progressLoading, progress]);

  // ============================================
  // SUNDAY META-REFLECTION PROMPT
  // ============================================
  useEffect(() => {
    const checkSundayReflection = async () => {
      // Only check once, after initialization, on Sundays, for Stage 2+ users
      if (
        hasCheckedSundayReflection.current ||
        isInitializing ||
        !user?.id ||
        !progress ||
        progress.currentStage < 2 ||
        !isSunday() ||
        weeklyCheckInActive // Don't interrupt weekly check-in
      ) {
        return;
      }
      
      hasCheckedSundayReflection.current = true;
      
      try {
        const isDue = await isWeeklyReflectionDue(user.id);
        
        if (isDue) {
          // Add a prompt after a short delay so it doesn't conflict with opening message
          setTimeout(() => {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: `🪞 **Sunday Reflection**\n\nIt's your weekly Meta-Reflection day. This is your time to observe how awareness moved through your week — not to judge, but to learn.\n\nWould you like to begin your reflection now?`
            }]);
          }, 2000);
        }
      } catch (error) {
        console.error('[MetaReflection] Error checking Sunday reflection:', error);
      }
    };
    
    checkSundayReflection();
  }, [user?.id, progress, isInitializing, weeklyCheckInActive]);

  // ============================================
  // MESSAGE HANDLERS
  // ============================================
  
  const handleQuickReply = async (currentStep: number) => {
    const reply = introQuickReplies[currentStep];
    if (!reply) return;
    
    // Add user's quick reply to chat
    setMessages(prev => [...prev, { role: 'user', content: reply.text }]);
    setLoading(true);
    
    // Process based on current step
    let responseMessage: string;
    
    if (currentStep === 0) {
      // User clicked "Yes, let's go" - show Ritual 1
      responseMessage = ritualIntroTemplates.ritual1Intro;
      setIntroStep(1);
    } else if (currentStep === 1) {
      // User clicked "Got it, next ritual" - show Ritual 2
      responseMessage = ritualIntroTemplates.ritual2Intro;
      setIntroStep(2);
    } else if (currentStep === 2) {
      // User clicked "Got it, I'm ready" - show wrap-up
      responseMessage = ritualIntroTemplates.wrapUp;
      setIntroStep(3);
      
      // Mark ritual intro as completed in database
      try {
        const supabase = createClient();
        await supabase
          .from('user_progress')
          .update({ ritual_intro_completed: true })
          .eq('user_id', user.id);
      } catch (err) {
        console.error('Failed to mark intro complete:', err);
      }
    } else {
      responseMessage = "What would you like to explore?";
    }
    
    // Add AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: responseMessage }]);
      setLoading(false);
    }, 500);
  };

  // ============================================
  // PRACTICE CLICK HANDLER (from toolbar)
  // ============================================
  
  const handlePracticeClick = useCallback((practiceId: string) => {
    const normalizedId = normalizePracticeId(practiceId);
    const practiceName = practiceIdToName[normalizedId] || practiceId;
    
    devLog('[ChatInterface]', 'Practice clicked:', { practiceId, normalizedId, practiceName });
    
    // Add a message to chat about starting the practice
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: `Starting **${practiceName}**...\n\nThe practice window will open. Complete it and I'll log your progress.` 
    }]);
  }, []);

  // ============================================
  // TOOL CLICK HANDLER (from toolbar)
  // ============================================
  
  const handleToolClick = useCallback((toolId: string) => {
    devLog('[ChatInterface]', 'Tool clicked:', toolId);
    
    // Handle different tool types
    switch (toolId) {
      case 'micro_action':
        // Trigger Micro-Action setup or renewal
        if (microActionState.isComplete) {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `Your current identity is **${microActionState.extractedIdentity}**.\n\nYour daily micro-action: **${microActionState.extractedAction}**\n\nWould you like to start a new 21-day sprint with a different identity?`
          }]);
          setAwaitingSprintRenewal(true);
        } else {
          startMicroActionSetup();
        }
        break;
        
      case 'flow_block':
        // Trigger Flow Block setup
        if (flowBlockState.isComplete) {
          const todaysBlock = getTodaysBlock(flowBlockState.extractedWeeklyMap || []);
          if (todaysBlock) {
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: `**Today's Flow Block:**\n\n${todaysBlock.task} (${todaysBlock.domain})\n\n${todaysBlock.duration} minutes, ${todaysBlock.flowType} work.\n\nReady to start?`
            }]);
          } else {
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: "No Flow Block scheduled for today. Would you like to update your weekly schedule?"
            }]);
          }
        } else {
          startFlowBlockSetup();
        }
        break;

      // ON-DEMAND TOOLS (open as modals)
      case 'decentering':
        openDecentering(user?.id);
        break;

      case 'meta_reflection':
        openMetaReflection(user?.id, false); // false = on-demand, not weekly prompt
        break;
        
      default:
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Tool "${toolId}" is not yet implemented. Coming soon!` 
        }]);
    }
  }, [microActionState, flowBlockState, startMicroActionSetup, startFlowBlockSetup, openDecentering, openMetaReflection, user?.id]);

  // ============================================
  // PROGRESS UPDATE HANDLER (from toolbar)
  // ============================================
  
  const handleProgressUpdate = useCallback(() => {
    if (refetchProgress) {
      refetchProgress();
    }
  }, [refetchProgress]);

  // ============================================
  // PRACTICE COMPLETED HANDLER (from toolbar)
  // ============================================
  
  const handlePracticeCompleted = useCallback((practiceId: string) => {
    const normalizedId = normalizePracticeId(practiceId);
    const practiceName = practiceIdToName[normalizedId] || practiceId;
    
    devLog('[ChatInterface]', 'Practice completed callback:', { practiceId, normalizedId, practiceName });
    
    // Add completion message
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: `**${practiceName}** completed! ✓\n\nNice work. Your progress has been logged.` 
    }]);
    
    // Update local state
    setPracticesCompletedToday(prev => {
      if (!prev.includes(normalizedId)) {
        return [...prev, normalizedId];
      }
      return prev;
    });
    
    // Refresh progress from server
    if (refetchProgress) {
      refetchProgress();
    }
  }, [refetchProgress]);

  // ============================================
  // SEND MESSAGE
  // ============================================
  
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setInput('');
    
    // ============================================
    // SPECIAL FLOW HANDLERS (priority order)
    // ============================================
    
    // 1. Weekly Check-In Flow
    if (weeklyCheckInActive) {
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      setLoading(true);
      await processWeeklyCheckInResponse(userMessage);
      setLoading(false);
      return;
    }
    
    // 2. Micro-Action Setup Flow (100% API)
    if (microActionState.isActive) {
      await processMicroActionResponse(userMessage);
      return;
    }
    
    // 3. Flow Block Setup Flow (100% API)
    if (flowBlockState.isActive) {
      await processFlowBlockResponse(userMessage);
      return;
    }
    
    // 4. Awaiting Micro-Action Start confirmation
    if (awaitingMicroActionStart) {
      const isAffirmative = ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'ready', 'let\'s go', 'lets go', 'y'].some(
        word => userMessage.toLowerCase().includes(word)
      );
      
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      
      if (isAffirmative) {
        setAwaitingMicroActionStart(false);
        startMicroActionSetup();
      } else {
        setAwaitingMicroActionStart(false);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "No problem. You can set up your identity and micro-action anytime by clicking the ⚡ icon or saying 'set up my identity'." 
        }]);
      }
      return;
    }
    
    // 5. Awaiting Flow Block Start confirmation
    if (awaitingFlowBlockStart) {
      const isAffirmative = ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'ready', 'let\'s go', 'lets go', 'y'].some(
        word => userMessage.toLowerCase().includes(word)
      );
      
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      
      if (isAffirmative) {
        setAwaitingFlowBlockStart(false);
        startFlowBlockSetup();
      } else {
        setAwaitingFlowBlockStart(false);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "No problem. You can set up your Flow Blocks anytime by clicking the 🎯 icon or saying 'set up flow blocks'." 
        }]);
      }
      return;
    }
    
    // 6. Awaiting Sprint Renewal confirmation
    if (awaitingSprintRenewal) {
      const isAffirmative = ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'new', 'different', 'change'].some(
        word => userMessage.toLowerCase().includes(word)
      );
      
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      
      if (isAffirmative) {
        setAwaitingSprintRenewal(false);
        // Reset micro-action state for new sprint
        setMicroActionState(prev => ({
          ...prev,
          isComplete: false,
          sprintNumber: prev.sprintNumber + 1
        }));
        startMicroActionSetup();
      } else {
        setAwaitingSprintRenewal(false);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "Got it. Continue with your current identity. Remember: consistency is what rewires the nervous system." 
        }]);
      }
      return;
    }
    
    // ============================================
    // INTRO FLOW HANDLING
    // ============================================
    
    // During intro flow, handle both quick replies and free-text questions
    if (openingType === 'first_time' && introStep < 3) {
      // Add user message
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      setLoading(true);
      
      // Check if this is an affirmative response to continue intro
      const isAffirmative = ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'ready', 'got it', 'makes sense', 'let\'s go', 'lets go', 'next', 'continue'].some(
        word => userMessage.toLowerCase().includes(word)
      );
      
      if (isAffirmative) {
        // Progress through intro flow
        let responseMessage: string;
        
        if (introStep === 0) {
          responseMessage = ritualIntroTemplates.ritual1Intro;
          setIntroStep(1);
        } else if (introStep === 1) {
          responseMessage = ritualIntroTemplates.ritual2Intro;
          setIntroStep(2);
        } else if (introStep === 2) {
          responseMessage = ritualIntroTemplates.wrapUp;
          setIntroStep(3);
          
          // Mark ritual intro as completed
          try {
            const supabase = createClient();
            await supabase
              .from('user_progress')
              .update({ ritual_intro_completed: true })
              .eq('user_id', user.id);
          } catch (err) {
            console.error('Failed to mark intro complete:', err);
          }
        } else {
          responseMessage = "What would you like to explore?";
        }
        
        setTimeout(() => {
          setMessages(prev => [...prev, { role: 'assistant', content: responseMessage }]);
          setLoading(false);
        }, 500);
        return;
      }
      
      // Not affirmative - treat as a question, send to API, then redirect
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: messages.map(m => ({ role: m.role, content: m.content })).concat([{ role: 'user', content: userMessage }]),
            context: 'intro_question'
          })
        });
        
        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        const aiResponse = data.response || data.content || '';
        
        // Add the redirect message to bring them back to intro
        const redirectMessage = getIntroRedirectMessage(introStep);
        const fullResponse = aiResponse + '\n\n' + redirectMessage;
        
        setMessages(prev => [...prev, { role: 'assistant', content: fullResponse }]);
      } catch (err) {
        console.error('API error during intro:', err);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "Let me address that. " + getIntroRedirectMessage(introStep) 
        }]);
      }
      
      setLoading(false);
      return;
    }
    
    // ============================================
    // TRIGGER DETECTION
    // ============================================
    
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for weekly check-in trigger
    if (lowerMessage.includes('weekly check-in') || lowerMessage.includes('weekly checkin') || lowerMessage.includes('check in')) {
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      setWeeklyCheckInActive(true);
      setWeeklyCheckInStep(0);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `**Weekly Check-In**\n\nTime to assess your progress across the four domains. This takes about 2 minutes and helps track your transformation.\n\nReady to begin?`
      }]);
      return;
    }
    
    // Check for identity/micro-action setup trigger
    if (lowerMessage.includes('set up') && (lowerMessage.includes('identity') || lowerMessage.includes('micro'))) {
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      startMicroActionSetup();
      return;
    }
    
    // Check for flow block setup trigger
    if (lowerMessage.includes('set up') && lowerMessage.includes('flow')) {
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      startFlowBlockSetup();
      return;
    }

    // Check for meta-reflection trigger (explicit request or "yes" response to Sunday prompt)
    const lastAssistantMessage = messages.filter(m => m.role === 'assistant').slice(-1)[0]?.content || '';
    const isSundayPromptResponse = lastAssistantMessage.includes('Sunday Reflection') && 
      ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'ready', 'let\'s go', 'lets go', 'begin', 'start'].some(
        word => lowerMessage.includes(word)
      );
    
    if (lowerMessage.includes('meta-reflection') || lowerMessage.includes('meta reflection') || 
        lowerMessage.includes('reflect') && lowerMessage.includes('week') ||
        isSundayPromptResponse) {
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      openMetaReflection(user?.id, isSundayPromptResponse); // true if responding to Sunday prompt
      return;
    }
    
    // ============================================
    // NORMAL API FLOW
    // ============================================
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })).concat([{ role: 'user', content: userMessage }]),
          context: 'general'
        })
      });
      
      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      const aiResponse = data.response || data.content || "I'm having trouble responding right now. Please try again.";
      
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble connecting right now. Please try again in a moment." 
      }]);
    }
    
    setLoading(false);
  };

  // ============================================
  // RENDER
  // ============================================
  
  if (isInitializing || progressLoading) {
    return (
      <div className="flex h-screen bg-[#0a0a0a]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-400">Loading your IOS...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a]">
      {/* Left Sidebar - Dashboard (Desktop Only) */}
      {!isMobile && (
        <aside className="hidden md:flex flex-col w-80 border-r border-gray-800 bg-[#0a0a0a] overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* User Info Header */}
            <div className="border-b border-gray-800 pb-4">
              <h2 className="text-lg font-semibold text-white">
                {getUserName() ? `Hey, ${getUserName()}` : 'Welcome'}
              </h2>
              <p className="text-sm text-gray-400">
                Stage {progress?.currentStage || 1}: {getStageName(progress?.currentStage || 1)}
              </p>
            </div>

            {/* REwired Index */}
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">REwired Index</span>
                <span className={`text-2xl font-bold ${getStatusColor(baselineData.rewiredIndex)}`}>
                  {baselineData.rewiredIndex}
                </span>
              </div>
              <div className="w-full rounded-full h-2 bg-[#1a1a1a]">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    baselineData.rewiredIndex <= 20 ? 'bg-red-500' :
                    baselineData.rewiredIndex <= 40 ? 'bg-yellow-500' :
                    baselineData.rewiredIndex <= 60 ? 'bg-blue-500' :
                    baselineData.rewiredIndex <= 80 ? 'bg-green-500' :
                    'bg-purple-500'
                  }`}
                  style={{ width: `${baselineData.rewiredIndex}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{getStatusTier(baselineData.rewiredIndex)}</p>
            </div>

            {/* Domain Scores */}
            <div className="bg-gray-900 rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Domain Scores</h3>
              
              {/* Regulation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Regulation</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#22c55e]">
                      {(progress?.domainScores?.regulation ?? baselineData.domainScores.regulation).toFixed(1)}/5
                    </span>
                    {progress?.domainDeltas?.regulation !== undefined && progress.domainDeltas.regulation !== 0 && (
                      <span className={`text-xs font-medium ${progress.domainDeltas.regulation > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {progress.domainDeltas.regulation > 0 ? '↑' : '↓'}{Math.abs(progress.domainDeltas.regulation).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full rounded-full h-1.5 bg-[#1a1a1a]">
                  <div 
                    className="h-1.5 rounded-full bg-[#22c55e] transition-all"
                    style={{ width: `${((progress?.domainScores?.regulation ?? baselineData.domainScores.regulation) / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Awareness */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Awareness</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#3b82f6]">
                      {(progress?.domainScores?.awareness ?? baselineData.domainScores.awareness).toFixed(1)}/5
                    </span>
                    {progress?.domainDeltas?.awareness !== undefined && progress.domainDeltas.awareness !== 0 && (
                      <span className={`text-xs font-medium ${progress.domainDeltas.awareness > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {progress.domainDeltas.awareness > 0 ? '↑' : '↓'}{Math.abs(progress.domainDeltas.awareness).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full rounded-full h-1.5 bg-[#1a1a1a]">
                  <div 
                    className="h-1.5 rounded-full bg-[#3b82f6] transition-all"
                    style={{ width: `${((progress?.domainScores?.awareness ?? baselineData.domainScores.awareness) / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Outlook */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Outlook</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#f59e0b]">
                      {(progress?.domainScores?.outlook ?? baselineData.domainScores.outlook).toFixed(1)}/5
                    </span>
                    {progress?.domainDeltas?.outlook !== undefined && progress.domainDeltas.outlook !== 0 && (
                      <span className={`text-xs font-medium ${progress.domainDeltas.outlook > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {progress.domainDeltas.outlook > 0 ? '↑' : '↓'}{Math.abs(progress.domainDeltas.outlook).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full rounded-full h-1.5 bg-[#1a1a1a]">
                  <div 
                    className="h-1.5 rounded-full bg-[#f59e0b] transition-all"
                    style={{ width: `${((progress?.domainScores?.outlook ?? baselineData.domainScores.outlook) / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Attention */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Attention</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#a855f7]">
                      {(progress?.domainScores?.attention ?? baselineData.domainScores.attention).toFixed(1)}/5
                    </span>
                    {progress?.domainDeltas?.attention !== undefined && progress.domainDeltas.attention !== 0 && (
                      <span className={`text-xs font-medium ${progress.domainDeltas.attention > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {progress.domainDeltas.attention > 0 ? '↑' : '↓'}{Math.abs(progress.domainDeltas.attention).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full rounded-full h-1.5 bg-[#1a1a1a]">
                  <div 
                    className="h-1.5 rounded-full bg-[#a855f7] transition-all"
                    style={{ width: `${((progress?.domainScores?.attention ?? baselineData.domainScores.attention) / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Streak & Adherence */}
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-[#ff9e19]">{progress?.consecutiveDays || 0}</div>
                  <div className="text-xs text-gray-400">Day Streak</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{progress?.adherencePercentage || 0}%</div>
                  <div className="text-xs text-gray-400">Adherence</div>
                </div>
              </div>
            </div>

            {/* Current Identity (if set) */}
            {progress?.currentIdentity && (
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Current Identity</h3>
                <p className="text-sm text-[#ff9e19] font-medium">{progress.currentIdentity}</p>
                {(progress as any)?.microAction && (
  <p className="text-xs text-gray-400 mt-1">Daily proof: {(progress as any).microAction}</p>
)}
                {progress?.identitySprintDay && (
  <p className="text-xs text-gray-500 mt-2">
    Day {progress.identitySprintDay} of 21
  </p>
)}
              </div>
            )}

            {/* Unlock Progress */}
            {progress?.unlockProgress && !progress.unlockEligible && (
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3">
                  Stage {(progress.currentStage || 1) + 1} Unlock Progress
                </h3>
                
                {progress.unlockEligible ? (
                  <div className="text-center py-2">
                    <span className="text-green-400 font-semibold">✓ Eligible for Unlock!</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Adherence Progress */}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs w-14 ${progress.unlockProgress.adherenceMet ? 'text-green-400' : 'text-gray-400'}`}>
                        {progress.unlockProgress.adherenceMet ? '✓' : ''} Adherence
                      </span>
                      <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${progress.unlockProgress.adherenceMet ? 'bg-green-500' : 'bg-[#ff9e19]'}`}
                          style={{ width: progress.unlockProgress.adherenceMet ? '100%' : `${Math.min(100, (progress.adherencePercentage || 0) / progress.unlockProgress.requiredAdherence * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-10 text-right">
                        {progress.unlockProgress.adherenceMet ? '✓' : `${progress.adherencePercentage || 0}%`}
                      </span>
                    </div>
                    
                    {/* Days Progress */}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs w-14 ${progress.unlockProgress.daysMet ? 'text-green-400' : 'text-gray-400'}`}>
                        {progress.unlockProgress.daysMet ? '✓' : ''} Days
                      </span>
                      <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${progress.unlockProgress.daysMet ? 'bg-green-500' : 'bg-[#ff9e19]'}`}
                          style={{ width: progress.unlockProgress.daysMet ? '100%' : `${Math.min(100, (progress.consecutiveDays || 0) / progress.unlockProgress.requiredDays * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-10 text-right">
                        {progress.unlockProgress.daysMet ? '✓' : `${progress.consecutiveDays || 0}/${progress.unlockProgress.requiredDays}`}
                      </span>
                    </div>
                    
                    {/* Delta Progress */}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs w-14 ${progress.unlockProgress.deltaMet ? 'text-green-400' : 'text-gray-400'}`}>
                        {progress.unlockProgress.deltaMet ? '✓' : ''} Growth
                      </span>
                      <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${progress.unlockProgress.deltaMet ? 'bg-green-500' : 'bg-[#ff9e19]'}`}
                          style={{ width: progress.unlockProgress.deltaMet ? '100%' : `${Math.min(100, Math.max(0, ((progress.domainDeltas?.average || 0) / progress.unlockProgress.requiredDelta) * 100))}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-10 text-right">
                        {progress.unlockProgress.deltaMet ? '✓' : `+${(progress.domainDeltas?.average || 0).toFixed(1)}`}
                      </span>
                    </div>
                    
                    {/* Weekly Check-in */}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs w-14 ${progress.unlockProgress.qualitativeMet ? 'text-green-400' : 'text-gray-400'}`}>
                        {progress.unlockProgress.qualitativeMet ? '✓' : ''} Check-in
                      </span>
                      <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${progress.unlockProgress.qualitativeMet ? 'bg-green-500' : 'bg-gray-600'}`}
                          style={{ width: progress.unlockProgress.qualitativeMet ? '100%' : '0%' }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-10 text-right">
                        {progress.unlockProgress.qualitativeMet ? '✓' : '—'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-6 py-4 ${
                    msg.role === 'user'
                      ? 'bg-[#ff9e19] text-white'
                      : 'bg-gray-800 text-gray-100 border border-gray-700'
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
                <div className="bg-gray-800 border border-gray-700 rounded-2xl px-6 py-4">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            {/* Quick Reply Button for Intro Flow */}
            {currentQuickReply && !loading && (
              <div className="flex justify-center">
                <button
                  onClick={() => handleQuickReply(introStep)}
                  className="px-6 py-3 bg-[#ff9e19] hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors shadow-lg"
                >
                  {currentQuickReply.buttonLabel}
                </button>
              </div>
            )}
            
            {/* Unlock Confirmation Buttons */}
            {unlockFlowState === 'eligible_shown' && pendingUnlockStage && !loading && (
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleUnlockConfirmation(true)}
                  className="px-6 py-3 bg-[#ff9e19] hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors shadow-lg"
                >
                  Yes, unlock Stage {pendingUnlockStage}
                </button>
                <button
                  onClick={() => handleUnlockConfirmation(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors shadow-lg"
                >
                  Not yet
                </button>
              </div>
            )}
            
            {/* Start New Stage Intro Button */}
            {unlockFlowState === 'confirmed' && pendingUnlockStage && !loading && (
              <div className="flex justify-center">
                <button
                  onClick={handleStartNewStageIntro}
                  className="px-6 py-3 bg-[#ff9e19] hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors shadow-lg"
                >
                  Start Identity Installation
                </button>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-gray-800 bg-[#0a0a0a]">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <form onSubmit={sendMessage} className="flex gap-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
                placeholder={
                  microActionState.isActive 
                    ? "Type your response..."
                    : flowBlockState.isActive
                      ? "Type your response..."
                      : currentQuickReply 
                        ? "Or type a question..." 
                        : "Type your message..."
                }
                disabled={loading}
                rows={1}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff9e19] disabled:opacity-50 resize-none min-h-[52px] max-h-[200px]"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="px-6 py-3 bg-[#ff9e19] text-white rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                Send
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {microActionState.isActive
                ? "Setting up your identity - type your responses"
                : flowBlockState.isActive
                  ? "Setting up your Flow Blocks - type your responses"
                  : currentQuickReply 
                    ? "Click the button above or type your own response" 
                    : "Press Enter to send, Shift+Enter for new line"}
            </p>
          </div>
        </div>
      </div>

      {/* Tools Sidebar (Desktop) - Now with onPracticeCompleted */}
      {!isMobile && progress && (
        <ToolsSidebar
          progress={progress}
          userId={user?.id}
          onPracticeClick={handlePracticeClick}
          onToolClick={handleToolClick}
          onProgressUpdate={handleProgressUpdate}
          onPracticeCompleted={handlePracticeCompleted}
          isRefreshing={isRefreshing}
        />
      )}

      {/* Mobile Dashboard Drawer */}
      {isMobile && (
        <MobileDashboard
          userName={getUserName()}
          currentStage={progress?.currentStage || 1}
          rewiredIndex={baselineData.rewiredIndex}
          domainScores={baselineData.domainScores}
        />
      )}

      {/* Floating Action Button (Mobile) - Now with onPracticeCompleted */}
      {isMobile && progress && (
        <FloatingActionButton
          progress={progress}
          userId={user?.id}
          onPracticeClick={handlePracticeClick}
          onToolClick={handleToolClick}
          onProgressUpdate={handleProgressUpdate}
          onPracticeCompleted={handlePracticeCompleted}
          isRefreshing={isRefreshing}
        />
      )}

      {/* On-Demand Tool Modals */}
      <DecenteringModal />
      <MetaReflectionModal />
    </div>
  );
}
