'use client';

import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, TrendingUp, Download } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function BreathCountingTask({ user }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [stage, setStage] = useState('instructions'); // instructions, task, results
  const [userId, setUserId] = useState(user?.id || '');
  const duration = 3; // Fixed 3 minute duration
  const [breathsInCycle, setBreathsInCycle] = useState(0);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(3 * 60);
  const [pressConfirmation, setPressConfirmation] = useState(null);
  const [failureReason, setFailureReason] = useState('');

  const orangeAccent = '#ff9e19';

  // Timer countdown
  useEffect(() => {
    if (stage === 'task' && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            endTask('perfect');
            return 0;
          }
          return prev - 1;
        });
        setElapsedTime(prev => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [stage, timeRemaining]);

  // Keyboard support
  useEffect(() => {
    if (stage !== 'task') return;

    const handleKeyPress = (e) => {
      if (e.key === ' ' || e.key === 'b') {
        e.preventDefault();
        handleBreathPress();
      } else if (e.key === 'Enter' || e.key === 'c') {
        e.preventDefault();
        handleCompleteCycle();
      } else if (e.key === 'r' || e.key === 'Escape') {
        e.preventDefault();
        handleLostCount();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [stage, breathsInCycle]);

  const startTask = () => {
    setStage('task');
    setBreathsInCycle(0);
    setCyclesCompleted(0);
    setElapsedTime(0);
    setTimeRemaining(3 * 60);
    setFailureReason('');
  };

  const showConfirmation = (type) => {
    setPressConfirmation(type);
    setTimeout(() => setPressConfirmation(null), 200);
  };

  const handleBreathPress = () => {
    if (breathsInCycle < 8) {
      setBreathsInCycle(prev => prev + 1);
      showConfirmation('breath');
    } else {
      endTask('miscount_extra_breath');
    }
  };

  const handleCompleteCycle = () => {
    if (breathsInCycle === 8) {
      setCyclesCompleted(prev => prev + 1);
      setBreathsInCycle(0);
      showConfirmation('complete');
    } else {
      endTask('miscount_wrong_count');
    }
  };

  const handleLostCount = () => {
    endTask('lost_count');
  };

  const endTask = async (reason) => {
    const score = ((elapsedTime / 180) * 5).toFixed(2);
    
    let reasonText = '';
    switch(reason) {
      case 'perfect':
        reasonText = 'Perfect! Completed full 3 minutes';
        break;
      case 'miscount_wrong_count':
        reasonText = `Miscount: Completed cycle at breath ${breathsInCycle} (should be 8)`;
        break;
      case 'miscount_extra_breath':
        reasonText = 'Miscount: Pressed breath button after 8 breaths';
        break;
      case 'lost_count':
        reasonText = 'Self-reported: Lost count';
        break;
      default:
        reasonText = 'Test ended';
    }

    setFailureReason(reasonText);

    // Save BCT score to Supabase
    await saveBCTScore(parseFloat(score), reasonText, reason === 'perfect');

    setStage('results');
  };

  const saveBCTScore = async (score, reason, perfect) => {
    try {
      // Update baseline_assessments with BCT score
      const { error: updateError } = await supabase
        .from('baseline_assessments')
        .update({
          bct_score: score,
          bct_elapsed_seconds: elapsedTime,
          bct_cycles_completed: cyclesCompleted,
          bct_failure_reason: reason,
          bct_perfect: perfect,
          bct_completed_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      console.log('✅ BCT score saved successfully');
    } catch (error) {
      console.error('❌ Error saving BCT score:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = () => {
    // Navigate to chat after completing BCT
    router.push('/chat');
  };

  if (stage === 'instructions') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="max-w-2xl w-full p-8 rounded-lg" style={{ backgroundColor: '#111111', border: '1px solid #1a1a1a' }}>
          <h1 className="text-3xl font-bold text-white mb-2">Breath Counting Task</h1>
          <p className="text-gray-400 mb-6">
            A standardized 3-minute mindfulness assessment measuring sustained attention and meta-awareness.
          </p>

          <div className="space-y-4 text-gray-300 mb-6">
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#0a0a0a' }}>
              <h2 className="font-semibold text-lg mb-2 text-white">How It Works:</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>Count breaths <strong>1 through 8</strong> silently in your mind</li>
                <li>Press <strong>"Next Breath"</strong> for each breath (1-8)</li>
                <li>After breath 8, press <strong>"Complete Cycle"</strong> to mark breath 9</li>
                <li>Immediately start a new cycle (count restarts at 1)</li>
                <li>If you lose count, press <strong>"Lost Count"</strong></li>
              </ol>
            </div>

            <p className="text-sm text-gray-400">
              Keyboard shortcuts: <strong>Space/B</strong> = Next Breath | <strong>Enter/C</strong> = Complete | <strong>R/Esc</strong> = Lost Count
            </p>
          </div>

          <button
            onClick={startTask}
            className="w-full py-3 px-6 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all"
            style={{ backgroundColor: orangeAccent }}
          >
            <Play className="w-5 h-5" />
            Start 3-Minute Test
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'task') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="max-w-3xl w-full p-8 rounded-lg" style={{ backgroundColor: '#111111', border: '1px solid #1a1a1a' }}>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-1" style={{ color: orangeAccent }}>
                {formatTime(elapsedTime)}
              </div>
              <div className="text-gray-400 text-sm">Elapsed Time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-500 mb-1">
                {cyclesCompleted}
              </div>
              <div className="text-gray-400 text-sm">Cycles Completed</div>
            </div>
          </div>

          <div className="text-center mb-8">
            <div 
              className={`w-24 h-24 mx-auto rounded-full transition-all duration-200 flex items-center justify-center ${
                pressConfirmation === 'breath' ? 'bg-blue-500 scale-110' :
                pressConfirmation === 'complete' ? 'bg-green-500 scale-110' :
                'scale-100'
              }`}
              style={{ backgroundColor: pressConfirmation ? undefined : '#1a1a1a' }}
            >
              {pressConfirmation === 'breath' && <span className="text-white text-2xl font-bold">•</span>}
              {pressConfirmation === 'complete' && <span className="text-white text-2xl font-bold">✓</span>}
            </div>
            <div className="text-gray-400 mt-4 text-lg">
              Count breaths 1-8 internally
            </div>
            <div className="text-sm text-gray-500 mt-1">
              One mistake ends the test
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <button
              onClick={handleBreathPress}
              className="w-full py-8 px-6 rounded-lg font-semibold text-white text-xl transition-all active:scale-95"
              style={{ backgroundColor: '#1e40af' }}
            >
              Next Breath (Space/B)
              <div className="text-sm font-normal mt-1 opacity-90">Press for breaths 1-8</div>
            </button>

            <button
              onClick={handleCompleteCycle}
              className="w-full py-8 px-6 rounded-lg font-semibold text-white text-xl transition-all active:scale-95"
              style={{ backgroundColor: '#16a34a' }}
            >
              Complete Cycle (Enter/C)
              <div className="text-sm font-normal mt-1 opacity-90">Press after breath 8 (marks breath 9)</div>
            </button>

            <button
              onClick={handleLostCount}
              className="w-full py-6 px-6 rounded-lg font-semibold text-white transition-all active:scale-95"
              style={{ backgroundColor: '#dc2626' }}
            >
              Lost Count (R/Esc)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'results') {
    const score = ((elapsedTime / 180) * 5).toFixed(2);
    const isPerfect = elapsedTime >= 180;

    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="max-w-2xl w-full p-8 rounded-lg" style={{ backgroundColor: '#111111', border: '1px solid #1a1a1a' }}>
          <h1 className="text-3xl font-bold text-white mb-2 text-center">Test Complete!</h1>
          <p className="text-center text-gray-400 mb-6">
            Baseline Assessment Finished
          </p>

          <div className="p-8 rounded-lg text-center mb-6" style={{ backgroundColor: '#0a0a0a' }}>
            <div className="text-7xl font-bold mb-3" style={{ color: orangeAccent }}>
              {score}/5.0
            </div>
            <div className="text-gray-300 font-semibold text-lg">
              {isPerfect ? '🎉 Perfect Score!' : 'Sustained Attention Score'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-lg text-center" style={{ backgroundColor: '#0a0a0a' }}>
              <div className="text-3xl font-bold text-blue-500 mb-1">
                {formatTime(elapsedTime)}
              </div>
              <div className="text-gray-400 text-sm">Time Lasted</div>
            </div>
            <div className="p-4 rounded-lg text-center" style={{ backgroundColor: '#0a0a0a' }}>
              <div className="text-3xl font-bold text-green-500 mb-1">
                {cyclesCompleted}
              </div>
              <div className="text-gray-400 text-sm">Cycles Completed</div>
            </div>
          </div>

          <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: '#0a0a0a' }}>
            <p className="font-semibold text-white mb-2">Result:</p>
            <p className="text-gray-300">{failureReason}</p>
          </div>

          <button
            onClick={handleComplete}
            className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all"
            style={{ backgroundColor: orangeAccent }}
          >
            Continue to IOS Installer
          </button>
        </div>
      </div>
    );
  }

  return null;
}
