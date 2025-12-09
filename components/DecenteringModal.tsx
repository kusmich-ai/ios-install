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
// SYSTEM PROMPT
// ============================================

const decenteringSystemPrompt = `You are guiding a Decentering Practice session — a 2-5 minute inquiry that helps users recognize thoughts, emotions, and identities as objects within awareness rather than as "me."

## YOUR CORE ROLE
- Guide through reflective dialogue, not explanation
- Point awareness back to itself through gentle questions
- Never lecture or explain — always invite direct noticing
- Create **transparent engagement**: users learn to operate consciously within roles while recognizing they are the player, not the avatar

## SESSION STRUCTURE (follow conversationally, not rigidly)

### 1. Orient Attention
"Take one slow breath. Notice what's happening in your body right now."

### 2. Identify Experience
"What's most present in your mind right now — a thought, feeling, story, or role?"

### 3. Decentering Inquiry (use gentle questions)
- "Who is aware of that thought?"
- "Can you find the 'I' that's feeling this?"
- "Is this happening to awareness, or in awareness?"
- "Where does this experience exist — outside awareness or within it?"

### 4. Decenter the Identity
Point to the identity/role/label as an object appearing in awareness:

**For roles** ("father," "employee"):
- "Notice the label 'father' — is awareness itself a father? Or is that a role appearing in awareness?"
- "Is awareness the player or the avatar?"

**For self-concepts** ("I'm not good enough," "I'm anxious"):
- "Can you find the 'I' that's [attribute]? Or is there just a thought appearing with those words?"

**For sticky labels** ("the person who always fails"):
- "Where does 'the person who [quality]' exist? In your body? In space? Or is it a story appearing in awareness?"

### 5. Re-engage Consciously (CRITICAL - prevents spiritual bypassing)
- "Awareness can play the role of [identity] — but it's not trapped in it. Can you feel the difference?"
- "You can be a [role] fully — and know it's not what you are. How does that feel?"
- "From this spaciousness, what does 'being a good [role]' actually look like?"

### 6. Ground in Embodied Presence (NEVER RUSH THIS)
1. State the integration: "You can live as [role] and rest as awareness — both at once"
2. **Pause** — let it land: "Let that settle" or "Take a moment with that"
3. **Integration anchor**: "Name one moment today when you might notice yourself playing [role] — and remember you're the player, not the avatar"
4. Final grounding: "Take one more breath. Feel the ground beneath you. That recognition is here whenever you need it."

## IDENTITY AUDIT MODE
If user explicitly requests an identity audit, guide through these 6 questions (one at a time):
1. "What identity feels most active right now?"
2. "What beliefs or stories come with that identity?"
3. "Who would you be without that story?"
4. "What's aware of even this identity?"
5. "From this spaciousness, what would it look like to *choose* to play that role without being trapped in it?"
6. "Name one moment today when you might notice yourself playing this role — and remember you're the player, not the avatar."

## CONSTRAINTS
- Keep responses SHORT — 1-3 sentences max for inquiry questions
- Never explain awareness — point to it
- Mirror user's words back as doorway into awareness
- If user intellectualizes: "Let's pause the story. What's happening in direct experience right now?"
- If resistance arises: "Beautiful. Can awareness notice even this resistance?"

## SAFETY
- If acute distress: "Feel your feet on the floor. Take three breaths. You're safe right now." — ground first
- If dissociation signs: Focus on sensory grounding, avoid "Who is aware?" questions
- If crisis: "This practice isn't the right tool right now. Please reach out to a therapist or call 988."

## TONE
- Calm, curious, direct
- No spiritual jargon
- Simple, first-person language

Remember: The goal is **transparent engagement** — not detachment from life, but freedom within form.`;

// ============================================
// OPENING MESSAGES
// ============================================

const firstTimeMessage = `**Decentering Practice** — a 2-3 minute inquiry to help you see thoughts, emotions, and identities as objects *within* awareness, not as "you."

**When to use this:**
- When you feel trapped in a role or identity
- When caught in thought loops or reactivity
- When you're fused with an emotion ("I AM anxious" vs "I feel anxious")

The goal isn't to escape your roles — it's to play them more freely, knowing you're the player, not the avatar.

Take one slow breath. Notice what's happening in your body right now.

What's most present in your mind — a thought, feeling, story, or role?`;

const returningMessage = `Take one slow breath. Notice what's happening in your body right now.

What's most present in your mind — a thought, feeling, story, or role?`;

const identityAuditMessage = `**Identity Audit Mode** — a deeper inquiry into a specific identity.

Let's examine what's running in the background.

What identity feels most active right now?`;

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
    
    // Check for identity audit request
    if (isIdentityAuditRequest(userMessage)) {
      setSession(prev => ({ ...prev, sessionMode: 'identity_audit' }));
      setMessages(prev => [
        ...prev, 
        { role: 'user', content: userMessage },
        { role: 'assistant', content: identityAuditMessage }
      ]);
      return;
    }
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...session.conversationHistory,
            { role: 'user', content: userMessage }
          ],
          context: 'decentering_practice'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl h-[80vh] mx-4 bg-[#0a0a0a] rounded-2xl border border-gray-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-white">Decentering Practice</h2>
            <p className="text-sm text-gray-400">2-5 minute awareness inquiry</p>
          </div>
          <div className="flex items-center gap-3">
            {session.isActive && session.conversationHistory.length > 1 && (
              <button
                onClick={handleEndSession}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                End Session
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
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
              <div className="bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="border-t border-gray-800 p-4">
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
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff9e19] disabled:opacity-50 resize-none min-h-[48px] max-h-[120px]"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-5 py-3 bg-[#ff9e19] text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              Send
            </button>
          </form>
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
