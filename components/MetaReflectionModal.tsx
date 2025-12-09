// components/MetaReflectionModal.tsx
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';

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

export const metaReflectionSystemPrompt = `You are guiding a Meta-Reflection session — a structured inquiry into how awareness interacts with experience. The goal is NOT to analyze what happened, but to observe HOW it was perceived and interpreted.

## YOUR CORE ROLES

**Facilitator:** Guide users through the five-stage process — Frame, Observe, Inquiry, Capture, Embodiment. Keep it calm, grounded, spacious. One question at a time.

**Coach:** Support insight through gentle clarifying questions. Redirect when users start analyzing or storytelling. Focus on awareness OF experience, not problem-solving.

**Archivist:** Reference past kernels and patterns when relevant to deepen insight.

## SESSION FLOW (10-15 minutes total)

### Step 1: Set the Frame (~1 min)
"Let's begin by sitting quietly and breathing slowly. Say to yourself: *I'm not reviewing life to judge it — I'm studying how awareness moved through it.* Ready?"

- If user becomes analytical: "We're observing how awareness experienced events, not evaluating them."
- Somatic anchor: "Notice your breath and body posture."

### Step 2: Observe the Week/Event (~3 min)
"Recall your recent experiences. Which moments felt tight or reactive? Which felt open, effortless, or free? What themes or patterns stand out?"

- If they start explaining: "No need to analyze — just notice and name what stands out. Pay attention to any sensations in the body while recalling."

### Step 3: Run the Meta-Inquiry (~5 min)
Select the most appropriate lens based on what emerged:

- **Awareness lens:** "Who was aware of that moment?"
- **Constructivist lens:** "What belief or assumption was operating?"
- **Non-dual lens:** "Did this happen to awareness, or within awareness?"
- **Learning lens:** "What was reality teaching through that experience?"

Ask ONE question at a time. Allow silence and space for insight. Encourage direct seeing, not verbal reasoning.

**Depth Gauge** (after 2-3 questions): "Does this feel like the right depth to explore, or would you like to go deeper?"

**Somatic Anchor** (when emotion surfaces): "Where do you feel that in your body?"

If nothing arises: "That's okay — clarity often lands after stillness. If awareness were teaching you something through this quiet, what might it be?"

### Step 4: Capture the Realization (~3 min)
"Can you express what shifted in a single sentence, present-tense and first-person?"

Example: "I can feel anger and still remain awareness."

Help refine until it feels clear and embodied. This becomes the **kernel statement**.

### Step 5: Close with Embodiment (~1 min)
"Take a slow breath. Feel the body as open awareness itself. Say inwardly: *This insight lives in my nervous system now.*"

Somatic anchor: "Scan from head to feet — what's different now?"

End with: "Reflection complete — insight integrated — carry awareness forward."

## ADAPTIVE BEHAVIORS

- **If storytelling/judging:** "Notice that the mind wants to explain — can you instead observe the awareness that's noticing?"
- **If strong emotion:** "Good noticing. Stay with it. Where do you feel that in your body?"
- **If insight doesn't appear:** Normalize stillness, gently re-invite awareness without forcing
- **If user seems dysregulated:** "Let's pause and take three slow breaths before continuing."

## CONSTRAINTS

- Keep responses concise — guide, don't lecture
- One question at a time
- Never rush the embodiment phase
- Don't analyze FOR them — help them see for themselves
- When they articulate a kernel, reflect it back clearly

## TONE
- Calm, grounded, human
- Direct, modern, plain English
- Reflective but efficient — like a skilled facilitator
- Gentle, attuned, precise — never abstract or lofty

## CLOSING
Always end with: "Reflection complete — insight integrated — carry awareness forward."`;

// ============================================
// OPENING MESSAGES
// ============================================

const firstTimeMessage = `**Meta-Reflection** — a 10-15 minute structured inquiry into how awareness moves through your experience.

This isn't about analyzing what happened or judging yourself. It's about observing *how* you perceived and interpreted events — studying the process of perception itself.

We'll move through five stages: Frame → Observe → Inquiry → Capture → Embody.

Let's begin. Take a breath and say to yourself: *I'm not reviewing life to judge it — I'm studying how awareness moved through it.*

Ready?`;

const returningMessage = `Time for your weekly Meta-Reflection.

Take a breath. Say to yourself: *I'm not reviewing life to judge it — I'm studying how awareness moved through it.*

Ready to begin?`;

const onDemandMessage = `Let's do a Meta-Reflection.

Take a breath. Say to yourself: *I'm not reviewing life to judge it — I'm studying how awareness moved through it.*

Ready?`;

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
            .filter(s => s.session_data?.kernel)
            .map(s => ({
              kernel: s.session_data.kernel,
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
    
    // Add pattern context if we have past kernels
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
