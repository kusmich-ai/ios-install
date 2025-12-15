// components/MobileDashboard.tsx
'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

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

// Get status color based on REwired Index
function getStatusColor(index: number): string {
  if (index <= 20) return 'text-red-400';
  if (index <= 40) return 'text-yellow-400';
  if (index <= 60) return 'text-blue-400';
  if (index <= 80) return 'text-green-400';
  return 'text-purple-400';
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
        className="fixed top-4 left-4 z-30 w-10 h-10 bg-[#111111] border border-gray-700 rounded-lg flex items-center justify-center hover:border-[#ff9e19] transition-colors md:hidden"
        aria-label="Open dashboard"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-[#111111] border-r border-gray-800 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          aria-label="Close dashboard"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dashboard Content */}
        <div className="p-4 pt-6 overflow-y-auto h-full space-y-4">
          {/* Header */}
<div className="mb-2">
  <h1 className="text-xl font-bold text-white mb-1">IOS System Installer</h1>
  <p className="text-xs text-gray-400 mb-2">Neural & Mental Operating System</p>
  <p className="text-sm font-medium text-white">{userName ? `Hey, ${userName}` : 'Welcome'}</p>
  <p className="text-xs text-gray-400 mt-1">
    Stage {currentStage}: {getStageName(currentStage)}
  </p>
  <a 
    href="/profile/patterns"
    className="inline-flex items-center gap-1.5 mt-2 text-xs text-gray-500 hover:text-[#ff9e19] transition-colors"
  >
    🪞 <span className="hover:underline">Pattern Profile</span>
  </a>
</div>

          {/* REwired Index - Current with Delta */}
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">REwired Index</span>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${getStatusColor(currentRewiredIndex)}`}>
                  {currentRewiredIndex}
                </span>
                {rewiredDelta !== 0 && (
                  <span className={`text-sm font-medium ${rewiredDelta > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {rewiredDelta > 0 ? '+' : ''}{rewiredDelta}
                  </span>
                )}
              </div>
            </div>
            <div className="w-full rounded-full h-2 bg-[#1a1a1a]">
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
            <p className="text-xs text-gray-500 mt-1">{getStatusTier(currentRewiredIndex)}</p>
          </div>

          {/* Domain Scores with Deltas */}
          <div className="bg-gray-900 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Domain Scores</h3>

            {/* Regulation */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Regulation</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#22c55e]">
                    {displayScores.regulation.toFixed(1)}/5
                  </span>
                  {domainDeltas?.regulation !== undefined && domainDeltas.regulation !== 0 && (
                    <span className={`text-xs font-medium ${domainDeltas.regulation > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {domainDeltas.regulation > 0 ? '↑' : '↓'}{Math.abs(domainDeltas.regulation).toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full rounded-full h-1.5 bg-[#1a1a1a]">
                <div
                  className="h-1.5 rounded-full transition-all bg-[#22c55e]"
                  style={{ width: `${(displayScores.regulation / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Awareness */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Awareness</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#3b82f6]">
                    {displayScores.awareness.toFixed(1)}/5
                  </span>
                  {domainDeltas?.awareness !== undefined && domainDeltas.awareness !== 0 && (
                    <span className={`text-xs font-medium ${domainDeltas.awareness > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {domainDeltas.awareness > 0 ? '↑' : '↓'}{Math.abs(domainDeltas.awareness).toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full rounded-full h-1.5 bg-[#1a1a1a]">
                <div
                  className="h-1.5 rounded-full transition-all bg-[#3b82f6]"
                  style={{ width: `${(displayScores.awareness / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Outlook */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Outlook</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#f59e0b]">
                    {displayScores.outlook.toFixed(1)}/5
                  </span>
                  {domainDeltas?.outlook !== undefined && domainDeltas.outlook !== 0 && (
                    <span className={`text-xs font-medium ${domainDeltas.outlook > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {domainDeltas.outlook > 0 ? '↑' : '↓'}{Math.abs(domainDeltas.outlook).toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full rounded-full h-1.5 bg-[#1a1a1a]">
                <div
                  className="h-1.5 rounded-full transition-all bg-[#f59e0b]"
                  style={{ width: `${(displayScores.outlook / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Attention */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Attention</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#a855f7]">
                    {displayScores.attention.toFixed(1)}/5
                  </span>
                  {domainDeltas?.attention !== undefined && domainDeltas.attention !== 0 && (
                    <span className={`text-xs font-medium ${domainDeltas.attention > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {domainDeltas.attention > 0 ? '↑' : '↓'}{Math.abs(domainDeltas.attention).toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full rounded-full h-1.5 bg-[#1a1a1a]">
                <div
                  className="h-1.5 rounded-full transition-all bg-[#a855f7]"
                  style={{ width: `${(displayScores.attention / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>

{/* Stage 7 Unlock Button - Shows when eligible at Stage 6 */}
          {currentStage === 6 && unlockEligible && onStage7Unlock && (
            <div className="bg-gradient-to-r from-purple-900/50 to-orange-900/50 border border-purple-500/30 rounded-lg p-4">
              <h3 className="text-sm font-medium text-purple-300 mb-2">🔓 Final Stage Available</h3>
              <p className="text-xs text-gray-400 mb-3">
                You've demonstrated mastery at Stage 6. Ready to explore what's beyond?
              </p>
              <button
                onClick={() => {
                  onStage7Unlock();
                  setIsOpen(false); // Close drawer after clicking
                }}
                className="w-full px-4 py-2.5 bg-[#ff9e19] hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
              >
                Unlock Stage 7?
              </button>
            </div>
          )}

          {/* Unlock Progress */}
          
          {/* Unlock Progress */}
          {unlockProgress && !unlockEligible && (
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-3">
                Stage {currentStage + 1} Unlock Progress
              </h3>
              
              <div className="space-y-2">
                {/* Adherence Progress */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs w-14 ${unlockProgress.adherenceMet ? 'text-green-400' : 'text-gray-400'}`}>
                    {unlockProgress.adherenceMet ? '✓' : ''} Adherence
                  </span>
                  <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${unlockProgress.adherenceMet ? 'bg-green-500' : 'bg-[#ff9e19]'}`}
                      style={{ width: unlockProgress.adherenceMet ? '100%' : `${Math.min(100, adherencePercentage / unlockProgress.requiredAdherence * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-10 text-right">
                    {unlockProgress.adherenceMet ? '✓' : `${adherencePercentage}%`}
                  </span>
                </div>
                
                {/* Days Progress */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs w-14 ${unlockProgress.daysMet ? 'text-green-400' : 'text-gray-400'}`}>
                    {unlockProgress.daysMet ? '✓' : ''} Days
                  </span>
                  <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${unlockProgress.daysMet ? 'bg-green-500' : 'bg-[#ff9e19]'}`}
                      style={{ width: unlockProgress.daysMet ? '100%' : `${Math.min(100, consecutiveDays / unlockProgress.requiredDays * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-10 text-right">
                    {unlockProgress.daysMet ? '✓' : `${consecutiveDays}/${unlockProgress.requiredDays}`}
                  </span>
                </div>
                
                {/* Delta Progress */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs w-14 ${unlockProgress.deltaMet ? 'text-green-400' : 'text-gray-400'}`}>
                    {unlockProgress.deltaMet ? '✓' : ''} Growth
                  </span>
                  <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${unlockProgress.deltaMet ? 'bg-green-500' : 'bg-[#ff9e19]'}`}
                      style={{ width: unlockProgress.deltaMet ? '100%' : `${Math.min(100, Math.max(0, ((domainDeltas?.average || 0) / unlockProgress.requiredDelta) * 100))}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-10 text-right">
                    {unlockProgress.deltaMet ? '✓' : `+${(domainDeltas?.average || 0).toFixed(1)}`}
                  </span>
                </div>
                
                {/* Weekly Check-in */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs w-14 ${unlockProgress.qualitativeMet ? 'text-green-400' : 'text-gray-400'}`}>
                    {unlockProgress.qualitativeMet ? '✓' : ''} Check-in
                  </span>
                  <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${unlockProgress.qualitativeMet ? 'bg-green-500' : 'bg-gray-600'}`}
                      style={{ width: unlockProgress.qualitativeMet ? '100%' : '0%' }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-10 text-right">
                    {unlockProgress.qualitativeMet ? '✓' : '—'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Current Identity */}
          {currentIdentity && (
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Current Identity</h3>
              <p className="text-sm text-[#ff9e19] font-medium">{currentIdentity}</p>
              {microAction && (
                <p className="text-xs text-gray-400 mt-1">Daily proof: {microAction}</p>
              )}
              {identitySprintDay && (
                <p className="text-xs text-gray-500 mt-2">
                  Day {identitySprintDay} of 21
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
