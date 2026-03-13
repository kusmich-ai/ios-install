// components/FloatingActionButton.tsx
// v2.5: CuePhaseCard integration for 3-phase Cue ritual
// v2.6: Awareness Rep 11-script rotation system
// Bottom-right pill ABOVE input area, says "Rituals"
// White pill with amber icon - pops against dark bg, distinct from amber chat elements
'use client';

import { useState } from 'react';
import { 
  Zap, X, Check, Loader2, RefreshCw, RotateCcw, Clock, Flame,
  Wind, Eye, Activity, Target, Heart, Moon, Layers, Waves, Compass, Sparkles,
} from 'lucide-react';
import { getScheduledPracticesForDate, getUnlockedOnDemandTools } from '@/app/config/stages';
import type { UserProgress } from '@/app/hooks/useUserProgress';
import { useResonanceBreathing } from '@/components/ResonanceModal';
import { useAwarenessRep } from '@/components/AwarenessRepModal';
import { useSomaticFlow } from '@/components/SomaticFlowModal';
import CuePhaseCard from './CuePhaseCard';
import { useCoRegulation } from '@/components/CoRegulationModal';
import { useNightlyDebrief } from '@/components/NightlyDebriefModal';
import { useLoopDeLooping } from '@/components/LoopDeLoopingModal';
import { useNosGlide } from '@/components/NosGlideModal';
// v2.6: Awareness Rep rotation
import { 
  getNextScript, 
  getScriptAudioPath, 
  getScriptInfo,
  type AwarenessRepScript 
} from '@/lib/awarenessRepRotation';

interface FloatingActionButtonProps {
  progress: UserProgress;
  userId: string;
  onPracticeClick: (practiceId: string) => void;
  onToolClick: (toolId: string) => void;
  onProgressUpdate?: () => Promise<void> | void;
  onPracticeCompleted?: (practiceId: string, practiceName: string) => void;
isRefreshing?: boolean;
  onInstallClick?: () => void;
}

const PRACTICE_ID_MAP: { [key: string]: string } = {
  'hrvb': 'hrvb', 'awareness_rep': 'awareness_rep', 'somatic_flow': 'somatic_flow',
  'micro_action': 'micro_action', 'flow_block': 'flow_block',
  'co_regulation': 'co_regulation', 'nightly_debrief': 'nightly_debrief',
};

const PRACTICE_ICONS: { [key: string]: React.ComponentType<{ className?: string }> } = {
  'hrvb': Wind, 'awareness_rep': Eye, 'somatic_flow': Activity,
  'micro_action': Zap, 'flow_block': Target, 'co_regulation': Heart, 'nightly_debrief': Moon,
};

const TOOL_ICONS: { [key: string]: React.ComponentType<{ className?: string }> } = {
  'decentering': Layers, 'nos_glide': Waves, 'meta_reflection': Compass, 'reframe': RefreshCw,
  'thought_hygiene': Sparkles, 'worry_loop_dissolver': Sparkles,
};

// ============================================
// STAGE 2 TEASER PANEL
// ============================================
function Stage2TeaserPanel({ unlockEligible, onInstallClick }: { unlockEligible: boolean; onInstallClick?: () => void }) {
  return (
    <div className={`rounded-xl p-4 border transition-all duration-500 ${
      unlockEligible
        ? 'bg-emerald-950/20 border-emerald-500/60'
        : 'bg-zinc-900/[0.03] border-amber-400/40'
    }`}>
      <p className={`text-[10px] font-semibold uppercase tracking-widest mb-2 ${
        unlockEligible ? 'text-emerald-600' : 'text-amber-500/80'
      }`}>
        Stage 2: Embodied Mode
      </p>
      <div className={`h-px mb-3 ${unlockEligible ? 'bg-emerald-500/30' : 'bg-amber-400/20'}`} />
      <p className="text-xs text-zinc-500 mb-3 leading-relaxed">
        {unlockEligible ? 'Ready to install.' : 'Coming when you\'re ready.'}
      </p>
      <p className="text-xs text-zinc-400 italic leading-relaxed">
        &quot;When coherence stops living in your head and starts living in your body.&quot;
      </p>
    {unlockEligible && (
        <div className="mt-3 pt-3 border-t border-emerald-500/20">
          <button onClick={onInstallClick} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
            Install now →
          </button>
        </div>
      )}
    </div>
  );
}

