// components/FloatingActionButton.tsx
// LUXURY VISUAL UPGRADE - 100% logic preserved, only styling changed
'use client';

import { useState } from 'react';
import { 
  Zap, 
  X, 
  Check, 
  Loader2, 
  RefreshCw, 
  RotateCcw,
  Clock,
  Flame,
  // Lucide icons replacing emojis
  Wind,           // Breathing
  Eye,            // Awareness
  Activity,       // Somatic Flow
  Target,         // Flow block
  Heart,          // Co-regulation
  Moon,           // Nightly debrief
  Layers,         // Decentering
  Compass,        // Meta-reflection
  Sparkles,       // Thought hygiene / Loop dissolver
} from 'lucide-react';
import { getStagePractices, getUnlockedOnDemandTools } from '@/app/config/stages';
import type { UserProgress } from '@/app/hooks/useUserProgress';
import { useResonanceBreathing } from '@/components/ResonanceModal';
import { useAwarenessRep } from '@/components/AwarenessRepModal';
import { useSomaticFlow } from '@/components/SomaticFlowModal';
import { useCoRegulation } from '@/components/CoRegulationModal';
import { useNightlyDebrief } from '@/components/NightlyDebriefModal';
import { useLoopDeLooping } from '@/components/LoopDeLoopingModal';

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

// Lucide icon mapping (replaces emoji icons)
const PRACTICE_ICONS: { [key: string]: React.ComponentType<{ className?: string }> } = {
  'hrvb': Wind,
  'awareness_rep': Eye,
  'somatic_flow': Activity,
  'micro_action': Zap,
  'flow_block': Target,
  'co_regulation': Heart,
  'nightly_debrief': Moon,
};

