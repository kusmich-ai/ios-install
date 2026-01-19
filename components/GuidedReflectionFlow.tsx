// ============================================
// GUIDED REFLECTION FLOW COMPONENT
// ============================================
// File: components/GuidedReflectionFlow.tsx
//
// This component provides an alternative to The Mirror's
// ChatGPT analysis for users without deep conversation history.
// It asks 7 direct questions to surface the same patterns.
// ============================================

'use client';

import { useState } from 'react';
import { GUIDED_REFLECTION_FLOW } from '@/lib/mirrorPrompt';

// ============================================
// TYPES
// ============================================

interface QuestionResponse {
  category: string;
  question: string;
  answer: string;
  followUpQuestion?: string | null;
  followUpAnswer?: string | null;
}

interface PatternProfile {
  patterns: Array<{
    name: string;
    description: string;
    severity: number;
    ios_stage: number;
    evidence: string;
  }>;
  core_pattern: {
    name: string;
    description: string;
    connections: string[];
  };
  roadmap: {
    stage1_focus: string;
    stage3_focus: string;
    stage4_focus: string;
    stage5_focus: string;
  };
  quality_score: number;
}

interface GuidedReflectionFlowProps {
  onComplete: (profile: PatternProfile) => void;
  onSkip: () => void;
}

// ============================================
// COMPONENT
// ============================================

