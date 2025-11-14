export default function IOSBaselineAssessment({ user }) {
  // ... rest of your existing component code
}
import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Check, Brain, Target, Sun, Focus, Clock } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const IOSBaselineAssessment = () => {
  // State management
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [sectionScores, setSectionScores] = useState({});
  
  // User authentication state
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get authenticated user
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (user) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getUser();
  }, []);

  // Orange accent color constant for consistency
  const orangeAccent = '#ff9e19';

  // Assessment sections with questions
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
      icon: Clock,
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

  // Navigate to next question - FIXED VERSION
  const handleNext = () => {
    const currentSectionData = sections[currentSection];
    
    // If we're on BCT, handle completion there
    if (currentSectionData.isBCT) {
      calculateAndStoreResults();
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
      
      // Move to next section (including BCT)
      if (currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1);
        setCurrentQuestion(0);
      }
      // ✅ FIXED: Removed else block that was calling calculateAndStoreResults here
      // The BCT section will handle final submission
    }
  };

  // Calculate and store final results
  const calculateAndStoreResults = async () => {
    const finalSectionScores = { ...sectionScores };
    
    // Calculate final section score if not BCT
    const currentSectionData = sections[currentSection];
    if (!currentSectionData.isBCT) {
      const score = calculateSectionScore(currentSectionData.id);
      finalSectionScores[currentSectionData.id] = score;
    }
    
    // Calculate domain scores
    const domainScores = {
      regulation: finalSectionScores.calm_core || 0,
      awareness: finalSectionScores.observer_index || 0,
      outlook: finalSectionScores.vitality_index || 0,
      attention: ((finalSectionScores.focus_diagnostic || 0) + (finalSectionScores.presence_test || 0)) / 2
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
      sectionScores: finalSectionScores,
      domainScores,
      rewiredIndex,
      tier,
      timestamp: new Date().toISOString(),
      userId
    };
    
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
      
      // Store baseline assessment
      const { error: assessmentError } = await supabase
        .from('baseline_assessments')
        .upsert({
          user_id: userId,
          regulation_score: resultsData.domainScores.regulation,
          awareness_score: resultsData.domainScores.awareness,
          outlook_score: resultsData.domainScores.outlook,
          attention_score: resultsData.domainScores.attention,
          rewired_index: resultsData.rewiredIndex,
          tier: resultsData.tier,
          section_scores: resultsData.sectionScores,
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
              Start Here. Welcome to Your Baseline Assessment
            </h3>
            <div className="text-gray-300 space-y-2 text-sm">
              <p>
                <strong>Why this assessment?</strong> Before we can install the IOS (Integrated Operating System), 
                we need to establish your neural and mental baseline across 4 domains: 
                <span style={{ color: orangeAccent }} className="font-medium"> Regulation, Awareness, Outlook, and Attention</span>.
              </p>
              <p>
                This takes approximately <strong>8 minutes</strong> and measures your starting point. 
                Your transformation progress will be tracked against these baseline scores. Answer honestly for accurate results (there are no right or wrong answers). Scroll down to start and when finished you'll be taken to the Installer to start your program.
              </p>
              <p className="text-gray-400 text-xs mt-3">
                ⏱️ 5 sections • ~8 minutes total • 
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
        {!currentSectionData.isBCT && currentQuestionData && (
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

        {/* BCT Placeholder */}
        {currentSectionData.isBCT && (
          <div className="p-8 rounded-lg shadow-lg mb-6 text-center" style={{ backgroundColor: '#111111', border: '1px solid #1a1a1a' }}>
            <Clock size={48} style={{ color: orangeAccent }} className="mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Breath Counting Task</h3>
            <p className="text-gray-300 mb-6">
              The final assessment measures your sustained attention through a 3-minute breath counting exercise.
            </p>
            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-lg font-medium text-white transition-all"
              style={{ backgroundColor: orangeAccent }}
            >
              Begin Presence Test
            </button>
          </div>
        )}

        {/* Navigation */}
        {!currentSectionData.isBCT && (
          <div className="flex justify-end">
            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className="px-8 py-4 rounded-lg font-medium text-white transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: orangeAccent }}
            >
              {currentQuestion < currentSectionData.questions.length - 1 ? 'Next Question' : 
               currentSection < sections.length - 1 ? 'Next Section' : 'Complete Assessment'}
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IOSBaselineAssessment;
