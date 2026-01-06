'use client';

import { useState } from 'react';
import { getStagePractices, getUnlockedOnDemandTools } from '@/app/config/stages';
import type { UserProgress } from '@/app/hooks/useUserProgress';

// Your actual modal imports
import { useResonanceBreathing } from '@/components/ResonanceModal';
import { useAwarenessRep } from '@/components/AwarenessRepModal';
import { useCoRegulation } from '@/components/CoRegulationModal';
import { useNightlyDebrief } from '@/components/NightlyDebriefModal';

// On-demand tool modals
import { useDecentering } from '@/components/DecenteringModal';
import { useMetaReflection } from '@/components/MetaReflectionModal';
import { useReframe } from '@/components/ReframeModal';
import { useThoughtHygiene } from '@/components/ThoughtHygieneModal';

// Lucide Icons - Refined, professional set
import {
  Wind,           // Breathing
  Eye,            // Awareness
  Activity,       // Somatic/Movement
  Zap,            // Micro-action
  Target,         // Flow block
  Heart,          // Co-regulation
  Moon,           // Nightly debrief
  Layers,         // Decentering
  Compass,        // Meta-reflection
  RefreshCw,      // Reframe
  Sparkles,       // Thought hygiene
  Check,
  Lock,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  Loader2,
  RotateCcw,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface ToolsSidebarProps {
  progress: UserProgress;
  userId: string;
  onPracticeClick: (practiceId: string) => void;
  onToolClick: (toolId: string) => void;
  onProgressUpdate?: () => Promise<void> | void;
  onPracticeCompleted?: (practiceId: string, practiceName: string) => void;
  isRefreshing?: boolean;
}

// Icon mapping for practices
const practiceIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
  hrvb: Wind,
  awareness_rep: Eye,
  somatic_flow: Activity,
  micro_action: Zap,
  flow_block: Target,
  co_regulation: Heart,
  nightly_debrief: Moon,
};

// Icon mapping for tools
const toolIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
  decentering: Layers,
  meta_reflection: Compass,
  reframe: RefreshCw,
  thought_hygiene: Sparkles,
};

// Practice descriptions
const practiceDescriptions: { [key: string]: string } = {
  hrvb: 'Vagal toning & HRV optimization',
  awareness_rep: 'Meta-awareness training',
  somatic_flow: 'Embodied movement practice',
  micro_action: 'Identity proof action',
  flow_block: 'Deep work immersion',
  co_regulation: 'Relational coherence',
  nightly_debrief: 'Daily integration',
};

// Tool descriptions
const toolDescriptions: { [key: string]: string } = {
  decentering: 'Observer perspective shift',
  meta_reflection: 'Weekly awareness review',
  reframe: 'Interpretation debugging',
  thought_hygiene: 'Mental cache clearing',
};

// ============================================
// PRACTICE CARD COMPONENT
// ============================================

interface PracticeCardProps {
  practice: {
    id: string;
    name: string;
    duration: string;
    stage: number;
  };
  isCompleted: boolean;
  onStart: () => void;
  streak?: number;
}

