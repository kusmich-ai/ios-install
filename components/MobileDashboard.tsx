// components/MobileDashboard.tsx
// Mobile dashboard drawer with luxury cream styling (matches DashboardSidebar)
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, User, TrendingUp, TrendingDown, Zap, Sparkles } from 'lucide-react';
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

interface MobileDashboardProps {
  userName?: string;
  currentStage: number;
  
  // Baseline data
  baselineRewiredIndex: number;
  baselineDomainScores: {
    regulation: number;
    awareness: number;
    outlook: number;
    attention: number;
  };
  
  // Current progress
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
  
  // Aligned Action (Stage 3+) - with backwards compatibility
  coherenceStatement?: string;
  currentIdentity?: string;
  microAction?: string;
  sprintDay?: number;
  identitySprintDay?: number;
  
  // Handlers
  onStage7Click?: () => void;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getStageName(stage: number): string {
  const names: { [key: number]: string } = {
    1: 'Neural Priming',
    2: 'Embodied Awareness',
    3: 'Aligned Action Mode',
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

// Monochromatic amber shades for domains (luxury design)
const DOMAIN_COLORS = {
  regulation: { bar: 'bg-amber-600', text: 'text-amber-600' },
  awareness: { bar: 'bg-amber-500', text: 'text-amber-500' },
  outlook: { bar: 'bg-amber-400', text: 'text-amber-400' },
  attention: { bar: 'bg-amber-300', text: 'text-amber-500' },
};

// ============================================
// COMPONENT
// ============================================

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
  coherenceStatement,
  currentIdentity,
  microAction,
  sprintDay,
  identitySprintDay,
  onStage7Click,
}: MobileDashboardProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Use sprintDay with fallback to identitySprintDay for backwards compatibility
  const displaySprintDay = sprintDay ?? identitySprintDay;
  
  // Use coherenceStatement with fallback to currentIdentity for backwards compatibility
  const displayStatement = coherenceStatement ?? currentIdentity;

  // Calculate current REwired Index
  const currentReg = currentDomainScores?.regulation ?? baselineDomainScores.regulation;
  const currentAware = currentDomainScores?.awareness ?? baselineDomainScores.awareness;
  const currentOut = currentDomainScores?.outlook ?? baselineDomainScores.outlook;
  const currentAtt = currentDomainScores?.attention ?? baselineDomainScores.attention;
  const currentRewiredIndex = Math.round((currentReg + currentAware + currentOut + currentAtt) / 4 * 20);
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
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition-colors"
          aria-label="Close dashboard"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Drawer Content */}
        <div className="h-full overflow-y-auto p-5 space-y-4">
          
          {/* ==========================================
              USER INFO HEADER
              ========================================== */}
          <div className="border-b border-black/5 pb-4 pt-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                <User className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-zinc-800">
                  {userName ? `Hey, ${userName}` : 'Welcome'}
                </h2>
                <p className="text-xs text-zinc-500">
                  Stage {currentStage}: {getStageName(currentStage)}
                </p>
              </div>
            </div>
            
            <Link 
              href="/profile/patterns"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-medium transition-colors border border-amber-200/50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Pattern Profile & Transformation Map
            </Link>
          </div>

