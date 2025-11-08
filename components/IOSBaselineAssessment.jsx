import React, { useState, useEffect, useRef } from 'react';
import { storage } from '../lib/storage';

export default function IOSBaselineAssessment() {
  const [stage, setStage] = useState('welcome');
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [selectedValue, setSelectedValue] = useState(null);
  const [bctActive, setBctActive] = useState(false);
  const [bctTime, setBctTime] = useState(180);
  const [bctBreaths, setBctBreaths] = useState(0);
  const [bctCycles, setBctCycles] = useState(0);
  const [bctScore, setBctScore] = useState(0);
  const [results, setResults] = useState(null);
  const timerRef = useRef(null);

  const sections = [
    {
      id: 'calm_core',
      name: 'Calm Core Assessment',
      domain: 'Regulation',
      description: 'Measuring your nervous system\'s baseline stress and regulatory capacity',
      questions: [
        { text: 'In the past week, how often have you felt unable to control important things in your life?', scale: 'frequency', reverse: true },
        { text: 'In the past week, how often have you felt confident about your ability to handle personal problems?', scale: 'frequency' },
        { text: 'In the past week, how often have you felt that things were going your way?', scale: 'frequency' },
        { text: 'In the past week, how often have you felt difficulties piling up so high you could not overcome them?', scale: 'frequency', reverse: true }
      ],
      scaleLabels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often']
    },
    {
      id: 'observer_index',
      name: 'Observer Index',
      domain: 'Awareness',
      description: 'Assessing your capacity for meta-awareness and cognitive decentering',
      questions: [
        { text: 'I am able to separate myself from my thoughts and feelings', scale: 'agreement' },
        { text: 'I can observe unpleasant feelings without getting caught up in them', scale: 'agreement' },
        { text: 'I am able to see my thoughts as mental events rather than facts', scale: 'agreement' },
        { text: 'I can notice when my mind wanders without getting lost in thought', scale: 'agreement' },
        { text: 'I experience my thoughts as separate from who I am', scale: 'agreement' },
        { text: 'I can watch my feelings without being swept away by them', scale: 'agreement' },
        { text: 'I am able to see my experiences from a distance', scale: 'agreement' }
      ],
      scaleLabels: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
    },
    {
      id: 'vitality_index',
      name: 'Vitality Index',
      domain: 'Outlook',
      description: 'Measuring your baseline emotional tone and life satisfaction',
      questions: [
        { text: 'Over the past two weeks, I have felt cheerful and in good spirits', scale: 'frequency' },
        { text: 'Over the past two weeks, I have felt calm and relaxed', scale: 'frequency' },
        { text: 'Over the past two weeks, I have felt active and vigorous', scale: 'frequency' },
        { text: 'Over the past two weeks, I woke up feeling fresh and rested', scale: 'frequency' },
        { text: 'Over the past two weeks, my daily life has been filled with things that interest me', scale: 'frequency' }
      ],
      scaleLabels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often']
    },
    {
      id: 'focus_diagnostic',
      name: 'Focus Diagnostic',
      domain: 'Attention',
      description: 'Evaluating sustained attention and mind-wandering patterns',
      questions: [
        { text: 'I find my thoughts wandering spontaneously', scale: 'frequency' },
        { text: 'When I\'m working, I find myself thinking about things unrelated to the task', scale: 'frequency' },
        { text: 'I have difficulty maintaining focus on simple or repetitive tasks', scale: 'frequency' },
        { text: 'While reading, I find I haven\'t been thinking about the text', scale: 'frequency' },
        { text: 'I do things without paying full attention', scale: 'frequency' }
      ],
      scaleLabels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very Often']
    }
  ];

  const section = sections[currentSection];
  const question = section?.questions[currentQuestion];

  useEffect(() => {
    if (bctActive && bctTime > 0) {
      timerRef.current = setInterval(() => {
        setBctTime(prev => {
          if (prev <= 1) {
            completeBCT(180);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [bctActive, bctTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResponse = (value) => {
    setSelectedValue(value);
  };

  const handleNext = () => {
    const key = `${section.id}_q${currentQuestion}`;
    setResponses(prev => ({
      ...prev,
      [key]: {
        value: selectedValue,
        reverse: question.reverse || false
      }
    }));

    if (currentQuestion < section.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedValue(null);
    } else {
      if (currentSection < sections.length - 1) {
        setCurrentSection(prev => prev + 1);
        setCurrentQuestion(0);
        setSelectedValue(null);
      } else {
        setStage('bct_intro');
      }
    }
  };

  const startBCT = () => {
    setBctActive(true);
    setStage('bct_active');
    setBctTime(180);
    setBctBreaths(0);
    setBctCycles(0);
  };

  const handleBreath = () => {
    if (bctBreaths < 8) {
      setBctBreaths(prev => prev + 1);
    } else {
      completeBCT(180 - bctTime, 'Miscount: Pressed breath after 8');
    }
  };

  const handleCompleteCycle = () => {
    if (bctBreaths === 8) {
      setBctCycles(prev => prev + 1);
      setBctBreaths(0);
    } else {
      completeBCT(180 - bctTime, `Miscount: Completed at breath ${bctBreaths}`);
    }
  };

  const handleLostCount = () => {
    completeBCT(180 - bctTime, 'Self-reported: Lost count');
  };

  const completeBCT = (elapsedSeconds, reason = 'Perfect! Completed full 3 minutes') => {
    clearInterval(timerRef.current);
    setBctActive(false);
    const score = (elapsedSeconds / 180) * 5;
    setBctScore(score);
    calculateResults(elapsedSeconds, score);
  };

  const calculateResults = async (bctElapsed, bctScore) => {
    const sectionScores = {};
    
    sections.forEach(section => {
      let sum = 0;
      let count = 0;
      
      section.questions.forEach((q, idx) => {
        const key = `${section.id}_q${idx}`;
        const response = responses[key];
        if (response) {
          let value = response.value;
          if (response.reverse) {
            value = 4 - value;
          }
          sum += value;
          count++;
        }
      });
      
      const rawScore = sum / count;
      sectionScores[section.id] = rawScore;
    });

    sectionScores.presence_test = bctScore;

    const domainScores = {
      regulation: sectionScores.calm_core,
      awareness: sectionScores.observer_index,
      outlook: sectionScores.vitality_index,
      attention: (sectionScores.focus_diagnostic + sectionScores.presence_test) / 2
    };

    const sum = Object.values(domainScores).reduce((a, b) => a + b, 0);
    const average = sum / 4;
    const rewiredIndex = Math.round(average * 20);

    let tier = '';
    if (rewiredIndex >= 81) tier = 'Integrated (Embodied)';
    else if (rewiredIndex >= 61) tier = 'Optimized (Coherent)';
    else if (rewiredIndex >= 41) tier = 'Operational (Stabilizing)';
    else if (rewiredIndex >= 21) tier = 'Baseline Mode (Installing...)';
    else tier = 'System Offline (Critical)';

    const resultsData = {
      domainScores,
      rewiredIndex,
      tier,
      bctElapsed,
      bctScore,
      timestamp: new Date().toISOString()
    };

    await storeBaselineData(sectionScores, resultsData);
    setResults(resultsData);
    setStage('results');
  };

  const storeBaselineData = async (sectionScores, resultsData) => {
    try {
      console.log('💾 Storing baseline data...');
      console.log('📊 Results data:', resultsData);
      
      await storage.set('ios:baseline:calm_core', JSON.stringify(sectionScores.calm_core));
      await storage.set('ios:baseline:observer_index', JSON.stringify(sectionScores.observer_index));
      await storage.set('ios:baseline:vitality_index', JSON.stringify(sectionScores.vitality_index));
      await storage.set('ios:baseline:focus_diagnostic', JSON.stringify(sectionScores.focus_diagnostic));
      await storage.set('ios:baseline:presence_test', JSON.stringify(sectionScores.presence_test));
      await storage.set('ios:baseline:domain_scores', JSON.stringify(resultsData.domainScores));
      await storage.set('ios:baseline:rewired_index', JSON.stringify(resultsData.rewiredIndex));
      await storage.set('ios:baseline:tier', JSON.stringify(resultsData.tier));
      await storage.set('ios:baseline:date', JSON.stringify(resultsData.timestamp));
      await storage.set('ios:system_initialized', JSON.stringify(true));
      await storage.set('ios:current_stage', JSON.stringify(1));
      await storage.set('ios:stage_start_date', JSON.stringify(resultsData.timestamp));
      await storage.set('ios:weekly_deltas', JSON.stringify([]));
      
      console.log('✅ Baseline data stored successfully');
      
      const verify = await storage.get('ios:system_initialized');
      console.log('🔍 Verification check:', verify);
      
    } catch (error) {
      console.error('❌ Error storing baseline data:', error);
    }
  };

  if (stage === 'welcome') {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <img 
              src="/logo.png" 
              alt="IOS Logo" 
              className="w-24 h-24 mx-auto mb-6"
            />
            <h1 className="text-4xl font-bold mb-4">IOS BASELINE ASSESSMENT</h1>
            <p className="text-gray-400 text-lg mb-8">
              Welcome to your neural and mental transformation diagnostic.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <p className="text-gray-300 mb-6">
              This 8-minute assessment establishes your starting point across four core domains:
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-start">
                <span className="text-orange-500 mr-3">•</span>
                <div>
                  <span className="font-semibold">Regulation</span>
                  <span className="text-gray-400"> - nervous system stability</span>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-orange-500 mr-3">•</span>
                <div>
                  <span className="font-semibold">Awareness</span>
                  <span className="text-gray-400"> - meta-cognitive capacity</span>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-orange-500 mr-3">•</span>
                <div>
                  <span className="font-semibold">Outlook</span>
                  <span className="text-gray-400"> - emotional baseline</span>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-orange-500 mr-3">•</span>
                <div>
                  <span className="font-semibold">Attention</span>
                  <span className="text-gray-400"> - sustained focus ability</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Answer honestly - there are no wrong answers. This establishes your transformation starting point.
            </p>
          </div>

          <button
            onClick={() => setStage('assessment')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-lg transition
