'use client';

import { useState, useRef, useEffect } from 'react';

export default function ChatInterface({ user, baselineData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const hasInitialized = useRef(false);

  // Debug logging
  useEffect(() => {
    console.log('ChatInterface mounted');
    console.log('User:', user);
    console.log('Baseline Data:', baselineData);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const renderBaselineDashboard = () => {
    if (!baselineData) {
      console.log('No baseline data to render');
      return null;
    }

    const orangeAccent = '#ff9e19';

    return (
      <div 
        className="p-4 rounded-lg mb-4 border"
        style={{ 
          backgroundColor: '#111111',
          borderColor: '#1a1a1a'
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white">Your System Status</h3>
          <span 
            className="px-3 py-1 rounded-full text-sm font-medium"
            style={{ 
              backgroundColor: orangeAccent + '20',
              color: orangeAccent 
            }}
          >
            Stage {baselineData.currentStage}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <div className="text-gray-400 text-xs mb-1">REwired Index</div>
            <div className="text-2xl font-bold" style={{ color: orangeAccent }}>
              {baselineData.rewiredIndex}/100
            </div>
            <div className="text-gray-400 text-xs">{baselineData.tier}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-gray-400">Regulation</div>
              <div className="text-white font-medium">{baselineData.domainScores.regulation}/5</div>
            </div>
            <div>
              <div className="text-gray-400">Awareness</div>
              <div className="text-white font-medium">{baselineData.domainScores.awareness}/5</div>
            </div>
            <div>
              <div className="text-gray-400">Outlook</div>
              <div className="text-white font-medium">{baselineData.domainScores.outlook}/5</div>
            </div>
            <div>
              <div className="text-gray-400">Attention</div>
              <div className="text-white font-medium">{baselineData.domainScores.attention}/5</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="max-w-md p-8 rounded-lg" style={{ backgroundColor: '#111111' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: '#ff9e19' }}>Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-2 text-white rounded-lg"
              style={{ backgroundColor: '#ff9e19' }}
            >
              Reload Page
            </button>
            <button
              onClick={() => window.location.href = '/assessment'}
              className="w-full px-6 py-2 text-white rounded-lg bg-gray-600"
            >
              Back to Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="p-4 shadow-lg" style={{ backgroundColor: '#111111' }}>
        <h1 className="text-2xl font-bold" style={{ color: '#ff9e19' }}>IOS System Installer</h1>
        <p className="text-sm text-gray-400">Neural & Mental Operating System</p>
        {user && <p className="text-xs text-gray-500 mt-1">{user.email}</p>}
      </div>

      <div className="p-4">
        {renderBaselineDashboard()}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                msg.role === 'user'
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
              style={msg.role === 'user' ? { backgroundColor: '#ff9e19' } : {}}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="border-t p-4" style={{ backgroundColor: '#111111', borderColor: '#1a1a1a' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
            style={{ 
              backgroundColor: '#0a0a0a',
              color: '#ffffff',
              border: '1px solid #1a1a1a'
            }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#ff9e19' }}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
