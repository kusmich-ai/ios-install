'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Zap, Brain, CheckCircle2, ArrowRight, MessageCircle,
  X, Send, ChevronDown, Waves, Loader2,
  TrendingUp, Heart, Shield, Lock, Flame, Quote, User, Calendar,
  BookOpen, Sparkles
} from 'lucide-react';
import Image from 'next/image';
import { useSubscriptionActions } from '@/app/hooks/useSubscription';

type PlanType = 'quarterly' | 'biannual' | 'annual' | 'quarterly_coaching' | 'biannual_coaching' | 'annual_coaching';

// ─────────────────────────────────────────────────────────────────────────────
// URL PARAM SPEC — AI constructs this URL before routing user to /upgrade:
//
// /upgrade?days=12&index=48&delta=0.6&name=Jesse&insight=I+noticed+I+could+observe
//
// days    → number of days completed in Stage 1
// index   → current REwired Index (0–100)
// delta   → average domain delta vs baseline (e.g. 0.6)
// name    → user's first name
// insight → one sentence from their most recent journal/nightly debrief entry
//           (URL-encode: encodeURIComponent("I noticed I could..."))
//
// All params optional — page degrades gracefully with none.
//
// ADD TO system-prompt.txt:
//   "When routing a user to the /upgrade page after the Stage 2 unlock
//    conversation, construct the URL with their progress data as query params:
//    days, index (REwired Index), delta (avg domain delta), name (first name),
//    and insight (one sentence from their most recent nightly debrief or
//    journal entry, URL-encoded). Example:
//    /upgrade?days=12&index=48&delta=0.6&name=Jesse&insight=I%20noticed%20I%20paused%20before%20reacting"
// ─────────────────────────────────────────────────────────────────────────────

interface UserData {
  days: number;
  rewiredIndex: number | null;
  delta: number | null;
  firstName: string | null;
  insight: string | null;
}

function parseUserData(p: URLSearchParams): UserData {
  return {
    days: parseInt(p.get('days') || '0') || 0,
    rewiredIndex: p.get('index') ? parseFloat(p.get('index')!) : null,
    delta: p.get('delta') ? parseFloat(p.get('delta')!) : null,
    firstName: p.get('name') || null,
    insight: p.get('insight') ? decodeURIComponent(p.get('insight')!) : null,
  };
}

function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible] as const;
}

function Reveal({ children, delay = 0, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(18px)',
      transition: `opacity 0.75s cubic-bezier(0.23,1,0.32,1) ${delay}s, transform 0.75s cubic-bezier(0.23,1,0.32,1) ${delay}s`,
    }}>
      {children}
    </div>
  );
}

