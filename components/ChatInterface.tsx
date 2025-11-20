'use client';

import { useState, useRef, useEffect } from 'react';
import { useIsMobile } from '@/app/hooks/useIsMobile';
import { useUserProgress } from '@/app/hooks/useUserProgress';
import ToolsSidebar from '@/components/ToolsSidebar';
import FloatingActionButton from '@/components/FloatingActionButton';

interface ChatInterfaceProps {
  user: any; // You can make this more specific later
  baselineData: {
    rewiredIndex: number;
    tier: string;
    domainScores: {
      regulation: number;
      awareness: number;
      outlook: number;
      attention: number;
    };
    currentStage: number;
  };
}

export default function ChatInterface({ user, baselineData }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasInitialized = useRef<boolean>(false);

  const isMobile = useIsMobile();
  const { progress, loading: progressLoading, error: progressError } = useUserProgress();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    if (hasInitialized.current) return;
    
    const initConversation = async () => {
      try {
        if (!baselineData || !user) {
          setError('Missing data. Please complete assessment.');
          return;
        }

        const initMessage = `Hello. I've completed my baseline assessment. My REwired Index is ${baselineData.rewiredIndex}/100 (${baselineData.tier}). My domain scores are: Regulation ${baselineData.domainScores.regulation}/5, Awareness ${baselineData.domainScores.awareness}/5, Outlook ${baselineData.domainScores.outlook}/5, Attention ${baselineData.domainScores.attention}/5. I'm currently at Stage ${baselineData.currentStage}.`;

        const greeting = await sendToAPI([
          { role: 'user', content: initMessage }
        ]);
        
        if (greeting) {
          setMessages([{ role: 'assistant', content: greeting }]);
        }
        
        hasInitialized.current = true;
    } catch (error) {
  console.error('Error initializing:', error);
  setError(`Failed to initialize: ${error instanceof Error ? error.message : 'Unknown error'}`);
}
    };

    if (user && baselineData) {
      initConversation();
    }
  }, [user, baselineData]);

  const sendToAPI = async (messageHistory) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messageHistory,
          userId: user?.id,
          baselineData: baselineData,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.content[0].text;
    } catch (error) {
  console.error('sendToAPI error:', error);
  setError(`API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  return null;
}
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setError(null);
    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const response = await sendToAPI(newMessages);
    if (response) {
      setMessages([...newMessages, { role: 'assistant', content: response }]);
    }
    setLoading(false);
  };

  const handlePracticeClick = async (practiceId: string) => {
    const practiceMessage = `I want to do the ${practiceId} practice now.`;
    const userMessage = { role: 'user', content: practiceMessage };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLoading(true);

    const response = await sendToAPI(newMessages);
    if (response) {
      setMessages([...newMessages, { role: 'assistant', content: response }]);
    }
    setLoading(false);
  };

  const handleToolClick = async (toolId: string) => {
    const toolMessage = `I want to run the ${toolId} protocol.`;
    const userMessage = { role: 'user', content: toolMessage };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLoading(true);

    const response = await sendToAPI(newMessages);
    if (response) {
      setMessages([...newMessages, { role: 'assistant', content: response }]);
    }
    setLoading(false);
  };

  if (error || progressError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0a]">
        <div className="max-w-md p-8 rounded-lg bg-[#111111] border border-gray-800">
          <h2 className="text-xl font-bold mb-4 text-[#ff9e19]">Error</h2>
          <p className="text-gray-400 mb-4">{error || progressError}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-2 text-white rounded-lg bg-[#ff9e19] hover:bg-orange-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  const getUserName = () => {
    if (user?.user_metadata?.first_name) return user.user_metadata.first_name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const stageProgress = ((baselineData.currentStage - 1) / 6) * 100;

  return (
    <div className="flex h-screen bg-[#0a0a0a]">
      {/* Desktop Sidebar - Your existing dashboard */}
      <aside className="hidden md:block w-80 border-r border-gray-800 bg-[#111111] overflow-y-auto">
        <div className="p-4">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white mb-1">IOS System Installer</h1>
            <p className="text-xs text-gray-400 mb-2">Neural & Mental Operating System</p>
            <p className="text-sm font-medium text-white">{getUserName()}</p>
          </div>

          <div className="mb-6 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#ff9e19] font-semibold">
                Stage {baselineData.currentStage} of 7
              </span>
            </div>
            <div className="w-full rounded-full h-1.5 bg-[#1a1a1a]">
              <div 
                className="h-1.5 rounded-full transition-all bg-[#ff9e19]"
                style={{ width: `${stageProgress}%` }}
              />
            </div>
          </div>

          <div className="mb-6 p-4 rounded-lg text-center border-2 bg-[#0a0a0a] border-[#ff9e19]">
            <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">REwired Index</div>
            <div className="text-4xl font-bold mb-1 text-[#ff9e19]">
              {baselineData.rewiredIndex}
            </div>
            <div className="w-full rounded-full h-1.5 bg-[#1a1a1a]">
              <div 
                className="h-1.5 rounded-full transition-all bg-[#ff9e19]"
                style={{ width: `${baselineData.rewiredIndex}%` }}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-6 py-4 ${
                    msg.role === 'user'
                      ? 'bg-[#ff9e19] text-white'
                      : 'bg-gray-800 text-gray-100 border border-gray-700'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 border border-gray-700 rounded-2xl px-6 py-4">
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
        </div>

        <div className="border-t border-gray-800 bg-[#0a0a0a]">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <form onSubmit={sendMessage} className="flex gap-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
                placeholder="Type your message..."
                disabled={loading}
                rows={1}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff9e19] disabled:opacity-50 resize-none min-h-[52px] max-h-[200px]"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="px-6 py-3 bg-[#ff9e19] text-white rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                Send
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>

      {/* Tools Sidebar (Desktop) */}
      {!isMobile && progress && (
        <ToolsSidebar
          progress={progress}
          onPracticeClick={handlePracticeClick}
          onToolClick={handleToolClick}
        />
      )}

      {/* Floating Action Button (Mobile) */}
      {isMobile && progress && (
        <FloatingActionButton
          progress={progress}
          onPracticeClick={handlePracticeClick}
          onToolClick={handleToolClick}
        />
      )}
    </div>
  );
}
