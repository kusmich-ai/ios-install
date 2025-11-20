'use client';

import { useState, useRef, useEffect } from 'react';

export default function ChatInterface({ user, baselineData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const hasInitialized = useRef(false);

  // Debug logging
  useEffect(() => {
    console.log('ChatInterface mounted');
    console.log('User:', user);
    console.log('Baseline Data:', baselineData);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    if (hasInitialized.current) {
      console.log('Already initialized, skipping');
      return;
    }
    
    const initConversation = async () => {
      try {
        console.log('Initializing conversation...');
        
        if (!baselineData) {
          console.error('No baseline data provided');
          setError('Baseline data not found. Please complete the assessment.');
          return;
        }

        if (!user) {
          console.error('No user provided');
          setError('User not found. Please sign in.');
          return;
        }

        const initMessage = `Hello. I've completed my baseline assessment. My REwired Index is ${baselineData.rewiredIndex}/100 (${baselineData.tier}). My domain scores are: Regulation ${baselineData.domainScores.regulation}/5, Awareness ${baselineData.domainScores.awareness}/5, Outlook ${baselineData.domainScores.outlook}/5, Attention ${baselineData.domainScores.attention}/5. I'm currently at Stage ${baselineData.currentStage}.`;

        console.log('Sending initial message:', initMessage);

        const greeting = await sendToAPI([
          { role: 'user', content: initMessage }
        ]);
        
        if (greeting) {
          console.log('Received greeting:', greeting.substring(0, 100) + '...');
          setMessages([{ role: 'assistant', content: greeting }]);
        }
        
        hasInitialized.current = true;
        console.log('Initialization complete');
      } catch (error) {
        console.error('Error initializing conversation:', error);
        setError(`Failed to initialize: ${error.message}`);
      }
    };

    if (user && baselineData) {
      console.log('Starting initialization...');
      initConversation();
    } else {
      console.log('Missing requirements:', { hasUser: !!user, hasBaseline: !!baselineData });
    }
  }, [user, baselineData]);

  const sendToAPI = async (messageHistory) => {
    try {
      console.log('Sending to API:', messageHistory);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messageHistory,
          userId: user?.id,
          baselineData: baselineData,
        }),
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API response data:', data);

      if (data.error) {
        throw new Error(data.error);
      }

      return data.content[0].text;
    } catch (error) {
      console.error('sendToAPI error:', error);
      setError(`API error: ${error.message}`);
      return null;
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    console.log('Sending message:', input);
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

  const getTierColor = (tier) => {
    const tierLower = tier?.toLowerCase() || '';
    if (tierLower.includes('integrated') || tierLower.includes('embodied')) return 'text-purple-400';
    if (tierLower.includes('optimized') || tierLower.includes('coherent')) return 'text-green-400';
    if (tierLower.includes('operational') || tierLower.includes('stabilizing')) return 'text-blue-400';
    if (tierLower.includes('baseline') || tierLower.includes('installing')) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0a]">
        <div className="max-w-md p-8 rounded-lg bg-[#111111] border border-gray-800">
          <h2 className="text-xl font-bold mb-4 text-[#ff9e19]">Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-2 text-white rounded-lg bg-[#ff9e19] hover:bg-orange-600 transition-colors"
            >
              Reload Page
            </button>
            <button
              onClick={() => window.location.href = '/assessment'}
              className="w-full px-6 py-2 text-white rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors"
            >
              Back to Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get user's first name from profile or email
  const getUserName = () => {
    if (user?.user_metadata?.first_name) {
      return user.user_metadata.first_name;
    }
    // Fallback to email username if no first name
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  // Calculate days in current stage (placeholder - you'll need to implement actual logic)
  const getDaysInStage = () => {
    // TODO: Calculate from stage_start_date in user_progress table
    // For now, returning placeholder
    return 3; // Replace with actual calculation
  };

  const daysInStage = getDaysInStage();
  const daysRemaining = 14 - daysInStage; // 14 days required for stage completion
  const stageProgress = (daysInStage / 14) * 100;

  return (
    <div className="flex h-screen bg-[#0a0a0a]">
      {/* Compact Sidebar Dashboard */}
      <aside className="w-80 border-r border-gray-800 bg-[#111111] overflow-y-auto flex-shrink-0">
        <div className="p-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white mb-1">IOS System Installer</h1>
            <p className="text-xs text-gray-400 mb-2">Neural & Mental Operating System</p>
            <p className="text-sm font-medium text-white">{getUserName()}</p>
          </div>

          {/* Stage Badge with Day Counter */}
          <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#ff9e19] font-semibold">Stage {baselineData.currentStage}</span>
              <span className="text-xs text-gray-400">Day {daysInStage}</span>
            </div>
            {/* Progress bar to next stage */}
            <div className="w-full rounded-full h-1.5 mb-2" style={{ backgroundColor: '#1a1a1a' }}>
              <div 
                className="h-1.5 rounded-full transition-all"
                style={{ 
                  backgroundColor: '#ff9e19',
                  width: `${Math.min(stageProgress, 100)}%`
                }}
              />
            </div>
            <p className="text-xs text-gray-400">
              {daysRemaining > 0 ? `${daysRemaining} days to unlock eligibility` : 'Ready for evaluation'}
            </p>
          </div>

          {/* REwired Index - Compact */}
          <div className="mb-6 p-4 rounded-lg text-center border-2" style={{ backgroundColor: '#0a0a0a', borderColor: '#ff9e19' }}>
            <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">REwired Index</div>
            <div className="text-4xl font-bold mb-1" style={{ color: '#ff9e19' }}>
              {baselineData.rewiredIndex}
            </div>
            <div className={`text-xs font-semibold mb-2 ${getTierColor(baselineData.tier)}`}>
              {baselineData.tier}
            </div>
            <div className="w-full rounded-full h-1.5" style={{ backgroundColor: '#1a1a1a' }}>
              <div 
                className="h-1.5 rounded-full transition-all duration-500"
                style={{ 
                  backgroundColor: '#ff9e19',
                  width: `${baselineData.rewiredIndex}%`
                }}
              />
            </div>
          </div>

          {/* Domain Scores - Compact Stack */}
          <div className="space-y-3">
            {/* Regulation - Blue */}
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#0a0a0a' }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" style={{ color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="text-sm font-semibold text-white">Regulation</span>
                </div>
                <span className="text-lg font-bold text-white">
                  {baselineData.domainScores.regulation.toFixed(1)}
                  <span className="text-xs text-gray-500">/5</span>
                </span>
              </div>
              <div className="w-full rounded-full h-1.5" style={{ backgroundColor: '#1a1a1a' }}>
                <div 
                  className="h-1.5 rounded-full transition-all"
                  style={{ 
                    backgroundColor: '#3b82f6',
                    width: `${(baselineData.domainScores.regulation / 5) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* Awareness - Purple */}
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#0a0a0a' }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" style={{ color: '#a855f7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-sm font-semibold text-white">Awareness</span>
                </div>
                <span className="text-lg font-bold text-white">
                  {baselineData.domainScores.awareness.toFixed(1)}
                  <span className="text-xs text-gray-500">/5</span>
                </span>
              </div>
              <div className="w-full rounded-full h-1.5" style={{ backgroundColor: '#1a1a1a' }}>
                <div 
                  className="h-1.5 rounded-full transition-all"
                  style={{ 
                    backgroundColor: '#a855f7',
                    width: `${(baselineData.domainScores.awareness / 5) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* Outlook - Yellow */}
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#0a0a0a' }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" style={{ color: '#eab308' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-sm font-semibold text-white">Outlook</span>
                </div>
                <span className="text-lg font-bold text-white">
                  {baselineData.domainScores.outlook.toFixed(1)}
                  <span className="text-xs text-gray-500">/5</span>
                </span>
              </div>
              <div className="w-full rounded-full h-1.5" style={{ backgroundColor: '#1a1a1a' }}>
                <div 
                  className="h-1.5 rounded-full transition-all"
                  style={{ 
                    backgroundColor: '#eab308',
                    width: `${(baselineData.domainScores.outlook / 5) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* Attention - Green */}
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#0a0a0a' }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" style={{ color: '#22c55e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-semibold text-white">Attention</span>
                </div>
                <span className="text-lg font-bold text-white">
                  {baselineData.domainScores.attention.toFixed(1)}
                  <span className="text-xs text-gray-500">/5</span>
                </span>
              </div>
              <div className="w-full rounded-full h-1.5" style={{ backgroundColor: '#1a1a1a' }}>
                <div 
                  className="h-1.5 rounded-full transition-all"
                  style={{ 
                    backgroundColor: '#22c55e',
                    width: `${(baselineData.domainScores.attention / 5) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages Area */}
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
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
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
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff9e19] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none min-h-[52px] max-h-[200px]"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-6 py-3 bg-[#ff9e19] text-white rounded-xl font-semibold hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-[#ff9e19] focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
    </div>
  );
}
