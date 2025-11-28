// components/FloatingActionButton.tsx
'use client';

import { useState } from 'react';
import { Zap, X, Check, Loader2, RefreshCw } from 'lucide-react';
import { getStagePractices, getUnlockedOnDemandTools } from '@/app/config/stages';
import type { UserProgress } from '@/app/hooks/useUserProgress';
import { useResonanceBreathing } from '@/components/ResonanceModal';

interface FloatingActionButtonProps {
  progress: UserProgress;
  userId: string;
  onPracticeClick: (practiceId: string) => void;
  onToolClick: (toolId: string) => void;
  onProgressUpdate?: () => Promise<void> | void;
  onPracticeCompleted?: (practiceId: string, practiceName: string) => void;
  isRefreshing?: boolean; // NEW: show when data is being refreshed
}

// Map from config practice IDs to database practice_type values
const PRACTICE_ID_MAP: { [key: string]: string } = {
  'hrvb': 'hrvb',
  'awareness_rep': 'awareness_rep',
  'somatic_flow': 'somatic_flow',
  'micro_action': 'micro_action',
  'flow_block': 'flow_block',
  'co_regulation': 'co_regulation',
  'nightly_debrief': 'nightly_debrief',
};

export default function FloatingActionButton({ 
  progress,
  userId,
  onPracticeClick, 
  onToolClick,
  onProgressUpdate,
  onPracticeCompleted,
  isRefreshing = false
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [completing, setCompleting] = useState<string | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);

  // Initialize the Resonance Breathing modal hook
  const { open: openResonance, Modal: ResonanceModal } = useResonanceBreathing();

  const currentStagePractices = getStagePractices(progress.currentStage);
  const unlockedTools = getUnlockedOnDemandTools(progress.currentStage);

  const getPracticeStatus = (practiceId: string): 'completed' | 'pending' => {
    const mappedId = PRACTICE_ID_MAP[practiceId] || practiceId;
    const practiceData = progress.dailyPractices[practiceId] || progress.dailyPractices[mappedId];
    if (practiceData?.completed) return 'completed';
    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    return status === 'completed' ? '✅' : '⏳';
  };

  // Handle "Start Ritual" click with special routing for Resonance Breathing
  const handleStartPractice = (practiceId: string) => {
    if (practiceId === 'hrvb') {
      openResonance();
      setIsOpen(false);
    } else {
      onPracticeClick(practiceId);
      setIsOpen(false);
    }
  };

  // Handle "Done" button click to mark practice complete
  const handleMarkComplete = async (practiceId: string, practiceName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!userId) {
      setCompletionError('No user ID - please refresh the page');
      return;
    }
    
    try {
      setCompleting(practiceId);
      setCompletionError(null);

      const dbPracticeType = PRACTICE_ID_MAP[practiceId] || practiceId;
      
      // Get client's local date
      const now = new Date();
      const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      const response = await fetch('/api/practices/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          practiceType: dbPracticeType,
          completed: true,
          localDate: localDate
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      // NEW: Wait a moment for database to update
      await new Promise(resolve => setTimeout(resolve, 300));

      // Notify chat that practice was completed
      if (onPracticeCompleted) {
        onPracticeCompleted(practiceId, practiceName);
      } else if (onProgressUpdate) {
        await onProgressUpdate();
      }

    } catch (err) {
      console.error('[FloatingActionButton] Error completing practice:', err);
      setCompletionError(err instanceof Error ? err.message : 'Failed to log completion');
    } finally {
      setCompleting(null);
    }
  };

  const handleToolClick = (toolId: string) => {
    onToolClick(toolId);
    setIsOpen(false);
  };

  // Calculate completion stats
  const completedCount = currentStagePractices.filter(p => getPracticeStatus(p.id) === 'completed').length;
  const totalCount = currentStagePractices.length;
  const allComplete = completedCount === totalCount;

  return (
    <>
      {/* Resonance Breathing Modal */}
      <ResonanceModal />

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Menu */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 w-80 max-h-[70vh] overflow-y-auto bg-[#111111] border border-gray-700 rounded-lg shadow-xl z-50">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Tools</h3>
                {/* NEW: Refresh indicator */}
                {isRefreshing && (
                  <RefreshCw className="w-3 h-3 text-[#ff9e19] animate-spin" />
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Today's Progress */}
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
                <p className="text-xs text-green-400 mt-2 text-center">All rituals complete! 🎉</p>
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

            {/* DAILY RITUALS */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-400 mb-2">
                DAILY RITUALS
              </div>
              <div className="space-y-2">
                {currentStagePractices.map((practice) => {
                  const status = getPracticeStatus(practice.id);
                  const isCompleted = status === 'completed';
                  const isCompleting = completing === practice.id;
                  
                  return (
                    <div
                      key={practice.id}
                      className={`p-3 rounded-lg ${
                        isCompleted
                          ? 'bg-green-500/10 border border-green-500/20'
                          : 'bg-[#0a0a0a] border border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{practice.icon}</span>
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs">{getStatusIcon(status)}</span>
                          <span className={`text-sm font-medium ${
                            isCompleted ? 'text-green-400' : 'text-white'
                          }`}>
                            {practice.name}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 ml-8 mb-2">
                        {practice.duration} min
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 ml-8">
                        {!isCompleted && (
                          <>
                            <button
                              onClick={() => handleStartPractice(practice.id)}
                              className="flex-1 px-2 py-1.5 text-xs font-medium bg-emerald-600/20 text-emerald-400 rounded hover:bg-emerald-600/30 transition-colors"
                            >
                              Start Ritual
                            </button>
                            <button
                              onClick={(e) => handleMarkComplete(practice.id, practice.name, e)}
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
                  );
                })}
              </div>
            </div>

            {/* On-Demand Tools */}
            <div>
              <div className="text-xs font-semibold text-gray-400 mb-2">
                ON-DEMAND TOOLS
              </div>
              <div className="space-y-2">
                {unlockedTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolClick(tool.id)}
                    className="w-full text-left p-3 rounded-lg bg-[#0a0a0a] border border-gray-700 active:border-[#ff9e19]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{tool.icon}</span>
                      <span className="text-sm font-medium text-white">
                        {tool.shortName}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-[#ff9e19] rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 transition-colors z-30"
      >
        <Zap className="w-6 h-6 text-white" />
      </button>
    </>
  );
}
