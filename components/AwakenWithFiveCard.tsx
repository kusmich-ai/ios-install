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
              <p className="text-sm text-gray-500">A Modern Awakening Protocol
