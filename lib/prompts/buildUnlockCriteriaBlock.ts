// lib/prompts/buildUnlockCriteriaBlock.ts
// Sprint 6 T3.1 — generates the STAGE UNLOCK CRITERIA block injected into
// mainSystemPromptBase. Replaces hotfix-2's static text with dynamic
// rendering from stages.ts so Sprint 7 Stages 2-6 recalibration propagates
// to the AI automatically.

import type { Stage } from '@/app/config/stages';

const PREAMBLE = `## STAGE UNLOCK CRITERIA (FOR REFERENCE WHEN USER ASKS)

When a user asks "what do I need to unlock?" or similar, answer with the criteria for their CURRENT stage below. Do not invent numbers. If unsure, defer to: "The system evaluates automatically — when you're eligible, the unlock prompt appears."`;

const STAGE_6_OVERRIDE = `**Stage 6 → 7:** Manual review required. User must complete application to advance.`;

/**
 * Stage 1 special-case: 3-condition structure with all 4 improvement paths
 * (A/B/C/D) enumerated. Path A's baseline detail (first-3 signal_checks)
 * lives in useUserProgress runtime and is intentionally not surfaced here —
 * "calm improvement vs baseline" is the user-facing framing.
 *
 * Numeric thresholds read from stage.unlockCriteria fields where present:
 *   - adherence + days → standard path
 *   - acceleratedAdherence + acceleratedDays → accelerated path
 *   - deltaThreshold → both Path B (domain delta) and Path A (calm improvement)
 *   - competenceBypass → Path C
 *   - hardWeekAdherence → Path D (high-engagement)
 *
 * The "(last 14 days)" calm-trend window is hardcoded — Stage 1 uses a
 * 14-day signal-check window per useUserProgress.ts (Stage 2+ uses 7d).
 */
function renderStage1(stage: Stage): string {
  const c = stage.unlockCriteria;
  return [
    `**Stage 1 → 2** — three conditions:`,
    `- Time + adherence (either):`,
    `  - Standard: ≥${c.adherence}% adherence over ${c.days} days`,
    `  - Accelerated: ≥${c.acceleratedAdherence}% adherence over ${c.acceleratedDays} days`,
    `- Improvement signal (at least one):`,
    `  - Domain delta ≥ +${c.deltaThreshold}`,
    `  - Calm improvement vs baseline (≥+${c.deltaThreshold})`,
    `  - Avg domain score ≥ ${c.competenceBypass} (competence — waives delta)`,
    `  - Adherence ≥ ${c.hardWeekAdherence}% (high-engagement path)`,
    `- Calm trend not declining (last 14 days)`,
  ].join('\n');
}

/**
 * Generic stages 2-5: standard adherence/days/delta line + accelerated
 * adherence/days line when present.
 */
function renderGenericStage(stage: Stage): string {
  const c = stage.unlockCriteria;
  const lines = [
    `**Stage ${stage.number} → ${stage.number + 1}:**`,
    `- Standard: ≥${c.adherence}% adherence over ${c.days} days + ≥+${c.deltaThreshold} delta`,
  ];
  if (c.acceleratedAdherence !== undefined && c.acceleratedDays !== undefined) {
    lines.push(`- Accelerated: ≥${c.acceleratedAdherence}% adherence over ${c.acceleratedDays} days`);
  }
  return lines.join('\n');
}

export function buildUnlockCriteriaBlock(stages: Stage[]): string {
  const sections: string[] = [PREAMBLE];

  for (const stage of stages) {
    // Stage 7 has no forward transition — terminal stage
    if (stage.number === 7) continue;

    // Stage 6 → 7 is application-based; override unlockCriteria data
    if (stage.number === 6) {
      sections.push(STAGE_6_OVERRIDE);
      continue;
    }

    if (stage.number === 1) {
      sections.push(renderStage1(stage));
      continue;
    }

    sections.push(renderGenericStage(stage));
  }

  return sections.join('\n\n');
}
