'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Check, Zap, Sun, Eye, Moon, Loader2, RotateCcw } from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface CuePhase {
  id: 'morning' | 'midday' | 'evening';
  label: string;
  prompt: string;
  icon: React.ComponentType<{ className?: string }>;
  timeHint: string;
}

interface CuePhaseCardProps {
  userId: string;
  isCompleted: boolean;
  onFullComplete: () => Promise<void>;
  onProgressUpdate?: () => void;
  sprintDay?: number;
  currentCue?: string;
}

// ============================================
// DYNAMIC PHASE DEFINITIONS
// ============================================

function getCuePhases(currentCue: string): CuePhase[] {
  return [
    {
      id: 'morning',
      label: 'Imprint',
      prompt: `6 breaths. On each exhale, silently say: "${currentCue}."`,
      icon: Sun,
      timeHint: 'AM',
    },
    {
      id: 'midday',
      label: 'Loop',
      prompt: 'Notice → Label → Release',
      icon: Eye,
      timeHint: 'Day',
    },
    {
      id: 'evening',
      label: 'Consolidate',
      prompt: 'Recall one catch. Feel the body soften. Let sleep lock it in.',
      icon: Moon,
      timeHint: 'PM',
    },
  ];
}

// ============================================
// LOCAL STORAGE HELPERS
// ============================================

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getStorageKey(userId: string): string {
  return `cue_phases_${userId}_${getTodayKey()}`;
}

interface PhaseState {
  morning: boolean;
  midday: boolean;
  evening: boolean;
}

function loadPhaseState(userId: string): PhaseState {
  if (typeof window === 'undefined') return { morning: false, midday: false, evening: false };
  
  try {
    const stored = localStorage.getItem(getStorageKey(userId));
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('[CuePhaseCard] Error loading phase state:', e);
  }
  return { morning: false, midday: false, evening: false };
}

function savePhaseState(userId: string, state: PhaseState): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(state));
  } catch (e) {
    console.error('[CuePhaseCard] Error saving phase state:', e);
  }
}

/**
 * Cleanup stale localStorage entries from previous days.
 * Runs once on mount. Removes any cue_phases_ keys that don't match today's date.
 */
function cleanupStalePhaseEntries(userId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const todayKey = getStorageKey(userId);
    const prefix = `cue_phases_${userId}_`;
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix) && key !== todayKey) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    if (keysToRemove.length > 0) {
      console.log(`[CuePhaseCard] Cleaned up ${keysToRemove.length} stale phase entries`);
    }
  } catch (e) {
    console.error('[CuePhaseCard] Error cleaning up stale entries:', e);
  }
}

// ============================================
// CUE PHASE CARD COMPONENT
// ============================================

