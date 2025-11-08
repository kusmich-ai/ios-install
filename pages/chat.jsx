import { useState, useEffect, useRef } from 'react';
import { storage } from '../lib/storage';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [conversationState, setConversationState] = useState('init');
  const [userData, setUserData] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadBaselineData();
  }, []);

  const loadBaselineData = async () => {
    try {
      console.log('🔍 Checking storage...');
      const initializedData = await storage.get('ios:system_initialized');
      console.log('📦 Initialized data:', initializedData);
      
      if (!initializedData || !initializedData.value) {
        console.log('❌ No initialization data found');
        window.location.href = '/assessment';
        return;
      }
      
      const initialized = JSON.parse(initializedData.value);
      console.log('✅ Parsed initialized:', initialized);
      
      if (!initialized) {
        console.log('❌ Initialized is false');
        window.location.href = '/assessment';
        return;
      }

      console.log('📊 Loading baseline data...');
      const rewiredIndex = JSON.parse((await storage.get('ios:baseline:rewired_index')).value);
      const tier = JSON.parse((await storage.get('ios:baseline:tier')).value);
      const domainScores = JSON.parse((await storage.get('ios:baseline:domain_scores')).value);
      const currentStage = JSON.parse((await storage.get('ios:current_stage')).value);

      console.log('✅ Loaded data:', { rewiredIndex, tier, domainScores, currentStage });

      setUserData({
        rewiredIndex,
        tier,
        domainScores,
        currentStage
      });

      setIsLoading(false);
      startOnboarding(rewiredIndex, tier, domainScores);

    } catch (error) {
      console.error('❌ Error loading baseline data:', error);
      window.location.href = '/assessment';
    }
  };

  const startOnboarding = (rewiredIndex, tier, domainScores) => {
    addMessage('assistant', `Hey. I'm the IOS System Installer.

Your baseline diagnostic is complete. Let's review what we found.`);

    setTimeout(() => {
      addMessage('assistant', `**Your REwired Index: ${rewiredIndex}/100**

Status: *${tier}*

This is your starting point - not good or bad, just where you are right now.`);
    }, 1500);

    setTimeout(() => {
      addMessage('assistant', `Here's your domain breakdown:

**Regulation:** ${domainScores.regulation.toFixed(1)}/5.0 - Nervous system stability
**Awareness:** ${domainScores.awareness.toFixed(1)}/5.0 - Meta-cognitive capacity  
**Outlook:** ${domainScores.outlook.toFixed(1)}/5.0 - Emotional baseline
**Attention:** ${domainScores.attention.toFixed(1)}/5.0 - Sustained focus

These four domains form your neural and mental operating system. We're going to systematically upgrade each one.`);
    }, 3000);

    setTimeout(() => {
      addMessage('assistant', `Ready to begin Stage 1?`);
      setConversationState('awaiting_stage1_confirmation');
    }, 5000);
  };

  const addMessage = (role, content) => {
    setMessages(prev => [...prev, { role, content, timestamp: Date.now() }]);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    addMessage('user', userMessage);
    setInput('');

    processUserResponse(userMessage);
  };

  const processUserResponse = (message) => {
    const lowerMessage = message.toLowerCase();

    switch (conversationState) {
      case 'awaiting_stage1_confirmation':
        if (lowerMessage.includes('yes') || lowerMessage.includes('ready') || lowerMessage.includes('sure')) {
          introduceStage1();
        } else if (lowerMessage.includes('no') || lowerMessage.includes('not')) {
          addMessage('assistant', `No problem. Take your time. When you're ready to start, just say so.`);
        } else {
          addMessage('assistant', `I'll take that as a yes. Let's go.`);
          introduceStage1();
        }
        break;

      case 'awaiting_practice_acknowledgment':
        introduceDailyTracking();
        break;

      default:
        addMessage('assistant', `I'm listening. What's on your mind?`);
    }
  };

  const introduceStage1 = () => {
    setConversationState('stage1_intro');

    addMessage('assistant', `**Stage 1: Neural Priming**

*Stabilize the signal. Teach your nervous system calm.*

This stage installs two daily rituals that form the foundation of everything else.`);

    setTimeout(() => {
      addMessage('assistant', `**Your Daily Rituals:**

**1. 🫁 Resonance Breathing (HRVB)** - 5 mins
   *When:* Morning, immediately upon waking
   *What:* 4-second inhale, 6-second exhale rhythm (for 5 mins). Follow the guided video.
   *Why:* Stimulates vagus nerve, increases heart rate variability, builds regulatory capacity

**2. 👁 Awareness Rep** - 3 minutes
   *When:* Morning after Resonance Breathing (+ optional midday/evening if you want to train it further or find calm)
   *What:* Guided decentering practice where you rest in awareness, not reactivity
   *Why:* Strengthens meta-awareness circuitry, teaches your mind to observe rather than identify with thought.

That's it. Two rituals. Every morning.`);
    }, 2000);

    setTimeout(() => {
      addMessage('assistant', `**Here's how this works:**

You'll do these rituals daily for at least 14 days.

I'll track your progress through regular check-ins.

When we see stability with Regulation and Awareness, you'll unlock Stage 2.

Consistency is key.

Questions?`);
      setConversationState('awaiting_practice_acknowledgment');
    }, 4000);
  };

  const introduceDailyTracking = () => {
    setConversationState('tracking_explained');

    addMessage('assistant', `**Tracking & Progress:**

Every morning, you'll check in with me:
- Confirm you completed each practice
- Rate your calm level (0-5)

Every Sunday, we'll do a weekly delta check-in:
- 4 quick questions across all domains
- Track improvement vs baseline

After 14 days, if you've hit the criteria, Stage 2 unlocks.`);

    setTimeout(() => {
      addMessage('assistant', `**Important notes:**

**On "rituals" vs "practices":** I call these rituals, not practices. Practices are optional. Rituals are non-negotiable. This is your operating system - treat it like you'd treat brushing your teeth.

**On motivation:** I'm not a cheerleader. I won't celebrate participation trophies. But when you hit real milestones, I'll acknowledge them.

**On resistance:** You'll resist. Your nervous system prefers familiar patterns, even dysfunctional ones. When resistance shows up, we'll work with it.

Ready to start tomorrow morning?`);
      setConversationState('ready_to_begin');
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Loading your data...</div>
          <div className="text-gray-400">Initializing IOS System Installer</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">IOS System Installer</h1>
            <p className="text-sm text-gray-400">
              Stage {userData?.currentStage || 1} • REwired Index: {userData?.rewiredIndex || 0}
            </p>
          </div>
          <div className="text-sm text-gray-400">
            Status: {userData?.tier || 'Loading...'}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl px-4 py-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your response..."
            className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={handleSend}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
