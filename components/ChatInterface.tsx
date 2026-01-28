'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useIsMobile } from '@/app/hooks/useIsMobile';
import { useUserProgress } from '@/app/hooks/useUserProgress';
import { useSubscription, useSubscriptionActions } from '@/app/hooks/useSubscription';
import { stageTemplates } from '@/lib/templates/templateLibrary';
import ToolsSidebar from '@/components/ToolsSidebar';
import { PaywallModal } from '@/components/PaywallModal';
import FloatingActionButton from '@/components/FloatingActionButton';
import MobileDashboard from '@/components/MobileDashboard';
import { createClient } from '@/lib/supabase-client';
import Link from 'next/link';
import AwakenWithFiveCard from './AwakenWithFiveCard';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Zap, Heart } from 'lucide-react';
import StageAttributionModal, { StageId } from '@/components/StageAttributionModal';
import { useReorientation } from '@/components/ReorientationModal';
import ReorientationModal from '@/components/ReorientationModal';

// ============================================
// TEMPLATE SYSTEM IMPORTS
// ============================================
import {
  processTemplate,
  templateLibrary,
  type TemplateContext,
  type SelectionContext,
  // Voice library
  getMissedPracticeResponse,
  unlockCelebrations,
  declineTemplates,
  breakthroughTemplates,
  resistanceTemplates,
  // Consolidated templates (from templateLibrary)
  weeklyCheckInTemplates,
  introFlowTemplates,
  stage7ConversationTemplates,
  getIntroRedirectMessage as getIntroRedirectMessageFromLib,
  isAskingAboutStage7 as isAskingAboutStage7FromLib
} from '@/lib/templates';

// ============================================
// STAGE CONFIG IMPORTS
// ============================================
import {
  getStageName,
  getStatusTier,
  getStatusColor,
  getStagePracticeIds,
  normalizePracticeId,
  getPracticeName,
  TIER_INTERPRETATIONS
} from '@/app/config/stages';
import { 
  startNewMicroActionSprint, 
  getCurrentMicroActionSprint,
  loadActiveSprintsForUser,
  // Sprint renewal functions
  continueMicroActionSprint,
  completeMicroActionSprint,
  // FlowBlock sprint functions
  startNewFlowBlockSprint,
  getCurrentFlowBlockSprint,
  continueFlowBlockSprint,
  completeFlowBlockSprint
} from '@/lib/sprintDatabase';

// Sprint Renewal utilities
import {
  SprintRenewalState,
  initialSprintRenewalState,
  isIdentitySprintComplete,
  isFlowBlockSprintComplete,
  getIdentitySprintCompleteMessage,
  getFlowBlockSprintCompleteMessage,
  parseRenewalResponse,
  getIdentityContinueMessage,
  getFlowBlockContinueMessage,
  getIdentityEvolvePrompt,
  getFlowBlockEvolvePrompt,
  getIdentityPivotMessage,
  getFlowBlockPivotMessage,
  identityRenewalQuickReplies,
  flowBlockRenewalQuickReplies
} from '@/lib/sprintRenewal';

// Resistance Pattern Tracking
import {
  logExcuse,
  logMissedDays,
  logToolDecline,
  logDailySkips,
  categorizeExcuse,
  shouldSurfacePattern,
  checkPracticeResistance,
  type ResistancePattern
} from '@/lib/resistanceTracking';

// ============================================
// MICRO-ACTION SETUP IMPORTS (100% API version)
// ============================================
import {
  MicroActionState,
  initialMicroActionState,
  microActionSystemPrompt,
  microActionOpeningMessage,
  microActionReturningMessage,        // NEW
  parseCompletionMarker,
  cleanResponseForDisplay,
  buildAPIMessages,
  isIdentityCommitmentResponse,
  buildMicroActionExtractionMessages,
  parseMicroActionExtraction,
  parseMicroActionExtractionFull,     // NEW - includes execution_cue
  sprintRenewalMessage,               // NEW
  dailyMicroActionPrompt,             // NEW
  completionConfirmation              // NEW
} from '@/lib/microActionAPI';

// ============================================
// FLOW BLOCK SETUP IMPORTS (API-DRIVEN v2.4)
// ============================================
import {
  FlowBlockState,
  initialFlowBlockState,
  WeeklyMapEntry,
  SetupPreferences,
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
import { useReframe } from '@/components/ReframeModal';
import { useThoughtHygiene } from '@/components/ThoughtHygieneModal';
import { useCoRegulation } from '@/components/CoRegulationModal';
import { useNightlyDebrief } from '@/components/NightlyDebriefModal';

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
    // Links: [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#ff9e19] underline hover:text-[#ffb347]">$1</a>')
    // Clean up multiple consecutive line breaks
    .replace(/\n{3,}/g, '\n\n')
    // Line breaks
    .replace(/\n/g, '<br />');
}

// getStageName, getStatusTier, getStatusColor now imported from @/app/config/stages

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

// TIER_INTERPRETATIONS now imported from @/app/config/stages

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

// stagePracticeIds now replaced by getStagePracticeIds() from @/app/config/stages

// Weekly check-in constants now imported from templateLibrary:
// - weeklyCheckInTemplates.stageQuestions (replaces stageQualitativeQuestions)
// - weeklyCheckInTemplates.domainQuestions (replaces weeklyDomainQuestions)

// Backward-compatible aliases for weekly check-in
const stageQualitativeQuestions = weeklyCheckInTemplates.stageQuestions;
const weeklyDomainQuestions = weeklyCheckInTemplates.domainQuestions;

// ============================================
// STAGE 7 & INTRO TEMPLATES (from templateLibrary)
// ============================================

// These are now imported from templateLibrary and aliased for backward compatibility:
// - stage7ConversationTemplates (replaces stage7Templates)
// - introFlowTemplates.quickReplies (replaces introQuickReplies)
// - getIntroRedirectMessageFromLib (replaces getIntroRedirectMessage)
// - isAskingAboutStage7FromLib (replaces isAskingAboutStage7)

// Backward-compatible aliases
const stage7Templates = stage7ConversationTemplates;
const introQuickReplies = introFlowTemplates.quickReplies;
const getIntroRedirectMessage = getIntroRedirectMessageFromLib;
const isAskingAboutStage7 = isAskingAboutStage7FromLib;

// ============================================
// FIRST-TIME OPENING MESSAGE
// ============================================

