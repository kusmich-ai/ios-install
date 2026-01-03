// components/AwakenWithFiveCard.tsx
'use client';

import { useState } from 'react';
import { Sparkles, X, ExternalLink, ChevronRight } from 'lucide-react';

export default function AwakenWithFiveCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Sidebar Card */}
      <div 
        onClick={() => setIsModalOpen(true)}
        className="mt-6 p-4 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-gray-800 hover:border-[#ff9e19]/50 rounded-xl cursor-pointer transition-all duration-300 group"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-[#ff9e19]/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-[#ff9e19]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white group-hover:text-[#ff9e19] transition-colors">
              Awaken with 5
            </h4>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              The accelerated path to dissolving what you are not.
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[#ff9e19] transition-colors flex-shrink-0 mt-1" />
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <AwakenWithFiveModal onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}

function AwakenWithFiveModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg md:max-h-[85vh] bg-[#111111] border border-gray-800 rounded-2xl z-50 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ff9e19]/10 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#ff9e19]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Awaken with 5</h2>
              <p className="text-sm text-gray-500">A Modern Awakening Protocol</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Intro */}
          <div>
            <p className="text-gray-300 leading-relaxed">
              Not psychedelic therapy. Not a medicine. Not healing. 
              <span className="text-white font-medium"> A direct awakening to who you truly are.</span>
            </p>
            <p className="text-gray-400 text-sm mt-3 leading-relaxed">
              A private, 1-on-1, 5-MeO-DMT experience designed to dissolve the illusion of all you are not. It&apos;s not about becoming anything—it&apos;s about UNbecoming and remembering who you really are.
            </p>
          </div>

          {/* Differentiators */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <div className="w-1.5 h-1.5 bg-[#ff9e19] rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="text-sm text-white font-medium">Not psychedelic therapy</p>
                <p className="text-xs text-gray-500 mt-0.5">It dissolves the illusion that your pain or trauma ever defined you.</p>
