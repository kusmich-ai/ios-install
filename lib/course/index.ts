// lib/course/index.ts
// Central export for all course-related functionality

// Types
export type {
  CourseTutorial,
  CourseProgress,
  TutorialWithProgress,
  CourseModule,
  ProgressUpdatePayload,
  CourseAnalyticsEvent
} from './types';

export { MODULE_INFO, STAGE_NAMES } from './types';

// Queries
export {
  getAllTutorials,
  getTutorialsByModule,
  getTutorialById,
  getTutorialByNumber,
  searchTutorials,
  findTutorialByKeywords,
  getUserProgress,
  getTutorialProgress,
  upsertProgress,
  markTutorialComplete,
  updateWatchProgress,
  resetTutorialProgress,
  getUserCompletionStats,
  getAISuggestionStats
} from './queries';

// Hooks
export {
  useCourse,
  useTutorial,
  useAISuggestion,
  useCompletionStats
} from './hooks';
