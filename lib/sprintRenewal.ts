// ============================================
// lib/sprintRenewal.ts
// Sprint Renewal Logic for 21-Day Cycles
// Handles Continue/Evolve/Pivot flows for Cue Focus and Flow Block sprints
// ============================================

// ============================================
// TYPES
// ============================================

export type SprintRenewalType = 'identity' | 'flow_block' | null;
export type SprintRenewalOption = 'continue' | 'evolve' | 'pivot' | null;

export interface CompletedSprintInfo {
  type: 'identity' | 'flow_block';
  sprintNumber: number;
  identity?: string;
  microAction?: string;
  weeklyMap?: any;
  domains?: string[];
  focusType?: 'concentrated' | 'distributed';
}

export interface SprintRenewalState {
  isActive: boolean;
  renewalType: SprintRenewalType;
  selectedOption: SprintRenewalOption;
  completedSprintInfo: CompletedSprintInfo | null;
  awaitingEvolutionInput: boolean;
}

export const initialSprintRenewalState: SprintRenewalState = {
  isActive: false,
  renewalType: null,
  selectedOption: null,
  completedSprintInfo: null,
  awaitingEvolutionInput: false
};

// ============================================
// DETECTION HELPERS
// ============================================

/**
 * Check if a Cue Focus sprint has completed (Day 22+)
 */
export function isIdentitySprintComplete(sprintDay: number | null | undefined): boolean {
  return sprintDay !== null && sprintDay !== undefined && sprintDay > 21;
}

/**
 * Check if a flow block sprint has completed (Day 22+)
 */
export function isFlowBlockSprintComplete(sprintDay: number | null | undefined): boolean {
  return sprintDay !== null && sprintDay !== undefined && sprintDay > 21;
}

// ============================================
// RENEWAL MESSAGES
// ============================================

/**
 * Get the Cue Focus sprint completion message with options
 */
export function getIdentitySprintCompleteMessage(
  identity: string,
  microAction: string,
  sprintNumber: number
): string {
  return `🎯 **21-Day Cue Focus Complete!**

You've completed Sprint ${sprintNumber} training the **"${identity}"** cue.

Your daily practice: *${microAction}*

---

**What's next?**

You have three options:

**Continue** — Keep the same cue. Reset to Day 1 and sharpen your recognition further.

**Evolve** — Stretch this cue forward. For example, "Interpretation" → "Meaning-Making" or "Reactivity" → "Reactivity Under Pressure".

**Pivot** — Choose a completely different cue to train for the next 21 days.

Which feels right for your next Cue Focus?`;
}

/**
 * Get the flow block sprint completion message with options
 */
export function getFlowBlockSprintCompleteMessage(
  domains: string[],
  sprintNumber: number
): string {
  const domainList = domains?.length > 0 ? domains.join(', ') : 'your selected domains';
  
  return `🎯 **21-Day Flow Block Sprint Complete!**

You've completed Sprint ${sprintNumber} training sustained attention across ${domainList}.

---

**What's next?**

You have three options:

**Continue** — Keep the same Flow Menu and Weekly Map. Reset to Day 1 and deepen the pattern.

**Evolve** — Modify your setup. Adjust domains, tasks, duration, or focus style based on what you learned.

**Pivot** — Design a completely new Flow Block system from scratch.

Which feels right for your next 21 days?`;
}

// ============================================
// QUICK REPLY OPTIONS
// ============================================

export const identityRenewalQuickReplies = [
  { id: 'continue', text: 'Continue', label: 'Keep same cue' },
  { id: 'evolve', text: 'Evolve', label: 'Stretch it forward' },
  { id: 'pivot', text: 'Pivot', label: 'New cue' }
];

export const flowBlockRenewalQuickReplies = [
  { id: 'continue', text: 'Continue', label: 'Keep same system' },
  { id: 'evolve', text: 'Evolve', label: 'Modify setup' },
  { id: 'pivot', text: 'Pivot', label: 'Fresh start' }
];

// ============================================
// RESPONSE HANDLERS
// ============================================

