'use client';

import { useState, useEffect, useMemo } from 'react';

interface PromptStartersProps {
  stage: number;
  daysInStage: number;
  onPromptSelect: (prompt: string) => void;
  visible: boolean;
}

const PROMPT_LIBRARY: Record<number, Record<string, string[]>> = {
  1: {
    morning: [
      "Help me think through a decision I'm facing",
      "I'm feeling off today — help me work with it",
      "Tell me more about how HRVB rewires my brain",
      "Something's been on my mind — can we talk it through?",
      "Help me notice what's happening in my body right now",
    ],
    afternoon: [
      "Quick awareness check — help me notice what's here",
      "I need to think through a work situation",
      "Something happened today I want to process",
      "I'm feeling stuck — help me see the pattern",
      "Run me through a quick decentering",
    ],
    evening: [
      "Help me wind down — what should I notice right now?",
      "I want to understand why today felt the way it did",
      "Something's looping in my mind — help me clear it",
      "Run me through a quick decentering",
      "Tell me about what's happening in my nervous system",
    ],
  },
  2: {
    morning: [
      "Help me think through something on my mind",
      "I'm noticing a pattern — help me see it clearly",
      "Tell me more about how Somatic Flow works",
      "I'm feeling reactive today — help me work with it",
    ],
    afternoon: [
      "I need a thinking partner for a decision",
      "Something triggered me — can we reframe it?",
      "Help me check in with my body right now",
      "I'm overthinking something — help me cut through it",
    ],
    evening: [
      "Help me process today before I wind down",
      "I want to reflect on a pattern I noticed this week",
      "Run me through a meta-reflection",
      "What should I be paying attention to at this stage?",
    ],
  },
  3: {
    morning: [
      "Help me think through a challenge I'm facing",
      "My identity feels off today — let's explore it",
      "I'm feeling resistance — help me understand it",
      "I need to reframe something that happened",
    ],
    afternoon: [
      "I need a thinking partner for a big decision",
      "Something triggered me — run the Reframe Protocol",
      "I'm stuck in a story about myself — help me see through it",
      "Help me think about my identity sprint so far",
    ],
    evening: [
      "Help me process today",
      "I want to do an identity audit",
      "Run me through a decentering practice",
      "What patterns are showing up in my data?",
    ],
  },
};

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

// Simple daily seed for consistent-per-day random selection
function getDailySeed(): number {
  const today = new Date().toLocaleDateString('en-CA');
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = ((hash << 5) - hash) + today.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function selectPrompts(prompts: string[], count: number): string[] {
  const seed = getDailySeed();
  const shuffled = [...prompts].sort((a, b) => {
    const hashA = seed * (prompts.indexOf(a) + 1) % 997;
    const hashB = seed * (prompts.indexOf(b) + 1) % 997;
    return hashA - hashB;
  });
  return shuffled.slice(0, count);
}

export default function PromptStarters({ stage, daysInStage, onPromptSelect, visible }: PromptStartersProps) {
  const timeOfDay = getTimeOfDay();
  
  const prompts = useMemo(() => {
    const stagePrompts = PROMPT_LIBRARY[stage] || PROMPT_LIBRARY[1];
    const timePrompts = stagePrompts[timeOfDay] || stagePrompts.morning;
    return selectPrompts(timePrompts, 3);
  }, [stage, timeOfDay]);

  if (!visible || prompts.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-4 pb-3">
      {prompts.map((prompt, i) => (
        <button
          key={i}
          onClick={() => onPromptSelect(prompt)}
          className="
            px-3 py-2 text-xs text-zinc-400 
            bg-white/[0.03] border border-white/[0.06] 
            rounded-lg hover:border-amber-500/30 hover:text-zinc-300
            hover:bg-white/[0.05] transition-all duration-200
            text-left leading-snug max-w-[280px]
          "
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