function UpgradePageInner() {
  const params = useSearchParams();
  const user = parseUserData(params);

  const [selectedTrack, setSelectedTrack] = useState<'installer' | 'coaching'>('installer');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const { startCheckout } = useSubscriptionActions();

  const handleTrackChange = (track: 'installer' | 'coaching') => {
    setSelectedTrack(track);
    setSelectedPlan(track === 'installer' ? 'annual' : 'annual_coaching');
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      await startCheckout(selectedPlan);
    } catch (err) {
      setCheckoutError('Failed to start checkout. Please try again.');
      console.error(err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const scrollToPrice = () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  const hasMetrics = user.rewiredIndex !== null || user.delta !== null || user.days > 0;
  const daysText = user.days > 0 ? `${user.days} days` : 'Stage 1';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#ff9e19]/4 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ff9e19]/4 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-[#ff9e19]/10 border border-[#ff9e19]/25 rounded-full mb-10"
            style={{ opacity: 0, animation: 'fadeUp 0.8s 0.2s forwards' }}>
            <CheckCircle2 className="w-4 h-4 text-[#ff9e19]" />
            <span className="text-sm text-[#ff9e19] font-medium tracking-wide">Stage 1 Complete — Neural Priming ✓</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.08] mb-6 tracking-tight"
            style={{ opacity: 0, animation: 'fadeUp 0.9s 0.35s forwards' }}>
            {user.firstName && (
              <span className="block text-gray-400 text-3xl font-normal mb-3">{user.firstName}, you made it.</span>
            )}
            {daysText} of showing up.<br />
            <span className="text-[#ff9e19]">That's the hardest part.</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed"
            style={{ opacity: 0, animation: 'fadeUp 0.9s 0.48s forwards' }}>
            The changes happening inside you right now aren't dramatic. They're not supposed to be.{' '}
            <span className="text-white font-medium">Rewiring doesn't announce itself. It just quietly becomes your new normal.</span>
          </p>

          {/* Journal insight — only if passed */}
          {user.insight && (
            <div className="max-w-2xl mx-auto mb-8"
              style={{ opacity: 0, animation: 'fadeUp 0.9s 0.55s forwards' }}>
              <div className="p-5 bg-[#ff9e19]/6 border border-[#ff9e19]/20 rounded-2xl flex gap-4 text-left">
                <Quote className="w-5 h-5 text-[#ff9e19] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white italic mb-2">"{user.insight}"</p>
                  <p className="text-xs text-gray-500">From your Stage 1 — that moment of noticing is the observer function. It's installed. Stage 2 builds on it.</p>
                </div>
              </div>
            </div>
          )}

          {/* Metrics — only if data was passed */}
          {hasMetrics && (
            <div className="flex flex-wrap justify-center gap-4 mb-10"
              style={{ opacity: 0, animation: 'fadeUp 0.9s 0.58s forwards' }}>
              {user.days > 0 && (
                <div className="px-6 py-4 bg-[#111] border border-[#1e1e1e] rounded-2xl text-center min-w-[90px]">
                  <div className="text-3xl font-bold text-[#ff9e19]">{user.days}</div>
                  <div className="text-xs text-gray-500 mt-1">Days In</div>
                </div>
              )}
              {user.rewiredIndex !== null && (
                <div className="px-6 py-4 bg-[#111] border border-[#1e1e1e] rounded-2xl text-center min-w-[90px]">
                  <div className="text-3xl font-bold text-[#ff9e19]">{user.rewiredIndex}</div>
                  <div className="text-xs text-gray-500 mt-1">REwired Index</div>
                </div>
              )}
              {user.delta !== null && (
                <div className="px-6 py-4 bg-[#111] border border-[#1e1e1e] rounded-2xl text-center min-w-[90px]">
                  <div className="text-3xl font-bold text-[#ff9e19]">+{user.delta}</div>
                  <div className="text-xs text-gray-500 mt-1">Avg. Delta</div>
                </div>
              )}
              <div className="px-6 py-4 bg-[#111] border border-[#ff9e19]/20 rounded-2xl text-center min-w-[90px]">
                <div className="text-3xl font-bold text-[#ff9e19]">$1.91</div>
                <div className="text-xs text-gray-500 mt-1">Per Day (Annual)</div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center"
            style={{ opacity: 0, animation: 'fadeUp 0.9s 0.65s forwards' }}>
            <button onClick={scrollToPrice}
              className="px-8 py-4 bg-[#ff9e19] hover:bg-[#ffb04d] text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-lg shadow-[#ff9e19]/20">
              <Zap className="w-5 h-5" />Continue the Installation
            </button>
            <button onClick={() => setShowChat(true)}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all flex items-center justify-center gap-2 text-lg">
              <MessageCircle className="w-5 h-5" />Have Questions?
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-gray-600" />
        </div>
      </section>

      {/* ── WHAT STAGE 1 ACTUALLY DID ─────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3">This Is What Was Changing</h2>
            <p className="text-xl text-gray-400 text-center mb-12 max-w-2xl mx-auto">
              You may not have felt it dramatically. That's by design. Stage 1 installs quietly —
              at the nervous system level, before the mind has a chance to interfere.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-3 gap-5 mb-8">
            {[
              {
                icon: Waves, label: 'Your Vagal Tone Baseline Shifted',
                desc: 'Resonance Breathing stimulated your vagus nerve and raised RMSSD. The baseline your body returns to after stress is measurably different. You may not feel it — your reactions do.',
              },
              {
                icon: Brain, label: 'The Observer Came Online',
                desc: 'Awareness Rep trained the insula-PCC pathway — the neural circuit that watches the mind instead of being run by it. That gap between trigger and reaction? You built it.',
              },
              {
                icon: Flame, label: 'The System Proved Itself Compliant',
                desc: "You showed up consistently enough to earn an unlock. The nervous system now has evidence it can be directed. That proof is the prerequisite for everything that follows.",
              },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="p-7 bg-[#111] border border-[#1a1a1a] rounded-2xl h-full">
                  <div className="w-12 h-12 bg-[#ff9e19]/10 rounded-xl flex items-center justify-center mb-5">
                    <item.icon className="w-6 h-6 text-[#ff9e19]" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.label}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3}>
            <div className="p-7 bg-[#0d0d0d] border border-[#1e1e1e] rounded-2xl text-center">
              <p className="text-gray-400 leading-relaxed max-w-2xl mx-auto">
                <span className="text-white font-medium">If Stage 1 felt subtle — that's accurate, not a failure.</span>{' '}
                The changes in your response patterns, your HRV baseline, and your capacity to notice before reacting
                don't arrive as a feeling. They arrive as a slightly different Wednesday. A reaction that didn't quite
                happen. A pause that wasn't there before. That's rewiring. It doesn't announce itself.
              </p>
            </div>
          </Reveal>

          {user.delta !== null && (
            <Reveal delay={0.35}>
              <div className="mt-5 p-6 bg-[#ff9e19]/6 border border-[#ff9e19]/15 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="text-5xl font-bold text-[#ff9e19] flex-shrink-0">+{user.delta}</div>
                <div>
                  <p className="text-white font-medium mb-1">Your average domain delta vs. baseline.</p>
                  <p className="text-gray-400 text-sm">Across Regulation, Awareness, Outlook, and Attention — your scores moved. That number isn't a feeling. It's a measurement.</p>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ── STAGES 2–7 ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[#0d0d0d] border-t border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">The 6 Stages That Complete the Installation</h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                You're at 8 minutes a day. The full Stack runs at 16.
                Each stage adds one practice. Each unlocks when your system demonstrates readiness.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="p-5 rounded-xl border border-[#ff9e19]/30 bg-[#ff9e19]/5 mb-2 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold bg-[#ff9e19] text-black flex-shrink-0 text-sm">01</div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">Neural Priming</span>
                  <span className="text-gray-500 text-sm">— 🫁 Resonance Breathing (5 min) + 👁 Awareness Rep (3 min)</span>
                  <span className="px-2 py-0.5 bg-[#ff9e19]/20 text-[#ff9e19] text-xs font-bold rounded-full">INSTALLED ✓</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">8 min/day · vagal tone baseline · observer function online</div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-[#ff9e19] flex-shrink-0" />
            </div>
          </Reveal>

          {[
            {
              num: '02', name: 'Embodied Awareness', tagline: 'Bring meta-awareness into motion.',
              adds: '+ 🧘 Somatic Flow — 2 min', time: '10 min/day',
              installing: 'proprioceptive mapping · interoceptive awareness · cerebrospinal coherence',
              why: 'The observer function you built in Stage 1 lives in your head. Somatic Flow moves it into your body — so regulation is felt, not just practiced.',
            },
            {
              num: '03', name: 'Cue Training', tagline: 'Catch patterns before they become you.',
              adds: '+ ⚡ The Cue — 2 min   🔑 Reframe Protocol unlocked', time: '12 min/day',
              installing: 'reticular priming · salience network calibration · pattern recognition',
              why: "The Cue trains your reticular activating system to surface recurring patterns before they run as automatic behavior. You don't change the pattern — you catch it first. The Reframe Protocol becomes available as an on-demand tool.",
            },
            {
              num: '04', name: 'Flow Mode', tagline: 'Train sustained attention on performance drivers.',
              adds: '+ 🎯 Flow Block — 60–90 min   🔑 Thought Hygiene unlocked', time: '+ daily deep work',
              installing: 'frontal-parietal synchronization · dopaminergic attention circuits · challenge-skill calibration',
              why: "Flow isn't luck — it's a trainable neurological state. Flow Blocks condition your brain to drop into sustained attention on demand, and track what conditions produce it.",
            },
            {
              num: '05', name: 'Relational Coherence', tagline: 'Train the nervous system to stay open in connection.',
              adds: '+ 💞 Co-Regulation — 2 min', time: '14 min/day',
              installing: 'ventral vagal social engagement circuit · oxytocin signaling · compassion regulation',
              why: 'Regulation in isolation is the easy part. This trains your nervous system to stay open under relational pressure — not just alone at 6am, but in rooms with people who trigger you.',
            },
            {
              num: '06', name: 'Integration', tagline: 'Convert insight into stable, trait-level awareness.',
              adds: '+ 🌙 Nightly Debrief — 2 min', time: '16 min/day — full stack',
              installing: 'hippocampal-to-trait encoding · narrative integration · sleep-based consolidation',
              why: "Insights without integration vanish. The Nightly Debrief happens at the precise pre-sleep window when your brain encodes lived experience into permanent, trait-level change.",
            },
            {
              num: '07', name: 'Accelerated Expansion', tagline: 'Awareness engineers itself.',
              adds: 'Nootropics · Neurofeedback · Advanced protocols', time: 'Application required',
              installing: 'advanced integration · supervised expansion',
              why: 'For those who have proven complete Stack competence. By invitation only.',
              locked: true,
            },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div className={`p-5 rounded-xl border mb-2 transition-all ${item.locked ? 'border-[#151515] bg-[#0b0b0b] opacity-50' : 'border-[#1e1e1e] bg-[#111] hover:border-[#272727]'}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${item.locked ? 'bg-[#151515] text-gray-700' : 'bg-[#1a1a1a] text-[#ff9e19]'}`}>{item.num}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold">{item.name}</span>
                      <span className="text-[#ff9e19] text-sm italic">— {item.tagline}</span>
                    </div>
                    <div className="text-xs text-gray-600 mb-1 font-mono">{item.adds}</div>
                    <div className="text-xs text-gray-600 mb-2">Installing: {item.installing} · <span className="text-gray-500">{item.time}</span></div>
                    <p className="text-sm text-gray-400 leading-relaxed">{item.why}</p>
                  </div>
                  {item.locked ? <Lock className="w-4 h-4 text-gray-700 flex-shrink-0 mt-1" /> : <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0 mt-1" />}
                </div>
              </div>
            </Reveal>
          ))}

          <Reveal delay={0.3}>
            <div className="mt-8 text-center">
              <button onClick={scrollToPrice}
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#ff9e19] hover:bg-[#ffb04d] text-black font-bold rounded-xl transition-all text-lg shadow-lg shadow-[#ff9e19]/15">
                <Zap className="w-5 h-5" />Unlock Stages 2–7
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── WHAT YOU GET ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Stage 1 was the sample.<br />
                <span className="text-[#ff9e19]">This is the full installation.</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Stages 2–7 unlock every tool, every protocol, every resource in the system.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5 mb-8">
            {[
              {
                icon: Zap, title: 'All 6 Remaining Stage Rituals',
                desc: 'Somatic Flow, The Cue, Flow Block, Co-Regulation, Nightly Debrief. Each unlocks sequentially as your nervous system earns it.',
                tag: null,
              },
              {
                icon: Sparkles, title: 'Full AI Coach Access — Nic & Fehren',
                desc: 'Unrestricted access to both AI coaches, trained on hundreds of real coaching conversations. Available 24/7, they know your stage, your patterns, and your progress.',
                tag: '$1,200 Value',
              },
              {
                icon: BookOpen, title: 'Science of Neural Liberation Course',
                desc: '4 modules, 16 tutorials, 30+ hours of neuroscience-backed education. The why behind everything you\'re doing — available from Stage 2 onward.',
                tag: '$497 Value',
              },
              {
                icon: Brain, title: 'Full On-Demand Protocol Suite',
                desc: 'Reframe Protocol (Stage 3+), Thought Hygiene (Stage 4+), Decentering Practice, Meta-Reflection. Real tools that activate exactly when you need them.',
                tag: null,
              },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="flex gap-4 p-6 bg-[#111] border border-[#1a1a1a] rounded-2xl h-full">
                  <div className="w-12 h-12 bg-[#ff9e19]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-[#ff9e19]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      {item.tag && <span className="text-xs text-[#ff9e19] font-medium">{item.tag}</span>}
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* DIY comparison */}
          <Reveal delay={0.3}>
            <div className="p-7 bg-[#0d0d0d] border border-[#1e1e1e] rounded-2xl">
              <h3 className="font-semibold text-center mb-6 text-gray-300">What you'd need to assemble this yourself</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <div className="text-xs text-gray-600 font-medium uppercase tracking-wide mb-3">The DIY Route</div>
                  <ul className="space-y-2 text-sm text-gray-500">
                    {['Weekly CBT or somatic therapy', 'HRV biofeedback device + subscription', 'Mindfulness app subscription', 'Performance coach for flow training', 'Someone to design the developmental sequence', 'The discipline to do all of it daily, in order'].map((item, i) => (
                      <li key={i} className="flex items-start gap-2"><span className="text-red-500 mt-0.5 flex-shrink-0">→</span>{item}</li>
                    ))}
                  </ul>
                  <div className="mt-4 text-sm text-gray-600">Estimated: <span className="text-gray-400 font-medium">$800+/month</span></div>
                </div>
                <div>
                  <div className="text-xs text-[#ff9e19] font-medium uppercase tracking-wide mb-3">Unbecoming — Full Installation</div>
                  <ul className="space-y-2 text-sm text-gray-300">
                    {['All 7 stages, pre-sequenced, pre-stacked', 'AI coaches that know your journey', 'Competence-based unlocking — advance when ready', 'Full course library included', 'Full on-demand protocol suite', '16 minutes a day at full Stack'].map((item, i) => (
                      <li key={i} className="flex items-start gap-2"><span className="text-[#ff9e19] mt-0.5 flex-shrink-0">✦</span>{item}</li>
                    ))}
                  </ul>
                  <div className="mt-4 text-sm text-gray-600">Annual: <span className="text-[#ff9e19] font-medium">$1.91/day</span></div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── THE HUMANS ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[#0d0d0d] border-t border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff9e19]/10 border border-[#ff9e19]/20 rounded-full mb-6 text-sm text-[#ff9e19] font-medium">
                Coaching Track — Optional Upgrade
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">
                The Stack runs without us.<br />
                <span className="text-[#ff9e19]">Live coaching accelerates with us.</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                The Installer track gives you the full system. The Coaching track adds
                direct, live access to the people who built it — every week.
              </p>
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-5 mt-12 mb-5">
            {[
              { img: '/coaches/nic.avif', name: 'Nicholas Kusmich', role: 'IOS Systems Architect', bio: "Former pastor turned marketing strategist who's generated over $1B in client revenue. Nicholas built The Stack as the operating system he wished existed. Live coaching gives you direct access to his pattern recognition — applied to your specific situation, in real time." },
              { img: '/coaches/fehren.avif', name: 'Fehren Kusmich', role: 'Heart & Body Specialist', bio: "Certified somatic practitioner. Fehren's live sessions are especially relevant from Stage 2 onward, where the body-based and relational practices benefit most from the attunement a live conversation provides." },
            ].map((p, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <div className="p-7 bg-[#111] border border-[#1a1a1a] rounded-2xl flex gap-5 h-full">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                    <Image src={p.img} alt={p.name} width={160} height={160} quality={100} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-0.5">{p.name}</h3>
                    <p className="text-[#ff9e19] text-sm mb-3">{p.role}</p>
                    <p className="text-gray-400 text-sm leading-relaxed">{p.bio}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-5 mb-6">
            {[
              { img: '/coaches/charok.jpg', name: 'Charok Lama', role: 'Leading Buddhist Teacher & Life Coach', bio: 'Recognized reincarnation of a Himalayan yogi. Trained at Kopan and Sera Je Monasteries. Bridges ancient contemplative practice with CBT. Brings the depth of lineage to the live coaching track.' },
              { img: null, name: 'Monthly Guest Experts', role: 'World-Class Authorities', bio: 'Each month a world-class practitioner brings their field to the community — neuroscience, performance, relationships, and the edges of human potential. All sessions recorded.' },
            ].map((p, i) => (
              <Reveal key={i} delay={i * 0.12 + 0.2}>
                <div className="p-6 bg-[#111] border border-[#1a1a1a] rounded-2xl flex gap-4 h-full">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#1a1a1a] flex-shrink-0 flex items-center justify-center">
                    {p.img ? <Image src={p.img} alt={p.name} width={112} height={112} quality={100} className="w-full h-full object-cover" /> : <User className="w-7 h-7 text-gray-600" />}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-0.5">{p.name}</h3>
                    <p className="text-[#ff9e19] text-sm mb-2">{p.role}</p>
                    <p className="text-gray-400 text-sm leading-relaxed">{p.bio}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3}>
            <div className="p-6 bg-[#111] border border-[#1e1e1e] rounded-2xl">
              <div className="flex flex-wrap gap-8 justify-center text-center">
                {[
                  { icon: Calendar, label: 'Weekly Live Calls', sub: 'Nicholas, Fehren & Charok Lama' },
                  { icon: User, label: 'Monthly Guest Expert', sub: 'Live Q&A, recorded' },
                  { icon: MessageCircle, label: 'Hot Seat Coaching', sub: 'Your situation, directly' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 bg-[#ff9e19]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-[#ff9e19]" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── SOCIAL PROOF ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3">What Happened When They Continued</h2>
            <p className="text-xl text-gray-400 text-center mb-14 max-w-2xl mx-auto">People who completed Stage 1 and kept going.</p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5 mb-6">
            {[
              { icon: TrendingUp, name: 'Jesse', label: 'Entrepreneur', quote: '"My business did $60k the first year. $90k the next. After this protocol, I\'ll cross the $300k mark. Something in the way I operate completely changed."', stat: '5× revenue growth' },
              { icon: TrendingUp, name: 'Brian', label: 'Business Owner', quote: '"Since doing this I have had 7 million dollar months in a row. I have never done that before. Something just started clicking. Hard to describe."', stat: '7 consecutive $1M+ months' },
              { icon: Heart, name: 'Jenna', label: 'Personal Transformation', quote: '"I was able to clearly see the walls I had built and dissolve them, allowing me to love freely. Words can\'t express how much this has helped me."', stat: null },
              { icon: Shield, name: 'Martin', label: 'Stage 7 Graduate', quote: '"36 days without anxiety or sleep pills after finishing Stage 7. Complete freedom I hadn\'t experienced in years."', stat: 'Free from dependency' },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="p-7 bg-[#111] border border-[#1a1a1a] rounded-2xl h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-[#ff9e19]/10 rounded-full flex items-center justify-center">
                      <t.icon className="w-5 h-5 text-[#ff9e19]" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.label}</div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed flex-1">{t.quote}</p>
                  {t.stat && <div className="mt-4 text-xs text-[#ff9e19] font-medium">{t.stat}</div>}
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3}>
            <div className="p-7 bg-gradient-to-r from-[#ff9e19]/8 to-transparent border border-[#ff9e19]/15 rounded-2xl text-center">
              <p className="text-xl font-medium mb-3">"This has <span className="text-[#ff9e19]">completely changed who I am</span> for the better. I am in such an amazing place."</p>
              <p className="text-gray-500 text-sm">— Alan</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-4 bg-[#0d0d0d] border-t border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">Choose How You Continue</h2>
              <p className="text-xl text-gray-400 max-w-xl mx-auto mb-3">Stage 1 was free. Stages 2–7 require commitment.</p>
              <p className="text-sm text-gray-500">
                Annual access is <span className="text-[#ff9e19] font-medium">$1.91 per day</span> — less than a coffee, for the full installation. Less than one therapy session per month, for a complete system.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="max-w-md mx-auto mb-8">
              <div className="flex gap-2 p-1 bg-[#111] border border-[#1a1a1a] rounded-xl">
                {(['installer', 'coaching'] as const).map((track) => (
                  <button key={track} onClick={() => handleTrackChange(track)}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all text-sm ${selectedTrack === track ? 'bg-[#ff9e19] text-black' : 'text-gray-400 hover:text-white'}`}>
                    {track === 'installer' ? 'The Stack' : 'Stack + Live Coaching'}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          {selectedTrack === 'coaching' && (
            <Reveal>
              <div className="max-w-2xl mx-auto mb-8 p-5 bg-[#ff9e19]/5 border border-[#ff9e19]/15 rounded-xl">
                <p className="text-center text-gray-300 text-sm">
                  <span className="text-[#ff9e19] font-semibold">Everything in The Stack, PLUS:</span>{' '}
                  Weekly live calls with Nicholas, Fehren & Charok Lama. Monthly guest expert sessions. Hot seat coaching. All calls recorded.
                </p>
              </div>
            </Reveal>
          )}

          <div className="grid md:grid-cols-3 gap-5">
            {(selectedTrack === 'installer' ? [
              { plan: 'annual' as PlanType, label: 'Annual', sub: 'Best for full transformation', price: '$697', monthly: '$58/mo', billing: 'Billed annually', badge: 'SAVE 61%', perDay: '$1.91/day' },
              { plan: 'biannual' as PlanType, label: '6 Months', sub: 'Solid commitment', price: '$597', monthly: '$100/mo', billing: 'Billed every 6 months', badge: null, perDay: '$3.28/day' },
              { plan: 'quarterly' as PlanType, label: '3 Months', sub: 'Start and see', price: '$447', monthly: '$149/mo', billing: 'Billed every 3 months', badge: null, perDay: '$4.97/day' },
            ] : [
              { plan: 'annual_coaching' as PlanType, label: 'Annual', sub: 'Best for full transformation', price: '$1,797', monthly: '$150/mo', billing: 'Billed annually', badge: 'BEST VALUE', perDay: '$4.92/day' },
              { plan: 'biannual_coaching' as PlanType, label: '6 Months', sub: 'Solid commitment', price: '$1,397', monthly: '$233/mo', billing: 'Billed every 6 months', badge: null, perDay: '$7.68/day' },
              { plan: 'quarterly_coaching' as PlanType, label: '3 Months', sub: 'Start and see', price: '$1,038', monthly: '$346/mo', billing: 'Billed every 3 months', badge: null, perDay: '$11.53/day' },
            ]).map((card) => (
              <Reveal key={card.plan}>
                <div onClick={() => setSelectedPlan(card.plan)}
                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedPlan === card.plan ? 'border-[#ff9e19] bg-[#ff9e19]/8 shadow-lg shadow-[#ff9e19]/10' : 'border-[#1a1a1a] bg-[#111] hover:border-[#2a2a2a]'}`}>
                  {card.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#ff9e19] text-black text-xs font-bold rounded-full whitespace-nowrap">{card.badge}</div>
                  )}
                  <div className="text-center pt-3">
                    <h3 className="font-bold text-lg mb-1">{card.label}</h3>
                    <p className="text-gray-500 text-xs mb-5">{card.sub}</p>
                    <div className="text-4xl font-bold mb-1">{card.price}</div>
                    <p className={`text-sm font-medium ${selectedPlan === card.plan ? 'text-[#ff9e19]' : 'text-gray-400'}`}>{card.monthly}</p>
                    <p className="text-gray-600 text-xs mt-1">{card.billing}</p>
                    <p className="text-gray-700 text-xs mt-1">{card.perDay}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {checkoutError && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
              <p className="text-red-400 text-sm">{checkoutError}</p>
            </div>
          )}

          <Reveal delay={0.2}>
            <div className="mt-8 text-center">
              <button onClick={handleCheckout} disabled={checkoutLoading}
                className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-[#ff9e19] hover:bg-[#ffb04d] text-black font-bold rounded-xl transition-all text-lg shadow-xl shadow-[#ff9e19]/20 disabled:opacity-50 disabled:cursor-not-allowed">
                {checkoutLoading
                  ? <><Loader2 className="w-5 h-5 animate-spin" />Processing...</>
                  : <><Zap className="w-5 h-5" />{selectedTrack === 'coaching' ? 'Continue — Stack + Live Coaching' : 'Continue the Installation — Stages 2–7'}</>}
              </button>
              <p className="mt-3 text-gray-600 text-xs">Auto-renews at same rate until cancelled</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto">
          <Reveal><h2 className="text-3xl font-bold text-center mb-12">Before You Continue</h2></Reveal>
          <div className="space-y-3">
            {[
              { q: "I didn't feel that much in Stage 1. Should I still continue?", a: "Yes — and that response is expected. Stage 1 doesn't produce dramatic experiences. It installs a new baseline quietly, at the nervous system level. The changes show up as a slightly different Wednesday. A reaction that didn't quite happen. A pause before responding that wasn't there before. Stage 2 is where the installation starts to become perceptible." },
              { q: "What AI coach access do I get with Stages 2–7?", a: "Full, unrestricted access to both Nic AI and Fehren AI. They're trained on hundreds of real coaching conversations, know your stage and progress, and are available 24/7. In Stage 1 you primarily had The Stack Installer. Stages 2+ unlock both dedicated coaches plus The Installer, each with access to the full protocol suite as you earn it." },
              { q: "Will Stage 2 feel like starting over?", a: "No. Somatic Flow (Stage 2) adds 2 minutes and builds directly on the vagal tone and observer function you established in Stage 1. You'll feel the connection to what's already installed — not a fresh start." },
              { q: "How much time does this actually take?", a: "You're at 8 minutes now. Stage 2 adds 2 minutes (10 total). Stage 3 adds 2 more (12 total). The full Stack at Stage 6 runs at 16 minutes per day. Flow Block in Stage 4 is your deep work time — it doesn't add to your day, it replaces unfocused work with a structured block." },
              { q: "What if I miss days or fall off?", a: "The system is built for real life. Missing a day doesn't reset your progress. If you fall off for more than a week, the system recalibrates your starting point. Sustainable installation over perfect performance." },
              { q: "Is the Live Coaching track worth upgrading to?", a: "The Stack handles the full journey on its own if you're self-directed and consistent. Live Coaching accelerates it — direct access to Nicholas, Fehren, and Charok Lama every week means you can bring your specific situation and get real-time pattern recognition applied to it." },
            ].map((item, i) => (
              <Reveal key={i}>
                <div className="border border-[#1a1a1a] rounded-xl overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-[#111] transition-colors">
                    <span className="font-medium text-sm sm:text-base">{item.q}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5">
                      <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-bold mb-5">The Foundation Is Set.<br /><span className="text-[#ff9e19]">Build On It.</span></h2>
            <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto">Stage 1 changed your baseline. Stages 2–7 change your ceiling. The system is ready.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={scrollToPrice}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#ff9e19] hover:bg-[#ffb04d] text-black font-bold rounded-xl transition-all text-lg shadow-xl shadow-[#ff9e19]/15">
                <Zap className="w-5 h-5" />Continue the Installation
              </button>
              <button onClick={() => setShowChat(true)}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-lg">
                <MessageCircle className="w-5 h-5" />Still Have Questions?
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {showChat && <SalesChat onClose={() => setShowChat(false)} />}

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <UpgradePageInner />
    </Suspense>
  );
}

function SalesChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: "Hey — you've already done Stage 1. What questions do you have about continuing?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const res = await fetch('/api/sales-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: msg }] }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Having trouble connecting. Head back to the app and ask The Stack Installer directly." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111] border border-[#1a1a1a] rounded-2xl w-full max-w-lg h-[560px] max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#1a1a1a] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#ff9e19]/10 rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-[#ff9e19]" />
            </div>
            <div>
              <div className="font-semibold text-sm">Ask Us Anything</div>
              <div className="text-xs text-gray-500">About continuing to Stage 2</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-[#ff9e19] text-black rounded-br-sm' : 'bg-[#1a1a1a] text-gray-300 rounded-bl-sm'}`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#1a1a1a] p-3.5 rounded-2xl rounded-bl-sm flex gap-1">
                {[0, 150, 300].map(d => <span key={d} className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="p-4 border-t border-[#1a1a1a] flex-shrink-0">
          <div className="flex gap-2">
            <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask anything..."
              className="flex-1 px-4 py-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#ff9e19]/40" />
            <button onClick={sendMessage} disabled={!input.trim() || loading}
              className="px-4 py-3 bg-[#ff9e19] hover:bg-[#ffb04d] text-black rounded-xl transition-colors disabled:opacity-40">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
