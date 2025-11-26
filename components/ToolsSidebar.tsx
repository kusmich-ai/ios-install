// components/ToolsSidebar.tsx
'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Check, Loader2 } from 'lucide-react';
import { STAGES, ON_DEMAND_TOOLS, getStagePractices, getUnlockedOnDemandTools } from '@/app/config/stages';
import type { UserProgress } from '@/app/hooks/useUserProgress';

interface ToolsSidebarProps {
  progress: UserProgress;
  userId: string; // Add this
  onPracticeClick: (practiceId: string) => void;
  onToolClick: (toolId: string) => void;
  onProgressUpdate?: () => void;
}

// Map from your config practice IDs to the database practice_type values
// Your config uses 'hrvb', database stores as 'hrvb'
const PRACTICE_ID_MAP: { [key: string]: string } = {
  'hrvb': 'hrvb',
  'awareness_rep': 'awareness_rep',
  'somatic_flow': 'somatic_flow',
  'micro_action': 'micro_action',
  'flow_block': 'flow_block',
  'co_regulation': 'co_regulation',
  'nightly_debrief': 'nightly_debrief',
  // Legacy/alternate IDs (in case they appear elsewhere)
  'hrvb_breathing': 'hrvb',
  'resonance_breathing': 'hrvb',
};

export default function ToolsSidebar({ 
  progress, 
  userId,
  onPracticeClick, 
  onToolClick,
  onProgressUpdate 
}: ToolsSidebarProps) {
  const [dailyExpanded, setDailyExpanded] = useState(true);
  const [toolsExpanded, setToolsExpanded] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);

  const currentStagePractices = getStagePractices(progress.currentStage);
  const unlockedTools = getUnlockedOnDemandTools(progress.currentStage);

  const getPracticeStatus = (practiceId: string): 'completed' | 'pending' | 'locked' => {
    // Check both the original ID and mapped ID
    const mappedId = PRACTICE_ID_MAP[practiceId] || practiceId;
    const practiceData = progress.dailyPractices[practiceId] || progress.dailyPractices[mappedId];
    if (practiceData?.completed) return 'completed';
    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'pending':
        return '⏳';
      case 'locked':
        return '🔒';
      default:
        return '⏳';
    }
  };

  const handleMarkComplete = async (practiceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!userId) {
      setCompletionError('No user ID - please refresh the page');
      return;
    }
    
    try {
      setCompleting(practiceId);
      setCompletionError(null);

      const dbPracticeType = PRACTICE_ID_MAP[practiceId] || practiceId;

      console.log('[ToolsSidebar] Logging practice:', { userId, practiceType: dbPracticeType });

      const response = await fetch('/api/practices/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId, // Explicitly pass userId
          practiceType: dbPracticeType,
          completed: true
        })
      });

      const data = await response.json();
      console.log('[ToolsSidebar] Response:', data);

      if (!response.ok || data.error) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      // Trigger progress refresh if callback provided
      if (onProgressUpdate) {
        onProgressUpdate();
      } else {
        // Fallback: reload page
        setTimeout(() => window.location.reload(), 500);
      }

    } catch (err) {
      console.error('[ToolsSidebar] Error completing practice:', err);
      setCompletionError(err instanceof Error ? err.message : 'Failed to log completion');
    } finally {
      setCompleting(null);
    }
  };

  // Calculate completion stats
  const completedCount = currentStagePractices.filter(p => getPracticeStatus(p.id) === 'completed').length;
  const totalCount = currentStagePractices.length;
  const allComplete = completedCount === totalCount;

  return (
    <aside className="w-80 border-l border-gray-800 bg-[#111111] overflow-y-auto flex-shrink-0">
      <div className="p-4">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-1">Tools</h2>
          <p className="text-xs text-gray-400">Stage {progress.currentStage} Rituals & Protocols</p>
        </div>

        {/* Progress Summary */}
        <div className={`mb-4 p-3 rounded-lg border ${
          allComplete 
            ? 'bg-green-500/10 border-green-500/30' 
            : 'bg-[#0a0a0a] border-gray-700'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Today's Progress</span>
            <span className={`text-sm font-bold ${allComplete ? 'text-green-400' : 'text-[#ff9e19]'}`}>
              {completedCount}/{totalCount}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${allComplete ? 'bg-green-500' : 'bg-[#ff9e19]'}`}
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
          {allComplete && (
            <p className="text-xs text-green-400 mt-2 text-center">All practices complete! 🎉</p>
          )}
        </div>

        {/* Adherence Stats */}
        <div className="mb-4 p-3 rounded-lg bg-[#0a0a0a] border border-gray-700">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-[#ff9e19]">{progress.adherencePercentage}%</div>
              <div className="text-xs text-gray-500">14-Day Adherence</div>
            </div>
            <div>
              <div className="text-lg font-bold text-[#ff9e19]">{progress.consecutiveDays}</div>
              <div className="text-xs text-gray-500">Day Streak</div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {completionError && (
          <div className="mb-4 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-xs text-red-400">{completionError}</p>
          </div>
        )}

        {/* Daily Rituals Section */}
        <div className="mb-6">
          <button
            onClick={() => setDailyExpanded(!dailyExpanded)}
            className="w-full flex items-center justify-between text-sm font-semibold text-gray-300 hover:text-white transition-colors mb-3"
          >
            <span>DAILY RITUALS</span>
            {dailyExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {dailyExpanded && (
            <div className="space-y-2">
              {currentStagePractices.map((practice) => {
                const status = getPracticeStatus(practice.id);
                const isCompleted = status === 'completed';
                const isCompleting = completing === practice.id;
                
                return (
                  <div
                    key={practice.id}
                    className={`p-3 rounded-lg transition-all ${
                      isCompleted
                        ? 'bg-green-500/10 border border-green-500/20'
                        : 'bg-[#0a0a0a] border border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{practice.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs">{getStatusIcon(status)}</span>
                          <span className={`text-sm font-medium ${
                            isCompleted ? 'text-green-400' : 'text-white'
                          }`}>
                            {practice.shortName}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mb-2">
                          {practice.duration} min
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {!isCompleted && (
                            <>
                              <button
                                onClick={() => onPracticeClick(practice.id)}
                                className="flex-1 px-2 py-1.5 text-xs font-medium bg-emerald-600/20 text-emerald-400 rounded hover:bg-emerald-600/30 transition-colors"
                              >
                                Start Practice
                              </button>
                              <button
                                onClick={(e) => handleMarkComplete(practice.id, e)}
                                disabled={isCompleting}
                                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                                  isCompleting
                                    ? 'bg-gray-600 text-gray-400 cursor-wait'
                                    : 'bg-[#ff9e19]/20 text-[#ff9e19] hover:bg-[#ff9e19]/30'
                                }`}
                              >
                                {isCompleting ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                                Done
                              </button>
                            </>
                          )}
                          {isCompleted && (
                            <span className="text-xs text-green-400 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* On-Demand Tools Section */}
        <div>
          <button
            onClick={() => setToolsExpanded(!toolsExpanded)}
            className="w-full flex items-center justify-between text-sm font-semibold text-gray-300 hover:text-white transition-colors mb-3"
          >
            <span>ON-DEMAND TOOLS</span>
            {toolsExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {toolsExpanded && (
            <div className="space-y-2">
              {unlockedTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => onToolClick(tool.id)}
                  className="w-full text-left p-3 rounded-lg bg-[#0a0a0a] border border-gray-700 hover:border-[#ff9e19] transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{tool.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white mb-1">
                        {tool.shortName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {tool.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
