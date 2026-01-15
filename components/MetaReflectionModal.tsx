// components/MetaReflectionModal.tsx
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { getPatternSummary } from '@/lib/resistanceTracking';

// ============================================
// TYPES
// ============================================

interface MetaReflectionSession {
  isActive: boolean;
  isFirstTime: boolean;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  sessionStartTime: Date | null;
  kernelStatement: string | null;
}

interface PastKernel {
  kernel: string;
  themes: string[];
  created_at: string;
}

const initialSession: MetaReflectionSession = {
  isActive: false,
  isFirstTime: true,
  conversationHistory: [],
  sessionStartTime: null,
  kernelStatement: null
};

// ============================================
// SYSTEM PROMPT
// ============================================

// ============================================
// SYSTEM PROMPT (CUE-KERNEL ALIGNED)
// ============================================

export const metaReflectionSystemPrompt = `You are guiding a Meta-Reflection session — a structured inquiry into how experience was perceived and interpreted. The goal is NOT to analyze what happened, but to observe the sequence:
Signal → Interpretation → Action.

## YOUR CORE ROLES

**Facilitator:** Guide users through the five-stage process — Frame, Observe, Inquiry, Capture, Embodiment. One question at a time. Calm, grounded, precise.

**Coach:** Support clarity with short prompts. If the user starts storytelling or problem-solving, redirect to Signal first.

**Archivist:** When relevant, reference previously established kernels/patterns to deepen recognition (without adding new interpretations).

## SESSION FLOW (10–15 minutes)

### Step 1: Set the Frame (~1 min)
"Begin with one slow breath. This is not a review to judge — it's a study of how perception formed."

- If the user becomes analytical: "Pause the analysis. Start with what can be verified right now: Signal."
- Somatic anchor: "Notice posture and one body sensation."

### Step 2: Observe the Week/Event (~3 min)
"Choose 1–2 moments from the week: one that felt tight/reactive and/or one that felt open/easy."

Then ask for Signal first:
"Signal: What body sensation or emotion is easiest to verify when you recall that moment?"

- If they start explaining: "No story yet. Give Signal only (one sensation/emotion)."

### Step 3: Run the Meta-Inquiry (~5 min)
Goal: reveal how Interpretation was constructed and what Action followed.

Ask ONE question at a time, selecting what fits:

**Signal lens**
- "What was the first Signal you can remember (sensation, emotion, attention shift)?"

**Interpretation lens**
- "What Interpretation did the mind add (meaning, judgment, assumption)?"
- "Was that Interpretation directly verified, or inferred?"

**Action lens**
- "What Action followed (something you did, avoided, said, or rehearsed mentally)?"
- "Did Action reduce Signal, amplify it, or leave it unchanged?"

**De-fusion check**
- "Can you notice Signal and Interpretation as separate (yes/no)?"

**Somatic anchor (when emotion surfaces)**
- "Where is that Signal located in the body (one phrase)?"

If nothing arises:
"Name one Signal that is present right now as you attempt to recall (even subtle). Then we continue."

### Step 4: Capture the Realization (~3 min)
Output must be CUE-KERNEL formatted. Help the user refine until it is concrete and verifiable.

Required capture format:
Signal: <what was directly felt/noticed>
Interpretation: <what meaning/story was added>
Action: <one next step within 24h, or deliberate non-action>

Rules for capture:
- No identity statements ("I am...", "This proves I'm...")
- No metaphysical claims
- Keep each line 1 sentence max

### Step 5: Close with Embodiment (~1 min)
"Take one slow breath. Re-contact the body for 10 seconds."

Then:
"Signal: name one sensation you can verify right now."
"Action: choose one small next step within 24h (or deliberate non-action)."

End with:
"Reflection complete — insight integrated — carry awareness forward."

## ADAPTIVE BEHAVIORS

- If storytelling/judging: "Return to Signal. What is directly felt/observed?"
- If strong emotion: "Stay with Signal. Location + intensity (0–10)."
- If dysregulated: "Pause. Three slow breaths. Feet on floor. Then one Signal."

## CONSTRAINTS
- Keep responses concise (1–3 sentences).
- One question at a time.
- Do not analyze for the user.
- Always close using the required Signal/Interpretation/Action capture and the closing line.

## TONE
- Calm, grounded, plain English
- Direct, modern, efficient

## CLOSING
Always end with: "Reflection complete — insight integrated — carry awareness forward."`;

