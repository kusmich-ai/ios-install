"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function getTier(score: number): string {
  if (score >= 81) return 'Integrated (Embodied)';
  if (score >= 61) return 'Optimized (Coherent)';
  if (score >= 41) return 'Operational (Stabilizing)';
  if (score >= 21) return 'Baseline (Installing)';
  return 'System Offline (Critical)';
}

export default function REwiredIndexReveal() {
  const router = useRouter();
  const params = useSearchParams();
  const score = parseInt(params.get('score') || '0');
  const tier = getTier(score);

  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setAnimatedScore(score);
        clearInterval(interval);
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [score]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full text-center">
        <p className="text-xs uppercase tracking-widest text-zinc-500 mb-4">
          Your starting point
        </p>

        <div
          className="text-8xl font-bold text-amber-500 mb-3 tabular-nums"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          {animatedScore}
        </div>

        <p className="text-lg text-[#F5F2EC] mb-12">
          REwired Index: <span className="text-amber-500">{tier}</span>
        </p>

        <div className="bg-[#141414] border border-white/[0.08] rounded-xl p-6 mb-10 text-left">
          <p className="text-zinc-300 text-sm leading-relaxed mb-4">
            This is where you are right now. Every week you'll rate yourself on the same four questions, and we'll show you exactly how this number shifts.
          </p>
          <p className="text-zinc-300 text-sm leading-relaxed">
            Most users see meaningful changes within 7-14 days of consistent practice.
          </p>
        </div>

        <button
          onClick={() => router.push('/chat')}
          className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-all"
        >
          Start your installation →
        </button>
      </div>
    </div>
  );
}
