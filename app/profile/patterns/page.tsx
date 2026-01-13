// ============================================
// app/profile/patterns/page.tsx
// Pattern Profile Page - ENHANCED with Visual Timeline
// Luxury styling update
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { IOS_STAGE_MAPPING } from '@/lib/mirrorMapping';
import { ArrowLeft, RefreshCw, Sparkles, Check, MapPin, Flag } from 'lucide-react';

export const dynamic = 'force-dynamic';

// Types
interface Pattern {
  id: string;
  name: string;
  description: string;
  evidence: string;
  severity: number;
  connected_to?: string[];
  ios_stages?: number[];
  ios_practices?: string[];
}

interface PatternCategory {
  patterns: Pattern[];
}

interface CorePattern {
  name: string;
  description: string;
  evidence: string;
  severity: number;
  connected_patterns?: string[];
}

interface Milestone {
  number: number;
  title: string;
  timeframe: string;
  stage: number;
  stage_name: string;
  patterns_addressed: string[];
  whats_broken: string;
  what_changes: string[];
  the_shift: string;
}

interface TransformationRoadmap {
  milestones: Milestone[];
  destination: {
    core_pattern_name: string;
    liberation_statement: string;
  };
}

interface PatternProfile {
  quality_score: number;
  patterns: {
    nervous_system: PatternCategory;
    awareness: PatternCategory;
    identity: PatternCategory;
    attention: PatternCategory;
    relational: PatternCategory;
    outlook: PatternCategory;
    shadow: PatternCategory;
  };
  core_pattern: CorePattern;
  ios_roadmap: any;
  transformation_roadmap: TransformationRoadmap | null;
  processed_at: string;
}

// Stage info for the visual timeline - refined, sophisticated colors
const STAGE_INFO: Record<number, { name: string; icon: string; color: string }> = {
  1: { name: 'Neural Priming', icon: '🫁', color: '#059669' },      // emerald-600
  2: { name: 'Embodied Awareness', icon: '🧘', color: '#2563eb' },  // blue-600
  3: { name: 'Identity Mode', icon: '⚡', color: '#d97706' },       // amber-600
  4: { name: 'Flow Mode', icon: '🎯', color: '#7c3aed' },           // violet-600
  5: { name: 'Relational Coherence', icon: '💞', color: '#db2777' }, // pink-600
  6: { name: 'Integration', icon: '🌙', color: '#4f46e5' },         // indigo-600
  7: { name: 'Accelerated Expansion', icon: '🚀', color: '#b45309' } // amber-700
};

