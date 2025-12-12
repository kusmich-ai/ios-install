// app/coach/[coachId]/page.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { coaches, getCoachOpeningMessage, CoachId } from '@/lib/coachPrompts';
import { ArrowLeft, Plus, Trash2, MessageSquare, Send, Menu, X } from 'lucide-react';

// ============================================
// TYPES
// ============================================
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updated_at: string;
  created_at: string;
}

// ============================================
// MARKDOWN RENDERER
// ============================================
function renderMarkdown(text: string, accentColor: string): string {
  const colorClass = accentColor === '#ff9e19' ? 'text-[#ff9e19]' : 'text-[#7c9eb2]';
  return text
    .replace(/\*\*(.*?)\*\*/g, `<strong class="${colorClass}">$1</strong>`)
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/^[•\-]\s+(.*)$/gm, '<div class="ml-4">• $1</div>')
    .replace(/\n/g, '<br />');
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function CoachChatPage() {
  const params = useParams();
  const router = useRouter();
  const coachId = params.coachId as CoachId;
  
  // Validate coach ID
  const coach = coaches[coachId];
  if (!coach) {
    return (
      <div className="flex h-screen bg-[#0a0a0a] items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl text-white mb-2">Coach not found</h1>
          <button 
            onClick={() => router.push('/chat')}
            className="text-[#ff9e19] hover:underline"
          >
            Return to IOS
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // STATE
  // ============================================
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Conversations state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ============================================
  // INITIALIZATION
  // ============================================
  useEffect(() => {
    initializeCoach();
  }, [coachId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!sending) {
      inputRef.current?.focus();
    }
  }, [sending, activeConversationId]);

  async function initializeCoach() {
    setLoading(true);
    const supabase = createClient();
    
    // Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/signin');
      return;
    }
    setUser(user);

    // Get user profile for name
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('first_name')
      .eq('id', user.id)
      .single();
    
    if (profile?.first_name) {
      setUserName(profile.first_name);
    }

    // Load conversations for this coach
    await loadConversations();
    setLoading(false);
  }

  async function loadConversations() {
    try {
      const response = await fetch(`/api/coach/conversations?coachId=${coachId}`);
      const data = await response.json();
      
      if (data.conversations) {
        setConversations(data.conversations);
        
        // If there are conversations, load the most recent one
        if (data.conversations.length > 0) {
          await loadConversation(data.conversations[0].id);
        } else {
          // Start a new conversation
          await startNewConversation();
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }

  async function loadConversation(conversationId: string) {
    try {
      const response = await fetch(
        `/api/coach/conversations?coachId=${coachId}&conversationId=${conversationId}`
      );
      const data = await response.json();
      
      if (data.conversation) {
        setActiveConversationId(data.conversation.id);
        setMessages(data.conversation.messages || []);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  }

  // ============================================
  // CONVERSATION MANAGEMENT
  // ============================================
  async function startNewConversation() {
    // Create opening message
    const openingMessage = getCoachOpeningMessage(coachId, userName);
    const newMessages: Message[] = [{ role: 'assistant', content: openingMessage }];
    
    try {
      const response = await fetch('/api/coach/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coachId,
          messages: newMessages,
          title: 'New conversation',
        }),
      });
      
      const data = await response.json();
      
      if (data.conversation) {
        setConversations(prev => [data.conversation, ...prev]);
        setActiveConversationId(data.conversation.id);
        setMessages(newMessages);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      // Still show the conversation locally even if save fails
      setMessages(newMessages);
    }
    
    setMobileSidebarOpen(false);
  }

  async function deleteConversation(conversationId: string, e: React.MouseEvent) {
    e.stopPropagation();
    
    if (!confirm('Delete this conversation?')) return;
    
    try {
      await fetch(`/api/coach/conversations?conversationId=${conversationId}`, {
        method: 'DELETE',
      });
      
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      // If we deleted the active conversation, load another or start new
      if (activeConversationId === conversationId) {
        const remaining = conversations.filter(c => c.id !== conversationId);
        if (remaining.length > 0) {
          await loadConversation(remaining[0].id);
        } else {
          await startNewConversation();
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }

  // ============================================
  // MESSAGE HANDLING
  // ============================================
  async function sendMessage() {
    if (!input.trim() || sending) return;
    
    const userMessage = input.trim();
    setInput('');
    setSending(true);
    
    // Add user message to UI immediately
    const updatedMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(updatedMessages);
    
    try {
      // Call coach chat API
      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          coachId,
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Add assistant response
      const finalMessages: Message[] = [
        ...updatedMessages,
        { role: 'assistant', content: data.response },
      ];
      setMessages(finalMessages);
      
      // Save conversation
      await saveConversation(finalMessages);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "I'm having trouble connecting right now. Please try again." },
      ]);
    }
    
    setSending(false);
  }

  async function saveConversation(messagesToSave: Message[]) {
    if (!activeConversationId) return;
    
    // Generate title from first user message if still "New conversation"
    const activeConvo = conversations.find(c => c.id === activeConversationId);
    let title = activeConvo?.title || 'New conversation';
    
    if (title === 'New conversation') {
      const firstUserMsg = messagesToSave.find(m => m.role === 'user');
      if (firstUserMsg) {
        title = firstUserMsg.content.slice(0, 50) + (firstUserMsg.content.length > 50 ? '...' : '');
      }
    }
    
    try {
      await fetch('/api/coach/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coachId,
          conversationId: activeConversationId,
          messages: messagesToSave,
          title,
        }),
      });
      
      // Update local state with new title
      setConversations(prev => 
        prev.map(c => 
          c.id === activeConversationId 
            ? { ...c, title, updated_at: new Date().toISOString() } 
            : c
        )
      );
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }

  // ============================================
  // RENDER
  // ============================================
  if (loading) {
    return (
      <div className="flex h-screen bg-[#0a0a0a] items-center justify-center">
        <div className="text-gray-400">Loading {coach.name}...</div>
      </div>
    );
  }

  const accentColor = coach.accentColor;
  const accentBg = coachId === 'nic' ? 'bg-[#ff9e19]' : 'bg-[#7c9eb2]';
  const accentHover = coachId === 'nic' ? 'hover:bg-orange-600' : 'hover:bg-[#6b8da1]';
  const accentText = coachId === 'nic' ? 'text-[#ff9e19]' : 'text-[#7c9eb2]';
  const accentBorder = coachId === 'nic' ? 'border-[#ff9e19]' : 'border-[#7c9eb2]';

  return (
    <div className="flex h-screen bg-[#0a0a0a]">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-50
        w-72 bg-[#0a0a0a] border-r border-gray-800
        transform transition-transform duration-200
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${sidebarOpen ? 'md:w-72' : 'md:w-0 md:border-0'}
        flex flex-col
      `}>
        {/* Sidebar Header */}
        <div className={`p-4 border-b border-gray-800 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{coach.icon}</span>
            <div>
              <h1 className={`font-semibold ${accentText}`}>{coach.name}</h1>
              <p className="text-xs text-gray-500">{coach.tagline}</p>
            </div>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-2 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={startNewConversation}
            className={`w-full flex items-center gap-2 px-4 py-2.5 ${accentBg} ${accentHover} text-white rounded-lg font-medium transition-colors`}
          >
            <Plus className="w-4 h-4" />
            New conversation
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">
            Previous chats
          </p>
          {conversations.length === 0 ? (
            <p className="text-sm text-gray-600 px-2">No conversations yet</p>
          ) : (
            <div className="space-y-1">
              {conversations.map((convo) => (
                <div
                  key={convo.id}
                  onClick={() => {
                    loadConversation(convo.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`
                    group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer
                    transition-colors
                    ${activeConversationId === convo.id 
                      ? `bg-gray-800 ${accentBorder} border` 
                      : 'hover:bg-gray-900 border border-transparent'
                    }
                  `}
                >
                  <MessageSquare className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="flex-1 text-sm text-gray-300 truncate">
                    {convo.title}
                  </span>
                  <button
                    onClick={(e) => deleteConversation(convo.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back to IOS */}
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={() => router.push('/chat')}
            className="w-full flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-900 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to IOS
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <header className="h-14 border-b border-gray-800 flex items-center px-4 gap-3">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden p-2 text-gray-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:block p-2 text-gray-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">{coach.icon}</span>
            <span className={`font-medium ${accentText}`}>{coach.name}</span>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                    msg.role === 'user'
                      ? `${accentBg} text-white`
                      : 'bg-gray-800 text-gray-100 border border-gray-700'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  ) : (
                    <div 
                      className="leading-relaxed prose prose-invert prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content, accentColor) }}
                    />
                  )}
                </div>
              </div>
            ))}
            
            {sending && (
              <div className="flex justify-start">
                <div className="bg-gray-800 border border-gray-700 rounded-2xl px-5 py-3">
                  <div className="flex gap-1.5">
                    <div className={`w-2 h-2 ${accentBg} opacity-60 rounded-full animate-bounce`} />
                    <div className={`w-2 h-2 ${accentBg} opacity-60 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
                    <div className={`w-2 h-2 ${accentBg} opacity-60 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800 p-4 bg-[#0a0a0a]">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={`Message ${coach.name}...`}
                disabled={sending}
                rows={1}
                className={`
                  flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 
                  text-white placeholder-gray-500 
                  focus:outline-none focus:ring-2 focus:ring-opacity-50
                  disabled:opacity-50 resize-none min-h-[48px] max-h-[120px]
                  transition-all
                  ${coachId === 'nic' ? 'focus:ring-[#ff9e19] focus:border-[#ff9e19]' : 'focus:ring-[#7c9eb2] focus:border-[#7c9eb2]'}
                `}
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className={`
                  px-5 py-3 ${accentBg} text-white rounded-xl font-medium 
                  ${accentHover} disabled:opacity-50 transition-colors
                  flex items-center gap-2
                `}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
