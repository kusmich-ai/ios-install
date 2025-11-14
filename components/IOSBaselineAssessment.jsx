import React, { useState, useEffect } from 'react';
import { ChevronRight, Check, Brain, Target, Sun, Focus, Wind } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const IOSBaselineAssessment = ({ user }) => {
  // State management
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [sectionScores, setSectionScores] = useState({});
  
  // BCT state
  const [bctStarted, setBctStarted] = useState(false);
  const [bctCompleted, setBctCompleted] = useState(false);
  const [bctBreathCount, setBctBreathCount] = useState(1);
  const [bctCycleCount, setBctCycleCount] = useState(0);
  const [bctElapsedTime, setBctElapsedTime] = useState(0);
  const [bctScore, setBctScore] = useState(null);
  
  // User authentication state
  const [userId, setUserId] = useState(user?.id || null);
  const [loading, setLoading] = useState(!user);

  // Get authenticated user if not passed as prop
  useEffect(() => {
    if (user) {
      setUserId(user.id);
      setLoading(false);
      return;
    }

    const getUser = async () => {
      try {
        const { data: { user: authUser }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (authUser) {
          setUserId(authUser.id);
        }
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getUser();
  }, [user]);

  // BCT Timer
  useEffect(() => {
    if (!bctStarted || bctCompleted) return;

    const interval = setInterval(() => {
      setBctElapsedTime(prev => {
        const newTime = prev + 1;
        if (newTime >= 180) { // 3 minutes = perfect score
          handleBctComplete(newTime, bctCycleCount, 'perfect');
          return 180;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [bctStarted, bctCompleted]);

  // Orange accent color constant
  const orangeAccent = '#ff9e19';

  // Assessment sections
  const sections = [
    {
      id: 'calm_core',
      name: 'Calm Core Assessment',
      domain: 'Regulation',
      icon: Brain,
      color: 'blue',
      description: 'Measures perceived stress and autonomic load',
      questions: [
        {
          id: 'stress_cope',
          text: 'In the last week, how often have you felt that you were unable to control the important things in your life?',
          scale: [
            { value: 0, label: 'Never' },
            { value: 1, label: 'Almost Never' },
            { value: 2, label: 'Sometimes' },
            { value: 3, label: 'Fairly Often' },
            { value: 4, label: 'Very Often' }
          ]
        },
        {
          id: 'confidence_handle',
          text: 'In the last week, how often have you felt confident about your ability to handle your personal problems?',
          scale: [
            { value: 4, label: 'Never' },
            { value: 3, label: 'Almost Never' },
            { value: 2, label: 'Sometimes' },
            { value: 1, label: 'Fairly Often' },
            { value: 0, label: 'Very Often' }
          ]
        },
        {
          id: 'things_going',
          text: 'In the last week, how often have you felt that things were going your way?',
          scale: [
            { value: 4, label: 'Never' },
            { value: 3, label: 'Almost Never' },
            { value: 2, label: 'Sometimes' },
            { value: 1, label: 'Fairly Often' },
            { value: 0, label: 'Very Often' }
          ]
        },
        {
          id: 'difficulties_piling',
          text: 'In the last week, how often have you felt difficulties were piling up so high that you could not overcome them?',
          scale: [
            { value: 0, label: 'Never' },
            { value: 1, label: 'Almost Never' },
            { value: 2, label: 'Sometimes' },
            { value: 3, label: 'Fairly Often' },
            { value: 4, label: 'Very Often' }
          ]
        }
      ]
    },
    {
      id: 'observer_index',
      name: 'Observer Index',
      domain: 'Awareness',
      icon: Target,
      color: 'purple',
      description: 'Measures meta-awareness and ability to observe thoughts',
      questions: [
        {
          id: 'aware_thoughts',
          text: 'I am aware of my thoughts and feelings without necessarily reacting to them.',
          scale: [
            { value: 1, label: 'Strongly Disagree' },
            { value: 2, label: 'Disagree' },
            { value: 3, label: 'Neutral' },
            { value: 4, label: 'Agree' },
            { value: 5, label: 'Strongly Agree' }
          ]
        },
        {
          id: 'observe_thoughts',
          text: 'I can observe my thoughts without getting caught up in them.',
          scale: [
            { value: 1, label: 'Strongly Disagree' },
            { value: 2, label: 'Disagree' },
            { value: 3, label: 'Neutral' },
            { value: 4, label: 'Agree' },
            { value: 5, label: 'Strongly Agree' }
          ]
        },
        {
          id: 'step_back',
          text: 'I can step back from my thoughts and see them as separate from myself.',
          scale: [
            { value: 1, label: 'Strongly Disagree' },
            { value: 2, label: 'Disagree' },
            { value: 3, label: 'Neutral' },
            { value: 4, label: 'Agree' },
            { value: 5, label: 'Strongly Agree' }
          ]
        },
        {
          id: 'notice_thinking',
          text: 'I notice when I am lost in thought.',
          scale: [
            { value: 1, label: 'Strongly Disagree' },
            { value: 2, label: 'Disagree' },
            { value: 3, label: 'Neutral' },
            { value: 4, label: 'Agree' },
            { value: 5, label: 'Strongly Agree' }
          ]
        },
        {
          id: 'center_awareness',
          text: 'I can center myself in awareness rather than in my thoughts.',
          scale: [
            { value: 1, label: 'Strongly Disagree' },
            { value: 2, label: 'Disagree' },
            { value: 3, label: 'Neutral' },
            { value: 4, label: 'Agree' },
            { value: 5, label: 'Strongly Agree' }
          ]
        },
        {
          id: 'witness_emotions',
          text: 'I can witness my emotions without being overwhelmed by them.',
          scale: [
            { value: 1, label: 'Strongly Disagree' },
            { value: 2, label: 'Disagree' },
            { value: 3, label: 'Neutral' },
            { value: 4, label: 'Agree' },
            { value: 5, label: 'Strongly Agree' }
          ]
        },
        {
          id: 'metacognitive_awareness',
          text: 'I am aware of being aware - I notice my own awareness.',
          scale: [
            { value: 1, label: 'Strongly Disagree' },
            { value: 2, label: 'Disagree' },
            { value: 3, label: 'Neutral' },
            { value: 4, label: 'Agree' },
            { value: 5, label: 'Strongly Agree' }
          ]
        }
      ]
    },
    {
      id: 'vitality_index',
      name: 'Vitality Index',
      domain: 'Outlook',
      icon: Sun,
      color: 'yellow',
      description: 'Measures positive affect and well-being',
      questions: [
        {
          id: 'cheerful_good_spirits',
          text: 'Over the last two weeks, I have felt cheerful and in good spirits.',
          scale: [
            { value: 0, label: 'At no time' },
            { value: 1, label: 'Some of the time' },
            { value: 2, label: 'Less than half the time' },
            { value: 3, label: 'More than half the time' },
            { value: 4, label: 'Most of the time' },
            { value: 5, label: 'All of the time' }
          ]
        },
        {
          id: 'calm_relaxed',
          text: 'Over the last two weeks, I have felt calm and relaxed.',
          scale: [
            { value: 0, label: 'At no time' },
            { value: 1, label: 'Some of the time' },
            { value: 2, label: 'Less than half the time' },
            { value: 3, label: 'More than half the time' },
            { value: 4, label: 'Most of the time' },
            { value: 5, label: 'All of the time' }
          ]
        },
        {
          id: 'active_vigorous',
          text: 'Over the last two weeks, I have felt active and vigorous.',
          scale: [
            { value: 0, label: 'At no time' },
            { value: 1, label: 'Some of the time' },
            { value: 2, label: 'Less than half the time' },
            { value: 3, label: 'More than half the time' },
            { value: 4, label: 'Most of the time' },
            { value: 5, label: 'All of the time' }
          ]
        },
        {
          id: 'woke_fresh',
          text: 'Over the last two weeks, I woke up feeling fresh and rested.',
          scale: [
            { value: 0, label: 'At no time' },
            { value: 1, label: 'Some of the time' },
            { value: 2, label: 'Less than half the time' },
            { value: 3, label: 'More than half the time' },
            { value: 4, label: 'Most of the time' },
            { value: 5, label: 'All of the time' }
          ]
        },
        {
          id: 'daily_life_interesting',
          text: 'Over the last two weeks, my daily life has been filled with things that interest me.',
          scale: [
            { value: 0, label: 'At no time' },
            { value: 1, label: 'Some of the time' },
            { value: 2, label: 'Less than half the time' },
            { value: 3, label: 'More than half the time' },
            { value: 4, label: 'Most of the time' },
            { value: 5, label: 'All of the time' }
          ]
        }
      ]
    },
    {
      id: 'focus_diagnostic',
      name: 'Focus Diagnostic',
      domain: 'Attention',
      icon: Focus,
      color: 'green',
      description: 'Measures attentional control and mind-wandering',
      questions: [
        {
          id: 'thoughts_wander',
          text: 'I have difficulty keeping my mind on task.',
          scale: [
            { value: 5, label: 'Almost Never' },
            { value: 4, label: 'Sometimes' },
            { value: 3, label: 'Often' },
            { value: 2, label: 'Very Often' },
            { value: 1, label: 'Almost Always' }
          ]
        },
        {
          id: 'distracted_easily',
          text: 'I find myself getting distracted easily.',
          scale: [
            { value: 5, label: 'Almost Never' },
            { value: 4, label: 'Sometimes' },
            { value: 3, label: 'Often' },
            { value: 2, label: 'Very Often' },
            { value: 1, label: 'Almost Always' }
          ]
        },
        {
          id: 'lose_train',
          text: 'I find myself losing my train of thought.',
          scale: [
            { value: 5, label: 'Almost Never' },
            { value: 4, label: 'Sometimes' },
            { value: 3, label: 'Often' },
            { value: 2, label: 'Very Often' },
            { value: 1, label: 'Almost Always' }
          ]
        },
        {
          id: 'concentrate_reading',
          text: 'I have difficulty concentrating when reading.',
          scale: [
            { value: 5, label: 'Almost Never' },
            { value: 4, label: 'Sometimes' },
            { value: 3, label: 'Often' },
            { value: 2, label: 'Very Often' },
            { value: 1, label: 'Almost Always' }
          ]
        },
        {
          id: 'daydream',
          text: 'I find myself daydreaming.',
          scale: [
            { value: 5, label: 'Almost Never' },
            { value: 4, label: 'Sometimes' },
            { value: 3, label: 'Often' },
            { value: 2, label: 'Very Often' },
            { value: 1, label: 'Almost Always' }
          ]
        }
      ]
    },
    {
      id: 'presence_test',
      name: 'Presence Test',
      domain: 'Attention',
      icon: Wind,
      color: 'indigo',
      description: 'Embodied attention measurement (Breath Counting Task)',
      isBCT: true
    }
  ];

  // Calculate section score
  const calculateSectionScore = (sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section || section.isBCT) return 0;
    
    const questionIds = section.questions.map(q => q.id);
    const sectionResponses = questionIds.map(id => responses[id] || 0);
    
    if (sectionResponses.length === 0) return 0;
    
    const sum = sectionResponses.reduce((acc, val) => acc + val, 0);
    const maxPossible = questionIds.length * 5;
    
    return (sum / maxPossible) * 5;
  };

  // Handle answer selection
  const handleAnswer = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Navigate to next question/section
  const handleNext = () => {
    const currentSectionData = sections[currentSection];
    
    // If we're on BCT section and haven't started, start it
    if (currentSectionData.isBCT && !bctStarted) {
      setBctStarted(true);
      return;
    }
    
    // Check if there are more questions in current section
    if (currentQuestion < currentSectionData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Save current section score
      const score = calculateSectionScore(currentSectionData.id);
      setSectionScores(prev => ({
        ...prev,
        [currentSectionData.id]: score
      }));
      
      // Move to next section
      if (currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1);
        setCurrentQuestion(0);
      }
    }
  };

  // BCT Handlers
  const handleBctNextBreath = () => {
    if (bctBreathCount === 9) {
      // Completed a cycle
      const newCycleCount = bctCycleCount + 1;
      setBctCycleCount(newCycleCount);
      setBctBreathCount(1);

      if (newCycleCount >= 5) {
        // Completed all 5 cycles - perfect score
        handleBctComplete(bctElapsedTime, newCycleCount, 'perfect');
      }
    } else {
      setBctBreathCount(prev => prev + 1);
    }
  };

  const handleBctLostCount = () => {
    handleBctComplete(bctElapsedTime, bctCycleCount, 'lost_count');
  };

  const handleBctComplete = async (finalTime, finalCycles, reason) => {
    setBctCompleted(true);

    // Calculate normalized score (0-5 scale)
    const normalizedScore = parseFloat(((finalTime / 180) * 5).toFixed(2));
    
    const bctResult = {
      timeToFailure: finalTime,
      cyclesCompleted: finalCycles,
      normalizedScore: normalizedScore,
      perfect: reason === 'perfect',
      reason: reason
    };

    setBctScore(bctResult);

    // Save BCT score to section scores
    setSectionScores(prev => ({
      ...prev,
      presence_test: normalizedScore
    }));

    // Wait a moment for state to update, then calculate final results
    setTimeout(() => {
      calculateAndStoreResults(normalizedScore, finalTime, finalCycles);
    }, 100);
  };

  // Calculate and store final results
  const calculateAndStoreResults = async (presenceScore, elapsedSeconds, cyclesCompleted) => {
    console.log('📊 Calculating final results...');
    
    const finalSectionScores = { ...sectionScores, presence_test: presenceScore };
    
    // Calculate individual section scores
    const calmCoreScore = finalSectionScores.calm_core || calculateSectionScore('calm_core');
    const observerScore = finalSectionScores.observer_index || calculateSectionScore('observer_index');
    const vitalityScore = finalSectionScores.vitality_index || calculateSectionScore('vitality_index');
    const focusScore = finalSectionScores.focus_diagnostic || calculateSectionScore('focus_diagnostic');
    
    // Calculate domain scores
    const domainScores = {
      regulation: calmCoreScore,
      awareness: observerScore,
      outlook: vitalityScore,
      attention: (focusScore + presenceScore) / 2 // Average of both attention assessments
    };
    
    // Calculate REwired Index (0-100 scale)
    const rewiredIndex = Math.round(
      ((domainScores.regulation + domainScores.awareness + domainScores.outlook + domainScores.attention) / 4) * 20
    );
    
    // Determine tier
    let tier;
    if (rewiredIndex >= 81) tier = 'Integrated (Embodied)';
    else if (rewiredIndex >= 61) tier = 'Optimized (Coherent)';
    else if (rewiredIndex >= 41) tier = 'Operational (Stabilizing)';
    else if (rewiredIndex >= 21) tier = 'Baseline Mode (Installing...)';
    else tier = 'System Offline (Critical)';
    
    const resultsData = {
      domainScores,
      sectionScores: finalSectionScores,
      rewiredIndex,
      tier,
      bctData: {
        elapsedSeconds,
        cyclesCompleted,
        normalizedScore: presenceScore
      },
      timestamp: new Date().toISOString(),
      userId
    };
    
    console.log('📊 Final Results:', resultsData);
    
    // Store in Supabase
    await storeBaselineData(resultsData);
    
    // Navigate to chat interface
    window.location.href = '/chat';
  };

  // Store baseline data in Supabase
  const storeBaselineData = async (resultsData) => {
    try {
      console.log('💾 Storing baseline data for user:', userId);
      
      if (!userId) {
        console.error('❌ No user ID available');
        return;
      }
      
      // Store baseline assessment with ALL fields
      const { error: assessmentError } = await supabase
        .from('baseline_assessments')
        .upsert({
          user_id: userId,
          // Individual section scores
          calm_core_score: resultsData.sectionScores.calm_core,
          observer_index_score: resultsData.sectionScores.observer_index,
          vitality_index_score: resultsData.sectionScores.vitality_index,
          focus_diagnostic_score: resultsData.sectionScores.focus_diagnostic,
          presence_test_score: resultsData.bctData.normalizedScore,
          // Domain scores
          regulation_domain: resultsData.domainScores.regulation,
          awareness_domain: resultsData.domainScores.awareness,
          outlook_domain: resultsData.domainScores.outlook,
          attention_domain: resultsData.domainScores.attention,
          // REwired Index
          rewired_index: resultsData.rewiredIndex,
          rewired_tier: resultsData.tier,
          // BCT specific data
          presence_test_elapsed_seconds: resultsData.bctData.elapsedSeconds,
          presence_test_cycles_completed: resultsData.bctData.cyclesCompleted,
          // Timestamps
          completed_at: resultsData.timestamp
        });
      
      if (assessmentError) throw assessmentError;
      
      // Initialize user progress
      const { error: progressError } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          current_stage: 1,
          stage_start_date: resultsData.timestamp,
          system_initialized: true
        });
      
      if (progressError) throw progressError;
      
      console.log('✅ Baseline data stored successfully');
      
    } catch (error) {
      console.error('❌ Error storing baseline data:', error);
    }
  };

  // Format time helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Get current section and question
  const currentSectionData = sections[currentSection];
  const currentQuestionData = currentSectionData.isBCT ? null : currentSectionData.questions[currentQuestion];
  const IconComponent = currentSectionData.icon;
  
  // Check if current question is answered
  const isAnswered = currentQuestionData ? responses[currentQuestionData.id] !== undefined : false;

  // BCT UI (when on BCT section)
  if (currentSectionData.isBCT) {
    // BCT Not Started - Show Instructions
    if (!bctStarted) {
      return (
        <div className="min-h-screen p-4 sm:p-8" style={{ backgroundColor: '#0a0a0a' }}>
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                IOS Baseline Assessment
              </h1>
              <p className="text-gray-400">
                Final Assessment: Presence Test
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Section 5 of 5</span>
                <span className="text-sm text-gray-400">100% Complete After This</span>
              </div>
              <div className="h-2 rounded-full" style={{ backgroundColor: '#1a1a1a' }}>
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ backgroundColor: orangeAccent, width: '80%' }}
                />
              </div>
            </div>

            {/* BCT Instructions */}
            <div className="p-8 rounded-lg shadow-lg mb-6" style={{ backgroundColor: '#111111', border: '1px solid #1a1a1a' }}>
              <div className="flex items-center gap-4 mb-6">
                <div 
                  className="w-16 h-16 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#1a1a1a' }}
                >
                  <Wind size={32} style={{ color: orangeAccent }} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Presence Test</h2>
                  <p className="text-gray-400">Embodied Attention Measurement</p>
                </div>
              </div>

              <div className="space-y-4 text-gray-300 mb-6">
                <p className="text-lg">
                  This final assessment measures your sustained attention through breath counting.
                </p>

                <div className="p-4 rounded-lg" style={{ backgroundColor: '#0a0a0a' }}>
                  <h3 className="font-bold text-white mb-3">How It Works:</h3>
                  <ol className="space-y-2 list-decimal list-inside">
                    <li>Count each breath from 1 to 9, then start over at 1</li>
                    <li>Click "Next Breath" after each breath</li>
                    <li>After the 9th breath, the cycle completes automatically</li>
                    <li>If you lose count, click "Lost Count" immediately</li>
                    <li>Maximum time: 3 minutes</li>
                  </ol>
                </div>

                <p className="text-sm text-gray-400">
                  <strong>Reality check:</strong> Most people lose count within 60 seconds. 
                  This is a diagnostic, not a test you pass or fail. Be honest about when you lose count.
                </p>
              </div>

              <button
                onClick={() => setBctStarted(true)}
                className="w-full px-8 py-4 rounded-lg font-medium text-white transition-all"
                style={{ backgroundColor: orangeAccent }}
              >
                Begin Presence Test
              </button>
            </div>
          </div>
        </div>
      );
    }

    // BCT In Progress
    if (!bctCompleted) {
      return (
        <div className="min-h-screen p-4 sm:p-8" style={{ backgroundColor: '#0a0a0a' }}>
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Presence Test
              </h1>
              <p className="text-gray-400">
                Count your breaths - be honest when you lose count
              </p>
            </div>

            {/* Timer Display */}
            <div className="text-center mb-8">
              <div className="text-6xl font-bold mb-4" style={{ color: orangeAccent }}>
                {bctBreathCount}
              </div>
              <div className="text-gray-400 mb-4">
                Breath {bctBreathCount} of 9 (Cycle {bctCycleCount + 1}/5)
              </div>
              <div className="text-2xl font-mono text-gray-300 mb-4">
                {formatTime(bctElapsedTime)} / 3:00
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 mb-6">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    backgroundColor: orangeAccent,
                    width: `${(bctElapsedTime / 180) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* BCT Controls */}
            <div className="max-w-md mx-auto space-y-4">
              <button
                onClick={handleBctNextBreath}
                className="w-full px-6 py-6 rounded-lg font-semibold text-white text-xl transition-all"
                style={{ backgroundColor: orangeAccent }}
              >
                Next Breath
              </button>

              <button
                onClick={handleBctLostCount}
                className="w-full px-6 py-4 rounded-lg font-semibold transition-all"
                style={{ 
                  backgroundColor: '#1a1a1a',
                  color: '#ff4444',
                  border: '2px solid #ff4444'
                }}
              >
                Lost Count
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              Click "Next Breath" after each breath. Be honest - click "Lost Count" the moment you drift.
            </p>
          </div>
        </div>
      );
    }

    // BCT Completed - Show Results
    if (bctCompleted && bctScore) {
      const percentage = (bctScore.normalizedScore / 5) * 100;
      
      return (
        <div className="min-h-screen p-4 sm:p-8" style={{ backgroundColor: '#0a0a0a' }}>
          <div className="max-w-2xl mx-auto">
            <div className="p-8 rounded-lg shadow-lg" style={{ backgroundColor: '#111111', border: '1px solid #1a1a1a' }}>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: orangeAccent }}>
                  <Check size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Assessment Complete</h2>
                <p className="text-gray-400">Calculating your REwired Index...</p>
              </div>

              <div className="p-6 rounded-lg mb-6" style={{ backgroundColor: '#0a0a0a' }}>
                <div className="text-center mb-4">
                  {bctScore.perfect && (
                    <div className="mb-4">
                      <div className="text-2xl font-bold" style={{ color: orangeAccent }}>
                        🎉 PERFECT SCORE
                      </div>
                      <p className="text-sm text-gray-400">You completed all 5 cycles!</p>
                    </div>
                  )}
                  
                  <div className="text-5xl font-bold text-white mb-2">
                    {bctScore.normalizedScore}<span className="text-2xl text-gray-500">/5</span>
                  </div>
                  <div className="text-lg font-semibold" style={{ color: orangeAccent }}>
                    Sustained Attention Score
                  </div>
                </div>

                <div className="w-full rounded-full h-4 mb-4" style={{ backgroundColor: '#1a1a1a' }}>
                  <div 
                    className="h-4 rounded-full transition-all duration-500"
                    style={{ 
                      backgroundColor: orangeAccent,
                      width: `${percentage}%`
                    }}
                  />
                </div>

                <div className="text-sm text-gray-400 space-y-2">
                  <div className="flex justify-between">
                    <span>Attention Duration:</span>
                    <span className="font-semibold text-white">{formatTime(bctScore.timeToFailure)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cycles Completed:</span>
                    <span className="font-semibold text-white">{bctScore.cyclesCompleted} / 5</span>
                  </div>
                </div>
              </div>

              <div className="text-center text-sm text-gray-400">
                Redirecting to IOS Installer...
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // Standard Assessment UI (Assessments 1-4)
  return (
    <div className="min-h-screen p-4 sm:p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            IOS Baseline Assessment
          </h1>
          <p className="text-gray-400">
            Establishing your neural and mental transformation starting point
          </p>
        </div>

        {/* Instructions Banner - Only show on first question of first section */}
        {currentSection === 0 && currentQuestion === 0 && (
          <div 
            className="mb-6 p-6 rounded-lg"
            style={{ 
              backgroundColor: '#111111', 
              border: `2px solid ${orangeAccent}` 
            }}
          >
            <h3 className="text-lg font-bold text-white mb-3">
              Welcome to Your Baseline Assessment
            </h3>
            <div className="text-gray-300 space-y-2 text-sm">
              <p>
                <strong>Why this assessment?</strong> Before installing the IOS, 
                we establish your baseline across 4 domains: 
                <span style={{ color: orangeAccent }} className="font-medium"> Regulation, Awareness, Outlook, and Attention</span>.
              </p>
              <p>
                This takes <strong>~8 minutes</strong> and measures your starting point. 
                Answer honestly (there are no right or wrong answers).
              </p>
              <p className="text-gray-400 text-xs mt-3">
                ⏱️ 5 sections • ~8 minutes total
              </p>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">
              Section {currentSection + 1} of {sections.length}
            </span>
            <span className="text-sm text-gray-400">
              {Math.round(((currentSection * 100) + ((currentQuestion + 1) / (currentSectionData.questions?.length || 1) * 100)) / sections.length)}% Complete
            </span>
          </div>
          <div className="h-2 rounded-full" style={{ backgroundColor: '#1a1a1a' }}>
            <div 
              className="h-full rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: orangeAccent,
                width: `${((currentSection * 100) + ((currentQuestion + 1) / (currentSectionData.questions?.length || 1) * 100)) / sections.length}%`
              }}
            />
          </div>
        </div>

        {/* Section Header */}
        <div className="p-6 rounded-lg mb-6" style={{ backgroundColor: '#111111', border: '1px solid #1a1a1a' }}>
          <div className="flex items-center gap-4 mb-2">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#1a1a1a' }}
            >
              <IconComponent size={24} style={{ color: orangeAccent }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{currentSectionData.name}</h2>
              <p className="text-sm text-gray-400">{currentSectionData.domain} Domain</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm">{currentSectionData.description}</p>
        </div>

        {/* Question Card */}
        {currentQuestionData && (
          <div className="p-8 rounded-lg shadow-lg mb-6" style={{ backgroundColor: '#111111', border: '1px solid #1a1a1a' }}>
            <div className="mb-6">
              <span className="text-sm font-medium text-gray-400 mb-2 block">
                Question {currentQuestion + 1} of {currentSectionData.questions.length}
              </span>
              <p className="text-xl text-white leading-relaxed">
                {currentQuestionData.text}
              </p>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestionData.scale.map((option, index) => {
                const isSelected = responses[currentQuestionData.id] === option.value;
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(currentQuestionData.id, option.value)}
                    className="w-full p-4 rounded-lg text-left transition-all duration-200 flex items-center justify-between group"
                    style={{
                      backgroundColor: isSelected ? '#1a1a1a' : '#111111',
                      border: isSelected ? `2px solid ${orangeAccent}` : '1px solid #1a1a1a'
                    }}
                  >
                    <span className={`text-lg ${isSelected ? 'text-white font-medium' : 'text-gray-300'}`}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: orangeAccent }}
                      >
                        <Check size={16} className="text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={!isAnswered}
            className="px-8 py-4 rounded-lg font-medium text-white transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: orangeAccent }}
          >
            {currentQuestion < currentSectionData.questions.length - 1 ? 'Next Question' : 
             currentSection < sections.length - 1 ? 'Next Section' : 'Continue'}
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IOSBaselineAssessment;
