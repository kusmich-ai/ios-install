// ============================================
// app/mirror/page.tsx
// The Mirror - Full-screen immersive pattern analysis
// Shows after baseline results, before chat
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { 
  MIRROR_GPT_PROMPT, 
  MIRROR_INTRO_TEXT, 
  MIRROR_INSTRUCTIONS,
  QUALITY_MESSAGES 
} from '@/lib/mirrorPrompt';
import { IOS_STAGE_MAPPING } from '@/lib/mirrorMapping';

// Force dynamic rendering
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

interface IOSRoadmap {
  priority_stages: number[];
  stage_mapping: Record<string, {
    addresses: string[];
    pattern_ids: string[];
    primary_patterns: string[];
  }>;
  recommended_tools: {
    tool: string;
    reason: string;
    unlocks_at: string;
  }[];
}

interface MirrorData {
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
  ios_roadmap: IOSRoadmap;
}

// Step type
type MirrorStep = 'intro' | 'prompt' | 'analyze' | 'results';

export default function MirrorPage() {
  const router = useRouter();
  const supabase = createClient();

  // State
  const [step, setStep] = useState<MirrorStep>('intro');
  const [gptOutput, setGptOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mirrorData, setMirrorData] = useState<MirrorData | null>(null);
  const [copied, setCopied] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Check if user already has a pattern profile
  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    try {
      const response = await fetch('/api/mirror/process');
      const data = await response.json();
      
      if (data.exists && !data.skipped && data.data) {
        // User already has a profile, show results
        setMirrorData(data.data);
        setStep('results');
      } else if (data.exists && data.skipped) {
        // User skipped before, redirect to chat
        router.push('/chat');
      }
    } catch (err) {
      console.error('Failed to check existing profile:', err);
    }
  };

  // Copy prompt to clipboard
  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(MIRROR_GPT_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Process the GPT output
  const processAnalysis = async () => {
    if (!gptOutput.trim()) {
      setError('Please paste ChatGPT\'s response first.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      setProcessingStage('Parsing patterns...');
      await new Promise(r => setTimeout(r, 500));
      
      setProcessingStage('Mapping to IOS stages...');
      await new Promise(r => setTimeout(r, 500));
      
      setProcessingStage('Building your roadmap...');
      
      const response = await fetch('/api/mirror/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gptOutput })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Processing failed');
      }

      setMirrorData(result.data);
      setStep('results');
      
    } catch (err) {
      console.error('Processing error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  // Skip The Mirror
  const skipMirror = async () => {
    try {
      await fetch('/api/mirror/process', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'skip' })
      });
      router.push('/chat');
    } catch (err) {
      console.error('Failed to skip:', err);
      router.push('/chat');
    }
  };

  // Continue to chat
  const continueToChat = () => {
    router.push('/chat');
  };

  // Get severity color
  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 5: return 'text-red-400';
      case 4: return 'text-orange-400';
      case 3: return 'text-yellow-400';
      case 2: return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  // Get severity label
  const getSeverityLabel = (severity: number) => {
    switch (severity) {
      case 5: return 'Critical';
      case 4: return 'High';
      case 3: return 'Moderate';
      case 2: return 'Low';
      default: return 'Minor';
    }
  };

  // Category labels
  const categoryLabels: Record<string, { label: string; icon: string }> = {
    nervous_system: { label: 'Nervous System', icon: '⚡' },
    awareness: { label: 'Awareness Blind Spots', icon: '👁' },
    identity: { label: 'Identity Loops', icon: '🎭' },
    attention: { label: 'Attention Leaks', icon: '🎯' },
    relational: { label: 'Relational Patterns', icon: '💞' },
    outlook: { label: 'Emotional Outlook', icon: '🌤' },
    shadow: { label: 'Shadow Material', icon: '🌑' }
  };

  // ============================================
  // RENDER: INTRO STEP
  // ============================================
  const renderIntro = () => (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🪞</div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {MIRROR_INTRO_TEXT.headline}
          </h1>
          <p className="text-xl text-[#ff9e19]">
            {MIRROR_INTRO_TEXT.tagline}
          </p>
        </div>

        {/* Description */}
        <div className="bg-[#111111] rounded-xl border border-[#1a1a1a] p-6 mb-8">
          <p className="text-gray-300 mb-6">
            {MIRROR_INTRO_TEXT.description}
          </p>

          <div className="space-y-3 mb-6">
            {MIRROR_INTRO_TEXT.whatItDoes.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-[#ff9e19]">✓</span>
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>

          <div className="bg-[#1a1a1a] rounded-lg p-4">
            <p className="text-gray-400 text-sm">
              <strong className="text-gray-300">Note:</strong> {MIRROR_INTRO_TEXT.requirements}
            </p>
          </div>
        </div>

        {/* Time estimate */}
        <div className="text-center text-gray-500 mb-8">
          ⏱ {MIRROR_INTRO_TEXT.time}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setStep('prompt')}
            className="px-8 py-4 bg-[#ff9e19] text-black font-semibold rounded-lg hover:bg-[#ffb347] transition-colors"
          >
            Begin The Mirror
          </button>
          <button
            onClick={skipMirror}
            className="px-8 py-4 bg-transparent text-gray-500 font-medium rounded-lg hover:text-gray-300 transition-colors"
          >
            Skip for now
          </button>
        </div>

        {/* Privacy note */}
        <p className="text-center text-gray-600 text-sm mt-8">
          🔒 {MIRROR_INTRO_TEXT.privacy}
        </p>
      </div>
    </div>
  );

  // ============================================
  // RENDER: PROMPT STEP
  // ============================================
  const renderPrompt = () => (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-3 h-3 rounded-full bg-[#ff9e19]" />
          <div className="w-12 h-0.5 bg-[#1a1a1a]" />
          <div className="w-3 h-3 rounded-full bg-[#1a1a1a]" />
          <div className="w-12 h-0.5 bg-[#1a1a1a]" />
          <div className="w-3 h-3 rounded-full bg-[#1a1a1a]" />
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Step 1: Get Your Analysis
          </h2>
          <p className="text-gray-400">
            Copy this prompt to ChatGPT, then paste the response back here.
          </p>
        </div>

        {/* Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {Object.entries(MIRROR_INSTRUCTIONS).map(([key, instruction], i) => (
            <div key={key} className="bg-[#111111] rounded-lg p-4 text-center">
              <div className="text-2xl text-[#ff9e19] mb-2">{i + 1}</div>
              <p className="text-gray-400 text-sm">{instruction.description}</p>
            </div>
          ))}
        </div>

        {/* Prompt box */}
        <div className="bg-[#111111] rounded-xl border border-[#1a1a1a] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm">Analysis Prompt</span>
            <button
              onClick={copyPrompt}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                copied 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-[#ff9e19]/20 text-[#ff9e19] hover:bg-[#ff9e19]/30'
              }`}
            >
              {copied ? '✓ Copied!' : 'Copy Prompt'}
            </button>
          </div>
          <div className="bg-[#0a0a0a] rounded-lg p-4 max-h-64 overflow-y-auto">
            <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
              {MIRROR_GPT_PROMPT}
            </pre>
          </div>
        </div>

        {/* Next button */}
        <div className="flex justify-center">
          <button
            onClick={() => setStep('analyze')}
            className="px-8 py-4 bg-[#ff9e19] text-black font-semibold rounded-lg hover:bg-[#ffb347] transition-colors"
          >
            I've Copied the Prompt →
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================
  // RENDER: ANALYZE STEP
  // ============================================
  const renderAnalyze = () => (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-3 h-3 rounded-full bg-[#ff9e19]" />
          <div className="w-12 h-0.5 bg-[#ff9e19]" />
          <div className="w-3 h-3 rounded-full bg-[#ff9e19]" />
          <div className="w-12 h-0.5 bg-[#1a1a1a]" />
          <div className="w-3 h-3 rounded-full bg-[#1a1a1a]" />
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Step 2: Paste ChatGPT's Response
          </h2>
          <p className="text-gray-400">
            Copy the entire response from ChatGPT and paste it below.
          </p>
        </div>

        {/* Paste area */}
        <div className="bg-[#111111] rounded-xl border border-[#1a1a1a] p-6 mb-6">
          <textarea
            value={gptOutput}
            onChange={(e) => setGptOutput(e.target.value)}
            placeholder="Paste ChatGPT's full response here..."
            className="w-full h-64 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4 text-gray-300 text-sm font-mono resize-none focus:outline-none focus:border-[#ff9e19]/50"
            disabled={isProcessing}
          />
          
          {/* Character count */}
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600 text-sm">
              {gptOutput.length > 0 && `${gptOutput.length.toLocaleString()} characters`}
            </span>
            {gptOutput.length > 0 && gptOutput.length < 500 && (
              <span className="text-yellow-500 text-sm">
                Response seems short - make sure you copied everything
              </span>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Processing state */}
        {isProcessing && (
          <div className="bg-[#111111] rounded-xl border border-[#1a1a1a] p-6 mb-6">
            <div className="flex items-center justify-center gap-4">
              <div className="animate-spin w-6 h-6 border-2 border-[#ff9e19] border-t-transparent rounded-full" />
              <span className="text-gray-300">{processingStage}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setStep('prompt')}
            disabled={isProcessing}
            className="px-6 py-3 bg-transparent text-gray-500 font-medium rounded-lg hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            ← Back
          </button>
          <button
            onClick={processAnalysis}
            disabled={isProcessing || !gptOutput.trim()}
            className="px-8 py-4 bg-[#ff9e19] text-black font-semibold rounded-lg hover:bg-[#ffb347] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Analyze My Patterns'}
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================
  // RENDER: RESULTS STEP
  // ============================================
  const renderResults = () => {
    if (!mirrorData) return null;

    const qualityInfo = QUALITY_MESSAGES[mirrorData.quality_score as keyof typeof QUALITY_MESSAGES];

    return (
      <div className="min-h-screen bg-[#0a0a0a] py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-3 h-3 rounded-full bg-[#ff9e19]" />
            <div className="w-12 h-0.5 bg-[#ff9e19]" />
            <div className="w-3 h-3 rounded-full bg-[#ff9e19]" />
            <div className="w-12 h-0.5 bg-[#ff9e19]" />
            <div className="w-3 h-3 rounded-full bg-[#ff9e19]" />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🪞</div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Your Pattern Profile
            </h1>
            <p className="text-gray-400">
              Here's what's been running under the surface.
            </p>
          </div>

          {/* Quality indicator */}
          <div className="bg-[#111111] rounded-xl border border-[#1a1a1a] p-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className={`w-2 h-8 rounded-full ${
                      n <= mirrorData.quality_score ? 'bg-[#ff9e19]' : 'bg-[#1a1a1a]'
                    }`}
                  />
                ))}
              </div>
              <div>
                <p className="text-white font-medium">{qualityInfo.title}</p>
                <p className="text-gray-400 text-sm">{qualityInfo.message}</p>
              </div>
            </div>
          </div>

          {/* Core Pattern - The Big Reveal */}
          {mirrorData.core_pattern && (
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111111] rounded-xl border border-[#ff9e19]/30 p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎯</span>
                <h2 className="text-xl font-bold text-[#ff9e19]">THE CORE PATTERN</h2>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {mirrorData.core_pattern.name}
              </h3>
              <p className="text-gray-300 mb-4">
                {mirrorData.core_pattern.description}
              </p>
              {mirrorData.core_pattern.evidence && (
                <div className="bg-[#0a0a0a] rounded-lg p-4">
                  <p className="text-gray-500 text-sm mb-1">Evidence:</p>
                  <p className="text-gray-400 text-sm italic">
                    "{mirrorData.core_pattern.evidence}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Pattern Categories */}
          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Pattern Breakdown</h2>
            
            {Object.entries(mirrorData.patterns).map(([key, category]) => {
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

          {/* IOS Roadmap */}
          {mirrorData.ios_roadmap && (
            <div className="bg-[#111111] rounded-xl border border-[#1a1a1a] p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Your IOS Roadmap</h2>
              <p className="text-gray-400 mb-6">
                Based on your patterns, here's how the IOS stages will address them:
              </p>

              <div className="space-y-4">
                {mirrorData.ios_roadmap.priority_stages.map((stage, i) => {
                  const stageInfo = IOS_STAGE_MAPPING[stage as keyof typeof IOS_STAGE_MAPPING];
                  const stageMapping = mirrorData.ios_roadmap.stage_mapping[stage.toString()];
                  
                  return (
                    <div
                      key={stage}
                      className={`p-4 rounded-lg ${
                        i === 0 ? 'bg-[#ff9e19]/10 border border-[#ff9e19]/30' : 'bg-[#0a0a0a]'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {i === 0 && <span className="text-[#ff9e19] text-sm">Priority →</span>}
                        <h3 className="text-white font-medium">
                          Stage {stage}: {stageInfo?.name}
                        </h3>
                      </div>
                      <p className="text-gray-500 text-sm mb-2">
                        {stageInfo?.tagline}
                      </p>
                      {stageMapping?.primary_patterns && (
                        <p className="text-gray-400 text-sm">
                          <span className="text-gray-500">Addresses:</span>{' '}
                          {stageMapping.primary_patterns.join(', ')}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Recommended tools */}
              {mirrorData.ios_roadmap.recommended_tools.length > 0 && (
                <div className="mt-6 pt-6 border-t border-[#1a1a1a]">
                  <h3 className="text-gray-300 font-medium mb-3">Recommended Tools</h3>
                  <div className="flex flex-wrap gap-2">
                    {mirrorData.ios_roadmap.recommended_tools.map((tool, i) => (
                      <div
                        key={i}
                        className="bg-[#0a0a0a] rounded-lg px-3 py-2"
                      >
                        <span className="text-white text-sm">{tool.tool}</span>
                        <span className="text-gray-500 text-xs ml-2">
                          (unlocks {tool.unlocks_at})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CTA */}
          <div className="text-center">
            <p className="text-gray-400 mb-6">
              Your patterns are mapped. Your roadmap is clear. Time to start the installation.
            </p>
            <button
              onClick={continueToChat}
              className="px-8 py-4 bg-[#ff9e19] text-black font-semibold rounded-lg hover:bg-[#ffb347] transition-colors text-lg"
            >
              Enter The System →
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <>
      {step === 'intro' && renderIntro()}
      {step === 'prompt' && renderPrompt()}
      {step === 'analyze' && renderAnalyze()}
      {step === 'results' && renderResults()}
    </>
  );
}
