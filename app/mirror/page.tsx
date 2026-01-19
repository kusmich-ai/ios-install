// ============================================
// app/mirror/page.tsx
// ENHANCED VERSION - With History Check & Guided Reflection Alternative
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { 
  MIRROR_GPT_PROMPT, 
  MIRROR_INTRO_TEXT, 
  MIRROR_INSTRUCTIONS,
  QUALITY_MESSAGES,
  GUIDED_REFLECTION_FLOW
} from '@/lib/mirrorPrompt';
import { IOS_STAGE_MAPPING } from '@/lib/mirrorMapping';
import GuidedReflectionFlow from '@/components/GuidedReflectionFlow';

export const dynamic = 'force-dynamic';

// ============================================
// TYPES
// ============================================

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
  ios_roadmap: any;
  transformation_roadmap: TransformationRoadmap;
}

// Updated step type to include history check
type MirrorStep = 'intro' | 'history-check' | 'alternatives' | 'prompt' | 'guided-reflection' | 'results';

// Path selection type
type MirrorPath = 'chatgpt_analysis' | 'guided_reflection' | null;

// ============================================
// MAIN COMPONENT
// ============================================

export default function MirrorPage() {
  const router = useRouter();
  const supabase = createClient();

  // Existing state
  const [step, setStep] = useState<MirrorStep>('intro');
  const [gptOutput, setGptOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mirrorData, setMirrorData] = useState<MirrorData | null>(null);
  const [copied, setCopied] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'patterns'>('roadmap');
  const [isRerun, setIsRerun] = useState(false);

  // New state for path selection
  const [selectedPath, setSelectedPath] = useState<MirrorPath>(null);

  // ============================================
  // EFFECTS
  // ============================================

  useEffect(() => {
    // Check if this is a rerun (from query param)
    const params = new URLSearchParams(window.location.search);
    const rerun = params.get('rerun') === 'true';
    setIsRerun(rerun);
    
    // If not a rerun, check for existing profile
    if (!rerun) {
      checkExistingProfile();
    }
  }, []);

  // ============================================
  // API HANDLERS
  // ============================================

  const checkExistingProfile = async () => {
    try {
      const response = await fetch('/api/mirror/process');
      const data = await response.json();
      
      if (data.exists && !data.skipped && data.data) {
        setMirrorData(data.data);
        setStep('results');
      } else if (data.exists && data.skipped) {
        router.push('/chat');
      }
    } catch (err) {
      console.error('Failed to check existing profile:', err);
    }
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(MIRROR_GPT_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const processAnalysis = async () => {
    if (!gptOutput.trim()) {
      setError('Please paste ChatGPT\'s response first.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      setProcessingStage('Parsing patterns...');
      await new Promise(r => setTimeout(r, 800));
      
      setProcessingStage('Mapping to IOS stages...');
      await new Promise(r => setTimeout(r, 800));
      
      setProcessingStage('Building your transformation roadmap...');
      
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

  const skipMirror = async () => {
    try {
      // Record the skip in the database
      await fetch('/api/mirror/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      console.error('Failed to record skip:', err);
    }
    router.push('/chat');
  };

  const continueToChat = () => {
    router.push('/chat');
  };

  // ============================================
  // NEW: HISTORY CHECK HANDLERS
  // ============================================

  const handleHistoryResponse = (hasHistory: boolean) => {
    if (hasHistory) {
      // User has ChatGPT history - proceed to prompt step
      setSelectedPath('chatgpt_analysis');
      setStep('prompt');
    } else {
      // User doesn't have history - show alternatives
      setStep('alternatives');
    }
  };

  const handleSelectGuidedReflection = () => {
    setSelectedPath('guided_reflection');
    setStep('guided-reflection');
  };

  const handleGuidedReflectionComplete = (profile: any) => {
    // Transform guided reflection profile to match MirrorData structure
    // The API returns a slightly different format, so we adapt it
    const adaptedData: MirrorData = {
      quality_score: profile.quality_score || 3,
      patterns: {
        nervous_system: { patterns: [] },
        awareness: { patterns: [] },
        identity: { patterns: [] },
        attention: { patterns: [] },
        relational: { patterns: [] },
        outlook: { patterns: [] },
        shadow: { patterns: [] }
      },
      core_pattern: profile.core_pattern,
      ios_roadmap: profile.roadmap,
      transformation_roadmap: {
        milestones: generateMilestonesFromProfile(profile),
        destination: {
          core_pattern_name: profile.core_pattern?.name || '',
          liberation_statement: generateLiberationStatement(profile)
        }
      }
    };

    // Distribute patterns into categories based on ios_stage
    if (profile.patterns) {
      profile.patterns.forEach((pattern: any, index: number) => {
        const adaptedPattern: Pattern = {
          id: `gr-${index}`,
          name: pattern.name,
          description: pattern.description,
          evidence: pattern.evidence,
          severity: pattern.severity,
          ios_stages: [pattern.ios_stage]
        };

        // Map to appropriate category based on stage
        switch (pattern.ios_stage) {
          case 1:
            adaptedData.patterns.nervous_system.patterns.push(adaptedPattern);
            break;
          case 2:
            adaptedData.patterns.awareness.patterns.push(adaptedPattern);
            break;
          case 3:
            adaptedData.patterns.identity.patterns.push(adaptedPattern);
            break;
          case 4:
            adaptedData.patterns.attention.patterns.push(adaptedPattern);
            break;
          case 5:
            adaptedData.patterns.relational.patterns.push(adaptedPattern);
            break;
          case 6:
            adaptedData.patterns.outlook.patterns.push(adaptedPattern);
            break;
          default:
            adaptedData.patterns.shadow.patterns.push(adaptedPattern);
        }
      });
    }

    setMirrorData(adaptedData);
    setStep('results');
  };

  // Helper function to generate milestones from guided reflection profile
  const generateMilestonesFromProfile = (profile: any): Milestone[] => {
    const milestones: Milestone[] = [];
    const stageNames = ['', 'Neural Priming', 'Embodied Awareness', 'Identity Mode', 'Flow Mode', 'Relational Coherence', 'Integration'];
    
    // Get unique stages from patterns
    const stages = new Set<number>();
    profile.patterns?.forEach((p: any) => stages.add(p.ios_stage));
    
    // Always include stage 1
    stages.add(1);
    
    // Sort stages
    const sortedStages = Array.from(stages).sort((a, b) => a - b);
    
    sortedStages.forEach((stage, index) => {
      const stagePatterns = profile.patterns?.filter((p: any) => p.ios_stage === stage) || [];
      const roadmapKey = `stage${stage}_focus` as keyof typeof profile.roadmap;
      
      milestones.push({
        number: index + 1,
        title: `Stage ${stage}: ${stageNames[stage]}`,
        timeframe: stage === 1 ? 'Weeks 1-2' : `Week ${(stage - 1) * 2 + 1}-${stage * 2}`,
        stage: stage,
        stage_name: stageNames[stage],
        patterns_addressed: stagePatterns.map((p: any) => p.name),
        whats_broken: profile.roadmap?.[roadmapKey] || `Patterns identified in Stage ${stage}`,
        what_changes: stagePatterns.map((p: any) => `Address: ${p.name}`),
        the_shift: `From unconscious pattern to conscious choice in ${stageNames[stage].toLowerCase()}`
      });
    });

    return milestones;
  };

  // Helper function to generate liberation statement
  const generateLiberationStatement = (profile: any): string => {
    if (profile.core_pattern) {
      return `When the "${profile.core_pattern.name}" pattern dissolves, you'll experience freedom from ${profile.core_pattern.description?.toLowerCase() || 'these limiting patterns'}. The practices ahead will systematically rewire these neural pathways.`;
    }
    return "Your transformation journey is mapped. Each stage builds on the last, creating lasting neural change.";
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

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

  // ============================================
  // RENDER: INTRO STEP
  // ============================================
  const renderIntro = () => (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🪞</div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {MIRROR_INTRO_TEXT.headline}
          </h1>
          <p className="text-xl text-[#ff9e19]">
            {MIRROR_INTRO_TEXT.tagline}
          </p>
        </div>

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

        <div className="text-center text-gray-500 mb-8">
          ⏱ {MIRROR_INTRO_TEXT.time}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setStep('history-check')}
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

        <p className="text-center text-gray-600 text-sm mt-8">
          🔒 {MIRROR_INTRO_TEXT.privacy}
        </p>
      </div>
    </div>
  );

  // ============================================
  // RENDER: HISTORY CHECK STEP (NEW)
  // ============================================
  const renderHistoryCheck = () => (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-3 h-3 rounded-full bg-[#ff9e19]" />
          <div className="w-12 h-0.5 bg-[#1a1a1a]" />
          <div className="w-3 h-3 rounded-full bg-[#1a1a1a]" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🪞</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Before We Begin
          </h2>
        </div>

        {/* History check card */}
        <div className="bg-[#111111] rounded-xl border border-[#ff9e19]/30 p-6 md:p-8 mb-6">
          <h3 className="text-[#ff9e19] font-semibold text-lg mb-3 flex items-center gap-2">
            <span>📊</span>
            {MIRROR_INTRO_TEXT.historyNotice.title}
          </h3>
          <p className="text-gray-400 mb-6 leading-relaxed">
            {MIRROR_INTRO_TEXT.historyNotice.description}
          </p>
          <p className="text-white font-medium mb-6">
            {MIRROR_INTRO_TEXT.historyNotice.question}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => handleHistoryResponse(true)}
              className="w-full p-4 bg-[#1a1a1a] rounded-lg text-left hover:bg-[#222] hover:border-[#ff9e19]/50 border border-transparent transition-all group"
            >
              <span className="text-white group-hover:text-[#ff9e19] transition-colors flex items-center gap-3">
                <span className="text-[#ff9e19]">✓</span>
                {MIRROR_INTRO_TEXT.historyNotice.options.yes}
              </span>
            </button>
            
            <button
              onClick={() => handleHistoryResponse(false)}
              className="w-full p-4 bg-[#1a1a1a] rounded-lg text-left hover:bg-[#222] border border-transparent transition-all"
            >
              <span className="text-gray-400 hover:text-white transition-colors flex items-center gap-3">
                <span className="text-gray-600">○</span>
                {MIRROR_INTRO_TEXT.historyNotice.options.no}
              </span>
            </button>

            <button
              onClick={() => handleHistoryResponse(false)}
              className="w-full p-4 bg-[#1a1a1a] rounded-lg text-left hover:bg-[#222] border border-transparent transition-all"
            >
              <span className="text-gray-400 hover:text-white transition-colors flex items-center gap-3">
                <span className="text-gray-600">?</span>
                {MIRROR_INTRO_TEXT.historyNotice.options.unsure}
              </span>
            </button>
          </div>
        </div>

        {/* Back button */}
        <div className="text-center">
          <button
            onClick={() => setStep('intro')}
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            ← Back to intro
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================
  // RENDER: ALTERNATIVES STEP (NEW)
  // ============================================
  const renderAlternatives = () => (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-3 h-3 rounded-full bg-[#ff9e19]" />
          <div className="w-12 h-0.5 bg-[#1a1a1a]" />
          <div className="w-3 h-3 rounded-full bg-[#1a1a1a]" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            No Problem
          </h2>
          <p className="text-gray-400">
            {MIRROR_INTRO_TEXT.alternatives.intro}
          </p>
        </div>
        
        {/* Two options */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Option A: Guided Reflection */}
          <div className="bg-[#111111] rounded-xl border border-[#ff9e19]/30 p-6 flex flex-col">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">💬</span>
                <h3 className="text-white font-semibold text-lg">
                  {MIRROR_INTRO_TEXT.alternatives.guidedReflection.title}
                </h3>
              </div>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                {MIRROR_INTRO_TEXT.alternatives.guidedReflection.description}
              </p>
              <p className="text-gray-500 text-xs mb-4">
                ⏱ {MIRROR_INTRO_TEXT.alternatives.guidedReflection.time}
              </p>
            </div>
            <button
              onClick={handleSelectGuidedReflection}
              className="w-full py-3 bg-[#ff9e19] text-black rounded-lg font-semibold hover:bg-[#ffb347] transition-colors"
            >
              {MIRROR_INTRO_TEXT.alternatives.guidedReflection.button}
            </button>
          </div>
          
          {/* Option B: Skip */}
          <div className="bg-[#111111] rounded-xl border border-[#1a1a1a] p-6 flex flex-col">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">⏭</span>
                <h3 className="text-white font-semibold text-lg">
                  {MIRROR_INTRO_TEXT.alternatives.skipForNow.title}
                </h3>
              </div>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                {MIRROR_INTRO_TEXT.alternatives.skipForNow.description}
              </p>
            </div>
            <button
              onClick={skipMirror}
              className="w-full py-3 bg-[#1a1a1a] text-gray-400 rounded-lg font-semibold hover:bg-[#222] hover:text-white transition-colors"
            >
              {MIRROR_INTRO_TEXT.alternatives.skipForNow.button}
            </button>
          </div>
        </div>
        
        {/* Back button */}
        <div className="text-center">
          <button
            onClick={() => setStep('history-check')}
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================
  // RENDER: GUIDED REFLECTION STEP (NEW)
  // ============================================
  const renderGuidedReflection = () => (
    <div className="min-h-screen bg-[#0a0a0a] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-3 h-3 rounded-full bg-[#ff9e19]" />
          <div className="w-12 h-0.5 bg-[#ff9e19]/50" />
          <div className="w-3 h-3 rounded-full bg-[#ff9e19]/50" />
        </div>

        <GuidedReflectionFlow
          onComplete={handleGuidedReflectionComplete}
          onSkip={skipMirror}
        />
      </div>
    </div>
  );

  // ============================================
  // RENDER: PROMPT STEP (ChatGPT Analysis)
  // ============================================
  const renderPrompt = () => (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-3 h-3 rounded-full bg-[#ff9e19]" />
          <div className="w-12 h-0.5 bg-[#1a1a1a]" />
          <div className="w-3 h-3 rounded-full bg-[#1a1a1a]" />
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Mirror Exercise
          </h2>
          <p className="text-gray-400">
            Copy the prompt below to ChatGPT, then paste its response back here.
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

        {/* Step 1: Prompt to Copy */}
        <div className="bg-[#111111] rounded-xl border border-[#1a1a1a] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white font-medium">Step 1: Copy this prompt to ChatGPT</span>
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
          <div className="bg-[#0a0a0a] rounded-lg p-4 max-h-48 overflow-y-auto">
            <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
              {MIRROR_GPT_PROMPT}
            </pre>
          </div>
        </div>

        {/* Step 2: Paste Response */}
        <div className="bg-[#111111] rounded-xl border border-[#1a1a1a] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white font-medium">Step 2: Paste ChatGPT's response</span>
            {gptOutput.length > 0 && gptOutput.length < 500 && (
              <span className="text-yellow-500 text-sm">
                Response seems short
              </span>
            )}
          </div>
          <textarea
            value={gptOutput}
            onChange={(e) => setGptOutput(e.target.value)}
            placeholder="Paste ChatGPT's full response here..."
            className="w-full h-48 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4 text-gray-300 text-sm font-mono resize-none focus:outline-none focus:border-[#ff9e19]/50"
            disabled={isProcessing}
          />
          {gptOutput.length > 0 && (
            <div className="text-right mt-2">
              <span className="text-gray-600 text-sm">
                {gptOutput.length.toLocaleString()} characters
              </span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="bg-[#111111] rounded-xl border border-[#1a1a1a] p-6 mb-6">
            <div className="flex items-center justify-center gap-4">
              <div className="animate-spin w-6 h-6 border-2 border-[#ff9e19] border-t-transparent rounded-full" />
              <span className="text-gray-300">{processingStage}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setStep('history-check')}
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
  // RENDER: TRANSFORMATION ROADMAP
  // ============================================
  const renderTransformationRoadmap = () => {
    if (!mirrorData?.transformation_roadmap) return null;

    const { milestones: unsortedMilestones, destination } = mirrorData.transformation_roadmap;
    const milestones = [...unsortedMilestones].sort((a, b) => a.number - b.number);

    return (
      <div className="space-y-6">
        {/* Core Pattern Banner */}
        {mirrorData.core_pattern && (
          <div className="bg-gradient-to-r from-[#ff9e19]/20 to-transparent rounded-xl border border-[#ff9e19]/30 p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🎯</span>
              <span className="text-[#ff9e19] font-bold text-sm uppercase tracking-wide">Core Pattern</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              "{mirrorData.core_pattern.name}"
            </h3>
            <p className="text-gray-400">
              {mirrorData.core_pattern.description || "The root. Everything else branches from this."}
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
    if (!mirrorData) return null;

    return (
      <div className="space-y-4">
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
    );
  };

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
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🪞</div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Your Pattern Profile
            </h1>
            <p className="text-gray-400">
              Here's what's been running under the surface — and how we'll transform it.
            </p>
          </div>

          {/* Quality indicator */}
          {qualityInfo && (
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
          )}

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

          {/* CTA */}
          <div className="text-center pt-8 border-t border-[#1a1a1a]">
            <p className="text-gray-400 mb-6">
              Your patterns are mapped. Your roadmap is clear. Time to start the installation.
            </p>
            <button
              onClick={continueToChat}
              className="px-8 py-4 bg-[#ff9e19] text-black font-semibold rounded-lg hover:bg-[#ffb347] transition-colors text-lg"
            >
              Begin Your Transformation →
            </button>
            <p className="text-gray-600 text-sm mt-4">
              You can revisit this anytime from your profile.
            </p>
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
      {step === 'history-check' && renderHistoryCheck()}
      {step === 'alternatives' && renderAlternatives()}
      {step === 'guided-reflection' && renderGuidedReflection()}
      {step === 'prompt' && renderPrompt()}
      {step === 'results' && renderResults()}
    </>
  );
}
