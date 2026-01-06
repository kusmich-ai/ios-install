// components/ToolsSidebar.tsx
// LUXURY VISUAL UPGRADE - All logic preserved, only styling changed
'use client';

import { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  Check, 
  Loader2, 
  RotateCcw,
  ChevronUp,
  Clock,
  Flame,
  Lock,
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
  RefreshCw,      // Reframe
  Sparkles,       // Thought hygiene
} from 'lucide-react';
import { getStagePractices, getUnlockedOnDemandTools } from '@/app/config/stages';
import type { UserProgress } from '@/app/hooks/useUserProgress';
import { useResonanceBreathing } from '@/components/ResonanceModal';
import { useAwarenessRep } from '@/components/AwarenessRepModal';
import { useCoRegulation } from '@/components/CoRegulationModal';
import { useNightlyDebrief } from '@/components/NightlyDebriefModal';
import { useDecentering } from '@/components/DecenteringModal';
import { useMetaReflection } from '@/components/MetaReflectionModal';
import { useReframe } from '@/components/ReframeModal';
import { useThoughtHygiene } from '@/components/ThoughtHygieneModal';

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

// NEW: Lucide icon mapping (replaces emoji icons)
const PRACTICE_ICONS: { [key: string]: React.ComponentType<{ className?: string }> } = {
  'hrvb': Wind,
  'awareness_rep': Eye,
  'somatic_flow': Activity,
  'micro_action': Zap,
  'flow_block': Target,
  'co_regulation': Heart,
  'nightly_debrief': Moon,
};

const TOOL_ICONS: { [key: string]: React.ComponentType<{ className?: string }> } = {
  'decentering': Layers,
  'meta_reflection': Compass,
  'reframe': RefreshCw,
  'thought_hygiene': Sparkles,
};

