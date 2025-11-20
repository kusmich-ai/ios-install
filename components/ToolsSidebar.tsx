'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import { STAGES, ON_DEMAND_TOOLS, getStagePractices, getUnlockedOnDemandTools } from '@/app/config/stages';
import type { UserProgress } from '@/app/hooks/useUserProgress';

interface ToolsSidebarProps {
  progress: UserProgress;
  onPracticeClick: (practiceId: string) => void;
  onToolClick: (toolId: string) => void;
}

export default function ToolsSidebar({ progress, onPracticeClick, onToolClick }: ToolsSidebarProps) {
  const [dailyExpanded, setDailyExpanded] = useState(true);
  const [toolsExpanded, setToolsExpanded] = useState(true);

  const currentStagePractices = getStagePractices(progress.currentStage);
  const unlockedTools = getUnlockedOnDemandTools(progress.currentStage);

  const getPracticeStatus = (practiceId: string): 'completed' | 'pending' | 'locked' => {
    const practiceData = progress.dailyPractices[practiceId];
    if (practiceData?.completed) return 'completed';
    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'pending':
        return '⏳';
      case 'locked':
        return '🔒';
      default:
        return '⏳';
    }
  };

  return (
    <aside className="w-80 border-r border-gray-800 bg-[#111111] overflow-y-auto flex-shrink-0">
      <div className="p-4">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-1">Tools</h2>
          <p className="text-xs text-gray-400">Stage {progress.currentStage} Practices & Protocols</p>
        </div>

        {/* Daily Practices Section */}
        <div className="mb-6">
          <button
            onClick={() => setDailyExpanded(!dailyExpanded)}
            className="w-full flex items-center justify-between text-sm font-semibold text-gray-300 hover:text-white transition-colors mb-3"
          >
            <span>DAILY PRACTICES</span>
            {dailyExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {dailyExpanded && (
            <div className="space-y-2">
              {currentStagePractices.map((practice) => {
                const status = getPracticeStatus(practice.id);
                const isCompleted = status === 'completed';
                
                return (
                  <button
                    key={practice.id}
                    onClick={() => onPracticeClick(practice.id)}
                    disabled={isCompleted}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      isCompleted
                        ? 'bg-green-500/10 border border-green-500/20 cursor-default'
                        : 'bg-[#0a0a0a] border border-gray-700 hover:border-[#ff9e19] cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{practice.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs">{getStatusIcon(status)}</span>
                          <span className={`text-sm font-medium ${
                            isCompleted ? 'text-green-400 line-through' : 'text-white'
                          }`}>
                            {practice.shortName}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {practice.duration} min
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* On-Demand Tools Section */}
        <div>
          <button
            onClick={() => setToolsExpanded(!toolsExpanded)}
            className="w-full flex items-center justify-between text-sm font-semibold text-gray-300 hover:text-white transition-colors mb-3"
          >
            <span>ON-DEMAND TOOLS</span>
            {toolsExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {toolsExpanded && (
            <div className="space-y-2">
              {unlockedTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => onToolClick(tool.id)}
                  className="w-full text-left p-3 rounded-lg bg-[#0a0a0a] border border-gray-700 hover:border-[#ff9e19] transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{tool.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white mb-1">
                        {tool.shortName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {tool.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
