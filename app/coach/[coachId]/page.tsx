// app/coach/[coachId]/page.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { coaches, getCoachOpeningMessage, CoachId } from '@/lib/coachPrompts';
import { ArrowLeft, Plus, Trash2, MessageSquare, Send, Menu, X, AlertCircle, WifiOff, XCircle, Loader2, Check, Cloud } from 'lucide-react';

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

// ============================================
// ERROR MESSAGES
// ============================================
const ERROR_MESSAGES = {
  network: {
    title: 'Connection Error',
    message: "Can't reach the server. Check your internet connection and try again.",
  },
  rateLimit: {
    title: 'Slow Down',
    message: "You're sending messages too quickly. Please wait a moment and try again.",
  },
  unauthorized: {
    title: 'Session Expired',
    message: 'Your session has expired. Please sign in again.',
  },
  serverError: {
    title: 'Something Went Wrong',
    message: "We're having trouble processing your message. Please try again.",
  },
  conversationLoad: {
    title: 'Couldn\'t Load Conversations',
    message: 'There was a problem loading your conversations. Pull to refresh.',
  },
  conversationSave: {
    title: 'Couldn\'t Save',
    message: "Your message was sent but we couldn't save the conversation.",
  },
  conversationDelete: {
    title: 'Couldn\'t Delete',
    message: 'There was a problem deleting this conversation. Try again.',
  },
  generic: {
    title: 'Error',
    message: 'Something went wrong. Please try again.',
  },
};

