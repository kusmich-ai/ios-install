// components/CoachUpgradeModal.tsx
'use client';

import { X, Sparkles, MessageSquare, Brain, Zap, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CoachUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  coachId: 'nic' | 'fehren';
  coachName: string;
  accentColor: string;
}

export default function CoachUpgradeModal({ 
  isOpen, 
  onClose, 
  coachId,
  coachName,
  accentColor 
}: CoachUpgradeModalProps) {
  const router = useRouter();
  
  if (!isOpen) return null;

  const accentBg = coachId === 'nic' ? 'bg-[#ff9e19]' : 'bg-[#7c9eb2]';
  const accentHover = coachId === 'nic' ? 'hover:bg-orange-600' : 'hover:bg-[#6b8da1]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#0f0f0f] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header gradient */}
        <div 
          className="h-2"
          style={{ background: `linear-gradient(to right, ${accentColor}, ${accentColor}88)` }}
        />
        
        <div className="p-6">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <Sparkles className="w-8 h-8" style={{ color: accentColor }} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-white text-center mb-2">
            You've experienced a taste of {coachName}
          </h2>
          
          {/* Subtitle */}
          <p className="text-gray-400 text-center text-sm mb-6">
            Full AI coaching unlocks in Stage 2 when you upgrade to the IOS Installer.
          </p>

          {/* What you get */}
          <div className="bg-[#1a1a1a] rounded-xl p-4 mb-6">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">
              With full access you get
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" style={{ color: accentColor }} />
                <span className="text-sm text-gray-300">Unlimited conversations with {coachName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Brain className="w-4 h-4" style={{ color: accentColor }} />
                <span className="text-sm text-gray-300">Memory that learns about you over time</span>
              </div>
              <div className="flex items-center gap-3">
                {coachId === 'nic' ? (
                  <Zap className="w-4 h-4" style={{ color: accentColor }} />
                ) : (
                  <Heart className="w-4 h-4" style={{ color: accentColor }} />
                )}
                <span className="text-sm text-gray-300">
                  {coachId === 'nic' 
                    ? 'Pattern-breaking and nervous system coaching' 
                    : 'Emotional processing and somatic guidance'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4" style={{ color: accentColor }} />
                <span className="text-sm text-gray-300">Access to both Nic & Fehren</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => router.push('/pricing')}
            className={`w-full py-3 rounded-xl ${accentBg} ${accentHover} text-white font-medium transition-colors mb-3`}
          >
            Upgrade to Continue
          </button>

          {/* Secondary action */}
          <button
            onClick={() => router.push('/chat')}
            className="w-full py-2.5 text-gray-400 hover:text-white text-sm transition-colors"
          >
            Continue Stage 1 practices instead
          </button>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-600 mt-4">
            Complete Stage 1 to prove you're ready for deeper work
          </p>
        </div>
      </div>
    </div>
  );
}
