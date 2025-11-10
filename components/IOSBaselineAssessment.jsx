import React, { useState, useEffect } from 'react';
import { Play, Check, TrendingUp, User, ChevronRight, Brain, Eye, Heart, Target } from 'lucide-react';

export default function Assessment() {
  // Define orange accent color
  const orange = '#ff9e19';
  const orangeHover = '#e68a0f';
  
  const [stage, setStage] = useState('welcome'); // welcome, assessment, results
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState({});
  const [sectionScores, setSectionScores] = useState({});

  // Assessment sections with questions
  const assessments = [
    {
      id: 'calm_core',
      name: 'Calm Core Assessment',
      domain: 'Regulation',
      icon: Heart,
      description: 'Measuring your baseline stress regulation and autonomic capacity',
      questions: [
        {
          id: 'stress_handle',
          text: 'In the last month, how often have you felt that you were unable to control the important things in your life?',
          scale: ['Never', 'Almost Never', 'Sometimes', 'Fairly Often', 'Very Often']
        },
        {
          id: 'stress_overcome',
          text: 'In the last month, how often have you felt confident about your ability to handle your personal problems?',
          scale: ['Very Often', 'Fairly Often', 'Sometimes', 'Almost Never', 'Never']
        },
        {
          id: 'stress_going',
          text: 'In the last month, how often have you felt that things were going your way?',
          scale: ['Very Often', 'Fairly Often', 'Sometimes', 'Almost Never', 'Never']
        },
        {
          id: 'stress_cope',
          text: 'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?',
          scale: ['Never', 'Almost Never', 'Sometimes', 'Fairly Often', 'Very Often']
        }
      ]
    },
    {
      id: 'observer_index',
      name: 'Observer Index',
      domain: 'Awareness',
      icon: Eye,
      description: 'Assessing your meta-awareness and ability to observe thoughts',
      questions: [
        {
          id: 'aware_thoughts',
          text: 'I can notice my thoughts without getting caught up in them.',
          scale: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
        },
        {
          id: 'watch_feelings',
          text: 'I can watch my feelings without needing to react to them.',
          scale: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
        },
        {
          id: 'step_back',
          text: 'When I\'m upset, I can step back and observe the emotion.',
          scale: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
        },
        {
          id: 'perspective',
          text: 'I can take a perspective on my thoughts and see them as just thoughts.',
          scale: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
        },
        {
          id: 'distance',
          text: 'I can create distance between myself and my difficult thoughts.',
          scale: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
        }
      ]
    },
    {
      id: 'vitality_index',
      name: 'Vitality Index',
      domain: 'Outlook',
      icon: TrendingUp,
      description: 'Measuring your baseline positive affect and emotional well-being',
      questions: [
        {
          id: 'cheerful',
          text: 'Over the past two weeks, I have felt cheerful and in good spirits.',
          scale: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
        },
        {
          id: 'calm_relaxed',
          text: 'Over the past two weeks, I have felt calm and relaxed.',
          scale: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
        },
        {
          id: 'active_vigorous',
          text: 'Over the past two weeks, I have felt active and vigorous.',
          scale: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
        },
        {
          id: 'fresh_rested',
          text: 'Over the past two weeks, I woke up feeling fresh and rested.',
          scale: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
        },
        {
          id: 'interesting',
          text: 'Over the past two weeks, my daily life has been filled with things that interest me.',
          scale: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
        }
      ]
    },
    {
      id: 'focus_diagnostic',
      name: 'Focus Diagnostic',
      domain: 'Attention',
      icon: Target,
      description: 'Evaluating your attentional control and mind-wandering tendencies',
      questions: [
        {
          id: 'task_unrelated',
          text: 'I have difficulty maintaining focus on simple or repetitive tasks.',
          scale: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
        },
        {
          id: 'mind_wander',
          text: 'My mind wanders during conversations or meetings.',
          scale: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
        },
        {
          id: 'daydream',
          text: 'I find myself daydreaming when I should be concentrating.',
          scale: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
        },
        {
          id: 'lose_focus',
          text: 'I lose focus on tasks that require sustained attention.',
          scale: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
        }
      ]
    },
    {
      id: 'presence_test',
      name: 'Presence Test',
      domain: 'Attention',
      icon: Brain,
      description: 'Embodied attention measurement through breath counting',
      type: 'bct',
      info: 'This is a 3-minute breath counting task. Count breaths 1-8 silently, press the button after breath 8 to complete a cycle, then immediately restart at 1. If you lose count, press "Lost Count". One mistake ends the test.'
    }
  ];

  const currentAssessment = assessments[currentSection];
  const totalSections = assessments.length;

  // Calculate score for a completed section
  const calculateSectionScore = (sectionId, answers) => {
    const section = assessments.find(a => a.id === sectionId);
    if (!section.questions) return 0;

    const total = section.questions.reduce((sum, q) => {
      const answer = answers[q.id];
      return sum + (answer !== undefined ? answer : 0);
    }, 0);

    const maxScore = section.questions.length * 4;
    return (total / maxScore) * 5;
  };

  // Calculate REwired Index from all domain scores
  const calculateREwiredIndex = (scores) => {
    const regulation = scores.calm_core || 0;
    const awareness = scores.observer_index || 0;
    const outlook = scores.vitality_index || 0;
    
    // Attention is average of focus_diagnostic and presence_test
    const focusScore = scores.focus_diagnostic || 0;
    const presenceScore = scores.presence_test || 0;
    const attention = (focusScore + presenceScore) / 2;

    const average = (regulation + awareness + outlook + attention) / 4;
    return Math.round(average * 20);
  };

  const getTierInfo = (score) => {
    if (score >= 81) return { name: 'Integrated', status: 'Embodied', color: '#10b981' };
    if (score >= 61) return { name: 'Optimized', status: 'Coherent', color: '#3b82f6' };
    if (score >= 41) return { name: 'Operational', status: 'Stabilizing', color: orange };
    if (score >= 21) return { name: 'Baseline Mode', status: 'Installing...', color: '#f59e0b' };
    return { name: 'System Offline', status: 'Critical', color: '#ef4444' };
  };

  const handleAnswerSelect = (questionId, value) => {
    setResponses({
      ...responses,
      [questionId]: value
    });
  };

  const handleSectionComplete = async () => {
    // Calculate score for current section
    const score = calculateSectionScore(currentAssessment.id, responses);
    const newScores = {
      ...sectionScores,
      [currentAssessment.id]: score
    };
    setSectionScores(newScores);

    // Save to storage
    await window.storage.set(`baseline:${currentAssessment.id}`, JSON.stringify({
      score,
      responses: Object.keys(responses)
        .filter(k => k.startsWith(currentAssessment.id) || currentAssessment.questions?.some(q => q.id === k))
        .reduce((obj, k) => ({ ...obj, [k]: responses[k] }), {})
    }));

    // Move to next section or results
    if (currentSection < totalSections - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      // Calculate and save final REwired Index
      const rewiredIndex = calculateREwiredIndex(newScores);
      await window.storage.set('baseline:rewired_index', JSON.stringify({
        score: rewiredIndex,
        domainScores: newScores,
        completedDate: new Date().toISOString()
      }));
      setStage('results');
    }
  };

  const allQuestionsAnswered = currentAssessment.questions?.every(q => 
    responses[q.id] !== undefined
  );

  if (stage === 'welcome') {
    return (
      <div className="min-h-screen bg-zinc-950 p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-full mb-6">
              <Brain className="w-10 h-10" style={{ color: orange }} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              IOS Baseline Diagnostic
            </h1>
            <p className="text-zinc-400 text-lg">
              Establish your starting point across 4 core domains
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">What We'll Measure</h2>
            <div className="space-y-4">
              {assessments.map((assessment, idx) => {
                const Icon = assessment.icon;
                return (
                  <div key={assessment.id} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5" style={{ color: orange }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white font-medium">{assessment.name}</h3>
                        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded">
                          {assessment.domain}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400">
                        {assessment.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 pt-6 border-t border-zinc-800">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Check className="w-4 h-4" style={{ color: orange }} />
                <span>Total time: ~8 minutes</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400 mt-2">
                <Check className="w-4 h-4" style={{ color: orange }} />
                <span>Results generate your REwired Index (0-100)</span>
              </div>
            </div>
          </div>

          {/* Get Started Button */}
          <button
            onClick={() => setStage('assessment')}
            style={{ backgroundColor: orange }}
            className="w-full hover:opacity-90 text-black font-semibold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-3"
          >
            <Play className="w-5 h-5" />
            Begin Assessment
          </button>

          <p className="text-xs text-zinc-600 text-center mt-4">
            Data stored locally in your browser
          </p>
        </div>
      </div>
    );
  }

  if (stage === 'assessment') {
    const Icon = currentAssessment.icon;
    const progress = ((currentSection) / totalSections) * 100;

    if (currentAssessment.type === 'bct') {
      // BCT integration placeholder
      return (
        <div className="min-h-screen bg-zinc-950 p-8">
          <div className="max-w-3xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-zinc-400">
                  Section {currentSection + 1} of {totalSections}
                </span>
                <span className="text-sm font-medium" style={{ color: orange }}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500"
                  style={{ width: `${progress}%`, backgroundColor: orange }}
                />
              </div>
            </div>

            {/* BCT Instructions */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6" style={{ color: orange }} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{currentAssessment.name}</h2>
                  <p className="text-zinc-400">{currentAssessment.domain} Domain</p>
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 mb-6">
                <p className="text-zinc-300 leading-relaxed">
                  {currentAssessment.info}
                </p>
              </div>

              <div className="text-center text-zinc-500 py-8">
                [BCT Component Integration Here]
              </div>

              <button
                onClick={handleSectionComplete}
                style={{ backgroundColor: orange }}
                className="w-full hover:opacity-90 text-black font-semibold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                Complete & Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-zinc-950 p-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-zinc-400">
                Section {currentSection + 1} of {totalSections}
              </span>
              <span className="text-sm font-medium" style={{ color: orange }}>
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: orange }}
              />
            </div>
          </div>

          {/* Section Header */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center">
                <Icon className="w-6 h-6" style={{ color: orange }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{currentAssessment.name}</h2>
                <p className="text-zinc-400">{currentAssessment.domain} Domain</p>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {currentAssessment.questions.map((question, qIdx) => (
              <div key={question.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="mb-4">
                  <span className="text-xs font-medium text-zinc-500 bg-zinc-800 px-2 py-1 rounded">
                    Question {qIdx + 1}/{currentAssessment.questions.length}
                  </span>
                </div>
                <p className="text-white text-lg mb-6 leading-relaxed">
                  {question.text}
                </p>
                <div className="grid grid-cols-5 gap-3">
                  {question.scale.map((label, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelect(question.id, idx)}
                      style={{
                        backgroundColor: responses[question.id] === idx ? orange : undefined,
                        borderColor: responses[question.id] === idx ? orange : undefined,
                        color: responses[question.id] === idx ? 'black' : undefined
                      }}
                      className={`
                        p-4 rounded-lg border-2 transition-all
                        ${responses[question.id] === idx
                          ? ''
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }
                      `}
                    >
                      <div className="text-sm font-medium mb-1">{idx}</div>
                      <div className="text-xs">{label}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSectionComplete}
              disabled={!allQuestionsAnswered}
              style={{
                backgroundColor: allQuestionsAnswered ? orange : undefined,
                color: allQuestionsAnswered ? 'black' : undefined
              }}
              className={`
                px-8 py-4 rounded-lg font-semibold transition-all flex items-center gap-2
                ${allQuestionsAnswered
                  ? 'hover:opacity-90'
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                }
              `}
            >
              {currentSection < totalSections - 1 ? 'Next Section' : 'Complete Assessment'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'results') {
    const rewiredIndex = calculateREwiredIndex(sectionScores);
    const tierInfo = getTierInfo(rewiredIndex);

    return (
      <div className="min-h-screen bg-zinc-950 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-full mb-6">
              <Check className="w-10 h-10" style={{ color: orange }} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Baseline Established
            </h1>
            <p className="text-zinc-400">
              Your transformation starting point
            </p>
          </div>

          {/* REwired Index Card */}
          <div className="bg-zinc-900 border-2 rounded-xl p-12 text-center mb-8" style={{ borderColor: orange }}>
            <div className="text-7xl font-bold text-white mb-4">
              {rewiredIndex}
              <span className="text-3xl text-zinc-500">/100</span>
            </div>
            <div className="text-2xl font-semibold mb-2" style={{ color: tierInfo.color }}>
              {tierInfo.name}
            </div>
            <div className="text-zinc-400 text-lg">
              {tierInfo.status}
            </div>
          </div>

          {/* Domain Scores */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">Domain Breakdown</h2>
            <div className="space-y-6">
              {[
                { key: 'calm_core', label: 'Regulation', icon: Heart },
                { key: 'observer_index', label: 'Awareness', icon: Eye },
                { key: 'vitality_index', label: 'Outlook', icon: TrendingUp },
                { key: 'focus_diagnostic', label: 'Attention (Focus)', icon: Target },
                { key: 'presence_test', label: 'Attention (Presence)', icon: Brain }
              ].map(({ key, label, icon: Icon }) => {
                const score = sectionScores[key] || 0;
                const percentage = (score / 5) * 100;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" style={{ color: orange }} />
                        <span className="text-white font-medium">{label}</span>
                      </div>
                      <span className="font-semibold" style={{ color: orange }}>
                        {score.toFixed(1)}/5.0
                      </span>
                    </div>
                    <div className="h-3 bg-zinc-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: orange }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
            <h2 className="text-xl font-semibold text-white mb-4">What's Next</h2>
            <p className="text-zinc-400 mb-6 leading-relaxed">
              Your baseline is established. The IOS will now track your transformation across these domains as you progress through the 7 stages, measuring deltas weekly to show exactly how your nervous system and mental architecture are evolving.
            </p>
            <button
              onClick={() => {/* Return to main chat */}}
              style={{ backgroundColor: orange }}
              className="w-full hover:opacity-90 text-black font-semibold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              Begin Stage 1: Neural Priming
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
