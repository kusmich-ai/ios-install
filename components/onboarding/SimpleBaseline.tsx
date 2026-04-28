"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

interface SimpleBaselineProps {
  userId: string;
}

interface Scores {
  regulation: number | null;
  awareness: number | null;
  outlook: number | null;
  attention: number | null;
}

const QUESTIONS = [
  {
    domain: 'regulation' as const,
    label: 'Regulation',
    text: 'How easily can you calm yourself when stressed?',
    lowLabel: 'Not at all',
    highLabel: 'Very easily',
  },
  {
    domain: 'awareness' as const,
    label: 'Awareness',
    text: 'How quickly do you notice when lost in thought?',
    lowLabel: 'Rarely notice',
    highLabel: 'Immediately',
  },
  {
    domain: 'outlook' as const,
    label: 'Outlook',
    text: 'How open and positive do you feel toward life?',
    lowLabel: 'Closed/negative',
    highLabel: 'Open/positive',
  },
  {
    domain: 'attention' as const,
    label: 'Attention',
    text: 'How focused are you on what truly matters?',
    lowLabel: 'Scattered',
    highLabel: 'Laser-focused',
  },
];

function getTier(score: number): string {
  if (score >= 81) return 'Integrated (Embodied)';
  if (score >= 61) return 'Optimized (Coherent)';
  if (score >= 41) return 'Operational (Stabilizing)';
  if (score >= 21) return 'Baseline (Installing)';
  return 'System Offline (Critical)';
}

export default function SimpleBaseline({ userId }: SimpleBaselineProps) {
  const [scores, setScores] = useState<Scores>({
    regulation: null,
    awareness: null,
    outlook: null,
    attention: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const allAnswered = Object.values(scores).every(v => v !== null);

  const handleSubmit = async () => {
    if (!allAnswered || submitting) return;
    setSubmitting(true);

    const supabase = createClient();
    const r = scores.regulation!;
    const a = scores.awareness!;
    const o = scores.outlook!;
    const att = scores.attention!;
    const rewiredIndex = Math.round(((r + a + o + att) / 4) * 20);
    const tier = getTier(rewiredIndex);
    const domainScores = { regulation: r, awareness: a, outlook: o, attention: att };

    const now = new Date().toISOString();

    await supabase.from('user_profiles').update({
      baseline_started_at: now,
      baseline_completed_at: now,
      has_completed_baseline: true,
    }).eq('id', userId);

    await supabase.from('baseline_assessments').insert({
      user_id: userId,
      regulation_score: r,
      awareness_score: a,
      outlook_score: o,
      attention_score: att,
      rewired_index: rewiredIndex,
      assessment_type: 'simple_self_rating',
      created_at: now,
    });

    // Backwards-compat writes so existing consumers (chat page, useUserProgress,
    // admin dashboards) continue to work. Old IOSBaselineAssessment populated
    // these — we mirror the same contract.
    const userDataEntries = [
      { user_id: userId, key: 'ios:baseline:rewired_index', value: JSON.stringify(rewiredIndex) },
      { user_id: userId, key: 'ios:baseline:tier', value: JSON.stringify(tier) },
      { user_id: userId, key: 'ios:baseline:domain_scores', value: JSON.stringify(domainScores) },
      { user_id: userId, key: 'ios:current_stage', value: JSON.stringify(1) },
    ];
    for (const entry of userDataEntries) {
      await supabase.from('user_data').upsert(entry, { onConflict: 'user_id,key' });
    }

    // useUserProgress throws if user_progress is missing — initialize the row.
    await supabase.from('user_progress').upsert({
      user_id: userId,
      current_stage: 1,
      stage_start_date: now,
      system_initialized: true,
      baseline_completed: true,
    }, { onConflict: 'user_id' });

    router.push(`/onboarding/index-reveal?score=${rewiredIndex}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1
            className="text-3xl text-[#F5F2EC] mb-3"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Where you're starting from
          </h1>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            Four questions, about a minute. Rate yourself right now — there are no wrong answers.
          </p>
        </div>

        <div className="space-y-8">
          {QUESTIONS.map(q => (
            <div key={q.domain} className="bg-[#141414] border border-white/[0.08] rounded-xl p-6">
              <div className="mb-2">
                <span className="text-xs uppercase tracking-wider text-amber-500 font-semibold">
                  {q.label}
                </span>
              </div>
              <h3 className="text-[#F5F2EC] text-lg mb-6">
                {q.text}
              </h3>
              <div className="flex justify-between gap-2">
                {[0, 1, 2, 3, 4, 5].map(value => (
                  <button
                    key={value}
                    onClick={() => setScores(prev => ({ ...prev, [q.domain]: value }))}
                    className={`flex-1 aspect-square rounded-lg border transition-all ${
                      scores[q.domain] === value
                        ? 'bg-amber-500 border-amber-500 text-black font-bold'
                        : 'bg-[#0a0a0a] border-white/[0.1] text-zinc-300 hover:border-amber-500/50'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-3 text-xs text-zinc-500">
                <span>{q.lowLabel}</span>
                <span>{q.highLabel}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          className="mt-10 w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-semibold rounded-lg transition-all"
        >
          {submitting ? 'Calculating...' : 'See my starting point →'}
        </button>
      </div>
    </div>
  );
}
