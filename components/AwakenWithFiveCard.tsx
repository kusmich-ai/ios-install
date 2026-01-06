// components/AwakenWithFiveCard.tsx
'use client';

import { useState } from 'react';
import { Sparkles, X, ExternalLink, ChevronRight } from 'lucide-react';

export default function AwakenWithFiveCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Sidebar Card - Cream/Luxury Styling */}
      <div 
        onClick={() => setIsModalOpen(true)}
        className="mt-6 p-4 bg-white border border-amber-200/60 hover:border-amber-400/60 rounded-xl cursor-pointer transition-all duration-300 group shadow-sm hover:shadow-md"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-zinc-800 group-hover:text-amber-700 transition-colors">
              Awaken with 5
            </h4>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              The accelerated path to dissolving what you are not.
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-600 transition-colors flex-shrink-0 mt-1" />
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Modal - Keeping dark for contrast/focus */}
      <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg md:max-h-[85vh] bg-[#141414] border border-white/10 rounded-2xl z-50 overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-white/[0.06] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Awaken with 5</h2>
              <p className="text-sm text-zinc-500">A Modern Awakening Protocol</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Intro */}
          <div>
            <p className="text-zinc-300 leading-relaxed">
              Not psychedelic therapy. Not a medicine. Not healing. 
              <span className="text-white font-medium"> A direct awakening to who you truly are.</span>
            </p>
            <p className="text-zinc-500 text-sm mt-3 leading-relaxed">
              A private, 1-on-1, 5-MeO-DMT experience designed to dissolve the illusion of all you are not.
            </p>
          </div>

          {/* Differentiators */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white/[0.03] border border-white/[0.04] rounded-lg">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="text-sm text-white font-medium">Not psychedelic therapy</p>
                <p className="text-xs text-zinc-500 mt-0.5">Dissolves the illusion that your pain ever defined you.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/[0.03] border border-white/[0.04] rounded-lg">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="text-sm text-white font-medium">Not a group experience</p>
                <p className="text-xs text-zinc-500 mt-0.5">Private, precise, and all-encompassing.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white/[0.03] border border-white/[0.04] rounded-lg">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p className="text-sm text-white font-medium">A structured awakening protocol</p>
                <p className="text-xs text-zinc-500 mt-0.5">Remembering what remains when all improvement ceases.</p>
              </div>
            </div>
          </div>

          {/* The Journey */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">The Journey</h3>
            <p className="text-xs text-zinc-500 mb-3">A 3-phase experience over 2 months</p>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center text-xs text-amber-500 font-medium">1</div>
                <div>
                  <p className="text-sm text-white">Preparation</p>
                  <p className="text-xs text-zinc-500">1 month of readiness</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center text-xs text-amber-500 font-medium">2</div>
                <div>
                  <p className="text-sm text-white">The Experience</p>
                  <p className="text-xs text-zinc-500">1 day in Kelowna, BC</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center text-xs text-amber-500 font-medium">3</div>
                <div>
                  <p className="text-sm text-white">Embodiment</p>
                  <p className="text-xs text-zinc-500">1+ month integration</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quote */}
          <div className="border-l-2 border-amber-500/50 pl-4 py-1">
            <p className="text-sm text-zinc-300 italic">
              It removes everything in the way of what is already here.
            </p>
          </div>

        </div>

        {/* Footer CTAs */}
        <div className="p-6 border-t border-white/[0.06] space-y-3">
          <a
            href="https://nicholaskusmich.typeform.com/awaken"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl transition-all shadow-sm shadow-amber-500/20"
          >
            Apply for Consideration
          </a>
          <a
            href="https://awakenwith5.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-zinc-300 text-sm rounded-xl transition-colors border border-white/[0.06]"
          >
            Learn More on Full Site
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </>
  );
}
