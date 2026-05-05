'use client';

import { createContext, useContext } from 'react';
import type { AwarenessRepScript } from '@/lib/awarenessRepRotation';

// ============================================================================
// PRACTICE MODALS CONTEXT (Phase 3.C Unit 2)
// ----------------------------------------------------------------------------
// Single source of truth for opening Resonance Breathing and Awareness Rep
// modals. Lifts what used to be three independent useResonanceBreathing /
// useAwarenessRep hook instances (ChatInterface, ToolsSidebar, FAB) down to
// one — the ChatInterface instance — and exposes its open() functions to
// the rest of the tree via this context.
//
// Effect: whichever surface triggers RB/AR (in-chat button, sidebar,
// floating action button), the same modal opens and completion always
// flows back through ChatInterface's handoff-aware handlers.
//
// Scope: RB + AR only. Other on-demand modals (CoReg, NightlyDebrief,
// SomaticFlow, etc.) keep their existing per-component hook instances
// — out of scope for this sprint.
// ============================================================================

export interface PracticeModalsContextValue {
  /** Opens the (single) Resonance Breathing modal. */
  openResonance: () => void;
  /**
   * Opens the (single) Awareness Rep modal.
   * @param audioPath  Optional rotation audio path (omit to use the modal's default).
   * @param script     Optional rotation script identifier — the provider records
   *                   it so completion can persist the rotation advance.
   */
  openAwarenessRep: (audioPath?: string, script?: AwarenessRepScript) => void;
}

export const PracticeModalsContext = createContext<PracticeModalsContextValue | null>(null);

export function usePracticeModals(): PracticeModalsContextValue {
  const ctx = useContext(PracticeModalsContext);
  if (!ctx) {
    throw new Error('usePracticeModals must be used inside <PracticeModalsContext.Provider>');
  }
  return ctx;
}
