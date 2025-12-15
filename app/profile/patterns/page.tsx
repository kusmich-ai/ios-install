// ============================================
// app/profile/patterns/page.tsx
// Pattern Profile Page - Revisit Mirror Results Anytime
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { IOS_STAGE_MAPPING } from '@/lib/mirrorMapping';
import { ArrowLeft, RefreshCw } from 'lucide-react';

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
  transformation_roadmap: TransformationRoadmap;
  processed_at: string;
}

export default function PatternProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<PatternProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'patterns'>('roadmap');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchPatternProfile();
  }, []);

  const fetchPatternProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mirror/process');
      const data = await response.json();

      if (data.exists && !data.skipped && data.data) {
        setProfile(data.data);
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

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 5: return 'text-red-400';
      case 4: return 'text-orange-400';
      case 3: return 'text-yellow-400';
      case 2: return 'text-blue-400';
      default: return 'text-gray-400';
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

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex items-center gap-4">
          <div className="animate-spin w-6 h-6 border-2 border-[#ff9e19] border-t-transparent rounded-full" />
          <span className="text-gray-400">Loading your pattern profile...</span>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR/NOT FOUND STATES
  // ============================================
  if (error === 'not_found') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">🪞</div>
          <h1 className="text-2xl font-bold text-white mb-4">No Pattern Profile Yet</h1>
          <p className="text-gray-400 mb-8">
            You haven't completed The Mirror yet. Complete the pattern analysis to see your transformation roadmap.
          </p>
          <button
            onClick={() => router.push('/mirror')}
            className="px-6 py-3 bg-[#ff9e19] text-black font-semibold rounded-lg hover:bg-[#ffb347] transition-colors"
          >
            Start The Mirror
          </button>
        </div>
      </div>
    );
  }

  if (error === 'skipped') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">🪞</div>
          <h1 className="text-2xl font-bold text-white mb-4">Mirror Skipped</h1>
          <p className="text-gray-400 mb-8">
            You skipped The Mirror during onboarding. You can complete it now to unlock your personalized transformation roadmap.
          </p>
          <button
            onClick={() => router.push('/mirror')}
            className="px-6 py-3 bg-[#ff9e19] text-black font-semibold rounded-lg hover:bg-[#ffb347] transition-colors"
          >
            Complete The Mirror
          </button>
        </div>
      </div>
    );
  }

  if (error === 'error' || !profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">Something Went Wrong</h1>
          <p className="text-gray-400 mb-8">
            We couldn't load your pattern profile. Please try again.
          </p>
          <button
            onClick={fetchPatternProfile}
            className="px-6 py-3 bg-[#ff9e19] text-black font-semibold rounded-lg hover:bg-[#ffb347] transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: TRANSFORMATION ROADMAP
  // ============================================
  const renderTransformationRoadmap = () => {
    if (!profile?.transformation_roadmap) return null;

    const { milestones, destination } = profile.transformation_roadmap;

    return (
      <div className="space-y-6">
        {/* Core Pattern Banner */}
        {profile.core_pattern && (
          <div className="bg-gradient-to-r from-[#ff9e19]/20 to-transparent rounded-xl border border-[#ff9e19]/30 p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🎯</span>
              <span className="text-[#ff9e19] font-bold text-sm uppercase tracking-wide">Core Pattern</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              "{profile.core_pattern.name}"
            </h3>
            <p className="text-gray-400">
              The root. Everything else branches from this.
            </p>
          </div>
        )}

        {/* Milestones */}
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div 
              key={index}
              className="bg-[#111111] rounded-xl border border-[#1a1a1a] overflow-hidden"
            >
              {/* Milestone Header */}
              <div className="bg-[#1a1a1a] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#ff9e19] flex items-center justify-center text-black font-bold">
                    {milestone.number}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{milestone.title}</h3>
                    <p className="text-gray-500 text-sm">
                      {milestone.timeframe} • Stage {milestone.stage}: {milestone.stage_name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Milestone Content */}
              <div className="p-6 space-y-6">
                {/* What's Broken */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-red-400">✗</span>
                    <span className="text-red-400 font-medium text-sm uppercase tracking-wide">What's Broken</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    {milestone.whats_broken}
                  </p>
                </div>

                {/* What Changes */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-green-400">✓</span>
                    <span className="text-green-400 font-medium text-sm uppercase tracking-wide">What Changes</span>
                  </div>
                  <ul className="space-y-2">
                    {milestone.what_changes.map((change, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-[#ff9e19] mt-1">→</span>
                        <span className="text-gray-300">{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* The Shift */}
                <div className="bg-[#0a0a0a] rounded-lg p-4">
                  <div className="text-gray-500 text-xs uppercase tracking-wide mb-2">The Shift</div>
                  <p className="text-white font-medium italic">
                    {milestone.the_shift}
                  </p>
                </div>

                {/* Patterns Addressed */}
                {milestone.patterns_addressed.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {milestone.patterns_addressed.map((pattern, i) => (
                      <span 
                        key={i}
                        className="text-xs bg-[#ff9e19]/10 text-[#ff9e19] px-3 py-1 rounded-full"
                      >
                        {pattern}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Destination */}
        {destination && (
          <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] rounded-xl border border-[#1a1a1a] p-8 text-center">
            <div className="text-4xl mb-4">🏁</div>
            <h3 className="text-xl font-bold text-white mb-4">THE DESTINATION</h3>
            <p className="text-gray-300 leading-relaxed max-w-2xl mx-auto">
              {destination.liberation_statement}
            </p>
            <p className="text-[#ff9e19] font-medium mt-6">
              That's the installation.
            </p>
          </div>
        )}
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
              className="bg-[#111111] rounded-xl border border-[#1a1a1a] overflow-hidden"
            >
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : key)}
                className="w-full p-4 flex items-center justify-between hover:bg-[#1a1a1a]/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{info?.icon}</span>
                  <span className="text-white font-medium">{info?.label}</span>
                  <span className="text-gray-500 text-sm">
                    ({patterns.length} pattern{patterns.length !== 1 ? 's' : ''})
                  </span>
                </div>
                <span className="text-gray-500">
                  {isExpanded ? '▲' : '▼'}
                </span>
              </button>

              {isExpanded && (
                <div className="border-t border-[#1a1a1a] p-4 space-y-4">
                  {patterns.map((pattern: Pattern, i: number) => (
                    <div
                      key={pattern.id || i}
                      className="bg-[#0a0a0a] rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-medium">{pattern.name}</h4>
                        <span className={`text-sm ${getSeverityColor(pattern.severity)}`}>
                          {getSeverityLabel(pattern.severity)}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">
                        {pattern.description}
                      </p>
                      {pattern.evidence && (
                        <p className="text-gray-500 text-sm italic mb-3">
                          "{pattern.evidence}"
                        </p>
                      )}
                      {pattern.ios_stages && pattern.ios_stages.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {pattern.ios_stages.map(stage => (
                            <span
                              key={stage}
                              className="text-xs bg-[#ff9e19]/20 text-[#ff9e19] px-2 py-1 rounded"
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
    <div className="min-h-screen bg-[#0a0a0a] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          {profile.processed_at && (
            <span className="text-gray-600 text-sm">
              Analyzed {formatDate(profile.processed_at)}
            </span>
          )}
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🪞</div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Your Pattern Profile
          </h1>
          <p className="text-gray-400">
            Your transformation roadmap — revisit anytime.
          </p>
        </div>

        {/* Quality Score */}
        <div className="bg-[#111111] rounded-xl border border-[#1a1a1a] p-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className={`w-2 h-8 rounded-full ${
                    n <= profile.quality_score ? 'bg-[#ff9e19]' : 'bg-[#1a1a1a]'
                  }`}
                />
              ))}
            </div>
            <div>
              <p className="text-white font-medium">
                Analysis Quality: {profile.quality_score}/5
              </p>
              <p className="text-gray-400 text-sm">
                Based on depth and evidence from your ChatGPT history
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'roadmap'
                ? 'bg-[#ff9e19] text-black'
                : 'bg-[#111111] text-gray-400 hover:text-white'
            }`}
          >
            🗺 Transformation Roadmap
          </button>
          <button
            onClick={() => setActiveTab('patterns')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'patterns'
                ? 'bg-[#ff9e19] text-black'
                : 'bg-[#111111] text-gray-400 hover:text-white'
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
        <div className="text-center pt-8 border-t border-[#1a1a1a]">
          <p className="text-gray-500 text-sm mb-4">
            Have more ChatGPT history now? You can re-run The Mirror for deeper insights.
          </p>
          <button
            onClick={() => router.push('/mirror')}
            className="px-6 py-3 bg-[#111111] text-gray-400 rounded-lg hover:text-white transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={18} />
            Re-run The Mirror
          </button>
        </div>
      </div>
    </div>
  );
}
