// ============================================
// UPDATED MicroActionState Interface
// ============================================

export interface MicroActionState {
  isActive: boolean;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  extractedIdentity: string | null;
  extractedAction: string | null;
  isComplete: boolean;
  sprintStartDate: string | null;
  sprintNumber: number;  // NEW: Track which 21-day sprint we're on
}

export const initialMicroActionState: MicroActionState = {
  isActive: false,
  conversationHistory: [],
  extractedIdentity: null,
  extractedAction: null,
  isComplete: false,
  sprintStartDate: null,
  sprintNumber: 1  // NEW: Start at sprint 1
};

// ============================================
// SPRINT HELPER FUNCTIONS
// ============================================

/**
 * Calculate which day of the current sprint we're on (1-21)
 */
export function getSprintDayNumber(sprintStartDate: string): number {
  const start = new Date(sprintStartDate);
  start.setHours(0, 0, 0, 0); // Normalize to start of day
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 because day 1 is start date
  
  return Math.max(1, Math.min(diffDays, 21)); // Clamp between 1-21
}

/**
 * Check if current sprint is complete (past 21 days)
 */
export function isSprintComplete(sprintStartDate: string): boolean {
  return getSprintDayNumber(sprintStartDate) >= 21 && hasFullDayPassed(sprintStartDate, 21);
}

/**
 * Check if N full days have passed since sprint start
 */
function hasFullDayPassed(sprintStartDate: string, days: number): boolean {
  const start = new Date(sprintStartDate);
  start.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(start);
  targetDate.setDate(targetDate.getDate() + days);
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  return now >= targetDate;
}

/**
 * Get formatted sprint status string
 */
export function getSprintStatus(sprintStartDate: string | null, sprintNumber: number): string {
  if (!sprintStartDate) {
    return 'Not started';
  }
  
  const dayNumber = getSprintDayNumber(sprintStartDate);
  const complete = isSprintComplete(sprintStartDate);
  
  if (complete) {
    return `Sprint ${sprintNumber} Complete ✓`;
  }
  
  return `Sprint ${sprintNumber}, Day ${dayNumber}/21`;
}

/**
 * Calculate state for starting a new sprint
 */
export function startNewSprint(currentSprintNumber: number): Partial<MicroActionState> {
  return {
    isActive: true,
    conversationHistory: [],
    extractedIdentity: null,
    extractedAction: null,
    isComplete: false,
    sprintStartDate: new Date().toISOString(),
    sprintNumber: currentSprintNumber + 1
  };
}

/**
 * Get days remaining in current sprint
 */
export function getDaysRemaining(sprintStartDate: string): number {
  const currentDay = getSprintDayNumber(sprintStartDate);
  return Math.max(0, 21 - currentDay);
}


// ============================================
// UPDATED SYSTEM PROMPT ADDITION
// ============================================

// Add this to the end of microActionSystemPrompt for returning users:
export const returningUserContext = (sprintNumber: number, previousIdentity: string, previousAction: string) => `

## RETURNING USER CONTEXT
This user is starting Sprint ${sprintNumber}. Their previous identity was: "${previousIdentity}"
Their previous micro-action was: "${previousAction}"

When opening, acknowledge their previous sprint and ask:
1. How did that identity feel over the last 21 days?
2. What landed? What shifted?
3. Based on their response, suggest either:
   - Evolution (stretching the same identity forward)
   - Layering (stacking a new one on a stable foundation)
   - Complete pivot (if the previous one didn't resonate)
`;
