// components/VideoSuggestionCard.tsx
// Renders clickable video suggestion cards when AI suggests a tutorial
'use client';

import { useState } from 'react';
import { Play, Clock, BookOpen } from 'lucide-react';

// Course module data for rendering
const COURSE_MODULES: Record<number, {
  title: string;
  tutorials: Array<{ number: number; title: string; duration: string }>;
}> = {
  1: {
    title: "Foundations of Neural Liberation",
    tutorials: [
      { number: 1, title: "The Architecture of Your Neural Operating System", duration: "12 min" },
      { number: 2, title: "Why Traditional Approaches Fall Short", duration: "10 min" },
      { number: 3, title: "The Science of State Change", duration: "14 min" },
      { number: 4, title: "Your Baseline: Understanding Where You Are", duration: "8 min" },
    ]
  },
  2: {
    title: "The Architecture of Suffering",
    tutorials: [
      { number: 1, title: "The Loop of Seeking and Resistance", duration: "15 min" },
      { number: 2, title: "Identity as Construct: The Stories We Tell", duration: "13 min" },
      { number: 3, title: "The Role of Psychedelics in Neural Liberation", duration: "18 min" },
      { number: 4, title: "From Survival to Thriving: Reprogramming the NOS", duration: "16 min" },
    ]
  },
  3: {
    title: "Practices That Rewire",
    tutorials: [
      { number: 1, title: "Resonance Breathing: The Foundation Practice", duration: "11 min" },
      { number: 2, title: "The Awareness Rep: Training Meta-Cognition", duration: "9 min" },
      { number: 3, title: "Somatic Flow & Embodied Awareness", duration: "14 min" },
      { number: 4, title: "Co-Regulation: The Relational Nervous System", duration: "12 min" },
    ]
  },
  4: {
    title: "Living as Liberation",
    tutorials: [
      { number: 1, title: "Integration: From Insight to Trait", duration: "13 min" },
      { number: 2, title: "The Nightly Debrief: Encoding Daily Wisdom", duration: "8 min" },
      { number: 3, title: "Maintaining Your Rewired State", duration: "11 min" },
      { number: 4, title: "Advanced Practices & The Path Forward", duration: "15 min" },
    ]
  }
};

interface VideoSuggestionCardProps {
  moduleNumber: number;
  tutorialNumber: number;
  reason: string;
  onWatch: (moduleNumber: number, tutorialNumber: number) => void;
}

export function VideoSuggestionCard({ 
  moduleNumber, 
  tutorialNumber, 
  reason,
  onWatch 
}: VideoSuggestionCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const module = COURSE_MODULES[moduleNumber];
  if (!module) return null;
  
  const tutorial = module.tutorials.find(t => t.number === tutorialNumber);
  if (!tutorial) return null;

  return (
    <div 
      className="my-3 rounded-lg border border-[#ff9e19]/30 bg-[#1a1a1a] overflow-hidden transition-all duration-200 hover:border-[#ff9e19]/60 hover:shadow-lg hover:shadow-[#ff9e19]/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="px-4 py-2 bg-[#ff9e19]/10 border-b border-[#ff9e19]/20">
        <div className="flex items-center gap-2 text-[#ff9e19] text-xs font-medium">
          <BookOpen className="w-3 h-3" />
          <span>Suggested Tutorial</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Module & Tutorial Info */}
        <div className="mb-2">
          <p className="text-xs text-gray-500 mb-1">
            Module {moduleNumber}: {module.title}
          </p>
          <h4 className="text-white font-medium text-sm leading-tight">
            {moduleNumber}.{tutorialNumber} — {tutorial.title}
          </h4>
        </div>
        
        {/* Duration */}
        <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
          <Clock className="w-3 h-3" />
          <span>{tutorial.duration}</span>
        </div>
        
        {/* Reason (why AI suggested it) */}
        <p className="text-gray-400 text-xs italic mb-4">
          "{reason}"
        </p>
        
        {/* Watch Button */}
        <button
          onClick={() => onWatch(moduleNumber, tutorialNumber)}
          className={`
            w-full flex items-center justify-center gap-2 
            px-4 py-2.5 rounded-lg
            font-medium text-sm
            transition-all duration-200
            ${isHovered 
              ? 'bg-[#ff9e19] text-black' 
              : 'bg-[#ff9e19]/20 text-[#ff9e19] hover:bg-[#ff9e19]/30'
            }
          `}
        >
          <Play className="w-4 h-4" />
          Watch Now
        </button>
      </div>
    </div>
  );
}

// ============================================
// PARSER FUNCTION
// ============================================
// Regex to detect video suggestions in AI responses
export const VIDEO_SUGGESTION_REGEX = /\[\[VIDEO_SUGGESTION:(\d+):(\d+):([^\]]+)\]\]/g;

export interface ParsedVideoSuggestion {
  fullMatch: string;
  moduleNumber: number;
  tutorialNumber: number;
  reason: string;
}

export function parseVideoSuggestions(text: string): ParsedVideoSuggestion[] {
  const suggestions: ParsedVideoSuggestion[] = [];
  let match;
  
  // Reset regex state
  VIDEO_SUGGESTION_REGEX.lastIndex = 0;
  
  while ((match = VIDEO_SUGGESTION_REGEX.exec(text)) !== null) {
    suggestions.push({
      fullMatch: match[0],
      moduleNumber: parseInt(match[1], 10),
      tutorialNumber: parseInt(match[2], 10),
      reason: match[3].trim()
    });
  }
  
  return suggestions;
}

// ============================================
// MESSAGE RENDERER WITH VIDEO CARDS
// ============================================
// Use this to render AI messages that may contain video suggestions

interface MessageWithVideosProps {
  content: string;
  onWatchVideo: (moduleNumber: number, tutorialNumber: number) => void;
}

export function renderMessageWithVideos({ content, onWatchVideo }: MessageWithVideosProps): React.ReactNode[] {
  const suggestions = parseVideoSuggestions(content);
  
  if (suggestions.length === 0) {
    // No suggestions, return content as-is
    return [content];
  }
  
  // Split content by video suggestions and render with cards
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  // Reset regex state
  VIDEO_SUGGESTION_REGEX.lastIndex = 0;
  let match;
  let partIndex = 0;
  
  while ((match = VIDEO_SUGGESTION_REGEX.exec(content)) !== null) {
    // Add text before this match
    if (match.index > lastIndex) {
      const textBefore = content.slice(lastIndex, match.index);
      if (textBefore.trim()) {
        parts.push(
          <span key={`text-${partIndex}`}>{textBefore}</span>
        );
        partIndex++;
      }
    }
    
    // Add video card
    const moduleNumber = parseInt(match[1], 10);
    const tutorialNumber = parseInt(match[2], 10);
    const reason = match[3].trim();
    
    parts.push(
      <VideoSuggestionCard
        key={`video-${moduleNumber}-${tutorialNumber}-${partIndex}`}
        moduleNumber={moduleNumber}
        tutorialNumber={tutorialNumber}
        reason={reason}
        onWatch={onWatchVideo}
      />
    );
    partIndex++;
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text after last match
  if (lastIndex < content.length) {
    const textAfter = content.slice(lastIndex);
    if (textAfter.trim()) {
      parts.push(
        <span key={`text-${partIndex}`}>{textAfter}</span>
      );
    }
  }
  
  return parts;
}

export default VideoSuggestionCard;
