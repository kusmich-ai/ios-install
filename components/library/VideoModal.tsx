// components/library/VideoModal.tsx
// Slide-up video modal for AI-suggested tutorials

'use client';

import { useState } from 'react';
import { X, ExternalLink, CheckCircle, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import VideoPlayer from './VideoPlayer';
import { useCourse } from '@/lib/course';
import type { CourseTutorial } from '@/lib/course/types';

interface VideoModalProps {
  tutorial: CourseTutorial;
  onClose: () => void;
}

export default function VideoModal({ tutorial, onClose }: VideoModalProps) {
  const [showTakeaways, setShowTakeaways] = useState(false);
  const { markComplete, isCompleted } = useCourse();
  
  const completed = isCompleted(tutorial.id);

  const handleMarkComplete = async () => {
    await markComplete(tutorial.id, 'modal');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 z-50"
        onClick={handleBackdropClick}
      />
      
      {/* Modal - Slides up from bottom on mobile, centered on desktop */}
      <div 
        className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-50 pointer-events-none"
      >
        <div 
          className="pointer-events-auto bg-[#111111] rounded-t-2xl md:rounded-2xl w-full md:max-w-3xl md:mx-4 max-h-[90vh] overflow-hidden animate-slide-up md:animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">
                Module {tutorial.module_number} • Tutorial {tutorial.tutorial_number}
              </p>
              <h3 className="text-white font-semibold truncate">{tutorial.title}</h3>
            </div>
            <button 
              onClick={onClose}
              className="ml-4 p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Video Player */}
          <div className="aspect-video bg-black">
            <VideoPlayer 
              vimeoId={tutorial.vimeo_video_id}
              tutorialId={tutorial.id}
              source="modal"
              autoplay={true}
              onComplete={handleMarkComplete}
            />
          </div>
          
          {/* Info & Actions */}
          <div className="p-4 space-y-3">
            {/* Duration */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{tutorial.duration_minutes} minutes</span>
              {completed && (
                <span className="flex items-center gap-1 text-green-400 ml-auto">
                  <CheckCircle className="w-4 h-4" />
                  Completed
                </span>
              )}
            </div>
            
            {/* Key Takeaways Accordion */}
            {tutorial.key_takeaways && tutorial.key_takeaways.length > 0 && (
              <>
                <button
                  onClick={() => setShowTakeaways(!showTakeaways)}
                  className="w-full flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg text-left hover:bg-[#0f0f0f] transition-colors"
                >
                  <span className="text-white text-sm font-medium">Key Takeaways</span>
                  {showTakeaways ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                
                {showTakeaways && (
                  <div className="p-3 bg-[#0a0a0a] rounded-lg space-y-2 max-h-40 overflow-y-auto">
                    {tutorial.key_takeaways.map((takeaway, i) => (
                      <p key={i} className="text-gray-400 text-sm flex gap-2">
                        <span className="text-[#ff9e19] flex-shrink-0">•</span>
                        <span>{takeaway}</span>
                      </p>
                    ))}
                  </div>
                )}
              </>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              {!completed ? (
                <button
                  onClick={handleMarkComplete}
                  className="flex-1 py-3 px-4 bg-[#ff9e19] text-black font-semibold rounded-lg hover:bg-[#ffb347] transition-colors"
                >
                  Mark as Complete
                </button>
              ) : (
                <div className="flex-1 py-3 px-4 bg-green-500/20 text-green-400 font-semibold rounded-lg flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Completed
                </div>
              )}
              
              <Link
                href={`/library?tutorial=${tutorial.id}`}
                onClick={onClose}
                className="py-3 px-4 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Open in Library</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Animation styles */}
      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </>
  );
}
