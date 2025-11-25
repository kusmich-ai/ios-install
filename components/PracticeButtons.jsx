// components/PracticeButtons.jsx
'use client';

import { useState, useEffect } from 'react';
import { Check, Circle, Loader2, Clock } from 'lucide-react';

const PRACTICE_INFO = {
  hrvb_breathing: {
    name: 'Resonance Breathing',
    shortName: 'HRVB',
    duration: '5-7 min',
    icon: '🫁',
    description: 'Heart rate variability training'
  },
  awareness_rep: {
    name: 'Awareness Rep',
    shortName: 'Awareness',
    duration: '2 min',
    icon: '👁',
    description: 'Meta-awareness training'
  },
  somatic_flow: {
    name: 'Somatic Flow',
    shortName: 'Somatic',
    duration: '3 min',
    icon: '🧘',
    description: 'Cat-Cow + Squat-to-Reach'
  },
  micro_action: {
    name: 'Morning Micro-Action',
    shortName: 'Micro-Action',
    duration: '2-5 min',
    icon: '⚡',
    description: 'Identity-based daily proof'
  },
  flow_block: {
    name: 'Flow Block',
    shortName: 'Flow',
    duration: '60-90 min',
    icon: '🎯',
    description: 'Deep work session'
  },
  co_regulation: {
    name: 'Co-Regulation',
    shortName: 'Co-Reg',
    duration: '3-5 min',
    icon: '💞',
    description: 'Relational coherence practice'
  },
  nightly_debrief: {
    name: 'Nightly Debrief',
    shortName: 'Debrief',
    duration: '2 min',
    icon: '🌙',
    description: 'Evening integration'
  }
};

export default function PracticeButtons({ 
  userId, 
  currentStage, 
  onPracticeComplete,
  compact = false 
}) {
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);
  const [error, setError] = useState(null);

  // Fetch current practice status
  useEffect(() => {
    if (userId) {
      fetchPracticeStatus();
    }
  }, [userId]);

  const fetchPracticeStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/practices/log?userId=${userId}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setPractices(data.practices || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching practice status:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleComplete = async (practiceId) => {
    try {
      setCompleting(practiceId);
      setError(null);

      const response = await fetch('/api/practices/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          practiceType: practiceId,
          completed: true
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Update local state
      setPractices(prev => prev.map(p => 
        p.id === practiceId 
          ? { ...p, completed: true, completedAt: new Date().toISOString() }
          : p
      ));

      // Notify parent component
      if (onPracticeComplete) {
        onPracticeComplete(practiceId, data);
      }

    } catch (err) {
      console.error('Error completing practice:', err);
      setError(err.message);
    } finally {
      setCompleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-400 text-sm">
        Error: {error}
        <button 
          onClick={fetchPracticeStatus}
          className="ml-2 text-orange-400 hover:text-orange-300"
        >
          Retry
        </button>
      </div>
    );
  }

  const completedCount = practices.filter(p => p.completed).length;
  const totalCount = practices.length;
  const allComplete = completedCount === totalCount;

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Today's Practices</span>
          <span className={allComplete ? 'text-green-400' : 'text-orange-400'}>
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {practices.map(practice => {
            const info = PRACTICE_INFO[practice.id];
            return (
              <button
                key={practice.id}
                onClick={() => !practice.completed && handleComplete(practice.id)}
                disabled={practice.completed || completing === practice.id}
                className={`
                  px-2 py-1 rounded text-xs font-medium transition-all
                  ${practice.completed 
                    ? 'bg-green-500/20 text-green-400 cursor-default' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }
                  ${completing === practice.id ? 'opacity-50' : ''}
                `}
                title={info?.name || practice.id}
              >
                {completing === practice.id ? (
                  <Loader2 className="w-3 h-3 animate-spin inline" />
                ) : practice.completed ? (
                  <Check className="w-3 h-3 inline" />
                ) : (
                  info?.icon || '•'
                )}
                {' '}
                {info?.shortName || practice.id}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">Today's Practices</h3>
        <div className={`text-sm font-medium ${allComplete ? 'text-green-400' : 'text-gray-400'}`}>
          {completedCount}/{totalCount}
          {allComplete && ' ✓'}
        </div>
      </div>

      {allComplete && (
        <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
          <span className="text-green-400 text-sm">All practices complete! 🎉</span>
        </div>
      )}

      <div className="space-y-2">
        {practices.map(practice => {
          const info = PRACTICE_INFO[practice.id];
          const isCompleting = completing === practice.id;

          return (
            <div
              key={practice.id}
              className={`
                p-3 rounded-lg border transition-all
                ${practice.completed 
                  ? 'bg-green-500/5 border-green-500/20' 
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{info?.icon || '•'}</span>
                  <div>
                    <div className="font-medium text-sm text-white">
                      {info?.name || practice.id}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {info?.duration || ''}
                    </div>
                  </div>
                </div>

                {practice.completed ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <Check className="w-5 h-5" />
                    <span className="text-xs">Done</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleComplete(practice.id)}
                    disabled={isCompleting}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                      ${isCompleting 
                        ? 'bg-gray-600 text-gray-400 cursor-wait' 
                        : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 hover:text-orange-300'
                      }
                    `}
                  >
                    {isCompleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Complete'
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
