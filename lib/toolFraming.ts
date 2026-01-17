// lib/toolFraming.ts
// Universal framing for on-demand tools to prevent misattribution
// Tools don't "fix" - they restore clarity when interpretation distorts signal

// ============================================
// UNIVERSAL FRAME (shown once per tool session)
// ============================================

export const toolUniversalFrame =
  "Tools don't fix states. They restore clarity when interpretation is distorting signal.";

// ============================================
// TOOL-SPECIFIC FRAMES
// ============================================

export const toolFrames = {
  decentering: {
    introLine: toolUniversalFrame
  },
  worry_loop: {
    introLine: toolUniversalFrame
  },
  meta_reflection: {
    introLine: toolUniversalFrame
  },
  reframe: {
    introLine: toolUniversalFrame
  },
  thought_hygiene: {
    introLine: toolUniversalFrame
  }
} as const;

// ============================================
// LOW-RESULT FALLBACK (when tool shows no shift)
// ============================================

export const lowResultFrame =
  "No shift is still data. It usually means (1) Signal is high, (2) Interpretation is fused, or (3) Action is unclear.\nReturn to: Signal → Interpretation → Action.";

// ============================================
// TOOL SESSION OUTCOME TYPES
// These are stored as "capacity signals" not success/fail
// ============================================

export interface ToolSessionOutcome {
  clarity_rating: number | null;           // 1-5 scale
  was_signal_named: boolean;               // Did user identify the raw signal?
  was_interpretation_identified: boolean;  // Did user recognize their story/interpretation?
  action_selected: boolean;                // Did user choose a next step?
  session_duration_seconds?: number;       // Optional timing
  tool_type: keyof typeof toolFrames;
  timestamp: string;
}

// Helper to create a blank outcome
export const createBlankOutcome = (toolType: keyof typeof toolFrames): ToolSessionOutcome => ({
  clarity_rating: null,
  was_signal_named: false,
  was_interpretation_identified: false,
  action_selected: false,
  tool_type: toolType,
  timestamp: new Date().toISOString()
});

// ============================================
// LOW RESULT DETECTION
// ============================================

export const isLowResult = (clarityRating: number | null): boolean => {
  return clarityRating !== null && clarityRating <= 2;
};

export const shouldShowLowResultFrame = (
  clarityRating: number | null,
  sessionCountToday: number
): boolean => {
  // Show if rating is low OR they've used the tool 3+ times quickly
  return isLowResult(clarityRating) || sessionCountToday >= 3;
};