export default function CuePhaseCard({
  userId,
  isCompleted,
  onFullComplete,
  onProgressUpdate,
  sprintDay,
  currentCue = 'Interpretation',
}: CuePhaseCardProps) {
  const [phases, setPhases] = useState<PhaseState>({ morning: false, midday: false, evening: false });
  const [isLogging, setIsLogging] = useState(false);
  const [allDone, setAllDone] = useState(false);

  // Load saved phase state on mount + cleanup stale entries
  useEffect(() => {
    cleanupStalePhaseEntries(userId);
    
    if (isCompleted) {
      setPhases({ morning: true, midday: true, evening: true });
      setAllDone(true);
    } else {
      const saved = loadPhaseState(userId);
      setPhases(saved);
    }
  }, [userId, isCompleted]);

  // Check if all phases are complete and trigger full completion
  const checkAllComplete = useCallback(async (newPhases: PhaseState) => {
    if (newPhases.morning && newPhases.midday && newPhases.evening && !isCompleted && !allDone) {
      setAllDone(true);
      setIsLogging(true);
      try {
        await onFullComplete();
      } catch (err) {
        console.error('[CuePhaseCard] Error logging full completion:', err);
        setAllDone(false);
      } finally {
        setIsLogging(false);
      }
    }
  }, [isCompleted, allDone, onFullComplete]);

  const handleTogglePhase = (phaseId: 'morning' | 'midday' | 'evening') => {
    if (isCompleted || allDone) return;
    
    const newPhases = { ...phases, [phaseId]: !phases[phaseId] };
    setPhases(newPhases);
    savePhaseState(userId, newPhases);
    
    if (newPhases[phaseId]) {
      checkAllComplete(newPhases);
    }
  };

  const handleReset = () => {
    const resetState = { morning: false, midday: false, evening: false };
    setPhases(resetState);
    setAllDone(false);
    savePhaseState(userId, resetState);
  };

  const completedCount = [phases.morning, phases.midday, phases.evening].filter(Boolean).length;
  const isFullyDone = isCompleted || allDone;
  const cuePhases = getCuePhases(currentCue);

  return (
    <div className={`rounded-xl border transition-all duration-300 overflow-hidden ${
      isFullyDone 
        ? 'bg-gradient-to-br from-emerald-50/80 to-white border-emerald-200/60' 
        : 'bg-white border-black/[0.04] hover:border-amber-400/30 hover:shadow-lg hover:shadow-amber-500/5'
    }`}>
      
      {/* Card Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isFullyDone ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-50 text-amber-600'
          }`}>
            {isFullyDone ? (
              <Check className="w-5 h-5" strokeWidth={2.5} />
            ) : (
              <Zap className="w-5 h-5" />
            )}
          </div>
          <div>
            <span className={`text-sm font-semibold ${isFullyDone ? 'text-emerald-700' : 'text-zinc-800'}`}>
              Cue
            </span>
            {sprintDay && (
              <span className="text-xs text-zinc-400 ml-2">
                Day {sprintDay} of 21
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
            isFullyDone 
              ? 'bg-emerald-100 text-emerald-600' 
              : 'bg-zinc-100 text-zinc-500'
          }`}>
            {completedCount}/3
          </span>
          <span className="text-[10px] text-zinc-400">⏱ All day</span>
        </div>
      </div>

      {/* Phase Checklist */}
      <div className="px-3 pb-3 space-y-1.5">
        {cuePhases.map((phase) => {
          const isDone = phases[phase.id];
          const PhaseIcon = phase.icon;
          
          return (
            <button
              key={phase.id}
              onClick={() => handleTogglePhase(phase.id)}
              disabled={isFullyDone}
              className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 text-left group ${
                isDone
                  ? 'bg-emerald-50/80'
                  : 'bg-zinc-50/80 hover:bg-zinc-100/80 active:scale-[0.99]'
              } ${isFullyDone ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                isDone
                  ? 'border-emerald-500 bg-emerald-500'
                  : 'border-zinc-300 bg-white group-hover:border-amber-400'
              }`}>
                {isDone && <Check className="w-3 h-3 text-white" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <PhaseIcon className={`w-3 h-3 flex-shrink-0 ${isDone ? 'text-emerald-500' : 'text-zinc-400'}`} />
                  <span className={`text-xs font-semibold ${isDone ? 'text-emerald-600' : 'text-zinc-700'}`}>
                    {phase.label}
                  </span>
                  <span className={`text-[9px] px-1 py-0.5 rounded ${
                    isDone ? 'bg-emerald-100/60 text-emerald-500' : 'bg-zinc-200/60 text-zinc-400'
                  }`}>
                    {phase.timeHint}
                  </span>
                </div>
                <p className={`text-[11px] leading-tight mt-0.5 ${
                  isDone ? 'text-emerald-500/70 line-through' : 'text-zinc-500'
                }`}>
                  {phase.prompt}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {isLogging && (
        <div className="px-4 pb-3 flex items-center justify-center gap-2 text-xs text-amber-600">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Logging practice...</span>
        </div>
      )}

      {isFullyDone && !isLogging && (
        <div className="px-3 pb-3">
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-all duration-200"
          >
            <RotateCcw className="w-3 h-3" />
            Again
          </button>
        </div>
      )}
    </div>
  );
}
