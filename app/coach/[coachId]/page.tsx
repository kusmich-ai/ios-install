// app/coach/[coachId]/page.tsx - COMPLETE VERSION WITH MEMORY MANAGEMENT
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { coaches, getCoachOpeningMessage, CoachId } from '@/lib/coachPrompts';
import { ArrowLeft, Plus, Trash2, MessageSquare, Send, Menu, X, AlertCircle, WifiOff, XCircle, Loader2, Check, Cloud, Brain, User, Heart, AlertTriangle, Target, Zap, Lightbulb, Settings, Clock, Shield, Sparkles } from 'lucide-react';

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

interface ToastNotification {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  duration?: number;
}

interface Memory {
  id: string;
  coach_id: string;
  category: string;
  key: string;
  value: string;
  confidence: number;
  updated_at: string;
}

// ============================================
// CONSTANTS
// ============================================
const ERROR_MESSAGES = {
  network: { title: 'Connection Error', message: "Can't reach the server. Check your internet connection and try again." },
  rateLimit: { title: 'Slow Down', message: "You're sending messages too quickly. Please wait a moment and try again." },
  unauthorized: { title: 'Session Expired', message: 'Your session has expired. Please sign in again.' },
  serverError: { title: 'Something Went Wrong', message: "We're having trouble processing your message. Please try again." },
  conversationLoad: { title: "Couldn't Load Conversations", message: 'There was a problem loading your conversations. Pull to refresh.' },
  conversationDelete: { title: "Couldn't Delete", message: 'There was a problem deleting this conversation. Try again.' },
  generic: { title: 'Error', message: 'Something went wrong. Please try again.' },
};

const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  fact: { icon: <User className="w-4 h-4" />, label: 'Facts', color: 'text-blue-400' },
  relationship: { icon: <Heart className="w-4 h-4" />, label: 'Relationships', color: 'text-pink-400' },
  challenge: { icon: <AlertTriangle className="w-4 h-4" />, label: 'Challenges', color: 'text-orange-400' },
  goal: { icon: <Target className="w-4 h-4" />, label: 'Goals', color: 'text-green-400' },
  pattern: { icon: <Zap className="w-4 h-4" />, label: 'Patterns', color: 'text-yellow-400' },
  value: { icon: <Sparkles className="w-4 h-4" />, label: 'Values', color: 'text-purple-400' },
  strength: { icon: <Shield className="w-4 h-4" />, label: 'Strengths', color: 'text-cyan-400' },
  insight: { icon: <Lightbulb className="w-4 h-4" />, label: 'Insights', color: 'text-amber-400' },
  preference: { icon: <Settings className="w-4 h-4" />, label: 'Preferences', color: 'text-gray-400' },
  context: { icon: <Clock className="w-4 h-4" />, label: 'Context', color: 'text-indigo-400' },
};

const COACH_LABELS: Record<string, string> = { nic: '⚡ Nic', fehren: '🌿 Fehren' };

