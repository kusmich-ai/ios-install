// components/PromptStarters.tsx
// v2.0: Stage + daysInStage + time-of-day aware prompt starters
'use client';

import { useMemo } from 'react';

interface PromptStartersProps {
  stage: number;
  daysInStage: number;
  onPromptSelect: (prompt: string) => void;
  visible: boolean;
}

// ============================================
// PROMPT LIBRARY
// ============================================
// Structure: Each stage has time-of-day pools.
// Within each pool, prompts are tagged as 'early' (days 0-6), 
// 'mid' (days 7-13), or 'any' (always available).
// This ensures prompts feel contextual to where the user 
// actually is in their stage progression.

interface TaggedPrompt {
  text: string;
  phase: 'early' | 'mid' | 'late' | 'any';
}

const PROMPT_LIBRARY: Record<number, Record<string, TaggedPrompt[]>> = {
  1: {
    morning: [
      // Early: orientation + getting started
      { text: "What should I focus on during Resonance Breathing?", phase: 'early' },
      { text: "How does HRVB actually rewire my nervous system?", phase: 'early' },
      { text: "I did my rituals — what should I notice throughout the day?", phase: 'early' },
      // Mid: going deeper + building consistency
      { text: "I'm noticing something shifting — help me understand it", phase: 'mid' },
      { text: "Am I close to unlocking Stage 2?", phase: 'mid' },
      { text: "Help me notice what's different since I started", phase: 'mid' },
      // Late: unlock-adjacent
      { text: "How's my progress looking?", phase: 'late' },
      { text: "What do I need to unlock the next stage?", phase: 'late' },
      // Any: always relevant
      { text: "I'm feeling off today — help me work with it", phase: 'any' },
      { text: "Something's been on my mind — can we talk it through?", phase: 'any' },
      { text: "Help me notice what's happening in my body right now", phase: 'any' },
    ],
    afternoon: [
      { text: "Quick awareness check — help me notice what's here", phase: 'any' },
      { text: "Something happened today I want to process", phase: 'any' },
      { text: "I'm feeling stuck — help me see the pattern", phase: 'any' },
      { text: "Run me through a quick decentering", phase: 'any' },
      { text: "My sleep has been off — help me troubleshoot", phase: 'mid' },
      { text: "I skipped my practice today — let's talk about it", phase: 'any' },
    ],
    evening: [
      { text: "Help me wind down — what should I notice right now?", phase: 'any' },
      { text: "Something's looping in my mind — help me clear it", phase: 'any' },
      { text: "Run me through a decentering before bed", phase: 'any' },
      { text: "How is my nervous system actually changing?", phase: 'mid' },
      { text: "I want to understand why today felt the way it did", phase: 'any' },
    ],
  },
  2: {
    morning: [
      { text: "How does Somatic Flow connect awareness to my body?", phase: 'early' },
      { text: "What should I pay attention to during movement today?", phase: 'early' },
      { text: "I'm noticing a pattern — help me see it clearly", phase: 'mid' },
      { text: "Am I close to unlocking Stage 3?", phase: 'late' },
      { text: "I'm feeling reactive today — help me work with it", phase: 'any' },
      { text: "How's my progress looking?", phase: 'mid' },
    ],
    afternoon: [
      { text: "Something triggered me — can we work through it?", phase: 'any' },
      { text: "Help me check in with my body right now", phase: 'any' },
      { text: "I'm overthinking something — help me cut through it", phase: 'any' },
      { text: "I need a thinking partner for a decision", phase: 'any' },
      { text: "Help me dial in my movement practice", phase: 'mid' },
    ],
    evening: [
      { text: "Run me through a meta-reflection", phase: 'any' },
      { text: "Help me process today before I wind down", phase: 'any' },
      { text: "I want to reflect on a pattern I noticed this week", phase: 'mid' },
      { text: "What should I be paying attention to at this stage?", phase: 'early' },
    ],
  },
  3: {
    morning: [
      { text: "What patterns has the IOS Cue been surfacing for me?", phase: 'mid' },
      { text: "Something feels misaligned — help me see what's underneath it", phase: 'any' },
      { text: "I'm feeling resistance to my micro-action", phase: 'any' },
      { text: "What would today look like if I just noticed instead of performed?", phase: 'early' },
      { text: "Am I close to unlocking Flow Mode?", phase: 'late' },
      { text: "How's my progress looking?", phase: 'mid' },
    ],
    afternoon: [
      { text: "Something triggered me — run the Reframe Protocol", phase: 'any' },
      { text: "I'm stuck in a story about myself — help me see through it", phase: 'any' },
      { text: "I need to reframe something that happened", phase: 'any' },
      { text: "My micro-action doesn't feel right anymore — can we adjust?", phase: 'mid' },
    ],
    evening: [
      { text: "I want to do an identity audit", phase: 'any' },
      { text: "Run me through a decentering practice", phase: 'any' },
      { text: "What patterns are showing up in my data?", phase: 'mid' },
      { text: "Help me process today", phase: 'any' },
    ],
  },
  4: {
    morning: [
      { text: "Run me through Thought Hygiene before deep work", phase: 'any' },
      { text: "Something's blocking my focus — help me clear it", phase: 'any' },
      { text: "Help me set intention for my Flow Block", phase: 'any' },
      { text: "How's my Flow Block performance trending?", phase: 'mid' },
      { text: "Am I close to unlocking Stage 5?", phase: 'late' },
    ],
    afternoon: [
      { text: "My Flow Block felt off — help me figure out why", phase: 'any' },
      { text: "Something came up during deep work I want to process", phase: 'any' },
      { text: "Run the Reframe Protocol on something that triggered me", phase: 'any' },
      { text: "I want to adjust my Flow Block schedule", phase: 'mid' },
    ],
    evening: [
      { text: "Help me wind down and process today", phase: 'any' },
      { text: "I want to reflect on my Flow Block patterns this week", phase: 'mid' },
      { text: "Something's looping — help me clear it before bed", phase: 'any' },
      { text: "Run me through a meta-reflection", phase: 'any' },
    ],
  },
  5: {
    morning: [
      { text: "Help me prepare for a difficult interaction today", phase: 'any' },
      { text: "I'm noticing tension with someone — help me see the pattern", phase: 'any' },
      { text: "How is co-regulation changing my relational patterns?", phase: 'mid' },
      { text: "Something's been on my mind about a conversation I had", phase: 'any' },
      { text: "How's my progress looking?", phase: 'mid' },
    ],
    afternoon: [
      { text: "I'm feeling reactive toward someone — help me work with it", phase: 'any' },
      { text: "Help me reframe something that happened with someone", phase: 'any' },
      { text: "I need to think through how I'm showing up in a relationship", phase: 'any' },
      { text: "Run me through Thought Hygiene — my mind is cluttered", phase: 'any' },
    ],
    evening: [
      { text: "Help me process a relational moment from today", phase: 'any' },
      { text: "Run me through a decentering around a role I'm stuck in", phase: 'any' },
      { text: "I want to reflect on how I showed up in connection today", phase: 'any' },
      { text: "Something's weighing on me — help me see it clearly", phase: 'any' },
    ],
  },
  6: {
    morning: [
      { text: "I noticed a pattern this week — help me go deeper", phase: 'any' },
      { text: "Something shifted and I want to understand what changed", phase: 'any' },
      { text: "Help me prepare for today with intention", phase: 'any' },
      { text: "What patterns are showing up across my whole journey?", phase: 'mid' },
    ],
    afternoon: [
      { text: "Something old resurfaced — help me reframe it", phase: 'any' },
      { text: "Help me see what reality is teaching me right now", phase: 'any' },
      { text: "I want to do an identity audit", phase: 'any' },
      { text: "I need a thinking partner for something complex", phase: 'any' },
    ],
    evening: [
      { text: "Help me with tonight's debrief — something significant happened", phase: 'any' },
      { text: "I want to do a deep meta-reflection", phase: 'any' },
      { text: "What has awareness been revealing that I haven't fully seen yet?", phase: 'any' },
      { text: "What has the whole journey revealed so far?", phase: 'mid' },
    ],
  },
  7: {
    morning: [
      { text: "Help me think through my expansion protocol", phase: 'any' },
      { text: "I want to explore what's emerging at this stage", phase: 'any' },
      { text: "Something profound shifted — help me articulate it", phase: 'any' },
      { text: "Help me design today's practice with intention", phase: 'any' },
    ],
    afternoon: [
      { text: "Help me process an insight from today", phase: 'any' },
      { text: "I'm noticing awareness operating differently — let's explore", phase: 'any' },
      { text: "I want to go deep on a pattern that's dissolving", phase: 'any' },
      { text: "Help me integrate a recent experience", phase: 'any' },
    ],
    evening: [
      { text: "Help me integrate today before sleep", phase: 'any' },
      { text: "What is awareness teaching me right now?", phase: 'any' },
      { text: "I want to reflect on the whole system operating", phase: 'any' },
      { text: "Something wants to be seen — help me look", phase: 'any' },
    ],
  },
};

