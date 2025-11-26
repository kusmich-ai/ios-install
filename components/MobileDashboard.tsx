// components/MobileDashboard.tsx
'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface MobileDashboardProps {
  userName: string;
  currentStage: number;
  rewiredIndex: number;
  domainScores: {
    regulation: number;
    awareness: number;
    outlook: number;
    attention: number;
  };
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
  rewiredIndex,
  domainScores
}: MobileDashboardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const stageProgress = ((currentStage - 1) / 6) * 100;

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

        {/* Dashboard Content - Same as desktop sidebar */}
        <div className="p-4 pt-6 overflow-y-auto h-full">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white mb-1">IOS System Installer</h1>
            <p className="text-xs text-gray-400 mb-2">Neural & Mental Operating System</p>
            <p className="text-sm font-medium text-white">{userName}</p>
          </div>

          {/* Stage Progress */}
          <div className="mb-6 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-[#ff9e19] font-semibold">
                Stage {currentStage} of 7
              </span>
            </div>
            <div className="text-xs text-gray-300 mb-2">
              {getStageName(currentStage)}
            </div>
            <div className="w-full rounded-full h-1.5 bg-[#1a1a1a]">
              <div
                className="h-1.5 rounded-full transition-all bg-[#ff9e19]"
                style={{ width: `${stageProgress}%` }}
              />
            </div>
          </div>

          {/* REwired Index */}
          <div className="mb-6 p-4 rounded-lg text-center border-2 bg-[#0a0a0a] border-[#ff9e19]">
            <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">REwired Index</div>
            <div className="text-4xl font-bold mb-1 text-[#ff9e19]">
              {rewiredIndex}
            </div>
            <div className={`text-xs font-medium mb-2 ${getStatusColor(rewiredIndex)}`}>
              {getStatusTier(rewiredIndex)}
            </div>
            <div className="w-full rounded-full h-1.5 bg-[#1a1a1a]">
              <div
                className="h-1.5 rounded-full transition-all bg-[#ff9e19]"
                style={{ width: `${rewiredIndex}%` }}
              />
            </div>
          </div>

          {/* Domain Scores */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Domain Scores</h3>

            {/* Regulation */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-300">Regulation</span>
                <span className="text-sm font-semibold text-[#3b82f6]">{domainScores.regulation.toFixed(1)}/5</span>
              </div>
              <div className="w-full rounded-full h-2 bg-[#1a1a1a]">
                <div
                  className="h-2 rounded-full transition-all bg-[#3b82f6]"
                  style={{ width: `${(domainScores.regulation / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Awareness */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-300">Awareness</span>
                <span className="text-sm font-semibold text-[#10b981]">{domainScores.awareness.toFixed(1)}/5</span>
              </div>
              <div className="w-full rounded-full h-2 bg-[#1a1a1a]">
                <div
                  className="h-2 rounded-full transition-all bg-[#10b981]"
                  style={{ width: `${(domainScores.awareness / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Outlook */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-300">Outlook</span>
                <span className="text-sm font-semibold text-[#f59e0b]">{domainScores.outlook.toFixed(1)}/5</span>
              </div>
              <div className="w-full rounded-full h-2 bg-[#1a1a1a]">
                <div
                  className="h-2 rounded-full transition-all bg-[#f59e0b]"
                  style={{ width: `${(domainScores.outlook / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Attention */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-300">Attention</span>
                <span className="text-sm font-semibold text-[#8b5cf6]">{domainScores.attention.toFixed(1)}/5</span>
              </div>
              <div className="w-full rounded-full h-2 bg-[#1a1a1a]">
                <div
                  className="h-2 rounded-full transition-all bg-[#8b5cf6]"
                  style={{ width: `${(domainScores.attention / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