async function getFirstTimeOpeningMessage(baselineData: BaselineData, userName: string): Promise<string> {
  const tier = getStatusTier(baselineData.rewiredIndex);
  const rituals = stageRituals[1] || stageRituals[1];
  
  // Get dynamic interpretation from API
  let tierInterpretation = TIER_INTERPRETATIONS[tier] || TIER_INTERPRETATIONS['Operational'];
  
  try {
    const response = await fetch('/api/ios/interpret-baseline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rewiredIndex: baselineData.rewiredIndex,
        tier,
        domainScores: baselineData.domainScores,
        userName
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      tierInterpretation = data.interpretation;
    }
  } catch (error) {
    console.error('Failed to get dynamic interpretation:', error);
    // Falls back to static tierInterpretation
  }
  
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
  const requiredPractices = getStagePracticeIds(currentStage);
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
// REGRESSION INTERVENTION MESSAGE
// ============================================

function getRegressionMessage(
  currentStage: number,
  adherence: number,
  avgDelta: number,
  reason: 'low_adherence' | 'negative_delta' | 'both',
  userName: string
): string {
  const stageName = getStageName(currentStage);
  const previousStageName = getStageName(currentStage - 1);
  
  let problemStatement = '';
  if (reason === 'both') {
    problemStatement = `Your adherence dropped to **${adherence.toFixed(0)}%** and your delta scores are **${avgDelta >= 0 ? '+' : ''}${avgDelta.toFixed(2)}** (declining).`;
  } else if (reason === 'low_adherence') {
    problemStatement = `Your adherence dropped to **${adherence.toFixed(0)}%** since unlocking Stage ${currentStage}.`;
  } else {
    problemStatement = `Your delta scores are **${avgDelta >= 0 ? '+' : ''}${avgDelta.toFixed(2)}** — you're not seeing the improvements we'd expect at this stage.`;
  }

  return `Hey${userName ? `, ${userName}` : ''}.

${problemStatement}

That's feedback. The system is telling us something.

**Two possibilities:**

1. **New stage overwhelm** — Stage ${currentStage} (${stageName}) added too much too fast
2. **Something else** — Life circumstances, schedule changes, or something blocking you

**Two options:**

1. **Regress to Stage ${currentStage - 1}** — Return to ${previousStageName} rituals, restabilize, then try again
2. **Troubleshoot** — Stay at Stage ${currentStage} and figure out what's breaking down

No shame in regressing. It's not failure — it's recalibration. The nervous system learns at its own pace.

What sounds right?`;
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
  if (!hasCompletedOnboarding) {
    return 'first_time';
  }
  
  if (!lastVisit) {
    return 'new_day';
  }
  
  const lastVisitDate = new Date(lastVisit);
  const today = new Date();
  
  const isSameDay = 
    lastVisitDate.getFullYear() === today.getFullYear() &&
    lastVisitDate.getMonth() === today.getMonth() &&
    lastVisitDate.getDate() === today.getDate();
  
  return isSameDay ? 'same_day' : 'new_day';
}

// ============================================
// DECLINE DETECTION & RESPONSE
// ============================================

function getDeclineResponse(
  avgDelta: number,
  previousAvgDelta: number,
  weeksDeclined: number,
  scores: { regulation: number; awareness: number; outlook: number; attention: number }
): string | null {
  // No decline
  if (avgDelta >= 0) return null;
  
  // Sustained decline (3+ weeks)
  if (weeksDeclined >= 3) {
    return declineTemplates.deltaDecline.sustained;
  }
  
  // Significant decline (more than -0.5)
  if (avgDelta < -0.5) {
    return declineTemplates.deltaDecline.significant
      .replace('{{avgDelta}}', avgDelta.toFixed(2))
      .replace('{{previousAvgDelta}}', previousAvgDelta.toFixed(2));
  }
  
  // Mild decline
  return declineTemplates.deltaDecline.mild
    .replace('{{regulationDelta}}', (scores.regulation || 0).toFixed(1))
    .replace('{{awarenessDelta}}', (scores.awareness || 0).toFixed(1))
    .replace('{{outlookDelta}}', (scores.outlook || 0).toFixed(1))
    .replace('{{attentionDelta}}', (scores.attention || 0).toFixed(1));
}

// ============================================
// BREAKTHROUGH PATTERN DETECTION
// ============================================

const breakthroughPatterns = {
  insight: [
    /i (just )?realized/i,
    /it (just )?hit me/i,
    /i (finally )?understand/i,
    /i (can )?see (now|it)/i,
    /something (clicked|shifted)/i,
    /i get it now/i,
    /i never (noticed|saw|realized)/i,
    /this is what you meant/i,
  ],
  emotionalShift: [
    /i feel (so )?(different|lighter|calmer|clearer|free)/i,
    /something (released|lifted|opened)/i,
    /i('m| am) (not|no longer) (anxious|stressed|worried)/i,
    /first time (in|i've)/i,
    /never felt (this|like this)/i,
    /weight (lifted|gone)/i,
  ],
  milestone: [
    /(\d+) (days?|weeks?) (straight|in a row|consecutive)/i,
    /haven't missed/i,
    /every (single )?(day|morning)/i,
    /streak/i,
  ],
};

function detectBreakthrough(message: string): { type: 'insight' | 'emotionalShift' | 'milestone' | null; confidence: number } {
  let highestConfidence = 0;
  let detectedType: 'insight' | 'emotionalShift' | 'milestone' | null = null;
  
  // Check insight patterns
  const insightMatches = breakthroughPatterns.insight.filter(p => p.test(message)).length;
  if (insightMatches > 0) {
    const confidence = Math.min(insightMatches * 0.4, 1);
    if (confidence > highestConfidence) {
      highestConfidence = confidence;
      detectedType = 'insight';
    }
  }
  
  // Check emotional shift patterns
  const emotionalMatches = breakthroughPatterns.emotionalShift.filter(p => p.test(message)).length;
  if (emotionalMatches > 0) {
    const confidence = Math.min(emotionalMatches * 0.4, 1);
    if (confidence > highestConfidence) {
      highestConfidence = confidence;
      detectedType = 'emotionalShift';
    }
  }
  
  // Check milestone patterns
  const milestoneMatches = breakthroughPatterns.milestone.filter(p => p.test(message)).length;
  if (milestoneMatches > 0) {
    const confidence = Math.min(milestoneMatches * 0.5, 1);
    if (confidence > highestConfidence) {
      highestConfidence = confidence;
      detectedType = 'milestone';
    }
  }
  
  // Only return if confidence is high enough
  return { type: highestConfidence >= 0.4 ? detectedType : null, confidence: highestConfidence };
}

function getBreakthroughResponse(type: 'insight' | 'emotionalShift' | 'milestone', userMessage: string): string {
  switch (type) {
    case 'insight':
      return breakthroughTemplates.insightAcknowledgment.standard
        .replace('{{userInsight}}', userMessage.slice(0, 100) + (userMessage.length > 100 ? '...' : ''));
    case 'emotionalShift':
      return breakthroughTemplates.emotionalShift.positive;
    case 'milestone':
      // Detect which milestone
      const weekMatch = userMessage.match(/(\d+)\s*weeks?/i);
      const dayMatch = userMessage.match(/(\d+)\s*days?/i);
      
      if (weekMatch && parseInt(weekMatch[1]) >= 3) {
        return breakthroughTemplates.milestone.twentyOneDays;
      } else if (dayMatch) {
        const days = parseInt(dayMatch[1]);
        if (days >= 21) return breakthroughTemplates.milestone.twentyOneDays;
        if (days >= 14) return breakthroughTemplates.milestone.twoWeeks;
        if (days >= 7) return breakthroughTemplates.milestone.firstWeek;
      }
      return breakthroughTemplates.milestone.firstWeek;
    default:
      return '';
  }
}

// ============================================
// RESISTANCE TEMPLATE MATCHING
// ============================================

function getResistanceTemplateMessage(pattern: { type: string; subType?: string; count?: number }): string {
  const { type, subType, count } = pattern;
  
  // Pattern surfacing (multiple occurrences)
  if (count && count >= 3) {
    if (type === 'excuse') {
      return resistanceTemplates.patternSurfacing.thirdTimeExcuse
        .replace('{{excuseCategory}}', subType || 'the same reason');
    }
    if (type === 'avoidance') {
      return resistanceTemplates.patternSurfacing.repeatedAvoidance
        .replace('{{practiceId}}', subType || 'certain practices')
        .replace('{{practiceName}}', subType || 'that practice');
    }
  }
  
  // Specific excuse types
  if (type === 'excuse' && subType) {
    const excuseTemplates = resistanceTemplates.excuses as Record<string, string>;
    if (excuseTemplates[subType]) {
      return excuseTemplates[subType];
    }
  }
  
  // Avoidance patterns
  if (type === 'avoidance' && subType) {
    const avoidanceTemplates = resistanceTemplates.avoidance as Record<string, string>;
    if (avoidanceTemplates[subType]) {
      return avoidanceTemplates[subType];
    }
  }
  
  // Skepticism patterns
  if (type === 'skepticism' && subType) {
    const skepticismTemplates = resistanceTemplates.skepticism as Record<string, string>;
    if (skepticismTemplates[subType]) {
      return skepticismTemplates[subType];
    }
  }
  
  // Default fallback
  return '';
}

// practiceIdToName and normalizePracticeId now imported from @/app/config/stages
// Use getPracticeName() instead of practiceIdToName[normalizedId]

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
  // ============================================
  // ALL useState DECLARATIONS (must be first, in consistent order)
  // ============================================
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [openingType, setOpeningType] = useState<'first_time' | 'same_day' | 'new_day'>('first_time');
  const [introStep, setIntroStep] = useState<number>(0);
  const [practicesCompletedToday, setPracticesCompletedToday] = useState<string[]>([]);
  const [unlockFlowState, setUnlockFlowState] = useState<'none' | 'eligible_shown' | 'confirmed' | 'intro_started'>('none');
  const [pendingUnlockStage, setPendingUnlockStage] = useState<number | null>(null);
  const [microActionState, setMicroActionState] = useState<MicroActionState>(initialMicroActionState);
  const microActionStateRef = useRef(microActionState);
  useEffect(() => {
    microActionStateRef.current = microActionState;
  }, [microActionState]);
  const [awaitingMicroActionStart, setAwaitingMicroActionStart] = useState(false);
  const [sprintRenewalState, setSprintRenewalState] = useState<SprintRenewalState>(initialSprintRenewalState);
  const [flowBlockState, setFlowBlockState] = useState<ExtendedFlowBlockState>(initialExtendedFlowBlockState);
  const [awaitingFlowBlockStart, setAwaitingFlowBlockStart] = useState(false);
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
  
  // Stage 7 Flow State
  const [stage7FlowState, setStage7FlowState] = useState<'none' | 'intro_shown' | 'explanation_shown' | 'question1_shown' | 'question2_shown' | 'complete'>('none');
  const [stage7OpenToProtocol, setStage7OpenToProtocol] = useState<boolean | null>(null);

  // Missed Days Intervention State
  const [missedDaysIntervention, setMissedDaysIntervention] = useState<{
    isActive: boolean;
    daysMissed: number;
  } | null>(null);

  // Regression Intervention State
  const [regressionIntervention, setRegressionIntervention] = useState<{
    isActive: boolean;
    currentStage: number;
    adherence: number;
    avgDelta: number;
    reason: 'low_adherence' | 'negative_delta' | 'both';
  } | null>(null);

  // System Recovery State (30+ days away)
  const [systemRecoveryIntervention, setSystemRecoveryIntervention] = useState<{
    isActive: boolean;
    daysAway: number;
    previousStage: number;
  } | null>(null);

  // Stage Attribution Modal State (show-once unlock modals)
  const [showAttributionModal, setShowAttributionModal] = useState(false);
  const [attributionStage, setAttributionStage] = useState<StageId | null>(null);

  // ============================================
  // ALL useRef DECLARATIONS (must be after useState, in consistent order)
  // ============================================
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasInitialized = useRef<boolean>(false);
  const hasCheckedUnlock = useRef<boolean>(false);
  const hasCheckedWeeklyMilestone = useRef<boolean>(false);
  const hasCheckedSprintCompletion = useRef<boolean>(false);
  const hasCheckedWeeklyDue = useRef<boolean>(false);
  const hasCheckedEveningDebrief = useRef<boolean>(false);
  const hasCheckedSundayReflection = useRef<boolean>(false);
  const hasCheckedStage7Eligibility = useRef<boolean>(false);
  const hasCheckedResistance = useRef<boolean>(false);
  const hasCheckedRegression = useRef<boolean>(false);

  // ============================================
  // HOOKS
  // ============================================
  const isMobile = useIsMobile();
  const { progress, loading: progressLoading, error: progressError, refetchProgress, isRefreshing } = useUserProgress();

  // On-demand tool modals
  const { open: openDecentering, Modal: DecenteringModal } = useDecentering();
  const { open: openMetaReflection, Modal: MetaReflectionModal } = useMetaReflection();
  const { open: openReframe, Modal: ReframeModal } = useReframe();
  const { open: openThoughtHygiene, Modal: ThoughtHygieneModal } = useThoughtHygiene();
  const { open: openCoRegulation, Modal: CoRegulationModal } = useCoRegulation();
const { open: openNightlyDebrief, Modal: NightlyDebriefModal } = useNightlyDebrief();

  // Subscription hooks for paywall
  const { isActive: hasActiveSubscription, loading: subscriptionLoading, refetch: refetchSubscription } = useSubscription();
  const { startCheckout } = useSubscriptionActions();
  const [showPaywall, setShowPaywall] = useState(false);

  // Reorientation modal (day 7, day 21, missed week, stage 4 unlock)
  const { isOpen: reorientationOpen, content: reorientationContent, dismiss: dismissReorientation } = useReorientation({
    userId: user?.id || null
  });
  
  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  const getUserName = () => user?.user_metadata?.first_name || '';
  const currentQuickReply = openingType === 'first_time' && introStep < 3 ? introQuickReplies[introStep] : null;

  // ============================================
  // BUILD TEMPLATE CONTEXT
  // ============================================
  
  const buildTemplateContext = useCallback((): TemplateContext => {
    const userName = user?.user_metadata?.first_name || '';
    const extendedProgress = progress as any;
    
    let daysInStage = 1;
    if (extendedProgress?.stageStartDate) {
      const startDate = new Date(extendedProgress.stageStartDate);
      const now = new Date();
      daysInStage = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }
    
    // Support both old and new field names
    const sprintStart = extendedProgress?.sprintStart ?? extendedProgress?.identitySprintStart;
    
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
      currentIdentity: extendedProgress?.coherenceStatement ?? extendedProgress?.currentIdentity ?? '',
      microAction: extendedProgress?.microAction || '',
      identityDayInCycle: sprintStart 
        ? Math.floor((Date.now() - new Date(sprintStart).getTime()) / (1000 * 60 * 60 * 24)) + 1
        : 0,
      identityDaysRemaining: sprintStart
        ? Math.max(0, 21 - Math.floor((Date.now() - new Date(sprintStart).getTime()) / (1000 * 60 * 60 * 24)))
        : 21,
      isMobile,
      toolsReference: isMobile ? 'the lightning bolt icon' : 'the Daily Ritual tools on the right',
      toolbarReference: isMobile ? 'the lightning bolt icon' : 'the Daily Ritual tools on the right'
    };
  }, [user, baselineData, progress, isMobile]);
  
  // ============================================
  // BUILD SELECTION CONTEXT
  // ============================================
  
  const buildSelectionContext = useCallback((): SelectionContext => {
    const extendedProgress = progress as any;
    
    let daysInStage = 1;
    if (extendedProgress?.stageStartDate) {
      const startDate = new Date(extendedProgress.stageStartDate);
      const now = new Date();
      daysInStage = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }
    
    // Support both old and new field names
    const sprintStart = extendedProgress?.sprintStart ?? extendedProgress?.identitySprintStart;
    const coherenceStatement = extendedProgress?.coherenceStatement ?? extendedProgress?.currentIdentity;
    
    return {
      currentStage: progress?.currentStage || 1,
      daysInStage,
      adherence: extendedProgress?.adherencePercentage || 0,
      consecutiveDays: extendedProgress?.consecutiveDays || 0,
      practicesCompletedToday,
      stageIntroCompleted: extendedProgress?.ritualIntroCompleted || introStep >= 4,
      hasIdentitySet: !!coherenceStatement,
      identityDayInCycle: sprintStart 
        ? Math.floor((Date.now() - new Date(sprintStart).getTime()) / (1000 * 60 * 60 * 24)) + 1
        : undefined,
      flowBlockSetupCompleted: extendedProgress?.flowBlockSetupCompleted || flowBlockState.isComplete,
      toolsIntroduced: extendedProgress?.toolsIntroduced || [],
      weeklyCheckInDue: (() => {
        const lastCheckin = extendedProgress?.lastWeeklyCheckin;
        const now = new Date();
        const today = now.getDay();
        
        if (!lastCheckin) {
          return daysInStage >= 7;
        }
        
        const lastCheckinDate = new Date(lastCheckin);
        const daysSinceCheckin = Math.floor((now.getTime() - lastCheckinDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceCheckin >= 7) {
          return true;
        }
        
        if (today === 0) {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          return lastCheckinDate < startOfWeek;
        }
        
        return false;
      })(),
      isMobile
    };
  }, [baselineData, progress, practicesCompletedToday, introStep, isMobile, flowBlockState.isComplete]);

  // ============================================
  // TYPEWRITER EFFECT FOR TEMPLATE MESSAGES
  // ============================================
  const streamTemplateMessage = useCallback(async (
    message: string, 
    onComplete?: () => void
  ): Promise<void> => {
    setIsStreaming(true);
    setStreamingMessage('');
    
    // Split into words for natural feel (character-by-character is too slow)
    const words = message.split(' ');
    let currentText = '';
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i === 0 ? '' : ' ') + words[i];
      setStreamingMessage(currentText);
      
      // Variable delay: 15-40ms per word for natural rhythm
      const word = words[i];
      const hasPunctuation = /[.!?,;:]$/.test(word);
      const delay = hasPunctuation ? 40 + Math.random() * 30 : 15 + Math.random() * 25;
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    // Finalize: move streaming message to permanent messages array
    setMessages(prev => [...prev, { role: 'assistant', content: message }]);
    setStreamingMessage('');
    setIsStreaming(false);
    
    if (onComplete) onComplete();
  }, []);

  // ============================================
  // POST ASSISTANT MESSAGE (with streaming option)
  // ============================================
  const postAssistantMessage = useCallback(async (
    message: string, 
    options?: { 
      stream?: boolean;
      onComplete?: () => void;
    }
  ): Promise<void> => {
    const shouldStream = options?.stream ?? true;
    
    if (shouldStream && !loading && !isStreaming) {
      await streamTemplateMessage(message, options?.onComplete);
    } else {
      setMessages(prev => [...prev, { role: 'assistant', content: message }]);
      if (options?.onComplete) options.onComplete();
    }
  }, [loading, isStreaming, streamTemplateMessage]);
  
  // ============================================
  // EFFECTS - Scroll and Textarea
  // ============================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (!isMobile && textareaRef.current && !loading) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [messages, loading, isMobile, streamingMessage]);

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

  // ============================================
  // EFFECT - Load Flow Block Status
  // ============================================

  useEffect(() => {
    const loadFlowBlockStatus = async () => {
      if (!user?.id) return;
      
      try {
        const supabase = createClient();
        const { data: config } = await supabase
          .from('flow_block_sprints')
          .select('*')
          .eq('user_id', user.id)
          .eq('completion_status', 'active')
          .maybeSingle();
        
        if (config) {
  setFlowBlockState(prev => ({
    ...prev,
    isComplete: true,
    extractedWeeklyMap: config.weekly_map || [],
    extractedPreferences: config.preferences || {},
    extractedDomains: config.domains || [],
    focusType: config.focus_type || 'distributed',
    sprintStartDate: config.start_date,
    sprintNumber: config.sprint_number || 1
  }));
}
      } catch (error) {
        devLog('[FlowBlock]', 'No existing config found (expected for new users)');
      }
    };
    
    loadFlowBlockStatus();
  }, [user?.id]);

  // ============================================
  // EFFECT - Load Micro-Action Status
  // ============================================

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
            extractedIdentity: sprint.coherence_statement,
            extractedAction: sprint.action,
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
  // EFFECT - Check for Completed Sprints (Day 22+)
  // ============================================

  useEffect(() => {
    if (hasCheckedSprintCompletion.current || !user?.id || !progress || progressLoading) return;
    
    const extendedProgress = progress as any;
    
    // Support both old and new field names for backwards compatibility
    const sprintDay = extendedProgress?.sprintDay ?? extendedProgress?.identitySprintDay;
    const currentCoherence = extendedProgress?.coherenceStatement ?? extendedProgress?.currentIdentity;
    const currentMicroAction = extendedProgress?.microAction;
    
    if (isIdentitySprintComplete(sprintDay) && currentCoherence) {
      hasCheckedSprintCompletion.current = true;
      
      devLog('[SprintRenewal]', 'Aligned action sprint complete, Day:', sprintDay);
      
      setSprintRenewalState({
        isActive: true,
        renewalType: 'identity',
        selectedOption: null,
        completedSprintInfo: {
          type: 'identity',
          sprintNumber: extendedProgress?.sprintNumber ?? extendedProgress?.identitySprintNumber ?? 1,
          identity: currentCoherence,
          microAction: currentMicroAction
        },
        awaitingEvolutionInput: false
      });
      
      setTimeout(async () => {
  const message = getIdentitySprintCompleteMessage(
    currentCoherence,
    currentMicroAction || 'your daily proof',
    extendedProgress?.sprintNumber ?? extendedProgress?.identitySprintNumber ?? 1
  );
  await postAssistantMessage(message);
}, 1500);
      
      return;
    }
    
    const flowBlockSprintDay = extendedProgress?.flowBlockSprintDay;
    const hasFlowBlockConfig = extendedProgress?.hasFlowBlockConfig;
    
    if (isFlowBlockSprintComplete(flowBlockSprintDay) && hasFlowBlockConfig) {
      hasCheckedSprintCompletion.current = true;
      
      devLog('[SprintRenewal]', 'Flow Block sprint complete, Day:', flowBlockSprintDay);
      
      const loadFlowBlockDetails = async () => {
        const sprint = await getCurrentFlowBlockSprint(user.id);
        
        setSprintRenewalState({
          isActive: true,
          renewalType: 'flow_block',
          selectedOption: null,
          completedSprintInfo: {
            type: 'flow_block',
            sprintNumber: sprint?.sprint_number || 1,
            weeklyMap: sprint?.weekly_map,
            domains: sprint?.domains || [],
            focusType: sprint?.focus_type
          },
          awaitingEvolutionInput: false
        });
        
        setTimeout(async () => {
  const message = getFlowBlockSprintCompleteMessage(
    sprint?.domains || [],
    sprint?.sprint_number || 1
  );
  await postAssistantMessage(message);
}, 1500);
      };
      
      loadFlowBlockDetails();
    }
  }, [user?.id, progress, progressLoading]);

  // ============================================
  // EFFECT - Check for Unlock Eligibility (Stages 2-6)
  // ============================================
  
  useEffect(() => {
    if (hasCheckedUnlock.current || !progress || progressLoading) return;
    if (sprintRenewalState.isActive || weeklyCheckInActive) return;
    
    if (progress.unlockEligible) {
      const nextStage = (progress.currentStage || 1) + 1;
      
      // Don't auto-notify for Stage 7 (requires manual application)
      if (nextStage > 6) return;
      
      hasCheckedUnlock.current = true;
      
      setPendingUnlockStage(nextStage);
      setUnlockFlowState('eligible_shown');
      
const unlockMessages: { [key: number]: string } = {
  2: processTemplate(unlockCelebrations.stage2.achievement, {
    adherence: Math.round(progress?.adherencePercentage || 80),
    consecutiveDays: progress?.consecutiveDays || 14,
    avgDelta: 0.30
  }),
  3: processTemplate(unlockCelebrations.stage3.achievement, {
    adherence: Math.round(progress?.adherencePercentage || 80),
    consecutiveDays: progress?.consecutiveDays || 14,
    avgDelta: 0.50
  }),
  4: processTemplate(unlockCelebrations.stage4.achievement, {
    adherence: Math.round(progress?.adherencePercentage || 80),
    consecutiveDays: progress?.consecutiveDays || 14,
    avgDelta: 0.50
  }),
  5: processTemplate(unlockCelebrations.stage5.achievement, {
    adherence: Math.round(progress?.adherencePercentage || 80),
    consecutiveDays: progress?.consecutiveDays || 14,
    avgDelta: 0.60
  }),
  6: processTemplate(unlockCelebrations.stage6.achievement, {
    adherence: Math.round(progress?.adherencePercentage || 80),
    consecutiveDays: progress?.consecutiveDays || 14,
    avgDelta: 0.70
  })
};
      
      const message = unlockMessages[nextStage] || `🔓 **Congratulations!** You're eligible to unlock Stage ${nextStage}.`;
      
  setTimeout(async () => {
        await postAssistantMessage(message);
      }, 1500);
    }
  }, [progress, progressLoading, sprintRenewalState.isActive, weeklyCheckInActive]);

  // ============================================
  // EFFECT - Check for Weekly Milestone
  // ============================================
  
  useEffect(() => {
    if (hasCheckedWeeklyMilestone.current || !progress || progressLoading) return;
    
    const extendedProgress = progress as any;
    const consecutiveDays = extendedProgress?.consecutiveDays || 0;
    
    if (consecutiveDays === 7 && !extendedProgress?.shownWeekMilestone) {
      hasCheckedWeeklyMilestone.current = true;
      
      setTimeout(async () => {
        await postAssistantMessage(`**7-Day Milestone!** 🎯

You've completed a full week of consistent practice. Your nervous system is starting to recognize the new pattern.

Keep going - the real rewiring happens in weeks 2-4.`);
      }, 2000);
    }
  }, [progress, progressLoading]);

  // ============================================
  // EFFECT - Check for Evening Nightly Debrief (Stage 6+)
  // ============================================
  
  useEffect(() => {
    if (hasCheckedEveningDebrief.current || !progress || progressLoading) return;
    if (progress.currentStage < 6) return;
    
    const currentHour = new Date().getHours();
    if (currentHour < 18) return;
    
   // CORRECT (searching array):
const debriefStatus = progress.dailyPractices?.find(p => p.id === 'nightly_debrief');
    if (debriefStatus?.completed) return;
    
    if (sprintRenewalState.isActive || weeklyCheckInActive || unlockFlowState !== 'none') return;
    
    hasCheckedEveningDebrief.current = true;
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `**Evening check-in** 🌙

It's getting late and you haven't done your Nightly Debrief yet. 

This 2-minute practice helps encode today's learning before sleep. Want to run it now?`
      }]);
    }, 2500);
  }, [progress, progressLoading, sprintRenewalState.isActive, weeklyCheckInActive, unlockFlowState]);

  // ============================================
  // EFFECT - Check for Stage 7 Eligibility (Auto-Notification)
  // ============================================
  
  useEffect(() => {
    if (hasCheckedStage7Eligibility.current || !progress || progressLoading) return;
    
    if (progress.currentStage !== 6 || !progress.unlockEligible) return;
    
    if (
      sprintRenewalState.isActive || 
      weeklyCheckInActive || 
      unlockFlowState !== 'none' ||
      microActionState.isActive ||
      flowBlockState.isActive ||
      stage7FlowState !== 'none'
    ) return;
    
    hasCheckedStage7Eligibility.current = true;
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `🔓 **Stage 7 Available**

You've been practicing Stage 6 consistently for over 14 days. The system is fully installed.

There's one more stage — **Stage 7: Accelerated Expansion** — but it's fundamentally different from everything before it.

When you're ready to learn more, click the "Unlock Stage 7?" button in your dashboard, or just ask me about it.`
      }]);
    }, 2500);
    
  }, [progress, progressLoading, sprintRenewalState.isActive, weeklyCheckInActive, unlockFlowState, microActionState.isActive, flowBlockState.isActive, stage7FlowState]);

  // ============================================
  // HANDLE UNLOCK CONFIRMATION
  // ============================================
  
  const handleUnlockConfirmation = async (confirmed: boolean) => {
    if (confirmed && pendingUnlockStage) {
      // Check if subscription is required (Stage 2+) and user doesn't have one
      if (pendingUnlockStage >= 2 && !hasActiveSubscription) {
        setShowPaywall(true);
        return;
      }
      
      try {
        const supabase = createClient();
        
        const { error } = await supabase
          .from('user_progress')
          .update({ 
            current_stage: pendingUnlockStage,
            stage_start_date: new Date().toISOString()
          })
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        if (refetchProgress) {
          await refetchProgress();
        }
        
        // Check if we need to show attribution modal first (show-once logic)
        const attrFlagKey = `stage_${pendingUnlockStage}_attribution_seen` as keyof typeof progress;
        const alreadySeen = progress?.[attrFlagKey] === true;
        
        if (!alreadySeen && pendingUnlockStage >= 1 && pendingUnlockStage <= 6) {
          // Show attribution modal first
          setAttributionStage(pendingUnlockStage as StageId);
          setShowAttributionModal(true);
          // Don't proceed yet - wait for modal continue
          return;
        }
        
        // If already seen, continue with normal flow
        setUnlockFlowState('confirmed');
        
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
      setUnlockFlowState('none');
      setPendingUnlockStage(null);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "No problem. Take your time. You can unlock when you're ready - just ask or wait for the next check." 
      }]);
    }
  };

  // ============================================
  // HANDLE ATTRIBUTION MODAL CONTINUE (show-once logic)
  // ============================================
  
  const handleAttributionContinue = async () => {
    if (!attributionStage || !user) return;
    
    // Mark as seen in database
    try {
      const supabase = createClient();
      const flagKey = `stage_${attributionStage}_attribution_seen`;
      
      await supabase
        .from('user_progress')
        .update({ [flagKey]: true })
        .eq('user_id', user.id);
      
      // Update local progress state if available
      if (refetchProgress) {
        await refetchProgress();
      }
    } catch (err) {
      console.error('Failed to save attribution seen flag:', err);
      // Continue anyway - not critical
    }
    
    // Close modal
    setShowAttributionModal(false);
    
    // Now show the confirmation message and proceed
    const stageName = getStageName(attributionStage);
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: `**Stage ${attributionStage}: ${stageName} unlocked!** 🔓

Your new practices are now available.`
    }]);
    
    setUnlockFlowState('confirmed');
    setAttributionStage(null);
  };

  // ============================================
  // PAYWALL UPGRADE HANDLER
  // ============================================
  
  type PlanType = 'quarterly' | 'biannual' | 'annual' | 'quarterly_coaching' | 'biannual_coaching' | 'annual_coaching';
  
  const handleUpgrade = async (plan: PlanType) => {
    try {
      await startCheckout(plan);
      // User will be redirected to Stripe
    } catch (err) {
      console.error('[Upgrade] Error:', err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "There was an error starting the checkout. Please try again." 
      }]);
    }
  };

  // Handle post-payment redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const upgradeStatus = urlParams.get('upgrade');
    
    if (upgradeStatus === 'success') {
      // Clear the URL parameter
      window.history.replaceState({}, '', window.location.pathname);
      
      // Refetch subscription status
      refetchSubscription().then(() => {
        // Show success message
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `**Welcome to the full IOS System!** 🎉

Your subscription is now active. You have full access to all stages and practices.

Ready to continue your transformation?`
        }]);
        
        // If there was a pending unlock, retry it
        if (pendingUnlockStage && pendingUnlockStage >= 2) {
          handleUnlockConfirmation(true);
        }
      });
    } else if (upgradeStatus === 'canceled') {
      window.history.replaceState({}, '', window.location.pathname);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "No problem - you can upgrade whenever you're ready. Stage 1 practices are still available." 
      }]);
    }
  }, []);

  // ============================================
  // HANDLE START NEW STAGE INTRO
  // ============================================
  
  const handleStartNewStageIntro = async () => {
    if (!pendingUnlockStage) return;
    
    setUnlockFlowState('intro_started');
    
    // Use the unlock.confirmation template which includes BOTH practice intro AND tool intro
    const stageTemplate = stageTemplates[pendingUnlockStage as keyof typeof stageTemplates];
    
    if (stageTemplate?.unlock?.confirmation) {
      const templateContext = buildTemplateContext();
      const processedMessage = processTemplate(stageTemplate.unlock.confirmation, templateContext);
      await postAssistantMessage(processedMessage);
    }
    
    // Trigger special setup flows after showing the confirmation message
    if (pendingUnlockStage === 3) {
      // Stage 3: Start micro action setup after a brief delay
      setTimeout(() => {
        startMicroActionSetup();
      }, 1000);
    } else if (pendingUnlockStage === 4) {
      // Stage 4: Set flag for flow block setup
      setAwaitingFlowBlockStart(true);
    }
    // Stages 2, 5, 6 don't need special setup flows - just the confirmation message
    
    setPendingUnlockStage(null);
  };

  // ============================================
  // STAGE 7 FLOW HANDLERS
  // ============================================
  
  const startStage7Introduction = useCallback(() => {
    setStage7FlowState('intro_shown');
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: stage7Templates.intro
    }]);
  }, []);

  const processStage7Response = useCallback((userMessage: string): boolean => {
    const lowerMessage = userMessage.toLowerCase();
    
    switch (stage7FlowState) {
      case 'intro_shown': {
        const wantsToLearn = ['yes', 'learn', 'tell me', 'more', 'stage 7', 'interested', 'about'].some(
          word => lowerMessage.includes(word)
        );
        const wantsToContinue = ['no', 'continue', 'stage 6', 'stay', 'not now', 'later', 'deepen'].some(
          word => lowerMessage.includes(word)
        );
        
        if (wantsToLearn) {
          setStage7FlowState('explanation_shown');
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: stage7Templates.explanation
          }]);
          setTimeout(() => {
            setStage7FlowState('question1_shown');
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: stage7Templates.question1
            }]);
          }, 1500);
          return true;
        } else if (wantsToContinue) {
          setStage7FlowState('complete');
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: stage7Templates.stage6Continuation
          }]);
          return true;
        }
        return false;
      }
      
      case 'question1_shown': {
        const isOpen = ['yes', 'open', 'interested', 'ready', 'absolutely', 'definitely', 'yeah', 'yep', 'sure'].some(
          word => lowerMessage.includes(word)
        );
        const notOpen = ['no', 'not', 'pass', 'skip'].some(
          word => lowerMessage.includes(word)
        );
        
        if (isOpen) {
          setStage7OpenToProtocol(true);
          setStage7FlowState('question2_shown');
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: stage7Templates.question2
          }]);
          return true;
        } else if (notOpen) {
          setStage7OpenToProtocol(false);
          setStage7FlowState('complete');
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: stage7Templates.notOpenRoute
          }]);
          return true;
        }
        return false;
      }
      
      case 'question2_shown': {
        if (userMessage.trim().length > 10) {
          setStage7FlowState('complete');
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: stage7Templates.applicationRoute
          }]);
          return true;
        } else {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: "Take a moment to reflect. Why does this feel like the right time in your life?"
          }]);
          return true;
        }
      }
      
      default:
        return false;
    }
  }, [stage7FlowState]);

  const handleStage7QuickReply = useCallback((action: string) => {
    switch (action) {
      case 'learn_more':
        setMessages(prev => [...prev, { role: 'user', content: 'Tell me about Stage 7' }]);
        processStage7Response('tell me more about stage 7');
        break;
      case 'continue_stage6':
        setMessages(prev => [...prev, { role: 'user', content: "I'll continue with Stage 6" }]);
        processStage7Response('continue stage 6');
        break;
      case 'yes_open':
        setMessages(prev => [...prev, { role: 'user', content: "Yes, I'm open to this" }]);
        processStage7Response('yes open');
        break;
      case 'no_not_open':
        setMessages(prev => [...prev, { role: 'user', content: 'No, not for me right now' }]);
        processStage7Response('no');
        break;
      case 'apply':
        window.open(stage7Templates.applicationUrl, '_blank');
        break;
    }
  }, [processStage7Response]);

  // ============================================
  // REGRESSION RESPONSE HANDLER
  // ============================================

  const handleRegressionResponse = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check if they want to regress
    const wantsRegress = ['regress', 'go back', 'previous stage', 'stage ' + ((regressionIntervention?.currentStage || 2) - 1), 'option 1', '1'].some(
      word => lowerMessage.includes(word)
    );
    
    // Check if they want to troubleshoot
    const wantsTroubleshoot = ['troubleshoot', 'stay', 'figure out', 'option 2', '2', 'what\'s breaking', 'keep going'].some(
      word => lowerMessage.includes(word)
    );
    
    if (wantsRegress && regressionIntervention) {
      const previousStage = regressionIntervention.currentStage - 1;
      const previousStageName = getStageName(previousStage);
      const previousRituals = stageRituals[previousStage];
      
      try {
        const supabase = createClient();
        await supabase
          .from('user_progress')
          .update({ 
            current_stage: previousStage,
            stage_start_date: new Date().toISOString(),
            consecutive_days: 0
          })
          .eq('user_id', user.id);
        
        setRegressionIntervention(null);
        
        if (refetchProgress) await refetchProgress();
        
        return `**Regressed to Stage ${previousStage}: ${previousStageName}.**

No shame in this — you're recalibrating, not failing. The nervous system learns at its own pace.

Your rituals are now:
${previousRituals?.list || '1. Resonance Breathing - 5 mins\n2. Awareness Rep - 2 mins'}

We'll restabilize here, then try Stage ${regressionIntervention.currentStage} again when you're ready.

Take a breath. Start fresh today.`;
      } catch (error) {
        console.error('Failed to regress stage:', error);
        return "There was an error updating your stage. Let's troubleshoot what's going on instead.";
      }
    }
    
    if (wantsTroubleshoot && regressionIntervention) {
      setRegressionIntervention(null);
      
      return `Alright. Let's troubleshoot.

A few common patterns when a stage stalls:

1. **Time pressure** — The new practices don't fit your schedule
2. **Complexity overwhelm** — Too many moving parts to track
3. **Motivation fade** — Initial enthusiasm wore off
4. **Life interference** — Something external disrupted your rhythm
5. **Practice resistance** — One specific practice feels like a chore

Which of these resonates? Or is it something else entirely?`;
    }
    
    // If unclear response, prompt for clarity
    const currentStage = regressionIntervention?.currentStage || 2;
    return `I want to make sure I understand. Would you like to:

1. **Regress** — Go back to Stage ${currentStage - 1} and restabilize
2. **Troubleshoot** — Stay at Stage ${currentStage} and figure out what's not working

Which one?`;
  };

  // ============================================
  // SYSTEM RECOVERY RESPONSE HANDLER (30+ Days)
  // ============================================

  const handleSystemRecoveryResponse = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check if they want full reset
    const wantsFullReset = ['full reset', 'stage 1', 'clean slate', 'start over', 'from scratch', 'option 1', 'full'].some(
      word => lowerMessage.includes(word)
    );
    
    // Check if they want soft reset
    const wantsSoftReset = ['soft reset', 'soft', 'stay at', 'keep stage', 'reset streak', 'option 2', 'pick up'].some(
      word => lowerMessage.includes(word)
    );
    
    // Check if they want to continue as-is
    const wantsContinue = ['continue', 'as-is', 'as is', 'jump back', 'option 3', 'practicing on my own', 'right back'].some(
      word => lowerMessage.includes(word)
    );
    
    if (wantsFullReset) {
      try {
        const supabase = createClient();
        
        // Reset to Stage 1, clear all progress
        await supabase
          .from('user_progress')
          .update({ 
            current_stage: 1,
            stage_start_date: new Date().toISOString(),
            consecutive_days: 0,
            adherence_percentage: 0,
            baseline_completed: false,
            ritual_intro_completed: false,
            last_visit: new Date().toISOString()
          })
          .eq('user_id', user.id);
        
        // Clear baseline data to trigger re-assessment
        await supabase
          .from('baseline_assessments')
          .delete()
          .eq('user_id', user.id);
        
        setSystemRecoveryIntervention(null);
        
        if (refetchProgress) await refetchProgress();
        
        return `**Full Reset initiated.**

We're starting fresh — Stage 1, new baseline, clean slate.

The IOS will reinstall faster this time. Your nervous system has the blueprint; we're just reactivating it.

**First step:** Let's run your baseline diagnostic again. This takes ~8 minutes and measures where you're starting now.

Ready to begin the assessment?`;
      } catch (error) {
        console.error('Failed to perform full reset:', error);
        return "There was an error resetting your progress. Let's try a soft reset instead.";
      }
    }
    
    if (wantsSoftReset) {
      const previousStage = systemRecoveryIntervention?.previousStage || 1;
      const rituals = stageRituals[previousStage];
      
      try {
        const supabase = createClient();
        
        // Keep stage, reset streak and adherence
        await supabase
          .from('user_progress')
          .update({ 
            stage_start_date: new Date().toISOString(),
            consecutive_days: 0,
            adherence_percentage: 0,
            last_visit: new Date().toISOString()
          })
          .eq('user_id', user.id);
        
        setSystemRecoveryIntervention(null);
        
        if (refetchProgress) await refetchProgress();
        
        return `**Soft Reset complete.**

You're staying at **Stage ${previousStage}: ${getStageName(previousStage)}**. Streak and adherence reset to zero.

Quick check-in: On a scale of 0-5, how would you rate each domain RIGHT NOW?

1. **Regulation** — How calm do you feel? (0 = very stressed, 5 = deeply calm)
2. **Awareness** — How present are you? (0 = scattered, 5 = fully here)
3. **Outlook** — How positive do you feel? (0 = negative, 5 = optimistic)
4. **Attention** — How focused is your mind? (0 = racing, 5 = clear)

Give me your four numbers to recalibrate, then we'll get you back on track.`;
      } catch (error) {
        console.error('Failed to perform soft reset:', error);
        return "There was an error. Let's just continue from here.";
      }
    }
    
    if (wantsContinue) {
      const previousStage = systemRecoveryIntervention?.previousStage || 1;
      const rituals = stageRituals[previousStage];
      
      try {
        const supabase = createClient();
        
        // Just update last_visit
        await supabase
          .from('user_progress')
          .update({ 
            last_visit: new Date().toISOString()
          })
          .eq('user_id', user.id);
        
        setSystemRecoveryIntervention(null);
        
        return `Alright. Jumping right back in.

**Stage ${previousStage}: ${getStageName(previousStage)}**

Today's rituals:
${rituals?.list || '1. Resonance Breathing - 5 mins\n2. Awareness Rep - 2 mins'}

I trust you know where you are. Let's see if the pathways are still active.

Start when ready.`;
      } catch (error) {
        console.error('Failed to continue:', error);
        return "There was an error. Let's just continue.";
      }
    }
    
    // If unclear response, prompt for clarity
    return `I want to make sure I understand. Which option works for you?

1. **Full Reset** — Back to Stage 1, new baseline assessment
2. **Soft Reset** — Keep your stage, reset streak, quick check-in
3. **Continue As-Is** — Jump right back into today's rituals

Which one?`;
  };

  // ============================================
  // MICRO-ACTION SETUP HANDLERS
  // ============================================
  
  const startMicroActionSetup = useCallback(async () => {
    devLog('[MicroAction]', 'Starting setup flow (100% API)');
    
    setMicroActionState(prev => ({
      ...prev,
      isActive: true,
      conversationHistory: []
    }));
    
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: microActionOpeningMessage
    }]);
  }, []);

  const processMicroActionResponse = useCallback(async (userResponse: string) => {

    devLog('[MicroAction]', 'Processing response (API):', userResponse);
    
    setMessages(prev => [...prev, { role: 'user', content: userResponse }]);
    setLoading(true);
    
    const lastAssistantMsg = microActionState.conversationHistory
      .filter(m => m.role === 'assistant')
      .pop()?.content || '';
    
    const isCommitment = isIdentityCommitmentResponse(userResponse, lastAssistantMsg);
    devLog('[MicroAction]', 'Is commitment response:', isCommitment);
    
    const updatedHistory = [
      ...microActionState.conversationHistory,
      { role: 'user' as const, content: userResponse }
    ];
    
    try {
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
      
      const cleanResponse = cleanResponseForDisplay(assistantResponse);
      setMessages(prev => [...prev, { role: 'assistant', content: cleanResponse }]);
      
      const fullHistory = [...updatedHistory, { role: 'assistant' as const, content: cleanResponse }];
      
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
          
          const extracted = parseMicroActionExtractionFull(extractionText);
          
          if (extracted) {
            devLog('[MicroAction]', 'Extraction successful:', extracted);
            
            const sprintResult = await startNewMicroActionSprint(
              user.id,
              extracted.identityStatement,
              extracted.microAction,
              extracted.executionCue || undefined
            );
            
            devLog('[MicroAction]', 'Sprint saved:', sprintResult);
            
            await updateUserProgressCoherence(extracted.identityStatement, extracted.microAction);
            
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
            
            if (refetchProgress) {
              await refetchProgress();
            }
          } else {
            // ✅ FIX: Extraction parsing failed - reset state
            devLog('[MicroAction]', 'Extraction parsing failed, resetting state');
            setMicroActionState(initialMicroActionState);
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: "I had trouble saving your coherence practice. Let's try setting it up again - just say 'set up aligned action' when you're ready." 
            }]);
          }
        } else {
          // ✅ FIX: Extraction API failed - reset state
          devLog('[MicroAction]', 'Extraction API call failed, resetting state');
          setMicroActionState(initialMicroActionState);
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: "I had trouble saving your coherence practice. Let's try setting it up again - just say 'set up aligned action' when you're ready." 
          }]);
        }
      } else {
        // Not a commitment - continue conversation normally
        setMicroActionState(prev => ({
          ...prev,
          conversationHistory: fullHistory
        }));
      }
    } catch (error) {
      // ✅ FIX: Any error - reset state completely
      console.error('[MicroAction] API call failed:', error);
      setMicroActionState(initialMicroActionState);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I had trouble processing that. Let's start fresh - say 'set up aligned action' when you're ready to try again." 
      }]);
    }
    
    setLoading(false);
  }, [microActionState, user?.id, refetchProgress]);

