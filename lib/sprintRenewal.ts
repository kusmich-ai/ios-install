// ============================================
// lib/sprintRenewal.ts
// Sprint Renewal Logic for 21-Day Cycles
// Handles Continue/Evolve/Pivot flows for Identity and Flow Block sprints
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
 * Check if an identity sprint has completed (Day 22+)
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
 * Get the identity sprint completion message with options
 */
export function getIdentitySprintCompleteMessage(
  identity: string,
  microAction: string,
  sprintNumber: number
): string {
  return `🎯 **21-Day Identity Sprint Complete!**

You've completed Sprint ${sprintNumber} as **"${identity}"**.

Your daily proof: *${microAction}*

---

**What's next?**

You have three options:

**Continue** — Keep the same identity. Reset to Day 1 and deepen your embodiment.

**Evolve** — Stretch this identity forward. For example, "Calm Leader" → "Visionary Leader" or "Consistent Creator" → "Prolific Creator".

**Pivot** — Choose a completely new identity for a different area of your life.

Which feels right for your next 21 days?`;
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
  { id: 'continue', text: 'Continue', label: 'Keep same identity' },
  { id: 'evolve', text: 'Evolve', label: 'Stretch it forward' },
  { id: 'pivot', text: 'Pivot', label: 'New identity' }
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
  
  // Check for explicit option selections
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
  return `**Sprint renewed.** ✓

Identity: **${identity}**
Daily proof: *${microAction}*

Day 1 of 21 begins now. Same identity, deeper embodiment. Your nervous system already knows this pattern — now we're reinforcing it further.

See you tomorrow morning for your micro-action.`;
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
  return `Good choice. Let's evolve **"${previousIdentity}"**.

Evolution means stretching the same core quality forward — taking what's working and amplifying it.

Some examples:
- "Calm Leader" → "Visionary Leader" (adding forward vision)
- "Consistent Creator" → "Prolific Creator" (amplifying output)
- "Present Partner" → "Deeply Connected Partner" (deepening quality)

**How would you like to evolve "${previousIdentity}"?**

Share what feels like the natural next level, or describe where you want to stretch.`;
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
  return `Fresh start. Let's discover your next identity.

We'll run through the Identity Installation Protocol to find what wants to emerge for the next 21 days.

**Is there currently somewhere in your life that feels misaligned with who you are?**

It could be internal (thoughts, reactive energy, overwhelm) or external (relationships, work, health). Just name what's present.`;
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
  return `**Identity evolved.** ✓

From: "${oldIdentity}"
To: **"${newIdentity}"**
Daily proof: *${newMicroAction}*

Day 1 of 21 begins now. This is the next level of who you're becoming.

See you tomorrow morning for your micro-action.`;
}
