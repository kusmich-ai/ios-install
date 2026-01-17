// components/ThoughtHygieneModal.tsx
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import { toolUniversalFrame, lowResultFrame } from '@/lib/toolFraming';

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

const ACK_TOKEN = 'acknowledged';

const firstTimeFraming = `**Thought Hygiene** — a short offload to reduce cognitive load.

${toolUniversalFrame}

This is not problem-solving and not meaning-making.
It's about making active mental loops visible so they no longer need to be held in working memory.

Nothing here needs to be resolved right now.`;

const dumpPrompt = `Start with Signal first.

**Signal:** What tells you your mind is loaded right now?
(one word or short phrase — e.g. "tight head", "pressure", "scattered")

Now externalize content.

**What items are still being mentally rehearsed or held open?**

List them as bullets.
Tasks, conversations, reminders, worries — no explanation needed.
Just list what's present.`;

const acknowledgePrompt = `Good. The content has been externalized.

You are not solving or resolving these items now.
You are choosing deliberate non-action on them for this period.

If helpful, store them elsewhere (notes, task list).

To acknowledge the offload, type **"${ACK_TOKEN}"**.`;

const resetPrompt = `Reset attention.

Take 3 slow breaths.
Feel your feet or one body sensation.

**Signal:** Name one sensation you can verify right now.
**Action:** Deliberate non-action on the listed items until your next check-in.

When complete, type **"done"**.`;

const ratingPrompt = `Check clarity.

On a scale of **1–5**:
1 = attention still fragmented  
5 = attention available for next task  

Reply with the number only.`;

// ============================================
// HELPER FUNCTIONS
// ============================================

function getCompletionMessage(rating: number, sessionsToday: number): string {
  let message = '';

  if (rating >= 4) {
    message = `Good. Attention is available for the next task.`;
  } else if (rating === 3) {
    message = `Partial clearance. Attention is improved but not fully available.`;
  } else {
    // Step 2.3: Low-result fallback for rating <= 2
    message = `${lowResultFrame}\n\nConsider running **Reframe Protocol** on the dominant Interpretation driving the load.`;
  }

  if (sessionsToday >= 3) {
    message += `\n\n*You've run this ${sessionsToday} times today. If the load keeps returning, the next move is usually Interpretation work (Reframe Protocol).*`;
  }

  return message;
}

// Minimal markdown renderer.
// NOTE: Safe for static assistant strings. If you ever render dynamic model output here,
// escape HTML first or remove dangerouslySetInnerHTML.
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && session.step !== 'complete') {
      inputRef.current?.focus();
    }
  }, [session.step, isOpen]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          .eq('tool_type', 'thought_hygiene');

        isFirstTime = (count || 0) === 0;

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

    // Step 2.2: Universal frame in first-time message only
    let openingMessage = isFirstTime
      ? `${firstTimeFraming}\n\n${dumpPrompt}`
      : dumpPrompt;
    
    // Step 2.3: Add low-result frame if 3+ sessions today
    if (todayCount >= 3) {
      openingMessage += `\n\n*${lowResultFrame}*`;
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

  const saveSession = async (rating: number, startTime: Date | null) => {
    if (!userId) return;

    let durationSeconds = 0;
    if (startTime) {
      durationSeconds = Math.floor((Date.now() - startTime.getTime()) / 1000);
    }

    try {
      const supabase = createClient();
      // Step 2.4: Store as capacity signals, not success/fail
      await supabase.from('tool_sessions').insert({
        user_id: userId,
        tool_type: 'thought_hygiene',
        session_mode: 'standard',
        duration_seconds: durationSeconds,
        session_data: {
          // Capacity signals (not success/fail)
          clarity_rating: rating,
          was_signal_named: true, // Always true if they complete dump step
          was_interpretation_identified: false, // Not applicable for this tool
          action_selected: rating >= 3, // Did they gain enough clarity to act?
          sessions_today: sessionsToday + 1
        },
        recurring_themes: [] // privacy: do not store dump content
      });
    } catch (error) {
      console.error('[ThoughtHygiene] Failed to save session:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    const lowerMessage = userMessage.toLowerCase();

    const appendAssistant = (assistantText: string) => {
      setMessages(prev => [...prev, { role: 'assistant', content: assistantText }]);
      setSession(prev => ({
        ...prev,
        conversationHistory: [
          ...prev.conversationHistory,
          { role: 'user', content: userMessage },
          { role: 'assistant', content: assistantText }
        ]
      }));
    };

    switch (session.step) {
      case 'dump': {
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
      }

      case 'acknowledge': {
        const isAcknowledged =
          lowerMessage.includes(ACK_TOKEN) ||
          ['free', 'freed', 'ack', 'acknowledge', 'ok', 'okay', 'got it', 'noted', 'yes', 'yep'].some(w =>
            lowerMessage.includes(w)
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
          appendAssistant(`Type **"${ACK_TOKEN}"** to acknowledge the offload.`);
        }
        break;
      }

      case 'reset': {
        const isComplete = ['done', 'ready', 'complete', 'finished', 'ok', 'okay'].some(w => lowerMessage.includes(w));

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
          appendAssistant(`Do the 3 breaths + feet/bodysense, then type **"done"**.`);
        }
        break;
      }

      case 'rating': {
        const ratingMatch = userMessage.match(/^[1-5]$/) || userMessage.match(/[1-5]/);
        if (ratingMatch) {
          const rating = parseInt(ratingMatch[0], 10);
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

          void saveSession(rating, session.sessionStartTime);
        } else {
          appendAssistant(`Reply with a number **1–5** only.`);
        }
        break;
      }

      case 'complete': {
        appendAssistant(`Session complete. Click **End Session** to close.`);
        break;
      }
    }
  };

  const handleEndSession = () => {
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={handleClose} />

      <div className="relative w-full max-w-2xl h-[85vh] bg-gradient-to-b from-gray-900 to-[#0a0a0a] rounded-2xl border border-gray-700/50 flex flex-col overflow-hidden shadow-2xl shadow-black/50">
        <div className="relative px-6 py-5 border-b border-gray-700/50">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <span className="text-xl">🧹</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Thought Hygiene</h2>
                <p className="text-sm text-gray-400">2–3 minute mental cache clear</p>
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

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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

        <div className="border-t border-gray-700/50 p-4 bg-gray-900/50">
          <form
            onSubmit={e => {
              e.preventDefault();
              void handleSend();
            }}
            className="flex gap-3"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              placeholder={
                session.step === 'dump'
                  ? "List what's on your mind..."
                  : session.step === 'acknowledge'
                  ? `Type "${ACK_TOKEN}" to acknowledge...`
                  : session.step === 'reset'
                  ? 'Type "done" when ready...'
                  : session.step === 'rating'
                  ? 'Rate 1–5...'
                  : 'Type your response...'
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
            {session.step === 'acknowledge' && `Type "${ACK_TOKEN}" to acknowledge the offload`}
            {session.step === 'reset' && 'Take 3 breaths, then type "done"'}
            {session.step === 'rating' && 'Rate your mental clarity 1–5'}
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

  const Modal = useCallback(
    () => <ThoughtHygieneModalComponent isOpen={isOpen} onClose={close} userId={userId} />,
    [isOpen, close, userId]
  );

  return { open, close, isOpen, Modal };
}

export default ThoughtHygieneModalComponent;
