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

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a]">
      {/* System Status Header */}
      <header className="border-b border-gray-800 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Title Row */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">IOS System Installer</h1>
              <p className="text-sm text-gray-400">Neural & Mental Operating System</p>
              {user?.email && <p className="text-xs text-gray-500 mt-1">{user.email}</p>}
            </div>
            <div className="px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <span className="text-[#ff9e19] font-semibold">Stage {baselineData.currentStage}</span>
            </div>
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* REwired Index - Takes 2 columns on desktop */}
            <div className="md:col-span-2 bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">REwired Index</div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-[#ff9e19]">
                  {baselineData.rewiredIndex}
                </span>
                <span className="text-xl text-gray-500">/100</span>
              </div>
              <div className={`text-sm mt-1 ${getTierColor(baselineData.tier)}`}>
                {baselineData.tier}
              </div>
            </div>

            {/* Domain Scores - 3 columns on desktop */}
            <div className="md:col-span-3 grid grid-cols-2 gap-3">
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Regulation</div>
                <div className="text-2xl font-bold text-white">
                  {baselineData.domainScores.regulation.toFixed(1)}
                  <span className="text-sm text-gray-500">/5</span>
                </div>
              </div>
              
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Awareness</div>
                <div className="text-2xl font-bold text-white">
                  {baselineData.domainScores.awareness.toFixed(1)}
                  <span className="text-sm text-gray-500">/5</span>
                </div>
              </div>
              
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Outlook</div>
                <div className="text-2xl font-bold text-white">
                  {baselineData.domainScores.outlook.toFixed(1)}
                  <span className="text-sm text-gray-500">/5</span>
                </div>
              </div>
              
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Attention</div>
                <div className="text-2xl font-bold text-white">
                  {baselineData.domainScores.attention.toFixed(1)}
                  <span className="text-sm text-gray-500">/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

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
  );
}
