// components/ReframeModal.tsx
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';

// ============================================
// TYPES
// ============================================

interface ReframeSession {
  isActive: boolean;
  isFirstTime: boolean;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  sessionStartTime: Date | null;
  anchor: string | null;
  identifiedStory: string | null;
}

interface PastSession {
  story: string | null;
  anchor: string | null;
  themes: string[];
  created_at: string;
}

const initialSession: ReframeSession = {
  isActive: false,
  isFirstTime: true,
  conversationHistory: [],
  sessionStartTime: null,
  anchor: null,
  identifiedStory: null
};

// ============================================
// OPENING MESSAGES — CUE-KERNEL ALIGNED
// ============================================

const firstTimeMessage = `**Reframe Protocol** — ~2 minutes to separate Signal from Interpretation and choose a clean next step.

Signal/events are often unavoidable; Interpretation is often adjustable.

Reply in this format:
**Signal:** (one sensation/emotion you can verify right now)
**Event:** (facts only, one sentence — optional if unclear)
**Interpretation:** (the meaning/prediction your mind added, one sentence)`;

const returningMessage = `Reframe Protocol.

Reply in this format:
**Signal:** ___
**Event:** ___ (facts only, optional)
**Interpretation:** ___`;

const triggeredMessage = `Reframe Protocol.

Start with Signal first:
**Signal:** one sensation/emotion you can verify right now (one phrase).`;


// ============================================
// HELPER FUNCTIONS
// ============================================

function extractAnchor(history: Array<{ role: 'user' | 'assistant'; content: string }>): string | null {
  const userMessages = history.filter(m => m.role === 'user').map(m => m.content);
  
  // Look for "From X → Y → Z" pattern in recent messages
  for (let i = userMessages.length - 1; i >= Math.max(0, userMessages.length - 5); i--) {
    const msg = userMessages[i];
    // Match "from X to Y to Z" or "from X → Y → Z" patterns
    const arrowMatch = msg.match(/from\s+(.+?)\s*[→\->to]+\s*(.+?)\s*[→\->to]+\s*(.+)/i);
    if (arrowMatch) {
      return `From ${arrowMatch[1].trim()} → ${arrowMatch[2].trim()} → ${arrowMatch[3].trim()}`;
    }
    // Match simpler "X to Y to Z" or three-word anchors
    const simpleMatch = msg.match(/^(?:from\s+)?(\w+)\s*[→\->to]+\s*(\w+)\s*[→\->to]+\s*(\w+)$/i);
    if (simpleMatch) {
      return `From ${simpleMatch[1]} → ${simpleMatch[2]} → ${simpleMatch[3]}`;
    }
  }
  return null;
}

