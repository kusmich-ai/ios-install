// components/DecenteringModal.tsx
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';

// ============================================
// TYPES
// ============================================

interface DecenteringSession {
  isActive: boolean;
  isFirstTime: boolean;
  sessionMode: 'standard' | 'identity_audit';
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  sessionStartTime: Date | null;
}

const initialSession: DecenteringSession = {
  isActive: false,
  isFirstTime: true,
  sessionMode: 'standard',
  conversationHistory: [],
  sessionStartTime: null
};

// ============================================
// OPENING MESSAGES
// ============================================

const firstTimeMessage = `**Decentering Practice** — a 2–3 minute inquiry to help you notice thoughts, emotions, and roles as experiences, rather than as definitions of you.

**When to use this:**
- When you feel stuck in a role or self-description
- When thoughts feel like facts
- When emotion and story feel fused

The goal isn't to escape roles — it's to relate to them with less grip and more choice.

Take one slow breath.

What do you notice first right now — a body sensation or an attention shift?`;


const returningMessage = `Take one slow breath.

What do you notice first right now — a body sensation or an attention shift?`;


const identityAuditMessage = `**Identity Audit Mode** — a focused inquiry into a repeating role or self-description.

Before naming anything, pause for a moment.

What do you feel first in your body or attention right now?`;


// ============================================
// HELPER FUNCTIONS
// ============================================

function isIdentityAuditRequest(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  const triggers = ['identity audit', 'examine an identity', 'audit my identity', 'deeper identity'];
  return triggers.some(t => lowerMessage.includes(t));
}

function extractSessionData(history: Array<{ role: 'user' | 'assistant'; content: string }>) {
  const userMessages = history.filter(m => m.role === 'user').map(m => m.content.toLowerCase());
  const allText = userMessages.join(' ');
  
  const themes: string[] = [];
  const themeKeywords = ['control', 'fear', 'anxiety', 'pressure', 'expectations', 'perfectionism',
    'not enough', 'failure', 'success', 'approval', 'rejection', 'overwhelm'];
  
  for (const theme of themeKeywords) {
    if (allText.includes(theme)) themes.push(theme);
  }
  
  return { themes: themes.slice(0, 5) };
}

// FIX #3: Helper to get mode-specific system prompt
function getDecenteringPrompt(mode: DecenteringSession['sessionMode']): string {
  if (mode === 'identity_audit') {
    return `${decenteringSystemPrompt}

MODE: IDENTITY_AUDIT
Follow the IDENTITY AUDIT MODE questions strictly, one at a time. Do not skip steps or combine questions.`;
  }
  return `${decenteringSystemPrompt}

MODE: STANDARD
Follow the standard session structure conversationally.`;
}

// FIX #4: HTML escaping to prevent XSS
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// FIX #4: Safe markdown renderer with HTML escaping
function renderMarkdown(text: string): string {
  const safe = escapeHtml(text);

  return safe
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#ff9e19]">$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/^[•\-]\s+(.*)$/gm, '<div class="ml-4">• $1</div>')
    .replace(/\n/g, '<br />');
}

// ============================================
// MODAL COMPONENT
// ============================================

interface DecenteringModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

function DecenteringModalComponent({ isOpen, onClose, userId }: DecenteringModalProps) {
  const [session, setSession] = useState<DecenteringSession>(initialSession);
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

  // Refocus input after loading completes (message sent)
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
    // Check if first time using tool
    let isFirstTime = true;
    
    if (userId) {
      try {
        const supabase = createClient();
        const { count } = await supabase
          .from('tool_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('tool_type', 'decentering');
        
        isFirstTime = (count || 0) === 0;
      } catch (error) {
        console.error('[Decentering] Error checking first time:', error);
      }
    }

    const openingMessage = isFirstTime ? firstTimeMessage : returningMessage;
    
    setSession({
      isActive: true,
      isFirstTime,
      sessionMode: 'standard',
      conversationHistory: [{ role: 'assistant', content: openingMessage }],
      sessionStartTime: new Date()
    });
    
    setMessages([{ role: 'assistant', content: openingMessage }]);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    setInput('');
    
    // FIX #2: Check for identity audit request AND update conversationHistory
    if (isIdentityAuditRequest(userMessage)) {
      setSession(prev => ({
        ...prev,
        sessionMode: 'identity_audit',
        conversationHistory: [
          ...prev.conversationHistory,
          { role: 'user', content: userMessage },
          { role: 'assistant', content: identityAuditMessage },
        ],
      }));

      setMessages(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: identityAuditMessage },
      ]);

      return;
    }
    
    // Add user message to UI immediately
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    
    try {
      // FIX #1 & #3: Include system prompt with mode in API call
      const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      ...session.conversationHistory,
      { role: 'user', content: userMessage }
    ],
    context: 'decentering_practice',
    additionalContext: session.sessionMode === 'identity_audit' 
      ? 'MODE: IDENTITY_AUDIT - Follow the IDENTITY AUDIT MODE questions strictly, one at a time.'
      : undefined
  })
});
      
      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      const assistantResponse = data.response || data.content || '';
      
      // Update messages and session history
      setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse }]);
      setSession(prev => ({
        ...prev,
        conversationHistory: [
          ...prev.conversationHistory,
          { role: 'user', content: userMessage },
          { role: 'assistant', content: assistantResponse }
        ]
      }));
      
    } catch (error) {
      console.error('[Decentering] API error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I had trouble processing that. Take a breath. What's most present right now?" 
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
    
    // Extract session data
    const sessionData = extractSessionData(session.conversationHistory);
    
    // Save to database
    if (userId) {
      try {
        const supabase = createClient();
        await supabase.from('tool_sessions').insert({
          user_id: userId,
          tool_type: 'decentering',
          session_mode: session.sessionMode,
          duration_seconds: durationSeconds,
          session_data: { themes: sessionData.themes },
          recurring_themes: sessionData.themes
        });
      } catch (error) {
        console.error('[Decentering] Failed to save session:', error);
      }
    }
    
    // Reset and close
    setSession(initialSession);
    setMessages([]);
    setInput('');
    onClose();
  };

  const handleClose = () => {
    // If session is active, end it properly
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
          {/* Accent glow */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff9e19]/50 to-transparent" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ff9e19]/20 flex items-center justify-center">
                <span className="text-xl">🔮</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Decentering Practice</h2>
                <p className="text-sm text-gray-400">2-5 minute awareness inquiry</p>
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
        
        {/* Input area with accent border */}
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
              className="flex-1 bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff9e19]/50 focus:border-[#ff9e19]/50 disabled:opacity-50 resize-none min-h-[48px] max-h-[120px] transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-5 py-3 bg-[#ff9e19] text-white rounded-xl font-medium hover:bg-orange-500 disabled:opacity-50 disabled:hover:bg-[#ff9e19] transition-colors shadow-lg shadow-[#ff9e19]/20"
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

export function useDecentering() {
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
    <DecenteringModalComponent 
      isOpen={isOpen} 
      onClose={close}
      userId={userId}
    />
  ), [isOpen, close, userId]);

  return { open, close, isOpen, Modal };
}

export default DecenteringModalComponent;