          {/* ==========================================
              REWIRED INDEX
              ========================================== */}
          <div className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">REwired Index</span>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${getStatusColor(currentRewiredIndex)}`}>
                  {currentRewiredIndex}
                </span>
                {rewiredDelta !== 0 && (
                  <span className={`text-sm font-semibold flex items-center gap-0.5 ${rewiredDelta > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {rewiredDelta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {rewiredDelta > 0 ? '+' : ''}{rewiredDelta}
                  </span>
                )}
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="h-2 bg-zinc-100 rounded-full overflow-hidden mb-2">
              <div 
                className={`h-full transition-all ${getProgressBarColor(currentRewiredIndex)}`}
                style={{ width: `${Math.min(currentRewiredIndex, 100)}%` }}
              />
            </div>
            
            <p className="text-xs text-zinc-500">
              Status: <span className={`font-medium ${getStatusColor(currentRewiredIndex)}`}>{getStatusTier(currentRewiredIndex)}</span>
            </p>
          </div>

          {/* ==========================================
              DOMAIN SCORES
              ========================================== */}
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
                  <span className={`text-xs w-20 ${DOMAIN_COLORS[key as keyof typeof DOMAIN_COLORS].text}`}>
                    {label}
                  </span>
                  <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${DOMAIN_COLORS[key as keyof typeof DOMAIN_COLORS].bar}`}
                      style={{ width: `${(value / 5) * 100}%` }}
                    />
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
              STAGE 7 UNLOCK BUTTON
              ========================================== */}
          {currentStage === 6 && unlockEligible && onStage7Click && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300/50 rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-medium text-amber-800 mb-2">🔓 Final Stage Available</h3>
              <p className="text-xs text-amber-700/80 mb-3">
                You've demonstrated mastery at Stage 6. Ready to explore what's beyond?
              </p>
              <button
                onClick={() => {
                  onStage7Click();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                Unlock Stage 7
              </button>
            </div>
          )}

          {/* ==========================================
              UNLOCK PROGRESS
              ========================================== */}
          {unlockProgress && currentStage < 7 && (
            <div className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-sm">
              <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Unlock Progress</h3>
              <div className="space-y-2">
                {/* Adherence */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs w-16 ${unlockProgress.adherenceMet ? 'text-green-600' : 'text-zinc-500'}`}>
                    {unlockProgress.adherenceMet ? '✓' : ''} Adherence
                  </span>
                  <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${unlockProgress.adherenceMet ? 'bg-green-500' : 'bg-zinc-300'}`}
                      style={{ width: `${Math.min((adherencePercentage / (unlockProgress.requiredAdherence || 80)) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-zinc-400 w-12 text-right">
                    {adherencePercentage}%
                  </span>
                </div>
                
                {/* Days */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs w-16 ${unlockProgress.daysMet ? 'text-green-600' : 'text-zinc-500'}`}>
                    {unlockProgress.daysMet ? '✓' : ''} Days
                  </span>
                  <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${unlockProgress.daysMet ? 'bg-green-500' : 'bg-zinc-300'}`}
                      style={{ width: `${Math.min((consecutiveDays / (unlockProgress.requiredDays || 14)) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-zinc-400 w-12 text-right">
                    {consecutiveDays}/{unlockProgress.requiredDays || 14}
                  </span>
                </div>
                
                {/* Delta */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs w-16 ${unlockProgress.deltaMet ? 'text-green-600' : 'text-zinc-500'}`}>
                    {unlockProgress.deltaMet ? '✓' : ''} Growth
                  </span>
                  <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${unlockProgress.deltaMet ? 'bg-green-500' : 'bg-zinc-300'}`}
                      style={{ width: unlockProgress.deltaMet ? '100%' : '50%' }}
                    />
                  </div>
                  <span className="text-xs text-zinc-400 w-12 text-right">
                    {domainDeltas?.average !== undefined ? `+${domainDeltas.average.toFixed(1)}` : '—'}
                  </span>
                </div>
                
                {/* Qualitative */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs w-16 ${unlockProgress.qualitativeMet ? 'text-green-600' : 'text-zinc-500'}`}>
                    {unlockProgress.qualitativeMet ? '✓' : ''} Check-in
                  </span>
                  <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${unlockProgress.qualitativeMet ? 'bg-green-500' : 'bg-zinc-300'}`}
                      style={{ width: unlockProgress.qualitativeMet ? '100%' : '0%' }}
                    />
                  </div>
                  <span className="text-xs text-zinc-400 w-12 text-right">
                    {unlockProgress.qualitativeMet ? '✓' : '—'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              MY ALIGNED ACTION (Stage 3+)
              ========================================== */}
          {(displayStatement || microAction) && (
            <div className="bg-white rounded-xl p-4 border border-zinc-200/80 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">My Aligned Action</h3>
              </div>
              {displayStatement && (
                <p className="text-sm text-zinc-700 leading-relaxed">{displayStatement}</p>
              )}
              {microAction && (
                <p className="text-xs text-amber-600 font-medium mt-2">
                  Daily practice: {microAction}
                </p>
              )}
              {displaySprintDay && (
                <p className="text-xs text-zinc-400 mt-2">
                  Day {displaySprintDay} of 21
                </p>
              )}
            </div>
          )}

          {/* ==========================================
              AWAKEN WITH 5 CTA
              ========================================== */}
          <AwakenWithFiveCard />
          
        </div>
      </div>
    </>
  );
}
