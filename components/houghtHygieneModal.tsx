// components/ThoughtHygieneModal.tsx
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';

// ============================================
// TYPES
// ============================================

interface ThoughtHygieneSession {
  isActive: boolean;
  isFirstTime: boolean;
  step: 'dump' | 'acknowledge' | 'reset' | 'rating' | 'complete';
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  sessionStartTime: Date | null;
  dumpContent: string | null;
  clarityRating: number | null;
}

interface PastSession {
  clarity_rating: number | null;
  created_at: string;
}

const initialSession: ThoughtHygieneSession = {
  isActive: false,
  isFirstTime: true,
  step: 'dump',
  conversationHistory: [],
  sessionStartTime: null,
  dumpContent: null,
  clarityRating: null
};

// ============================================
// STEP MESSAGES
// ============================================

const firstTimeFraming = `**Quick heads-up:** This process will surface loops that were already running in the background consuming bandwidth. That might feel like it's making things worse at first — but we're just making the invisible visible so you can acknowledge it and free up mental space.

By the end, your mind will have permission to release these loops from active processing.

`;

const dumpPrompt = `Ok, time to free up some mind space and clear your mental cache.

**What's still running in the background of your mind that's taking up mental bandwidth?**

Type everything out as bullets — tasks, conversations, worries, whatever's looping.

Don't overthink it. Don't go digging. Whatever floats to the surface, just dump it here.`;

const acknowledgePrompt = `Got it. You've surfaced what's been running in the background.

By externalizing these loops, your mind now knows they exist and can stop cycling on them unconsciously. If you'd like, copy and paste them somewhere (task list, journal, notes app) and come back to them when you're ready.

By acknowledging and externalizing these, your mind can release them from active processing for now.

**Type "free" to acknowledge.**`;

const resetPrompt = `Good. Mental bandwidth freed.

Take 3 slow breaths — feel them fully.

Notice your feet on the floor and a sensation in your body (warmth, calm, tingling, etc).

Then say inwardly: *"Done for now."*

**When you've completed this, type "done" or "ready."**`;

const ratingPrompt = `Mental cache cleared — loops released. Ready for next focus block.

**On a scale of 1-5** (1 being still heavily muddied, 5 being clear to move on), how clear does your mind feel now?`;

// ============================================
// HELPER FUNCTIONS
// ============================================

function getCompletionMessage(rating: number, sessionsToday: number): string {
  let message = '';
  
  if (rating >= 4) {
    message = `Excellent. Mental cache successfully cleared. You're ready for your next focus block.`;
  } else if (rating === 3) {
    message = `Good progress. Some residue remains, but you've freed up significant bandwidth.`;
  } else {
    message = `Your clarity is still at ${rating}/5. This suggests something deeper needs attention. I'd recommend running the **Reframe Protocol** to work through what's actually stuck.`;
  }
  
  if (sessionsToday >= 3) {
    message += `\n\n*You've cleared ${sessionsToday} times today. Might be worth exploring if something deeper needs attention via the Reframe Protocol.*`;
  }
  
  return message;
}

// Simple markdown renderer
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-emerald-400">$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/^[•\-]\s+(.*)$/gm, '<div class="ml-4">• $1</div>')
    .replace(/\n/g, '<br />');
}

// ============================================
// MODAL COMPONENT
// ============================================

interface ThoughtHygieneModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

