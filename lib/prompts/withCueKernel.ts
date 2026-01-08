import { CUE_KERNEL } from './cueKernel';

const KERNEL_SENTINEL = '## CUE KERNEL'; // must match a stable line inside CUE_KERNEL

export function withCueKernel(prompt: string): string {
  const p = prompt ?? '';
  if (p.includes(KERNEL_SENTINEL)) return p;
  return `${p}\n\n${CUE_KERNEL}`.trim();
}
