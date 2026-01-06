'use client';

import { useState, useEffect } from 'react';
import { useUserProgress } from '@/app/hooks/useUserProgress';
import { createClient } from '@/lib/supabase-client';

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
  Play,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
} from 'lucide-react';

// Practice Modal imports
import { useHRVB } from '@/components/HRVBModal';
import { useAwarenessRep } from '@/components/AwarenessRepModal';
import { useSomaticFlow } from '@/components/SomaticFlowModal';
import { useMicroAction } from '@/components/MicroActionModal';
import { useFlowBlock } from '@/components/FlowBlockModal';
import { useCoRegulation } from '@/components/CoRegulationModal';
import { useNightlyDebrief } from '@/components/NightlyDebriefModal';

// Tool Modal imports
import { useDecentering } from '@/components/DecenteringModal';
import { useMetaReflection } from '@/components/MetaReflectionModal';
import { useReframe } from '@/components/ReframeModal';
import { useThoughtHygiene } from '@/components/ThoughtHygieneModal';

// ============================================
// TYPES
// ============================================

interface Practice {
  id: string;
  name: string;
  duration: string;
  icon: React.ComponentType<{ className?: string }>;
  stage: number;
  description: string;
}

interface Tool {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  stage: number;
  description: string;
}

interface ToolsSidebarProps {
  onPracticeClick?: (practiceId: string) => void;
  onToolClick?: (toolId: string) => void;
  onProgressUpdate?: () => void;
  onPracticeCompleted?: (practiceId: string) => void;
  currentStage?: number;
}

// ============================================
// PRACTICE DEFINITIONS
// ============================================

const practices: Practice[] = [
  {
    id: 'hrvb',
    name: 'Resonance Breathing',
    duration: '5 min',
    icon: Wind,
    stage: 1,
    description: 'Vagal toning & HRV optimization',
  },
  {
    id: 'awareness_rep',
    name: 'Awareness Rep',
    duration: '2 min',
    icon: Eye,
    stage: 1,
    description: 'Meta-awareness training',
  },
  {
    id: 'somatic_flow',
    name: 'Somatic Flow',
    duration: '3 min',
    icon: Activity,
    stage: 2,
    description: 'Embodied movement practice',
  },
  {
    id: 'micro_action',
    name: 'Morning Micro-Action',
    duration: '2-3 min',
    icon: Zap,
    stage: 3,
    description: 'Identity proof action',
  },
  {
    id: 'flow_block',
    name: 'Flow Block',
    duration: '60-90 min',
    icon: Target,
    stage: 4,
    description: 'Deep work immersion',
  },
  {
    id: 'co_regulation',
    name: 'Co-Regulation',
    duration: '3-5 min',
    icon: Heart,
    stage: 5,
    description: 'Relational coherence',
  },
  {
    id: 'nightly_debrief',
    name: 'Nightly Debrief',
    duration: '2 min',
    icon: Moon,
    stage: 6,
    description: 'Daily integration',
  },
];

// ============================================
// TOOL DEFINITIONS
// ============================================

const tools: Tool[] = [
  {
    id: 'decentering',
    name: 'Decentering',
    icon: Layers,
    stage: 1,
    description: 'Observer perspective shift',
  },
  {
    id: 'meta_reflection',
    name: 'Meta-Reflection',
    icon: Compass,
    stage: 2,
    description: 'Weekly awareness review',
  },
  {
    id: 'reframe',
    name: 'Reframe Protocol',
    icon: RefreshCw,
    stage: 3,
    description: 'Interpretation debugging',
  },
  {
    id: 'thought_hygiene',
    name: 'Thought Hygiene',
    icon: Sparkles,
    stage: 4,
    description: 'Mental cache clearing',
  },
];

// ============================================
// PRACTICE CARD COMPONENT
// ============================================

interface PracticeCardProps {
  practice: Practice;
  isUnlocked: boolean;
  isCompleted: boolean;
  onStart: () => void;
  streak?: number;
}