const updateUserProgressCoherence = async (coherenceStatement: string, microAction: string) => {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('user_progress')
      .update({ 
        current_identity: coherenceStatement,
        micro_action: microAction,
        identity_sprint_start: new Date().toISOString().split('T')[0]
      })
      .eq('user_id', user.id);
    
    if (error) {
      console.error('[MicroAction] Supabase error:', error);
    } else {
      devLog('[MicroAction]', 'Updated user_progress with coherence statement');
    }
  } catch (error) {
    console.error('[MicroAction] Failed to update user_progress:', error);
  }
};

  const cancelMicroActionSetup = useCallback(() => {
    devLog('[MicroAction]', 'Setup cancelled');
    setMicroActionState(initialMicroActionState);
  }, []);

  // ============================================
  // SPRINT RENEWAL HANDLERS
  // ============================================
  
  const handleIdentityRenewalOption = async (option: 'continue' | 'evolve' | 'pivot') => {
    const info = sprintRenewalState.completedSprintInfo;
    
    if (option === 'continue') {
      const result = await continueMicroActionSprint(user.id);
      
      if (result.success) {
        const message = getIdentityContinueMessage(
          info?.identity || 'your coherence statement',
          info?.microAction || 'your micro-action'
        );
        
        setTimeout(async () => {
          await postAssistantMessage(message);
        }, 300);
        
        setSprintRenewalState(initialSprintRenewalState);
        
        if (refetchProgress) await refetchProgress();
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "There was an error continuing your sprint. Let's try again."
        }]);
      }
      
    } else if (option === 'evolve') {
      const message = getIdentityEvolvePrompt(info?.identity || 'your previous coherence statement');
      
      setTimeout(async () => {
        await postAssistantMessage(message);
      }, 300);
      
      setSprintRenewalState(prev => ({
        ...prev,
        selectedOption: 'evolve',
        awaitingEvolutionInput: true
      }));
      
    } else if (option === 'pivot') {
      const message = getIdentityPivotMessage();
      
      setTimeout(async () => {
        await postAssistantMessage(message);
      }, 300);
      
      await completeMicroActionSprint(user.id);
      
      setSprintRenewalState(initialSprintRenewalState);
      
      setMicroActionState(prev => ({
        ...prev,
        isActive: true,
        conversationHistory: []
      }));
    }
  };

  const handleFlowBlockRenewalOption = async (option: 'continue' | 'evolve' | 'pivot') => {
    
    if (option === 'continue') {
      const result = await continueFlowBlockSprint(user.id);
      
      if (result.success) {
        const message = getFlowBlockContinueMessage();
        
        setTimeout(async () => {
          await postAssistantMessage(message);
        }, 300);
        
        setSprintRenewalState(initialSprintRenewalState);
        
        if (refetchProgress) await refetchProgress();
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "There was an error continuing your sprint. Let's try again."
        }]);
      }
      
    } else if (option === 'evolve') {
      const message = getFlowBlockEvolvePrompt();
      
      setTimeout(async () => {
        await postAssistantMessage(message);
      }, 300);
      
      setSprintRenewalState(prev => ({
        ...prev,
        selectedOption: 'evolve',
        awaitingEvolutionInput: true
      }));
      
    } else if (option === 'pivot') {
      const message = getFlowBlockPivotMessage();
      
      setTimeout(async () => {
        await postAssistantMessage(message);
      }, 300);
      
      await completeFlowBlockSprint(user.id);
      
      setSprintRenewalState(initialSprintRenewalState);
      
      setFlowBlockState(prev => ({
        ...prev,
        isActive: true,
        conversationHistory: []
      }));
    }
  };

  const handleEvolutionInput = async (userInput: string) => {
    if (sprintRenewalState.renewalType === 'identity') {
      const previousCoherence = sprintRenewalState.completedSprintInfo?.identity || 'previous coherence statement';
      
      await completeMicroActionSprint(user.id);
      
      setSprintRenewalState(initialSprintRenewalState);
      
      const evolutionContext = `The user is evolving their coherence statement from "${previousCoherence}". They want to evolve it to: "${userInput}". Help them refine the evolved coherence statement and design a new micro-action that proves this evolved commitment. Use the 4-C filter naturally (Concrete, Coherent, Challenging, Chunked) but don't announce it. Then help them design the ACE micro-action (Atomic, Congruent, Emotionally Clean).`;
      
      setMicroActionState(prev => ({
        ...prev,
        isActive: true,
        conversationHistory: [
          { role: 'user', content: evolutionContext }
        ]
      }));
      
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: buildAPIMessages([], evolutionContext),
            context: 'micro_action_setup'
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          const assistantResponse = cleanResponseForDisplay(data.response || data.content || '');
          
          setMicroActionState(prev => ({
            ...prev,
            conversationHistory: [
              ...prev.conversationHistory,
              { role: 'assistant', content: assistantResponse }
            ]
          }));
          
          setTimeout(() => {
            setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse }]);
          }, 300);
        }
      } catch (error) {
        console.error('[SprintRenewal] Evolution API error:', error);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "Let's continue refining your evolved coherence statement. What would the new statement be? Try phrasing it as 'For the next 21 days, I will...'"
        }]);
      }
      
    } else if (sprintRenewalState.renewalType === 'flow_block') {
      await completeFlowBlockSprint(user.id);
      
      setSprintRenewalState(initialSprintRenewalState);
      
      const evolutionContext = `The user is evolving their Flow Block system. They want to make these changes: "${userInput}". Help them refine their Flow Menu and Weekly Map based on this feedback. Skip the full discovery phase and focus on the specific changes they want to make. Ask clarifying questions if needed, then help them finalize the updated configuration.`;
      
      setFlowBlockState(prev => ({
        ...prev,
        isActive: true,
        conversationHistory: [
          { role: 'user', content: evolutionContext }
        ]
      }));
      
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: buildFlowBlockAPIMessages([], evolutionContext),
            context: 'flow_block_setup'
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          const assistantResponse = cleanFlowBlockResponseForDisplay(data.response || data.content || '');
          
          setFlowBlockState(prev => ({
            ...prev,
            conversationHistory: [
              ...prev.conversationHistory,
              { role: 'assistant', content: assistantResponse }
            ]
          }));
          
          setTimeout(() => {
            setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse }]);
          }, 300);
        }
      } catch (error) {
        console.error('[SprintRenewal] Flow block evolution error:', error);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "Let's work on those changes. Which specific aspect of your Flow Block setup would you like to modify first — domains, tasks, schedule, or duration?"
        }]);
      }
    }
  };


  // ============================================
  // FLOW BLOCK SETUP HANDLERS (API-DRIVEN v2.4)
  // ============================================
  
  const startFlowBlockSetup = useCallback(() => {
    devLog('[FlowBlock]', 'Starting setup flow (API-DRIVEN)');
    
    // Reset state for new setup
    setFlowBlockState(prev => ({
      ...prev,
      isActive: true,
      conversationHistory: [
        { role: 'assistant', content: flowBlockOpeningMessage }
      ],
      extractedDomains: null,
      extractedWeeklyMap: null,
      extractedPreferences: null,
      focusType: null
    }));
    
    // Show the opening message
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: flowBlockOpeningMessage
    }]);
  }, []);

  const processFlowBlockResponse = useCallback(async (userResponse: string) => {
    if (!flowBlockState.isActive) return;
    
    devLog('[FlowBlock]', 'Processing response:', userResponse);
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userResponse }]);
    setLoading(true);
    
    try {
      // Update conversation history with user message
      const updatedHistory = [
        ...flowBlockState.conversationHistory,
        { role: 'user' as const, content: userResponse }
      ];
      
      // Check if this is a commitment response (two-stage extraction trigger)
      const lastAssistantMessage = flowBlockState.conversationHistory.length > 0
        ? flowBlockState.conversationHistory[flowBlockState.conversationHistory.length - 1]?.content || ''
        : '';
      const isCommitment = isCommitmentResponse(userResponse, lastAssistantMessage);
      
      devLog('[FlowBlock]', 'Commitment check:', { isCommitment, lastAssistantMessage: lastAssistantMessage.substring(0, 50) });
      
      // Get current identity if available for context
      const currentIdentity = microActionState.extractedIdentity || (progress as any)?.currentIdentity || undefined;
      // DEBUG: Check what system prompt is being sent
const apiMessages = buildFlowBlockAPIMessages(updatedHistory, userResponse, currentIdentity);
      
      // STAGE 1: Get Claude's natural response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: buildFlowBlockAPIMessages(updatedHistory, userResponse, currentIdentity),
          context: 'flow_block_setup'
        })
      });
      
      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      const assistantResponse = data.response || data.content || '';
      
      devLog('[FlowBlock]', 'API response received:', assistantResponse.substring(0, 100) + '...');
      
      // Clean and display response
      const cleanResponse = cleanFlowBlockResponseForDisplay(assistantResponse);
      setMessages(prev => [...prev, { role: 'assistant', content: cleanResponse }]);
      
      // Update conversation history with assistant response
      const fullHistory = [...updatedHistory, { role: 'assistant' as const, content: cleanResponse }];
      
      // STAGE 2: If commitment detected, run extraction
