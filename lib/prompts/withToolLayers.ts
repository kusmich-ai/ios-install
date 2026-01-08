// lib/prompts/withToolLayers.ts
import { withCueKernel } from '@/lib/prompts/withCueKernel';
import { PERFORMANCE_SAFE_CUE_PRESETS } from '@/lib/prompts/performanceCuePresets';

export function withToolLayers(basePrompt: string): string {
  // presets first, cue kernel last
  return withCueKernel(`${basePrompt}\n\n${PERFORMANCE_SAFE_CUE_PRESETS}`);
}
