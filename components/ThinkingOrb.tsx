// components/ThinkingOrb.tsx
// Miniature breathing orb for loading state — matches ResonanceModal visual language
// Replaces bouncing dots with a smooth, ambient pulse
'use client';

import { useEffect, useRef, useState } from 'react';

interface ThinkingOrbProps {
  size?: number; // px, default 32
  label?: string; // optional text next to orb
}

export default function ThinkingOrb({ size = 32, label }: ThinkingOrbProps) {
  const [scale, setScale] = useState(1);
  const animRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      // 3-second cycle: smooth sine wave between 0.85 and 1.15
      const t = (elapsed % 3000) / 3000;
      const s = 0.85 + 0.3 * (0.5 + 0.5 * Math.sin(t * Math.PI * 2));
      setScale(s);
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const orbSize = size;
  const glowSize = orbSize * 1.6;

  return (
    <div className="flex items-center gap-3">
      <div
        className="relative flex items-center justify-center"
        style={{ width: orbSize, height: orbSize }}
      >
        {/* Outer glow */}
        <div
          className="absolute rounded-full"
          style={{
            width: `${scale * glowSize}px`,
            height: `${scale * glowSize}px`,
            background: 'radial-gradient(circle, rgba(255,158,25,0.15) 0%, transparent 70%)',
            transform: `translate(-50%, -50%)`,
            top: '50%',
            left: '50%',
            willChange: 'width, height',
          }}
        />
        {/* Main ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: `${scale * orbSize}px`,
            height: `${scale * orbSize}px`,
            border: '1px solid rgba(255,158,25,0.5)',
            background: 'radial-gradient(circle, rgba(255,158,25,0.06) 0%, transparent 60%)',
            transform: `translate(-50%, -50%)`,
            top: '50%',
            left: '50%',
            willChange: 'width, height',
          }}
        />
        {/* Inner core */}
        <div
          className="absolute rounded-full"
          style={{
            width: `${scale * orbSize * 0.45}px`,
            height: `${scale * orbSize * 0.45}px`,
            background: 'radial-gradient(circle, rgba(255,158,25,0.2) 0%, rgba(255,158,25,0.05) 100%)',
            transform: `translate(-50%, -50%)`,
            top: '50%',
            left: '50%',
            willChange: 'width, height',
          }}
        />
      </div>
      {label && (
        <span className="text-gray-500 text-sm">{label}</span>
      )}
    </div>
  );
}
