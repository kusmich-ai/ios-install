// app/library/page.tsx
// Main Library page for Science of Neural Liberation course

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, BookOpen, Play, Lock, CheckCircle, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useCourse } from '@/lib/course';
import { MODULE_INFO, STAGE_NAMES } from '@/lib/course/types';
import type { TutorialWithProgress, CourseModule } from '@/lib/course/types';
import VideoPlayer from '@/components/library/VideoPlayer';
import VideoModal from '@/components/library/VideoModal';
import { useCourseStore } from '@/stores/courseStore';

// Wrapper component to handle Suspense boundary for useSearchParams
function LibraryContent() {
  const searchParams = useSearchParams();
  const tutorialParam = searchParams.get('tutorial');
  
  return <LibraryPageInner tutorialParam={tutorialParam} />;
}

// Loading fallback
function LibraryLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#ff9e19] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading library...</p>
      </div>
    </div>
  );
}

// Main export with Suspense wrapper
export default function LibraryPage() {
  return (
    <Suspense fallback={<LibraryLoading />}>
      <LibraryContent />
    </Suspense>
  );
}

// Inner component with all the logic
function LibraryPageInner({ tutorialParam }: { tutorialParam: string | null }) {
  
  const { 
    tutorials, 
    modules, 
    loading, 
    error, 
    stats,
    markComplete,
    canAccess,
    isCompleted,
    getTutorialById
  } = useCourse();
  
  const { 
    videoModal, 
    closeVideoModal,
    expandedModules,
    toggleModule 
  } = useCourseStore();
  
  const [selectedTutorial, setSelectedTutorial] = useState<TutorialWithProgress | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Handle tutorial param from URL
  useEffect(() => {
    if (tutorialParam && tutorials.length > 0) {
      const tutorial = getTutorialById(tutorialParam);
      if (tutorial) {
        setSelectedTutorial(tutorial);
      }
    }
  }, [tutorialParam, tutorials, getTutorialById]);

  // Auto-select first accessible tutorial if none selected
  useEffect(() => {
    if (!selectedTutorial && tutorials.length > 0 && !tutorialParam) {
      const firstAccessible = tutorials.find(t => canAccess(t));
      if (firstAccessible) {
        setSelectedTutorial(firstAccessible);
      }
    }
  }, [tutorials, selectedTutorial, canAccess, tutorialParam]);

  const handleTutorialSelect = (tutorial: TutorialWithProgress) => {
    setSelectedTutorial(tutorial);
    setIsMobileSidebarOpen(false);
  };

  const handleMarkComplete = async () => {
    if (selectedTutorial) {
      await markComplete(selectedTutorial.id, 'library');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#ff9e19] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error loading course: {error.message}</p>
          <Link href="/chat" className="text-[#ff9e19] hover:underline">
            Return to Chat
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-800">
        <Link href="/chat" className="flex items-center gap-2 text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </Link>
        <h1 className="text-white font-semibold">Library</h1>
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 text-gray-400 hover:text-white"
        >
          <BookOpen className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar - Desktop always visible, Mobile toggleable */}
      <div className={`
        ${isMobileSidebarOpen ? 'block' : 'hidden'} 
        md:block 
        w-full md:w-72 
        border-r border-gray-800 
        bg-[#0a0a0a] 
        md:min-h-screen
        ${isMobileSidebarOpen ? 'absolute inset-0 z-40 pt-16' : ''}
      `}>
        {/* Desktop Back Link */}
        <div className="hidden md:block p-4 border-b border-gray-800">
          <Link href="/chat" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </Link>
        </div>
        
        {/* Progress Section */}
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-white font-semibold mb-2 text-sm">Course Progress</h2>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#ff9e19] transition-all duration-500"
              style={{ width: `${stats.completionPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.completedTutorials}/{stats.accessibleTutorials} tutorials complete ({stats.completionPercentage}%)
          </p>
        </div>
        
        {/* Module List */}
        <div className="p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Modules</h3>
          
          {modules.map((module) => (
            <ModuleSection
              key={module.number}
              module={module}
              isExpanded={expandedModules.has(module.number)}
              onToggle={() => toggleModule(module.number)}
              selectedTutorialId={selectedTutorial?.id}
              onSelectTutorial={handleTutorialSelect}
              canAccess={canAccess}
              isCompleted={isCompleted}
            />
          ))}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {selectedTutorial ? (
          <div className="max-w-4xl mx-auto p-4 md:p-8">
            {/* Video Container */}
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden mb-6">
              {canAccess(selectedTutorial) ? (
                <VideoPlayer 
                  vimeoId={selectedTutorial.vimeo_video_id}
                  tutorialId={selectedTutorial.id}
                  onComplete={handleMarkComplete}
                />
              ) : (
                <LockOverlay 
                  requiredStage={selectedTutorial.unlock_stage}
                />
              )}
            </div>
            
            {/* Tutorial Info */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2 text-gray-400 text-sm mb-2">
                <span>Module {selectedTutorial.module_number}</span>
                <span>•</span>
                <span>Tutorial {selectedTutorial.tutorial_number}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {selectedTutorial.duration_minutes} min
                </span>
                {isCompleted(selectedTutorial.id) && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-green-400">
                      <CheckCircle className="w-3 h-3" />
                      Completed
                    </span>
                  </>
                )}
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                {selectedTutorial.title}
              </h1>
              
              <p className="text-gray-400">
                {selectedTutorial.description}
              </p>
            </div>
            
            {/* Key Takeaways */}
            {canAccess(selectedTutorial) && selectedTutorial.key_takeaways.length > 0 && (
              <KeyTakeaways takeaways={selectedTutorial.key_takeaways} />
            )}
            
            {/* Mark Complete Button */}
            {canAccess(selectedTutorial) && !isCompleted(selectedTutorial.id) && (
              <div className="mt-6">
                <button
                  onClick={handleMarkComplete}
                  className="px-6 py-3 bg-[#ff9e19] text-black font-semibold rounded-lg hover:bg-[#ffb347] transition-colors"
                >
                  Mark as Complete
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Welcome State */
          <div className="max-w-4xl mx-auto p-4 md:p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">
                The Science of Neural Liberation
              </h1>
              <p className="text-gray-400 text-lg">
                This comprehensive program integrates cutting-edge neuroscience with ancient wisdom 
                to help you understand how your brain creates your reality—and how to reshape it consciously.
              </p>
            </div>
            
            {/* Module Overview Cards */}
            <div className="space-y-4">
              {modules.map((module) => (
                <ModuleOverviewCard 
                  key={module.number}
                  module={module}
                  onSelectTutorial={handleTutorialSelect}
                  canAccess={canAccess}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Video Modal (for AI suggestions) */}
      {videoModal.isOpen && videoModal.tutorial && (
        <VideoModal
          tutorial={videoModal.tutorial}
          onClose={closeVideoModal}
        />
      )}
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface ModuleSectionProps {
  module: CourseModule;
  isExpanded: boolean;
  onToggle: () => void;
  selectedTutorialId: string | undefined;
  onSelectTutorial: (tutorial: TutorialWithProgress) => void;
  canAccess: (tutorial: TutorialWithProgress) => boolean;
  isCompleted: (tutorialId: string) => boolean;
}

function ModuleSection({ 
  module, 
  isExpanded, 
  onToggle, 
  selectedTutorialId,
  onSelectTutorial,
  canAccess,
  isCompleted 
}: ModuleSectionProps) {
  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 rounded-lg bg-[#111111] hover:bg-[#1a1a1a] transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          <div className="text-left">
            <p className="text-white text-sm font-medium">
              Module {module.number}
              {module.isLocked && <Lock className="w-3 h-3 inline ml-2 text-gray-500" />}
            </p>
            <p className="text-gray-500 text-xs truncate max-w-[180px]">
              {module.title}
            </p>
          </div>
        </div>
        <span className="text-xs text-gray-500">
          {module.completedCount}/{module.totalCount}
        </span>
      </button>
      
      {isExpanded && (
        <div className="mt-2 ml-4 space-y-1">
          {module.tutorials.map((tutorial) => (
            <TutorialListItem
              key={tutorial.id}
              tutorial={tutorial}
              isSelected={tutorial.id === selectedTutorialId}
              onSelect={() => onSelectTutorial(tutorial)}
              isAccessible={canAccess(tutorial)}
              isComplete={isCompleted(tutorial.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TutorialListItemProps {
  tutorial: TutorialWithProgress;
  isSelected: boolean;
  onSelect: () => void;
  isAccessible: boolean;
  isComplete: boolean;
}

function TutorialListItem({ 
  tutorial, 
  isSelected, 
  onSelect, 
  isAccessible, 
  isComplete 
}: TutorialListItemProps) {
  return (
    <button
      onClick={onSelect}
      disabled={!isAccessible}
      className={`
        w-full text-left p-2 rounded-lg text-sm transition-colors
        ${isSelected 
          ? 'bg-[#ff9e19]/20 border border-[#ff9e19]/40' 
          : 'hover:bg-[#111111]'
        }
        ${!isAccessible ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <div className="flex items-center gap-2">
        {isComplete ? (
          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
        ) : !isAccessible ? (
          <Lock className="w-4 h-4 text-gray-500 flex-shrink-0" />
        ) : (
          <Play className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
        <span className={`truncate ${isComplete ? 'text-green-400' : 'text-gray-300'}`}>
          {tutorial.tutorial_number}. {tutorial.title}
        </span>
      </div>
    </button>
  );
}

interface ModuleOverviewCardProps {
  module: CourseModule;
  onSelectTutorial: (tutorial: TutorialWithProgress) => void;
  canAccess: (tutorial: TutorialWithProgress) => boolean;
}

function ModuleOverviewCard({ module, onSelectTutorial, canAccess }: ModuleOverviewCardProps) {
  const firstAccessible = module.tutorials.find(t => canAccess(t));
  
  return (
    <div className={`
      p-6 rounded-lg border transition-colors
      ${module.isLocked 
        ? 'bg-[#111111] border-gray-800 opacity-60' 
        : 'bg-[#111111] border-gray-700 hover:border-gray-600'
      }
    `}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white font-semibold flex items-center gap-2">
            Module {module.number}: {module.title}
            {module.isLocked && <Lock className="w-4 h-4 text-gray-500" />}
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            {module.description}
          </p>
        </div>
        <span className="text-sm text-gray-500">
          {module.completedCount}/{module.totalCount}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="h-1 bg-gray-800 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-[#ff9e19] transition-all duration-500"
          style={{ width: `${(module.completedCount / module.totalCount) * 100}%` }}
        />
      </div>
      
      {/* Tutorial list preview */}
      <div className="space-y-2">
        {module.tutorials.slice(0, 3).map((tutorial) => (
          <div 
            key={tutorial.id}
            className="flex items-center gap-2 text-sm text-gray-400"
          >
            {tutorial.isCompleted ? (
              <CheckCircle className="w-3 h-3 text-green-400" />
            ) : !canAccess(tutorial) ? (
              <Lock className="w-3 h-3 text-gray-500" />
            ) : (
              <Play className="w-3 h-3" />
            )}
            <span className="truncate">{tutorial.title}</span>
          </div>
        ))}
        {module.tutorials.length > 3 && (
          <p className="text-xs text-gray-500">
            +{module.tutorials.length - 3} more tutorials
          </p>
        )}
      </div>
      
      {/* Start button */}
      {firstAccessible && (
        <button
          onClick={() => onSelectTutorial(firstAccessible)}
          className="mt-4 px-4 py-2 bg-[#ff9e19]/20 text-[#ff9e19] rounded-lg text-sm font-medium hover:bg-[#ff9e19]/30 transition-colors"
        >
          {module.completedCount > 0 ? 'Continue' : 'Start Module'}
        </button>
      )}
    </div>
  );
}

interface LockOverlayProps {
  requiredStage: number;
}

function LockOverlay({ requiredStage }: LockOverlayProps) {
  const stageName = STAGE_NAMES[requiredStage] || `Stage ${requiredStage}`;
  
  return (
    <div className="absolute inset-0 bg-gray-900/95 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
        <Lock className="w-8 h-8 text-gray-500" />
      </div>
      
      <h3 className="text-white font-semibold text-lg mb-2">
        Content Locked
      </h3>
      
      <p className="text-gray-400 text-sm mb-4 max-w-sm">
        This tutorial unlocks at Stage {requiredStage}: {stageName}.
      </p>
      
      <p className="text-gray-500 text-xs">
        Continue your IOS practices to unlock.
      </p>
    </div>
  );
}

interface KeyTakeawaysProps {
  takeaways: string[];
}

function KeyTakeaways({ takeaways }: KeyTakeawaysProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <div className="bg-[#111111] rounded-lg border border-gray-800">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4"
      >
        <span className="text-white font-semibold">Key Takeaways</span>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {takeaways.map((takeaway, index) => (
            <div key={index} className="flex gap-3">
              <span className="text-[#ff9e19] flex-shrink-0">•</span>
              <p className="text-gray-400 text-sm">{takeaway}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