// ============================================
// TOAST COMPONENTS
// ============================================
function Toast({ notification, onDismiss, accentColor }: { notification: ToastNotification; onDismiss: (id: string) => void; accentColor: string }) {
  useEffect(() => {
    if (notification.duration !== 0) {
      const timer = setTimeout(() => onDismiss(notification.id), notification.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  const getIcon = () => {
    switch (notification.type) {
      case 'error': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'info': return <Brain className="w-5 h-5" style={{ color: accentColor }} />;
      case 'success': return <Check className="w-5 h-5 text-green-400" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'error': return 'border-red-500/50';
      case 'warning': return 'border-yellow-500/50';
      case 'success': return 'border-green-500/50';
      default: return 'border-gray-500/50';
    }
  };

  return (
    <div className={`flex items-start gap-3 bg-[#1a1a1a] border ${getBorderColor()} rounded-lg p-4 shadow-lg animate-slide-in max-w-sm`} role="alert">
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{notification.title}</p>
        <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
      </div>
      <button onClick={() => onDismiss(notification.id)} className="flex-shrink-0 text-gray-500 hover:text-gray-300 transition-colors" aria-label="Dismiss">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function ToastContainer({ notifications, onDismiss, accentColor }: { notifications: ToastNotification[]; onDismiss: (id: string) => void; accentColor: string }) {
  if (notifications.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map(n => <Toast key={n.id} notification={n} onDismiss={onDismiss} accentColor={accentColor} />)}
    </div>
  );
}

// ============================================
// LOADING COMPONENTS
// ============================================
function LoadingSkeleton({ coachName, accentColor }: { coachName: string; accentColor: string }) {
  return (
    <div className="flex h-screen bg-[#0a0a0a]">
      <div className="hidden md:flex w-64 bg-[#0f0f0f] border-r border-gray-800 flex-col">
        <div className="p-4 border-b border-gray-800"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded bg-gray-800 animate-pulse" /><div className="w-20 h-5 rounded bg-gray-800 animate-pulse" /></div></div>
        <div className="p-3"><div className="w-full h-10 rounded-lg bg-gray-800 animate-pulse" /></div>
        <div className="flex-1 p-2 space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-10 rounded-lg bg-gray-800/50 animate-pulse" />)}</div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b border-gray-800 flex items-center px-4"><div className="w-32 h-5 rounded bg-gray-800 animate-pulse" /></div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: accentColor }} />
            <p className="text-gray-400">Loading {coachName}...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConversationListSkeleton() {
  return (
    <div className="p-2 space-y-2">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg">
          <div className="w-4 h-4 rounded bg-gray-800 animate-pulse" />
          <div className="flex-1 h-4 rounded bg-gray-800 animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
        </div>
      ))}
    </div>
  );
}

function SaveStatus({ status, accentColor }: { status: 'idle' | 'saving' | 'saved' | 'error' | 'learning'; accentColor: string }) {
  if (status === 'idle') return null;
  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-500">
      {status === 'saving' && <><Loader2 className="w-3 h-3 animate-spin" /><span>Saving...</span></>}
      {status === 'saved' && <><Cloud className="w-3 h-3" style={{ color: accentColor }} /><span style={{ color: accentColor }}>Saved</span></>}
      {status === 'learning' && <><Brain className="w-3 h-3 animate-pulse" style={{ color: accentColor }} /><span style={{ color: accentColor }}>Learning...</span></>}
      {status === 'error' && <><AlertCircle className="w-3 h-3 text-red-400" /><span className="text-red-400">Not saved</span></>}
    </div>
  );
}

function LoadingButton({ onClick, loading, disabled, children, className, loadingText }: { onClick: () => void; loading: boolean; disabled?: boolean; children: React.ReactNode; className?: string; loadingText?: string }) {
  return (
    <button onClick={onClick} disabled={loading || disabled} className={`${className} ${loading || disabled ? 'opacity-70 cursor-not-allowed' : ''}`}>
      {loading ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />{loadingText || 'Loading...'}</span> : children}
    </button>
  );
}

function InlineError({ message, onRetry, accentColor }: { message: string; onRetry?: () => void; accentColor: string }) {
  return (
    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2 my-2">
      <WifiOff className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && <button onClick={onRetry} className="text-xs px-2 py-1 rounded hover:bg-red-500/20 transition-colors" style={{ color: accentColor }}>Retry</button>}
    </div>
  );
}

