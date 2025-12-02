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
  getStageName as getStageNameFromHelper,
  getStatusTier as getStatusTierFromHelper,
  getStatusColor as getStatusColorFromHelper,
  calculateDaysInStage,
  getTimeOfDayGreeting,
  type TemplateContext,
  type SelectionContext,
  type TemplateTrigger
} from '@/lib/templates';

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
  buildAPIMessages
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
  parseFlowBlockCompletion,
  cleanFlowBlockResponseForDisplay,
  buildFlowBlockAPIMessages,
  getTodaysBlock,
  getDailyFlowBlockPrompt,
  postBlockReflectionPrompt,
  getSprintDayNumber,
  isSprintComplete,
  sprintCompleteMessage
} from '@/lib/flowBlockAPI';

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

// Get stage name from number (local version for backward compatibility)
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

Good question. Now — ready to learn the rituals? They're the foundation of everything else.`;
    case 1:
      return `---

Alright, back to the installation. Ready to learn the second ritual?`;
    case 2:
      return `---

Got it. Let's finish up the ritual overview so you're set for tomorrow.`;
    default:
      return `---

Now, let's continue with the ritual introduction.`;
  }
}

// ============================================
// PERSONALIZED INSIGHT GENERATION
// ============================================

// Generate personalized interpretation via API
async function generatePersonalizedInsight(data: BaselineData, userName: string): Promise<string> {
  try {
    const response = await fetch('/api/chat/insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rewiredIndex: data.rewiredIndex,
        tier: data.tier,
        domainScores: data.domainScores,
        userName: userName
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate insight');
    }
    
    const result = await response.json();
    return result.insight;
  } catch (error) {
    console.error('Error generating insight:', error);
    // Fallback to generic insight if API fails
    return getGenericInsight(data);
  }
}

// Fallback generic insight based on scores
function getGenericInsight(data: BaselineData): string {
  const scores = data.domainScores;
  const entries = Object.entries(scores) as [string, number][];
  const lowest = entries.reduce((a, b) => a[1] < b[1] ? a : b);
  const highest = entries.reduce((a, b) => a[1] > b[1] ? a : b);
  
  const lowestName = lowest[0].charAt(0).toUpperCase() + lowest[0].slice(1);
  const highestName = highest[0].charAt(0).toUpperCase() + highest[0].slice(1);
  
  if (data.rewiredIndex >= 70) {
    return `A ${data.rewiredIndex} baseline puts you ahead of most. Your ${highestName} is solid, but ${lowestName} is where the real gains are waiting. That's your growth edge.`;
  } else if (data.rewiredIndex >= 50) {
    return `A ${data.rewiredIndex} baseline shows potential with room to grow. ${highestName} is your strength - lean into it. ${lowestName} needs work, and that's exactly what we'll target.`;
  } else {
    return `A ${data.rewiredIndex} baseline means your system is running on survival mode. Good news: there's nowhere to go but up. We'll start with ${lowestName} - that's where the biggest shifts happen fastest.`;
  }
}

// FIRST-TIME USER: Full onboarding message (async for personalized insight)
async function getFirstTimeOpeningMessage(data: BaselineData, userName: string): Promise<string> {
  const rituals = stageRituals[data.currentStage] || stageRituals[1];
  const tierText = tierInterpretations[data.tier] || tierInterpretations['Operational'];
  
  // Get personalized insight via small API call
  const personalizedInsight = await generatePersonalizedInsight(data, userName);
  
  return `Hey${userName ? `, ${userName}` : ''}. Your baseline diagnostic is complete. Nicely done.

**REwired Index: ${data.rewiredIndex}/100**
**Status: ${data.tier}**

**Domain Breakdown:**
• Regulation: ${data.domainScores.regulation.toFixed(1)}/5.0
• Awareness: ${data.domainScores.awareness.toFixed(1)}/5.0
• Outlook: ${data.domainScores.outlook.toFixed(1)}/5.0
• Attention: ${data.domainScores.attention.toFixed(1)}/5.0

The results will also appear on the left side (desktop) or by clicking on the hamburger icon (mobile) for quick reference any time.

${personalizedInsight}

${tierText}

---

Now, let's dive in. 

Here's how this works:

The IOS installs in 7 progressive stages. Each stage adds new practices that stack — they don't replace, they accumulate.

You advance when the system sees you're ready. So you need to do the daily rituals and follow the prompts. 

---

You're starting at **Stage ${data.currentStage}: ${getStageName(data.currentStage)}**.

**Your daily rituals (that start tomorrow morning):**

${rituals.list}

**Total: ${rituals.total}** every morning, immediately upon waking.

These aren't optional. They're the kernel installation. Without them, nothing else sticks.

For simplicity, they are also located on the right side (desktop) or under the lightning bolt icon (mobile).

Ready to learn the rituals?`;
}

// RETURNING USER (same day): Brief check-in
function getSameDayReturnMessage(
  data: BaselineData, 
  progress: ProgressData | null, 
  currentStage: number,
  completedPractices: string[]
): string {
  const requiredPractices = stagePracticeIds[currentStage] || stagePracticeIds[1];
  const totalRequired = requiredPractices.length;
  
  // Normalize to lowercase for comparison
  const completedLower = completedPractices.map(p => p.toLowerCase());
  
  // Count how many required practices have been completed (case-insensitive)
  const completedRequired = requiredPractices.filter(p => completedLower.includes(p.toLowerCase()));
  const completedCount = completedRequired.length;
  const remainingCount = totalRequired - completedCount;
  const allComplete = completedCount >= totalRequired;
  
  if (allComplete) {
    return `Welcome back. Good to see you.

All ${totalRequired} rituals logged today. Nice work.

What do you need?
• Continue a conversation
• Run an on-demand protocol (Reframe, Thought Hygiene, Decentering)
• Check your progress
• Ask a question

What's on your mind?`;
  }
  
  if (completedCount > 0) {
    return `Welcome back.

You've completed ${completedCount}/${totalRequired} rituals today. ${remainingCount} remaining.

Ready to continue, or is there something else you need first?`;
  }
  
  return `Welcome back.

Your morning rituals are waiting. Ready to run through them now, or is there something else you need first?`;
}

// RETURNING USER (new day): Morning ritual prompt
function getNewDayMorningMessage(data: BaselineData, progress: ProgressData | null, userName: string, currentStage: number): string {
  const rituals = stageRituals[currentStage] || stageRituals[1];
  const consecutiveDays = progress?.consecutive_days || 0;
  const adherence = progress?.adherence_percentage || 0;
  
  // Calculate days in current stage
  let daysInStage = 1;
  if (progress?.stage_start_date) {
    const startDate = new Date(progress.stage_start_date);
    const now = new Date();
    daysInStage = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }
  
  // Build streak message
  let streakMessage = '';
  if (consecutiveDays >= 7) {
    streakMessage = `\n\n🔥 **${consecutiveDays} day streak.** Your nervous system is rewiring. Keep going.`;
  } else if (consecutiveDays >= 3) {
    streakMessage = `\n\n**${consecutiveDays} days consecutive.** Building momentum.`;
  } else if (consecutiveDays === 0 && adherence > 0) {
    streakMessage = `\n\nStreak broken. All good. No judgment — just start fresh today.`;
  }
  
  return `Morning${userName ? `, ${userName}` : ''}.

**Stage ${currentStage}: ${getStageName(currentStage)}** — Day ${daysInStage}
**Adherence:** ${adherence.toFixed(0)}%${streakMessage}

---

**Today's rituals:**

${rituals.list}

**Total: ${rituals.total}**

Ready to begin? Type "yes" or use the tool to get started.`;
}

