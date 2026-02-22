// components/MobileDashboard.tsx
// Mobile dashboard drawer with luxury cream styling (matches DashboardSidebar)
// v2.3: Floating pill bottom-left above input - no header strip overlay
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, User, TrendingUp, TrendingDown, Zap, Sparkles, Target, BookOpen } from 'lucide-react';
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
  onStage7Unlock?: () => void;
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
  flowBlockWeeklyMap, flowBlockSprintDay, onStage7Unlock,
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
          Bottom-left, just above the input area
          Dark pill so it's visible against dark bg
          but clearly distinct from amber chat elements
          ========================================== */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 left-3 z-30 h-9 pl-2.5 pr-3.5 bg-zinc-900/90 backdrop-blur-sm border border-white/10 rounded-full flex items-center gap-2 active:bg-zinc-800 transition-all md:hidden shadow-lg shadow-black/30"
        aria-label="Open dashboard"
      >
        <Menu className="w-4 h-4 text-zinc-400" />
        <span className="text-xs font-medium text-zinc-300">Dashboard</span>
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

          {/* STAGE 7 UNLOCK */}
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

          {/* UNLOCK PROGRESS */}
          {unlockProgress && currentStage < 7 && (
            <div className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-sm">
              <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Unlock Progress</h3>
              <div className="space-y-2">
                {[
                  { label: 'Adherence', met: unlockProgress.adherenceMet, width: `${Math.min((adherencePercentage / (unlockProgress.requiredAdherence || 80)) * 100, 100)}%`, display: `${adherencePercentage}%` },
                  { label: 'Days', met: unlockProgress.daysMet, width: `${Math.min((consecutiveDays / (unlockProgress.requiredDays || 14)) * 100, 100)}%`, display: `${consecutiveDays}/${unlockProgress.requiredDays || 14}` },
                  { label: 'Growth', met: unlockProgress.deltaMet, width: unlockProgress.deltaMet ? '100%' : '50%', display: domainDeltas?.average !== undefined ? `+${domainDeltas.average.toFixed(1)}` : '—' },
                  { label: 'Check-in', met: unlockProgress.qualitativeMet, width: unlockProgress.qualitativeMet ? '100%' : '0%', display: unlockProgress.qualitativeMet ? '✓' : '—' },
                ].map(({ label, met, width, display }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className={`text-xs w-16 ${met ? 'text-green-600' : 'text-zinc-500'}`}>{met ? '✓' : ''} {label}</span>
                    <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div className={`h-full transition-all ${met ? 'bg-green-500' : 'bg-zinc-300'}`} style={{ width }} />
                    </div>
                    <span className="text-xs text-zinc-400 w-12 text-right">{display}</span>
                  </div>
                ))}
              </div>
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
                <BookOpen className="w-4.5 h-4.5 text-amber-600" />
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

          <AwakenWithFiveCard />
        </div>
      </div>
    </>
  );
}
