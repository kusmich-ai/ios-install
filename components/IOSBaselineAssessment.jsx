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
  const [bctButtonPressed, setBctButtonPressed] = useState(null); // For visual feedback
  
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
          text: 'In the last week, how often have you felt unable to handle your personal problems?',
          scale: [
            { value: 0, label: 'Never' },
            { value: 1, label: 'Almost Never' },
            { value: 2, label: 'Sometimes' },
            { value: 3, label: 'Fairly Often' },
            { value: 4, label: 'Very Often' }
          ]
        },
        {
          id: 'things_going',
          text: 'In the last week, how often have you felt that things were NOT going your way?',
          scale: [
            { value: 0, label: 'Never' },
            { value: 1, label: 'Almost Never' },
            { value: 2, label: 'Sometimes' },
            { value: 3, label: 'Fairly Often' },
            { value: 4, label: 'Very Often' }
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

  // Calculate section score - CORRECTED VERSION
  const calculateSectionScore = (sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section || section.isBCT) return 0;
    
    const questionIds = section.questions.map(q => q.id);
    const sectionResponses = questionIds.map(id => responses[id] || 0);
    
    if (sectionResponses.length === 0) return 0;
    
    const sum = sectionResponses.reduce((acc, val) => acc + val, 0);
    
    // Special handling for Calm Core Assessment (Regulation domain)
    // All questions now measure STRESS (0-4 scale, higher = more stress)
    // We need to invert for REGULATION score (higher = better regulation)
    if (sectionId === 'calm_core') {
      const maxStress = questionIds.length * 4; // 4 questions × 4 max = 16
      const stressPercentage = sum / maxStress; // 0-1 scale (0 = no stress, 1 = max stress)
      const regulationScore = (1 - stressPercentage) * 5; // Inverted to 0-5 (0 = poor regulation, 5 = excellent)
      return parseFloat(regulationScore.toFixed(2));
    }
    
    // For all other sections, use standard calculation
    const maxPossible = questionIds.length * 5;
    return parseFloat(((sum / maxPossible) * 5).toFixed(2));
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
  const showButtonFeedback = (buttonType) => {
    setBctButtonPressed(buttonType);
    setTimeout(() => setBctButtonPressed(null), 200);
  };

  const handleBctNextBreath = () => {
    showButtonFeedback('next');
    if (bctBreathCount < 9) {
      setBctBreathCount(prev => prev + 1);
    }
    // After 9th breath, user must click "Complete Cycle"
  };

  const handleBctCompleteCycle = () => {
    showButtonFeedback('complete');
    if (bctBreathCount === 9) {
      // Valid cycle completion
      const newCycleCount = bctCycleCount + 1;
      setBctCycleCount(newCycleCount);
      setBctBreathCount(1);

      if (newCycleCount >= 5) {
        // Completed all 5 cycles - perfect score
        handleBctComplete(bctElapsedTime, newCycleCount, 'perfect');
      }
    } else {
      // Clicked complete cycle at wrong count - test ends (miscount)
      handleBctComplete(bctElapsedTime, bctCycleCount, 'miscount_wrong_count');
    }
  };

  const handleBctLostCount = () => {
    showButtonFeedback('lost');
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

    // Calculate and store results immediately (no redirect, user clicks button)
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
    
    // User will manually click "Start Your IOS Install Now" button to go to /chat
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
                <p className="text-lg font-semibold">
                  This final assessment measures your sustained attention through breath counting.
                </p>

                <div className="p-4 rounded-lg" style={{ backgroundColor: '#0a0a0a' }}>
                  <h3 className="font-bold text-white mb-3">Instructions - Read Carefully:</h3>
                  <ol className="space-y-3 list-decimal list-inside">
                    <li className="leading-relaxed">
                      <strong>Breathe naturally:</strong> Take long, slow, deep breaths throughout
                    </li>
                    <li className="leading-relaxed">
                      <strong>Count silently in your mind:</strong> Count each breath from 1 to 9
                    </li>
                    <li className="leading-relaxed">
                      <strong>For breaths 1-8:</strong> After each breath, click the "Next Breath" button
                    </li>
                    <li className="leading-relaxed">
                      <strong>After breath 9:</strong> Click "Complete Cycle" - this marks the end of the cycle and restarts your count at 1
                    </li>
                    <li className="leading-relaxed">
                      <strong>Repeat:</strong> Continue cycles until you complete 5 full cycles or reach 3 minutes
                    </li>
                    <li className="leading-relaxed">
                      <strong>Lost count?</strong> Click "Lost Count" immediately - the test ends when you lose track
                    </li>
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
              <div className="text-gray-400 mb-6">
                Cycle {bctCycleCount + 1} of 5
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
                className="w-full px-6 py-6 rounded-lg font-semibold text-white text-xl transition-all transform"
                style={{ 
                  backgroundColor: orangeAccent,
                  transform: bctButtonPressed === 'next' ? 'scale(0.95)' : 'scale(1)',
                  opacity: bctButtonPressed === 'next' ? 0.8 : 1
                }}
              >
                Next Breath
              </button>

              <button
                onClick={handleBctCompleteCycle}
                className="w-full px-6 py-6 rounded-lg font-semibold text-white text-xl transition-all transform"
                style={{ 
                  backgroundColor: '#10b981',
                  border: '2px solid #10b981',
                  transform: bctButtonPressed === 'complete' ? 'scale(0.95)' : 'scale(1)',
                  opacity: bctButtonPressed === 'complete' ? 0.8 : 1
                }}
              >
                Complete Cycle
              </button>

              <button
                onClick={handleBctLostCount}
                className="w-full px-6 py-4 rounded-lg font-semibold transition-all transform"
                style={{ 
                  backgroundColor: '#1a1a1a',
                  color: '#ff4444',
                  border: '2px solid #ff4444',
                  transform: bctButtonPressed === 'lost' ? 'scale(0.95)' : 'scale(1)',
                  opacity: bctButtonPressed === 'lost' ? 0.8 : 1
                }}
              >
                Lost Count
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              Count silently in your mind. Click "Next Breath" for breaths 1-8, then "Complete Cycle" after breath 9.
            </p>
          </div>
        </div>
      );
    }

    // BCT Completed - Show Full Assessment Results
    if (bctCompleted && bctScore) {
      // Calculate all domain scores for display
      const calmCoreScore = sectionScores.calm_core || calculateSectionScore('calm_core');
      const observerScore = sectionScores.observer_index || calculateSectionScore('observer_index');
      const vitalityScore = sectionScores.vitality_index || calculateSectionScore('vitality_index');
      const focusScore = sectionScores.focus_diagnostic || calculateSectionScore('focus_diagnostic');
      const presenceScore = bctScore.normalizedScore;
      
      const domainScores = {
        regulation: calmCoreScore,
        awareness: observerScore,
        outlook: vitalityScore,
        attention: (focusScore + presenceScore) / 2
      };
      
      const rewiredIndex = Math.round(
        ((domainScores.regulation + domainScores.awareness + domainScores.outlook + domainScores.attention) / 4) * 20
      );
      
      let tier;
      if (rewiredIndex >= 81) tier = 'Integrated (Embodied)';
      else if (rewiredIndex >= 61) tier = 'Optimized (Coherent)';
      else if (rewiredIndex >= 41) tier = 'Operational (Stabilizing)';
      else if (rewiredIndex >= 21) tier = 'Baseline Mode (Installing...)';
      else tier = 'System Offline (Critical)';
      
      return (
        <div className="min-h-screen p-4 sm:p-8" style={{ backgroundColor: '#0a0a0a' }}>
          <div className="max-w-4xl mx-auto">
            <div className="p-8 rounded-lg shadow-lg mb-6" style={{ backgroundColor: '#111111', border: '1px solid #1a1a1a' }}>
              
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: orangeAccent }}>
                  <Check size={40} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Baseline Assessment Complete</h1>
                <p className="text-gray-400">Your neural and mental operating system starting point</p>
              </div>

              {/* REwired Index - Hero Score */}
              <div className="p-8 rounded-lg mb-8 text-center" style={{ backgroundColor: '#0a0a0a', border: `2px solid ${orangeAccent}` }}>
                <div className="text-sm text-gray-400 mb-2">YOUR REWIRED INDEX</div>
                <div className="text-7xl font-bold mb-3" style={{ color: orangeAccent }}>
                  {rewiredIndex}
                </div>
                <div className="text-2xl font-semibold text-white mb-2">{tier}</div>
                <div className="w-full rounded-full h-3 mt-4" style={{ backgroundColor: '#1a1a1a' }}>
                  <div 
                    className="h-3 rounded-full transition-all duration-500"
                    style={{ 
                      backgroundColor: orangeAccent,
                      width: `${rewiredIndex}%`
                    }}
                  />
                </div>
              </div>

              {/* Commentary */}
              <div className="mb-8 p-6 rounded-lg" style={{ backgroundColor: '#0a0a0a' }}>
                <h2 className="text-xl font-bold text-white mb-4">What This Means</h2>
                <div className="text-gray-300 space-y-3 text-sm leading-relaxed">
                  <p>
                    Your REwired Index of <strong style={{ color: orangeAccent }}>{rewiredIndex}</strong> represents 
                    your current baseline across four critical domains: regulation, awareness, outlook, and attention.
                  </p>
                  <p>
                    {rewiredIndex < 41 && "Your system is currently operating below optimal capacity. The IOS will systematically upgrade each domain through progressive stage unlocks."}
                    {rewiredIndex >= 41 && rewiredIndex < 61 && "You have a functional baseline with room for significant optimization. The IOS will build on your existing capacity."}
                    {rewiredIndex >= 61 && rewiredIndex < 81 && "You're operating at a coherent level with established self-regulation. The IOS will refine and expand your capabilities."}
                    {rewiredIndex >= 81 && "You have strong baseline capacity. The IOS will focus on advanced integration and performance expansion."}
                  </p>
                  <p>
                    This score isn't a judgment—it's a starting coordinate. The system tracks your progress 
                    from this point as you install each stage of the IOS.
                  </p>
                </div>
              </div>

              {/* Domain Breakdown */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Domain Scores</h2>
                <div className="space-y-4">
                  
                  {/* Regulation */}
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#0a0a0a' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Brain size={24} className="text-blue-500" />
                        <div>
                          <div className="font-semibold text-white">Regulation</div>
                          <div className="text-xs text-gray-400">Stress management & autonomic control</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-white">{domainScores.regulation.toFixed(1)}<span className="text-sm text-gray-500">/5</span></div>
                    </div>
                    <div className="w-full rounded-full h-2" style={{ backgroundColor: '#1a1a1a' }}>
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          backgroundColor: '#3b82f6',
                          width: `${(domainScores.regulation / 5) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Awareness */}
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#0a0a0a' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Target size={24} className="text-purple-500" />
                        <div>
                          <div className="font-semibold text-white">Awareness</div>
                          <div className="text-xs text-gray-400">Meta-awareness & decentering capacity</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-white">{domainScores.awareness.toFixed(1)}<span className="text-sm text-gray-500">/5</span></div>
                    </div>
                    <div className="w-full rounded-full h-2" style={{ backgroundColor: '#1a1a1a' }}>
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          backgroundColor: '#a855f7',
                          width: `${(domainScores.awareness / 5) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Outlook */}
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#0a0a0a' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Sun size={24} className="text-yellow-500" />
                        <div>
                          <div className="font-semibold text-white">Outlook</div>
                          <div className="text-xs text-gray-400">Positive affect & vitality</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-white">{domainScores.outlook.toFixed(1)}<span className="text-sm text-gray-500">/5</span></div>
                    </div>
                    <div className="w-full rounded-full h-2" style={{ backgroundColor: '#1a1a1a' }}>
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          backgroundColor: '#eab308',
                          width: `${(domainScores.outlook / 5) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Attention */}
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#0a0a0a' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Focus size={24} className="text-green-500" />
                        <div>
                          <div className="font-semibold text-white">Attention</div>
                          <div className="text-xs text-gray-400">Focus quality & sustained attention</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-white">{domainScores.attention.toFixed(1)}<span className="text-sm text-gray-500">/5</span></div>
                    </div>
                    <div className="w-full rounded-full h-2" style={{ backgroundColor: '#1a1a1a' }}>
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          backgroundColor: '#22c55e',
                          width: `${(domainScores.attention / 5) * 100}%`
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Focus Diagnostic: {focusScore.toFixed(1)} • Presence Test: {presenceScore.toFixed(1)}
                    </div>
                  </div>

                </div>
              </div>

              {/* Presence Test Highlight */}
              {bctScore.perfect && (
                <div className="p-6 rounded-lg mb-8" style={{ backgroundColor: '#0a0a0a', border: '2px solid #10b981' }}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500 mb-2">🎉 Perfect Attention Score</div>
                    <p className="text-gray-300 text-sm">
                      You completed all 5 breath counting cycles without losing count—exceptional sustained attention capacity.
                    </p>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="p-6 rounded-lg mb-6" style={{ backgroundColor: '#0a0a0a' }}>
                <h2 className="text-xl font-bold text-white mb-3">What Happens Next</h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                  The IOS Installer will guide you through 7 progressive stages, starting with Stage 1: Neural Priming. 
                  Each stage unlocks when your nervous system demonstrates readiness through adherence and delta improvements. 
                  You'll track progress daily, with weekly check-ins measuring transformation from this baseline.
                </p>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => window.location.href = '/chat'}
                className="w-full px-8 py-6 rounded-lg font-bold text-white text-xl transition-all transform hover:scale-105"
                style={{ backgroundColor: orangeAccent }}
              >
                Start Your IOS Install Now
              </button>

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