/**
 * Parse user response to determine which renewal option they chose
 */
export function parseRenewalResponse(userMessage: string): SprintRenewalOption {
  const message = userMessage.toLowerCase().trim();
  
  if (message === 'continue' || message.includes('continue') || message.includes('same') || message.includes('keep')) {
    return 'continue';
  }
  
  if (message === 'evolve' || message.includes('evolve') || message.includes('stretch') || message.includes('modify') || message.includes('adjust')) {
    return 'evolve';
  }
  
  if (message === 'pivot' || message.includes('pivot') || message.includes('new') || message.includes('different') || message.includes('fresh') || message.includes('change')) {
    return 'pivot';
  }
  
  return null;
}

// ============================================
// CONTINUE OPTION MESSAGES
// ============================================

export function getIdentityContinueMessage(identity: string, microAction: string): string {
  return `**Cue Focus renewed.** ✓

Cue: **${identity}**
Daily practice: *${microAction}*

Day 1 of 21 begins now. Same cue, sharper recognition. Your nervous system already knows this pattern — now we're reinforcing it further.

See you tomorrow morning for your Stack Cue.`;
}

export function getFlowBlockContinueMessage(): string {
  return `**Sprint renewed.** ✓

Your Flow Menu and Weekly Map carry forward. Day 1 of 21 begins now.

Your nervous system already knows the deep work pattern — now we're reinforcing it further. Same rituals, same environment, deeper flow.

Ready for today's Flow Block?`;
}

// ============================================
// EVOLVE OPTION MESSAGES
// ============================================

export function getIdentityEvolvePrompt(previousIdentity: string): string {
  return `Good choice. Let's evolve the **"${previousIdentity}"** cue.

Evolution means stretching the same core pattern forward — taking what you've been noticing and refining the lens.

Some examples:
- "Interpretation" → "Meaning-Making" (zooming out to the broader mechanism)
- "Reactivity" → "Reactivity Under Pressure" (narrowing to a specific context)
- "Avoidance" → "Avoidance in Relationships" (getting more precise)

**How would you like to evolve the "${previousIdentity}" cue?**

Share what feels like the natural next layer to train.`;
}

export function getFlowBlockEvolvePrompt(): string {
  return `Good choice. Let's evolve your Flow Block system.

Based on 21 days of practice, what wants to shift?

Consider:
- **Domains**: Add, remove, or rebalance your life areas?
- **Tasks**: New high-leverage work to add to your menu?
- **Duration**: Ready for longer blocks, or need shorter for some days?
- **Focus Style**: Switch between Concentrated (same domain) and Distributed (varied)?
- **Schedule**: Different days or times work better?

**What's the most important change you want to make?**`;
}

// ============================================
// PIVOT OPTION MESSAGES
// ============================================

export function getIdentityPivotMessage(): string {
  return `Fresh start. Let's find your next cue to train.

We'll run through the Cue Selection process to identify what pattern most wants your attention for the next 21 days.

**Is there somewhere in your life right now where you keep noticing a pattern that's running on autopilot?**

It could be internal (a thought loop, an emotional reaction, an avoidance) or external (a behaviour in relationships, at work, under pressure). Just name what's present.`;
}

export function getFlowBlockPivotMessage(): string {
  return `Fresh start. Let's design your new Flow Block system from scratch.

We'll go through the full Discovery Phase to identify your highest-leverage work across life domains.

**First: What are the 3-4 life domains where you most want to train sustained attention right now?**

Common domains: Professional, Creative, Learning, Health, Relationships, Personal Development, Finance, Side Projects.`;
}

// ============================================
// EVOLUTION CONFIRMATION
// ============================================

export function getIdentityEvolutionConfirmation(
  oldIdentity: string, 
  newIdentity: string,
  newMicroAction: string
): string {
  return `**Cue evolved.** ✓

From: "${oldIdentity}"
To: **"${newIdentity}"**
Daily practice: *${newMicroAction}*

Day 1 of 21 begins now. Sharper lens, deeper recognition.

See you tomorrow morning for your Stack Cue.`;
}
