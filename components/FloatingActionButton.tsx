// components/FloatingActionButton.tsx
'use client';

import { useState } from 'react';
import { Zap, X, Check, Loader2, RefreshCw, RotateCcw } from 'lucide-react';
import { getStagePractices, getUnlockedOnDemandTools } from '@/app/config/stages';
import type { UserProgress } from '@/app/hooks/useUserProgress';
import { useResonanceBreathing } from '@/components/ResonanceModal';
import { useAwarenessRep } from '@/components/AwarenessRepModal';
import { useCoRegulation } from '@/components/CoRegulationModal';
import { useNightlyDebrief } from '@/components/NightlyDebriefModal';

interface FloatingActionButtonProps {
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

  // Initialize modal hooks
  const { open: openResonance, Modal: ResonanceModal } = useResonanceBreathing();
  const { open: openAwarenessRep, Modal: AwarenessRepModal } = useAwarenessRep();
  const { open: openCoRegulation, Modal: CoRegulationModal } = useCoRegulation();
  const { open: openNightlyDebrief, Modal: NightlyDebriefModal } = useNightlyDebrief();

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

  // Handle "Start Ritual" click - routes to appropriate modal or chat
  const handleStartPractice = (practiceId: string) => {
    if (practiceId === 'hrvb') {
      openResonance();
      setIsOpen(false);
    } else if (practiceId === 'awareness_rep') {
      openAwarenessRep();
      setIsOpen(false);
    } else if (practiceId === 'co_regulation') {
      openCoRegulation();
      setIsOpen(false);
    } else if (practiceId === 'nightly_debrief') {
      openNightlyDebrief();
      setIsOpen(false);
    } else if (practiceId === 'micro_action' || practiceId === 'flow_block') {
      // Special practices route to tool click handler for guided flows
      onToolClick(practiceId);
      setIsOpen(false);
    } else {
      // Other practices go to chat for guidance
      onPracticeClick(practiceId);
      setIsOpen(false);
    }
  };

  // Handle modal completion - logs practice and notifies chat
  const handleModalComplete = async (practiceId: string, practiceName: string) => {
    console.log(`[FloatingActionButton] Modal completed: ${practiceId}`);
    
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

      // Wait a moment for database to update
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
      {/* Modals - rendered at top level with onComplete callbacks */}
      <ResonanceModal 
        onComplete={() => handleModalComplete('hrvb', 'Resonance Breathing')} 
      />
      <AwarenessRepModal 
        onComplete={() => handleModalComplete('awareness_rep', 'Awareness Rep')} 
      />
      <CoRegulationModal 
        onComplete={() => handleModalComplete('co_regulation', 'Co-Regulation Practice')} 
      />
      <NightlyDebriefModal 
        onComplete={() => handleModalComplete('nightly_debrief', 'Nightly Debrief')} 
      />

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
              <div>
                <h3 className="text-lg font-bold text-white">Tools</h3>
                <p className="text-xs text-gray-400">Stage {progress.currentStage}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
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
            </div>

            {/* Error Display */}
            {completionError && (
              <div className="mb-4 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-xs text-red-400">{completionError}</p>
              </div>
            )}

            {/* Daily Rituals */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-400 mb-2">
                DAILY RITUALS
              </div>
              <div className="space-y-2">
                {currentStagePractices.map((practice) => {
                  const status = getPracticeStatus(practice.id);
                  const isCompleted = status === 'completed';
                  const isCompleting = completing === practice.id;
                  
                  // Special handling for Micro-Action
                  const isMicroAction = practice.id === 'micro_action';
                  const hasIdentity = isMicroAction && !!(progress.currentIdentity);
                  
                  // Special handling for Flow Block
                  const isFlowBlock = practice.id === 'flow_block';
                  const hasFlowBlockConfig = isFlowBlock && !!(progress.hasFlowBlockConfig);
                  
                  // Special handling for Co-Regulation and Nightly Debrief
                  const isCoRegulation = practice.id === 'co_regulation';
                  const isNightlyDebrief = practice.id === 'nightly_debrief';
                  
                  return (
                    <div
                      key={practice.id}
                      className={`p-3 rounded-lg ${
                        isCompleted
                          ? 'bg-green-500/10 border border-green-500/20'
                          : 'bg-[#0a0a0a] border border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{practice.icon}</span>
                        <span className="text-xs">{getStatusIcon(status)}</span>
                        <span className={`text-sm font-medium flex-1 ${
                          isCompleted ? 'text-green-400' : 'text-white'
                        }`}>
                          {practice.shortName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {isCoRegulation ? 'Evening' : isNightlyDebrief ? 'Night' : `${practice.duration}m`}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        {isMicroAction ? (
                          // MICRO-ACTION SPECIAL BUTTONS
                          hasIdentity ? (
                            // Has identity - show Mark Complete button
                            <>
                              {!isCompleted && (
                                <button
                                  onClick={(e) => {
                                    handleMarkComplete(practice.id, practice.name, e);
                                    setIsOpen(false);
                                  }}
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
                                  Complete Today's Micro-Action
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
                              onClick={() => {
                                handleStartPractice(practice.id);
                                setIsOpen(false);
                              }}
                              className="flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1 bg-[#ff9e19]/20 text-[#ff9e19] hover:bg-[#ff9e19]/30"
                            >
                              Set Up Identity
                            </button>
                          )
                        ) : isFlowBlock ? (
                          // FLOW BLOCK SPECIAL BUTTONS
                          hasFlowBlockConfig ? (
                            // Has config - show Mark Complete button
                            <>
                              {!isCompleted && (
                                <button
                                  onClick={(e) => {
                                    handleMarkComplete(practice.id, practice.name, e);
                                    setIsOpen(false);
                                  }}
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
                                  Complete Today's Block
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
                              onClick={() => {
                                handleStartPractice(practice.id);
                                setIsOpen(false);
                              }}
                              className="flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1 bg-[#ff9e19]/20 text-[#ff9e19] hover:bg-[#ff9e19]/30"
                            >
                              Set Up Flow Block
                            </button>
                          )
                        ) : isCoRegulation || isNightlyDebrief ? (
                          // CO-REGULATION AND NIGHTLY DEBRIEF BUTTONS
                          <>
                            {!isCompleted && (
                              <button
                                onClick={() => handleStartPractice(practice.id)}
                                className="flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
                              >
                                Start Ritual
                              </button>
                            )}
                            {isCompleted && (
                              <>
                                <button
                                  onClick={() => handleStartPractice(practice.id)}
                                  className="flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1 bg-gray-600/30 text-gray-400 hover:bg-gray-600/50 hover:text-gray-300"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  Run Again
                                </button>
                                <span className="px-2 py-1.5 text-xs text-green-400 flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                </span>
                              </>
                            )}
                          </>
                        ) : (
                          // NORMAL PRACTICE BUTTONS
                          (() => {
                            // Practices with working modals that auto-log on completion
                            const hasWorkingModal = practice.id === 'hrvb' || practice.id === 'awareness_rep';
                            
                            return (
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
                                
                                {/* Done Button - Only show for practices WITHOUT working modals (e.g., somatic_flow) */}
                                {!isCompleted && !hasWorkingModal && (
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
                            );
                          })()
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ON-DEMAND TOOLS */}
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
                      <div className="flex-1">
                        <span className="text-sm font-medium text-white">
                          {tool.name}
                        </span>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {tool.description}
                        </div>
                      </div>
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