function PracticeCard({ practice, isCompleted, onStart, streak }: PracticeCardProps) {
  const Icon = practiceIcons[practice.id] || Zap;
  const description = practiceDescriptions[practice.id] || '';
  
  return (
    <div 
      className={`
        group relative bg-white rounded-xl p-4 border transition-all duration-200 cursor-pointer
        ${isCompleted 
          ? 'border-emerald-200/60 bg-gradient-to-br from-emerald-50/50 to-white' 
          : 'border-black/[0.04] hover:border-amber-400/30 hover:shadow-lg hover:shadow-amber-500/5'
        }
      `}
      onClick={onStart}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200
          ${isCompleted 
            ? 'bg-emerald-100 text-emerald-600' 
            : 'bg-amber-50 text-amber-600 group-hover:bg-amber-100'
          }
        `}>
          {isCompleted ? (
            <Check className="w-5 h-5" strokeWidth={2.5} />
          ) : (
            <Icon className="w-5 h-5" />
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold truncate ${isCompleted ? 'text-emerald-700' : 'text-zinc-800'}`}>
              {practice.name}
            </span>
            {streak && streak > 0 && !isCompleted && (
              <span className="inline-flex items-center gap-0.5 text-xs font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                <Flame className="w-3 h-3" />
                {streak}
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
            <button
              className={`
                text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200
                ${isCompleted 
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                  : 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/20'
                }
              `}
              onClick={(e) => {
                e.stopPropagation();
                onStart();
              }}
            >
              {isCompleted ? 'Again' : 'Start'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// LOCKED PRACTICE CARD
// ============================================

interface LockedPracticeCardProps {
  practice: {
    id: string;
    name: string;
    stage: number;
  };
}

function LockedPracticeCard({ practice }: LockedPracticeCardProps) {
  return (
    <div className="group relative bg-white/60 rounded-xl p-4 border border-black/[0.04] opacity-60">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center flex-shrink-0">
          <Lock className="w-4 h-4 text-zinc-400" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-zinc-400 truncate block">{practice.name}</span>
          <p className="text-xs text-zinc-400 mt-0.5">Unlocks at Stage {practice.stage}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// TOOL CARD COMPONENT
// ============================================

interface ToolCardProps {
  tool: {
    id: string;
    name: string;
    stage: number;
  };
  isUnlocked: boolean;
  onActivate: () => void;
}

function ToolCard({ tool, isUnlocked, onActivate }: ToolCardProps) {
  const Icon = toolIcons[tool.id] || Sparkles;
  const description = toolDescriptions[tool.id] || '';
  
  if (!isUnlocked) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/60 border border-black/[0.04] opacity-50">
        <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
          <Lock className="w-3.5 h-3.5 text-zinc-400" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-zinc-400 truncate block">{tool.name}</span>
          <span className="text-xs text-zinc-400">Stage {tool.stage}+</span>
        </div>
      </div>
    );
  }
  
  return (
    <button
      onClick={onActivate}
      className="w-full flex items-center gap-3 p-3 rounded-lg bg-white border border-black/[0.04] hover:border-amber-400/30 hover:shadow-md hover:shadow-amber-500/5 transition-all duration-200 text-left group"
    >
      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-colors duration-200">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 truncate block">{tool.name}</span>
        <span className="text-xs text-zinc-500">{description}</span>
      </div>
    </button>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ToolsSidebar({
  progress,
  userId,
  onPracticeClick,
  onToolClick,
  onProgressUpdate,
  onPracticeCompleted,
  isRefreshing = false,
}: ToolsSidebarProps) {
  const [practicesExpanded, setPracticesExpanded] = useState(true);
  const [toolsExpanded, setToolsExpanded] = useState(true);
  
  // Initialize modal hooks - USING YOUR ACTUAL IMPORTS
  const { open: openResonance, Modal: ResonanceModal } = useResonanceBreathing();
  const { open: openAwarenessRep, Modal: AwarenessRepModal } = useAwarenessRep();
  const { open: openCoRegulation, Modal: CoRegulationModal } = useCoRegulation();
  const { open: openNightlyDebrief, Modal: NightlyDebriefModal } = useNightlyDebrief();
  
  // On-demand tool modals
  const { open: openDecentering, Modal: DecenteringModal } = useDecentering();
  const { open: openMetaReflection, Modal: MetaReflectionModal } = useMetaReflection();
  const { open: openReframe, Modal: ReframeModal } = useReframe();
  const { open: openThoughtHygiene, Modal: ThoughtHygieneModal } = useThoughtHygiene();
  
  const currentStage = progress?.currentStage ?? 1;
  const completedToday = new Set(progress?.practicesCompletedToday || []);
  
  // Get practices and tools based on stage
  const stagePractices = getStagePractices(currentStage);
  const unlockedTools = getUnlockedOnDemandTools(currentStage);
  
  // Handle modal completion
  const handleModalComplete = async (practiceId: string, practiceName: string) => {
    if (onPracticeCompleted) {
      onPracticeCompleted(practiceId, practiceName);
    }
    if (onProgressUpdate) {
      await onProgressUpdate();
    }
  };
  
  // Handle practice start - routes to appropriate modal or chat
  const handleStartPractice = (practiceId: string) => {
    if (practiceId === 'hrvb') {
      openResonance();
    } else if (practiceId === 'awareness_rep') {
      openAwarenessRep();
    } else if (practiceId === 'co_regulation') {
      openCoRegulation();
    } else if (practiceId === 'nightly_debrief') {
      openNightlyDebrief();
    } else if (practiceId === 'micro_action' || practiceId === 'flow_block' || practiceId === 'somatic_flow') {
      // These route to chat for guided flows
      onToolClick(practiceId);
    } else {
      onPracticeClick(practiceId);
    }
  };
  
  // Handle tool activation
  const handleToolActivate = (toolId: string) => {
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
  
  // Calculate completion stats
  const completedCount = stagePractices.filter(p => completedToday.has(p.id)).length;
  const totalCount = stagePractices.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <>
      {/* Main Sidebar */}
      <aside className="w-80 bg-[#f5f4f2] border-l border-black/5 flex flex-col h-full overflow-hidden">
        {/* Header */}
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
          
          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-black/[0.04] rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                completedCount === totalCount 
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' 
                  : 'bg-gradient-to-r from-amber-400 to-amber-500'
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Practices Section */}
          <div className="p-4">
            <button
              onClick={() => setPracticesExpanded(!practicesExpanded)}
              className="w-full flex items-center justify-between mb-3 group"
            >
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-700 transition-colors">
                Morning Practices
              </span>
              {practicesExpanded ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </button>
            
            {practicesExpanded && (
              <div className="space-y-3">
                {stagePractices.map(practice => (
                  <PracticeCard
                    key={practice.id}
                    practice={practice}
                    isCompleted={completedToday.has(practice.id)}
                    onStart={() => handleStartPractice(practice.id)}
                    streak={progress?.consecutiveDays}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-black/5 mx-4" />

          {/* Tools Section */}
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
                {unlockedTools.map(tool => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    isUnlocked={true}
                    onActivate={() => handleToolActivate(tool.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/5 bg-white/50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-400">
              Stage {currentStage} • {completionPercentage}% today
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

      {/* All Modals - rendered at root level */}
      <ResonanceModal onComplete={() => handleModalComplete('hrvb', 'Resonance Breathing')} />
      <AwarenessRepModal onComplete={() => handleModalComplete('awareness_rep', 'Awareness Rep')} />
      <CoRegulationModal onComplete={() => handleModalComplete('co_regulation', 'Co-Regulation Practice')} />
      <NightlyDebriefModal onComplete={() => handleModalComplete('nightly_debrief', 'Nightly Debrief')} />
      <DecenteringModal />
      <MetaReflectionModal />
      <ReframeModal />
      <ThoughtHygieneModal />
    </>
  );
}
