// components/ToolsSidebar.tsx
'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Check, Loader2, RefreshCw, RotateCcw } from 'lucide-react';
import { getStagePractices, getUnlockedOnDemandTools } from '@/app/config/stages';
import type { UserProgress } from '@/app/hooks/useUserProgress';
import { useResonanceBreathing } from '@/components/ResonanceModal';
import { useAwarenessRep } from '@/components/AwarenessRepModal';

interface ToolsSidebarProps {
  progress: UserProgress;
  userId: string;
  onPracticeClick: (practiceId: string) => void;
  onToolClick: (toolId: string) => void;
  onProgressUpdate?: () => Promise<void> | void;
  onPracticeCompleted?: (practiceId: string, practiceName: string) => void;
  isRefreshing?: boolean;
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
  // Legacy/alternate IDs
  'hrvb_breathing': 'hrvb',
  'resonance_breathing': 'hrvb',
};

export default function ToolsSidebar({ 
  progress, 
  userId,
  onPracticeClick, 
  onToolClick,
  onProgressUpdate,
  onPracticeCompleted,
  isRefreshing = false
}: ToolsSidebarProps) {
  const [dailyExpanded, setDailyExpanded] = useState(true);
  const [toolsExpanded, setToolsExpanded] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);

  // Initialize modal hooks
  const { open: openResonance, Modal: ResonanceModal } = useResonanceBreathing();
  const { open: openAwarenessRep, Modal: AwarenessRepModal } = useAwarenessRep();

  const currentStagePractices = getStagePractices(progress.currentStage);
  const unlockedTools = getUnlockedOnDemandTools(progress.currentStage);

  const getPracticeStatus = (practiceId: string): 'completed' | 'pending' | 'locked' => {
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

  // Handle "Start Ritual" click - routes to appropriate modal or chat
  const handleStartPractice = (practiceId: string) => {
    if (practiceId === 'hrvb') {
      openResonance();
    } else if (practiceId === 'awareness_rep') {
      openAwarenessRep();
    } else {
      // Other practices go to chat for guidance
      onPracticeClick(practiceId);
    }
  };

  // Handle modal completion - logs practice and notifies chat
  const handleModalComplete = async (practiceId: string, practiceName: string) => {
    console.log(`[ToolsSidebar] Modal completed: ${practiceId}`);
    
    // Only log if not already completed today
    if (getPracticeStatus(practiceId) !== 'completed') {
      await handleMarkComplete(practiceId, practiceName);
    }
  };

  // Handle "Done" button click to mark practice complete
  const handleMarkComplete = async (practiceId: string, practiceName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (!userId) {
      setCompletionError('No user ID - please refresh the page');
      return;
    }
    
    try {
      setCompleting(practiceId);
      setCompletionError(null);

      const dbPracticeType = PRACTICE_ID_MAP[practiceId] || practiceId;
      
      // Get client's local date in YYYY-MM-DD format
      const now = new Date();
      const localDate = now.getFullYear() + '-' + 
        String(now.getMonth() + 1).padStart(2, '0') + '-' + 
        String(now.getDate()).padStart(2, '0');

      console.log('[ToolsSidebar] Logging practice:', { userId, practiceType: dbPracticeType, localDate });

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
      console.log('[ToolsSidebar] Response:', data);

      if (!response.ok || data.error) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      // Wait a moment for database to update
      await new Promise(resolve => setTimeout(resolve, 300));

      // Notify chat that practice was completed
      if (onPracticeCompleted) {
        onPracticeCompleted(practiceId, practiceName);
      } else if (onProgressUpdate) {
        await onProgressUpdate();
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
    <>
      {/* Modals - rendered at top level with onComplete callbacks */}
      <ResonanceModal 
        onComplete={() => handleModalComplete('hrvb', 'Resonance Breathing')} 
      />
      <AwarenessRepModal 
        onComplete={() => handleModalComplete('awareness_rep', 'Awareness Rep')} 
      />

      <aside className="w-80 border-l border-gray-800 bg-[#111111] overflow-y-auto flex-shrink-0">
        <div className="p-4">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white mb-1">Tools</h2>
              {isRefreshing && (
                <RefreshCw className="w-4 h-4 text-[#ff9e19] animate-spin" />
              )}
            </div>
            <p className="text-xs text-gray-400">Stage {progress.currentStage} Rituals & Protocols</p>
            {progress.dataDate && (
              <p className="text-xs text-gray-600 mt-1">Data for: {progress.dataDate}</p>
            )}
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
                <div className="flex items-center justify-center gap-1">
                  <span className="text-lg font-bold text-[#ff9e19]">{progress.consecutiveDays}</span>
                  {progress.consecutiveDays >= 3 && <span className="text-sm">🔥</span>}
                </div>
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
                  
                  // Special handling for Micro-Action
                  const isMicroAction = practice.id === 'micro_action';
                  const hasIdentity = isMicroAction && !!(progress.currentIdentity);
                  const currentIdentity = progress.currentIdentity || '';
                  
                  // Special handling for Flow Block
                  const isFlowBlock = practice.id === 'flow_block';
                  const hasFlowBlockConfig = isFlowBlock && !!(progress.hasFlowBlockConfig);
                  
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
                              {practice.name}
                            </span>
                          </div>
                          
                          {/* Show identity for Micro-Action if set */}
                          {isMicroAction && hasIdentity && (
                            <div className="text-xs text-[#ff9e19]/70 mb-1 truncate" title={currentIdentity}>
                              {currentIdentity}
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-400 mb-2">
                            {isMicroAction 
                              ? (hasIdentity ? '2-5 min' : 'Setup required') 
                              : isFlowBlock
                                ? (hasFlowBlockConfig ? '60-90 min' : 'Setup required')
                                : `${practice.duration} min`
                            }
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            {isMicroAction ? (
                              // MICRO-ACTION SPECIAL BUTTONS
                              hasIdentity ? (
                                // Has identity - show Complete button (logs completion via chat)
                                <>
                                  {!isCompleted && (
                                    <button
                                      onClick={() => handleStartPractice(practice.id)}
                                      disabled={isCompleting}
                                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1 ${
                                        isCompleting
                                          ? 'bg-gray-600 text-gray-400 cursor-wait'
                                          : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30'
                                      }`}
                                    >
                                      {isCompleting ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <Check className="w-3 h-3" />
                                      )}
                                      Mark Complete
                                    </button>
                                  )}
                                  {isCompleted && (
                                    <span className="flex-1 px-2 py-1.5 text-xs text-green-400 flex items-center justify-center gap-1">
                                      <Check className="w-3 h-3" />
                                      Done for today
                                    </span>
                                  )}
                                </>
                              ) : (
                                // No identity - show Setup button
                                <button
                                  onClick={() => handleStartPractice(practice.id)}
                                  className="flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1 bg-[#ff9e19]/20 text-[#ff9e19] hover:bg-[#ff9e19]/30"
                                >
                                  Set Up Identity
                                </button>
                              )
                            ) : isFlowBlock ? (
                              // FLOW BLOCK SPECIAL BUTTONS
                              hasFlowBlockConfig ? (
                                // Has config - show Complete button (logs completion via chat)
                                <>
                                  {!isCompleted && (
                                    <button
                                      onClick={() => handleStartPractice(practice.id)}
                                      disabled={isCompleting}
                                      className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1 ${
                                        isCompleting
                                          ? 'bg-gray-600 text-gray-400 cursor-wait'
                                          : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30'
                                      }`}
                                    >
                                      {isCompleting ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <Check className="w-3 h-3" />
                                      )}
                                      Mark Complete
                                    </button>
                                  )}
                                  {isCompleted && (
                                    <span className="flex-1 px-2 py-1.5 text-xs text-green-400 flex items-center justify-center gap-1">
                                      <Check className="w-3 h-3" />
                                      Done for today
                                    </span>
                                  )}
                                </>
                              ) : (
                                // No config - show Setup button
                                <button
                                  onClick={() => handleStartPractice(practice.id)}
                                  className="flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1 bg-[#ff9e19]/20 text-[#ff9e19] hover:bg-[#ff9e19]/30"
                                >
                                  Set Up Flow Block
                                </button>
                              )
                            ) : (
                              // NORMAL PRACTICE BUTTONS
                              <>
                                {/* Start/Re-run Button - Always visible */}
                                <button
                                  onClick={() => handleStartPractice(practice.id)}
                                  className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1 ${
                                    isCompleted
                                      ? 'bg-gray-600/30 text-gray-400 hover:bg-gray-600/50 hover:text-gray-300'
                                      : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30'
                                  }`}
                                >
                                  {isCompleted && <RotateCcw className="w-3 h-3" />}
                                  {isCompleted ? 'Run Again' : 'Start Ritual'}
                                </button>
                                
                                {/* Done Button - Only show if not completed */}
                                {!isCompleted && (
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
                                )}
                                
                                {/* Completed indicator */}
                                {isCompleted && (
                                  <span className="px-2 py-1.5 text-xs text-green-400 flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                  </span>
                                )}
                              </>
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
                          {tool.name}
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
    </>
  );
}