if (isCommitment) {
        
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
          
          devLog('[FlowBlock]', 'Extraction response:', extractionText.substring(0, 200));
          
          const extracted = parseFlowBlockExtraction(extractionText);
          
          if (extracted) {
            devLog('[FlowBlock]', 'Extraction successful:', {
              domains: extracted.domains,
              weeklyMapLength: extracted.weeklyMap?.length,
              focusType: extracted.focusType
            });
            
            // Save to database
            const sprintResult = await startNewFlowBlockSprint(
              user.id,
              extracted.weeklyMap,
              extracted.preferences,
              extracted.domains,
              extracted.focusType as 'concentrated' | 'distributed'
            );
            
            devLog('[FlowBlock]', 'Sprint saved:', sprintResult);
            
            // Update state with extracted data
            setFlowBlockState(prev => ({
              ...prev,
              isActive: false,
              isComplete: true,
              conversationHistory: fullHistory,
              extractedDomains: extracted.domains,
              extractedWeeklyMap: extracted.weeklyMap,
              extractedPreferences: extracted.preferences,
             focusType: extracted.focusType as 'concentrated' | 'distributed',
              sprintStartDate: sprintResult.startDate,
              sprintNumber: sprintResult.sprintNumber
            }));
            
            // Refresh progress to update sidebar
            if (refetchProgress) {
              await refetchProgress();
            }
          } else {
            devLog('[FlowBlock]', 'Extraction failed, keeping conversation active');
            // Extraction failed but conversation can continue
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
        // Not a commitment, just update conversation history
        setFlowBlockState(prev => ({
          ...prev,
          conversationHistory: fullHistory
        }));
      }
      
    } catch (error) {
      console.error('[FlowBlock] Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Something went wrong. Let me try again — where were we with your Flow Block setup?'
      }]);
    } finally {
      setLoading(false);
    }
  }, [flowBlockState, microActionState.extractedIdentity, progress, user?.id, refetchProgress]);

  // Save Flow Block sprint to database
  const saveFlowBlockSprint = async (completedData: {
    domains?: string[];
    extractedDomains?: string[] | null;
    weeklyMap?: WeeklyMapEntry[];
    extractedWeeklyMap?: WeeklyMapEntry[] | null;
    preferences?: SetupPreferences;
    extractedPreferences?: SetupPreferences | null;
    focusType?: 'concentrated' | 'distributed' | null;
  }) => {
    if (!user?.id) {
      console.error('[FlowBlock] No userId for save');
      return;
    }
    
    const domains = completedData.extractedDomains || completedData.domains || [];
    const weeklyMap = completedData.extractedWeeklyMap || completedData.weeklyMap || [];
    const preferences = completedData.extractedPreferences || completedData.preferences || {};
    const focusType = completedData.focusType || 'distributed';
    
    devLog('[FlowBlock]', 'Saving sprint to database...', {
      domains,
      weeklyMapLength: weeklyMap.length
    });
    
    try {
      const sprintResult = await startNewFlowBlockSprint(
        user.id,
        weeklyMap,
        preferences,
        domains,
        focusType
      );
      
      devLog('[FlowBlock]', 'Sprint saved:', sprintResult);
      
      // Mark setup as complete in state
      setFlowBlockState(prev => ({
        ...prev,
        isComplete: true,
        isActive: false,
        sprintStartDate: sprintResult.startDate,
        sprintNumber: sprintResult.sprintNumber
      }));
      
      // Refresh progress to update sidebar
      if (refetchProgress) {
        await refetchProgress();
      }
      
    } catch (error) {
      console.error('[FlowBlock] Save error:', error);
      // Still mark as complete locally
      setFlowBlockState(prev => ({
        ...prev,
        isComplete: true,
        isActive: false
      }));
    }
  };

  // ============================================
  // WEEKLY CHECK-IN HANDLERS
  // ============================================
  
  const processWeeklyCheckInResponse = async (response: string) => {
    const rating = parseFloat(response);
    const currentStage = progress?.currentStage || 1;
    
    if (weeklyCheckInStep === 0) {
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
      case 1:
        setWeeklyCheckInScores(prev => ({ ...prev, regulation: rating }));
        setWeeklyCheckInStep(2);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: weeklyDomainQuestions.awareness
        }]);
        break;
        
      case 2:
        setWeeklyCheckInScores(prev => ({ ...prev, awareness: rating }));
        setWeeklyCheckInStep(3);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: weeklyDomainQuestions.outlook
        }]);
        break;
        
      case 3:
        setWeeklyCheckInScores(prev => ({ ...prev, outlook: rating }));
        setWeeklyCheckInStep(4);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: weeklyDomainQuestions.attention
        }]);
        break;
        
      case 4:
        setWeeklyCheckInScores(prev => ({ ...prev, attention: rating }));
        setWeeklyCheckInStep(5);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `**Stage-specific question:**\n\n${stageQualitativeQuestions[currentStage]} (0-5)`
        }]);
        break;
        
      case 5:
        const finalScores = { ...weeklyCheckInScores, qualitative: rating };
        await saveWeeklyCheckIn(finalScores);
        break;

      case 6:
        const numbers = response.match(/\d+(\.\d+)?/g);
        if (!numbers || numbers.length < 4) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: "Please enter 4 numbers between 0-5, separated by spaces (e.g., '4 3 4 5')."
          }]);
          return;
        }
        
        const [reg, aware, out, att] = numbers.map(n => parseFloat(n));
        
        if ([reg, aware, out, att].some(n => n < 0 || n > 5)) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: "All numbers must be between 0 and 5. Please try again."
          }]);
          return;
        }
        
        const allAtOnceScores = {
          regulation: reg,
          awareness: aware,
          outlook: out,
          attention: att,
          qualitative: null
        };
        
        await saveWeeklyCheckIn(allAtOnceScores);
        break;
    }
  };
  
  const saveWeeklyCheckIn = async (scores: typeof weeklyCheckInScores) => {
    try {
      const supabase = createClient();
      
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
      
      await supabase
        .from('user_progress')
        .update({ last_weekly_checkin: new Date().toISOString() })
        .eq('user_id', user.id);
      
      const regulationDelta = (scores.regulation || 0) - baselineData.domainScores.regulation;
      const awarenessDelta = (scores.awareness || 0) - baselineData.domainScores.awareness;
      const outlookDelta = (scores.outlook || 0) - baselineData.domainScores.outlook;
      const attentionDelta = (scores.attention || 0) - baselineData.domainScores.attention;
      const avgDelta = (regulationDelta + awarenessDelta + outlookDelta + attentionDelta) / 4;
      
      const avgScore = ((scores.regulation || 0) + (scores.awareness || 0) + (scores.outlook || 0) + (scores.attention || 0)) / 4;
      const newRewiredIndex = Math.round(avgScore * 20);
      
      const resultMessage = `**Weekly Check-In Complete!**

**Your Scores:**
- Regulation: ${scores.regulation}/5 (${regulationDelta >= 0 ? '+' : ''}${regulationDelta.toFixed(1)} from baseline)
- Awareness: ${scores.awareness}/5 (${awarenessDelta >= 0 ? '+' : ''}${awarenessDelta.toFixed(1)} from baseline)
- Outlook: ${scores.outlook}/5 (${outlookDelta >= 0 ? '+' : ''}${outlookDelta.toFixed(1)} from baseline)
- Attention: ${scores.attention}/5 (${attentionDelta >= 0 ? '+' : ''}${attentionDelta.toFixed(1)} from baseline)

**Average Delta: ${avgDelta >= 0 ? '+' : ''}${avgDelta.toFixed(2)}**
**Current REwired Index: ${newRewiredIndex}/100**

${avgDelta >= 0.3 ? '📈 Great progress! Your nervous system is responding to the training. Keep the consistency going.' : avgDelta >= 0 ? '📊 Moving in the right direction. Steady progress compounds over time.' : '📉 Some regression this week. Let\'s look at what might be contributing.'}`;

      setMessages(prev => [...prev, { role: 'assistant', content: resultMessage }]);
      
      // If declining, add follow-up with decline template after a delay
      if (avgDelta < 0) {
        const deltaScores = {
          regulation: regulationDelta,
          awareness: awarenessDelta,
          outlook: outlookDelta,
          attention: attentionDelta
        };
        
        // Get previous avg delta from progress if available
        const previousAvgDelta = (progress as any)?.previousAvgDelta || 0;
        const weeksDeclined = (progress as any)?.weeksDeclined || (avgDelta < 0 ? 1 : 0);
        
        const declineResponse = getDeclineResponse(avgDelta, previousAvgDelta, weeksDeclined, deltaScores);
        
        if (declineResponse) {
          setTimeout(() => {
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: `---\n\n${declineResponse}` 
            }]);
          }, 2500);
        }
      }
      
      setWeeklyCheckInActive(false);
      setWeeklyCheckInStep(0);
      setWeeklyCheckInScores({
        regulation: null,
        awareness: null,
        outlook: null,
        attention: null,
        qualitative: null
      });
      
      if (refetchProgress) {
        await refetchProgress();
      }
      
      // Check for regression after weekly check-in completes
      const currentStage = progress?.currentStage || 1;
      const adherence = progress?.adherencePercentage || 0;
      
      // Only check if Stage 2+ and been in stage for 7+ days
      if (currentStage >= 2 && progress?.stageStartDate) {
        const stageStartDate = new Date(progress.stageStartDate);
        const daysSinceStageStart = Math.floor(
          (new Date().getTime() - stageStartDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // Check conditions: 7+ days in stage, adherence < 60% OR negative delta
        if (daysSinceStageStart >= 7) {
          const lowAdherence = adherence < 60;
          const negativeDelta = avgDelta < 0;
          
          if (lowAdherence || negativeDelta) {
            let reason: 'low_adherence' | 'negative_delta' | 'both' = 'low_adherence';
            if (lowAdherence && negativeDelta) reason = 'both';
            else if (negativeDelta) reason = 'negative_delta';
            
            // Delay the regression message so user can see their weekly results first
            setTimeout(async () => {
              const regressionMsg = getRegressionMessage(
                currentStage,
                adherence,
                avgDelta,
                reason,
                getUserName()
              );
              
              await postAssistantMessage(regressionMsg);
              
              setRegressionIntervention({
                isActive: true,
                currentStage,
                adherence,
                avgDelta,
                reason
              });
            }, 2000);
          }
        }
      }
    } catch (error) {
  console.error('Failed to save weekly check-in:', error);
  
  // IMPORTANT: Reset check-in state so user isn't trapped
  setWeeklyCheckInActive(false);
  setWeeklyCheckInStep(0);
  setWeeklyCheckInScores({
    regulation: null,
    awareness: null,
    outlook: null,
    attention: null,
    qualitative: null
  });
  
  setMessages(prev => [...prev, {
    role: 'assistant',
    content: "There was an error saving your check-in. The check-in has been cancelled - you can try again later by saying 'weekly check-in'. What else can I help you with?"
  }]);
}
  };

  // ============================================
  // EFFECT - Initialize Chat
  // ============================================

  useEffect(() => {
    if (hasInitialized.current) return;
    if (!user || progressLoading) return;
    
    hasInitialized.current = true;
    
    const initializeChat = async () => {
      try {
        const supabase = createClient();
        
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data: todayPractices } = await supabase
          .from('practice_logs')
          .select('practice_type')
          .eq('user_id', user.id)
          .gte('completed_at', today.toISOString());
        
        const completedToday = todayPractices?.map((p: { practice_type: string }) => p.practice_type) || [];
        setPracticesCompletedToday(completedToday);
        
        const hasCompletedOnboarding = progressData?.ritual_intro_completed || (progressData?.current_stage && progressData.current_stage > 1);
        const type = determineOpeningType(progressData?.last_visit || null, hasCompletedOnboarding);
        setOpeningType(type);
        
        if (hasCompletedOnboarding) {
          setIntroStep(4);
        }
        
        devLog('[ChatInterface]', 'Opening type:', type, 'hasCompletedOnboarding:', hasCompletedOnboarding);
        
        const userName = getUserName();
        const currentStage = progress?.currentStage || progressData?.current_stage || 1;
        
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

        const extendedProgress = progress as any;
        let daysInStage = 1;
        if (extendedProgress?.stageStartDate) {
          const startDate = new Date(extendedProgress.stageStartDate);
          const now = new Date();
          daysInStage = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        }

        // ============================================
        // CHECK FOR MULTI-DAY GAPS (Missed Days)
        // ============================================
        let daysSinceLastPractice = 0;
        if (hasCompletedOnboarding) {
          const { data: lastPractice } = await supabase
            .from('practice_logs')
            .select('completed_at')
            .eq('user_id', user.id)
            .order('completed_at', { ascending: false })
            .limit(1);
          
          if (lastPractice && lastPractice.length > 0) {
            const lastPracticeDate = new Date(lastPractice[0].completed_at);
            const now = new Date();
            // Reset time to midnight for accurate day calculation
            lastPracticeDate.setHours(0, 0, 0, 0);
            now.setHours(0, 0, 0, 0);
            daysSinceLastPractice = Math.floor(
              (now.getTime() - lastPracticeDate.getTime()) / (1000 * 60 * 60 * 24)
            );
          }
        }
        
        devLog('[ChatInterface]', 'Days since last practice:', daysSinceLastPractice);

        const isWeeklyCheckInDue = (() => {
          if (type === 'first_time') return false;
          
          const lastCheckin = progressData?.last_weekly_checkin;
          const now = new Date();
          const today = now.getDay();
          
          if (!lastCheckin) {
            return daysInStage >= 7;
          }
          
          const lastCheckinDate = new Date(lastCheckin);
          const daysSinceCheckin = Math.floor((now.getTime() - lastCheckinDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysSinceCheckin >= 7) {
            return true;
          }
          
          if (today === 0) {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            return lastCheckinDate < startOfWeek;
          }
          
          return false;
        })();

        // ============================================
        // DETERMINE OPENING MESSAGE
        // Priority: System Recovery (30+) > Missed Days (2-29) > Weekly Check-in > Normal
        // ============================================
        
        // Check for system recovery first (30+ days away - needs re-onboarding)
        if (daysSinceLastPractice >= 30 && hasCompletedOnboarding && type === 'new_day') {
          // Immediately reset adherence and streak to reflect reality
          await supabase
            .from('user_progress')
            .update({ 
              adherence_percentage: 0,
              consecutive_days: 0
            })
            .eq('user_id', user.id);
          
          openingMessage = getSystemRecoveryMessage(
            daysSinceLastPractice,
            currentStage,
            userName
          );
          setSystemRecoveryIntervention({
            isActive: true,
            daysAway: daysSinceLastPractice,
            previousStage: currentStage
          });
          
          // Refetch to update UI with reset values
          if (refetchProgress) refetchProgress();
          
        // Check for multi-day gap (2-29 days)
        } else if (daysSinceLastPractice >= 2 && hasCompletedOnboarding && type === 'new_day') {
          // Reset streak (it's broken)
          // Also reset adherence if 7+ days (14-day window is mostly/entirely empty)
          const updateData: { consecutive_days: number; adherence_percentage?: number } = { 
            consecutive_days: 0 
          };
          if (daysSinceLastPractice >= 7) {
            updateData.adherence_percentage = 0;
          }
          
          await supabase
            .from('user_progress')
            .update(updateData)
            .eq('user_id', user.id);
          
          openingMessage = getMissedDaysMessage(
            daysSinceLastPractice,
            daysSinceLastPractice >= 7 ? 0 : (progressData?.adherence_percentage || 0),
            userName,
            currentStage
          );
          setMissedDaysIntervention({
            isActive: true,
            daysMissed: daysSinceLastPractice
          });
          
          // Refetch to update UI
          if (refetchProgress) refetchProgress();
          
        } else if (isWeeklyCheckInDue) {
          openingMessage = `Hey${userName ? `, ${userName}` : ''}. It's time for your weekly check-in.

Rate each domain **0-5** based on this past week:

1. **Regulation:** How easily could you calm yourself when stressed? (0 = couldn't, 5 = instantly)
2. **Awareness:** How quickly did you notice when lost in thought? (0 = never, 5 = immediately)  
3. **Outlook:** How open and positive did you feel toward life? (0 = closed/negative, 5 = open/positive)
4. **Attention:** How focused were you on what truly matters? (0 = scattered, 5 = laser-focused)

Give me your four numbers (e.g., "4 3 4 5").`;
          
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
        
        await supabase
          .from('user_progress')
          .update({ last_visit: new Date().toISOString() })
          .eq('user_id', user.id);
        
      } catch (err) {
        console.error('Chat initialization error:', err);
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
  // EFFECT - Sunday Meta-Reflection Prompt
  // ============================================
  
  useEffect(() => {
    const checkSundayReflection = async () => {
      if (
        hasCheckedSundayReflection.current ||
        isInitializing ||
        !user?.id ||
        !progress ||
        progress.currentStage < 2 ||
        !isSunday() ||
        weeklyCheckInActive
      ) {
        return;
      }
      
      hasCheckedSundayReflection.current = true;
      
      try {
        const isDue = await isWeeklyReflectionDue(user.id);
        
        if (isDue) {
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
  // EFFECT - Check Resistance Patterns
  // ============================================
  
  useEffect(() => {
    const checkResistancePatterns = async () => {
      // Skip if already checked, initializing, or other flows active
      if (
        hasCheckedResistance.current ||
        isInitializing ||
        !user?.id ||
        !progress ||
        openingType === 'first_time' ||
        weeklyCheckInActive ||
        missedDaysIntervention?.isActive ||
        sprintRenewalState.isActive ||
        microActionState.isActive ||
        flowBlockState.isActive
      ) {
        return;
      }
      
      hasCheckedResistance.current = true;
      
      try {
        const { should, pattern } = await shouldSurfacePattern(user.id);
        
        if (should && pattern) {
          devLog('[ResistanceTracking]', 'Surfacing pattern:', pattern);
          
          // Try to get a template-based message first
          const patternData = pattern as { type?: string; subType?: string; count?: number; intervention?: string };
          const templateMessage = getResistanceTemplateMessage({
            type: patternData.type || 'excuse',
            subType: patternData.subType,
            count: patternData.count
          });
          
          // Use template message if available, otherwise fall back to original
          const messageContent = templateMessage || patternData.intervention || 'A pattern has been detected.';
          
          // Delay the pattern message so it doesn't override the opening
          setTimeout(() => {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: `---

**A pattern I've noticed:**

${messageContent}

This isn't judgment — it's data. The resistance is telling you something. Want to explore it?`
            }]);
          }, 3000);
        }
      } catch (error) {
        console.error('[ResistanceTracking] Error checking patterns:', error);
      }
    };
    
    checkResistancePatterns();
  }, [user?.id, progress, isInitializing, openingType, weeklyCheckInActive, missedDaysIntervention?.isActive, sprintRenewalState.isActive, microActionState.isActive, flowBlockState.isActive]);

  // ============================================
  // MESSAGE HANDLERS
  // ============================================
  
  const handleQuickReply = async (currentStep: number) => {
    const reply = introQuickReplies[currentStep];
    if (!reply) return;
    
    setMessages(prev => [...prev, { role: 'user', content: reply.text }]);
    setLoading(true);
    
    let responseMessage: string;
    const templateContext = buildTemplateContext();
    
    if (currentStep === 0) {
      responseMessage = processTemplate(stageTemplates[1].ritualIntro.practices.hrvb, templateContext);
      setIntroStep(1);
    } else if (currentStep === 1) {
      responseMessage = processTemplate(stageTemplates[1].ritualIntro.practices.awareness_rep, templateContext);
      setIntroStep(2);
    } else if (currentStep === 2) {
      responseMessage = processTemplate(stageTemplates[1].ritualIntro.wrapUp, templateContext);
      setIntroStep(3);
      
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
    
    setTimeout(async () => {
      await postAssistantMessage(responseMessage);
      setLoading(false);
    }, 500);
  };

  // ============================================
  // PRACTICE CLICK HANDLER
  // ============================================
  
  const handlePracticeClick = useCallback(async (practiceId: string) => {
    const practiceName = getPracticeName(practiceId);
    
    devLog('[ChatInterface]', 'Practice clicked:', { practiceId, practiceName });
    
await postAssistantMessage(`Starting **${practiceName}**...\n\nThe practice window will open. Complete it and I'll log your progress.`);
  }, []);

  // ============================================
  // TOOL CLICK HANDLER
  // ============================================
  
  const handleToolClick = useCallback(async (toolId: string) => {
    devLog('[ChatInterface]', 'Tool clicked:', toolId);
    
    switch (toolId) {
      case 'micro_action':
        if (microActionState.isComplete) {
          setSprintRenewalState({
            isActive: true,
            renewalType: 'identity',
            selectedOption: null,
            completedSprintInfo: {
              type: 'identity',
              sprintNumber: microActionState.sprintNumber || 1,
              identity: microActionState.extractedIdentity || '',
              microAction: microActionState.extractedAction || ''
            },
            awaitingEvolutionInput: false
          });
          
          const message = getIdentitySprintCompleteMessage(
            microActionState.extractedIdentity || 'your coherence statement',
            microActionState.extractedAction || 'your micro-action',
            microActionState.sprintNumber || 1
          );
          await postAssistantMessage(message);
        } else {
          startMicroActionSetup();
        }
        break;
        
      case 'flow_block':
        if (flowBlockState.isComplete) {
          const todaysBlock = getTodaysBlock(flowBlockState.extractedWeeklyMap || []);
          if (todaysBlock) {
            await postAssistantMessage(`**Today's Flow Block:**\n\n${todaysBlock.task} (${todaysBlock.domain})\n\n${todaysBlock.duration} minutes, ${todaysBlock.flowType} work.\n\nReady to start?`);
          } else {
            await postAssistantMessage("No Flow Block scheduled for today. Would you like to update your weekly schedule?");
          }
        } else {
          startFlowBlockSetup();
        }
        break;

      case 'decentering':
        openDecentering(user?.id);
        break;

      case 'meta_reflection':
        openMetaReflection(user?.id, false);
        break;

      case 'reframe':
        openReframe(user?.id, false);
        break;

     case 'thought_hygiene':
        openThoughtHygiene(user?.id);
        break;

      case 'co_regulation':
        openCoRegulation();
        break;

      case 'nightly_debrief':
        openNightlyDebrief();
        break;
        
      default:
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Tool "${toolId}" is not yet implemented. Coming soon!` 
        }]);
    }
  }, [microActionState, flowBlockState, startMicroActionSetup, startFlowBlockSetup, openDecentering, openMetaReflection, openReframe, openThoughtHygiene, openCoRegulation, openNightlyDebrief, user?.id]);
  // ============================================
  // PROGRESS UPDATE HANDLER
  // ============================================
  
  const handleProgressUpdate = useCallback(() => {
    if (refetchProgress) {
      refetchProgress();
    }
  }, [refetchProgress]);

  // ============================================
  // PRACTICE COMPLETED HANDLER
  // ============================================
  
  const handlePracticeCompleted = useCallback((practiceId: string) => {
    const normalizedId = normalizePracticeId(practiceId);
    const practiceName = getPracticeName(practiceId);
    
    devLog('[ChatInterface]', 'Practice completed callback:', { practiceId, practiceName });
    
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: `**${practiceName}** completed! ✓\n\nNice work. Your progress has been logged.` 
    }]);
    
    setPracticesCompletedToday(prev => {
      if (!prev.includes(normalizedId)) {
        return [...prev, normalizedId];
      }
      return prev;
    });
    
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
  // PATTERN DETECTION - Route to specific flows
  // ============================================
  
  const userInputLower = userMessage.toLowerCase();
  
  // Micro-Action trigger patterns - UPDATED to include "aligned action"
  const microActionTriggers = [
    'micro action', 'micro-action', 'microaction',
    'run the micro', 'start micro', 'do micro',
    'morning micro', 'aligned action',
    'coherence installation', 'run micro', 'setup micro',
    'morning aligned'
  ];
  
  const isMicroActionRequest = microActionTriggers.some(trigger => 
    userInputLower.includes(trigger)
  );
  
  if (isMicroActionRequest && !microActionState.isActive) {
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Start the proper micro-action flow
    startMicroActionSetup();
    return; 
 }

  // ============================================
  // DEFAULT: Send to general AI API
  // ============================================
    
    // 0. Stage 7 Flow (highest priority when active)
    if (stage7FlowState !== 'none' && stage7FlowState !== 'complete') {
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      setLoading(true);
      const handled = processStage7Response(userMessage);
      setLoading(false);
      if (handled) return;
    }
    
    // 0.4 System Recovery Flow (30+ days away)
    if (systemRecoveryIntervention?.isActive) {
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      setLoading(true);
      
      const response = await handleSystemRecoveryResponse(userMessage);
      
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        setLoading(false);
      }, 500);
      return;
    }
    
    // 0.5 Missed Days Intervention Flow (2-29 days)
    if (missedDaysIntervention?.isActive) {
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      setLoading(true);
      
      const response = await handleMissedDaysResponse(userMessage);
      
      setTimeout(async () => {
        await postAssistantMessage(response);
        setLoading(false);
      }, 500);
      return;
    }
    
    // 0.6 Regression Intervention Flow
    if (regressionIntervention?.isActive) {
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      setLoading(true);
      
      const response = await handleRegressionResponse(userMessage);
      
      setTimeout(async () => {
        await postAssistantMessage(response);
        setLoading(false);
      }, 500);
      return;
    }
    
    // 1. Weekly Check-In Flow
    if (weeklyCheckInActive) {
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      setLoading(true);
      await processWeeklyCheckInResponse(userMessage);
      setLoading(false);
      return;
    }
    
    // 2. Micro-Action Setup Flow
    if (microActionState.isActive) {
      await processMicroActionResponse(userMessage);
      return;
    }
    
    // 3. Flow Block Setup Flow
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
          content: "No problem. You can set up your aligned action anytime by clicking the ⚡ icon or saying 'run micro action'." 
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
    
    // 6. Sprint Renewal Flow
    if (sprintRenewalState.isActive) {
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      setLoading(true);
      
      try {
        if (sprintRenewalState.awaitingEvolutionInput) {
          await handleEvolutionInput(userMessage);
          setLoading(false);
          return;
        }
        
        const selectedOption = parseRenewalResponse(userMessage);
        
        if (!selectedOption) {
          setTimeout(() => {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: "I didn't catch that. Would you like to **Continue** (same statement), **Evolve** (stretch it forward), or **Pivot** (new direction)?"
            }]);
            setLoading(false);
          }, 300);
          return;
        }
        
        if (sprintRenewalState.renewalType === 'identity') {
          await handleIdentityRenewalOption(selectedOption);
        } else if (sprintRenewalState.renewalType === 'flow_block') {
          await handleFlowBlockRenewalOption(selectedOption);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('[SprintRenewal] Error:', error);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "Something went wrong. Let's try again — Continue, Evolve, or Pivot?"
        }]);
        setLoading(false);
      }
      return;
    }
    
    // Intro Flow Handling
    if (openingType === 'first_time' && introStep < 3) {
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      setLoading(true);
      
      const isAffirmative = ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'ready', 'got it', 'makes sense', 'let\'s go', 'lets go', 'next', 'continue'].some(
        word => userMessage.toLowerCase().includes(word)
      );
      
     if (isAffirmative) {
  let responseMessage: string;
  const templateContext = buildTemplateContext();
  
  if (introStep === 0) {
    responseMessage = processTemplate(stageTemplates[1].ritualIntro.practices.hrvb, templateContext);
    setIntroStep(1);
  } else if (introStep === 1) {
    responseMessage = processTemplate(stageTemplates[1].ritualIntro.practices.awareness_rep, templateContext);
    setIntroStep(2);
  } else if (introStep === 2) {
    responseMessage = processTemplate(stageTemplates[1].ritualIntro.wrapUp, templateContext);
    setIntroStep(3);
    
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
    
    // Trigger Detection
    const lowerMessage = userMessage.toLowerCase();
    
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
    
    if (lowerMessage.includes('set up') && (lowerMessage.includes('identity') || lowerMessage.includes('micro') || lowerMessage.includes('aligned'))) {
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      startMicroActionSetup();
      return;
    }
    
    if (lowerMessage.includes('set up') && lowerMessage.includes('flow')) {
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      startFlowBlockSetup();
      return;
    }

    const lastAssistantMessage = messages.filter(m => m.role === 'assistant').slice(-1)[0]?.content || '';
    const isSundayPromptResponse = lastAssistantMessage.includes('Sunday Reflection') && 
      ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'ready', 'let\'s go', 'lets go', 'begin', 'start'].some(
        word => lowerMessage.includes(word)
      );
    
    if (lowerMessage.includes('meta-reflection') || lowerMessage.includes('meta reflection') || 
        lowerMessage.includes('reflect') && lowerMessage.includes('week') ||
        isSundayPromptResponse) {
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      openMetaReflection(user?.id, isSundayPromptResponse);
      return;
    }

    if (lowerMessage.includes('reframe') || lowerMessage.includes('interpretation audit') ||
        (lowerMessage.includes('run') && lowerMessage.includes('audit'))) {
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      openReframe(user?.id, false);
      return;
    }

    if (lowerMessage.includes('thought hygiene') || lowerMessage.includes('clear my head') ||
        lowerMessage.includes('mental reset') || lowerMessage.includes('clear my mind') ||
        lowerMessage.includes('mental cache') || lowerMessage.includes('brain dump')) {
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      openThoughtHygiene(user?.id);
      return;
    }

    // Check for Stage 7 question (only available at Stage 6)
    if (progress?.currentStage === 6 && isAskingAboutStage7(lowerMessage)) {
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      startStage7Introduction();
      return;
    }
    
    // Normal API Flow
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    
    // Check for breakthrough patterns in user message
    const breakthroughDetection = detectBreakthrough(userMessage);
    
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
      
      // If breakthrough detected with high confidence, add acknowledgment
      if (breakthroughDetection.type && breakthroughDetection.confidence >= 0.5) {
        setTimeout(() => {
          const breakthroughResponse = getBreakthroughResponse(breakthroughDetection.type!, userMessage);
          if (breakthroughResponse) {
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: `---\n\n${breakthroughResponse}` 
            }]);
          }
        }, 1500);
      }
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
  <div className="flex h-[100dvh] bg-[#1a1a1a]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-400">Loading your IOS...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] bg-[#1a1a1a]">
      {/* Left Sidebar - Dashboard (Desktop Only) */}
      {!isMobile && (
        <DashboardSidebar
          userName={getUserName()}
          currentStage={progress?.currentStage || 1}
          baselineRewiredIndex={baselineData.rewiredIndex}
          baselineDomainScores={baselineData.domainScores}
          currentDomainScores={progress?.domainScores}
          domainDeltas={progress?.domainDeltas}
          unlockProgress={progress?.unlockProgress}
          unlockEligible={progress?.unlockEligible}
          adherencePercentage={progress?.adherencePercentage || 0}
          consecutiveDays={progress?.consecutiveDays || 0}
          coherenceStatement={(progress as any)?.coherenceStatement ?? (progress as any)?.currentIdentity ?? undefined}
          currentIdentity={(progress as any)?.currentIdentity ?? undefined}
          microAction={(progress as any)?.microAction ?? undefined}
          sprintDay={(progress as any)?.sprintDay ?? (progress as any)?.identitySprintDay ?? undefined}
          identitySprintDay={(progress as any)?.identitySprintDay ?? undefined}
          onStage7Click={startStage7Introduction}
          flowBlockWeeklyMap={flowBlockState?.extractedWeeklyMap || null}
  flowBlockSprintDay={flowBlockState?.sprintStartDate ? getSprintDayNumber(flowBlockState.sprintStartDate) : undefined}
        />
      )}
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header with Coach Buttons */}
        <header className="h-14 border-b border-white/[0.06] flex items-center justify-between px-4 bg-[#1a1a1a] flex-shrink-0">
          <div className="text-sm text-gray-500">
            IOS System Installer
          </div>
<div className="flex items-center gap-2">
  <Link 
    href="/coach/nic"
    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-lg text-sm font-medium transition-colors border border-amber-500/30"
  >
    <Zap className="w-4 h-4" />
    <span className="hidden sm:inline">Coach with Nic</span>
    <span className="sm:hidden">Nic</span>
  </Link>
  <Link 
    href="/coach/fehren"
    className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-400/10 hover:bg-sky-400/20 text-sky-400 rounded-lg text-sm font-medium transition-colors border border-sky-400/30"
  >
    <Heart className="w-4 h-4" />
    <span className="hidden sm:inline">Coach with Fehren</span>
    <span className="sm:hidden">Fehren</span>
  </Link>
</div>
        </header>
        
        <div className="flex-1 overflow-y-auto bg-[#1a1a1a]">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-6 py-4 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm shadow-amber-500/20'
                      : 'bg-[#1a1a1a] text-zinc-100 border border-white/[0.06]'
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
            
            {/* Enhanced Loading Indicator */}
{loading && (
  <div className="flex justify-start">
    <div className="bg-gray-800 border border-gray-700 rounded-2xl px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 bg-[#ff9e19] rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-[#ff9e19] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-[#ff9e19] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-gray-500 text-sm">Processing...</span>
      </div>
    </div>
  </div>
)}
            {/* Streaming Message (Typewriter Effect) */}
{isStreaming && streamingMessage && (
  <div className="flex justify-start">
    <div className="max-w-[85%] rounded-2xl px-6 py-4 bg-gray-800 text-gray-100 border border-gray-700">
      <div 
        className="leading-relaxed prose prose-invert prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(streamingMessage) }}
      />
      {/* Blinking cursor */}
      <span className="inline-block w-0.5 h-4 bg-[#ff9e19] ml-0.5 animate-pulse" />
    </div>
  </div>
)}
            
            {/* Quick Reply Button for Intro Flow */}
            {currentQuickReply && !loading && (
              <div className="flex justify-center">
                <button
                  onClick={() => handleQuickReply(introStep)}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 transition-all shadow-sm shadow-amber-500/20"
                >
                  {currentQuickReply.buttonLabel}
                </button>
              </div>
            )}
            
            {/* Missed Days Quick Replies */}
            {missedDaysIntervention?.isActive && !loading && (
              <div className="flex justify-center gap-3 flex-wrap">
                <button
                  onClick={() => {
                    setMessages(prev => [...prev, { role: 'user', content: "Let's pick up where I left off" }]);
                    handleMissedDaysResponse("let's pick up").then(response => {
                      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
                    });
                  }}
                  className="px-5 py-2.5 bg-[#ff9e19] hover:bg-orange-600 text-white font-medium rounded-xl transition-all"
                >
                  Continue
                </button>
                <button
                  onClick={() => {
                    setMessages(prev => [...prev, { role: 'user', content: "Let's talk about what happened" }]);
                    handleMissedDaysResponse("talk about it").then(response => {
                      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
                    });
                  }}
                  className="px-5 py-2.5 bg-[#1a1a1a] border border-[#333] hover:border-[#ff9e19] text-white font-medium rounded-xl transition-all"
                >
                  Talk About It
                </button>
                <button
                  onClick={() => {
                    setMessages(prev => [...prev, { role: 'user', content: "Reset my stage" }]);
                    handleMissedDaysResponse("reset stage").then(response => {
                      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
                    });
                  }}
                  className="px-5 py-2.5 bg-[#1a1a1a] border border-[#333] hover:border-[#ff9e19] text-white font-medium rounded-xl transition-all"
                >
                  Reset Stage
                </button>
              </div>
            )}
            
            {/* System Recovery Quick Replies (30+ days) */}
            {systemRecoveryIntervention?.isActive && !loading && (
              <div className="flex justify-center gap-3 flex-wrap">
                <button
                  onClick={() => {
                    setMessages(prev => [...prev, { role: 'user', content: "Full Reset - back to Stage 1" }]);
                    handleSystemRecoveryResponse("full reset").then(response => {
                      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
                    });
                  }}
                  className="px-5 py-2.5 bg-[#1a1a1a] border border-[#333] hover:border-[#ff9e19] text-white font-medium rounded-xl transition-all"
                >
                  Full Reset
                </button>
                <button
                  onClick={() => {
                    setMessages(prev => [...prev, { role: 'user', content: "Soft Reset - keep my stage" }]);
                    handleSystemRecoveryResponse("soft reset").then(response => {
                      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
                    });
                  }}
                  className="px-5 py-2.5 bg-[#ff9e19] hover:bg-orange-600 text-white font-medium rounded-xl transition-all"
                >
                  Soft Reset
                </button>
                <button
                  onClick={() => {
                    setMessages(prev => [...prev, { role: 'user', content: "Continue as-is" }]);
                    handleSystemRecoveryResponse("continue as-is").then(response => {
                      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
                    });
                  }}
                  className="px-5 py-2.5 bg-[#1a1a1a] border border-[#333] hover:border-[#ff9e19] text-white font-medium rounded-xl transition-all"
                >
                  Continue As-Is
                </button>
              </div>
            )}
            
            {/* Regression Quick Replies */}
            {regressionIntervention?.isActive && !loading && (
              <div className="flex justify-center gap-3 flex-wrap">
                <button
                  onClick={() => {
                    setMessages(prev => [...prev, { role: 'user', content: `Regress to Stage ${(regressionIntervention?.currentStage || 2) - 1}` }]);
                    handleRegressionResponse("regress").then(response => {
                      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
                    });
                  }}
                  className="px-5 py-2.5 bg-[#1a1a1a] border border-[#333] hover:border-[#ff9e19] text-white font-medium rounded-xl transition-all"
                >
                  Regress to Stage {(regressionIntervention?.currentStage || 2) - 1}
                </button>
                <button
                  onClick={() => {
                    setMessages(prev => [...prev, { role: 'user', content: "Let's troubleshoot" }]);
                    handleRegressionResponse("troubleshoot").then(response => {
                      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
                    });
                  }}
                  className="px-5 py-2.5 bg-[#ff9e19] hover:bg-orange-600 text-white font-medium rounded-xl transition-all"
                >
                  Troubleshoot
                </button>
              </div>
            )}
            
            {/* Sprint Renewal Quick Replies */}
            {sprintRenewalState.isActive && !sprintRenewalState.awaitingEvolutionInput && !loading && (
              <div className="flex justify-center gap-3 flex-wrap">
                {(sprintRenewalState.renewalType === 'identity' 
                  ? identityRenewalQuickReplies 
                  : flowBlockRenewalQuickReplies
                ).map((reply) => (
                  <button
                    key={reply.id}
                    onClick={() => {
                      setMessages(prev => [...prev, { role: 'user', content: reply.text }]);
                      setLoading(true);
                      
                      if (sprintRenewalState.renewalType === 'identity') {
                        handleIdentityRenewalOption(reply.id as 'continue' | 'evolve' | 'pivot')
                          .finally(() => setLoading(false));
                      } else {
                        handleFlowBlockRenewalOption(reply.id as 'continue' | 'evolve' | 'pivot')
                          .finally(() => setLoading(false));
                      }
                    }}
                    className="px-5 py-2.5 bg-[#1a1a1a] border border-[#333] hover:border-[#ff9e19] hover:bg-[#252525] text-white font-medium rounded-xl transition-all"
                    title={reply.label}
                  >
                    {reply.text}
                  </button>
                ))}
              </div>
            )}

            {/* Stage 7 Quick Reply Buttons */}
            {stage7FlowState === 'intro_shown' && !loading && (
              <div className="flex justify-center gap-3 flex-wrap">
                <button
                  onClick={() => handleStage7QuickReply('learn_more')}
                  className="px-5 py-2.5 bg-[#ff9e19] hover:bg-orange-600 text-white font-medium rounded-xl transition-all"
                >
                  Tell me about Stage 7
                </button>
                <button
                  onClick={() => handleStage7QuickReply('continue_stage6')}
                  className="px-5 py-2.5 bg-[#1a1a1a] border border-[#333] hover:border-[#ff9e19] text-white font-medium rounded-xl transition-all"
                >
                  Continue with Stage 6
                </button>
              </div>
            )}
            
            {stage7FlowState === 'question1_shown' && !loading && (
              <div className="flex justify-center gap-3 flex-wrap">
                <button
                  onClick={() => handleStage7QuickReply('yes_open')}
                  className="px-5 py-2.5 bg-[#ff9e19] hover:bg-orange-600 text-white font-medium rounded-xl transition-all"
                >
                  Yes, I'm open
                </button>
                <button
                  onClick={() => handleStage7QuickReply('no_not_open')}
                  className="px-5 py-2.5 bg-[#1a1a1a] border border-[#333] hover:border-[#ff9e19] text-white font-medium rounded-xl transition-all"
                >
                  No, not for me
                </button>
              </div>
            )}
            
            {stage7FlowState === 'complete' && stage7OpenToProtocol && !loading && (
              <div className="flex justify-center">
                <a
                  href="https://nicholaskusmich.typeform.com/beyond"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-[#ff9e19] hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors shadow-lg inline-flex items-center gap-2"
                >
                  Apply for Stage 7 →
                </a>
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
                  {pendingUnlockStage === 3 ? 'Start Aligned Action Installation' :
                   pendingUnlockStage === 4 ? 'Set Up Flow Blocks' :
                   pendingUnlockStage === 5 ? 'Learn Co-Regulation Practice' :
                   pendingUnlockStage === 6 ? 'Learn Nightly Debrief' :
                   `Start Stage ${pendingUnlockStage}`}
                </button>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-white/[0.06] bg-[#1a1a1a]">
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
                disabled={loading || isStreaming}
                rows={1}
               className="flex-1 bg-[#1a1a1a] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/30 disabled:opacity-50 resize-none min-h-[52px] max-h-[200px] transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading || isStreaming}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 transition-all shadow-sm shadow-amber-500/20"
              >
                Send
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {microActionState.isActive
                ? "Setting up your Aligned Action - type your responses"
                : flowBlockState.isActive
                  ? "Setting up your Flow Blocks - type your responses"
                  : currentQuickReply 
                    ? "Click the button above or type your own response" 
                    : "Press Enter to send, Shift+Enter for new line"}
            </p>
          </div>
        </div>
      </div>

      {/* Tools Sidebar (Desktop) */}
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
          baselineRewiredIndex={baselineData.rewiredIndex}
          baselineDomainScores={baselineData.domainScores}
          currentDomainScores={progress?.domainScores}
          domainDeltas={progress?.domainDeltas}
          unlockProgress={progress?.unlockProgress}
          unlockEligible={progress?.unlockEligible}
          adherencePercentage={progress?.adherencePercentage || 0}
          consecutiveDays={progress?.consecutiveDays || 0}
          coherenceStatement={(progress as any)?.coherenceStatement ?? (progress as any)?.currentIdentity ?? undefined}
          currentIdentity={(progress as any)?.currentIdentity ?? undefined}
          microAction={(progress as any)?.microAction ?? undefined}
          sprintDay={(progress as any)?.sprintDay ?? (progress as any)?.identitySprintDay ?? undefined}
          identitySprintDay={(progress as any)?.identitySprintDay ?? undefined}
          onStage7Unlock={startStage7Introduction}
          flowBlockWeeklyMap={flowBlockState?.extractedWeeklyMap || null}
  flowBlockSprintDay={flowBlockState?.sprintStartDate ? getSprintDayNumber(flowBlockState.sprintStartDate) : undefined}
        />
      )}

      {/* Floating Action Button (Mobile) */}
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
      <ReframeModal />
      <ThoughtHygieneModal />
      <CoRegulationModal onComplete={() => handlePracticeCompleted('co_regulation')} />
      <NightlyDebriefModal onComplete={() => handlePracticeCompleted('nightly_debrief')} />

      {/* Paywall Modal */}
      <PaywallModal 
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUpgrade={handleUpgrade}
      />

{/* Stage Attribution Modal (show-once unlock celebration) */}
      {attributionStage && (
        <StageAttributionModal
          stage={attributionStage}
          isOpen={showAttributionModal}
          onClose={() => {
            setShowAttributionModal(false);
            setAttributionStage(null);
          }}
          onContinue={handleAttributionContinue}
        />
      )}

      {/* Reorientation Modal (day 7, day 21, missed week, stage 4 unlock) */}
      <ReorientationModal
        isOpen={reorientationOpen}
        title={reorientationContent?.title || ''}
        body={reorientationContent?.body || ''}
        onDismiss={dismissReorientation}
      />
    </div>
  );
}