function PracticeCard({ practice, isUnlocked, isCompleted, onStart, streak }: PracticeCardProps) {
  const Icon = practice.icon;
  
  if (!isUnlocked) {
    return (
      <div className="group relative bg-white/60 rounded-xl p-4 border border-black/[0.04] opacity-60">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center flex-shrink-0">
            <Lock className="w-4 h-4 text-zinc-400" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-400 truncate">{practice.name}</span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">Stage {practice.stage}+</p>
          </div>
        </div>
      </div>
    );
  }
  
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
            {streak && streak > 0 && (
              <span className="inline-flex items-center gap-0.5 text-xs font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                <Flame className="w-3 h-3" />
                {streak}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">{practice.description}</p>
          
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
// TOOL CARD COMPONENT
// ============================================

interface ToolCardProps {
  tool: Tool;
  isUnlocked: boolean;
  onActivate: () => void;
}

function ToolCard({ tool, isUnlocked, onActivate }: ToolCardProps) {
  const Icon = tool.icon;
  
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
        <span className="text-xs text-zinc-500">{tool.description}</span>
      </div>
      <Play className="w-4 h-4 text-zinc-400 group-hover:text-amber-500 transition-colors duration-200" />
    </button>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ToolsSidebar({
  onPracticeClick,
  onToolClick,
  onProgressUpdate,
  onPracticeCompleted,
  currentStage: propStage,
}: ToolsSidebarProps) {
  const { progress, loading, refetchProgress } = useUserProgress();
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());
  const [practicesExpanded, setPracticesExpanded] = useState(true);
  const [toolsExpanded, setToolsExpanded] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Modal hooks
  const { open: openHRVB, Modal: HRVBModal } = useHRVB();
  const { open: openAwarenessRep, Modal: AwarenessRepModal } = useAwarenessRep();
  const { open: openSomaticFlow, Modal: SomaticFlowModal } = useSomaticFlow();
  const { open: openMicroAction, Modal: MicroActionModal } = useMicroAction();
  const { open: openFlowBlock, Modal: FlowBlockModal } = useFlowBlock();
  const { open: openCoRegulation, Modal: CoRegulationModal } = useCoRegulation();
  const { open: openNightlyDebrief, Modal: NightlyDebriefModal } = useNightlyDebrief();
  
  const { open: openDecentering, Modal: DecenteringModal } = useDecentering();
  const { open: openMetaReflection, Modal: MetaReflectionModal } = useMetaReflection();
  const { open: openReframe, Modal: ReframeModal } = useReframe();
  const { open: openThoughtHygiene, Modal: ThoughtHygieneModal } = useThoughtHygiene();
  
  const currentStage = propStage ?? progress?.currentStage ?? 1;

  // Get user ID on mount
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  // Load completed practices for today
  useEffect(() => {
    const loadTodaysPractices = async () => {
      if (!userId) return;
      
      const supabase = createClient();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data } = await supabase
        .from('practice_logs')
        .select('practice_type')
        .eq('user_id', userId)
        .gte('completed_at', today.toISOString());
      
      if (data) {
        setCompletedToday(new Set(data.map(p => p.practice_type)));
      }
    };
    
    loadTodaysPractices();
  }, [userId, progress]);

  // Handle practice completion
  const handlePracticeComplete = async (practiceId: string) => {
    if (!userId) return;
    
    try {
      const supabase = createClient();
      await supabase.from('practice_logs').insert({
        user_id: userId,
        practice_type: practiceId,
        completed_at: new Date().toISOString(),
        stage: currentStage,
      });
      
      setCompletedToday(prev => new Set([...prev, practiceId]));
      
      if (onPracticeCompleted) onPracticeCompleted(practiceId);
      if (onProgressUpdate) onProgressUpdate();
      if (refetchProgress) refetchProgress();
    } catch (error) {
      console.error('Failed to log practice:', error);
    }
  };

  // Handle practice start
  const handlePracticeStart = (practiceId: string) => {
    if (onPracticeClick) onPracticeClick(practiceId);
    
    switch (practiceId) {
      case 'hrvb':
        openHRVB(userId, () => handlePracticeComplete('hrvb'));
        break;
      case 'awareness_rep':
        openAwarenessRep(userId, () => handlePracticeComplete('awareness_rep'));
        break;
      case 'somatic_flow':
        openSomaticFlow(userId, () => handlePracticeComplete('somatic_flow'));
        break;
      case 'micro_action':
        openMicroAction(userId, () => handlePracticeComplete('micro_action'));
        break;
      case 'flow_block':
        openFlowBlock(userId, () => handlePracticeComplete('flow_block'));
        break;
      case 'co_regulation':
        openCoRegulation(() => handlePracticeComplete('co_regulation'));
        break;
      case 'nightly_debrief':
        openNightlyDebrief(() => handlePracticeComplete('nightly_debrief'));
        break;
    }
  };

  // Handle tool activation
  const handleToolActivate = (toolId: string) => {
    if (onToolClick) onToolClick(toolId);
    
    switch (toolId) {
      case 'decentering':
        openDecentering(userId);
        break;
      case 'meta_reflection':
        openMetaReflection(userId, false);
        break;
      case 'reframe':
        openReframe(userId, false);
        break;
      case 'thought_hygiene':
        openThoughtHygiene(userId);
        break;
    }
  };

  // Get unlocked practices and tools
  const unlockedPractices = practices.filter(p => p.stage <= currentStage);
  const lockedPractices = practices.filter(p => p.stage > currentStage);
  const unlockedTools = tools.filter(t => t.stage <= currentStage);
  const lockedTools = tools.filter(t => t.stage > currentStage);

  // Calculate completion stats
  const completedCount = unlockedPractices.filter(p => completedToday.has(p.id)).length;
  const totalCount = unlockedPractices.length;
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
                {/* Unlocked practices */}
                {unlockedPractices.map(practice => (
                  <PracticeCard
                    key={practice.id}
                    practice={practice}
                    isUnlocked={true}
                    isCompleted={completedToday.has(practice.id)}
                    onStart={() => handlePracticeStart(practice.id)}
                    streak={progress?.consecutiveDays}
                  />
                ))}
                
                {/* Locked practices (show next 1-2) */}
                {lockedPractices.slice(0, 2).map(practice => (
                  <PracticeCard
                    key={practice.id}
                    practice={practice}
                    isUnlocked={false}
                    isCompleted={false}
                    onStart={() => {}}
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
                {/* Unlocked tools */}
                {unlockedTools.map(tool => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    isUnlocked={true}
                    onActivate={() => handleToolActivate(tool.id)}
                  />
                ))}
                
                {/* Locked tools */}
                {lockedTools.map(tool => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    isUnlocked={false}
                    onActivate={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/5 bg-white/50">
          <div className="text-center">
            <p className="text-xs text-zinc-400">
              Stage {currentStage} • {completionPercentage}% today
            </p>
          </div>
        </div>
      </aside>

      {/* All Modals */}
      <HRVBModal />
      <AwarenessRepModal />
      <SomaticFlowModal />
      <MicroActionModal />
      <FlowBlockModal />
      <CoRegulationModal />
      <NightlyDebriefModal />
      <DecenteringModal />
      <MetaReflectionModal />
      <ReframeModal />
      <ThoughtHygieneModal />
    </>
  );
}