// ============================================
// OPENING MESSAGES (CUE-KERNEL ALIGNED)
// ============================================

const firstTimeMessage = `**Meta-Reflection** — a 10–15 minute inquiry into how perception formed during recent experiences.

This is not about judging or problem-solving. It’s about observing the sequence:
Signal → Interpretation → Action.

We’ll move through: Frame → Observe → Inquiry → Capture → Embody.

Start with one slow breath.

To begin, choose one moment from the week (tight/reactive or open/easy).

**Signal:** What body sensation or emotion is easiest to verify as you recall it?`;

const returningMessage = `Meta-Reflection.

Start with one slow breath. This is a study of:
Signal → Interpretation → Action.

Choose one moment from the week (tight/reactive or open/easy).

**Signal:** What body sensation or emotion is easiest to verify as you recall it?`;

const onDemandMessage = `Meta-Reflection (on-demand).

Start with one slow breath.

Choose one recent moment (tight/reactive or open/easy).

**Signal:** What body sensation or emotion is easiest to verify right now as you recall it?`;


// ============================================
// HELPER FUNCTIONS
// ============================================

function extractKernelStatement(history: Array<{ role: 'user' | 'assistant'; content: string }>): string | null {
  // Look for kernel-like statements in user messages (present-tense, first-person insights)
  const userMessages = history.filter(m => m.role === 'user').map(m => m.content);
  
  // Check the last few user messages for kernel patterns
  for (let i = userMessages.length - 1; i >= Math.max(0, userMessages.length - 3); i--) {
    const msg = userMessages[i];
    // Look for first-person present-tense statements
    if (msg.match(/^I (can|am|no longer|don't|feel|see|notice|recognize|understand|know)/i) && 
        msg.length < 200 && msg.length > 10) {
      return msg;
    }
  }
  return null;
}

function extractThemes(history: Array<{ role: 'user' | 'assistant'; content: string }>): string[] {
  const userMessages = history.filter(m => m.role === 'user').map(m => m.content.toLowerCase());
  const allText = userMessages.join(' ');
  
  const themes: string[] = [];
  const themeKeywords: { [key: string]: string } = {
    'control': 'control',
    'controlling': 'control',
    'safe': 'safety',
    'safety': 'safety',
    'fear': 'fear',
    'afraid': 'fear',
    'anxious': 'anxiety',
    'anxiety': 'anxiety',
    'perfect': 'perfectionism',
    'perfectionism': 'perfectionism',
    'enough': 'enoughness',
    'worthy': 'worthiness',
    'worthiness': 'worthiness',
    'approval': 'approval',
    'accepted': 'acceptance',
    'acceptance': 'acceptance',
    'rejection': 'rejection',
    'rejected': 'rejection',
    'trust': 'trust',
    'uncertain': 'uncertainty',
    'uncertainty': 'uncertainty',
    'right': 'being right',
    'wrong': 'being wrong',
    'failure': 'failure',
    'success': 'success',
    'love': 'love',
    'connection': 'connection',
    'alone': 'aloneness',
    'lonely': 'loneliness',
    'anger': 'anger',
    'angry': 'anger',
    'sad': 'sadness',
    'grief': 'grief',
    'loss': 'loss',
    'change': 'change',
    'resistance': 'resistance',
    'letting go': 'letting go',
    'identity': 'identity',
    'self': 'self-concept'
  };
  
  for (const [keyword, theme] of Object.entries(themeKeywords)) {
    if (allText.includes(keyword) && !themes.includes(theme)) {
      themes.push(theme);
    }
  }
  
  return themes.slice(0, 5);
}

function formatPastKernelsContext(kernels: PastKernel[]): string {
  if (kernels.length === 0) return '';
  
  // Find recurring themes
  const themeCounts: { [key: string]: number } = {};
  kernels.forEach(k => {
    k.themes.forEach(theme => {
      themeCounts[theme] = (themeCounts[theme] || 0) + 1;
    });
  });
  
  const recurringThemes = Object.entries(themeCounts)
    .filter(([_, count]) => count >= 2)
    .map(([theme, count]) => `${theme} (${count}x)`);
  
  let context = '\n\n---\nPAST KERNELS FOR CONTEXT:\n';
  kernels.slice(0, 5).forEach((k, i) => {
    const date = new Date(k.created_at).toLocaleDateString();
    context += `- "${k.kernel}" (${date})\n`;
  });
  
  if (recurringThemes.length > 0) {
    context += `\nRecurring themes: ${recurringThemes.join(', ')}\n`;
    context += 'Consider referencing these patterns if relevant to deepen the reflection.\n';
  }
  
  context += '---\n';
  return context;
}

// Simple markdown renderer
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#ff9e19]">$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/^[•\-]\s+(.*)$/gm, '<div class="ml-4">• $1</div>')
    .replace(/\n/g, '<br />');
}

// ============================================
// MODAL COMPONENT
// ============================================

interface MetaReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  isWeeklyPrompt?: boolean;
}

