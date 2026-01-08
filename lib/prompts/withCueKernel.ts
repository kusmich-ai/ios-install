// /lib/prompts/withCueKernel.ts

import { CUE_KERNEL } from './cueKernel';

export function withCueKernel(prompt: string): string {
  return `${prompt}\n${CUE_KERNEL}`;
}
