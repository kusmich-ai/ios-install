'use client';

import { useState } from 'react';
import { Zap, X } from 'lucide-react';
import { getStagePractices, getUnlockedOnDemandTools } from '@/app/config/stages';
import type { UserProgress } from '@/app/hooks/useUserProgress';

interface FloatingActionButtonProps {
  progress: UserProgress;
  onPracticeClick: (practiceId: string) => void;
  onToolClick: (toolId: string) => void;
}

export default function FloatingActionButton({ 
  progress, 
  onPracticeClick, 
  onToolClick 
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentStagePractices = getStagePractices(progress.currentStage);
  const unlockedTools = getUnlockedOnDemandTools(progress.currentStage);

  const getPracticeStatus = (practiceId: string): 'completed' | 'pending' => {
    const practiceData = progress.dailyPractices[practiceId];
    if (practiceData?.completed) return 'completed';
    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    return status === 'completed' ? '✅' : '⏳';
  };

  const handlePracticeClick = (practiceId: string) => {
    onPracticeClick(practiceId);
    setIsOpen(false);
  };

  const handleToolClick = (toolId: string) => {
    onToolClick(toolId);
    setIsOpen(false);
  };

  // Calculate completion stats
  const completedCount = currentStagePractices.filter(p => getPracticeStatus(p.id) === 'completed').length;
  const totalCount = currentStagePractices.length;
  const allComplete = completedCount === totalCount;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Menu */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 w-80 max-h-[70vh] overflow-y-auto bg-[#111111] border border-gray-700 rounded-lg shadow-xl z-50">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Tools</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Today's Progress */}
            <div className={`mb-4 p-3 rounded-lg border ${
              allComplete 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-[#0a0a0a] border-gray-700'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Today's Progress</span>
                <span className={`text-sm font-bold ${allComplete ? 'text-green-400' : 'text-[#ff9e19]'}`}>
                  {completedCount}/{totalCount}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${allComplete ? 'bg-green-500' : 'bg-[#ff9e19]'}`}
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
              {allComplete && (
                <p className="text-xs text-green-400 mt-2 text-center">All practices complete! 🎉</p>
              )}
            </div>

            {/* Adherence Stats */}
            <div className="mb-4 p-3 rounded-lg bg-[#0a0a0a] border border-gray-700">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <div className="text-lg font-bold text-[#ff9e19]">{progress.adherencePercentage}%</div>
                  <div className="text-xs text-gray-500">14-Day Adherence</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-[#ff9e19]">{progress.consecutiveDays}</div>
                  <div className="text-xs text-gray-500">Day Streak</div>
                </div>
              </div>
            </div>

            {/* Daily Practices */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-400 mb-2">
                DAILY PRACTICES
              </div>
              <div className="space-y-2">
                {currentStagePractices.map((practice) => {
                  const status = getPracticeStatus(practice.id);
                  const isCompleted = status === 'completed';
                  
                  return (
                    <button
                      key={practice.id}
                      onClick={() => handlePracticeClick(practice.id)}
                      disabled={isCompleted}
                      className={`w-full text-left p-3 rounded-lg ${
                        isCompleted
                          ? 'bg-green-500/10 border border-green-500/20'
                          : 'bg-[#0a0a0a] border border-gray-700 active:border-[#ff9e19]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{getStatusIcon(status)}</span>
                        <span className={`text-sm font-medium ${
                          isCompleted ? 'text-green-400 line-through' : 'text-white'
                        }`}>
                          {practice.shortName}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 ml-6">
                        {practice.duration} min
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* On-Demand Tools */}
            <div>
              <div className="text-xs font-semibold text-gray-400 mb-2">
                ON-DEMAND TOOLS
              </div>
              <div className="space-y-2">
                {unlockedTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleToolClick(tool.id)}
                    className="w-full text-left p-3 rounded-lg bg-[#0a0a0a] border border-gray-700 active:border-[#ff9e19]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{tool.icon}</span>
                      <span className="text-sm font-medium text-white">
                        {tool.shortName}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-[#ff9e19] rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 transition-colors z-30"
      >
        <Zap className="w-6 h-6 text-white" />
      </button>
    </>
  );
}
