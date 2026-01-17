'use client';

import { X } from 'lucide-react';

// ============================================
// TYPES & DATA (inline to avoid import issues)
// ============================================

export type StageId = 1 | 2 | 3 | 4 | 5 | 6;

export const stageAttribution = {
  1: {
    unlockTitle: "Stage 1 — Neural Priming",
    unlockBody:
      "The goal here isn't calm. It's access.\nSome days you'll feel regulated. Some days nothing will change.\nBoth mean the system is training.",
    ritualMicrocopy:
      "Training access, not chasing a feeling."
  },
  2: {
    unlockTitle: "Stage 2 — Embodied Awareness",
    unlockBody:
      "This isn't to feel better.\nIt's to teach awareness where to live when the body is moving.",
    ritualMicrocopy:
      "Training awareness in motion."
  },
  3: {
    unlockTitle: "Stage 3 — Identity Mode",
    unlockBody:
      "The action itself doesn't matter.\nThe brain updates identity from evidence, not intention.\nThis is evidence.",
    ritualMicrocopy:
      "Evidence installs identity."
  },
  4: {
    unlockTitle: "Stage 4 — Flow Mode",
    unlockBody:
      "Flow Blocks don't create flow.\nThey reveal your current attention limits.\nFragmentation means the system is working.",
    ritualMicrocopy:
      "The point is the edge."
  },
  5: {
    unlockTitle: "Stage 5 — Relational Coherence",
    unlockBody:
      "This isn't about kindness or forgiveness.\nIt trains regulation in the presence of threat cues.",
    ritualMicrocopy:
      "Training regulation in relationship."
  },
  6: {
    unlockTitle: "Stage 6 — Integration",
    unlockBody:
      "This isn't reflection.\nIt's memory consolidation.\nThe lesson matters less than the encoding.",
    ritualMicrocopy:
      "Encode the day. Don't analyze it."
  }
} as const;

// ============================================
// COMPONENT
// ============================================

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
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        
        {/* Unlock indicator */}
        <div className="text-[#ff9e19] text-sm font-medium mb-2">
          🔓 Unlocked
        </div>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-4">
          {attribution.unlockTitle}
        </h2>
        
        {/* Body - preserves line breaks */}
        <p className="text-gray-300 leading-relaxed mb-6 whitespace-pre-line">
          {attribution.unlockBody}
        </p>
        
        {/* Continue button */}
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
