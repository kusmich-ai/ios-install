import { withCueKernel } from '@/lib/prompts/withCueKernel';
import { PERFORMANCE_SAFE_CUE_PRESETS } from '@/lib/prompts/performanceCuePresets';

const PRESETS_SENTINEL = '## PERFORMANCE-SAFE CUE PRESETS'; // must match a stable line inside presets

export function withToolLayers(basePrompt: string): string {
  const base = basePrompt ?? '';
  const hasPresets = base.includes(PRESETS_SENTINEL);
  const merged = hasPresets ? base : `${base}\n\n${PERFORMANCE_SAFE_CUE_PRESETS}`;
  return withCueKernel(merged);
}