// ============================================
// TOAST NOTIFICATION COMPONENT
// ============================================
function Toast({ 
  notification, 
  onDismiss,
  accentColor 
}: { 
  notification: ToastNotification; 
  onDismiss: (id: string) => void;
  accentColor: string;
}) {
  useEffect(() => {
    if (notification.duration !== 0) {
      const timer = setTimeout(() => {
        onDismiss(notification.id);
      }, notification.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  const getIcon = () => {
    switch (notification.type) {
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'info':
        return <AlertCircle className="w-5 h-5" style={{ color: accentColor }} />;
      case 'success':
        return <Check className="w-5 h-5 text-green-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'error':
        return 'border-red-500/50';
      case 'warning':
        return 'border-yellow-500/50';
      case 'success':
        return 'border-green-500/50';
      default:
        return 'border-gray-500/50';
    }
  };

  return (
    <div 
      className={`flex items-start gap-3 bg-[#1a1a1a] border ${getBorderColor()} rounded-lg p-4 shadow-lg animate-slide-in max-w-sm`}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{notification.title}</p>
        <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
      </div>
      <button
        onClick={() => onDismiss(notification.id)}
        className="flex-shrink-0 text-gray-500 hover:text-gray-300 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Toast Container
function ToastContainer({ 
  notifications, 
  onDismiss,
  accentColor 
}: { 
  notifications: ToastNotification[]; 
  onDismiss: (id: string) => void;
  accentColor: string;
}) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map(notification => (
        <Toast 
          key={notification.id} 
          notification={notification} 
          onDismiss={onDismiss}
          accentColor={accentColor}
        />
      ))}
    </div>
  );
}

// ============================================
// LOADING COMPONENTS
// ============================================

// Full page loading skeleton
function LoadingSkeleton({ coachName, accentColor }: { coachName: string; accentColor: string }) {
  return (
    <div className="flex h-screen bg-[#0a0a0a]">
      {/* Sidebar skeleton */}
      <div className="hidden md:flex w-64 bg-[#0f0f0f] border-r border-gray-800 flex-col">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gray-800 animate-pulse" />
            <div className="w-20 h-5 rounded bg-gray-800 animate-pulse" />
          </div>
        </div>
        <div className="p-3">
          <div className="w-full h-10 rounded-lg bg-gray-800 animate-pulse" />
        </div>
        <div className="flex-1 p-2 space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 rounded-lg bg-gray-800/50 animate-pulse" />
          ))}
        </div>
      </div>
      
      {/* Main area skeleton */}
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b border-gray-800 flex items-center px-4">
          <div className="w-32 h-5 rounded bg-gray-800 animate-pulse" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 
              className="w-8 h-8 animate-spin mx-auto mb-3" 
              style={{ color: accentColor }}
            />
            <p className="text-gray-400">Loading {coachName}...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Conversation list loading skeleton
function ConversationListSkeleton() {
  return (
    <div className="p-2 space-y-2">
      {[1, 2, 3, 4].map(i => (
        <div 
          key={i} 
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
        >
          <div className="w-4 h-4 rounded bg-gray-800 animate-pulse" />
          <div 
            className="flex-1 h-4 rounded bg-gray-800 animate-pulse"
            style={{ width: `${60 + Math.random() * 30}%` }}
          />
        </div>
      ))}
    </div>
  );
}

// Save status indicator
function SaveStatus({ 
  status, 
  accentColor 
}: { 
  status: 'idle' | 'saving' | 'saved' | 'error';
  accentColor: string;
}) {
  if (status === 'idle') return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-500">
      {status === 'saving' && (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Cloud className="w-3 h-3" style={{ color: accentColor }} />
          <span style={{ color: accentColor }}>Saved</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="w-3 h-3 text-red-400" />
          <span className="text-red-400">Not saved</span>
        </>
      )}
    </div>
  );
}

// Button with loading state
function LoadingButton({
  onClick,
  loading,
  disabled,
  children,
  className,
  loadingText,
}: {
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  loadingText?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`${className} ${loading || disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          {loadingText || 'Loading...'}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

// ============================================
// INLINE ERROR COMPONENT
// ============================================
function InlineError({ 
  message, 
  onRetry,
  accentColor 
}: { 
  message: string; 
  onRetry?: () => void;
  accentColor: string;
}) {
  return (
    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2 my-2">
      <WifiOff className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs px-2 py-1 rounded hover:bg-red-500/20 transition-colors"
          style={{ color: accentColor }}
        >
          Retry
        </button>
      )}
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
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  
  // Loading states for specific actions
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // Error handling state
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const saveStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================
  // TOAST HELPERS
  // ============================================
  const showToast = useCallback((
    type: ToastNotification['type'],
    title: string,
    message: string,
    duration?: number
  ) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, title, message, duration }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showError = useCallback((errorType: keyof typeof ERROR_MESSAGES, customMessage?: string) => {
    const error = ERROR_MESSAGES[errorType];
    showToast('error', error.title, customMessage || error.message);
  }, [showToast]);

  // ============================================
  // ERROR HANDLER
  // ============================================
  const handleApiError = useCallback((response: Response, context: string): string => {
    if (!response.ok) {
      if (response.status === 401) {
        showError('unauthorized');
        router.push('/signin');
        return 'unauthorized';
      }
      if (response.status === 429) {
        showError('rateLimit');
        return 'rateLimit';
      }
      if (response.status >= 500) {
        showError('serverError');
        return 'serverError';
      }
    }
    return 'ok';
  }, [showError, router]);

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

  // Cleanup save status timeout
  useEffect(() => {
    return () => {
      if (saveStatusTimeoutRef.current) {
        clearTimeout(saveStatusTimeoutRef.current);
      }
    };
  }, []);

  async function initializeCoach() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/signin');
        return;
      }
      
      setUser(user);
      
      // Get user's name from metadata
      const name = user.user_metadata?.first_name || user.user_metadata?.name || '';
      setUserName(name);
      
      // Load conversations
      await loadConversations();
      
    } catch (error) {
      console.error('Error initializing coach:', error);
      showError('generic', 'Failed to initialize. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }

  // ============================================
  // CONVERSATION MANAGEMENT
  // ============================================
  async function loadConversations() {
    setConversationsLoading(true);
    try {
      const response = await fetch(`/api/coach/conversations?coachId=${coachId}`);
      
      if (!response.ok) {
        handleApiError(response, 'loadConversations');
        return;
      }
      
      const data = await response.json();
      setConversations(data.conversations || []);
      
    } catch (error) {
      console.error('Error loading conversations:', error);
      showError('conversationLoad');
    } finally {
      setConversationsLoading(false);
    }
  }

  async function loadConversation(conversationId: string) {
    setConversationLoading(true);
    try {
      const response = await fetch(
        `/api/coach/conversations?coachId=${coachId}&conversationId=${conversationId}`
      );
      
      if (!response.ok) {
        handleApiError(response, 'loadConversation');
        return;
      }
      
      const data = await response.json();
      if (data.conversation) {
        setMessages(data.conversation.messages || []);
        setActiveConversationId(conversationId);
        setMessageError(null);
        setLastFailedMessage(null);
        setSaveStatus('idle');
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      showError('generic', 'Couldn\'t load this conversation.');
    } finally {
      setConversationLoading(false);
    }
  }

  async function startNewConversation() {
    setCreatingConversation(true);
    try {
      const response = await fetch('/api/coach/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coachId,
          messages: [],
          title: 'New conversation',
        }),
      });
      
      if (!response.ok) {
        handleApiError(response, 'startNewConversation');
        return;
      }
      
      const data = await response.json();
      
      if (data.conversation) {
        setConversations(prev => [data.conversation, ...prev]);
        setActiveConversationId(data.conversation.id);
        
        // Set initial message from coach
        const openingMessage = getCoachOpeningMessage(coachId, userName);
        setMessages([{ role: 'assistant', content: openingMessage }]);
        setMessageError(null);
        setLastFailedMessage(null);
        setSaveStatus('idle');
        
        // Save opening message
        await saveConversation([{ role: 'assistant', content: openingMessage }], data.conversation.id);
      }
      
      setMobileSidebarOpen(false);
      
    } catch (error) {
      console.error('Error creating conversation:', error);
      showError('generic', 'Couldn\'t start a new conversation.');
    } finally {
      setCreatingConversation(false);
    }
  }

  async function deleteConversation(conversationId: string) {
    if (!confirm('Delete this conversation? This cannot be undone.')) return;
    
    setDeletingConversationId(conversationId);
    try {
      const response = await fetch(
        `/api/coach/conversations?conversationId=${conversationId}`,
        { method: 'DELETE' }
      );
      
      if (!response.ok) {
        handleApiError(response, 'deleteConversation');
        showError('conversationDelete');
        return;
      }
      
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
        setMessages([]);
      }
      
      showToast('success', 'Deleted', 'Conversation removed.', 2000);
      
    } catch (error) {
      console.error('Error deleting conversation:', error);
      showError('conversationDelete');
    } finally {
      setDeletingConversationId(null);
    }
  }

  // ============================================
  // MESSAGE HANDLING
  // ============================================
  async function sendMessage(retryMessage?: string) {
    const messageToSend = retryMessage || input.trim();
    if (!messageToSend || sending) return;
    
    if (!retryMessage) {
      setInput('');
    }
    setSending(true);
    setMessageError(null);
    setLastFailedMessage(null);
    
    // Add user message to UI immediately
    const updatedMessages: Message[] = [...messages, { role: 'user', content: messageToSend }];
    setMessages(updatedMessages);
    
    try {
      // Call coach chat API
      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          coachId,
          conversationId: activeConversationId,
        }),
      });
      
      // Handle HTTP errors
      if (!response.ok) {
        const errorType = handleApiError(response, 'sendMessage');
        
        // Remove the user message we added
        setMessages(messages);
        
        if (errorType === 'rateLimit') {
          setMessageError('Too many messages. Wait a moment and try again.');
          setLastFailedMessage(messageToSend);
        } else if (errorType !== 'unauthorized') {
          setMessageError('Failed to send message.');
          setLastFailedMessage(messageToSend);
        }
        
        setSending(false);
        return;
      }
      
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
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        showError('network');
        setMessageError('Network error. Check your connection.');
      } else {
        setMessageError('Something went wrong. Try again.');
      }
      
      // Keep the user message but show error
      setLastFailedMessage(messageToSend);
      setMessages(messages); // Revert to previous messages
    }
    
    setSending(false);
  }

  async function saveConversation(messagesToSave: Message[], conversationId?: string) {
    const convId = conversationId || activeConversationId;
    if (!convId) return;
    
    // Show saving status
    setSaveStatus('saving');
    
    // Clear any existing timeout
    if (saveStatusTimeoutRef.current) {
      clearTimeout(saveStatusTimeoutRef.current);
    }
    
    // Generate title from first user message if still "New conversation"
    const activeConvo = conversations.find(c => c.id === convId);
    let title = activeConvo?.title || 'New conversation';
    
    if (title === 'New conversation') {
      const firstUserMsg = messagesToSave.find(m => m.role === 'user');
      if (firstUserMsg) {
        title = firstUserMsg.content.slice(0, 50) + (firstUserMsg.content.length > 50 ? '...' : '');
      }
    }
    
    try {
      const response = await fetch('/api/coach/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coachId,
          conversationId: convId,
          messages: messagesToSave,
          title,
        }),
      });
      
      if (!response.ok) {
        console.error('Error saving conversation:', response.status);
        setSaveStatus('error');
        return;
      }
      
      // Show saved status
      setSaveStatus('saved');
      
      // Clear saved status after 2 seconds
      saveStatusTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
      
      // Update local state with new title
      setConversations(prev => 
        prev.map(c => 
          c.id === convId 
            ? { ...c, title, updated_at: new Date().toISOString() } 
            : c
        )
      );
    } catch (error) {
      console.error('Error saving conversation:', error);
      setSaveStatus('error');
    }
  }

  function handleRetry() {
    if (lastFailedMessage) {
      sendMessage(lastFailedMessage);
    }
  }

  // ============================================
  // RENDER
  // ============================================
  
  // Show loading skeleton
  if (loading) {
    return <LoadingSkeleton coachName={coach.name} accentColor={coach.accentColor} />;
  }

  const accentColor = coach.accentColor;
  const accentBg = coachId === 'nic' ? 'bg-[#ff9e19]' : 'bg-[#7c9eb2]';
  const accentHover = coachId === 'nic' ? 'hover:bg-orange-600' : 'hover:bg-[#6b8da1]';
  const accentBorder = coachId === 'nic' ? 'border-[#ff9e19]' : 'border-[#7c9eb2]';

  return (
    <div className="flex h-screen bg-[#0a0a0a]">
      {/* Toast Notifications */}
      <ToastContainer 
        notifications={notifications} 
        onDismiss={dismissToast}
        accentColor={accentColor}
      />

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        ${sidebarOpen ? 'md:w-64' : 'md:w-0'}
        fixed md:relative inset-y-0 left-0 z-50 md:z-auto
        w-64 bg-[#0f0f0f] border-r border-gray-800
        transition-all duration-300 ease-in-out
        flex flex-col
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span style={{ color: accentColor }}>{coach.icon}</span>
            <span className="font-medium text-white">{coach.name}</span>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Conversation Button */}
        <div className="p-3">
          <LoadingButton
            onClick={startNewConversation}
            loading={creatingConversation}
            loadingText="Creating..."
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg ${accentBg} ${accentHover} text-white transition-colors`}
          >
            <Plus className="w-4 h-4" />
            New conversation
          </LoadingButton>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {conversationsLoading ? (
            <ConversationListSkeleton />
          ) : conversations.length === 0 ? (
            <div className="p-4 text-gray-500 text-sm text-center">
              No conversations yet
            </div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                className={`
                  group flex items-center gap-2 px-3 py-2 mx-2 my-1 rounded-lg cursor-pointer
                  ${activeConversationId === conv.id ? 'bg-gray-800' : 'hover:bg-gray-800/50'}
                  ${deletingConversationId === conv.id ? 'opacity-50' : ''}
                  transition-all
                `}
                onClick={() => !deletingConversationId && loadConversation(conv.id)}
              >
                <MessageSquare className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="flex-1 text-sm text-gray-300 truncate">
                  {conv.title}
                </span>
                {deletingConversationId === conv.id ? (
                  <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Back to IOS */}
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={() => router.push('/chat')}
            className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to IOS
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="h-14 border-b border-gray-800 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden text-gray-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:block text-gray-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span style={{ color: accentColor }}>{coach.icon}</span>
              <span className="font-medium text-white">{coach.name}</span>
              <span className="text-gray-500 text-sm hidden sm:inline">• {coach.tagline}</span>
            </div>
          </div>
          
          {/* Save Status Indicator */}
          <SaveStatus status={saveStatus} accentColor={accentColor} />
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {conversationLoading ? (
            // Loading specific conversation
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Loader2 
                  className="w-6 h-6 animate-spin mx-auto mb-2" 
                  style={{ color: accentColor }}
                />
                <p className="text-gray-500 text-sm">Loading conversation...</p>
              </div>
            </div>
          ) : !activeConversationId ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-4">{coach.icon}</div>
                <h2 className="text-xl font-medium text-white mb-2">{coach.name}</h2>
                <p className="text-gray-400 mb-6 max-w-md">{coach.description}</p>
                <LoadingButton
                  onClick={startNewConversation}
                  loading={creatingConversation}
                  loadingText="Starting..."
                  className={`px-6 py-2 rounded-lg ${accentBg} ${accentHover} text-white transition-colors`}
                >
                  Start a conversation
                </LoadingButton>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      max-w-[85%] rounded-2xl px-4 py-3
                      ${msg.role === 'user' 
                        ? `${accentBg} text-white` 
                        : 'bg-[#1a1a1a] text-gray-200'
                      }
                    `}
                  >
                    {msg.role === 'assistant' ? (
                      <div 
                        className="prose prose-invert prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: renderMarkdown(msg.content, accentColor) 
                        }}
                      />
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Inline error after messages */}
              {messageError && (
                <InlineError 
                  message={messageError}
                  onRetry={lastFailedMessage ? handleRetry : undefined}
                  accentColor={accentColor}
                />
              )}
              
              {/* Sending indicator */}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-[#1a1a1a] rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span 
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: accentColor, animationDelay: '0ms' }}
                      />
                      <span 
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: accentColor, animationDelay: '150ms' }}
                      />
                      <span 
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: accentColor, animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        {activeConversationId && (
          <div className="border-t border-gray-800 p-4">
            <div className="max-w-3xl mx-auto">
              <div className={`flex items-end gap-2 bg-[#1a1a1a] rounded-2xl border ${accentBorder} p-2`}>
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
                  className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none outline-none px-2 py-1 max-h-32"
                  rows={1}
                  disabled={sending}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || sending}
                  className={`
                    p-2 rounded-xl transition-colors
                    ${input.trim() && !sending 
                      ? `${accentBg} ${accentHover} text-white` 
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