function MetaReflectionModalComponent({ isOpen, onClose, userId, isWeeklyPrompt = false }: MetaReflectionModalProps) {
  const [session, setSession] = useState<MetaReflectionSession>(initialSession);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pastKernels, setPastKernels] = useState<PastKernel[]>([]);
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
    let kernels: PastKernel[] = [];
    
    if (userId) {
      try {
        const supabase = createClient();
        
        // Check if first time
        const { count } = await supabase
          .from('tool_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('tool_type', 'meta_reflection');
        
        isFirstTime = (count || 0) === 0;
        
        // Fetch past kernels for context
        const { data: pastSessions } = await supabase
          .from('tool_sessions')
          .select('session_data, recurring_themes, created_at')
          .eq('user_id', userId)
          .eq('tool_type', 'meta_reflection')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (pastSessions) {
          kernels = pastSessions
            .filter((s: { session_data?: { kernel?: string }; recurring_themes?: string[]; created_at: string }) => s.session_data?.kernel)
            .map((s: { session_data?: { kernel?: string }; recurring_themes?: string[]; created_at: string }) => ({
              kernel: s.session_data!.kernel!,
              themes: s.recurring_themes || [],
              created_at: s.created_at
            }));
          setPastKernels(kernels);
        }
      } catch (error) {
        console.error('[MetaReflection] Error initializing:', error);
      }
    }

    // Select appropriate opening message
    let openingMessage: string;
    if (isFirstTime) {
      openingMessage = firstTimeMessage;
    } else if (isWeeklyPrompt) {
      openingMessage = returningMessage;
    } else {
      openingMessage = onDemandMessage;
    }
    
    // Check for resistance patterns (weekly prompt only)
    if (isWeeklyPrompt && userId) {
      try {
        const patternSummary = await getPatternSummary(userId);
        if (patternSummary) {
          openingMessage += `\n\n---\n\n**Before we begin, I noticed some patterns this week:**\n\n${patternSummary.replace('**Resistance Patterns Detected:**\n', '')}\n\nThis isn't judgment — it's data for your awareness. These patterns might be worth exploring during your reflection.\n\n---`;
        }
      } catch (error) {
        console.error('[MetaReflection] Error fetching resistance patterns:', error);
      }
    }
    
    // Add past kernel theme context if we have past kernels
    if (kernels.length > 0) {
      const themeCounts: { [key: string]: number } = {};
      kernels.forEach(k => {
        k.themes.forEach(theme => {
          themeCounts[theme] = (themeCounts[theme] || 0) + 1;
        });
      });
      
      const topTheme = Object.entries(themeCounts)
        .sort((a, b) => b[1] - a[1])
        .find(([_, count]) => count >= 2);
      
      if (topTheme) {
        openingMessage += `\n\n*The theme of "${topTheme[0]}" has appeared in your recent reflections. We can explore if it's still present, or see what else is arising.*`;
      }
    }
    
    setSession({
      isActive: true,
      isFirstTime,
      conversationHistory: [{ role: 'assistant', content: openingMessage }],
      sessionStartTime: new Date(),
      kernelStatement: null
    });
    
    setMessages([{ role: 'assistant', content: openingMessage }]);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    
    // Build context with past kernels for the AI
    const kernelContext = formatPastKernelsContext(pastKernels);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...session.conversationHistory,
            { role: 'user', content: userMessage }
          ],
          context: 'meta_reflection',
          additionalContext: kernelContext
        })
      });
      
      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      const assistantResponse = data.response || data.content || '';
      
      // Update messages and session history
      setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse }]);
      
      const newHistory = [
        ...session.conversationHistory,
        { role: 'user' as const, content: userMessage },
        { role: 'assistant' as const, content: assistantResponse }
      ];
      
      // Try to extract kernel if we're near the end
      const kernel = extractKernelStatement(newHistory);
      
      setSession(prev => ({
        ...prev,
        conversationHistory: newHistory,
        kernelStatement: kernel || prev.kernelStatement
      }));
      
    } catch (error) {
      console.error('[MetaReflection] API error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I had trouble processing that. Take a breath. What's present in your awareness right now?" 
      }]);
    }
    
    setLoading(false);
  };

  const handleEndSession = async () => {
    // Calculate duration
    let durationSeconds = 0;
    if (session.sessionStartTime) {
      durationSeconds = Math.floor((Date.now() - session.sessionStartTime.getTime()) / 1000);
    }
    
    // Extract final data
    const kernel = session.kernelStatement || extractKernelStatement(session.conversationHistory);
    const themes = extractThemes(session.conversationHistory);
    
    // Save to database
    if (userId) {
      try {
        const supabase = createClient();
        await supabase.from('tool_sessions').insert({
          user_id: userId,
          tool_type: 'meta_reflection',
          session_mode: 'standard',
          duration_seconds: durationSeconds,
          session_data: { 
            kernel: kernel,
            themes: themes
          },
          recurring_themes: themes
        });
      } catch (error) {
        console.error('[MetaReflection] Failed to save session:', error);
      }
    }
    
    // Reset and close
    setSession(initialSession);
    setMessages([]);
    setInput('');
    setPastKernels([]);
    onClose();
  };

  const handleClose = () => {
    if (session.isActive && session.conversationHistory.length > 1) {
      handleEndSession();
    } else {
      setSession(initialSession);
      setMessages([]);
      setInput('');
      setPastKernels([]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl h-[85vh] bg-gradient-to-b from-gray-900 to-[#0a0a0a] rounded-2xl border border-gray-700/50 flex flex-col overflow-hidden shadow-2xl shadow-black/50">
        
        {/* Header with accent */}
        <div className="relative px-6 py-5 border-b border-gray-700/50">
          {/* Accent glow - purple/indigo for reflection */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <span className="text-xl">🪞</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Meta-Reflection</h2>
                <p className="text-sm text-gray-400">Weekly awareness inquiry</p>
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
                    ? 'bg-indigo-600 text-white'
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
                  <div className="w-2 h-2 bg-indigo-500/60 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-indigo-500/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-indigo-500/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input area */}
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
              placeholder="Type your response..."
              disabled={loading}
              rows={1}
              className="flex-1 bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 disabled:opacity-50 resize-none min-h-[48px] max-h-[120px] transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-5 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
            >
              Send
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send • Click "End Session" when complete
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// HOOK FOR USING THE MODAL
// ============================================

export function useMetaReflection() {
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();
  const [isWeeklyPrompt, setIsWeeklyPrompt] = useState(false);

  const open = useCallback((uid?: string, weekly: boolean = false) => {
    setUserId(uid);
    setIsWeeklyPrompt(weekly);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setIsWeeklyPrompt(false);
  }, []);

  const Modal = useCallback(() => (
    <MetaReflectionModalComponent 
      isOpen={isOpen} 
      onClose={close}
      userId={userId}
      isWeeklyPrompt={isWeeklyPrompt}
    />
  ), [isOpen, close, userId, isWeeklyPrompt]);

  return { open, close, isOpen, Modal };
}

// ============================================
// HELPER: Check if it's Sunday
// ============================================

export function isSunday(): boolean {
  return new Date().getDay() === 0;
}

// ============================================
// HELPER: Check if Meta-Reflection is due this week
// ============================================

export async function isWeeklyReflectionDue(userId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    
    // Get the most recent meta-reflection session
    const { data } = await supabase
      .from('tool_sessions')
      .select('created_at')
      .eq('user_id', userId)
      .eq('tool_type', 'meta_reflection')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (!data) {
      // Never done one - it's due
      return true;
    }
    
    // Check if last session was before this week started (last Sunday)
    const lastSession = new Date(data.created_at);
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Go back to Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    return lastSession < startOfWeek;
  } catch (error) {
    // If no sessions found or error, consider it due
    return true;
  }
}

// Legacy export name for backwards compatibility
export const isMetaReflectionDue = isWeeklyReflectionDue;

export default MetaReflectionModalComponent;
