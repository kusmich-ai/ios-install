'use client';

import { X } from 'lucide-react';
import { stageAttribution, StageId } from '@/lib/attributioncopy';

interface StageAttributionModalProps {
  stage: StageId;
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export default function StageAttributionModal({
  stage,
  isOpen,
  onClose,
  onContinue
}: StageAttributionModalProps) {
  if (!isOpen) return null;
  
  const attribution = stageAttribution[stage];
  if (!attribution) return null;
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-2xl max-w-md w-full p-6 relative border border-[#333]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
        
        <div className="text-[#ff9e19] text-sm font-medium mb-2">
          🔓 Unlocked
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">
          {attribution.unlockTitle}
        </h2>
        
        {/* Render body with line breaks preserved */}
        <p className="text-gray-300 leading-relaxed mb-6 whitespace-pre-line">
          {attribution.unlockBody}
        </p>
        
        <button
          onClick={onContinue}
          className="w-full bg-[#ff9e19] text-black font-semibold py-3 px-6 rounded-lg hover:bg-[#ffb347] transition-colors"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