function extractStory(history: Array<{ role: 'user' | 'assistant'; content: string }>): string | null {
  // Look for the story (usually in early user messages after the event)
  const userMessages = history.filter(m => m.role === 'user').map(m => m.content);
  
  // Stories often contain: "they", "I'm", "always", "never", meaning-making language
  for (let i = 1; i < Math.min(userMessages.length, 4); i++) {
    const msg = userMessages[i];
    if (msg.length > 20 && msg.length < 500 && 
        (msg.includes("I'm") || msg.includes("they") || msg.includes("always") || 
         msg.includes("never") || msg.includes("means") || msg.includes("because"))) {
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
    'can\'t control': 'control',
    'out of control': 'control',
    'not enough': 'not enough',
    'good enough': 'enoughness',
    'enough': 'enoughness',
    'worthy': 'worthiness',
    'deserve': 'worthiness',
    'failure': 'failure',
    'failed': 'failure',
    'failing': 'failure',
    'reject': 'rejection',
    'rejected': 'rejection',
    'rejection': 'rejection',
    'abandon': 'abandonment',
    'abandoned': 'abandonment',
    'alone': 'abandonment',
    'trust': 'trust',
    'don\'t trust': 'trust',
    'can\'t trust': 'trust',
    'safe': 'safety',
    'unsafe': 'safety',
    'danger': 'safety',
    'anxious': 'anxiety',
    'anxiety': 'anxiety',
    'worried': 'anxiety',
    'fear': 'fear',
    'afraid': 'fear',
    'scared': 'fear',
    'angry': 'anger',
    'anger': 'anger',
    'furious': 'anger',
    'perfect': 'perfectionism',
    'perfectionism': 'perfectionism',
    'mess up': 'perfectionism',
    'approval': 'approval-seeking',
    'what they think': 'approval-seeking',
    'judge': 'judgment',
    'judging': 'judgment',
    'criticism': 'criticism',
    'criticize': 'criticism',
    'blame': 'blame',
    'my fault': 'self-blame',
    'their fault': 'other-blame',
    'unfair': 'fairness',
    'fair': 'fairness',
    'should': 'shoulds',
    'shouldn\'t': 'shoulds',
    'must': 'shoulds',
    'have to': 'shoulds'
  };
  
  for (const [keyword, theme] of Object.entries(themeKeywords)) {
    if (allText.includes(keyword) && !themes.includes(theme)) {
      themes.push(theme);
    }
  }
  
  return themes.slice(0, 5);
}

function formatPastSessionsContext(sessions: PastSession[]): string {
  if (sessions.length === 0) return '';
  
  // Find recurring themes
  const themeCounts: { [key: string]: number } = {};
  sessions.forEach(s => {
    s.themes.forEach(theme => {
      themeCounts[theme] = (themeCounts[theme] || 0) + 1;
    });
  });
  
  const recurringThemes = Object.entries(themeCounts)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([theme, count]) => `${theme} (${count}x)`);
  
  // Find recurring stories
  const storyPatterns = sessions
    .filter(s => s.story)
    .map(s => s.story!.substring(0, 100));
  
  let context = '\n\n---\nPAST REFRAME SESSIONS FOR CONTEXT:\n';
  
  if (recurringThemes.length > 0) {
    context += `Recurring themes: ${recurringThemes.join(', ')}\n`;
  }
  
  sessions.slice(0, 3).forEach((s, i) => {
    if (s.anchor) {
      const date = new Date(s.created_at).toLocaleDateString();
      context += `- Anchor: "${s.anchor}" (${date})\n`;
    }
  });
  
  if (recurringThemes.length > 0) {
    context += '\nConsider naming patterns if the same theme appears: "This is the Nth time this story has come up..."\n';
  }
  
  context += '---\n';
  return context;
}

// Simple markdown renderer
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-teal-400">$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/^[•\-]\s+(.*)$/gm, '<div class="ml-4">• $1</div>')
    .replace(/\n/g, '<br />');
}

// ============================================
// MODAL COMPONENT
// ============================================

interface ReframeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  isTriggered?: boolean; // True if Claude detected trigger pattern
}

