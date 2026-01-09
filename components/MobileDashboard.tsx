// components/MobileDashboard.tsx
'use client';

import { useState } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';
import AwakenWithFiveCard from './AwakenWithFiveCard';

interface UnlockProgress {
  adherenceMet: boolean;
  daysMet: boolean;
  deltaMet: boolean;
  qualitativeMet: boolean;
  requiredAdherence: number;
  requiredDays: number;
  requiredDelta: number;
}

interface MobileDashboardProps {
  userName: string;
  currentStage: number;
  // Baseline data
  baselineRewiredIndex: number;
  baselineDomainScores: {
    regulation: number;
    awareness: number;
    outlook: number;
    attention: number;
  };
  // Current data (from progress)
  currentDomainScores?: {
    regulation: number;
    awareness: number;
    outlook: number;
    attention: number;
  };
  domainDeltas?: {
    regulation: number;
    awareness: number;
    outlook: number;
    attention: number;
    average: number;
  };
  // Unlock progress
  unlockProgress?: UnlockProgress;
  unlockEligible?: boolean;
  adherencePercentage?: number;
  consecutiveDays?: number;
  // Identity
  currentIdentity?: string;
  microAction?: string;
  identitySprintDay?: number;
  onStage7Unlock?: () => void;
}

// Get stage name from number
function getStageName(stage: number): string {
  const names: { [key: number]: string } = {
    1: 'Neural Priming',
    2: 'Embodied Awareness',
    3: 'Identity Mode',
    4: 'Flow Mode',
    5: 'Relational Coherence',
    6: 'Integration',
    7: 'Accelerated Expansion'
  };
  return names[stage] || `Stage ${stage}`;
}

// Get status tier based on REwired Index
function getStatusTier(index: number): string {
  if (index <= 20) return 'System Offline';
  if (index <= 40) return 'Baseline Mode';
  if (index <= 60) return 'Operational';
  if (index <= 80) return 'Optimized';
  return 'Integrated';
}

// Get status color based on REwired Index (adjusted for light background)
function getStatusColor(index: number): string {
  if (index <= 20) return 'text-red-600';
  if (index <= 40) return 'text-yellow-600';
  if (index <= 60) return 'text-blue-600';
  if (index <= 80) return 'text-green-600';
  return 'text-purple-600';
}

