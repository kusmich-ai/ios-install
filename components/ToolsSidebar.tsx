// components/ToolsSidebar.tsx
// LUXURY VISUAL UPGRADE - 100% logic preserved, only styling changed
'use client';

import { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Check, 
  Loader2, 
  RefreshCw, 
  RotateCcw,
  ChevronUp,
  Clock,
  Flame,
  // NEW: Lucide icons replacing emojis
  Wind,           // Breathing (was 🫁)
  Eye,            // Awareness (was 👁)
  Activity,       // Somatic Flow (was 🧘‍♂️)
  Zap,            // Micro-action (was ⚡)
  Target,         // Flow block (was 🎯)
  Heart,          // Co-regulation (was 💞)
  Moon,           // Nightly debrief (was 🌙)
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

// NEW: Lucide icon mapping (replaces emoji icons from practice.icon)
const PRACTICE_ICONS: { [key: string]: React.ComponentType<{ className?: string }> } = {
  'hrvb': Wind,
  'awareness_rep': Eye,
  'somatic_flow': Activity,
  'micro_action': Zap,
  'flow_block': Target,
  'co_regulation': Heart,
  'nightly_debrief': Moon,
};

// NEW: Tool icon mapping
const TOOL_ICONS: { [key: string]: React.ComponentType<{ className?: string }> } = {
  'decentering': Layers,
  'meta_reflection': Compass,
  'reframe': RefreshCw,
  'thought_hygiene': Sparkles,
  'worry_loop_dissolver': Sparkles,
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

  // Initialize modal hooks - UNCHANGED
  const { open: openResonance, Modal: ResonanceModal } = useResonanceBreathing();
  const { open: openAwarenessRep, Modal: AwarenessRepModal } = useAwarenessRep();
  const { open: openSomaticFlow, Modal: SomaticFlowModal } = useSomaticFlow();
  const { open: openCoRegulation, Modal: CoRegulationModal } = useCoRegulation();
  const { open: openNightlyDebrief, Modal: NightlyDebriefModal } = useNightlyDebrief();
  const { open: openLoopDeLooping, Modal: LoopDeLoopingModal } = useLoopDeLooping();

  const currentStagePractices = getStagePractices(progress.currentStage);
  const unlockedTools = getUnlockedOnDemandTools(progress.currentStage);

  
const getPracticeStatus = (practiceId: string): 'completed' | 'pending' | 'locked' => {
  const mappedId = PRACTICE_ID_MAP[practiceId] || practiceId;
  const practiceData = progress.dailyPractices?.find(p => p.id === practiceId || p.id === mappedId);
  if (practiceData?.completed) return 'completed';
  return 'pending';
};

  // REMOVED: getStatusIcon - no longer using emoji status icons

  // UNCHANGED: handleStartPractice
  const handleStartPractice = (practiceId: string) => {
    if (practiceId === 'hrvb') {
      openResonance();
    } else if (practiceId === 'awareness_rep') {
      openAwarenessRep();
    } else if (practiceId === 'somatic_flow') {
      openSomaticFlow(); 
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

  // UNCHANGED: handleToolClick
  const handleToolClick = (toolId: string) => {
    if (toolId === 'worry_loop_dissolver') {
      openLoopDeLooping(userId);
    } else {
      // Pass through to parent handler for chat-based tools
      onToolClick(toolId);
    }
  };

  // UNCHANGED: handleModalComplete
  const handleModalComplete = async (practiceId: string, practiceName: string) => {
    console.log(`[ToolsSidebar] Modal completed: ${practiceId}`);
    
    // Only log if not already completed today
    if (getPracticeStatus(practiceId) !== 'completed') {
      await handleMarkComplete(practiceId, practiceName);
    }
  };

  // UNCHANGED: handleMarkComplete (critical functionality)
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
      <SomaticFlowModal 
        onComplete={() => handleModalComplete('somatic_flow', 'Somatic Flow')} 
      />
      <CoRegulationModal 
        onComplete={() => handleModalComplete('co_regulation', 'Co-Regulation Practice')} 
      />
      <NightlyDebriefModal 
        onComplete={() => handleModalComplete('nightly_debrief', 'Nightly Debrief')} 
      />
      <LoopDeLoopingModal />

      {/* =============================================
          LUXURY VISUAL STYLING STARTS HERE
          All logic below is UNCHANGED, only classes
          ============================================= */}
      <aside className="w-80 border-l border-black/5 bg-[#f5f4f2] overflow-y-auto flex-shrink-0">
        <div className="p-4">
          {/* Header - RESTYLED */}
          <div className="mb-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-800 uppercase tracking-wider">Tools</h2>
              {isRefreshing && (
                <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Stage {progress.currentStage} Rituals & Protocols</p>
            {progress.dataDate && (
              <p className="text-xs text-zinc-400 mt-0.5">Data for: {progress.dataDate}</p>
            )}
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

          {/* Adherence Stats - RESTYLED */}
          <div className="mb-4 p-4 rounded-xl bg-white border border-black/[0.04]">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="text-xl font-bold text-amber-600">{progress.adherencePercentage}%</div>
                <div className="text-xs text-zinc-500">14-Day Adherence</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xl font-bold text-amber-600">{progress.consecutiveDays}</span>
                  {progress.consecutiveDays >= 3 && <Flame className="w-4 h-4 text-orange-500" />}
                </div>
                <div className="text-xs text-zinc-500">Day Streak</div>
              </div>
            </div>
          </div>

          {/* Error Display - RESTYLED */}
          {completionError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-xs text-red-600">{completionError}</p>
            </div>
          )}

          {/* Daily Rituals Section - RESTYLED */}
          <div className="mb-6">
            <button
              onClick={() => setDailyExpanded(!dailyExpanded)}
              className="w-full flex items-center justify-between text-xs font-semibold text-zinc-500 uppercase tracking-wider hover:text-zinc-700 transition-colors mb-3"
            >
              <span>DAILY RITUALS</span>
              {dailyExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {dailyExpanded && (
              <div className="space-y-3">
                {currentStagePractices.map((practice) => {
                  const status = getPracticeStatus(practice.id);
                  const isCompleted = status === 'completed';
                  const isCompleting = completing === practice.id;
                  
                  // Get Lucide icon for this practice
                  const PracticeIcon = PRACTICE_ICONS[practice.id] || Zap;
                  
                  // Special handling for Micro-Action - UNCHANGED LOGIC
                  const isMicroAction = practice.id === 'micro_action';
                  const hasIdentity = isMicroAction && !!(progress.currentIdentity);
                  const currentIdentity = progress.currentIdentity || '';
                  const identityDay = progress.identitySprintDay;
                  
                  // Special handling for Flow Block - UNCHANGED LOGIC
                  const isFlowBlock = practice.id === 'flow_block';
                  const hasFlowBlockConfig = isFlowBlock && !!(progress.hasFlowBlockConfig);
                  const flowBlockDay = progress.flowBlockSprintDay;
                  
                  // Special handling for Co-Regulation - UNCHANGED LOGIC
                  const isCoRegulation = practice.id === 'co_regulation';
                  
                  // Special handling for Nightly Debrief - UNCHANGED LOGIC
                  const isNightlyDebrief = practice.id === 'nightly_debrief';
                  
                  return (
                    <div
                      key={practice.id}
                      className={`p-4 rounded-xl transition-all duration-200 ${
                        isCompleted
                          ? 'bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-200/60'
                          : 'bg-white border border-black/[0.04] hover:border-amber-400/30 hover:shadow-lg hover:shadow-amber-500/5'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Lucide Icon instead of emoji */}
                        <div className={`
                          w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                          ${isCompleted 
                            ? 'bg-emerald-100 text-emerald-600' 
                            : 'bg-amber-50 text-amber-600'
                          }
                        `}>
                          {isCompleted ? (
                            <Check className="w-5 h-5" strokeWidth={2.5} />
                          ) : (
                            <PracticeIcon className="w-5 h-5" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-sm font-semibold ${
                              isCompleted ? 'text-emerald-700' : 'text-zinc-800'
                            }`}>
                              {practice.name}
                            </span>
                          </div>
                          
                          {/* Show identity for Micro-Action if set - UNCHANGED LOGIC */}
                          {isMicroAction && hasIdentity && (
                            <div className="text-xs text-amber-600/80 mb-1 truncate" title={currentIdentity}>
                              {currentIdentity}
                            </div>
                          )}
                          
                          {/* Duration/Info line - RESTYLED */}
                          <div className="text-xs text-zinc-500 mb-3 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {isMicroAction 
                              ? (hasIdentity 
                                  ? `Day ${identityDay} of 21 • 2-5 min` 
                                  : 'Setup required')
                              : isFlowBlock
                                ? (hasFlowBlockConfig 
                                    ? `Day ${flowBlockDay} of 21 • 60-90 min` 
                                    : 'Setup required')
                                : isCoRegulation
                                  ? `${practice.duration} min • Evening`
                                  : isNightlyDebrief
                                    ? `${practice.duration} min • Before sleep`
                                    : `${practice.duration} min`
                            }
                          </div>
                          
                          {/* Action Buttons - ALL LOGIC UNCHANGED, only restyled */}
                          <div className="flex gap-2">
                            {isMicroAction ? (
                              // MICRO-ACTION SPECIAL BUTTONS - UNCHANGED LOGIC
                              hasIdentity ? (
                                <>
                                  {!isCompleted && (
                                    <button
                                      onClick={(e) => handleMarkComplete(practice.id, practice.name, e)}
                                      disabled={isCompleting}
                                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
                                        isCompleting
                                          ? 'bg-zinc-100 text-zinc-400 cursor-wait'
                                          : 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/20'
                                      }`}
                                    >
                                      {isCompleting ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <Check className="w-3 h-3" />
                                      )}
                                      Mark Done
                                    </button>
                                  )}
                                  {isCompleted && (
                                    <span className="flex-1 px-3 py-2 text-xs text-emerald-600 font-medium flex items-center justify-center gap-1.5">
                                      <Check className="w-3 h-3" />
                                      Done for today
                                    </span>
                                  )}
                                </>
                              ) : (
                                <button
                                  onClick={() => handleStartPractice(practice.id)}
                                  className="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/20"
                                >
                                  Set Up Aligned Action
                                </button>
                              )
                            ) : isFlowBlock ? (
                              // FLOW BLOCK SPECIAL BUTTONS - UNCHANGED LOGIC
                              hasFlowBlockConfig ? (
                                <>
                                  {!isCompleted && (
                                    <button
                                      onClick={(e) => handleMarkComplete(practice.id, practice.name, e)}
                                      disabled={isCompleting}
                                      className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
                                        isCompleting
                                          ? 'bg-zinc-100 text-zinc-400 cursor-wait'
                                          : 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/20'
                                      }`}
                                    >
                                      {isCompleting ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <Check className="w-3 h-3" />
                                      )}
                                      Mark Done
                                    </button>
                                  )}
                                  {isCompleted && (
                                    <span className="flex-1 px-3 py-2 text-xs text-emerald-600 font-medium flex items-center justify-center gap-1.5">
                                      <Check className="w-3 h-3" />
                                      Flow Block Complete
                                    </span>
                                  )}
                                </>
                              ) : (
                                <button
                                  onClick={() => handleStartPractice(practice.id)}
                                  className="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/20"
                                >
                                  Set Up Flow Block
                                </button>
                              )
                            ) : isCoRegulation || isNightlyDebrief ? (
                              // CO-REGULATION AND NIGHTLY DEBRIEF BUTTONS - UNCHANGED LOGIC
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
                                      Run Again
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
                                      {isCompleted ? 'Run Again' : 'Start Ritual'}
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
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* On-Demand Tools Section - RESTYLED */}
          <div>
            <button
              onClick={() => setToolsExpanded(!toolsExpanded)}
              className="w-full flex items-center justify-between text-xs font-semibold text-zinc-500 uppercase tracking-wider hover:text-zinc-700 transition-colors mb-3"
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
    <p className="text-xs text-gray-500 italic mb-3">
      Tools don't fix states. They restore clarity when interpretation is distorting signal.
    </p>
    {unlockedTools.map((tool) => {
                  const ToolIcon = TOOL_ICONS[tool.id] || Sparkles;
                  
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleToolClick(tool.id)}
                      className="w-full text-left p-3 rounded-xl bg-white border border-black/[0.04] hover:border-amber-400/30 hover:shadow-md hover:shadow-amber-500/5 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-colors">
                          <ToolIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
  <div className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 mb-0.5">
    {tool.name}
  </div>
  <div className="text-xs text-zinc-500">
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
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