export default function GuidedReflectionFlow({ 
  onComplete, 
  onSkip 
}: GuidedReflectionFlowProps) {
  // State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);

  // Derived values
  const questions = GUIDED_REFLECTION_FLOW.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // ============================================
  // HANDLERS
  // ============================================

  const handleSubmitAnswer = () => {
    if (currentQuestion.followUp && !showFollowUp) {
      // Show follow-up question
      setShowFollowUp(true);
    } else {
      // Save response and move to next
      handleSaveAndNext();
    }
  };

  const handleSkipFollowUp = () => {
    handleSaveAndNext();
  };

  const handleSaveAndNext = async () => {
    // Save current response
    const newResponses = {
      ...responses,
      [currentQuestion.id]: {
        category: currentQuestion.category,
        question: currentQuestion.question,
        answer: currentAnswer,
        followUpQuestion: currentQuestion.followUp || null,
        followUpAnswer: showFollowUp ? followUpAnswer : null
      }
    };
    setResponses(newResponses);

    if (isLastQuestion) {
      // Process all responses
      await processResponses(newResponses);
    } else {
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentAnswer('');
      setFollowUpAnswer('');
      setShowFollowUp(false);
    }
  };

  const processResponses = async (allResponses: Record<string, QuestionResponse>) => {
    setIsProcessing(true);
    setProcessingError(null);

    try {
      const response = await fetch('/api/mirror/guided-reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses: allResponses })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process reflection');
      }

      const data = await response.json();
      
      if (data.success && data.profile) {
        onComplete(data.profile);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Processing error:', error);
      setProcessingError(
        error instanceof Error 
          ? error.message 
          : 'Something went wrong. Please try again.'
      );
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setProcessingError(null);
    processResponses(responses);
  };

  // ============================================
  // RENDER: INTRO SCREEN
  // ============================================

  if (showIntro) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="bg-[#111111] rounded-xl border border-[#1a1a1a] p-6 md:p-8">
          <h2 className="text-xl md:text-2xl text-white font-semibold mb-4">
            Guided Reflection
          </h2>
          <p className="text-gray-400 whitespace-pre-line leading-relaxed">
            {GUIDED_REFLECTION_FLOW.intro}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setShowIntro(false)}
            className="flex-1 py-4 bg-[#ff9e19] text-black rounded-lg font-semibold hover:bg-[#ffb347] transition-colors"
          >
            I'm Ready
          </button>
          <button
            onClick={onSkip}
            className="px-6 py-4 bg-[#1a1a1a] text-gray-400 rounded-lg hover:text-white hover:bg-[#222] transition-colors"
          >
            Skip for Now
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: PROCESSING STATE
  // ============================================

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center py-16 max-w-md mx-auto">
        <div className="w-16 h-16 border-4 border-[#ff9e19] border-t-transparent rounded-full animate-spin mb-6" />
        <h3 className="text-white text-xl font-semibold mb-2">
          {GUIDED_REFLECTION_FLOW.processing.title}
        </h3>
        <p className="text-gray-400 text-center">
          {GUIDED_REFLECTION_FLOW.processing.message}
        </p>
      </div>
    );
  }

  // ============================================
  // RENDER: ERROR STATE
  // ============================================

  if (processingError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 max-w-md mx-auto">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <span className="text-3xl">⚠️</span>
        </div>
        <h3 className="text-white text-xl font-semibold mb-2">
          Processing Error
        </h3>
        <p className="text-gray-400 text-center mb-6">
          {processingError}
        </p>
        <div className="flex gap-4">
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-[#ff9e19] text-black rounded-lg font-semibold hover:bg-[#ffb347] transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={onSkip}
            className="px-6 py-3 bg-[#1a1a1a] text-gray-400 rounded-lg hover:text-white transition-colors"
          >
            Skip for Now
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: QUESTION FLOW
  // ============================================

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="flex items-center gap-3">
        <span className="text-[#ff9e19] text-sm font-medium whitespace-nowrap">
          {currentQuestionIndex + 1} of {questions.length}
        </span>
        <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#ff9e19] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-[#111111] rounded-xl border border-[#1a1a1a] p-6 md:p-8">
        {/* Category Badge */}
        <span className="inline-block text-[#ff9e19] text-xs font-medium uppercase tracking-wider mb-3 px-2 py-1 bg-[#ff9e19]/10 rounded">
          {currentQuestion.category}
        </span>
        
        {/* Question Text */}
        <h3 className="text-white text-lg md:text-xl font-medium mb-6 leading-relaxed">
          {showFollowUp ? currentQuestion.followUp : currentQuestion.question}
        </h3>
        
        {/* Answer Input */}
        <textarea
          value={showFollowUp ? followUpAnswer : currentAnswer}
          onChange={(e) => showFollowUp 
            ? setFollowUpAnswer(e.target.value) 
            : setCurrentAnswer(e.target.value)
          }
          placeholder={showFollowUp 
            ? "Continue your response..." 
            : currentQuestion.placeholder
          }
          className="w-full h-36 md:h-40 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-[#ff9e19] transition-colors"
          autoFocus
        />
        
        {/* Hint Text */}
        {!showFollowUp && (
          <p className="text-gray-500 text-sm mt-3 italic">
            💡 {currentQuestion.note}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleSubmitAnswer}
          disabled={showFollowUp ? !followUpAnswer.trim() : !currentAnswer.trim()}
          className="flex-1 py-4 bg-[#ff9e19] text-black rounded-lg font-semibold hover:bg-[#ffb347] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLastQuestion && (showFollowUp || !currentQuestion.followUp) 
            ? 'Complete Reflection' 
            : 'Continue'
          }
        </button>
        
        {showFollowUp && (
          <button
            onClick={handleSkipFollowUp}
            className="px-6 py-4 bg-[#1a1a1a] text-gray-400 rounded-lg hover:text-white hover:bg-[#222] transition-colors"
          >
            Skip This
          </button>
        )}
      </div>

      {/* Back Button (if not on first question or in follow-up) */}
      {(currentQuestionIndex > 0 || showFollowUp) && (
        <button
          onClick={() => {
            if (showFollowUp) {
              setShowFollowUp(false);
            } else {
              setCurrentQuestionIndex(prev => prev - 1);
              const prevQuestion = questions[currentQuestionIndex - 1];
              const prevResponse = responses[prevQuestion.id];
              if (prevResponse) {
                setCurrentAnswer(prevResponse.answer);
                setFollowUpAnswer(prevResponse.followUpAnswer || '');
              }
            }
          }}
          className="w-full text-center text-gray-500 hover:text-gray-300 text-sm transition-colors"
        >
          ← Go Back
        </button>
      )}
    </div>
  );
}