// ============================================
// HELPERS
// ============================================

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function getDailyPhase(daysInStage: number): 'early' | 'mid' | 'late' {
  if (daysInStage <= 6) return 'early';
  if (daysInStage <= 13) return 'mid';
  return 'late';
}

// Consistent-per-day seed for stable selection within a session
function getDailySeed(): number {
  const today = new Date().toLocaleDateString('en-CA');
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = ((hash << 5) - hash) + today.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function selectPrompts(taggedPrompts: TaggedPrompt[], daysInStage: number, count: number): string[] {
  const phase = getDailyPhase(daysInStage);
  
  // Filter to prompts matching current phase OR 'any'
  const eligible = taggedPrompts.filter(p => p.phase === phase || p.phase === 'any');
  
  // Fallback: if not enough eligible, include all
  const pool = eligible.length >= count ? eligible : taggedPrompts;
  
  // Deterministic daily shuffle
  const seed = getDailySeed();
  const shuffled = [...pool].sort((a, b) => {
    const hashA = seed * (pool.indexOf(a) + 1) % 997;
    const hashB = seed * (pool.indexOf(b) + 1) % 997;
    return hashA - hashB;
  });
  
  return shuffled.slice(0, count).map(p => p.text);
}

// ============================================
// COMPONENT
// ============================================

export default function PromptStarters({ stage, daysInStage, onPromptSelect, visible }: PromptStartersProps) {
  const timeOfDay = getTimeOfDay();
  
  const prompts = useMemo(() => {
    const stagePrompts = PROMPT_LIBRARY[stage] || PROMPT_LIBRARY[1];
    const timePrompts = stagePrompts[timeOfDay] || stagePrompts.morning;
    return selectPrompts(timePrompts, daysInStage, 3);
  }, [stage, daysInStage, timeOfDay]);

  if (!visible || prompts.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-4 pb-3">
      {prompts.map((prompt, i) => (
        <button
          key={`${prompt}-${i}`}
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