// Tool icon mapping
const TOOL_ICONS: { [key: string]: React.ComponentType<{ className?: string }> } = {
  'decentering': Layers,
  'meta_reflection': Compass,
  'reframe': RefreshCw,
  'thought_hygiene': Sparkles,
  'worry_loop_dissolver': Sparkles,
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

  // Initialize modal hooks - UNCHANGED
  const { open: openResonance, Modal: ResonanceModal } = useResonanceBreathing();
  const { open: openAwarenessRep, Modal: AwarenessRepModal } = useAwarenessRep();
  const { open: openSomaticFlow, Modal: SomaticFlowModal } = useSomaticFlow();
  const { open: openCoRegulation, Modal: CoRegulationModal } = useCoRegulation();
  const { open: openNightlyDebrief, Modal: NightlyDebriefModal } = useNightlyDebrief();
  const { open: openLoopDeLooping, Modal: LoopDeLoopingModal } = useLoopDeLooping();

  const currentStagePractices = getStagePractices(progress.currentStage);
  const unlockedTools = getUnlockedOnDemandTools(progress.currentStage);

  // UNCHANGED: getPracticeStatus
  // CORRECT:
const getPracticeStatus = (practiceId: string): 'completed' | 'pending' => {
  const mappedId = PRACTICE_ID_MAP[practiceId] || practiceId;
  const practiceData = progress.dailyPractices?.find(p => p.id === practiceId || p.id === mappedId);
  if (practiceData?.completed) return 'completed';
  return 'pending';
};

  // UNCHANGED: handleStartPractice
  const handleStartPractice = (practiceId: string) => {
    if (practiceId === 'hrvb') {
      openResonance();
      setIsOpen(false);
    } else if (practiceId === 'awareness_rep') {
      openAwarenessRep();
      setIsOpen(false);
    } else if (practiceId === 'somatic_flow') {
      openSomaticFlow();
      setIsOpen(false);
    } else if (practiceId === 'co_regulation') {
      openCoRegulation();
      setIsOpen(false);
    } else if (practiceId === 'nightly_debrief') {
      openNightlyDebrief();
      setIsOpen(false);
    } else if (practiceId === 'micro_action' || practiceId === 'flow_block') {
      onToolClick(practiceId);
      setIsOpen(false);
    } else {
      onPracticeClick(practiceId);
      setIsOpen(false);
    }
  };

  // UNCHANGED: handleModalComplete
  const handleModalComplete = async (practiceId: string, practiceName: string) => {
    console.log(`[FloatingActionButton] Modal completed: ${practiceId}`);
    
    if (getPracticeStatus(practiceId) !== 'completed') {
      await handleMarkComplete(practiceId, practiceName);
    }
  };

  // UNCHANGED: handleMarkComplete
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

      await new Promise(resolve => setTimeout(resolve, 300));

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

  // UNCHANGED: handleToolClick
  const handleToolClick = (toolId: string) => {
    if (toolId === 'worry_loop_dissolver') {
      openLoopDeLooping(userId);
      setIsOpen(false);
    } else {
      onToolClick(toolId);
      setIsOpen(false);
    }
  };

  // UNCHANGED: Calculate completion stats
  const completedCount = currentStagePractices.filter(p => getPracticeStatus(p.id) === 'completed').length;
  const totalCount = currentStagePractices.length;
  const allComplete = completedCount === totalCount;

  return (
    <>
      {/* Modals - UNCHANGED */}
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
      <SomaticFlowModal 
        onComplete={() => handleModalComplete('somatic_flow', 'Somatic Flow')} 
      />
      <LoopDeLoopingModal />

      {/* Overlay - RESTYLED */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* =============================================
          LUXURY VISUAL STYLING - Floating Menu
          ============================================= */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 w-80 max-h-[70vh] overflow-y-auto bg-[#f5f4f2] border border-black/10 rounded-2xl shadow-2xl z-50">
          <div className="p-4">
            {/* Header - RESTYLED */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-800 uppercase tracking-wider">Tools</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Stage {progress.currentStage}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-black/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Summary - RESTYLED */}
            <div className={`mb-4 p-4 rounded-xl border ${
              allComplete 
                ? 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200/60' 
                : 'bg-white border-black/[0.04]'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-500">Today's Progress</span>
                <span className={`text-sm font-bold ${allComplete ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {completedCount}/{totalCount}
                </span>
              </div>
              <div className="w-full h-1.5 bg-black/[0.04] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    allComplete 
                      ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' 
                      : 'bg-gradient-to-r from-amber-400 to-amber-500'
                  }`}
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
              {allComplete && (
                <p className="text-xs text-emerald-600 mt-2 text-center font-medium">All rituals complete! ✓</p>
              )}
            </div>

            {/* Error Display - RESTYLED */}
            {completionError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-xs text-red-600">{completionError}</p>
              </div>
            )}

            {/* Daily Rituals - RESTYLED */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                DAILY RITUALS
              </div>
              <div className="space-y-2">
                {currentStagePractices.map((practice) => {
                  const status = getPracticeStatus(practice.id);
                  const isCompleted = status === 'completed';
                  const isCompleting = completing === practice.id;
                  
                  // Get Lucide icon
                  const PracticeIcon = PRACTICE_ICONS[practice.id] || Zap;
                  
                  // Special handling - UNCHANGED LOGIC
                  const isMicroAction = practice.id === 'micro_action';
                  const hasIdentity = isMicroAction && !!(progress.currentIdentity);
                  
                  const isFlowBlock = practice.id === 'flow_block';
                  const hasFlowBlockConfig = isFlowBlock && !!(progress.hasFlowBlockConfig);
                  
                  const isCoRegulation = practice.id === 'co_regulation';
                  const isNightlyDebrief = practice.id === 'nightly_debrief';
                  
                  return (
                    <div
                      key={practice.id}
                      className={`p-3 rounded-xl transition-all duration-200 ${
                        isCompleted
                          ? 'bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-200/60'
                          : 'bg-white border border-black/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {/* Lucide Icon */}
                        <div className={`
                          w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                          ${isCompleted 
                            ? 'bg-emerald-100 text-emerald-600' 
                            : 'bg-amber-50 text-amber-600'
                          }
                        `}>
                          {isCompleted ? (
                            <Check className="w-4 h-4" strokeWidth={2.5} />
                          ) : (
                            <PracticeIcon className="w-4 h-4" />
                          )}
                        </div>
                        
                        <span className={`text-sm font-semibold flex-1 ${
                          isCompleted ? 'text-emerald-700' : 'text-zinc-800'
                        }`}>
                          {practice.shortName}
                        </span>
                        
                        <span className="text-xs text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {isCoRegulation ? 'Eve' : isNightlyDebrief ? 'Night' : `${practice.duration}m`}
                        </span>
                      </div>
                      
                      {/* Action Buttons - ALL LOGIC UNCHANGED, only restyled */}
                      <div className="flex gap-2">
                        {isMicroAction ? (
                          // MICRO-ACTION SPECIAL BUTTONS - UNCHANGED LOGIC
                          hasIdentity ? (
                            <>
                              {!isCompleted && (
                                <button
                                  onClick={(e) => {
                                    handleMarkComplete(practice.id, practice.name, e);
                                    setIsOpen(false);
                                  }}
                                  disabled={isCompleting}
                                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
                                    isCompleting
                                      ? 'bg-zinc-100 text-zinc-400 cursor-wait'
                                      : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-500/20'
                                  }`}
                                >
                                  {isCompleting ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Check className="w-3 h-3" />
                                  )}
                                  Complete
                                </button>
                              )}
                              {isCompleted && (
                                <span className="flex-1 px-3 py-2 text-xs text-emerald-600 font-medium flex items-center justify-center gap-1.5">
                                  <Check className="w-3 h-3" />
                                  Done
                                </span>
                              )}
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                handleStartPractice(practice.id);
                                setIsOpen(false);
                              }}
                              className="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/20"
                            >
                              Set Up Identity
                            </button>
                          )
                        ) : isFlowBlock ? (
                          // FLOW BLOCK SPECIAL BUTTONS - UNCHANGED LOGIC
                          hasFlowBlockConfig ? (
                            <>
                              {!isCompleted && (
                                <button
                                  onClick={(e) => {
                                    handleMarkComplete(practice.id, practice.name, e);
                                    setIsOpen(false);
                                  }}
                                  disabled={isCompleting}
                                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
                                    isCompleting
                                      ? 'bg-zinc-100 text-zinc-400 cursor-wait'
                                      : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-500/20'
                                  }`}
                                >
                                  {isCompleting ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Check className="w-3 h-3" />
                                  )}
                                  Complete
                                </button>
                              )}
                              {isCompleted && (
                                <span className="flex-1 px-3 py-2 text-xs text-emerald-600 font-medium flex items-center justify-center gap-1.5">
                                  <Check className="w-3 h-3" />
                                  Done
                                </span>
                              )}
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                handleStartPractice(practice.id);
                                setIsOpen(false);
                              }}
                              className="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/20"
                            >
                              Set Up Flow Block
                            </button>
                          )
                        ) : isCoRegulation || isNightlyDebrief ? (
                          // CO-REGULATION AND NIGHTLY DEBRIEF - UNCHANGED LOGIC
                          <>
                            {!isCompleted && (
                              <button
                                onClick={() => handleStartPractice(practice.id)}
                                className="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/20"
                              >
                                Start Ritual
                              </button>
                            )}
                            {isCompleted && (
                              <>
                                <button
                                  onClick={() => handleStartPractice(practice.id)}
                                  className="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  Again
                                </button>
                                <span className="px-2 py-2 text-xs text-emerald-600 flex items-center gap-1">
                                  <Check className="w-4 h-4" />
                                </span>
                              </>
                            )}
                          </>
                        ) : (
                          // NORMAL PRACTICE BUTTONS - UNCHANGED LOGIC
                          (() => {
                            const hasWorkingModal = practice.id === 'hrvb' || practice.id === 'awareness_rep' || practice.id === 'somatic_flow';
                            
                            return (
                              <>
                                <button
                                  onClick={() => handleStartPractice(practice.id)}
                                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
                                    isCompleted
                                      ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                      : 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/20'
                                  }`}
                                >
                                  {isCompleted && <RotateCcw className="w-3 h-3" />}
                                  {isCompleted ? 'Again' : 'Start'}
                                </button>
                                
                                {!isCompleted && !hasWorkingModal && (
                                  <button
                                    onClick={(e) => handleMarkComplete(practice.id, practice.name, e)}
                                    disabled={isCompleting}
                                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                                      isCompleting
                                        ? 'bg-zinc-100 text-zinc-400 cursor-wait'
                                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
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
                                
                                {isCompleted && (
                                  <span className="px-2 py-2 text-xs text-emerald-600 flex items-center gap-1">
                                    <Check className="w-4 h-4" />
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

            {/* ON-DEMAND TOOLS - RESTYLED */}
            <div>
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                ON-DEMAND TOOLS
              </div>
              <div className="space-y-2">
                {unlockedTools.map((tool) => {
                  const ToolIcon = TOOL_ICONS[tool.id] || Sparkles;
                  
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleToolClick(tool.id)}
                      className="w-full text-left p-3 rounded-xl bg-white border border-black/[0.04] hover:border-amber-400/30 hover:shadow-md hover:shadow-amber-500/5 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-colors">
                          <ToolIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
  <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 block">
    {tool.name}
  </span>
  <div className="text-xs text-zinc-500 mt-0.5">
    {tool.description}
  </div>
  {tool.when && (
    <div className="text-xs text-amber-600/70 mt-1 italic">
      {tool.when}
    </div>
  )}
</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAB Button - RESTYLED */}
<button
  onClick={() => setIsOpen(!isOpen)}
  className={`
    fixed bottom-20 right-4 h-14 rounded-full shadow-xl flex items-center justify-center z-30
    transition-all duration-300
    ${isOpen 
      ? 'bg-zinc-800 w-14' 
      : 'bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-500/30 px-5 gap-2'
    }
  `}
>
  {isOpen ? (
    <X className="w-6 h-6 text-white" />
  ) : (
    <>
      <Zap className="w-5 h-5 text-white" />
      <span className="text-sm font-semibold text-white">Rituals</span>
    </>
  )}
</button>
    </>
  );
}
