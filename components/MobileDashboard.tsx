// components/MobileDashboard.tsx
// Mobile dashboard drawer with luxury cream styling (matches DashboardSidebar)
// v2.3: Floating pill bottom-left above input - no header strip overlay
// v2.4: Stage 2 unlock progress widget (Step 10)
// v2.5: Streak freeze indicator (Step 12)
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, User, TrendingUp, TrendingDown, Zap, Sparkles, Target, BookOpen, Lock } from 'lucide-react';
import AwakenWithFiveCard from './AwakenWithFiveCard';

// ============================================
// TYPES
// ============================================

interface UnlockProgress {
  adherenceMet?: boolean;
  daysMet?: boolean;
  deltaMet?: boolean;
  qualitativeMet?: boolean;
  adherence?: number;
  deltaAverage?: number;
  daysComplete?: number;
  requiredAdherence?: number;
  requiredDays?: number;
  requiredDelta?: number;
}

interface WeeklyMapEntry {
  day: string;
  domain: string;
  task: string;
  flowType: string;
  category: string;
  coherenceLink?: string;
  duration: number;
  timeSlot?: string;
}

interface MobileDashboardProps {
  userName?: string;
  currentStage: number;
  baselineRewiredIndex: number;
  baselineDomainScores: {
    regulation: number;
    awareness: number;
    outlook: number;
    attention: number;
  };
  currentDomainScores?: {
    regulation: number;
    awareness: number;
    outlook: number;
    attention: number;
  };
  domainDeltas?: {
    regulation?: number;
    awareness?: number;
    outlook?: number;
    attention?: number;
    average?: number;
  };
  unlockProgress?: UnlockProgress;
  unlockEligible?: boolean;
  adherencePercentage?: number;
  consecutiveDays?: number;
  coherenceStatement?: string;
  currentIdentity?: string;
  microAction?: string;
  sprintDay?: number;
  identitySprintDay?: number;
  flowBlockWeeklyMap?: WeeklyMapEntry[] | null;
  flowBlockSprintDay?: number;
  totalDaysInApp?: number;
  daysInStage?: number;
  // Stage 1 signal trend (optional — arrow omitted if not provided)
  calmTrend?: 'up' | 'flat' | null;
  // Step 12: streak freeze
  streakFreezeAvailable?: boolean;
  // Step 13: weekly check-in banner
  weeklyCheckInDue?: boolean;
  onRequestCheckIn?: () => void;
onStage7Unlock?: () => void;
  onInstallClick?: () => void;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getStageName(stage: number): string {
  const names: { [key: number]: string } = {
    1: 'Neural Priming',
    2: 'Embodied Awareness',
    3: 'Cue Training',
    4: 'Flow Mode',
    5: 'Relational Coherence',
    6: 'Integration',
    7: 'Accelerated Expansion'
  };
  return names[stage] || `Stage ${stage}`;
}

function getStatusTier(index: number): string {
  if (index <= 20) return 'System Offline';
  if (index <= 40) return 'Baseline Mode';
  if (index <= 60) return 'Operational';
  if (index <= 80) return 'Optimized';
  return 'Integrated';
}

function getStatusColor(index: number): string {
  if (index <= 20) return 'text-red-500';
  if (index <= 40) return 'text-amber-500';
  if (index <= 60) return 'text-blue-500';
  if (index <= 80) return 'text-emerald-500';
  return 'text-purple-500';
}

function getProgressBarColor(index: number): string {
  if (index <= 20) return 'bg-red-500';
  if (index <= 40) return 'bg-amber-500';
  if (index <= 60) return 'bg-blue-500';
  if (index <= 80) return 'bg-emerald-500';
  return 'bg-purple-500';
}

function getShortDay(day: string): string {
  const shortNames: { [key: string]: string } = {
    'Monday': 'Mon', 'Tuesday': 'Tue', 'Wednesday': 'Wed',
    'Thursday': 'Thu', 'Friday': 'Fri', 'Saturday': 'Sat', 'Sunday': 'Sun'
  };
  return shortNames[day] || day.slice(0, 3);
}

function isToday(day: string): boolean {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return day === dayNames[new Date().getDay()];
}

const DOMAIN_COLORS = {
  regulation: { bar: 'bg-amber-600', text: 'text-amber-600' },
  awareness: { bar: 'bg-amber-500', text: 'text-amber-500' },
  outlook: { bar: 'bg-amber-400', text: 'text-amber-400' },
  attention: { bar: 'bg-amber-300', text: 'text-amber-500' },
};

// ============================================
// WEEKLY CHECK-IN BANNER (Step 13)
// Stage 2+ only. Pending = amber + tappable. Complete = subtle green.
// ============================================

function WeeklyCheckInBanner({ due, onRequestCheckIn }: { due: boolean; onRequestCheckIn?: () => void }) {
  if (!due) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200/60 rounded-xl">
        <span className="text-emerald-500 text-sm leading-none">✓</span>
        <span className="text-xs font-medium text-emerald-600">Weekly check-in complete</span>
      </div>
    );
  }

  return (
    <button
      onClick={onRequestCheckIn}
      className="w-full flex items-center gap-2 px-3 py-2.5 bg-amber-50 active:bg-amber-100 border border-amber-300/60 rounded-xl transition-colors text-left min-h-[44px]"
    >
      <span className="text-amber-500 text-sm leading-none">⚡</span>
      <span className="text-xs font-medium text-amber-700 flex-1">
        Weekly check-in pending
      </span>
      <svg
        className="w-3.5 h-3.5 text-amber-400"
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

// ============================================
// STREAK FREEZE INDICATOR (Step 12)
// ============================================

function StreakFreezeIndicator({ available }: { available: boolean }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowTooltip(v => !v)}
        className="flex items-center gap-1.5 w-full text-left min-h-[44px] py-1"
        aria-label="Streak freeze status"
      >
        <span className={`text-base leading-none select-none ${available ? 'text-amber-400' : 'text-zinc-300'}`}>
          {available ? '◎' : '◉'}
        </span>
        <span className={`text-xs font-medium ${available ? 'text-zinc-500' : 'text-zinc-300'}`}>
          {available ? '1 protected day available' : 'Protected day used'}
        </span>
      </button>

      {showTooltip && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowTooltip(false)} />
          <div className="absolute left-0 bottom-full mb-2 z-20 w-64 bg-zinc-900 text-white text-xs rounded-xl p-3 shadow-xl">
            <p className="font-semibold mb-1 text-amber-400">Streak Freeze</p>
            <p className="text-zinc-300 leading-relaxed">
              {available
                ? 'Miss one day this window without losing your consistency streak. Activates automatically — no action required.'
                : 'Your freeze was used this window. It resets when the next window begins.'}
            </p>
            {/* Tooltip arrow */}
            <div className="absolute left-4 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-zinc-900" />
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// STAGE 2 UNLOCK WIDGET (mobile)
// ============================================

interface Stage2UnlockWidgetProps {
  unlockProgress: UnlockProgress;
  unlockEligible: boolean;
  daysInStage: number;
  adherencePercentage: number;
  calmTrend?: 'up' | 'flat' | null;
  streakFreezeAvailable?: boolean;
}

function Stage2UnlockWidget({
  unlockProgress,
  unlockEligible,
  daysInStage,
  adherencePercentage,
  calmTrend,
  streakFreezeAvailable,
}: Stage2UnlockWidgetProps) {
  const requiredDays = unlockProgress.requiredDays || 7;
  const requiredAdherence = unlockProgress.requiredAdherence || 70;

  const daysCompleted = Math.min(daysInStage, requiredDays);
  const dots = Array.from({ length: requiredDays }, (_, i) => i < daysCompleted);

  const totalPracticesInWindow = requiredDays * 2;
  const targetPractices = Math.ceil(totalPracticesInWindow * (requiredAdherence / 100));
  const completedPractices = Math.round((adherencePercentage / 100) * totalPracticesInWindow);
  const practicesRemaining = Math.max(0, targetPractices - completedPractices);
  const barPercent = Math.min(100, Math.round((completedPractices / targetPractices) * 100));

  const trendArrow = calmTrend === 'up' ? ' ↑' : calmTrend === 'flat' ? ' →' : '';

  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm overflow-hidden">
      {/* Header rule */}
      <div className="flex items-center gap-2 px-4 pt-3.5 pb-2">
        <div className="flex-1 h-px bg-black/[0.06]" />
        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest whitespace-nowrap">
          Stage 2 Unlock
        </span>
        <div className="flex-1 h-px bg-black/[0.06]" />
      </div>

      <div className="px-4 pb-4 space-y-3">
        {unlockEligible ? (
          <>
            <div className="flex items-center gap-1.5 flex-wrap">
              {dots.map((_, i) => (
                <span key={i} className="text-emerald-500" style={{ fontSize: '11px' }}>●</span>
              ))}
              <span className="text-xs text-emerald-600 font-medium ml-1">
                {daysCompleted} of {requiredDays} days
              </span>
            </div>
            <div className="w-full rounded-full h-2 bg-zinc-100 overflow-hidden">
              <div className="h-2 rounded-full bg-emerald-500 w-full transition-all duration-500" />
            </div>
            <p className="text-xs font-semibold text-emerald-600">
              Stage 2 unlocked. Ready to install?
            </p>
            {streakFreezeAvailable !== undefined && (
              <div className="pt-1 border-t border-zinc-100">
                <StreakFreezeIndicator available={streakFreezeAvailable} />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5 flex-wrap">
              {dots.map((filled, i) => (
                <span
                  key={i}
                  className={`leading-none transition-colors ${filled ? 'text-amber-500' : 'text-zinc-200'}`}
                  style={{ fontSize: '11px' }}
                >
                  ●
                </span>
              ))}
              <span className="text-xs text-zinc-400 font-medium ml-1">
                {daysCompleted} of {requiredDays} days
              </span>
            </div>

            {trendArrow && (
              <p className="text-xs text-zinc-500">
                Your signal is shifting{trendArrow}
              </p>
            )}

            <div className="h-px bg-zinc-100" />

            {practicesRemaining > 0 && (
              <p className="text-xs text-zinc-500">
                {practicesRemaining} more {practicesRemaining === 1 ? 'practice' : 'practices'} to go.
              </p>
            )}

            <div className="w-full rounded-full h-2 bg-zinc-100 overflow-hidden">
              <div
                className="h-2 rounded-full bg-amber-500 transition-all duration-500"
                style={{ width: `${barPercent}%` }}
              />
            </div>

            {/* Streak freeze — always shown in Stage 1 widget */}
            {streakFreezeAvailable !== undefined && (
              <div className="pt-1 border-t border-zinc-100">
                <StreakFreezeIndicator available={streakFreezeAvailable} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ============================================
// STAGE 2 TEASER PANEL
// ============================================
function Stage2TeaserPanel({ unlockEligible, onInstallClick }: { unlockEligible: boolean; onInstallClick?: () => void }) {
  return (
    <div className={`rounded-xl p-4 border transition-all duration-500 ${
      unlockEligible
        ? 'bg-emerald-950/20 border-emerald-500/60'
        : 'bg-zinc-900/[0.03] border-amber-400/40'
    }`}>
      <p className={`text-[10px] font-semibold uppercase tracking-widest mb-2 ${
        unlockEligible ? 'text-emerald-600' : 'text-amber-500/80'
      }`}>
        Stage 2: Embodied Mode
      </p>
      <div className={`h-px mb-3 ${unlockEligible ? 'bg-emerald-500/30' : 'bg-amber-400/20'}`} />
      <p className="text-xs text-zinc-500 mb-3 leading-relaxed">
        {unlockEligible ? 'Ready to install.' : 'Coming when you\'re ready.'}
      </p>
      <p className="text-xs text-zinc-400 italic leading-relaxed">
        &quot;When coherence stops living in your head and starts living in your body.&quot;
      </p>
      {unlockEligible && (
        <div className="mt-3 pt-3 border-t border-emerald-500/20">
          <button onClick={onInstallClick} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
            Install now →
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// FLOW BLOCK SCHEDULE
// ============================================

function FlowBlockScheduleMobile({ weeklyMap, sprintDay }: { weeklyMap: WeeklyMapEntry[]; sprintDay?: number }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-4 h-4 text-blue-500" />
        <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">My Flow Block Schedule</h3>
      </div>
      <div className="space-y-1">
        {weeklyMap.map((entry, index) => {
          const isTodayBlock = isToday(entry.day);
          const isExpanded = expandedIndex === index;
          return (
            <div key={index}>
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className={`w-full flex items-center gap-2 py-2 px-2 rounded-lg text-xs transition-all ${
                  isTodayBlock ? 'bg-blue-50 border border-blue-200/50' : isExpanded ? 'bg-zinc-50' : 'hover:bg-zinc-50 active:bg-zinc-100'
                }`}
              >
                <span className={`w-10 font-semibold text-left ${isTodayBlock ? 'text-blue-600' : 'text-zinc-500'}`}>{getShortDay(entry.day)}</span>
                <span className="text-zinc-300">|</span>
                <span className={`flex-1 truncate text-left ${isTodayBlock ? 'text-blue-700 font-medium' : 'text-zinc-600'}`}>{entry.task}</span>
                <span className={`text-xs whitespace-nowrap ${isTodayBlock ? 'text-blue-500' : 'text-zinc-400'}`}>
                  {entry.timeSlot ? `${entry.timeSlot} · ` : ''}{entry.duration}m
                </span>
                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isTodayBlock ? 'text-blue-400' : 'text-zinc-300'} ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`overflow-hidden transition-all duration-200 ease-out ${isExpanded ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className={`px-3 py-2 mx-2 mb-1 rounded-lg text-xs ${isTodayBlock ? 'bg-blue-50/50' : 'bg-zinc-50'}`}>
                  <p className={`font-medium mb-1 ${isTodayBlock ? 'text-blue-700' : 'text-zinc-700'}`}>{entry.task}</p>
                  <p className={isTodayBlock ? 'text-blue-500' : 'text-zinc-500'}>{entry.domain} · {entry.flowType} · {entry.category}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {sprintDay && (
        <div className="mt-3 pt-3 border-t border-black/[0.04] flex items-center gap-2">
          <div className="flex-1 h-1 bg-black/[0.04] rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(sprintDay / 21) * 100}%` }} />
          </div>
          <span className="text-xs text-zinc-400 font-medium">Day {sprintDay}/21</span>
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPONENT
// ============================================

export default function MobileDashboard({
  userName, currentStage, baselineRewiredIndex, baselineDomainScores,
  currentDomainScores, domainDeltas, unlockProgress, unlockEligible,
  adherencePercentage = 0, consecutiveDays = 0, coherenceStatement,
  currentIdentity, microAction, sprintDay, identitySprintDay,
  flowBlockWeeklyMap, flowBlockSprintDay, totalDaysInApp, daysInStage,
calmTrend, streakFreezeAvailable, weeklyCheckInDue, onRequestCheckIn, onStage7Unlock, onInstallClick,
}: MobileDashboardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const displaySprintDay = sprintDay ?? identitySprintDay;
  const displayStatement = coherenceStatement ?? currentIdentity;

  const currentReg = currentDomainScores?.regulation ?? baselineDomainScores.regulation;
  const currentAware = currentDomainScores?.awareness ?? baselineDomainScores.awareness;
  const currentOut = currentDomainScores?.outlook ?? baselineDomainScores.outlook;
  const currentAtt = currentDomainScores?.attention ?? baselineDomainScores.attention;
  const currentRewiredIndex = Math.round((currentReg + currentAware + currentOut + currentAtt) / 4 * 20);
  const rewiredDelta = currentRewiredIndex - baselineRewiredIndex;

  return (
    <>
      {/* ==========================================
          DASHBOARD PILL BUTTON
          ========================================== */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-14 left-3 z-30 h-9 pl-2.5 pr-3.5 bg-white/95 backdrop-blur-sm border border-white/20 rounded-full flex items-center gap-2 active:bg-zinc-100 transition-all md:hidden shadow-lg shadow-black/30"
        aria-label="Open dashboard"
      >
        <Menu className="w-4 h-4 text-amber-500" />
        <span className="text-xs font-semibold text-zinc-700">Dashboard</span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-[#fafaf8] border-r border-amber-200/60 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition-colors"
          aria-label="Close dashboard"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="h-full overflow-y-auto p-5 space-y-4">
          
          {/* USER INFO HEADER */}
          <div className="border-b border-black/5 pb-4 pt-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                <User className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-800">
                  {userName ? `Hey, ${userName}` : 'Welcome'}
                </h2>
                <p className="text-xs text-zinc-500">Stage {currentStage}: {getStageName(currentStage)}</p>
              </div>
            </div>
            <Link href="/profile/patterns" onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-medium transition-colors border border-amber-200/50">
              <Sparkles className="w-3.5 h-3.5" />
              Pattern Profile & Transformation Map
            </Link>
          </div>

          {/* TIME IN SYSTEM */}
          {totalDaysInApp !== undefined && (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white rounded-xl px-4 py-3 border border-zinc-200/80 shadow-sm text-center">
                <span className="text-lg font-bold text-zinc-800">{totalDaysInApp}</span>
                <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mt-0.5">Days Active</p>
              </div>
              <div className="flex-1 bg-white rounded-xl px-4 py-3 border border-zinc-200/80 shadow-sm text-center">
                <span className="text-lg font-bold text-amber-600">{daysInStage ?? 0}</span>
                <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mt-0.5">Days in Stage {currentStage}</p>
              </div>
            </div>
          )}

          {/* REWIRED INDEX */}
          <div className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">REwired Index</span>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${getStatusColor(currentRewiredIndex)}`}>{currentRewiredIndex}</span>
                {rewiredDelta !== 0 && (
                  <span className={`text-sm font-semibold flex items-center gap-0.5 ${rewiredDelta > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {rewiredDelta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {rewiredDelta > 0 ? '+' : ''}{rewiredDelta}
                  </span>
                )}
              </div>
            </div>
            <div className="h-2 bg-zinc-100 rounded-full overflow-hidden mb-2">
              <div className={`h-full transition-all ${getProgressBarColor(currentRewiredIndex)}`} style={{ width: `${Math.min(currentRewiredIndex, 100)}%` }} />
            </div>
            <p className="text-xs text-zinc-500">
              Status: <span className={`font-medium ${getStatusColor(currentRewiredIndex)}`}>{getStatusTier(currentRewiredIndex)}</span>
            </p>
          </div>

          {/* DOMAIN SCORES */}
          <div className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-sm">
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Domain Scores</h3>
            <div className="space-y-3">
              {[
                { key: 'regulation', label: 'Regulation', value: currentReg, delta: domainDeltas?.regulation },
                { key: 'awareness', label: 'Awareness', value: currentAware, delta: domainDeltas?.awareness },
                { key: 'outlook', label: 'Outlook', value: currentOut, delta: domainDeltas?.outlook },
                { key: 'attention', label: 'Attention', value: currentAtt, delta: domainDeltas?.attention },
              ].map(({ key, label, value, delta }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className={`text-xs w-20 ${DOMAIN_COLORS[key as keyof typeof DOMAIN_COLORS].text}`}>{label}</span>
                  <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all ${DOMAIN_COLORS[key as keyof typeof DOMAIN_COLORS].bar}`} style={{ width: `${(value / 5) * 100}%` }} />
                  </div>
                  <span className="text-xs text-zinc-600 w-8 text-right font-medium">{value.toFixed(1)}</span>
                  {delta !== undefined && delta !== 0 && (
                    <span className={`text-xs w-10 text-right font-medium ${delta > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ==========================================
              WEEKLY CHECK-IN BANNER (Step 13)
              Stage 2+ only
              ========================================== */}
          {currentStage >= 2 && weeklyCheckInDue !== undefined && (
            <WeeklyCheckInBanner due={weeklyCheckInDue} onRequestCheckIn={() => { onRequestCheckIn?.(); setIsOpen(false); }} />
          )}

          {/* ==========================================
              UNLOCK PROGRESS
              Stage 1: rich dot widget (includes freeze)
              Stage 2–5: existing bar widget + freeze
              ========================================== */}

          {/* Stage 1 — new dot widget */}
          {currentStage === 1 && unlockProgress && (
            <Stage2UnlockWidget
              unlockProgress={unlockProgress}
              unlockEligible={unlockEligible ?? false}
              daysInStage={daysInStage ?? 0}
              adherencePercentage={adherencePercentage}
              calmTrend={calmTrend}
              streakFreezeAvailable={streakFreezeAvailable}
            />
          )}

         {/* Stage 2 teaser panel — visible all of Stage 1 */}
          {currentStage === 1 && (
           <Stage2TeaserPanel unlockEligible={unlockEligible ?? false} onInstallClick={onInstallClick} />
          )}

          {/* Stage 2–5 — existing bar widget */}
          {unlockProgress && currentStage > 1 && currentStage < 6 && (
            <div className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-sm">
              <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Unlock Progress</h3>
              <div className="space-y-2">
                {[
                  { label: 'Adherence', met: unlockProgress.adherenceMet, width: `${Math.min((adherencePercentage / (unlockProgress.requiredAdherence || 80)) * 100, 100)}%`, display: `${adherencePercentage}%` },
                  { label: 'Days', met: unlockProgress.daysMet, width: `${Math.min((consecutiveDays / (unlockProgress.requiredDays || 14)) * 100, 100)}%`, display: `${consecutiveDays}/${unlockProgress.requiredDays || 14}` },
                  { label: 'Growth', met: unlockProgress.deltaMet, width: unlockProgress.deltaMet ? '100%' : '50%', display: domainDeltas?.average !== undefined ? `+${domainDeltas.average.toFixed(1)}` : '—' },
                  { label: 'Weekly', met: unlockProgress.qualitativeMet, width: unlockProgress.qualitativeMet ? '100%' : '0%', display: unlockProgress.qualitativeMet ? '✓' : '—' },
                ].map(({ label, met, width, display }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className={`text-xs w-16 ${met ? 'text-green-600' : 'text-zinc-500'}`}>{met ? '✓' : ''} {label}</span>
                    <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div className={`h-full transition-all ${met ? 'bg-green-500' : 'bg-zinc-300'}`} style={{ width }} />
                    </div>
                    <span className="text-xs text-zinc-400 w-12 text-right">{display}</span>
                  </div>
                ))}

                {/* Streak freeze for Stage 2–5 */}
                {streakFreezeAvailable !== undefined && (
                  <div className="pt-2 border-t border-zinc-100">
                    <StreakFreezeIndicator available={streakFreezeAvailable} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STAGE 7 UNLOCK */}
          {currentStage === 6 && !unlockEligible && (
            <div className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Lock className="w-4 h-4 text-zinc-400" />
                <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Stage 7: Accelerated Expansion</h3>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Stage 7 requires an application and live conversation. Continue building stable awareness across contexts — when you're ready, ask about the Stage 7 application process.
              </p>
            </div>
          )}
          {currentStage === 7 && (
            <div className="bg-gradient-to-br from-purple-50 to-amber-50 border border-purple-200/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-semibold text-purple-800">Stage 7: Accelerated Expansion</h3>
              </div>
              <p className="text-xs text-zinc-600">
                The IOS is self-evolving. You are the feedback loop.
              </p>
            </div>
          )}
          {currentStage === 6 && unlockEligible && onStage7Unlock && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300/50 rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-medium text-amber-800 mb-2">Final Stage Available</h3>
              <p className="text-xs text-amber-700/80 mb-3">You&apos;ve demonstrated mastery at Stage 6. Ready to explore what&apos;s beyond?</p>
              <button onClick={() => { onStage7Unlock(); setIsOpen(false); }}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg">
                Unlock Stage 7
              </button>
            </div>
          )}

          {/* ALIGNED ACTION (Stage 3+) */}
          {(displayStatement || microAction) && (
            <div className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">My IOS Cue</h3>
              </div>
              {displayStatement && <p className="text-sm text-zinc-700 leading-relaxed">{displayStatement}</p>}
              {microAction && <p className="text-xs text-amber-600 font-medium mt-2">Loop: {microAction}</p>}
              {displaySprintDay && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-black/[0.04] rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${(displaySprintDay / 21) * 100}%` }} />
                  </div>
                  <span className="text-xs text-zinc-400 font-medium">Day {displaySprintDay}/21</span>
                </div>
              )}
            </div>
          )}

          {/* FLOW BLOCK SCHEDULE (Stage 4+) */}
          {flowBlockWeeklyMap && flowBlockWeeklyMap.length > 0 && (
            <FlowBlockScheduleMobile weeklyMap={flowBlockWeeklyMap} sprintDay={flowBlockSprintDay} />
          )}

          {/* COURSE LIBRARY */}
          <Link href="/library" onClick={() => setIsOpen(false)}
            className="block bg-white rounded-xl p-4 border border-zinc-200/80 shadow-sm hover:border-amber-300/60 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-100 to-orange-50 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-zinc-800">Course Library</h3>
                <p className="text-xs text-zinc-500">The Science of Neural Liberation</p>
              </div>
              <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* IOS JOURNAL */}
          <Link href="/journal" onClick={() => setIsOpen(false)}
            className="block bg-white rounded-xl p-4 border border-zinc-200/80 shadow-sm hover:border-purple-300/60 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-zinc-800">UNbecoming Journal</h3>
                <p className="text-xs text-zinc-500">Your transformation timeline</p>
              </div>
              <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <AwakenWithFiveCard />
        </div>
      </div>
    </>
  );
}
