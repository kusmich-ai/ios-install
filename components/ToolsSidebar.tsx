// components/ToolsSidebar.tsx
'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Check, Loader2, RefreshCw, RotateCcw } from 'lucide-react';
import { getStagePractices, getUnlockedOnDemandTools } from '@/app/config/stages';
import type { UserProgress } from '@/app/hooks/useUserProgress';
import { useResonanceBreathing } from '@/components/ResonanceModal';
import { useAwarenessRep } from '@/components/AwarenessRepModal';
import { useCoRegulation } from '@/components/CoRegulationModal';
import { useNightlyDebrief } from '@/components/NightlyDebriefModal';

interface ToolsSidebarProps {
  progress: UserProgress;
  userId?: string;
  onPracticeClick: (practiceId: string) => void;
  onToolClick: (toolId: string) => void;
  onProgressUpdate?: () => void;
  onPracticeCompleted?: (practiceId: string) => void;
  isRefreshing?: boolean;
}

// Map from your config practice IDs to the database practice_type values
const PRACTICE_ID_MAP: { [key: string]: string } = {
  'hrvb': 'hrvb',
  'awareness_rep': 'awareness_rep',
  'somatic_flow': 'somatic_flow',
  'micro_action': 'micro_action',
  'flow_block': 'flow_block',
  'co_regulation': 'co_regulation',
  'nightly_debrief': 'nightly_debrief',
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
  const { open: openCoRegulation, Modal: CoRegulationModal } = useCoRegulation();
  const { open: openNightlyDebrief, Modal: NightlyDebriefModal } = useNightlyDebrief();

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

  // Handle modal completion - logs practice and triggers refresh
  const handleModalComplete = async (practiceId: string, practiceName: string) => {
    console.log(`[ToolsSidebar] ${practiceName} completed via modal`);
    
    if (onPracticeCompleted) {
      onPracticeCompleted(practiceId);
    }
    
    if (onProgressUpdate) {
      setTimeout(() => onProgressUpdate(), 500);
    }
  };

  // Handle "Start Ritual" click - routes to appropriate modal or chat
  const handleStartPractice = (practiceId: string) => {
    if (practiceId === 'hrvb') {
      openResonance();
    } else if (practiceId === 'awareness_rep') {
      openAwarenessRep();
    } else if (practiceId === 'co_regulation') {
      openCoRegulation();
    } else if (practiceId === 'nightly_debrief') {
      openNightlyDebrief();
    } else if (practiceId === 'micro_action' || practiceId === 'flow_block') {
      // Special practices route to tool click handler for guided flows
      onToolClick(practiceId);
    } else {
      // Other practices go to chat for guidance
      onPracticeClick(practiceId);
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
          userId: userId,
          practiceType: dbPracticeType,
          completed: true
        })
      });

      const data = await response.json();
      console.log('[ToolsSidebar] Response:', data);

      if (!response.ok || data.error) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      if (onPracticeCompleted) {
        onPracticeCompleted(practiceId);
      }

      if (onProgressUpdate) {
        onProgressUpdate();
      } else {
        setTimeout(() => window.location.reload(), 500);
      }

    } catch (err) {
      console.error('[ToolsSidebar] Error completing practice:', err);
      setCompletionError(err instanceof Error ? err.message : 'Failed to complete');
    } finally {
      setCompleting(null);
    }
  };

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

      <aside className="w-80 bg-[#111111] border-l border-gray-800 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header with refresh */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Today&apos;s Practices</h2>
            {onProgressUpdate && (
              <button
                onClick={onProgressUpdate}
                disabled={isRefreshing}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh progress"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>

          {/* Error display */}
          {completionError && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
              {completionError}
              <button 
                onClick={() => setCompletionError(null)}
                className="ml-2 text-red-400 hover:text-red-200"
              >
                ✕
              </button>
            </div>
          )}

          {/* Daily Practices Section */}
          <div>
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
                  const showMarkComplete = practice.id === 'micro_action' || practice.id === 'flow_block' || practice.id === 'somatic_flow';

                  return (
                    <div
                      key={practice.id}
                      className={`p-3 rounded-lg border transition-all ${
                        isCompleted
                          ? 'bg-green-900/20 border-green-700/50'
                          : 'bg-[#0a0a0a] border-gray-700 hover:border-[#ff9e19]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{practice.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-white">
                              {practice.shortName}
                            </span>
                            <span className="text-xs">{getStatusIcon(status)}</span>
                          </div>
                          <div className="text-xs text-gray-400 mb-2">
                            {practice.duration}
                          </div>
                          <div className="flex items-center gap-2">
                            {!isCompleted && (
                              <>
                                <button
                                  onClick={() => handleStartPractice(practice.id)}
                                  className="px-3 py-1.5 text-xs font-medium bg-[#ff9e19] text-black rounded-lg hover:bg-[#ffb347] transition-colors"
                                >
                                  Start
                                </button>
                                {showMarkComplete && (
                                  <button
                                    onClick={(e) => handleMarkComplete(practice.id, e)}
                                    disabled={isCompleting || isRefreshing}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                                      isCompleting || isRefreshing
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
    </>
  );
}