// ============================================
// MEMORY MODAL
// ============================================
function MemoryModal({ isOpen, onClose, accentColor }: { isOpen: boolean; onClose: () => void; accentColor: string }) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showForgetConfirm, setShowForgetConfirm] = useState(false);
  const [forgetting, setForgetting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'nic' | 'fehren'>('all');
  const [error, setError] = useState<string | null>(null);

  const loadMemories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/coach/memory?format=all');
      if (!response.ok) throw new Error('Failed to load');
      const data = await response.json();
      setMemories(data.memories || []);
    } catch (err) {
      setError("Couldn't load memories. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) loadMemories();
  }, [isOpen, loadMemories]);

  const deleteMemory = async (memoryId: string) => {
    setDeleting(memoryId);
    try {
      const response = await fetch(`/api/coach/memory?id=${memoryId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed');
      setMemories(prev => prev.filter(m => m.id !== memoryId));
    } catch (err) {
      setError("Couldn't delete. Try again.");
    } finally {
      setDeleting(null);
    }
  };

  const forgetEverything = async () => {
    setForgetting(true);
    try {
      const response = await fetch('/api/coach/memory?everything=true', { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed');
      setMemories([]);
      setShowForgetConfirm(false);
    } catch (err) {
      setError("Couldn't clear memories. Try again.");
    } finally {
      setForgetting(false);
    }
  };

  const filteredMemories = filter === 'all' ? memories : memories.filter(m => m.coach_id === filter);
  const groupedMemories: Record<string, Memory[]> = {};
  for (const memory of filteredMemories) {
    if (!groupedMemories[memory.category]) groupedMemories[memory.category] = [];
    groupedMemories[memory.category].push(memory);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[80vh] bg-[#0f0f0f] border border-gray-800 rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5" style={{ color: accentColor }} />
            <h2 className="text-lg font-medium text-white">What I Remember</h2>
            <span className="text-sm text-gray-500">({filteredMemories.length})</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 p-3 border-b border-gray-800">
          {(['all', 'nic', 'fehren'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${filter === f ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              {f === 'all' ? 'All' : COACH_LABELS[f]}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" style={{ color: accentColor }} /></div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <button onClick={loadMemories} className="text-sm px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700">Try Again</button>
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">{filter === 'all' ? "I don't have any memories yet. Keep chatting and I'll learn about you!" : `No memories from ${COACH_LABELS[filter]} yet.`}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedMemories).map(([category, categoryMemories]) => {
                const config = CATEGORY_CONFIG[category] || { icon: <Brain className="w-4 h-4" />, label: category, color: 'text-gray-400' };
                return (
                  <div key={category}>
                    <div className={`flex items-center gap-2 mb-2 ${config.color}`}>
                      {config.icon}
                      <span className="text-sm font-medium">{config.label}</span>
                      <span className="text-xs text-gray-500">({categoryMemories.length})</span>
                    </div>
                    <div className="space-y-2">
                      {categoryMemories.map(memory => (
                        <div key={memory.id} className="group flex items-start gap-3 p-3 bg-[#1a1a1a] rounded-lg hover:bg-[#222] transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-200">{memory.value}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">{COACH_LABELS[memory.coach_id]}</span>
                              <span className="text-xs text-gray-600">•</span>
                              <span className="text-xs text-gray-500">{Math.round(memory.confidence * 100)}% confident</span>
                            </div>
                          </div>
                          <button onClick={() => deleteMemory(memory.id)} disabled={deleting === memory.id} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all" title="Delete">
                            {deleting === memory.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          {showForgetConfirm ? (
            <div className="flex items-center justify-between gap-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Delete all memories? This can't be undone.</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowForgetConfirm(false)} disabled={forgetting} className="px-3 py-1.5 text-sm text-gray-400 hover:text-white">Cancel</button>
                <button onClick={forgetEverything} disabled={forgetting} className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2">
                  {forgetting ? <><Loader2 className="w-3 h-3 animate-spin" />Forgetting...</> : 'Yes, Forget Everything'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Memories personalize your coaching experience.</p>
              {memories.length > 0 && (
                <button onClick={() => setShowForgetConfirm(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />Forget Everything
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
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
// MEMORY EXTRACTION HOOK
// ============================================
function useMemoryExtraction(coachId: string, showToast: (type: ToastNotification['type'], title: string, message: string, duration?: number) => void) {
  const extractionInProgressRef = useRef<string | null>(null);
  const messageCountRef = useRef<Record<string, number>>({});

  const extractMemories = useCallback(async (conversationId: string, messages: Message[], showNotification = false) => {
    if (extractionInProgressRef.current === conversationId) return;
    if (messages.length < 6) return;
    const lastCount = messageCountRef.current[conversationId] || 0;
    if (messages.length - lastCount < 6) return;
    
    extractionInProgressRef.current = conversationId;
    try {
      const response = await fetch('/api/coach/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coachId, conversationId, messages }),
      });
      if (response.ok) {
        const data = await response.json();
        messageCountRef.current[conversationId] = messages.length;
        if (data.memoriesExtracted > 0 && showNotification) {
          showToast('info', 'Learning', `Noted ${data.memoriesExtracted} thing${data.memoriesExtracted > 1 ? 's' : ''} about you.`, 3000);
        }
      }
    } catch (error) {
      console.error('[Memory] Extraction error:', error);
    } finally {
      extractionInProgressRef.current = null;
    }
  }, [coachId, showToast]);

  return { extractMemories };
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function CoachChatPage() {
  const params = useParams();
  const router = useRouter();
  const coachId = params.coachId as CoachId;
  
  const coach = coaches[coachId];
  if (!coach) {
    return (
      <div className="flex h-screen bg-[#0a0a0a] items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl text-white mb-2">Coach not found</h1>
          <button onClick={() => router.push('/chat')} className="text-[#ff9e19] hover:underline">Return to IOS</button>
        </div>
      </div>
    );
  }

  // State
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [memoryModalOpen, setMemoryModalOpen] = useState(false);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error' | 'learning'>('idle');
  
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const saveStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousConversationRef = useRef<{ id: string; messages: Message[] } | null>(null);

  // Toast helpers
  const showToast = useCallback((type: ToastNotification['type'], title: string, message: string, duration?: number) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, title, message, duration }]);
  }, []);
  const dismissToast = useCallback((id: string) => setNotifications(prev => prev.filter(n => n.id !== id)), []);
  const showError = useCallback((errorType: keyof typeof ERROR_MESSAGES, customMessage?: string) => {
    const error = ERROR_MESSAGES[errorType];
    showToast('error', error.title, customMessage || error.message);
  }, [showToast]);

  const { extractMemories } = useMemoryExtraction(coachId, showToast);

  const handleApiError = useCallback((response: Response): string => {
    if (!response.ok) {
      if (response.status === 401) { showError('unauthorized'); router.push('/signin'); return 'unauthorized'; }
      if (response.status === 429) { showError('rateLimit'); return 'rateLimit'; }
      if (response.status >= 500) { showError('serverError'); return 'serverError'; }
    }
    return 'ok';
  }, [showError, router]);

  // Memory extraction triggers
  useEffect(() => {
    if (previousConversationRef.current && previousConversationRef.current.id !== activeConversationId && previousConversationRef.current.messages.length >= 6) {
      extractMemories(previousConversationRef.current.id, previousConversationRef.current.messages, false);
    }
    if (activeConversationId && messages.length > 0) {
      previousConversationRef.current = { id: activeConversationId, messages };
    }
  }, [activeConversationId, extractMemories]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (activeConversationId && messages.length >= 6) {
        navigator.sendBeacon('/api/coach/memory', JSON.stringify({ coachId, conversationId: activeConversationId, messages }));
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [activeConversationId, messages, coachId]);

  // Initialization
  useEffect(() => { initializeCoach(); }, [coachId]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { if (!sending) inputRef.current?.focus(); }, [sending, activeConversationId]);
  useEffect(() => () => { if (saveStatusTimeoutRef.current) clearTimeout(saveStatusTimeoutRef.current); }, []);

  async function initializeCoach() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/signin'); return; }
      setUser(user);
      setUserName(user.user_metadata?.first_name || user.user_metadata?.name || '');
      await loadConversations();
    } catch (error) {
      showError('generic', 'Failed to initialize. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }

  async function loadConversations() {
    setConversationsLoading(true);
    try {
      const response = await fetch(`/api/coach/conversations?coachId=${coachId}`);
      if (!response.ok) { handleApiError(response); return; }
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      showError('conversationLoad');
    } finally {
      setConversationsLoading(false);
    }
  }

  async function loadConversation(conversationId: string) {
    if (activeConversationId && messages.length >= 6) extractMemories(activeConversationId, messages, false);
    setConversationLoading(true);
    try {
      const response = await fetch(`/api/coach/conversations?coachId=${coachId}&conversationId=${conversationId}`);
      if (!response.ok) { handleApiError(response); return; }
      const data = await response.json();
      if (data.conversation) {
        setMessages(data.conversation.messages || []);
        setActiveConversationId(conversationId);
        setMessageError(null);
        setLastFailedMessage(null);
        setSaveStatus('idle');
      }
    } catch (error) {
      showError('generic', "Couldn't load this conversation.");
    } finally {
      setConversationLoading(false);
    }
  }

  async function startNewConversation() {
    if (activeConversationId && messages.length >= 6) {
      setSaveStatus('learning');
      await extractMemories(activeConversationId, messages, true);
    }
    setCreatingConversation(true);
    try {
      const response = await fetch('/api/coach/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coachId, messages: [], title: 'New conversation' }),
      });
      if (!response.ok) { handleApiError(response); return; }
      const data = await response.json();
      if (data.conversation) {
        setConversations(prev => [data.conversation, ...prev]);
        setActiveConversationId(data.conversation.id);
        const openingMessage = getCoachOpeningMessage(coachId, userName);
        setMessages([{ role: 'assistant', content: openingMessage }]);
        setMessageError(null);
        setLastFailedMessage(null);
        setSaveStatus('idle');
        await saveConversation([{ role: 'assistant', content: openingMessage }], data.conversation.id);
      }
      setMobileSidebarOpen(false);
    } catch (error) {
      showError('generic', "Couldn't start a new conversation.");
    } finally {
      setCreatingConversation(false);
    }
  }

  async function deleteConversation(conversationId: string) {
    if (!confirm('Delete this conversation? This cannot be undone.')) return;
    setDeletingConversationId(conversationId);
    try {
      const response = await fetch(`/api/coach/conversations?conversationId=${conversationId}`, { method: 'DELETE' });
      if (!response.ok) { handleApiError(response); showError('conversationDelete'); return; }
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (activeConversationId === conversationId) { setActiveConversationId(null); setMessages([]); }
      showToast('success', 'Deleted', 'Conversation removed.', 2000);
    } catch (error) {
      showError('conversationDelete');
    } finally {
      setDeletingConversationId(null);
    }
  }

  async function sendMessage(retryMessage?: string) {
    const messageToSend = retryMessage || input.trim();
    if (!messageToSend || sending) return;
    if (!retryMessage) setInput('');
    setSending(true);
    setMessageError(null);
    setLastFailedMessage(null);
    const updatedMessages: Message[] = [...messages, { role: 'user', content: messageToSend }];
    setMessages(updatedMessages);
    try {
      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages, coachId, conversationId: activeConversationId }),
      });
      if (!response.ok) {
        const errorType = handleApiError(response);
        setMessages(messages);
        if (errorType === 'rateLimit') { setMessageError('Too many messages. Wait a moment.'); setLastFailedMessage(messageToSend); }
        else if (errorType !== 'unauthorized') { setMessageError('Failed to send message.'); setLastFailedMessage(messageToSend); }
        setSending(false);
        return;
      }
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      const finalMessages: Message[] = [...updatedMessages, { role: 'assistant', content: data.response }];
      setMessages(finalMessages);
      await saveConversation(finalMessages);
      if (finalMessages.length > 0 && finalMessages.length % 10 === 0) {
        setTimeout(() => extractMemories(activeConversationId!, finalMessages, true), 2000);
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        showError('network');
        setMessageError('Network error. Check your connection.');
      } else {
        setMessageError('Something went wrong. Try again.');
      }
      setLastFailedMessage(messageToSend);
      setMessages(messages);
    }
    setSending(false);
  }

  async function saveConversation(messagesToSave: Message[], conversationId?: string) {
    const convId = conversationId || activeConversationId;
    if (!convId) return;
    setSaveStatus('saving');
    if (saveStatusTimeoutRef.current) clearTimeout(saveStatusTimeoutRef.current);
    const activeConvo = conversations.find(c => c.id === convId);
    let title = activeConvo?.title || 'New conversation';
    if (title === 'New conversation') {
      const firstUserMsg = messagesToSave.find(m => m.role === 'user');
      if (firstUserMsg) title = firstUserMsg.content.slice(0, 50) + (firstUserMsg.content.length > 50 ? '...' : '');
    }
    try {
      const response = await fetch('/api/coach/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coachId, conversationId: convId, messages: messagesToSave, title }),
      });
      if (!response.ok) { setSaveStatus('error'); return; }
      setSaveStatus('saved');
      saveStatusTimeoutRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, title, updated_at: new Date().toISOString() } : c));
    } catch (error) {
      setSaveStatus('error');
    }
  }

  function handleRetry() { if (lastFailedMessage) sendMessage(lastFailedMessage); }
  function handleBackToIOS() {
    if (activeConversationId && messages.length >= 6) extractMemories(activeConversationId, messages, false);
    router.push('/chat');
  }

  if (loading) return <LoadingSkeleton coachName={coach.name} accentColor={coach.accentColor} />;

  const accentColor = coach.accentColor;
  const accentBg = coachId === 'nic' ? 'bg-[#ff9e19]' : 'bg-[#7c9eb2]';
  const accentHover = coachId === 'nic' ? 'hover:bg-orange-600' : 'hover:bg-[#6b8da1]';
  const accentBorder = coachId === 'nic' ? 'border-[#ff9e19]' : 'border-[#7c9eb2]';

  return (
    <div className="flex h-screen bg-[#0a0a0a]">
      <ToastContainer notifications={notifications} onDismiss={dismissToast} accentColor={accentColor} />
      <MemoryModal isOpen={memoryModalOpen} onClose={() => setMemoryModalOpen(false)} accentColor={accentColor} />

      {mobileSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileSidebarOpen(false)} />}

      {/* Sidebar */}
      <div className={`${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${sidebarOpen ? 'md:w-64' : 'md:w-0'} fixed md:relative inset-y-0 left-0 z-50 md:z-auto w-64 bg-[#0f0f0f] border-r border-gray-800 transition-all duration-300 ease-in-out flex flex-col`}>
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span style={{ color: accentColor }}>{coach.icon}</span>
            <span className="font-medium text-white">{coach.name}</span>
          </div>
          <button onClick={() => setMobileSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-3">
          <LoadingButton onClick={startNewConversation} loading={creatingConversation} loadingText="Creating..." className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg ${accentBg} ${accentHover} text-white transition-colors`}>
            <Plus className="w-4 h-4" />New conversation
          </LoadingButton>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversationsLoading ? <ConversationListSkeleton /> : conversations.length === 0 ? (
            <div className="p-4 text-gray-500 text-sm text-center">No conversations yet</div>
          ) : (
            conversations.map(conv => (
              <div key={conv.id} className={`group flex items-center gap-2 px-3 py-2 mx-2 my-1 rounded-lg cursor-pointer ${activeConversationId === conv.id ? 'bg-gray-800' : 'hover:bg-gray-800/50'} ${deletingConversationId === conv.id ? 'opacity-50' : ''} transition-all`} onClick={() => !deletingConversationId && loadConversation(conv.id)}>
                <MessageSquare className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="flex-1 text-sm text-gray-300 truncate">{conv.title}</span>
                {deletingConversationId === conv.id ? <Loader2 className="w-4 h-4 text-gray-500 animate-spin" /> : (
                  <button onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-800 space-y-1">
          <button onClick={() => setMemoryModalOpen(true)} className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
            <Brain className="w-4 h-4" />What I Remember
          </button>
          <button onClick={handleBackToIOS} className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />Back to IOS
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-14 border-b border-gray-800 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebarOpen(true)} className="md:hidden text-gray-400 hover:text-white"><Menu className="w-5 h-5" /></button>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden md:block text-gray-400 hover:text-white"><Menu className="w-5 h-5" /></button>
            <div className="flex items-center gap-2">
              <span style={{ color: accentColor }}>{coach.icon}</span>
              <span className="font-medium text-white">{coach.name}</span>
              <span className="text-gray-500 text-sm hidden sm:inline">• {coach.tagline}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SaveStatus status={saveStatus} accentColor={accentColor} />
            {/* Quick-switch to other coach */}
            <button
              onClick={() => {
                if (activeConversationId && messages.length >= 6) extractMemories(activeConversationId, messages, false);
                router.push(`/coach/${coachId === 'nic' ? 'fehren' : 'nic'}`);
              }}
              className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title={`Switch to ${coachId === 'nic' ? 'Fehren' : 'Nic'}`}
            >
              <span>{coachId === 'nic' ? '💙' : '⚡'}</span>
              <span className="hidden sm:inline">{coachId === 'nic' ? 'Fehren' : 'Nic'}</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          {conversationLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: accentColor }} /><p className="text-gray-500 text-sm">Loading conversation...</p></div>
            </div>
          ) : !activeConversationId ? (
            <div className="h-full flex items-center justify-center p-4">
              <div className="w-full max-w-lg">
                {/* Intro Card */}
                <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 sm:p-8">
                  {/* Header with Photo */}
                  <div className="text-center mb-6">
                    <div className="relative inline-block mb-4">
                      <picture>
                        <source srcSet={coachId === 'nic' ? '/coaches/nic.avif' : '/coaches/fehren.avif'} type="image/avif" />
                        <source srcSet={coachId === 'nic' ? '/coaches/nic.webp' : '/coaches/fehren.webp'} type="image/webp" />
                        <img 
                          src={coachId === 'nic' ? '/coaches/nic.jpg' : '/coaches/fehren.jpg'}
                          alt={coach.name}
                          className="w-24 h-24 rounded-full object-cover"
                          style={{ borderColor: accentColor, borderWidth: '3px', borderStyle: 'solid' }}
                          onError={(e) => {
                            // If all image formats fail, hide img and show emoji fallback
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const fallback = target.parentElement?.querySelector('.emoji-fallback');
                            if (fallback) (fallback as HTMLElement).style.display = 'flex';
                          }}
                        />
                      </picture>
                      {/* Emoji fallback (hidden by default) */}
                      <div 
                        className="emoji-fallback w-24 h-24 rounded-full items-center justify-center text-5xl bg-[#1a1a1a] hidden"
                        style={{ borderColor: accentColor, borderWidth: '3px', borderStyle: 'solid' }}
                      >
                        {coach.icon}
                      </div>
                      <div 
                        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-lg bg-[#111] border-2"
                        style={{ borderColor: accentColor }}
                      >
                        {coach.icon}
                      </div>
                    </div>
                    <h2 className="text-2xl font-medium text-white mb-1">{coach.name}</h2>
                    <p className="text-sm" style={{ color: accentColor }}>{coach.tagline}</p>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-center mb-6 leading-relaxed">
                    {coachId === 'nic' 
                      ? "Direct, practical, and neuroscience-grounded. I help you see what's actually running you so you can move without fighting yourself."
                      : "Warm, spacious, and feeling-first. I help you stop forcing and start allowing — because alignment creates motion more than effort ever could."
                    }
                  </p>

                  {/* Good For section */}
                  <div className="bg-[#0a0a0a] rounded-xl p-4 mb-6">
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Good for</p>
                    <div className="space-y-2">
                      {(coachId === 'nic' ? [
                        'Breaking patterns and loops',
                        'Understanding why you\'re stuck', 
                        'Performance and focus',
                        'Nervous system regulation',
                      ] : [
                        'Emotional processing and release',
                        'Relationship dynamics',
                        'Parenting and family',
                        'Parts work and inner healing',
                      ]).map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Example prompts */}
                  <div className="mb-6">
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Try asking</p>
                    <div className="space-y-2">
                      {(coachId === 'nic' ? [
                        "I know what to do but can't make myself do it",
                        "Why do I keep self-sabotaging?",
                      ] : [
                        "I'm feeling overwhelmed and don't know why",
                        "I keep giving too much to others",
                      ]).map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            startNewConversation();
                            // Note: We can't pre-fill input easily here, but clicking starts the convo
                          }}
                          className="w-full text-left text-sm text-gray-400 hover:text-white bg-[#0a0a0a] hover:bg-[#1a1a1a] rounded-lg px-3 py-2.5 transition-colors border border-transparent hover:border-gray-700"
                        >
                          "{prompt}"
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Start button */}
                  <LoadingButton 
                    onClick={startNewConversation} 
                    loading={creatingConversation} 
                    loadingText="Starting..." 
                    className={`w-full py-3 rounded-xl ${accentBg} ${accentHover} text-white font-medium transition-colors`}
                  >
                    Start a conversation
                  </LoadingButton>

                  {/* Switch coach hint */}
                  <p className="text-center text-xs text-gray-600 mt-4">
                    Looking for {coachId === 'nic' ? 'emotional processing' : 'pattern breaking'}?{' '}
                    <button 
                      onClick={() => router.push(`/coach/${coachId === 'nic' ? 'fehren' : 'nic'}`)}
                      className="hover:underline"
                      style={{ color: coachId === 'nic' ? '#7c9eb2' : '#ff9e19' }}
                    >
                      Try {coachId === 'nic' ? 'Fehren' : 'Nic'}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? `${accentBg} text-white` : 'bg-[#1a1a1a] text-gray-200'}`}>
                    {msg.role === 'assistant' ? <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content, accentColor) }} /> : <p className="whitespace-pre-wrap">{msg.content}</p>}
                  </div>
                </div>
              ))}
              {messageError && <InlineError message={messageError} onRetry={lastFailedMessage ? handleRetry : undefined} accentColor={accentColor} />}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-[#1a1a1a] rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: accentColor, animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: accentColor, animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: accentColor, animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {activeConversationId && (
          <div className="border-t border-gray-800 p-4">
            <div className="max-w-3xl mx-auto">
              <div className={`flex items-end gap-2 bg-[#1a1a1a] rounded-2xl border ${accentBorder} p-2`}>
                <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder={`Message ${coach.name}...`} className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none outline-none px-2 py-1 max-h-32" rows={1} disabled={sending} />
                <button onClick={() => sendMessage()} disabled={!input.trim() || sending} className={`p-2 rounded-xl transition-colors ${input.trim() && !sending ? `${accentBg} ${accentHover} text-white` : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}>
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}
