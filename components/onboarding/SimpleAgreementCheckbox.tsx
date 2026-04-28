"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

interface SimpleAgreementCheckboxProps {
  userId: string;
  onComplete?: () => void;
}

export default function SimpleAgreementCheckbox({ userId, onComplete }: SimpleAgreementCheckboxProps) {
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleContinue = async () => {
    if (!agreed || submitting) return;
    setSubmitting(true);

    const supabase = createClient();
    const now = new Date().toISOString();

    await supabase.from('user_profiles').update({
      terms_accepted_at: now,
      consent_accepted_at: now,
      has_accepted_terms: true,
      has_accepted_consent: true,
    }).eq('id', userId);

    if (onComplete) {
      onComplete();
    } else {
      router.push('/onboarding/baseline');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-12">
          <h1
            className="text-4xl text-[#F5F2EC] mb-4"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Welcome to UNbecoming
          </h1>
          <p className="text-zinc-400 text-sm">
            Before installation begins
          </p>
        </div>

        <div className="bg-[#141414] border border-white/[0.08] rounded-xl p-6 mb-8">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 accent-amber-500 cursor-pointer"
            />
            <span className="text-zinc-300 text-sm leading-relaxed">
              I agree to the{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500 hover:text-amber-400 underline"
              >
                Terms of Use
              </a>
              {' '}and{' '}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500 hover:text-amber-400 underline"
              >
                Privacy Policy
              </a>
              , confirm I&apos;m 18 or older, and understand that UNbecoming
              offers behavioral and contemplative practices — not medical
              care, therapy, or treatment for any condition.
            </span>
          </label>
        </div>

        <button
          onClick={handleContinue}
          disabled={!agreed || submitting}
          className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-semibold rounded-lg transition-all"
        >
          {submitting ? 'Continuing...' : 'Continue →'}
        </button>
      </div>
    </div>
  );
}
