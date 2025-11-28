'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useIsMobile } from '@/app/hooks/useIsMobile';
import { useUserProgress } from '@/app/hooks/useUserProgress';
import ToolsSidebar from '@/components/ToolsSidebar';
import FloatingActionButton from '@/components/FloatingActionButton';
import MobileDashboard from '@/components/MobileDashboard';
import { createClient } from '@/lib/supabase-client';

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
function getSameDayReturnMessage(data: BaselineData, progress: ProgressData | null): string {
  const completedToday = progress?.adherence_percentage ? progress.adherence_percentage > 0 : false;
  
  if (completedToday) {
    return `Welcome back. Good to see you.

Looks like you've already logged rituals today. What do you need?

• Continue a conversation
• Run an on-demand protocol (Reframe, Thought Hygiene, Decentering)
• Check your progress
• Ask a question

What's on your mind?`;
  }
  
  return `Welcome back.

Your morning rituals are waiting. Ready to run through them now, or is there something else you need first?`;
}

// RETURNING USER (new day): Morning ritual prompt
function getNewDayMorningMessage(data: BaselineData, progress: ProgressData | null, userName: string): string {
  const rituals = stageRituals[data.currentStage] || stageRituals[1];
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

**Stage ${data.currentStage}: ${getStageName(data.currentStage)}** — Day ${daysInStage}
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
  
  // NEW: Track position in ritual introduction flow
  // 0 = waiting for "yes" to learn rituals
  // 1 = showed ritual 1, waiting for confirmation
  // 2 = showed ritual 2, waiting for confirmation
  // 3 = showed wrap-up, intro complete
  // 4+ = intro complete, free text mode
  const [introStep, setIntroStep] = useState<number>(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasInitialized = useRef<boolean>(false);

  const isMobile = useIsMobile();
  const { progress, loading: progressLoading, error: progressError, refetchProgress, isRefreshing } = useUserProgress();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

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
        
        // Check last visit timestamp from user_progress
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('last_visit, onboarding_completed, adherence_percentage, consecutive_days, stage_start_date, ritual_intro_completed')
          .eq('user_id', user.id)
          .single();
        
        const lastVisit = progressData?.last_visit || null;
        const hasCompletedOnboarding = progressData?.onboarding_completed || false;
        const hasCompletedRitualIntro = progressData?.ritual_intro_completed || false;
        
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
                onboarding_completed: true,
                last_visit: new Date().toISOString()
              })
              .eq('user_id', user.id);
            break;
            
          case 'same_day':
            openingMessage = getSameDayReturnMessage(baselineData, progressData);
            break;
            
          case 'new_day':
            openingMessage = getNewDayMorningMessage(baselineData, progressData, userName);
            break;
            
          default:
            openingMessage = await getFirstTimeOpeningMessage(baselineData, userName);
        }
        
        // Update last visit timestamp
        await supabase
          .from('user_progress')
          .update({ last_visit: new Date().toISOString() })
          .eq('user_id', user.id);
        
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

  const handlePracticeClick = async (practiceId: string) => {
    // If in intro flow, complete it first
    if (introStep < 4) {
      setIntroStep(4);
    }
    
    const practiceMessage = `I want to do the ${practiceId} practice now.`;
    const userMessage = { role: 'user', content: practiceMessage };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLoading(true);

    const response = await sendToAPI(newMessages);
    if (response) {
      setMessages([...newMessages, { role: 'assistant', content: response }]);
    }
    setLoading(false);
  };

  const handleToolClick = async (toolId: string) => {
    // If in intro flow, complete it first
    if (introStep < 4) {
      setIntroStep(4);
    }
    
    const toolMessage = `I want to run the ${toolId} protocol.`;
    const userMessage = { role: 'user', content: toolMessage };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLoading(true);

    const response = await sendToAPI(newMessages);
    if (response) {
      setMessages([...newMessages, { role: 'assistant', content: response }]);
    }
    setLoading(false);
  };

  // Callback for ToolsSidebar/FAB to trigger progress refresh only
  const handleProgressUpdate = useCallback(() => {
    if (refetchProgress) {
      refetchProgress();
    }
  }, [refetchProgress]);

  // NEW: Callback when a practice is completed via "Done" button
  // This notifies the chat so Claude can acknowledge and guide to the next ritual
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
    
    // Create a notification message that Claude will see and respond to
    // We send it as a "user" message so it goes through the API and gets a response
    const completionNotification = `[PRACTICE COMPLETED] I just finished my ${practiceName} ritual and clicked "Done" to log it.`;
    
    const userMessage = { role: 'user', content: completionNotification };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLoading(true);

    const response = await sendToAPI(newMessages);
    if (response) {
      setMessages([...newMessages, { role: 'assistant', content: response }]);
    }
    setLoading(false);
  }, [messages, refetchProgress, introStep]);

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
            className="w-full px-6 py-2 text-white rounded-lg bg-[#ff9e19] hover:bg-orange-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  const getUserName = () => {
    if (user?.user_metadata?.first_name) return user.user_metadata.first_name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const stageProgress = ((baselineData.currentStage - 1) / 6) * 100;
  
  // Determine if we should show quick reply button
  const currentQuickReply = openingType === 'first_time' && introStep < 3 ? introQuickReplies[introStep] : null;

  return (
    <div className="flex h-screen bg-[#0a0a0a]">
      {/* Desktop Sidebar - Your existing dashboard */}
      <aside className="hidden md:block w-80 border-r border-gray-800 bg-[#111111] overflow-y-auto">
        <div className="p-4">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white mb-1">IOS System Installer</h1>
            <p className="text-xs text-gray-400 mb-2">Neural & Mental Operating System</p>
            <p className="text-sm font-medium text-white">{getUserName()}</p>
          </div>

          <div className="mb-6 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-[#ff9e19] font-semibold">
                Stage {baselineData.currentStage} of 7
              </span>
            </div>
            <div className="text-xs text-gray-300 mb-2">
              {getStageName(baselineData.currentStage)}
            </div>
            <div className="w-full rounded-full h-1.5 bg-[#1a1a1a]">
              <div 
                className="h-1.5 rounded-full transition-all bg-[#ff9e19]"
                style={{ width: `${stageProgress}%` }}
              />
            </div>
          </div>

          <div className="mb-6 p-4 rounded-lg text-center border-2 bg-[#0a0a0a] border-[#ff9e19]">
            <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">REwired Index</div>
            <div className="text-4xl font-bold mb-1 text-[#ff9e19]">
              {baselineData.rewiredIndex}
            </div>
            <div className={`text-xs font-medium mb-2 ${getStatusColor(baselineData.rewiredIndex)}`}>
              {getStatusTier(baselineData.rewiredIndex)}
            </div>
            <div className="w-full rounded-full h-1.5 bg-[#1a1a1a]">
              <div 
                className="h-1.5 rounded-full transition-all bg-[#ff9e19]"
                style={{ width: `${baselineData.rewiredIndex}%` }}
              />
            </div>
          </div>

          {/* Domain Scores */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Domain Scores</h3>
            
            {/* Regulation */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-300">Regulation</span>
                <span className="text-sm font-semibold text-[#3b82f6]">{baselineData.domainScores.regulation.toFixed(1)}/5</span>
              </div>
              <div className="w-full rounded-full h-2 bg-[#1a1a1a]">
                <div 
                  className="h-2 rounded-full transition-all bg-[#3b82f6]"
                  style={{ width: `${(baselineData.domainScores.regulation / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Awareness */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-300">Awareness</span>
                <span className="text-sm font-semibold text-[#10b981]">{baselineData.domainScores.awareness.toFixed(1)}/5</span>
              </div>
              <div className="w-full rounded-full h-2 bg-[#1a1a1a]">
                <div 
                  className="h-2 rounded-full transition-all bg-[#10b981]"
                  style={{ width: `${(baselineData.domainScores.awareness / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Outlook */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-300">Outlook</span>
                <span className="text-sm font-semibold text-[#f59e0b]">{baselineData.domainScores.outlook.toFixed(1)}/5</span>
              </div>
              <div className="w-full rounded-full h-2 bg-[#1a1a1a]">
                <div 
                  className="h-2 rounded-full transition-all bg-[#f59e0b]"
                  style={{ width: `${(baselineData.domainScores.outlook / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Attention */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-300">Attention</span>
                <span className="text-sm font-semibold text-[#8b5cf6]">{baselineData.domainScores.attention.toFixed(1)}/5</span>
              </div>
              <div className="w-full rounded-full h-2 bg-[#1a1a1a]">
                <div 
                  className="h-2 rounded-full transition-all bg-[#8b5cf6]"
                  style={{ width: `${(baselineData.domainScores.attention / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </aside>

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
                placeholder={currentQuickReply ? "Or type a question..." : "Type your message..."}
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
              {currentQuickReply 
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
        />
      )}

      {/* Mobile Dashboard Drawer */}
      {isMobile && (
        <MobileDashboard
          userName={getUserName()}
          currentStage={baselineData.currentStage}
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
        />
      )}
    </div>
  );
}
