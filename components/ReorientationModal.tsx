// components/ReorientationModal.tsx
// Step 4.3: Single reusable modal component
// Step 4.4: Hook for trigger display on app load

'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Compass } from 'lucide-react';
import {
  ReorientationType,
  ReorientationContent,
  fetchReorientationData,
  getDueReorientation,
  markReorientationSeen
} from '@/lib/reorientationTriggers';

// ============================================
// MODAL COMPONENT
// ============================================

interface ReorientationModalProps {
  isOpen: boolean;
  title: string;
  body: string;
  onDismiss: () => void;
}

export default function ReorientationModal({
  isOpen,
  title,
  body,
  onDismiss
}: ReorientationModalProps) {
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onDismiss();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onDismiss]);

  if (!isOpen) return null;

  // Split body into paragraphs
  const paragraphs = body.split('\n\n').filter(p => p.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onDismiss}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-lg bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-2xl border border-gray-800 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reorientation-title"
      >
        {/* Accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff9e19]/50 to-transparent" />
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ff9e19]/20 flex items-center justify-center">
              <Compass className="w-5 h-5 text-[#ff9e19]" />
            </div>
            <h2 id="reorientation-title" className="text-lg font-semibold text-white">
              {title}
            </h2>
          </div>
          <button
            onClick={onDismiss}
            className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {paragraphs.map((paragraph, i) => (
            <p 
              key={i} 
              className={`leading-relaxed ${
                i === 0 
                  ? 'text-[#ff9e19] font-medium italic text-sm' 
                  : 'text-gray-300'
              }`}
            >
              {paragraph}
            </p>
          ))}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800">
          <button
            onClick={onDismiss}
            className="w-full py-3 bg-[#ff9e19] hover:bg-orange-500 text-white font-medium rounded-xl transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// STEP 4.4: useReorientation HOOK
// ============================================

interface UseReorientationOptions {
  userId: string | null;
  enabled?: boolean;
}

interface UseReorientationReturn {
  isOpen: boolean;
  content: ReorientationContent | null;
  dismiss: () => Promise<void>;
  checkTriggers: () => Promise<void>;
}

export function useReorientation({
  userId,
  enabled = true
}: UseReorientationOptions): UseReorientationReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReorientationContent | null>(null);

  // Check for due reorientation
  const checkTriggers = useCallback(async () => {
    if (!userId || !enabled) return;

    const userData = await fetchReorientationData(userId);
    if (!userData) return;

    const due = getDueReorientation(userData);
    if (due) {
      setContent(due);
      setIsOpen(true);
    }
  }, [userId, enabled]);

  // Check on mount
  useEffect(() => {
    checkTriggers();
  }, [checkTriggers]);

  // Dismiss and mark as seen
  const dismiss = async () => {
    if (userId && content) {
      await markReorientationSeen(userId, content.type);
    }
    setIsOpen(false);
    setContent(null);
  };

  return {
    isOpen,
    content,
    dismiss,
    checkTriggers
  };
}

// ============================================
// CONVENIENCE WRAPPER COMPONENT
// ============================================

interface ReorientationProviderProps {
  userId: string | null;
  children?: React.ReactNode;
}

export function ReorientationProvider({ userId, children }: ReorientationProviderProps) {
  const { isOpen, content, dismiss } = useReorientation({ userId });

  return (
    <>
      {children}
      <ReorientationModal
        isOpen={isOpen}
        title={content?.title || ''}
        body={content?.body || ''}
        onDismiss={dismiss}
      />
    </>
  );
}
