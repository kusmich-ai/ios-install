'use client';

import { useState, useRef, useEffect } from 'react';
import { useIsMobile } from '@/app/hooks/useIsMobile';
import { useUserProgress } from '@/app/hooks/useUserProgress';
import ToolsSidebar from '@/app/components/ToolsSidebar';
import FloatingActionButton from '@/app/components/FloatingActionButton';

export default function ChatInterface({ user, baselineData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const hasInitialized = useRef(false);

  // New hooks for responsive design and user progress
  const isMobile = useIsMobile();
  const { progress, loading: progressLoading, error: progressError, refetchProgress } = useUserProgress();

  // Debug logging
  useEffect(() => {
    console.log('ChatInterface mounted');
    console.log('User:', user);
    console.log('Baseline Data:', baselineData);
    console.log('Is Mobile:', isMobile);
    console.log('User Progress:', progress);
  }, [user, baselineData, isMobile, progress]);

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

  // Handler for when user clicks a practice in sidebar/FAB
  const handlePracticeClick = async (practiceId: string) => {
    console.log('Practice clicked:', practiceId);
    
    // Send message to AI to start practice
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

  // Handler for when user clicks an on-demand tool
  const handleToolClick = async (toolId: string) => {
    console.log('Tool clicked:', toolId);
    
    // Send message to AI to start tool/protocol
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

  const getTierColor = (tier) => {
    const tierLower = tier?.toLowerCase() || '';
    if (tierLower.includes('integrated') || tierLower.includes('embodied')) return 'text-purple-400';
    if (tierLower.includes('optimized') || tierLower.includes('coherent')) return 'text-green-400';
    if (tierLower.includes('operational') || tierLower.includes('stabilizing')) return 'text-blue-400';
    if (tierLower.includes('baseline') || tierLower.includes('installing')) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (error || progressError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0a]">
        <div className="max-w-md p-8 rounded-lg bg-[#111111] border border-gray-800">
          <h2 className="text-xl font-bold mb-4 text-[#ff9e19]">Error</h2>
          <p className="text-gray-400 mb-4">{error || progressError}</p>
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

  // Get user's first name
  const getUserName = () => {
    if (user?.user_metadata?.first_name) {
      return user.user_metadata.first_name;
    }
    if (user?.raw_user_meta_data?.first_name) {
      return user.raw_user_meta_data.first_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  // Calculate stage progress
  const stageProgress = ((baselineData.currentStage - 1) / 6) * 100;

  return (
    <div className="flex h-screen bg-[#0a0a0a]">
      {/* Desktop Sidebar Dashboard - Hidden on mobile */}
      <aside className="hidden md:block w-80 border-r border-gray-800 bg-[#111111] overflow-y-auto flex-shrink-0">
        <div className="p-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white mb-1">IOS System Installer</h1>
            <p className="text-xs text-gray-400 mb-2">Neural & Mental Operating System</p>
            <p className="text-sm font-medium text-white">{getUserName()}</p>
          </div>

          {/* Stage Progress */}
          <div className="mb-6 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#ff9e19] font-semibold">
                Stage {baselineData.currentStage} of 7
              </span>
            </div>
            <div className="w-full rounded-full h-1.5" style={{ backgroundColor: '#1a1a1a' }}>
              <div 
                className="h-1.5 rounded-full transition-all"
                style={{ 
                  backgroundColor: '#ff9e19',
                  width: `${stageProgress}%`
                }}
              />
            </div>
          </div>

          {/* REwired Index */}
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

          {/* Domain Scores */}
          <div className="space-y-3">
            {/* Regulation */}
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#0a0a0a' }}>
              <div className="flex items-c
