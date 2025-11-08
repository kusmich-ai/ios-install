import React, { useState, useEffect } from 'react';
import { storage } from '../lib/storage'; // Named export, not default

export default function IOSBaselineAssessment() {
  const [stage, setStage] = useState('welcome');
  const [currentSection, setCurrentSection] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scores, setScores] = useState(null);

  // Load or initialize user on mount
  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      // Get user ID from localStorage (getUserId handles creation)
      let storedUserId = localStorage.getItem('ios_user_id');
      if (!storedUserId) {
        storedUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('ios_user_id', storedUserId);
      }
      setUserId(storedUserId);
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing user:', error);
      const fallbackId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      setUserId(fallbackId);
      setIsLoading(false);
    }
  };

  const saveBaselineData = async (data) => {
    if (!userId) return;
    
    try {
      // Save to Supabase via your storage wrapper
      // Your storage.js handles both Supabase AND localStorage automatically
      await storage.set(`baseline_${userId}`, JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
        userId
      }));
      
      console.log('✅ Baseline data saved (Supabase primary, localStorage fallback)');
    } catch (error) {
      console.error('❌ Error saving baseline data:', error);
    }
  };

  // Assessment sections data
  const assessmentSections = {
    calmCore: {
      title: "Calm Core Assessment",
      subtitle: "Regulation Domain (~1 min)",
      description: "Measures perceived stress and autonomic load",
      questions: [
        {
          id: "cc1",
          text: "In the last month, how often have you felt that you were unable to control the important things in your life?",
          scale: { min: 0, max: 4, labels: ["Never", "Almost never", "Sometimes", "Fairly often", "Very often"] }
        },
        {
          id: "cc2",
          text: "In the last month, how often have you felt confident about your ability to handle your personal problems?",
          scale: { min: 0, max: 4, labels: ["Never", "Almost never", "Sometimes", "Fairly often", "Very often"], reverse: true }
        },
        {
          id: "cc3",
          text: "In the last month, how often have you felt that things were going your way?",
          scale: { min: 0, max: 4, labels: ["Never", "Almost never", "Sometimes", "Fairly often", "Very often"], reverse: true }
        },
        {
          id: "cc4",
          text: "In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?",
          scale: { min: 0, max: 4, labels: ["Never", "Almost never", "Sometimes", "Fairly often", "Very often"] }
        }
      ]
    },
    observerIndex: {
      title: "Observer Index",
      subtitle: "Awareness Domain (~2 min)",
      description: "Measures meta-awareness and ability to observe thoughts",
      questions: [
        {
          id: "oi1",
          text: "I can separate myself from my thoughts and feelings",
          scale: { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] }
        },
        {
          id: "oi2",
          text: "I can step back and be aware of my thoughts without being caught up in them",
          scale: { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] }
        },
        {
          id: "oi3",
          text: "I can observe my thoughts and feelings without reacting to them",
          scale: { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] }
        },
        {
          id: "oi4",
          text: "I am able to view my thoughts and feelings from a distance",
          scale: { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] }
        },
        {
          id: "oi5",
          text: "I notice when my attention drifts into thought",
          scale: { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] }
        },
        {
          id: "oi6",
          text: "I can watch my thoughts come and go without getting lost in them",
          scale: { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] }
        },
        {
          id: "oi7",
          text: "I experience myself as separate from my changing thoughts",
          scale: { min: 1, max: 5, labels: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"] }
        }
      ]
    },
    vitalityIndex: {
      title: "Vitality Index",
      subtitle: "Outlook Domain (~1 min)",
      description: "Gold-standard positive-affect scale",
      questions: [
        {
          id: "vi1",
          text: "Over the last 2 weeks, I have felt cheerful and in good spirits",
          scale: { min: 0, max: 5, labels: ["At no time", "Some of the time", "Less than half the time", "More than half the time", "Most of the time", "All of the time"] }
        },
        {
          id: "vi2",
          text: "Over the last 2 weeks, I have felt calm and relaxed",
          scale: { min: 0, max: 5, labels: ["At no time", "Some of the time", "Less than half the time", "More than half the time", "Most of the time", "All of the time"] }
        },
        {
          id: "vi3",
          text: "Over the last 2 weeks, I have felt active and vigorous",
          scale: { min: 0, max: 5, labels: ["At no time", "Some of the time", "Less than half the time", "More than half the time", "Most of the time", "All of the time"] }
        },
        {
          id: "vi4",
          text: "Over the last 2 weeks, I woke up feeling fresh and rested",
          scale: { min: 0, max: 5, labels: ["At no time", "Some of the time", "Less than half the time", "More than half the time", "Most of the time", "All of the time"] }
        },
        {
          id: "vi5",
          text: "Over the last 2 weeks, my daily life has been filled with things that interest me",
          scale: { min: 0, max: 5, labels: ["At no time", "Some of the time", "Less than half the time", "More than half the time", "Most of the time", "All of the time"] }
        }
      ]
    },
    focusDiagnostic: {
      title: "Focus Diagnostic",
      subtitle: "Attention Domain - Part 1 (~1 min)",
      description: "Fast, reliable proxy for attentional control",
      questions: [
        {
          id: "fd1",
          text: "I have difficulty concentrating on what people say to me, even when they are speaking to me directly",
          scale: { min: 1, max: 6, labels: ["Almost never", "Very infrequently", "Somewhat infrequently", "Somewhat frequently", "Very frequently", "Almost always"] }
        },
        {
          id: "fd2",
          text: "I find it difficult to stay focused on what's happening in the present",
          scale: { min: 1, max: 6, labels: ["Almost never", "Very infrequently", "Somewhat infrequently", "Somewhat frequently", "Very frequently", "Almost always"] }
        },
        {
          id: "fd3",
          text: "It seems I am running on automatic without much awareness of what I'm doing",
          scale: { min: 1, max: 6, labels: ["Almost never", "Very infrequently", "Somewhat infrequently", "Somewhat frequently", "Very frequently", "Almost always"] }
        },
        {
          id: "fd4",
          text: "I find myself doing things without paying attention",
          scale: { min: 1, max: 6, labels: ["Almost never", "Very infrequently", "Somewhat infrequently", "Somewhat frequently", "Very frequently", "Almost always"] }
        },
        {
          id: "fd5",
          text: "I find myself preoccupied with the future or the past",
          scale: { min: 1, max: 6, labels: ["Almost never", "Very infrequently", "Somewhat infrequently", "Somewhat frequently", "Very frequently", "Almost always"] }
        }
      ]
    }
  };

  const sectionOrder = ['calmCore', 'observerIndex', 'vitalityIndex', 'focusDiagnostic'];

  const handleResponse = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    const section = assessmentSections[currentSection];
    
    if (currentQuestionIndex < section.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const currentSectionIndex = sectionOrder.indexOf(currentSection);
      
      if (currentSectionIndex < sectionOrder.length - 1) {
        setCurrentSection(sectionOrder[currentSectionIndex + 1]);
        setCurrentQuestionIndex(0);
      } else {
        setStage('breathCountingInstructions');
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      const currentSectionIndex = sectionOrder.indexOf(currentSection);
      if (currentSectionIndex > 0) {
        const prevSection = sectionOrder[currentSectionIndex - 1];
        setCurrentSection(prevSection);
        setCurrentQuestionIndex(assessmentSections[prevSection].questions.length - 1);
      }
    }
  };

  const calculateScores = (breathCountingScore) => {
    // Calculate Calm Core (PSS-4) - lower is better, reverse scoring
    const calmCoreRaw = ['cc1', 'cc2', 'cc3', 'cc4'].reduce((sum, id) => {
      const q = assessmentSections.calmCore.questions.find(q => q.id === id);
      const value = responses[id] || 0;
      return sum + (q.scale.reverse ? (q.scale.max - value) : value);
    }, 0);
    const calmCore = ((16 - calmCoreRaw) / 16) * 5;

    // Calculate Observer Index (EQ-D) - average of 7 items
    const observerRaw = ['oi1', 'oi2', 'oi3', 'oi4', 'oi5', 'oi6', 'oi7'].reduce((sum, id) => {
      return sum + (responses[id] || 1);
    }, 0);
    const observer = (observerRaw / 7);
    const observerNormalized = ((observer - 1) / 4) * 5;

    // Calculate Vitality Index (WHO-5)
    const vitalityRaw = ['vi1', 'vi2', 'vi3', 'vi4', 'vi5'].reduce((sum, id) => {
      return sum + (responses[id] || 0);
    }, 0);
    const vitality = (vitalityRaw / 25) * 5;

    // Calculate Focus Diagnostic (MWQ) - reverse scored
    const focusRaw = ['fd1', 'fd2', 'fd3', 'fd4', 'fd5'].reduce((sum, id) => {
      return sum + (responses[id] || 1);
    }, 0);
    const focus = ((30 - focusRaw) / 25) * 5;

    // Attention domain = average of Focus Diagnostic and Breath Counting
    const attention = (focus + breathCountingScore) / 2;

    // Calculate REwired Index (0-100)
    const rewiredIndex = ((calmCore + observerNormalized + vitality + attention) / 4) * 20;

    // Determine tier
    let tier = '';
    if (rewiredIndex >= 81) tier = 'Integrated (Embodied)';
    else if (rewiredIndex >= 61) tier = 'Optimized (Coherent)';
    else if (rewiredIndex >= 41) tier = 'Operational (Stabilizing)';
    else if (rewiredIndex >= 21) tier = 'Baseline Mode (Installing...)';
    else tier = 'System Offline (Critical)';

    return {
      regulation: calmCore,
      awareness: observerNormalized,
      outlook: vitality,
      attention: attention,
      focusDiagnostic: focus,
      presenceTest: breathCountingScore,
      rewiredIndex: rewiredIndex,
      tier: tier
    };
  };

  const handleBreathCountingComplete = async (breathScore) => {
    const finalScores = calculateScores(breathScore);
    setScores(finalScores);
    await saveBaselineData({
      responses,
      scores: finalScores
    });
    setStage('results');
  };

  const startAssessment = () => {
    setStage('assessment');
    setCurrentSection(sectionOrder[0]);
    setCurrentQuestionIndex(0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing assessment...</p>
        </div>
      </div>
    );
  }

  if (stage === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8 flex items-center justify-center">
        <div className="max-w-2xl bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">IOS Baseline Assessment</h1>
          <p className="text-gray-600 mb-6">
            Before we start, we need to establish your baseline. This takes approximately 8 minutes and measures 4 domains:
          </p>
          <div className="space-y-3 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-indigo-600 font-semibold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Calm Core Assessment</h3>
                <p className="text-sm text-gray-600">Regulation domain (~1 min)</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-indigo-600 font-semibold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Observer Index</h3>
                <p className="text-sm text-gray-600">Awareness domain (~2 min)</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-indigo-600 font-semibold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Vitality Index</h3>
                <p className="text-sm text-gray-600">Outlook domain (~1 min)</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-indigo-600 font-semibold">4</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Focus Diagnostic</h3>
                <p className="text-sm text-gray-600">Attention domain (~1 min)</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-indigo-600 font-semibold">5</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Presence Test</h3>
                <p className="text-sm text-gray-600">Attention domain (~3 min)</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-blue-900">
              <strong>Important:</strong> Answer honestly - there are no wrong answers. This establishes your starting point for tracking transformation.
            </p>
          </div>
          <button
            onClick={startAssessment}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Begin Baseline Assessment
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'assessment') {
    const section = assessmentSections[currentSection];
    const question = section.questions[currentQuestionIndex];
    const currentResponse = responses[question.id];
    const totalQuestions = sectionOrder.reduce((sum, key) => sum + assessmentSections[key].questions.length, 0);
    const completedQuestions = sectionOrder.slice(0, sectionOrder.indexOf(currentSection)).reduce((sum, key) => sum + assessmentSections[key].questions.length, 0) + currentQuestionIndex;
    const progress = ((completedQuestions / totalQuestions) * 100).toFixed(0);

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{section.title}</span>
              <span>{progress}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <p className="text-sm text-indigo-600 font-semibold mb-2">{section.subtitle}</p>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{question.text}</h2>
            </div>

            <div className="space-y-3">
              {question.scale.labels.map((label, index) => {
                const value = question.scale.min + index;
                const isSelected = currentResponse === value;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleResponse(question.id, value)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50' 
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{label}</span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0 && currentSection === sectionOrder[0]}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentResponse === undefined}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {currentQuestionIndex === section.questions.length - 1 && currentSection === sectionOrder[sectionOrder.length - 1]
                  ? 'Continue to Presence Test'
                  : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'breathCountingInstructions') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8 flex items-center justify-center">
        <div className="max-w-2xl bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Presence Test</h1>
          <p className="text-gray-600 mb-6">
            Final assessment: A 3-minute breath counting task that measures sustained attention and meta-awareness.
          </p>
          
          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h2 className="font-semibold text-lg mb-3">Instructions:</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Count breaths <strong>1 through 8</strong> silently in your mind</li>
              <li>Press <strong>"Next Breath"</strong> for each breath (1-8)</li>
              <li>After breath 8, press <strong>"Complete Cycle"</strong> to mark breath 9</li>
              <li>Immediately start a new cycle (count restarts at 1)</li>
              <li>If you lose count, press <strong>"Lost Count"</strong></li>
            </ol>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-yellow-900">
              <strong>Note:</strong> One mistake ends the test. Your score is based on how long you maintain accurate counting.
            </p>
          </div>

          <button
            onClick={() => setStage('breathCounting')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Start Presence Test
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'breathCounting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Breath Counting Task</h2>
          <p className="mb-4 text-gray-600">Import your BreathCountingTask component here</p>
          <button
            onClick={() => handleBreathCountingComplete(3.5)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Complete Test (Mock - 3.5 score)
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'results' && scores) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Baseline Assessment Complete!</h1>
            <p className="text-gray-600 mb-6">Your transformation starting point has been established.</p>

            <div className="bg-indigo-50 p-8 rounded-lg text-center mb-8">
              <div className="text-7xl font-bold text-indigo-600 mb-3">
                {scores.rewiredIndex.toFixed(1)}
              </div>
              <div className="text-xl text-gray-700 font-semibold mb-2">REwired Index</div>
              <div className="text-lg text-indigo-600 font-medium">{scores.tier}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Regulation</div>
                <div className="text-3xl font-bold text-blue-600">{scores.regulation.toFixed(2)}/5.0</div>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Awareness</div>
                <div className="text-3xl font-bold text-purple-600">{scores.awareness.toFixed(2)}/5.0</div>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Outlook</div>
                <div className="text-3xl font-bold text-green-600">{scores.outlook.toFixed(2)}/5.0</div>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Attention</div>
                <div className="text-3xl font-bold text-orange-600">{scores.attention.toFixed(2)}/5.0</div>
                <div className="text-xs text-gray-500 mt-1">
                  Focus: {scores.focusDiagnostic.toFixed(2)} | Presence: {scores.presenceTest.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-medium">
                ✅ Baseline data saved to Supabase
              </p>
              <p className="text-sm text-green-700 mt-1">
                User ID: {userId}
              </p>
              <p className="text-xs text-gray-600 mt-2">
                (Falls back to localStorage if Supabase unavailable)
              </p>
            </div>

            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Continue to IOS Installation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