// Determine which opening to use
function determineOpeningType(
  lastVisit: string | null,
  hasCompletedOnboarding: boolean
): 'first_time' | 'same_day' | 'new_day' {
  if (!hasCompletedOnboarding || !lastVisit) {
    return 'first_time';
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

// Parse Flow Block completion marker from API response
function parseFlowBlockCompletionMarker(response: string): FlowBlockConfig | null {
  const markerRegex = /\[FLOW_BLOCK_COMPLETE:\s*(\{[\s\S]*?\})\]/;
  const match = response.match(markerRegex);
  
  if (match && match[1]) {
    try {
      const parsed = JSON.parse(match[1]);
      return {
        domains: parsed.weeklyMap?.map((e: WeeklyMapEntry) => e.domain) || [],
        weeklyMap: parsed.weeklyMap || [],
        setupPreferences: parsed.setupPreferences || {
          professionalLocation: '',
          personalLocation: '',
          playlist: '',
          timerMethod: '',
          notificationsOff: true
        },
        focusType: parsed.focusType || 'distributed',
        sprintStartDate: new Date().toISOString(),
        sprintNumber: 1,
        isActive: true
      };
    } catch (e) {
      console.error('[FlowBlock] Failed to parse completion marker:', e);
      return null;
    }
  }
  return null;
}

// Clean Flow Block response for display (remove marker)
function cleanFlowBlockResponseForDisplay(response: string): string {
  return response.replace(/\[FLOW_BLOCK_COMPLETE:\s*\{[\s\S]*?\}\]/, '').trim();
}

// Build API messages for Flow Block conversation
function buildFlowBlockAPIMessages(history: { role: 'user' | 'assistant'; content: string }[], userMessage: string) {
  const messages = [
    { role: 'system' as const, content: flowBlockSystemPrompt },
    ...history,
    { role: 'user' as const, content: userMessage }
  ];
  return messages;
}

// Get today's scheduled Flow Block from weekly map
function getTodaysFlowBlock(weeklyMap: WeeklyMapEntry[] | null): WeeklyMapEntry | null {
  if (!weeklyMap) return null;
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = dayNames[new Date().getDay()];
  
  return weeklyMap.find(entry => entry.day === today) || null;
}

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
  
  // ============================================
  // MICRO-ACTION SETUP STATE (100% API version)
  // ============================================
  const [microActionState, setMicroActionState] = useState<MicroActionState>(initialMicroActionState);
  const [awaitingMicroActionStart, setAwaitingMicroActionStart] = useState(false);
  const [awaitingSprintRenewal, setAwaitingSprintRenewal] = useState(false);
  
  // ============================================
  // FLOW BLOCK SETUP STATE (100% API version)
  // ============================================
  const [flowBlockState, setFlowBlockState] = useState<FlowBlockState>(initialFlowBlockState);
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
      flowBlockSetupCompleted: extendedProgress?.flowBlockSetupCompleted || flowBlockState.isSetupComplete,
      toolsIntroduced: extendedProgress?.toolsIntroduced || [],
      weeklyCheckInDue: false, // TODO: Implement weekly check-in logic
      isMobile
    };
  }, [baselineData, progress, practicesCompletedToday, introStep, isMobile, flowBlockState.isSetupComplete]);

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
          setFlowBlockState(prev => ({
            ...prev,
            isSetupComplete: true,
            weeklyMap: config.weekly_map,
            setupPreferences: config.setup_preferences,
            sprintStartDate: config.sprint_start_date,
            todaysBlock: getTodaysFlowBlock(config.weekly_map)
          }));
        }
      } catch (error) {
        // No config found - that's fine for new users
        console.log('[FlowBlock] No existing config found');
      }
    };
    
    loadFlowBlockStatus();
  }, [user?.id]);

  // ============================================
  // UNLOCK ELIGIBILITY CHECK
  // ============================================
  // Check if user is eligible for stage unlock and show message
  useEffect(() => {
    // Only check once per session and when we have progress data
    if (hasCheckedUnlock.current || !progress || isInitializing || unlockFlowState !== 'none') return;
    // Don't trigger if any other flow is active
    if (weeklyCheckInActive || awaitingSprintRenewal || awaitingMicroActionStart || microActionState.isActive) return;
    if (awaitingFlowBlockStart || flowBlockState.isSetupActive) return;
    
    // Only check if user is eligible for unlock
    console.log('[ChatInterface] Unlock check:', {
      unlockEligible: progress.unlockEligible,
      currentStage: progress.currentStage,
      adherence: progress.adherencePercentage,
      consecutiveDays: progress.consecutiveDays,
      avgDelta: progress.domainDeltas?.average
    });
    
    if (progress.unlockEligible && progress.currentStage < 7) {
      hasCheckedUnlock.current = true;
      console.log('[ChatInterface] User eligible for unlock! Showing eligible message...');
      
      // Get the eligible message from templates
      const currentStageTemplates = templateLibrary.stages[progress.currentStage as keyof typeof templateLibrary.stages];
      // Type-safe access (cast to avoid TS union type issues)
      const unlockTemplates = currentStageTemplates?.unlock as { eligible?: string; notYet?: string; confirmation?: string } | undefined;
      if (unlockTemplates?.eligible) {
        const nextStage = progress.currentStage + 1;
        setPendingUnlockStage(nextStage);
        setUnlockFlowState('eligible_shown');
        
        // Process the template
        const templateContext = buildTemplateContext();
        const processedMessage = processTemplate(unlockTemplates.eligible, templateContext);
        
        // Add unlock eligible message to chat
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: processedMessage 
        }]);
      }
    }
  }, [progress, isInitializing, unlockFlowState, buildTemplateContext, weeklyCheckInActive, awaitingSprintRenewal, awaitingMicroActionStart, microActionState.isActive, awaitingFlowBlockStart, flowBlockState.isSetupActive]);

  // ============================================
  // UNLOCK CONFIRMATION HANDLER
  // ============================================
  const handleUnlockConfirmation = async (confirmed: boolean) => {
    if (!confirmed || !pendingUnlockStage || !user) {
      // User declined - reset state
      setUnlockFlowState('none');
      setPendingUnlockStage(null);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "No problem. Keep building consistency at your current stage. The unlock will be available whenever you're ready." 
      }]);
      return;
    }

    setLoading(true);
    
    try {
      const supabase = createClient();
      const previousStage = pendingUnlockStage - 1;
      
      // Update user's stage in database
      const { error: updateError } = await supabase
        .from('user_progress')
        .update({ 
          current_stage: pendingUnlockStage,
          stage_start_date: new Date().toISOString().split('T')[0],
          consecutive_days: 0  // Reset consecutive days for new stage
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating stage:', updateError);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "There was an error unlocking the next stage. Please try again." 
        }]);
        setLoading(false);
        return;
      }

      // Get confirmation message from templates
      const previousStageTemplates = templateLibrary.stages[previousStage as keyof typeof templateLibrary.stages];
      // Type-safe access to confirmation (cast to any to avoid TS union type issues)
      const unlockTemplates = previousStageTemplates?.unlock as { eligible?: string; notYet?: string; confirmation?: string } | undefined;
      if (unlockTemplates?.confirmation) {
        const templateContext = buildTemplateContext();
        // Override current stage in context for correct placeholder processing
        const updatedContext = { ...templateContext };
        const processedMessage = processTemplate(unlockTemplates.confirmation, updatedContext);
        
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: processedMessage 
        }]);
      }

      // Update flow state - SPECIAL HANDLING FOR STAGE 3 AND STAGE 4
      if (pendingUnlockStage === 3) {
        // Stage 3: The confirmation message already asks "Ready to run Identity Installation?"
        // So we skip the "Learn the new practices" button and go straight to awaiting response
        setUnlockFlowState('none');
        setPendingUnlockStage(null);
        setAwaitingMicroActionStart(true);
      } else if (pendingUnlockStage === 4) {
        // Stage 4: Similar pattern - prompt for Flow Block setup
        setUnlockFlowState('none');
        setPendingUnlockStage(null);
        setAwaitingFlowBlockStart(true);
      } else {
        // Other stages: Show "Learn the new practices" button
        setUnlockFlowState('confirmed');
      }
      
      // Refresh progress data to reflect new stage
      await refetchProgress();
      
    } catch (err) {
      console.error('Error in unlock confirmation:', err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "There was an error processing the unlock. Please try again." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // START NEW STAGE INTRO
  // ============================================
  const handleStartNewStageIntro = () => {
    if (!pendingUnlockStage) return;
    
    setUnlockFlowState('intro_started');
    
    // SPECIAL HANDLING FOR STAGE 3: Trigger Micro-Action Identity Setup
    if (pendingUnlockStage === 3) {
      // Add intro message for Stage 3
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `**Welcome to Stage 3: Identity Mode** 🎯

You've built a solid foundation with regulation and embodied awareness. Now it's time to anchor a new identity through daily proof.

The Morning Micro-Action is a 21-day protocol where you:
1. Choose an identity you want to embody
2. Design one small daily action that proves you ARE this person
3. Complete that action every morning

By day 21, it won't feel like effort. It'll feel like you.

Ready to discover your identity and design your micro-action?`
      }]);
      
      // Clear pending unlock
      setPendingUnlockStage(null);
      
      // Set a flag to trigger setup when user responds
      setAwaitingMicroActionStart(true);
      return;
    }
    
    // SPECIAL HANDLING FOR STAGE 4: Trigger Flow Block Setup
    if (pendingUnlockStage === 4) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `**Welcome to Stage 4: Flow Mode** 🎯

You've built identity alignment through daily proof. Now it's time to train sustained attention on high-leverage work.

Flow Blocks are 60-90 minute deep work sessions where you:
1. Focus on ONE high-leverage task
2. Challenge ≈ skill + 10%
3. No phone, no distractions
4. Track performance metrics

By week 3, dropping into flow will feel like home.

Ready to identify your highest-leverage work and design your Flow Block system?`
      }]);
      
      // Clear pending unlock
      setPendingUnlockStage(null);
      
      // Set a flag to trigger setup when user responds
      setAwaitingFlowBlockStart(true);
      return;
    }
    
    // Get the ritual intro for the new stage (for other stages)
    const newStageTemplates = templateLibrary.stages[pendingUnlockStage as keyof typeof templateLibrary.stages];
    if (newStageTemplates?.ritualIntro?.intro) {
      const templateContext = buildTemplateContext();
      const processedMessage = processTemplate(newStageTemplates.ritualIntro.intro, templateContext);
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: processedMessage 
      }]);
      
      // Reset intro step for new stage walkthrough
      setIntroStep(0);
    }
    
    // Clear pending unlock
    setPendingUnlockStage(null);
  };

  // ============================================
  // MICRO-ACTION SETUP HANDLERS
  // ============================================
  
  // Start Micro-Action setup flow (100% API version)
  const startMicroActionSetup = useCallback(async () => {
    console.log('[MicroAction] Starting setup flow (100% API)');
    
    // Initialize state
    setMicroActionState({
      isActive: true,
      conversationHistory: [],
      extractedIdentity: null,
      extractedAction: null,
      isComplete: false,
      sprintStartDate: null
    });
    
    // Show opening message
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: microActionOpeningMessage
    }]);
  }, []);

  // Process user response in Micro-Action setup (100% API version)
  const processMicroActionResponse = useCallback(async (userResponse: string) => {
    if (!microActionState.isActive) return;
    
    console.log('[MicroAction] Processing response (API):', userResponse);
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userResponse }]);
    setLoading(true);
    
    // Build conversation history for API
    const updatedHistory = [
      ...microActionState.conversationHistory,
      { role: 'user' as const, content: userResponse }
    ];
    
    try {
      // Call the main chat API with the Micro-Action system prompt
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
      
      console.log('[MicroAction] API response:', assistantResponse);
      
      // Check for completion marker
      const completion = parseCompletionMarker(assistantResponse);
      
      if (completion) {
        // Extract and save the identity and action
        console.log('[MicroAction] Completion detected:', completion);
        
        // Clean the response for display (remove the marker)
        const cleanResponse = cleanResponseForDisplay(assistantResponse);
        
        // Add assistant response to chat
        setMessages(prev => [...prev, { role: 'assistant', content: cleanResponse }]);
        
        // Save to database
        await completeMicroActionSetup(completion.identity, completion.action);
        
        // Update state
        setMicroActionState(prev => ({
          ...prev,
          conversationHistory: [...updatedHistory, { role: 'assistant', content: cleanResponse }],
          extractedIdentity: completion.identity,
          extractedAction: completion.action,
          isComplete: true,
          isActive: false,
          sprintStartDate: new Date().toISOString()
        }));
      } else {
        // Normal response - continue conversation
        setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse }]);
        
        // Update conversation history
        setMicroActionState(prev => ({
          ...prev,
          conversationHistory: [...updatedHistory, { role: 'assistant', content: assistantResponse }]
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
  }, [microActionState]);

  // Complete Micro-Action setup and save to database
  const completeMicroActionSetup = async (identity: string, action: string) => {
    console.log('[MicroAction] Setup complete:', { identity, action });
    
    try {
      const supabase = createClient();
      
      // Save identity and action to user_progress
      await supabase
        .from('user_progress')
        .update({
          current_identity: identity,
          micro_action: action,
          identity_sprint_start: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      // Refresh progress
      if (refetchProgress) {
        await refetchProgress();
      }
    } catch (error) {
      console.error('[MicroAction] Failed to save setup:', error);
    }
  };

  // Cancel Micro-Action setup (if user wants to exit)
  const cancelMicroActionSetup = useCallback(() => {
    console.log('[MicroAction] Setup cancelled');
    setMicroActionState(initialMicroActionState);
  }, []);

  // ============================================
  // FLOW BLOCK SETUP HANDLERS
  // ============================================
  
  // Start Flow Block setup flow (100% API version)
  const startFlowBlockSetup = useCallback(async () => {
    console.log('[FlowBlock] Starting setup flow (100% API)');
    
    // Initialize state
    setFlowBlockState(prev => ({
      ...prev,
      isSetupActive: true,
      conversationHistory: []
    }));
    
    // Show opening message
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: flowBlockOpeningMessage
    }]);
  }, []);

  // Process user response in Flow Block setup (100% API version)
  const processFlowBlockResponse = useCallback(async (userResponse: string) => {
    if (!flowBlockState.isSetupActive) return;
    
    console.log('[FlowBlock] Processing response (API):', userResponse);
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userResponse }]);
    setLoading(true);
    
    // Build conversation history for API
    const updatedHistory = [
      ...flowBlockState.conversationHistory,
      { role: 'user' as const, content: userResponse }
    ];
    
    try {
      // Call the main chat API with the Flow Block system prompt
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
      
      console.log('[FlowBlock] API response:', assistantResponse);
      
      // Check for completion marker
      const completion = parseFlowBlockCompletionMarker(assistantResponse);
      
      if (completion) {
        // Extract and save the configuration
        console.log('[FlowBlock] Completion detected:', completion);
        
        // Clean the response for display (remove the marker)
        const cleanResponse = cleanFlowBlockResponseForDisplay(assistantResponse);
        
        // Add assistant response to chat
        setMessages(prev => [...prev, { role: 'assistant', content: cleanResponse }]);
        
        // Save to database
        await completeFlowBlockSetup(completion);
        
        // Update state
        setFlowBlockState(prev => ({
          ...prev,
          conversationHistory: [...updatedHistory, { role: 'assistant', content: cleanResponse }],
          isSetupComplete: true,
          isSetupActive: false,
          weeklyMap: completion.weeklyMap,
          setupPreferences: completion.setupPreferences,
          sprintStartDate: completion.sprintStartDate,
          todaysBlock: getTodaysFlowBlock(completion.weeklyMap)
        }));
      } else {
        // Normal response - continue conversation
        setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse }]);
        
        // Update conversation history
        setFlowBlockState(prev => ({
          ...prev,
          conversationHistory: [...updatedHistory, { role: 'assistant', content: assistantResponse }]
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
  }, [flowBlockState]);

  // Complete Flow Block setup and save to database
  const completeFlowBlockSetup = async (config: FlowBlockConfig) => {
    console.log('[FlowBlock] Setup complete:', config);
    
    try {
      const supabase = createClient();
      
      // Insert into flow_block_config table
      const { error: insertError } = await supabase
        .from('flow_block_config')
        .upsert({
          user_id: user.id,
          domains: config.domains,
          weekly_map: config.weeklyMap,
          setup_preferences: config.setupPreferences,
          focus_type: config.focusType,
          sprint_start_date: config.sprintStartDate,
          sprint_number: config.sprintNumber,
          is_active: true
        }, { onConflict: 'user_id' });
      
      if (insertError) {
        console.error('[FlowBlock] Insert error:', insertError);
        throw insertError;
      }
      
      // Update user_progress to mark flow block setup as complete
      await supabase
        .from('user_progress')
        .update({ flow_block_setup_completed: true })
        .eq('user_id', user.id);
      
      // Refresh progress
      if (refetchProgress) {
        await refetchProgress();
      }
    } catch (error) {
      console.error('[FlowBlock] Failed to save setup:', error);
    }
  };

  // Cancel Flow Block setup (if user wants to exit)
  const cancelFlowBlockSetup = useCallback(() => {
    console.log('[FlowBlock] Setup cancelled');
    setFlowBlockState(prev => ({
      ...prev,
      isSetupActive: false,
      conversationHistory: []
    }));
  }, []);

  // ============================================
  // WEEKLY CHECK-IN HANDLERS
  // ============================================
  
  const processWeeklyCheckInResponse = async (userInput: string) => {
    const input = userInput.trim().toLowerCase();
    
    // Step 0: User confirms they want to start
    if (weeklyCheckInStep === 0) {
      const isAffirmative = ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'ready', 'let\'s go', 'lets go', 'y'].some(
        word => input.includes(word)
      );
      
      if (isAffirmative) {
        setWeeklyCheckInStep(1);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Great. Five quick ratings (0-5 scale).

${weeklyDomainQuestions.regulation}`
        }]);
      } else {
        // User declined
        setWeeklyCheckInActive(false);
        setWeeklyCheckInStep(0);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "No problem. The check-in will be here when you're ready. Just say 'weekly check-in' anytime."
        }]);
      }
      return;
    }
    
    // Parse numeric rating from input
    const ratingMatch = input.match(/[0-5]/);
    const rating = ratingMatch ? parseInt(ratingMatch[0]) : null;
    
    if (rating === null) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I need a number from 0-5. Try again?"
      }]);
      return;
    }
    
    // Steps 1-4: Domain ratings
    // Steps 5: Qualitative rating
    const currentStage = progress?.currentStage || 1;
    
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
        const qualQuestion = stageQualitativeQuestions[currentStage] || stageQualitativeQuestions[1];
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `**Stage ${currentStage} Competence Check:**

${qualQuestion} (0-5)`
        }]);
        break;
        
      case 5: // Qualitative - final step
        const finalScores = {
          ...weeklyCheckInScores,
          qualitative: rating
        };
        setWeeklyCheckInScores(finalScores);
        
        // Save to database and show results
        await saveWeeklyCheckIn(finalScores);
        break;
    }
  };
  
  const saveWeeklyCheckIn = async (scores: typeof weeklyCheckInScores) => {
    try {
      const supabase = createClient();
      const currentStage = progress?.currentStage || 1;
      
      // Get baseline for delta calculation
      const { data: baseline } = await supabase
        .from('baseline_assessments')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      const baselineScores = baseline ? {
        regulation: baseline.calm_core_score || 0,
        awareness: baseline.observer_index_score || 0,
        outlook: baseline.vitality_index_score || 0,
        attention: ((baseline.focus_diagnostic_score || 0) + (baseline.presence_test_score || 0)) / 2
      } : { regulation: 0, awareness: 0, outlook: 0, attention: 0 };
      
      // Calculate deltas
      const deltas = {
        regulation: (scores.regulation || 0) - baselineScores.regulation,
        awareness: (scores.awareness || 0) - baselineScores.awareness,
        outlook: (scores.outlook || 0) - baselineScores.outlook,
        attention: (scores.attention || 0) - baselineScores.attention
      };
      const avgDelta = (deltas.regulation + deltas.awareness + deltas.outlook + deltas.attention) / 4;
      
      // Insert into weekly_deltas
      const today = new Date().toISOString().split('T')[0];
      const { error: insertError } = await supabase
        .from('weekly_deltas')
        .upsert({
          user_id: user.id,
          week_of: today,
          regulation_score: scores.regulation,
          awareness_score: scores.awareness,
          outlook_score: scores.outlook,
          attention_score: scores.attention,
          regulation_delta: deltas.regulation,
          awareness_delta: deltas.awareness,
          outlook_delta: deltas.outlook,
          attention_delta: deltas.attention,
          average_delta: avgDelta,
          qualitative_rating: scores.qualitative,
          stage_at_checkin: currentStage
        }, { onConflict: 'user_id,week_of' });
      
      if (insertError) {
        console.error('[WeeklyCheckIn] Insert error:', insertError);
        throw insertError;
      }
      
      console.log('[WeeklyCheckIn] Saved successfully');
      
      // Refresh progress
      if (refetchProgress) {
        await refetchProgress();
      }
      
      // Calculate results and show feedback
      const avgScore = ((scores.regulation || 0) + (scores.awareness || 0) + 
                        (scores.outlook || 0) + (scores.attention || 0)) / 4;
      const rewiredIndex = Math.round(avgScore * 20);
      const qualRating = scores.qualitative || 0;
      
      // Check unlock criteria (internal thresholds - not shown to user)
      // Stage 6→7 is manual review only, so no threshold for Stage 6
      const unlockThresholds: { [key: number]: { adherence: number; days: number; delta: number; qualitative: number } } = {
        1: { adherence: 80, days: 14, delta: 0.3, qualitative: 3 },
        2: { adherence: 80, days: 14, delta: 0.5, qualitative: 3 },
        3: { adherence: 80, days: 14, delta: 0.5, qualitative: 3 },
        4: { adherence: 80, days: 14, delta: 0.6, qualitative: 3 },
        5: { adherence: 85, days: 14, delta: 0.7, qualitative: 3 }
      };
      
      // Competence threshold - if score is this high, delta requirement is waived
      const COMPETENCE_THRESHOLD = 4.0;
      
      const threshold = unlockThresholds[currentStage];
      const adherence = progress?.adherencePercentage || 0;
      const consecutiveDays = progress?.consecutiveDays || 0;
      
      let feedbackMessage = `**Weekly Check-In Complete** ✓

**Your Scores:**
• Regulation: ${scores.regulation}/5
• Awareness: ${scores.awareness}/5
• Outlook: ${scores.outlook}/5
• Attention: ${scores.attention}/5
• Stage Competence: ${scores.qualitative}/5

**REwired Index:** ${rewiredIndex}/100
**Average Delta from Baseline:** ${avgDelta >= 0 ? '+' : ''}${avgDelta.toFixed(2)}

---

`;

      if (currentStage === 6) {
        // Stage 6→7 is manual review only
        feedbackMessage += `**Stage 7 (Accelerated Expansion):**
This is an advanced tier requiring application and manual review. When you're ready to explore advanced protocols (supplements, nootropics, neurofeedback, psychedelics), let me know and we'll discuss the application process.`;
      } else if (threshold && currentStage < 6) {
        const meetsAdherence = adherence >= threshold.adherence;
        const meetsDays = consecutiveDays >= threshold.days;
        const meetsQualitative = qualRating >= threshold.qualitative;
        
        // HYBRID: Either improvement (delta) OR existing competence (high score)
        const meetsDelta = avgDelta >= threshold.delta;
        const alreadyCompetent = avgScore >= COMPETENCE_THRESHOLD;
        const meetsTransformation = meetsDelta || alreadyCompetent;
        
        if (meetsAdherence && meetsDays && meetsTransformation && meetsQualitative) {
          feedbackMessage += `**🎉 You've met all criteria for Stage ${currentStage + 1}!**

The unlock prompt should appear shortly.`;
        } else {
          // Softer feedback without exact numbers
          const statusItems: string[] = [];
          
          statusItems.push(`• Consistency: ${meetsAdherence ? '✓ Strong' : 'Building...'}`);
          statusItems.push(`• Daily Practice: ${meetsDays ? '✓ Established' : 'Keep showing up'}`);
          
          // Show transformation status with context
          if (meetsTransformation) {
            statusItems.push(`• Transformation: ✓ ${alreadyCompetent ? 'Strong baseline' : 'Measurable growth'}`);
          } else {
            statusItems.push(`• Transformation: In progress`);
          }
          
          statusItems.push(`• Stage Competence: ${meetsQualitative ? '✓ Ready' : 'Developing'}`);
          
          feedbackMessage += `**Stage ${currentStage + 1} Readiness:**
${statusItems.join('\n')}`;

          // Add focus area if something specific is lagging
          if (!meetsQualitative) {
            feedbackMessage += `\n\n**Focus Area:** ${stageQualitativeQuestions[currentStage]} Keep practicing until this feels more natural.`;
          } else if (!meetsDays) {
            feedbackMessage += `\n\n**Focus Area:** Keep showing up daily. Consistency is what rewires the nervous system.`;
          } else if (!meetsTransformation) {
            feedbackMessage += `\n\n**Focus Area:** The practices are landing. Trust the process - transformation takes time.`;
          }
        }
      }
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: feedbackMessage
      }]);
      
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
      
    } catch (error) {
      console.error('[WeeklyCheckIn] Error saving:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "There was an error saving your check-in. Let's try again later."
      }]);
      setWeeklyCheckInActive(false);
      setWeeklyCheckInStep(0);
    }
  };

  // Initialize conversation with appropriate opening
  useEffect(() => {
    if (hasInitialized.current) return;
    
    const initConversation = async () => {
      try {
        if (!baselineData || !user) {
          setError('Missing data. Please complete assessment.');
          setIsInitializing(false);
          return;
        }

        const supabase = createClient();
        
        // Check progress data from user_progress (using correct column names)
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('system_initialized, baseline_completed, adherence_percentage, consecutive_days, stage_start_date, ritual_intro_completed, updated_at, current_stage')
          .eq('user_id', user.id)
          .single();
        
        const lastVisit = progressData?.updated_at || null;
        const hasCompletedOnboarding = progressData?.system_initialized || false;
        const hasCompletedRitualIntro = progressData?.ritual_intro_completed || false;
        const currentStage = progressData?.current_stage || 1;
        
        console.log('[ChatInterface] Stage from DB:', progressData?.current_stage, '-> Using:', currentStage);
        console.log('[ChatInterface] Progress data:', progressData);
        
        // Get today's completed practices from practice_logs
        const today = new Date();
        const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const { data: practiceLogsData } = await supabase
          .from('practice_logs')
          .select('practice_type')
          .eq('user_id', user.id)
          .eq('practice_date', localDate)
          .eq('completed', true);
        
        // Build completed practices array
        const completedPractices = practiceLogsData 
          ? practiceLogsData.map((p: { practice_type: string }) => p.practice_type)
          : [];
        
        if (completedPractices.length > 0) {
          setPracticesCompletedToday(completedPractices);
        }
        
        // Determine opening type
        const detectedOpeningType = determineOpeningType(lastVisit, hasCompletedOnboarding);
        setOpeningType(detectedOpeningType);
        
        // If first time AND ritual intro not completed, start at step 0
        // If first time but ritual intro already completed (e.g., refreshed page), skip to step 4
        // If returning user, skip intro entirely (step 4)
        if (detectedOpeningType === 'first_time') {
          setIntroStep(hasCompletedRitualIntro ? 4 : 0);
        } else {
          setIntroStep(4); // Returning users skip intro
        }
        
        // Get user's first name
        const userName = user?.user_metadata?.first_name || '';
        
        // Generate appropriate opening message
        let openingMessage: string;
        
        switch (detectedOpeningType) {
          case 'first_time':
            openingMessage = await getFirstTimeOpeningMessage(baselineData, userName);
            // Mark onboarding as completed
            await supabase
              .from('user_progress')
              .update({ 
                system_initialized: true
              })
              .eq('user_id', user.id);
            break;
            
          case 'same_day':
            openingMessage = getSameDayReturnMessage(baselineData, progressData, currentStage, completedPractices);
            break;
            
          case 'new_day':
            openingMessage = getNewDayMorningMessage(baselineData, progressData, userName, currentStage);
            break;
            
          default:
            openingMessage = await getFirstTimeOpeningMessage(baselineData, userName);
        }
        
        // Set the opening message
        setMessages([{ role: 'assistant', content: openingMessage }]);
        
        hasInitialized.current = true;
        setIsInitializing(false);
        
      } catch (error) {
        console.error('Error initializing:', error);
        // Fallback to first-time message if anything fails
        const userName = user?.user_metadata?.first_name || '';
        const openingMessage = await getFirstTimeOpeningMessage(baselineData, userName);
        setMessages([{ role: 'assistant', content: openingMessage }]);
        hasInitialized.current = true;
        setIsInitializing(false);
      }
    };

    if (user && baselineData) {
      initConversation();
    }
  }, [user, baselineData]);

  // ============================================
  // 21-DAY IDENTITY SPRINT CHECK
  // ============================================
  useEffect(() => {
    // Only check after initialization is complete and we have progress
    if (isInitializing || !progress || !hasInitialized.current) return;
    // Don't trigger if any other flow is active
    if (weeklyCheckInActive || awaitingMicroActionStart || microActionState.isActive) return;
    if (awaitingFlowBlockStart || flowBlockState.isSetupActive) return;
    if (unlockFlowState !== 'none') return;
    
    const extendedProgress = progress as any;
    const sprintStartDate = extendedProgress?.identitySprintStart;
    const hasIdentity = !!(extendedProgress?.currentIdentity);
    
    // Only check if they have an identity
    if (!hasIdentity || !sprintStartDate) return;
    
    // Calculate days since sprint started
    const startDate = new Date(sprintStartDate);
    const today = new Date();
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log('[MicroAction] Sprint check: days since start =', daysSinceStart);
    
    // If 21+ days, prompt for renewal
    if (daysSinceStart >= 21) {
      // Only show once per session
      const shownKey = `sprint_renewal_shown_${sprintStartDate}`;
      if (sessionStorage.getItem(shownKey)) return;
      sessionStorage.setItem(shownKey, 'true');
      
      // Mark that we're handling a prompt (prevents weekly check-in from also firing)
      hasCheckedWeeklyDue.current = true;
      
      const identity = extendedProgress?.currentIdentity || '';
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `**21-Day Identity Sprint Complete!** 🎉

You've been embodying *"${identity}"* for ${daysSinceStart} days. That's real neural rewiring.

How did it feel? Three options:

1. **Continue** - This identity is becoming second nature, keep reinforcing it
2. **Evolve** - Build on this foundation with a deeper or adjacent identity  
3. **Pivot** - Try a completely different identity for your next sprint

What feels right?`
      }]);
      
      // Set flag to watch for their response
      setAwaitingSprintRenewal(true);
    }
  }, [progress, isInitializing, weeklyCheckInActive, awaitingMicroActionStart, microActionState.isActive, unlockFlowState, awaitingFlowBlockStart, flowBlockState.isSetupActive]);

  // ============================================
  // WEEKLY CHECK-IN DETECTION
  // ============================================
  useEffect(() => {
    // Only check once per session, after initialization, and when not in other flows
    if (hasCheckedWeeklyDue.current || isInitializing || !progress || !hasInitialized.current) return;
    if (weeklyCheckInActive || awaitingSprintRenewal || awaitingMicroActionStart || microActionState.isActive) return;
    if (awaitingFlowBlockStart || flowBlockState.isSetupActive) return;
    if (unlockFlowState !== 'none') return;
    
    const checkWeeklyDue = async () => {
      try {
        const supabase = createClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) return;
        
        // Get the most recent weekly delta entry
        const { data: lastCheckIn } = await supabase
          .from('weekly_deltas')
          .select('week_of')
          .eq('user_id', currentUser.id)
          .order('week_of', { ascending: false })
          .limit(1)
          .single();
        
        const today = new Date();
        let daysSinceLastCheckIn = 999; // Default to long time if no check-in exists
        
        if (lastCheckIn?.week_of) {
          const lastDate = new Date(lastCheckIn.week_of);
          daysSinceLastCheckIn = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        }
        
        console.log('[WeeklyCheckIn] Days since last check-in:', daysSinceLastCheckIn);
        
        // If 7+ days since last check-in (or never done), prompt for check-in
        if (daysSinceLastCheckIn >= 7) {
          hasCheckedWeeklyDue.current = true;
          
          // Only show once per session
          const shownKey = `weekly_checkin_shown_${today.toISOString().split('T')[0]}`;
          if (sessionStorage.getItem(shownKey)) return;
          sessionStorage.setItem(shownKey, 'true');
          
          // Small delay to let other messages settle
          setTimeout(() => {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: `**Weekly Check-In Time** 📊

It's been ${daysSinceLastCheckIn === 999 ? 'a while' : daysSinceLastCheckIn + ' days'} since your last check-in. This quick assessment helps track your progress and determines when you're ready for the next stage.

Takes about 2 minutes. Ready to start?`
            }]);
            
            // We'll handle the response in sendMessage
            setWeeklyCheckInActive(true);
            setWeeklyCheckInStep(0);
          }, 1500);
        }
      } catch (error) {
        console.error('[WeeklyCheckIn] Error checking due date:', error);
      }
    };
    
    checkWeeklyDue();
  }, [progress, isInitializing, weeklyCheckInActive, awaitingSprintRenewal, awaitingMicroActionStart, microActionState.isActive, unlockFlowState, awaitingFlowBlockStart, flowBlockState.isSetupActive]);

  // Handle quick reply button clicks (no API call)
  const handleQuickReply = async (step: number) => {
    const replyConfig = introQuickReplies[step];
    if (!replyConfig) return;
    
    // Add user's reply to messages
    const userMessage = { role: 'user', content: replyConfig.text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    
    // Determine next template message based on current step
    let assistantResponse = '';
    let nextStep = step + 1;
    
    switch (step) {
      case 0:
        // User said yes to learning rituals -> show ritual 1
        assistantResponse = ritualIntroTemplates.ritual1Intro;
        break;
      case 1:
        // User confirmed ritual 1 -> show ritual 2
        assistantResponse = ritualIntroTemplates.ritual2Intro;
        break;
      case 2:
        // User confirmed ritual 2 -> show wrap-up
        assistantResponse = ritualIntroTemplates.wrapUp;
        nextStep = 4; // Skip to complete (step 3 is wrap-up display, step 4 is free text)
        
        // Mark ritual intro as completed in database
        try {
          const supabase = createClient();
          await supabase
            .from('user_progress')
            .update({ ritual_intro_completed: true })
            .eq('user_id', user.id);
        } catch (err) {
          console.error('Failed to mark ritual intro complete:', err);
        }
        break;
      default:
        return;
    }
    
    // Add assistant response
    setMessages([...newMessages, { role: 'assistant', content: assistantResponse }]);
    setIntroStep(nextStep);
  };

  const sendToAPI = async (messageHistory: Message[]) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messageHistory,
          userId: user?.id,
          baselineData: baselineData,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      // After a successful API call that might have logged a practice,
      // refresh the progress to update sidebar
      if (refetchProgress) {
        setTimeout(() => refetchProgress(), 500);
      }
      
      return data.content[0].text;
    } catch (error) {
      console.error('sendToAPI error:', error);
      setError(`API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userInput = input.trim().toLowerCase();
    
    // ============================================
    // MANUAL WEEKLY CHECK-IN TRIGGER
    // ============================================
    if (userInput.includes('weekly check') || userInput === 'check in' || userInput === 'check-in') {
      if (!weeklyCheckInActive) {
        setMessages(prev => [...prev, 
          { role: 'user', content: input.trim() },
          { role: 'assistant', content: `**Weekly Check-In** 📊

This quick assessment helps track your progress and determines when you're ready for the next stage.

Takes about 2 minutes. Ready to start?` }
        ]);
        setInput('');
        setWeeklyCheckInActive(true);
        setWeeklyCheckInStep(0);
        return;
      }
    }
    
    // ============================================
    // SPRINT RENEWAL HANDLING (after 21-day sprint complete)
    // ============================================
    if (awaitingSprintRenewal) {
      setMessages(prev => [...prev, { role: 'user', content: input.trim() }]);
      setInput('');
      setAwaitingSprintRenewal(false);
      
      const isContinue = userInput.includes('continue') || userInput.includes('keep') || userInput === '1';
      const isEvolve = userInput.includes('evolve') || userInput.includes('build') || userInput.includes('deeper') || userInput === '2';
      const isPivot = userInput.includes('pivot') || userInput.includes('different') || userInput.includes('new') || userInput === '3';
      
      if (isContinue) {
        // Reset sprint start date for continuation
        try {
          const supabase = createClient();
          await supabase
            .from('user_progress')
            .update({ identity_sprint_start: new Date().toISOString() })
            .eq('user_id', user.id);
          
          if (refetchProgress) await refetchProgress();
        } catch (error) {
          console.error('Error resetting sprint:', error);
        }
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Sprint renewed. You're continuing with your current identity for another 21 days. Keep stacking that proof - each day deepens the neural pathway.`
        }]);
      } else if (isEvolve || isPivot) {
        // Start new identity setup
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Great - let's ${isEvolve ? 'evolve' : 'explore a new direction'}. I'll guide you through selecting your next identity.`
        }]);
        await startMicroActionSetup();
      } else {
        // Unclear response - start setup anyway
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Let's figure out what's next together. I'll guide you through the identity selection.`
        }]);
        await startMicroActionSetup();
      }
      return;
    }
    
    // ============================================
    // WEEKLY CHECK-IN FLOW HANDLING
    // ============================================
    if (weeklyCheckInActive) {
      setMessages(prev => [...prev, { role: 'user', content: input.trim() }]);
      setInput('');
      await processWeeklyCheckInResponse(input.trim());
      return;
    }
    
    // ============================================
    // AWAITING MICRO-ACTION START (after Stage 3 unlock intro)
    // ============================================
    if (awaitingMicroActionStart) {
      const isAffirmative = ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'ready', 'let\'s go', 'lets go', 'go', 'y', 'absolutely', 'yes please'].includes(userInput) ||
                           userInput.includes('yes') || 
                           userInput.includes('ready') ||
                           userInput.includes('let\'s do');
      
      // Add user message
      setMessages(prev => [...prev, { role: 'user', content: input.trim() }]);
      setInput('');
      setAwaitingMicroActionStart(false);
      
      if (isAffirmative) {
        // Start the Micro-Action setup
        await startMicroActionSetup();
      } else {
        // User declined for now
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "No problem. When you're ready to set up your identity, just click the Morning Micro-Action in the sidebar or say 'set up my identity'. The practice will be waiting for you." 
        }]);
      }
      return;
    }
    
    // ============================================
    // AWAITING FLOW BLOCK START (after Stage 4 unlock intro)
    // ============================================
    if (awaitingFlowBlockStart) {
      const isAffirmative = ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'ready', 'let\'s go', 'lets go', 'go', 'y', 'absolutely', 'yes please'].includes(userInput) ||
                           userInput.includes('yes') || 
                           userInput.includes('ready') ||
                           userInput.includes('let\'s do');
      
      // Add user message
      setMessages(prev => [...prev, { role: 'user', content: input.trim() }]);
      setInput('');
      setAwaitingFlowBlockStart(false);
      
      if (isAffirmative) {
        // Start the Flow Block setup
        await startFlowBlockSetup();
      } else {
        // User declined for now
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "No problem. When you're ready to set up your Flow Blocks, just click the Flow Block in the sidebar or say 'set up my flow blocks'. The practice will be waiting for you." 
        }]);
      }
      return;
    }
    
    // ============================================
    // MICRO-ACTION SETUP FLOW HANDLING (100% API)
    // ============================================
    if (microActionState.isActive) {
      console.log('[sendMessage] Routing to Micro-Action setup flow (API)');
      setInput('');
      await processMicroActionResponse(input.trim());
      return;
    }
    
    // ============================================
    // FLOW BLOCK SETUP FLOW HANDLING (100% API)
    // ============================================
    if (flowBlockState.isSetupActive) {
      console.log('[sendMessage] Routing to Flow Block setup flow (API)');
      setInput('');
      await processFlowBlockResponse(input.trim());
      return;
    }
    
    // Check if we're in intro flow and user types something that should use template
    // (for first-time users who type instead of clicking button)
    if (openingType === 'first_time' && introStep < 3) {
      const isAffirmative = ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'ready', 'let\'s go', 'lets go', 'go', 'y'].includes(userInput) ||
                           userInput.includes('yes') || 
                           userInput.includes('ready') ||
                           userInput.includes('got it') ||
                           userInput.includes('makes sense') ||
                           userInput.includes('next');
      
      if (isAffirmative) {
        // Treat as quick reply
        setInput('');
        handleQuickReply(introStep);
        return;
      }
    }
    
    // Track if user escaped intro to ask a question
    const escapedIntro = openingType === 'first_time' && introStep < 4;

    setError(null);
    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const response = await sendToAPI(newMessages);
    if (response) {
      let finalMessages = [...newMessages, { role: 'assistant', content: response }];
      
      // If they escaped intro to ask a question, add a redirect prompt after Claude's response
      if (escapedIntro) {
        const redirectMessage = getIntroRedirectMessage(introStep);
        finalMessages = [...finalMessages, { role: 'assistant', content: redirectMessage }];
        // Don't change introStep - keep them at their current position so button still works
      }
      
      setMessages(finalMessages);
    }
    setLoading(false);
  };

  // ============================================
  // PRACTICE CLICK HANDLER - NOW USES TEMPLATES
  // ============================================
  const handlePracticeClick = async (practiceId: string) => {
    // If in intro flow, complete it first
    if (introStep < 4) {
      setIntroStep(4);
    }
    
    const normalizedId = normalizePracticeId(practiceId);
    const practiceName = practiceIdToName[normalizedId] || practiceId;
    
    // ============================================
    // MICRO-ACTION SPECIAL HANDLING
    // ============================================
    if (normalizedId === 'micro_action') {
      const extendedProgress = progress as any;
      const hasIdentity = !!(extendedProgress?.currentIdentity);
      const currentIdentity = extendedProgress?.currentIdentity || '';
      const microAction = extendedProgress?.microAction || '';
      
      if (!hasIdentity) {
        // No identity set - trigger setup flow
        const userMessage = { role: 'user', content: `I want to set up my Morning Micro-Action.` };
        setMessages(prev => [...prev, userMessage]);
        await startMicroActionSetup();
        return;
      }
      
      // Identity exists - this is a "log completion" action
      // Add user message
      setMessages(prev => [...prev, { role: 'user', content: `I completed my Morning Micro-Action.` }]);
      setLoading(true);
      
      try {
        // Log the practice completion
        const supabase = createClient();
        const today = new Date();
        const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        // Get current stage from progress
        const currentStage = progress?.currentStage || 3; // Default to 3 since micro_action is Stage 3+
        
        const insertPayload = {
          user_id: user.id,
          practice_type: 'micro_action',
          practice_date: localDate,
          completed: true,
          stage: currentStage,
          completed_at: new Date().toISOString()
        };
        
        console.log('[MicroAction] Inserting practice log:', insertPayload);
        
        const { data: insertData, error: insertError } = await supabase
          .from('practice_logs')
          .insert(insertPayload)
          .select();
        
        console.log('[MicroAction] Insert response - data:', insertData, 'error:', insertError);
        
        if (insertError) {
          console.error('[MicroAction] Insert error:', insertError);
          throw insertError;
        }
        
        console.log('[MicroAction] Insert success:', insertData);
        
        // Refresh progress to update button state
        console.log('[MicroAction] Calling refetchProgress...');
        if (refetchProgress) {
          await refetchProgress();
          console.log('[MicroAction] refetchProgress completed');
        } else {
          console.log('[MicroAction] refetchProgress not available!');
        }
        
        // Add confirmation message
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `**Identity proof logged.** ✓

You acted as: *${currentIdentity}*

Evidence: ${microAction}

Each completion reinforces the neural pathway. You're not just doing an action - you're becoming this person. Keep stacking proof.` 
        }]);
      } catch (error) {
        console.error('Error logging micro-action:', error);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Micro-action logged. Keep building that identity proof! 💪` 
        }]);
      }
      
      setLoading(false);
      return;
    }
    
    // ============================================
    // FLOW BLOCK SPECIAL HANDLING
    // ============================================
    if (normalizedId === 'flow_block') {
      if (!flowBlockState.isSetupComplete) {
        // No flow block setup yet - trigger setup flow
        const userMessage = { role: 'user', content: `I want to set up my Flow Blocks.` };
        setMessages(prev => [...prev, userMessage]);
        await startFlowBlockSetup();
        return;
      }
      
      // Flow block is set up - show today's block or log completion
      const todaysBlock = getTodaysFlowBlock(flowBlockState.weeklyMap);
      
      if (!todaysBlock) {
        // No block scheduled today (weekend)
        setMessages(prev => [...prev, 
          { role: 'user', content: `I want to do my Flow Block.` },
          { role: 'assistant', content: `No Flow Block scheduled for today. Your blocks run Monday-Friday. Enjoy the rest! 🌟` }
        ]);
        return;
      }
      
      // Show today's block info and offer to start/complete
      setMessages(prev => [...prev, { role: 'user', content: `I want to do my Flow Block.` }]);
      setLoading(true);
      
      // Check if already completed today
      const supabase = createClient();
      const today = new Date();
      const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      const { data: existingLog } = await supabase
        .from('practice_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('practice_type', 'flow_block')
        .eq('practice_date', localDate)
        .single();
      
      if (existingLog) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Your Flow Block for today is already logged! ✓

**${todaysBlock.task}** (${todaysBlock.domain})

Great work staying consistent. See you tomorrow for the next block.` 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `**Today's Flow Block** 🎯

**Task:** ${todaysBlock.task}
**Domain:** ${todaysBlock.domain}
**Type:** ${todaysBlock.flowType} / ${todaysBlock.category}
**Duration:** ${todaysBlock.duration} minutes

**Setup Check:**
${flowBlockState.setupPreferences ? `
• Location: ${todaysBlock.domain === 'Professional' ? flowBlockState.setupPreferences.professionalLocation : flowBlockState.setupPreferences.personalLocation}
• Playlist: ${flowBlockState.setupPreferences.playlist}
• Timer: ${flowBlockState.setupPreferences.timerMethod}
• Notifications: OFF` : ''}

**Intention:** "For the next ${todaysBlock.duration} minutes, my only job is ${todaysBlock.task}."

Say **"starting"** when you begin, and **"done"** when complete to log your performance metrics.` 
        }]);
      }
      
      setLoading(false);
      return;
    }
    
    // Add user message
    const practiceMessage = `I want to do the ${practiceName} practice now.`;
    const userMessage = { role: 'user', content: practiceMessage };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    
    // Build contexts for template selection
    const templateContext = buildTemplateContext();
    const selectionContext = buildSelectionContext();
    
    // Select template
    const trigger: TemplateTrigger = { 
      type: 'practice_click', 
      practiceId: normalizedId,
      practiceName 
    };
    
    const result = selectTemplate(trigger, selectionContext);
    
    if (result.template) {
      // Process template with variables
      const processedContent = processTemplate(result.template, templateContext);
      setMessages([...newMessages, { role: 'assistant', content: processedContent }]);
    } else {
      // Fallback to API if no template
      setLoading(true);
      const response = await sendToAPI(newMessages);
      if (response) {
        setMessages([...newMessages, { role: 'assistant', content: response }]);
      }
      setLoading(false);
    }
  };

  // ============================================
  // TOOL CLICK HANDLER - HYBRID: TEMPLATE + API
  // ============================================
  const handleToolClick = async (toolId: string) => {
    // If in intro flow, complete it first
    if (introStep < 4) {
      setIntroStep(4);
    }
    
    const toolMessage = `I want to run the ${toolId} protocol.`;
    const userMessage = { role: 'user', content: toolMessage };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    
    // Build contexts
    const templateContext = buildTemplateContext();
    const selectionContext = buildSelectionContext();
    
    // Select template
    const trigger: TemplateTrigger = { type: 'tool_click', toolId };
    const result = selectTemplate(trigger, selectionContext);
    
    if (result.template && !result.additionalContext?.markToolIntroduced) {
      // Tool has been introduced before - show start prompt, then let API take over
      const processedContent = processTemplate(result.template, templateContext);
      setMessages([...newMessages, { role: 'assistant', content: processedContent }]);
      // Note: The next user input will go to API for dynamic tool execution
    } else if (result.template) {
      // First time introduction - show intro, mark as introduced
      const processedContent = processTemplate(result.template, templateContext);
      setMessages([...newMessages, { role: 'assistant', content: processedContent }]);
      
      // Mark tool as introduced in database
      if (result.additionalContext?.markToolIntroduced) {
        try {
          const supabase = createClient();
          const extendedProgress = progress as any;
          const currentTools = extendedProgress?.toolsIntroduced || [];
          await supabase
            .from('user_progress')
            .update({ 
              tools_introduced: [...currentTools, toolId]
            })
            .eq('user_id', user.id);
        } catch (err) {
          console.error('Failed to mark tool introduced:', err);
        }
      }
    } else {
      // No template - use API directly
      setLoading(true);
      const response = await sendToAPI(newMessages);
      if (response) {
        setMessages([...newMessages, { role: 'assistant', content: response }]);
      }
      setLoading(false);
    }
  };

  // Callback for ToolsSidebar/FAB to trigger progress refresh only
  const handleProgressUpdate = useCallback(async () => {
    if (refetchProgress) {
      await refetchProgress();
    }
  }, [refetchProgress]);

  // ============================================
  // PRACTICE COMPLETED HANDLER - NOW USES TEMPLATES
  // ============================================
  const handlePracticeCompleted = useCallback(async (practiceId: string, practiceName: string) => {
    console.log('[ChatInterface] Practice completed:', practiceId, practiceName);
    
    // First, refresh progress to update sidebar
    if (refetchProgress) {
      refetchProgress();
    }
    
    // If still in intro, complete it
    if (introStep < 4) {
      setIntroStep(4);
    }
    
    const normalizedId = normalizePracticeId(practiceId);
    
    // Update local state for practices completed today
    const updatedPracticesCompleted = [...practicesCompletedToday, normalizedId];
    setPracticesCompletedToday(updatedPracticesCompleted);
    
    // Create completion message
    const completionNotification = `[PRACTICE COMPLETED] I just finished my ${practiceName} ritual and clicked "Done" to log it.`;
    const userMessage = { role: 'user', content: completionNotification };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    
    // Build contexts
    const templateContext = buildTemplateContext();
    const selectionContext = {
      ...buildSelectionContext(),
      practicesCompletedToday: updatedPracticesCompleted
    };
    
    // Select template
    const trigger: TemplateTrigger = { 
      type: 'practice_completed', 
      practiceId: normalizedId,
      practiceName 
    };
    
    const result = selectTemplate(trigger, selectionContext);
    
    if (result.template) {
      // Process template with variables
      const processedContent = processTemplate(result.template, templateContext);
      setMessages([...newMessages, { role: 'assistant', content: processedContent }]);
    } else {
      // Fallback to API if no template
      setLoading(true);
      const response = await sendToAPI(newMessages);
      if (response) {
        setMessages([...newMessages, { role: 'assistant', content: response }]);
      }
      setLoading(false);
    }
  }, [messages, refetchProgress, introStep, practicesCompletedToday, buildTemplateContext, buildSelectionContext]);

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="flex h-screen bg-[#0a0a0a] items-center justify-center">
        <div className="text-center">
          <div className="flex gap-2 justify-center mb-4">
            <div className="w-3 h-3 bg-[#ff9e19] rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-[#ff9e19] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-3 h-3 bg-[#ff9e19] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-gray-400">Initializing IOS System...</p>
        </div>
      </div>
    );
  }

  if (error || progressError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0a]">
        <div className="max-w-md p-8 rounded-lg bg-[#111111] border border-gray-800">
          <h2 className="text-xl font-bold mb-4 text-[#ff9e19]">Error</h2>
          <p className="text-gray-400 mb-4">{error || progressError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#ff9e19] text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white">
      {/* Left Sidebar - Dashboard (Desktop Only) */}
      {!isMobile && (
        <aside className="w-72 bg-[#111111] border-r border-gray-800 flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-gray-800">
            <h1 className="text-xl font-bold text-[#ff9e19]">IOS Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">Welcome{getUserName() ? `, ${getUserName()}` : ''}</p>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Current Stage */}
            <div className="p-3 bg-[#1a1a1a] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 uppercase tracking-wider">Current Stage</span>
                <span className="text-sm font-bold text-[#ff9e19]">{progress?.currentStage || 1}/7</span>
              </div>
              <p className="text-white font-semibold">{getStageName(progress?.currentStage || 1)}</p>
            </div>

            {/* REwired Index */}
            <div className="p-3 bg-[#1a1a1a] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 uppercase tracking-wider">REwired Index</span>
                <span className={`text-sm font-bold ${getStatusColor(baselineData.rewiredIndex)}`}>
                  {baselineData.rewiredIndex}/100
                </span>
              </div>
              <div className="w-full rounded-full h-2 bg-[#2a2a2a]">
                <div 
                  className={`h-2 rounded-full transition-all ${getStatusColor(baselineData.rewiredIndex).replace('text-', 'bg-')}`}
                  style={{ width: `${baselineData.rewiredIndex}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">{getStatusTier(baselineData.rewiredIndex)}</p>
            </div>

            {/* Domain Scores */}
            <div className="p-3 bg-[#1a1a1a] rounded-lg">
              <span className="text-xs text-gray-400 uppercase tracking-wider block mb-3">Domain Scores</span>
              
              {/* Regulation */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Regulation</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#10b981]">
                      {(progress?.domainScores?.regulation ?? baselineData.domainScores.regulation).toFixed(1)}/5
                    </span>
                    {progress?.domainDeltas?.regulation !== undefined && progress.domainDeltas.regulation !== 0 && (
                      <span className={`text-xs font-medium ${progress.domainDeltas.regulation > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {progress.domainDeltas.regulation > 0 ? '↑' : '↓'}{Math.abs(progress.domainDeltas.regulation).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full rounded-full h-2 bg-[#1a1a1a]">
                  <div 
                    className="h-2 rounded-full transition-all bg-[#10b981]"
                    style={{ width: `${((progress?.domainScores?.regulation ?? baselineData.domainScores.regulation) / 5) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Awareness */}
              <div className="mb-3">
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
                <div className="w-full rounded-full h-2 bg-[#1a1a1a]">
                  <div 
                    className="h-2 rounded-full transition-all bg-[#3b82f6]"
                    style={{ width: `${((progress?.domainScores?.awareness ?? baselineData.domainScores.awareness) / 5) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Outlook */}
              <div className="mb-3">
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
                <div className="w-full rounded-full h-2 bg-[#1a1a1a]">
                  <div 
                    className="h-2 rounded-full transition-all bg-[#f59e0b]"
                    style={{ width: `${((progress?.domainScores?.outlook ?? baselineData.domainScores.outlook) / 5) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Attention */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Attention</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#8b5cf6]">
                      {(progress?.domainScores?.attention ?? baselineData.domainScores.attention).toFixed(1)}/5
                    </span>
                    {progress?.domainDeltas?.attention !== undefined && progress.domainDeltas.attention !== 0 && (
                      <span className={`text-xs font-medium ${progress.domainDeltas.attention > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {progress.domainDeltas.attention > 0 ? '↑' : '↓'}{Math.abs(progress.domainDeltas.attention).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full rounded-full h-2 bg-[#1a1a1a]">
                  <div 
                    className="h-2 rounded-full transition-all bg-[#8b5cf6]"
                    style={{ width: `${((progress?.domainScores?.attention ?? baselineData.domainScores.attention) / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Average Delta indicator */}
              {progress?.domainDeltas?.average !== undefined && progress.domainDeltas.average !== 0 && (
                <div className="mt-2 pt-2 border-t border-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Avg. Weekly Delta</span>
                    <span className={`text-sm font-semibold ${progress.domainDeltas.average > 0 ? 'text-green-400' : progress.domainDeltas.average < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {progress.domainDeltas.average > 0 ? '+' : ''}{progress.domainDeltas.average.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
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
                  Learn the new practices
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
                    : flowBlockState.isSetupActive
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
                : flowBlockState.isSetupActive
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
    </div>
  );
}
