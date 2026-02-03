// stores/courseStore.ts
// Zustand store for course state management
// Handles video modal state and cross-component communication

import { create } from 'zustand';
import type { CourseTutorial, CourseProgress } from '@/lib/course/types';

// ============================================
// TYPES
// ============================================

interface VideoModalState {
  isOpen: boolean;
  tutorial: CourseTutorial | null;
  source: 'library' | 'ai_suggestion' | 'modal';
}

interface CourseState {
  // Video Modal
  videoModal: VideoModalState;
  openVideoModal: (tutorial: CourseTutorial, source?: 'library' | 'ai_suggestion' | 'modal') => void;
  closeVideoModal: () => void;
  
  // Selected Tutorial (for library page)
  selectedTutorialId: string | null;
  setSelectedTutorialId: (id: string | null) => void;
  
  // Expanded Modules (for sidebar)
  expandedModules: Set<number>;
  toggleModule: (moduleNumber: number) => void;
  expandModule: (moduleNumber: number) => void;
  collapseModule: (moduleNumber: number) => void;
  
  // Recently Watched (for "Continue Watching" section)
  recentlyWatched: string[];
  addToRecentlyWatched: (tutorialId: string) => void;
  
  // AI Suggestion State
  lastAISuggestion: {
    tutorialId: string;
    timestamp: number;
    dismissed: boolean;
  } | null;
  setLastAISuggestion: (tutorialId: string) => void;
  dismissAISuggestion: () => void;
  
  // Sidebar visibility (mobile)
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

// ============================================
// STORE
// ============================================

export const useCourseStore = create<CourseState>((set, get) => ({
  // Video Modal
  videoModal: {
    isOpen: false,
    tutorial: null,
    source: 'library'
  },
  
  openVideoModal: (tutorial, source = 'library') => {
    set({
      videoModal: {
        isOpen: true,
        tutorial,
        source
      }
    });
    // Track in recently watched
    get().addToRecentlyWatched(tutorial.id);
  },
  
  closeVideoModal: () => {
    set({
      videoModal: {
        isOpen: false,
        tutorial: null,
        source: 'library'
      }
    });
  },
  
  // Selected Tutorial
  selectedTutorialId: null,
  setSelectedTutorialId: (id) => set({ selectedTutorialId: id }),
  
  // Expanded Modules
  expandedModules: new Set([1]), // Module 1 expanded by default
  
  toggleModule: (moduleNumber) => {
    const current = get().expandedModules;
    const newSet = new Set(current);
    if (newSet.has(moduleNumber)) {
      newSet.delete(moduleNumber);
    } else {
      newSet.add(moduleNumber);
    }
    set({ expandedModules: newSet });
  },
  
  expandModule: (moduleNumber) => {
    const current = get().expandedModules;
    const newSet = new Set(current);
    newSet.add(moduleNumber);
    set({ expandedModules: newSet });
  },
  
  collapseModule: (moduleNumber) => {
    const current = get().expandedModules;
    const newSet = new Set(current);
    newSet.delete(moduleNumber);
    set({ expandedModules: newSet });
  },
  
  // Recently Watched
  recentlyWatched: [],
  
  addToRecentlyWatched: (tutorialId) => {
    const current = get().recentlyWatched;
    // Remove if already exists, then add to front
    const filtered = current.filter(id => id !== tutorialId);
    const updated = [tutorialId, ...filtered].slice(0, 5); // Keep max 5
    set({ recentlyWatched: updated });
  },
  
  // AI Suggestion
  lastAISuggestion: null,
  
  setLastAISuggestion: (tutorialId) => {
    set({
      lastAISuggestion: {
        tutorialId,
        timestamp: Date.now(),
        dismissed: false
      }
    });
  },
  
  dismissAISuggestion: () => {
    const current = get().lastAISuggestion;
    if (current) {
      set({
        lastAISuggestion: {
          ...current,
          dismissed: true
        }
      });
    }
  },
  
  // Sidebar
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen }))
}));

// ============================================
// HELPER HOOKS
// ============================================

/**
 * Hook for video modal state only
 */
export function useVideoModal() {
  const { videoModal, openVideoModal, closeVideoModal } = useCourseStore();
  return { ...videoModal, open: openVideoModal, close: closeVideoModal };
}

/**
 * Hook for module expansion state
 */
export function useModuleExpansion() {
  const { expandedModules, toggleModule, expandModule, collapseModule } = useCourseStore();
  
  const isExpanded = (moduleNumber: number) => expandedModules.has(moduleNumber);
  
  return {
    isExpanded,
    toggle: toggleModule,
    expand: expandModule,
    collapse: collapseModule
  };
}

/**
 * Hook for AI suggestion tracking
 */
export function useAISuggestionTracking() {
  const { lastAISuggestion, setLastAISuggestion, dismissAISuggestion } = useCourseStore();
  
  // Don't suggest same tutorial within 1 hour
  const canSuggest = (tutorialId: string): boolean => {
    if (!lastAISuggestion) return true;
    if (lastAISuggestion.tutorialId !== tutorialId) return true;
    
    const hourAgo = Date.now() - (60 * 60 * 1000);
    return lastAISuggestion.timestamp < hourAgo;
  };
  
  return {
    lastSuggestion: lastAISuggestion,
    setSuggestion: setLastAISuggestion,
    dismiss: dismissAISuggestion,
    canSuggest
  };
}