// NEW: Practice descriptions for luxury cards
const PRACTICE_DESCRIPTIONS: { [key: string]: string } = {
  'hrvb': 'Vagal toning & HRV optimization',
  'awareness_rep': 'Meta-awareness training',
  'somatic_flow': 'Embodied movement practice',
  'micro_action': 'Identity proof action',
  'flow_block': 'Deep work immersion',
  'co_regulation': 'Relational coherence',
  'nightly_debrief': 'Daily integration',
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
  const { open: openCoRegulation, Modal: CoRegulationModal } = useCoRegulation();
  const { open: openNightlyDebrief, Modal: NightlyDebriefModal } = useNightlyDebrief();
  const { open: openDecentering, Modal: DecenteringModal } = useDecentering();
  const { open: openMetaReflection, Modal: MetaReflectionModal } = useMetaReflection();
  const { open: openReframe, Modal: ReframeModal } = useReframe();
  const { open: openThoughtHygiene, Modal: ThoughtHygieneModal } = useThoughtHygiene();

  const currentStagePractices = getStagePractices(progress.currentStage);
  const unlockedTools = getUnlockedOnDemandTools(progress.currentStage);

  // UNCHANGED: getPracticeStatus
  const getPracticeStatus = (practiceId: string): 'completed' | 'pending' | 'locked' => {
    const mappedId = PRACTICE_ID_MAP[practiceId] || practiceId;
    const practiceData = progress.dailyPractices[practiceId] || progress.dailyPractices[mappedId];
    if (practiceData?.completed) return 'completed';
    return 'pending';
  };

  // UNCHANGED: handleStartPractice
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
      onToolClick(practiceId);
    } else {
      onPracticeClick(practiceId);
    }
  };

  // UNCHANGED: handleToolClick
  const handleToolClick = (toolId: string) => {
    if (toolId === 'decentering') {
      openDecentering(userId);
    } else if (toolId === 'meta_reflection') {
      openMetaReflection(userId, false);
    } else if (toolId === 'reframe') {
      openReframe(userId, false);
    } else if (toolId === 'thought_hygiene') {
      openThoughtHygiene(userId);
    } else {
      onToolClick(toolId);
    }
  };

  // UNCHANGED: handleModalComplete
  const handleModalComplete = async (practiceId: string, practiceName: string) => {
    console.log(`[ToolsSidebar] Modal completed: ${practiceId}`);
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

      await new Promise(resolve => setTimeout(resolve, 300));

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
  const adherencePercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <>
      {/* Modals - UNCHANGED */}
      <ResonanceModal onComplete={() => handleModalComplete('hrvb', 'Resonance Breathing')} />
      <AwarenessRepModal onComplete={() => handleModalComplete('awareness_rep', 'Awareness Rep')} />
      <CoRegulationModal onComplete={() => handleModalComplete('co_regulation', 'Co-Regulation Practice')} />
      <NightlyDebriefModal onComplete={() => handleModalComplete('nightly_debrief', 'Nightly Debrief')} />
      <DecenteringModal />
      <MetaReflectionModal />
      <ReframeModal />
      <ThoughtHygieneModal />

      {/* ========================================
          LUXURY VISUAL UPGRADE STARTS HERE
          ======================================== */}
      <aside className="w-80 bg-[#f5f4f2] border-l border-black/5 flex flex-col h-full overflow-hidden">
        {/* Header - Luxury styling */}
        <div className="p-5 border-b border-black/5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-800 uppercase tracking-wider">Daily Rituals</h2>
            <div className="flex items-center gap-2">
              {isRefreshing && (
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              )}
              <span className={`text-xs font-semibold ${completedCount === totalCount ? 'text-emerald-600' : 'text-amber-600'}`}>
                {completedCount}/{totalCount}
              </span>
            </div>
          </div>
          
          {/* Progress bar - Luxury thin gradient */}
          <div className="mt-3 h-1.5 bg-black/[0.04] rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                completedCount === totalCount 
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' 
                  : 'bg-gradient-to-r from-amber-400 to-amber-500'
              }`}
              style={{ width: `${adherencePercent}%` }}
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Error Display */}
          {completionError && (
            <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {completionError}
            </div>
          )}

          {/* Daily Rituals Section - Luxury cards */}
          <div className="p-4">
            <button
              onClick={() => setDailyExpanded(!dailyExpanded)}
              className="w-full flex items-center justify-between mb-3 group"
            >
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-700 transition-colors">
                Morning Practices
              </span>
              {dailyExpanded ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </button>

            {dailyExpanded && (
              <div className="space-y-3">
                {currentStagePractices.map((practice) => {
                  const status = getPracticeStatus(practice.id);
                  const isCompleting = completing === practice.id;
                  const Icon = PRACTICE_ICONS[practice.id] || Zap;
                  const description = PRACTICE_DESCRIPTIONS[practice.id] || '';
                  
                  return (
                    <div
                      key={practice.id}
                      className={`
                        group relative bg-white rounded-xl p-4 border transition-all duration-200 cursor-pointer
                        ${status === 'completed' 
                          ? 'border-emerald-200/60 bg-gradient-to-br from-emerald-50/50 to-white' 
                          : 'border-black/[0.04] hover:border-amber-400/30 hover:shadow-lg hover:shadow-amber-500/5'
                        }
                      `}
                      onClick={() => handleStartPractice(practice.id)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Lucide Icon instead of emoji */}
                        <div className={`
                          w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200
                          ${status === 'completed' 
                            ? 'bg-emerald-100 text-emerald-600' 
                            : 'bg-amber-50 text-amber-600 group-hover:bg-amber-100'
                          }
                        `}>
                          {status === 'completed' ? (
                            <Check className="w-5 h-5" strokeWidth={2.5} />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold truncate ${status === 'completed' ? 'text-emerald-700' : 'text-zinc-800'}`}>
                              {practice.name}
                            </span>
                            {progress?.consecutiveDays && progress.consecutiveDays > 0 && status !== 'completed' && (
                              <span className="inline-flex items-center gap-0.5 text-xs font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                                <Flame className="w-3 h-3" />
                                {progress.consecutiveDays}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
                          
                          {/* Duration & Action */}
                          <div className="flex items-center justify-between mt-3">
                            <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                              <Clock className="w-3 h-3" />
                              {practice.duration}
                            </span>
                            
                            <div className="flex gap-2">
                              {status === 'pending' && (
                                <button
                                  onClick={(e) => handleMarkComplete(practice.id, practice.name, e)}
                                  disabled={isCompleting}
                                  className="text-xs font-medium px-3 py-1.5 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-zinc-200 transition-all duration-200 disabled:opacity-50 flex items-center gap-1"
                                >
                                  {isCompleting ? (
                                    <>
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      Saving
                                    </>
                                  ) : (
                                    <>
                                      <Check className="w-3 h-3" />
                                      Done
                                    </>
                                  )}
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartPractice(practice.id);
                                }}
                                className={`
                                  text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200
                                  ${status === 'completed' 
                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                                    : 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/20'
                                  }
                                `}
                              >
                                {status === 'completed' ? 'Again' : 'Start'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-black/5 mx-4" />

          {/* On-Demand Tools Section - Luxury styling */}
          <div className="p-4">
            <button
              onClick={() => setToolsExpanded(!toolsExpanded)}
              className="w-full flex items-center justify-between mb-3 group"
            >
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-700 transition-colors">
                On-Demand Tools
              </span>
              {toolsExpanded ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </button>

            {toolsExpanded && (
              <div className="space-y-2">
                {unlockedTools.map((tool) => {
                  const Icon = TOOL_ICONS[tool.id] || Sparkles;
                  
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleToolClick(tool.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-white border border-black/[0.04] hover:border-amber-400/30 hover:shadow-md hover:shadow-amber-500/5 transition-all duration-200 text-left group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-colors duration-200">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 truncate block">
                          {tool.shortName}
                        </span>
                        <span className="text-xs text-zinc-500">{tool.description}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/5 bg-white/50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-400">
              Stage {progress.currentStage} • {adherencePercent}% today
            </p>
            {onProgressUpdate && (
              <button 
                onClick={() => onProgressUpdate()}
                disabled={isRefreshing}
                className="p-1.5 hover:bg-black/5 rounded-lg transition-colors disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 text-zinc-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