export default function MobileDashboard({
  userName,
  currentStage,
  baselineRewiredIndex,
  baselineDomainScores,
  currentDomainScores,
  domainDeltas,
  unlockProgress,
  unlockEligible,
  adherencePercentage = 0,
  consecutiveDays = 0,
  currentIdentity,
  microAction,
  identitySprintDay,
  onStage7Unlock 
}: MobileDashboardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const stageProgress = ((currentStage - 1) / 6) * 100;

  // Use current scores if available, otherwise baseline
  const displayScores = currentDomainScores || baselineDomainScores;
  
  // Calculate current REwired Index
  const currentRewiredIndex = Math.round(
    (displayScores.regulation + displayScores.awareness + displayScores.outlook + displayScores.attention) / 4 * 20
  );
  const rewiredDelta = currentRewiredIndex - baselineRewiredIndex;

  return (
    <>
      {/* Hamburger Button - Fixed top left on mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-30 w-10 h-10 bg-white border border-amber-200/60 rounded-lg flex items-center justify-center hover:border-amber-400 hover:shadow-md transition-all md:hidden shadow-sm"
        aria-label="Open dashboard"
      >
        <Menu className="w-5 h-5 text-zinc-700" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Drawer - Cream/Luxury Styling */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-[#fafaf8] border-r border-amber-200/60 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors"
          aria-label="Close dashboard"
        >
          <X className="w-5 h-5 text-zinc-500" />
        </button>

        {/* Dashboard Content */}
        <div className="p-4 pt-6 overflow-y-auto h-full space-y-4">
          {/* Header */}
          <div className="mb-2">
            <h1 className="text-xl font-bold text-zinc-800 mb-1">IOS System Installer</h1>
            <p className="text-xs text-zinc-500 mb-2">Neural & Mental Operating System</p>
            <p className="text-sm font-medium text-zinc-800">{userName ? `Hey, ${userName}` : 'Welcome'}</p>
            <p className="text-xs text-zinc-500 mt-1">
              Stage {currentStage}: {getStageName(currentStage)}
            </p>
            <a 
              href="/profile/patterns"
              className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-amber-100/50 hover:from-amber-100 hover:to-amber-100 text-amber-700 rounded-lg text-xs font-medium transition-colors border border-amber-200/60"
            >
              <Sparkles className="w-3 h-3" />
              Pattern Profile & Transformation Map
            </a>
          </div>

          {/* REwired Index - Current with Delta */}
          <div className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-500">REwired Index</span>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${getStatusColor(currentRewiredIndex)}`}>
                  {currentRewiredIndex}
                </span>
                {rewiredDelta !== 0 && (
                  <span className={`text-sm font-medium ${rewiredDelta > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {rewiredDelta > 0 ? '+' : ''}{rewiredDelta}
                  </span>
                )}
              </div>
            </div>
            <div className="w-full rounded-full h-2 bg-zinc-100">
              <div 
                className={`h-2 rounded-full transition-all ${
                  currentRewiredIndex <= 20 ? 'bg-red-500' :
                  currentRewiredIndex <= 40 ? 'bg-yellow-500' :
                  currentRewiredIndex <= 60 ? 'bg-blue-500' :
                  currentRewiredIndex <= 80 ? 'bg-green-500' :
                  'bg-purple-500'
                }`}
                style={{ width: `${currentRewiredIndex}%` }}
              />
            </div>
            <p className="text-xs text-zinc-400 mt-1">{getStatusTier(currentRewiredIndex)}</p>
          </div>

          {/* Domain Scores with Deltas */}
          <div className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-sm space-y-3">
            <h3 className="text-sm font-medium text-zinc-700 mb-2">Domain Scores</h3>

            {/* Regulation */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-500">Regulation</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-emerald-600">
                    {displayScores.regulation.toFixed(1)}/5
                  </span>
                  {domainDeltas?.regulation !== undefined && domainDeltas.regulation !== 0 && (
                    <span className={`text-xs font-medium ${domainDeltas.regulation > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {domainDeltas.regulation > 0 ? '↑' : '↓'}{Math.abs(domainDeltas.regulation).toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full rounded-full h-1.5 bg-zinc-100">
                <div
                  className="h-1.5 rounded-full transition-all bg-emerald-500"
                  style={{ width: `${(displayScores.regulation / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Awareness */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-500">Awareness</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-blue-600">
                    {displayScores.awareness.toFixed(1)}/5
                  </span>
                  {domainDeltas?.awareness !== undefined && domainDeltas.awareness !== 0 && (
                    <span className={`text-xs font-medium ${domainDeltas.awareness > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {domainDeltas.awareness > 0 ? '↑' : '↓'}{Math.abs(domainDeltas.awareness).toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full rounded-full h-1.5 bg-zinc-100">
                <div
                  className="h-1.5 rounded-full transition-all bg-blue-500"
                  style={{ width: `${(displayScores.awareness / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Outlook */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-500">Outlook</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-amber-600">
                    {displayScores.outlook.toFixed(1)}/5
                  </span>
                  {domainDeltas?.outlook !== undefined && domainDeltas.outlook !== 0 && (
                    <span className={`text-xs font-medium ${domainDeltas.outlook > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {domainDeltas.outlook > 0 ? '↑' : '↓'}{Math.abs(domainDeltas.outlook).toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full rounded-full h-1.5 bg-zinc-100">
                <div
                  className="h-1.5 rounded-full transition-all bg-amber-500"
                  style={{ width: `${(displayScores.outlook / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Attention */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-500">Attention</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-purple-600">
                    {displayScores.attention.toFixed(1)}/5
                  </span>
                  {domainDeltas?.attention !== undefined && domainDeltas.attention !== 0 && (
                    <span className={`text-xs font-medium ${domainDeltas.attention > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {domainDeltas.attention > 0 ? '↑' : '↓'}{Math.abs(domainDeltas.attention).toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full rounded-full h-1.5 bg-zinc-100">
                <div
                  className="h-1.5 rounded-full transition-all bg-purple-500"
                  style={{ width: `${(displayScores.attention / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stage 7 Unlock Button - Shows when eligible at Stage 6 */}
          {currentStage === 6 && unlockEligible && onStage7Unlock && (
            <div className="bg-gradient-to-r from-purple-50 to-amber-50 border border-purple-200/60 rounded-xl p-4">
              <h3 className="text-sm font-medium text-purple-700 mb-2">🔓 Final Stage Available</h3>
              <p className="text-xs text-zinc-600 mb-3">
                You've demonstrated mastery at Stage 6. Ready to explore what's beyond?
              </p>
              <button
                onClick={() => {
                  onStage7Unlock();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl transition-all shadow-sm shadow-amber-500/20"
              >
                Unlock Stage 7?
              </button>
            </div>
          )}

          {/* Unlock Progress */}
          {unlockProgress && !unlockEligible && (
            <div className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-sm">
              <h3 className="text-sm font-medium text-zinc-700 mb-3">
                Stage {currentStage + 1} Unlock Progress
              </h3>
              
              <div className="space-y-2">
                {/* Adherence Progress */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs w-14 ${unlockProgress.adherenceMet ? 'text-green-600' : 'text-zinc-500'}`}>
                    {unlockProgress.adherenceMet ? '✓' : ''} Adherence
                  </span>
                  <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${unlockProgress.adherenceMet ? 'bg-green-500' : 'bg-amber-500'}`}
                      style={{ width: unlockProgress.adherenceMet ? '100%' : `${Math.min(100, adherencePercentage / unlockProgress.requiredAdherence * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-zinc-400 w-10 text-right">
                    {unlockProgress.adherenceMet ? '✓' : `${adherencePercentage}%`}
                  </span>
                </div>
                
                {/* Days Progress */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs w-14 ${unlockProgress.daysMet ? 'text-green-600' : 'text-zinc-500'}`}>
                    {unlockProgress.daysMet ? '✓' : ''} Days
                  </span>
                  <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${unlockProgress.daysMet ? 'bg-green-500' : 'bg-amber-500'}`}
                      style={{ width: unlockProgress.daysMet ? '100%' : `${Math.min(100, consecutiveDays / unlockProgress.requiredDays * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-zinc-400 w-10 text-right">
                    {unlockProgress.daysMet ? '✓' : `${consecutiveDays}/${unlockProgress.requiredDays}`}
                  </span>
                </div>
                
                {/* Delta Progress */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs w-14 ${unlockProgress.deltaMet ? 'text-green-600' : 'text-zinc-500'}`}>
                    {unlockProgress.deltaMet ? '✓' : ''} Growth
                  </span>
                  <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${unlockProgress.deltaMet ? 'bg-green-500' : 'bg-amber-500'}`}
                      style={{ width: unlockProgress.deltaMet ? '100%' : `${Math.min(100, Math.max(0, ((domainDeltas?.average || 0) / unlockProgress.requiredDelta) * 100))}%` }}
                    />
                  </div>
                  <span className="text-xs text-zinc-400 w-10 text-right">
                    {unlockProgress.deltaMet ? '✓' : `+${(domainDeltas?.average || 0).toFixed(1)}`}
                  </span>
                </div>
                
                {/* Weekly Check-in */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs w-14 ${unlockProgress.qualitativeMet ? 'text-green-600' : 'text-zinc-500'}`}>
                    {unlockProgress.qualitativeMet ? '✓' : ''} Check-in
                  </span>
                  <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${unlockProgress.qualitativeMet ? 'bg-green-500' : 'bg-zinc-300'}`}
                      style={{ width: unlockProgress.qualitativeMet ? '100%' : '0%' }}
                    />
                  </div>
                  <span className="text-xs text-zinc-400 w-10 text-right">
                    {unlockProgress.qualitativeMet ? '✓' : '—'}
                  </span>
                </div>
              </div>
            </div>
          )}

        {/* MY ALIGNED ACTION (Stage 3+) */}
{(currentIdentity || coherenceStatement) && (
  <div className="bg-white rounded-xl p-4 border border-black/[0.04] shadow-sm">
    <div className="flex items-center gap-2 mb-2">
      <Zap className="w-4 h-4 text-amber-500" />
      <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">My Aligned Action</h3>
    </div>
    <p className="text-sm text-zinc-700 leading-relaxed">{coherenceStatement || currentIdentity}</p>
    {microAction && (
      <p className="text-xs text-amber-600 font-medium mt-2">
        Daily practice: {microAction}
      </p>
    )}
              {identitySprintDay && (
                <p className="text-xs text-zinc-400 mt-2">
                  Day {identitySprintDay} of 21
                </p>
              )}
            </div>
          )}

          {/* Awaken with 5 CTA */}
          <AwakenWithFiveCard />
        </div>
      </div>
    </>
  );
}