function ThoughtHygieneModalComponent({ isOpen, onClose, userId }: ThoughtHygieneModalProps) {
  const [session, setSession] = useState<ThoughtHygieneSession>(initialSession);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [sessionsToday, setSessionsToday] = useState(0);
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

  // Refocus input after step changes
  useEffect(() => {
    if (isOpen && session.step !== 'complete') {
      inputRef.current?.focus();
    }
  }, [session.step, isOpen]);

  // Initialize session when modal opens
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
        
        // Check if first time
        const { count } = await supabase
          .from('tool_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('tool_type', 'thought_hygiene');
        
        isFirstTime = (count || 0) === 0;
        
        // Count sessions today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { count: todaySessionCount } = await supabase
          .from('tool_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('tool_type', 'thought_hygiene')
          .gte('created_at', today.toISOString());
        
        todayCount = todaySessionCount || 0;
        setSessionsToday(todayCount);
        
      } catch (error) {
        console.error('[ThoughtHygiene] Error initializing:', error);
      }
    }

    // Build opening message
    let openingMessage = '';
    if (isFirstTime) {
      openingMessage = firstTimeFraming + dumpPrompt;
    } else {
      openingMessage = dumpPrompt;
    }
    
    setSession({
      isActive: true,
      isFirstTime,
      step: 'dump',
      conversationHistory: [{ role: 'assistant', content: openingMessage }],
      sessionStartTime: new Date(),
      dumpContent: null,
      clarityRating: null
    });
    
    setMessages([{ role: 'assistant', content: openingMessage }]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Process based on current step
    const lowerMessage = userMessage.toLowerCase();
    
    switch (session.step) {
      case 'dump':
        // User has dumped their thoughts, move to acknowledge
        setSession(prev => ({
          ...prev,
          step: 'acknowledge',
          dumpContent: userMessage,
          conversationHistory: [
            ...prev.conversationHistory,
            { role: 'user', content: userMessage },
            { role: 'assistant', content: acknowledgePrompt }
          ]
        }));
        setMessages(prev => [...prev, { role: 'assistant', content: acknowledgePrompt }]);
        break;
        
      case 'acknowledge':
        // Check for acknowledgment (free, freed, done, ok, got it, etc.)
        const isAcknowledged = ['free', 'freed', 'done', 'ok', 'okay', 'got it', 'noted', 'yes', 'yep'].some(
          word => lowerMessage.includes(word)
        );
        
        if (isAcknowledged) {
          setSession(prev => ({
            ...prev,
            step: 'reset',
            conversationHistory: [
              ...prev.conversationHistory,
              { role: 'user', content: userMessage },
              { role: 'assistant', content: resetPrompt }
            ]
          }));
          setMessages(prev => [...prev, { role: 'assistant', content: resetPrompt }]);
        } else {
          // Gentle redirect
          const redirectMessage = `Just type "free" to acknowledge and release these loops.`;
          setMessages(prev => [...prev, { role: 'assistant', content: redirectMessage }]);
        }
        break;
        
      case 'reset':
        // Check for completion signal
        const isComplete = ['done', 'ready', 'complete', 'finished', 'ok', 'okay'].some(
          word => lowerMessage.includes(word)
        );
        
        if (isComplete) {
          setSession(prev => ({
            ...prev,
            step: 'rating',
            conversationHistory: [
              ...prev.conversationHistory,
              { role: 'user', content: userMessage },
              { role: 'assistant', content: ratingPrompt }
            ]
          }));
          setMessages(prev => [...prev, { role: 'assistant', content: ratingPrompt }]);
        } else {
          const redirectMessage = `Take those 3 breaths, feel your feet on the ground, then type "done" when ready.`;
          setMessages(prev => [...prev, { role: 'assistant', content: redirectMessage }]);
        }
        break;
        
      case 'rating':
        // Parse rating
        const ratingMatch = userMessage.match(/[1-5]/);
        if (ratingMatch) {
          const rating = parseInt(ratingMatch[0]);
          const completionMessage = getCompletionMessage(rating, sessionsToday + 1);
          
          setSession(prev => ({
            ...prev,
            step: 'complete',
            clarityRating: rating,
            conversationHistory: [
              ...prev.conversationHistory,
              { role: 'user', content: userMessage },
              { role: 'assistant', content: completionMessage }
            ]
          }));
          setMessages(prev => [...prev, { role: 'assistant', content: completionMessage }]);
          
          // Save session to database
          saveSession(rating);
        } else {
          const redirectMessage = `Just give me a number from 1-5. How clear does your mind feel?`;
          setMessages(prev => [...prev, { role: 'assistant', content: redirectMessage }]);
        }
        break;
        
      case 'complete':
        // Session is done, any further input just acknowledges
        const closeMessage = `Session complete. Click "End Session" when you're ready to continue.`;
        setMessages(prev => [...prev, { role: 'assistant', content: closeMessage }]);
        break;
    }
  };

  const saveSession = async (rating: number) => {
    if (!userId) return;
    
    let durationSeconds = 0;
    if (session.sessionStartTime) {
      durationSeconds = Math.floor((Date.now() - session.sessionStartTime.getTime()) / 1000);
    }
    
    try {
      const supabase = createClient();
      await supabase.from('tool_sessions').insert({
        user_id: userId,
        tool_type: 'thought_hygiene',
        session_mode: 'standard',
        duration_seconds: durationSeconds,
        session_data: { 
          clarity_rating: rating,
          sessions_today: sessionsToday + 1
        },
        recurring_themes: [] // We don't store dump content for privacy
      });
    } catch (error) {
      console.error('[ThoughtHygiene] Failed to save session:', error);
    }
  };

  const handleEndSession = () => {
    // If we haven't saved yet and have a rating, save
    if (session.clarityRating && session.step === 'complete') {
      // Already saved in the rating step
    }
    
    // Reset and close
    setSession(initialSession);
    setMessages([]);
    setInput('');
    onClose();
  };

  const handleClose = () => {
    setSession(initialSession);
    setMessages([]);
    setInput('');
    onClose();
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
          {/* Accent glow - green/emerald for thought hygiene */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <span className="text-xl">🧹</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Thought Hygiene</h2>
                <p className="text-sm text-gray-400">2-3 minute mental cache clear</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {session.isActive && (
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
                    ? 'bg-emerald-600 text-white'
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
              placeholder={
                session.step === 'dump' ? "List what's on your mind..." :
                session.step === 'acknowledge' ? 'Type "free" to acknowledge...' :
                session.step === 'reset' ? 'Type "done" when ready...' :
                session.step === 'rating' ? 'Rate 1-5...' :
                'Type your response...'
              }
              rows={session.step === 'dump' ? 4 : 1}
              className="flex-1 bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 resize-none min-h-[48px] max-h-[200px] transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-5 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 self-end"
            >
              Send
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {session.step === 'dump' && 'Shift+Enter for new line • Enter to send'}
            {session.step === 'acknowledge' && 'Type "free" to acknowledge your loops'}
            {session.step === 'reset' && 'Take 3 breaths, then type "done"'}
            {session.step === 'rating' && 'Rate your mental clarity 1-5'}
            {session.step === 'complete' && 'Session complete • Click "End Session" to close'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// HOOK FOR USING THE MODAL
// ============================================

export function useThoughtHygiene() {
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
    <ThoughtHygieneModalComponent 
      isOpen={isOpen} 
      onClose={close}
      userId={userId}
    />
  ), [isOpen, close, userId]);

  return { open, close, isOpen, Modal };
}

export default ThoughtHygieneModalComponent;