function ReframeModalComponent({ isOpen, onClose, userId, isTriggered = false }: ReframeModalProps) {
  const [session, setSession] = useState<ReframeSession>(initialSession);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pastSessions, setPastSessions] = useState<PastSession[]>([]);
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
    let sessions: PastSession[] = [];
    
    if (userId) {
      try {
        const supabase = createClient();
        
        // Check if first time
        const { count } = await supabase
          .from('tool_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('tool_type', 'reframe');
        
        isFirstTime = (count || 0) === 0;
        
        // Fetch past sessions for context
        const { data: pastData } = await supabase
          .from('tool_sessions')
          .select('session_data, recurring_themes, created_at')
          .eq('user_id', userId)
          .eq('tool_type', 'reframe')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (pastData) {
          sessions = pastData.map((s: { session_data?: { story?: string; anchor?: string }; recurring_themes?: string[]; created_at: string }) => ({
            story: s.session_data?.story || null,
            anchor: s.session_data?.anchor || null,
            themes: s.recurring_themes || [],
            created_at: s.created_at
          }));
          setPastSessions(sessions);
        }
      } catch (error) {
        console.error('[Reframe] Error initializing:', error);
      }
    }

    // Select appropriate opening message
    let openingMessage: string;
    if (isTriggered) {
      openingMessage = triggeredMessage;
    } else if (isFirstTime) {
      openingMessage = firstTimeMessage;
    } else {
      openingMessage = returningMessage;
    }
    
    // Add pattern context if recurring themes
    if (sessions.length >= 2) {
      const themeCounts: { [key: string]: number } = {};
      sessions.forEach(s => {
        s.themes.forEach(theme => {
          themeCounts[theme] = (themeCounts[theme] || 0) + 1;
        });
      });
      
      const topTheme = Object.entries(themeCounts)
        .sort((a, b) => b[1] - a[1])
        .find(([_, count]) => count >= 2);
      
      if (topTheme && topTheme[1] >= 3) {
        openingMessage += `\n\n*I notice "${topTheme[0]}" has come up ${topTheme[1]} times in your reframes. Let's see if it shows up today.*`;
      }
    }
    
    setSession({
      isActive: true,
      isFirstTime,
      conversationHistory: [{ role: 'assistant', content: openingMessage }],
      sessionStartTime: new Date(),
      anchor: null,
      identifiedStory: null
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
    
    // Build context with past sessions for the AI
    const sessionsContext = formatPastSessionsContext(pastSessions);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...session.conversationHistory,
            { role: 'user', content: userMessage }
          ],
          context: 'reframe',
          additionalContext: sessionsContext
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
      
      // Try to extract anchor and story
      const anchor = extractAnchor(newHistory);
      const story = session.identifiedStory || extractStory(newHistory);
      
      setSession(prev => ({
        ...prev,
        conversationHistory: newHistory,
        anchor: anchor || prev.anchor,
        identifiedStory: story || prev.identifiedStory
      }));
      
    } catch (error) {
      console.error('[Reframe] API error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I had trouble processing that. Take a breath. What actually happened?" 
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
    const anchor = session.anchor || extractAnchor(session.conversationHistory);
    const story = session.identifiedStory || extractStory(session.conversationHistory);
    const themes = extractThemes(session.conversationHistory);
    
    // Save to database
    if (userId) {
      try {
        const supabase = createClient();
        await supabase.from('tool_sessions').insert({
          user_id: userId,
          tool_type: 'reframe',
          session_mode: 'standard',
          duration_seconds: durationSeconds,
          session_data: { 
            anchor: anchor,
            story: story,
            themes: themes
          },
          recurring_themes: themes
        });
      } catch (error) {
        console.error('[Reframe] Failed to save session:', error);
      }
    }
    
    // Reset and close
    setSession(initialSession);
    setMessages([]);
    setInput('');
    setPastSessions([]);
    onClose();
  };

  const handleClose = () => {
    if (session.isActive && session.conversationHistory.length > 1) {
      handleEndSession();
    } else {
      setSession(initialSession);
      setMessages([]);
      setInput('');
      setPastSessions([]);
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
          {/* Accent glow - teal/cyan for reframe */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                <span className="text-xl">🔄</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Reframe Protocol</h2>
                <p className="text-sm text-gray-400">2-minute interpretation audit</p>
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
                    ? 'bg-teal-600 text-white'
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
                  <div className="w-2 h-2 bg-teal-500/60 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-teal-500/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-teal-500/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
              className="flex-1 bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 disabled:opacity-50 resize-none min-h-[48px] max-h-[120px] transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-5 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-500 disabled:opacity-50 disabled:hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/20"
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

export function useReframe() {
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();
  const [isTriggered, setIsTriggered] = useState(false);

  const open = useCallback((uid?: string, triggered: boolean = false) => {
    setUserId(uid);
    setIsTriggered(triggered);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setIsTriggered(false);
  }, []);

  const Modal = useCallback(() => (
    <ReframeModalComponent 
      isOpen={isOpen} 
      onClose={close}
      userId={userId}
      isTriggered={isTriggered}
    />
  ), [isOpen, close, userId, isTriggered]);

  return { open, close, isOpen, Modal };
}

export default ReframeModalComponent;
