// lib/course/types.ts
// TypeScript types for the Science of Neural Liberation course

export interface CourseTutorial {
  id: string;
  module_number: number;
  tutorial_number: number;
  title: string;
  description: string | null;
  duration_minutes: number;
  vimeo_video_id: string;
  thumbnail_url: string | null;
  unlock_stage: number;
  key_takeaways: string[];
  ai_trigger_keywords: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CourseProgress {
  id: string;
  user_id: string;
  tutorial_id: string;
  started_at: string;
  completed_at: string | null;
  watch_percentage: number;
  last_position_seconds: number;
  source: 'library' | 'ai_suggestion' | 'modal';
  created_at: string;
  updated_at: string;
}

export interface TutorialWithProgress extends CourseTutorial {
  progress: CourseProgress | null;
  isCompleted: boolean;
  isAccessible: boolean;
}

export interface CourseModule {
  number: number;
  title: string;
  description: string;
  tutorials: TutorialWithProgress[];
  isLocked: boolean;
  completedCount: number;
  totalCount: number;
}

// Module metadata (static)
export const MODULE_INFO: Record<number, { title: string; description: string }> = {
  1: {
    title: 'The Neuroscience of Unbecoming',
    description: 'Understanding the brain\'s role in creating separation and the path to liberation through awareness.'
  },
  2: {
    title: 'The Science of Neuroplasticity and Change',
    description: 'How brain chemistry shapes reality and enables transformation.'
  },
  3: {
    title: 'Liberation Practices and Integration',
    description: 'Practical approaches for working with thoughts, emotions, and the body.'
  },
  4: {
    title: 'Sustainable Transformation and Continued Evolution',
    description: 'Creating lasting change and continuing the journey beyond the course.'
  }
};

// Stage names for UI display
export const STAGE_NAMES: Record<number, string> = {
  1: 'Neural Priming',
  2: 'Embodied Awareness',
  3: 'Identity Mode',
  4: 'Flow Mode',
  5: 'Relational Coherence',
  6: 'Integration',
  7: 'Accelerated Expansion'
};

// Helper type for progress update payloads
export interface ProgressUpdatePayload {
  watch_percentage?: number;
  last_position_seconds?: number;
  completed_at?: string | null;
  source?: 'library' | 'ai_suggestion' | 'modal';
}

// Analytics event types
export type CourseAnalyticsEvent = 
  | { type: 'tutorial_started'; tutorialId: string; source: string }
  | { type: 'tutorial_completed'; tutorialId: string; source: string; watchTime: number }
  | { type: 'tutorial_progress'; tutorialId: string; percentage: number }
  | { type: 'ai_suggestion_shown'; tutorialId: string; triggerKeyword: string }
  | { type: 'ai_suggestion_accepted'; tutorialId: string }
  | { type: 'ai_suggestion_dismissed'; tutorialId: string };