export default function PatternProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<PatternProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'patterns'>('roadmap');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedMilestone, setExpandedMilestone] = useState<number | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<number>(1);

  useEffect(() => {
    fetchPatternProfile();
    fetchUserProgress();
  }, []);

  const fetchPatternProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mirror/process');
      const data = await response.json();

      if (data.exists && !data.skipped && data.data) {
        setProfile(data.data);
        if (!data.data.transformation_roadmap) {
          setActiveTab('patterns');
        }
      } else if (data.exists && data.skipped) {
        setError('skipped');
      } else {
        setError('not_found');
      }
    } catch (err) {
      console.error('Failed to fetch pattern profile:', err);
      setError('error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: progress } = await supabase
        .from('user_progress')
        .select('current_stage')
        .eq('user_id', user.id)
        .single();

      if (progress?.current_stage) {
        setCurrentStage(progress.current_stage);
      }
    } catch (err) {
      console.error('Failed to fetch user progress:', err);
    }
  };

  const regenerateRoadmap = async () => {
    setIsRegenerating(true);
    setRegenerateError(null);
    
    try {
      const response = await fetch('/api/mirror/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const rawText = await response.text();
      
      if (!rawText || rawText.trim() === '') {
        throw new Error('Server returned empty response.');
      }
      
      let result;
      try {
        result = JSON.parse(rawText);
      } catch (parseErr) {
        if (rawText.includes('<!DOCTYPE') || rawText.includes('<html')) {
          throw new Error('API route not found (404).');
        }
        throw new Error(`Invalid JSON response: ${rawText.substring(0, 200)}`);
      }

      if (!response.ok) {
        throw new Error(result.error || `Server error: ${response.status}`);
      }

      if (result.transformation_roadmap && profile) {
        setProfile({
          ...profile,
          transformation_roadmap: result.transformation_roadmap
        });
        setActiveTab('roadmap');
      }
    } catch (err) {
      console.error('Regeneration error:', err);
      setRegenerateError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRerunMirror = () => {
    router.push('/mirror?rerun=true');
  };

  // Refined severity colors - more muted and sophisticated
  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 5: return 'text-rose-400';
      case 4: return 'text-amber-400';
      case 3: return 'text-yellow-500';
      case 2: return 'text-sky-400';
      default: return 'text-zinc-400';
    }
  };

  const getSeverityLabel = (severity: number) => {
    switch (severity) {
      case 5: return 'Critical';
      case 4: return 'High';
      case 3: return 'Moderate';
      case 2: return 'Low';
      default: return 'Minor';
    }
  };

  const categoryLabels: Record<string, { label: string; icon: string }> = {
    nervous_system: { label: 'Nervous System', icon: '⚡' },
    awareness: { label: 'Awareness Blind Spots', icon: '👁' },
    identity: { label: 'Identity Loops', icon: '🎭' },
    attention: { label: 'Attention Leaks', icon: '🎯' },
    relational: { label: 'Relational Patterns', icon: '💞' },
    outlook: { label: 'Emotional Outlook', icon: '🌤' },
    shadow: { label: 'Shadow Material', icon: '🌑' }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get milestone status based on current stage
  const getMilestoneStatus = (milestoneStage: number): 'completed' | 'current' | 'upcoming' => {
    if (milestoneStage < currentStage) return 'completed';
    if (milestoneStage === currentStage) return 'current';
    return 'upcoming';
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="flex items-center gap-4">
          <div className="animate-spin w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full" />
          <span className="text-zinc-400">Loading your pattern profile...</span>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR/NOT FOUND STATES
  // ============================================
  if (error === 'not_found') {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">🪞</div>
          <h1 className="text-2xl font-bold text-white mb-4">No Pattern Profile Yet</h1>
          <p className="text-zinc-400 mb-8">
            You haven't completed The Mirror yet. Complete the pattern analysis to see your transformation roadmap.
          </p>
          <button
            onClick={() => router.push('/mirror?rerun=true')}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-sm shadow-amber-500/20"
          >
            Start The Mirror
          </button>
        </div>
      </div>
    );
  }

  if (error === 'skipped') {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">🪞</div>
          <h1 className="text-2xl font-bold text-white mb-4">Mirror Skipped</h1>
          <p className="text-zinc-400 mb-8">
            You skipped The Mirror during onboarding. You can complete it now to unlock your personalized transformation roadmap.
          </p>
          <button
            onClick={() => router.push('/mirror?rerun=true')}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-sm shadow-amber-500/20"
          >
            Complete The Mirror
          </button>
        </div>
      </div>
    );
  }

  if (error === 'error' || !profile) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">Something Went Wrong</h1>
          <p className="text-zinc-400 mb-8">
            We couldn't load your pattern profile. Please try again.
          </p>
          <button
            onClick={fetchPatternProfile}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-sm shadow-amber-500/20 flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: NO TRANSFORMATION ROADMAP
  // ============================================
  const renderNoRoadmapPrompt = () => (
    <div className="bg-gradient-to-br from-[#222222] to-[#1a1a1a] rounded-xl border border-amber-500/30 p-8 text-center">
      <div className="text-5xl mb-4">✨</div>
      <h3 className="text-xl font-bold text-white mb-3">
        Generate Your Transformation Roadmap
      </h3>
      <p className="text-zinc-400 mb-6 max-w-md mx-auto">
        Your patterns have been analyzed. Now let's create a personalized roadmap showing exactly how each IOS stage will transform these patterns.
      </p>
      
      {regenerateError && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 mb-4 max-w-lg mx-auto text-left">
          <p className="text-rose-400 text-sm font-medium mb-1">Error:</p>
          <p className="text-rose-300 text-sm font-mono break-all">{regenerateError}</p>
        </div>
      )}
      
      <button
        onClick={regenerateRoadmap}
        disabled={isRegenerating}
        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-sm shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
      >
        {isRegenerating ? (
          <>
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Generate Transformation Roadmap
          </>
        )}
      </button>
      
      <p className="text-zinc-600 text-sm mt-4">
        Takes about 10-15 seconds
      </p>
    </div>
  );

  // ============================================
  // RENDER: VISUAL TIMELINE ROADMAP
  // ============================================
  const renderTransformationRoadmap = () => {
    if (!profile?.transformation_roadmap) {
      return renderNoRoadmapPrompt();
    }

const { milestones: unsortedMilestones, destination } = profile.transformation_roadmap;

    return (
      <div className="space-y-6">
        {/* Current Position Indicator */}
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent rounded-xl border border-amber-500/30 p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-zinc-400 text-sm">You are here</p>
              <p className="text-white font-bold text-lg">
                Stage {currentStage}: {STAGE_INFO[currentStage]?.name || 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        {/* Core Pattern Banner */}
        {profile.core_pattern && (
          <div className="bg-[#222222] rounded-xl border border-rose-500/20 p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🎯</span>
              <span className="text-rose-400 font-bold text-sm uppercase tracking-wide">Core Pattern to Transform</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              "{profile.core_pattern.name}"
            </h3>
            <p className="text-zinc-400">
              {profile.core_pattern.description || 'The root pattern. Everything else branches from this.'}
            </p>
          </div>
        )}

        {/* Visual Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500 via-amber-500/30 to-zinc-800" />
          
          {/* Start marker */}
          <div className="relative flex items-center gap-4 mb-8 pl-1">
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border-2 border-amber-500 flex items-center justify-center z-10">
              <span className="text-lg">🏁</span>
            </div>
            <div>
              <p className="text-amber-500 font-semibold">START</p>
              <p className="text-zinc-500 text-sm">Your transformation begins</p>
            </div>
          </div>

          {/* Milestones */}
          {milestones.map((milestone, index) => {
            const status = getMilestoneStatus(milestone.stage);
            const isExpanded = expandedMilestone === index;
            const stageInfo = STAGE_INFO[milestone.stage] || { name: 'Unknown', icon: '❓', color: '#666' };
            
            return (
              <div key={index} className="relative mb-6">
                {/* Timeline node */}
                <div className="absolute left-1 top-6 z-10">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      status === 'completed' 
                        ? 'bg-emerald-600 border-emerald-600' 
                        : status === 'current'
                          ? 'bg-gradient-to-br from-amber-500 to-amber-600 border-amber-500 ring-4 ring-amber-500/20'
                          : 'bg-[#222222] border-zinc-700'
                    }`}
                  >
                    {status === 'completed' ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : status === 'current' ? (
                      <MapPin className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-zinc-500 font-bold">{milestone.number}</span>
                    )}
                  </div>
                </div>

                {/* Milestone Card */}
                <div className={`ml-16 rounded-xl border overflow-hidden transition-all ${
                  status === 'completed'
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : status === 'current'
                      ? 'bg-amber-500/10 border-amber-500/30 shadow-lg shadow-amber-500/5'
                      : 'bg-[#222222] border-white/[0.06]'
                }`}>
                  {/* Card Header - Clickable */}
                  <button
                    onClick={() => setExpandedMilestone(isExpanded ? null : index)}
                    className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Stage Badge */}
                      <div 
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ 
                          backgroundColor: `${stageInfo.color}15`,
                          color: stageInfo.color
                        }}
                      >
                        {stageInfo.icon} Stage {milestone.stage}
                      </div>
                      
                      <div className="text-left">
                        <h3 className={`font-bold ${
                          status === 'completed' ? 'text-emerald-400' :
                          status === 'current' ? 'text-amber-500' : 'text-white'
                        }`}>
                          {milestone.title}
                        </h3>
                        <p className="text-zinc-500 text-sm">
                          {milestone.timeframe} • {milestone.stage_name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {status === 'completed' && (
                        <span className="text-emerald-400 text-xs font-medium">COMPLETE</span>
                      )}
                      {status === 'current' && (
                        <span className="text-amber-500 text-xs font-medium">IN PROGRESS</span>
                      )}
                      <span className={`text-zinc-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-white/[0.06] p-6 space-y-6">
                      {/* What's Broken */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-rose-400">✗</span>
                          <span className="text-rose-400 font-medium text-sm uppercase tracking-wide">What's Broken</span>
                        </div>
                        <p className="text-zinc-300 leading-relaxed">
                          {milestone.whats_broken}
                        </p>
                      </div>

                      {/* What Changes */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-emerald-400">✓</span>
                          <span className="text-emerald-400 font-medium text-sm uppercase tracking-wide">What Changes</span>
                        </div>
                        <ul className="space-y-2">
                          {milestone.what_changes.map((change, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <span className="text-amber-500 mt-1">→</span>
                              <span className="text-zinc-300">{change}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* The Shift */}
                      <div className="bg-[#1a1a1a] rounded-lg p-4 border border-white/[0.04]">
                        <div className="text-zinc-500 text-xs uppercase tracking-wide mb-2">The Shift</div>
                        <p className="text-white font-medium italic">
                          {milestone.the_shift}
                        </p>
                      </div>

                      {/* Patterns Addressed */}
                      {milestone.patterns_addressed && milestone.patterns_addressed.length > 0 && (
                        <div>
                          <div className="text-zinc-500 text-xs uppercase tracking-wide mb-2">Patterns Addressed</div>
                          <div className="flex flex-wrap gap-2">
                            {milestone.patterns_addressed.map((pattern, i) => (
                              <span 
                                key={i}
                                className="text-xs bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full border border-amber-500/20"
                              >
                                {pattern}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Destination marker */}
          <div className="relative flex items-center gap-4 pl-1 mt-8">
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border-2 border-violet-500 flex items-center justify-center z-10">
              <Flag className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <p className="text-violet-400 font-semibold">DESTINATION</p>
              <p className="text-zinc-500 text-sm">Full IOS Installation Complete</p>
            </div>
          </div>
        </div>

        {/* Destination Card */}
        {destination && (
          <div className="bg-gradient-to-br from-violet-500/10 to-[#1a1a1a] rounded-xl border border-violet-500/20 p-8 text-center mt-8">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-white mb-4">THE DESTINATION</h3>
            <p className="text-zinc-300 leading-relaxed max-w-2xl mx-auto text-lg">
              {destination.liberation_statement}
            </p>
            <div className="mt-6 pt-6 border-t border-violet-500/20">
              <p className="text-violet-400 font-medium">
                That's the installation. That's who you're becoming.
              </p>
            </div>
          </div>
        )}

        {/* Progress Summary */}
        <div className="bg-[#222222] rounded-xl border border-white/[0.06] p-6">
          <h4 className="text-white font-semibold mb-4">Your Journey Progress</h4>
          <div className="flex items-center gap-2 mb-4">
            {milestones.map((m, i) => {
              const status = getMilestoneStatus(m.stage);
              return (
                <div key={i} className="flex-1 flex items-center">
                  <div 
                    className={`h-2 flex-1 rounded-full ${
                      status === 'completed' ? 'bg-emerald-500' :
                      status === 'current' ? 'bg-amber-500' : 'bg-zinc-800'
                    }`}
                  />
                  {i < milestones.length - 1 && <div className="w-1" />}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Start</span>
            <span>Stage {currentStage} of {Math.max(...milestones.map(m => m.stage))}</span>
            <span>Destination</span>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER: PATTERNS BREAKDOWN
  // ============================================
  const renderPatternsBreakdown = () => {
    if (!profile) return null;

    return (
      <div className="space-y-4">
        {Object.entries(profile.patterns).map(([key, category]) => {
          const info = categoryLabels[key];
          const patterns = category?.patterns || [];
          const isExpanded = expandedCategory === key;
          
          if (patterns.length === 0) return null;

          return (
            <div
              key={key}
              className="bg-[#222222] rounded-xl border border-white/[0.06] overflow-hidden"
            >
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : key)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{info?.icon}</span>
                  <span className="text-white font-medium">{info?.label}</span>
                  <span className="text-zinc-500 text-sm">
                    ({patterns.length} pattern{patterns.length !== 1 ? 's' : ''})
                  </span>
                </div>
                <span className="text-zinc-500">
                  {isExpanded ? '▲' : '▼'}
                </span>
              </button>

              {isExpanded && (
                <div className="border-t border-white/[0.06] p-4 space-y-4">
                  {patterns.map((pattern: Pattern, i: number) => (
                    <div
                      key={pattern.id || i}
                      className="bg-[#1a1a1a] rounded-lg p-4 border border-white/[0.04]"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-medium">{pattern.name}</h4>
                        <span className={`text-sm ${getSeverityColor(pattern.severity)}`}>
                          {getSeverityLabel(pattern.severity)}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-sm mb-3">
                        {pattern.description}
                      </p>
                      {pattern.evidence && (
                        <p className="text-zinc-500 text-sm italic mb-3">
                          "{pattern.evidence}"
                        </p>
                      )}
                      {pattern.ios_stages && pattern.ios_stages.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {pattern.ios_stages.map(stage => (
                            <span
                              key={stage}
                              className="text-xs bg-amber-500/10 text-amber-500 px-2 py-1 rounded border border-amber-500/20"
                            >
                              Stage {stage}: {IOS_STAGE_MAPPING[stage as keyof typeof IOS_STAGE_MAPPING]?.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-[#1a1a1a] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          {profile.processed_at && (
            <span className="text-zinc-600 text-sm">
              Analyzed {formatDate(profile.processed_at)}
            </span>
          )}
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🪞</div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Your Transformation Roadmap
          </h1>
          <p className="text-zinc-400">
            A personalized map from where you are to who you're becoming
          </p>
        </div>

        {/* Quality Score */}
        <div className="bg-[#222222] rounded-xl border border-white/[0.06] p-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className={`w-2 h-8 rounded-full transition-colors ${
                    n <= profile.quality_score ? 'bg-amber-500' : 'bg-zinc-800'
                  }`}
                />
              ))}
            </div>
            <div>
              <p className="text-white font-medium">
                Analysis Quality: {profile.quality_score}/5
              </p>
              <p className="text-zinc-400 text-sm">
                Based on depth and evidence from your ChatGPT history
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'roadmap'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm shadow-amber-500/20'
                : 'bg-[#222222] text-zinc-400 hover:text-white border border-white/[0.06]'
            }`}
          >
            🗺 Transformation Roadmap
          </button>
          <button
            onClick={() => setActiveTab('patterns')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'patterns'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm shadow-amber-500/20'
                : 'bg-[#222222] text-zinc-400 hover:text-white border border-white/[0.06]'
            }`}
          >
            📊 Pattern Breakdown
          </button>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {activeTab === 'roadmap' && renderTransformationRoadmap()}
          {activeTab === 'patterns' && renderPatternsBreakdown()}
        </div>

        {/* Re-run Option */}
        <div className="text-center pt-8 border-t border-white/[0.06]">
          <p className="text-zinc-500 text-sm mb-4">
            Have more ChatGPT history now? You can re-run The Mirror for deeper insights.
          </p>
          <button
            onClick={handleRerunMirror}
            className="px-6 py-3 bg-[#222222] text-zinc-400 rounded-xl hover:text-white hover:bg-[#2a2a2a] transition-all flex items-center gap-2 mx-auto border border-white/[0.06]"
          >
            <RefreshCw size={18} />
            Re-run The Mirror
          </button>
        </div>
      </div>
    </div>
  );
}