export default function FloatingActionButton({
  progress, userId, onPracticeClick, onToolClick,
  onProgressUpdate, onPracticeCompleted, isRefreshing = false,
  onInstallClick
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [completing, setCompleting] = useState<string | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);

  // v2.6: Track which awareness rep script is currently being played
  const [currentAwarenessScript, setCurrentAwarenessScript] = useState<AwarenessRepScript | null>(null);

  const { open: openResonance, Modal: ResonanceModal } = useResonanceBreathing();
  const { open: openAwarenessRep, Modal: AwarenessRepModal } = useAwarenessRep();
  const { open: openSomaticFlow, Modal: SomaticFlowModal } = useSomaticFlow();
  const { open: openCoRegulation, Modal: CoRegulationModal } = useCoRegulation();
  const { open: openNightlyDebrief, Modal: NightlyDebriefModal } = useNightlyDebrief();
  const { open: openLoopDeLooping, Modal: LoopDeLoopingModal } = useLoopDeLooping();
  const { open: openNosGlide, Modal: NosGlideModal } = useNosGlide();

  const currentStagePractices = getScheduledPracticesForDate(progress.currentStage);
  const unlockedTools = getUnlockedOnDemandTools(progress.currentStage);

  const getPracticeStatus = (practiceId: string): 'completed' | 'pending' => {
    const mappedId = PRACTICE_ID_MAP[practiceId] || practiceId;
    const practiceData = progress.dailyPractices?.find(p => p.id === practiceId || p.id === mappedId);
    if (practiceData?.completed) return 'completed';
    return 'pending';
  };

  // UPDATED: handleStartPractice — awareness_rep now uses rotation
  const handleStartPractice = (practiceId: string) => {
    if (practiceId === 'hrvb') { openResonance(); setIsOpen(false); }
    else if (practiceId === 'awareness_rep') {
      // v2.6: Compute next script in rotation, pass audio path to modal
      const lastScript = progress.lastAwarenessRepScript as AwarenessRepScript | null;
      const nextScript = getNextScript(progress.currentStage, lastScript);
      const audioPath = getScriptAudioPath(nextScript);
      setCurrentAwarenessScript(nextScript);
      console.log(`[FAB] Awareness Rep rotation: ${nextScript} (${getScriptInfo(nextScript).name})`);
      openAwarenessRep(audioPath);
      setIsOpen(false);
    }
    else if (practiceId === 'somatic_flow') { openSomaticFlow(); setIsOpen(false); }
    else if (practiceId === 'co_regulation') { openCoRegulation(); setIsOpen(false); }
    else if (practiceId === 'nightly_debrief') { openNightlyDebrief(); setIsOpen(false); }
    else if (practiceId === 'micro_action' || practiceId === 'flow_block') { onToolClick(practiceId); setIsOpen(false); }
    else { onPracticeClick(practiceId); setIsOpen(false); }
  };

  // UPDATED: handleModalComplete — saves awareness rep rotation after completion
  const handleModalComplete = async (practiceId: string, practiceName: string) => {
    console.log(`[FloatingActionButton] Modal completed: ${practiceId}`);
    if (getPracticeStatus(practiceId) !== 'completed') {
      await handleMarkComplete(practiceId, practiceName);
    }

    // v2.6: After awareness rep completes, save which script was played
    if (practiceId === 'awareness_rep' && currentAwarenessScript) {
      try {
        await fetch('/api/practices/update-awareness-rep-script', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, script: currentAwarenessScript }),
        });
        console.log(`[FAB] Awareness Rep rotation saved: ${currentAwarenessScript}`);
      } catch (err) {
        console.error('[FAB] Failed to save awareness rep rotation:', err);
      }
    }
  };

  const handleMarkComplete = async (practiceId: string, practiceName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!userId) { setCompletionError('No user ID - please refresh the page'); return; }
    
    try {
      setCompleting(practiceId);
      setCompletionError(null);
      const dbPracticeType = PRACTICE_ID_MAP[practiceId] || practiceId;
      const now = new Date();
      const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      const response = await fetch('/api/practices/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, practiceType: dbPracticeType, completed: true, localDate })
      });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || `HTTP ${response.status}`);

      await new Promise(resolve => setTimeout(resolve, 300));
      if (onPracticeCompleted) onPracticeCompleted(practiceId, practiceName);
      else if (onProgressUpdate) await onProgressUpdate();
    } catch (err) {
      console.error('[FloatingActionButton] Error completing practice:', err);
      setCompletionError(err instanceof Error ? err.message : 'Failed to log completion');
    } finally {
      setCompleting(null);
    }
  };

  const handleToolClick = (toolId: string) => {
  if (toolId === 'worry_loop_dissolver') { openLoopDeLooping(userId); setIsOpen(false); }
    else if (toolId === 'nos_glide') { openNosGlide(); setIsOpen(false); }
    else { onToolClick(toolId); setIsOpen(false); }
  };

  const completedCount = currentStagePractices.filter(p => getPracticeStatus(p.id) === 'completed').length;
  const totalCount = currentStagePractices.length;
  const allComplete = completedCount === totalCount;

  return (
    <>
      {/* Modals - UNCHANGED */}
      <ResonanceModal onComplete={() => handleModalComplete('hrvb', 'Resonance Breathing')} />
      <AwarenessRepModal onComplete={() => handleModalComplete('awareness_rep', 'Awareness Rep')} />
      <CoRegulationModal onComplete={() => handleModalComplete('co_regulation', 'Co-Regulation Practice')} />
      <NightlyDebriefModal onComplete={() => handleModalComplete('nightly_debrief', 'Nightly Debrief')} userId={userId} />
     <SomaticFlowModal
        currentVersion={progress.somaticFlowCurrentVersion ?? 'original'}
        hasSeenDemo={progress.somaticFlowDemosSeen?.includes(progress.somaticFlowCurrentVersion ?? 'original') ?? true}
        onComplete={() => handleModalComplete('somatic_flow', 'Somatic Flow')}
        onProgressRefetch={onProgressUpdate}
      />
      <LoopDeLoopingModal />
      <NosGlideModal />

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* =============================================
          DROPDOWN MENU - Opens UPWARD from button
          ============================================= */}
      {isOpen && (
        <div className="fixed top-24 right-3 w-80 max-w-[calc(100vw-1.5rem)] max-h-[65vh] overflow-y-auto bg-[#f5f4f2] border border-black/10 rounded-2xl shadow-2xl z-50">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-800 uppercase tracking-wider">Tools</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Stage {progress.currentStage}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-black/5 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Summary */}
            <div className={`mb-4 p-4 rounded-xl border ${allComplete ? 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200/60' : 'bg-white border-black/[0.04]'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-500">Today&apos;s Progress</span>
                <span className={`text-sm font-bold ${allComplete ? 'text-emerald-600' : 'text-amber-600'}`}>{completedCount}/{totalCount}</span>
              </div>
              <div className="w-full h-1.5 bg-black/[0.04] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${allComplete ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-amber-400 to-amber-500'}`}
                  style={{ width: `${(completedCount / totalCount) * 100}%` }} />
              </div>
              {allComplete && <p className="text-xs text-emerald-600 mt-2 text-center font-medium">All rituals complete! ✓</p>}
            </div>

            {/* Error */}
            {completionError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-xs text-red-600">{completionError}</p>
              </div>
            )}

            {/* Daily Rituals */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">DAILY RITUALS</div>
              <div className="space-y-2">
                {currentStagePractices.map((practice) => {
                  const status = getPracticeStatus(practice.id);
                  const isCompleted = status === 'completed';
                  const isCompleting = completing === practice.id;
                  const PracticeIcon = PRACTICE_ICONS[practice.id] || Zap;
                  const isMicroAction = practice.id === 'micro_action';
                  const hasIdentity = isMicroAction && !!(progress.currentIdentity);
                  const currentIdentity = progress.currentIdentity || '';
                  const identityDay = progress.identitySprintDay;
                  const isFlowBlock = practice.id === 'flow_block';
                  const hasFlowBlockConfig = isFlowBlock && !!(progress.hasFlowBlockConfig);
                  const isCoRegulation = practice.id === 'co_regulation';
                  const isNightlyDebrief = practice.id === 'nightly_debrief';

                  // ★ CUE PHASE CARD: When sprint is active, render 3-phase card
                  if (isMicroAction && hasIdentity) {
                    return (
                      <CuePhaseCard
                        key={practice.id}
                        userId={userId}
                        isCompleted={isCompleted}
                        onFullComplete={async () => {
                          await handleMarkComplete('micro_action', 'IOS Cue');
                        }}
                        onProgressUpdate={onProgressUpdate}
                        sprintDay={identityDay ?? undefined}
                        currentCue={currentIdentity}
                      />
                    );
                  }
                  
                  return (
                    <div key={practice.id}
                      className={`p-3 rounded-xl transition-all duration-200 ${isCompleted ? 'bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-200/60' : 'bg-white border border-black/[0.04]'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {isCompleted ? <Check className="w-4 h-4" strokeWidth={2.5} /> : <PracticeIcon className="w-4 h-4" />}
                        </div>
                        <span className={`text-sm font-semibold flex-1 ${isCompleted ? 'text-emerald-700' : 'text-zinc-800'}`}>{practice.shortName}</span>
                        <span className="text-xs text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {isCoRegulation ? 'Eve' : isNightlyDebrief ? 'Night' : `${practice.duration}m`}
                        </span>
                      </div>
                      
                      {/* Action Buttons - ALL LOGIC UNCHANGED */}
                      <div className="flex gap-2">
                        {isMicroAction ? (
                          <button onClick={() => { handleStartPractice(practice.id); setIsOpen(false); }}
                            className="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/20">
                            Set Up IOS Cue
                          </button>
                        ) : isFlowBlock ? (
                          hasFlowBlockConfig ? (
                            <>
                              {!isCompleted && (
                                <button onClick={(e) => { handleMarkComplete(practice.id, practice.name, e); setIsOpen(false); }}
                                  disabled={isCompleting}
                                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${isCompleting ? 'bg-zinc-100 text-zinc-400 cursor-wait' : 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/20'}`}>
                                  {isCompleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                  Mark Done
                                </button>
                              )}
                              {isCompleted && (
                                <span className="flex-1 px-3 py-2 text-xs text-emerald-600 font-medium flex items-center justify-center gap-1.5"><Check className="w-3 h-3" /> Done</span>
                              )}
                            </>
                          ) : (
                            <button onClick={() => { handleStartPractice(practice.id); setIsOpen(false); }}
                              className="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/20">
                              Set Up Flow Block
                            </button>
                          )
                        ) : isCoRegulation || isNightlyDebrief ? (
                          <>
                            {!isCompleted && (
                              <button onClick={() => handleStartPractice(practice.id)}
                                className="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/20">
                                Start Ritual
                              </button>
                            )}
                            {isCompleted && (
                              <>
                                <button onClick={() => handleStartPractice(practice.id)}
                                  className="flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 bg-zinc-100 text-zinc-600 hover:bg-zinc-200">
                                  <RotateCcw className="w-3 h-3" /> Again
                                </button>
                                <span className="px-2 py-2 text-xs text-emerald-600 flex items-center gap-1"><Check className="w-4 h-4" /></span>
                              </>
                            )}
                          </>
                        ) : (
                          (() => {
                            const hasWorkingModal = practice.id === 'hrvb' || practice.id === 'awareness_rep' || practice.id === 'somatic_flow';
                            return (
                              <>
                                <button onClick={() => handleStartPractice(practice.id)}
                                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${isCompleted ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200' : 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/20'}`}>
                                  {isCompleted && <RotateCcw className="w-3 h-3" />}
                                  {isCompleted ? 'Again' : 'Start'}
                                </button>
                                {!isCompleted && !hasWorkingModal && (
                                  <button onClick={(e) => handleMarkComplete(practice.id, practice.name, e)}
                                    disabled={isCompleting}
                                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 ${isCompleting ? 'bg-zinc-100 text-zinc-400 cursor-wait' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>
                                    {isCompleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                    Done
                                  </button>
                                )}
                                {isCompleted && (
                                  <span className="px-2 py-2 text-xs text-emerald-600 flex items-center gap-1"><Check className="w-4 h-4" /></span>
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
              <div className="text-xs font-semibold text-gray-400 mb-2">ON-DEMAND TOOLS</div>
              <p className="text-xs text-gray-500 italic mb-3">
                Tools don&apos;t fix states. They restore clarity when interpretation is distorting signal.
              </p>
              <div className="space-y-2">
                {unlockedTools.map((tool) => {
                  const ToolIcon = TOOL_ICONS[tool.id] || Sparkles;
                  return (
                    <button key={tool.id} onClick={() => handleToolClick(tool.id)}
                      className="w-full text-left p-3 rounded-xl bg-white border border-black/[0.04] hover:border-amber-400/30 hover:shadow-md hover:shadow-amber-500/5 transition-all duration-200 group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-colors">
                          <ToolIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 block">{tool.name}</span>
                          <div className="text-xs text-zinc-500 mt-0.5">{tool.description}</div>
                          {tool.when && <div className="text-xs text-amber-600/70 mt-1 italic">{tool.when}</div>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
     </div>

            {/* Stage 2 teaser — visible all of Stage 1 */}
            {progress.currentStage === 1 && (
              <div className="mt-4">
                <Stage2TeaserPanel unlockEligible={progress.unlockEligible ?? false} onInstallClick={onInstallClick} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* =============================================
          RITUALS PILL BUTTON
          Top-right, same height as Dashboard pill
          White pill = pops on dark bg, distinct from amber
          ============================================= */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed top-14 right-3 z-30 h-9 rounded-full flex items-center justify-center
          transition-all duration-300 md:hidden
          ${isOpen 
            ? 'bg-zinc-800 w-9 shadow-lg border border-white/10' 
            : 'bg-white/95 backdrop-blur-sm border border-white/20 shadow-lg shadow-black/30 pl-2.5 pr-3.5 gap-1.5'
          }
        `}
      >
        {isOpen ? (
          <X className="w-4 h-4 text-white" />
        ) : (
          <>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-semibold text-zinc-700">Rituals</span>
          </>
        )}
      </button>
    </>
  );
}
