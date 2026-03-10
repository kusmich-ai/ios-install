'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Zap, Brain, Shield, CheckCircle2, ArrowRight, MessageCircle,
  X, Send, ChevronDown, Waves, Target, Clock, Loader2,
  TrendingUp, Heart, Star, Lock, Flame, User
} from 'lucide-react';
import Image from 'next/image';
import { useSubscriptionActions } from '@/app/hooks/useSubscription';

type PlanType = 'quarterly' | 'biannual' | 'annual' | 'quarterly_coaching' | 'biannual_coaching' | 'annual_coaching';

// ─── Progress data from URL params (future: pull from Supabase directly) ───────
interface UserProgress {
  days: number;
  rewiredIndex: number | null;
  delta: number | null;
  firstName: string | null;
}

function parseProgressFromParams(searchParams: URLSearchParams): UserProgress {
  return {
    days: parseInt(searchParams.get('days') || '0') || 0,
    rewiredIndex: searchParams.get('index') ? parseFloat(searchParams.get('index')!) : null,
    delta: searchParams.get('delta') ? parseFloat(searchParams.get('delta')!) : null,
    firstName: searchParams.get('name') || null,
  };
}

// ─── Intersection observer hook for scroll reveals ────────────────────────────
function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible] as const;
}

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.8s cubic-bezier(0.23,1,0.32,1) ${delay}s, transform 0.8s cubic-bezier(0.23,1,0.32,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Main page (wrapped in Suspense for useSearchParams) ─────────────────────
function UpgradePageInner() {
  const searchParams = useSearchParams();
  const userProgress = parseProgressFromParams(searchParams);

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
      console.error('Checkout error:', err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const scrollToPrice = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  const getButtonText = () =>
    selectedTrack === 'coaching'
      ? 'Continue to Stages 2–7 + Live Coaching'
      : 'Continue the Installation — Stages 2–7';

  // Greeting line based on available data
  const greeting = userProgress.firstName ? `${userProgress.firstName},` : '';
  const daysLabel = userProgress.days > 0 ? `${userProgress.days} days` : 'your time';
  const hasMetrics = userProgress.rewiredIndex !== null || userProgress.delta !== null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">

      {/* ─── HERO: Acknowledge the journey ─────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-24 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#ff9e19]/4 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ff9e19]/4 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">

          {/* Stage badge */}
          <div
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#ff9e19]/10 border border-[#ff9e19]/25 rounded-full mb-10"
            style={{ opacity: 0, animation: 'fadeUp 0.8s 0.2s cubic-bezier(0.23,1,0.32,1) forwards' }}
          >
            <CheckCircle2 className="w-4 h-4 text-[#ff9e19]" />
            <span className="text-sm text-[#ff9e19] font-medium tracking-wide">Stage 1 Complete — Neural Priming ✓</span>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.08] mb-6 tracking-tight"
            style={{ opacity: 0, animation: 'fadeUp 0.9s 0.4s cubic-bezier(0.23,1,0.32,1) forwards' }}
          >
            {greeting && <span className="block text-gray-400 text-3xl sm:text-4xl font-normal mb-3">{greeting}</span>}
            You didn't imagine it.<br />
            <span className="text-[#ff9e19]">Something actually changed.</span>
          </h1>

          {/* Sub */}
          <p
            className="text-xl text-gray-400 max-w-2xl mx-auto mb-6 leading-relaxed"
            style={{ opacity: 0, animation: 'fadeUp 0.9s 0.55s cubic-bezier(0.23,1,0.32,1) forwards' }}
          >
            In {daysLabel}, your nervous system built a new baseline.
            That coherence you've been feeling? That's the foundation.
            <span className="text-white font-medium"> Stages 2–7 are the building.</span>
          </p>

          {/* Dynamic metrics block — shows only if data passed */}
          {hasMetrics && (
            <div
              className="flex flex-wrap justify-center gap-6 mb-10"
              style={{ opacity: 0, animation: 'fadeUp 0.9s 0.65s cubic-bezier(0.23,1,0.32,1) forwards' }}
            >
              {userProgress.rewiredIndex !== null && (
                <div className="px-6 py-4 bg-[#ff9e19]/10 border border-[#ff9e19]/20 rounded-2xl text-center">
                  <div className="text-3xl font-bold text-[#ff9e19]">{userProgress.rewiredIndex}</div>
                  <div className="text-xs text-gray-400 mt-1">REwired Index</div>
                </div>
              )}
              {userProgress.delta !== null && (
                <div className="px-6 py-4 bg-[#ff9e19]/10 border border-[#ff9e19]/20 rounded-2xl text-center">
                  <div className="text-3xl font-bold text-[#ff9e19]">+{userProgress.delta}</div>
                  <div className="text-xs text-gray-400 mt-1">Avg. Delta</div>
                </div>
              )}
              {userProgress.days > 0 && (
                <div className="px-6 py-4 bg-[#ff9e19]/10 border border-[#ff9e19]/20 rounded-2xl text-center">
                  <div className="text-3xl font-bold text-[#ff9e19]">{userProgress.days}</div>
                  <div className="text-xs text-gray-400 mt-1">Days Completed</div>
                </div>
              )}
            </div>
          )}

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            style={{ opacity: 0, animation: 'fadeUp 0.9s 0.7s cubic-bezier(0.23,1,0.32,1) forwards' }}
          >
            <button
              onClick={scrollToPrice}
              className="px-8 py-4 bg-[#ff9e19] hover:bg-[#ffb04d] text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-lg shadow-lg shadow-[#ff9e19]/20"
            >
              <Zap className="w-5 h-5" />
              Continue the Installation
            </button>
            <button
              onClick={() => setShowChat(true)}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all flex items-center justify-center gap-2 text-lg"
            >
              <MessageCircle className="w-5 h-5" />
              Have Questions?
            </button>
          </div>

          {/* Scroll nudge */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-6 h-6 text-gray-600" />
          </div>
        </div>
      </section>

      {/* ─── BRIDGE: What Stage 1 proved ──────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
              What Stage 1 Actually Did
            </h2>
            <p className="text-xl text-gray-400 text-center mb-14 max-w-2xl mx-auto">
              You didn't just complete a habit. You proved to your nervous system it can change.
              Here's what was installed.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: Waves,
                title: 'Vagal Tone Rewired',
                desc: 'Resonance breathing created measurable HRV improvement. Your autonomic baseline is no longer where it started.',
              },
              {
                icon: Brain,
                title: 'Observer Activated',
                desc: 'Awareness Rep trained your insula-PCC circuit — the part of the brain that watches the mind instead of being run by it.',
              },
              {
                icon: Flame,
                title: 'Consistency Installed',
                desc: "You showed up. That's not small. You've proven the system works — and that you can work the system.",
              },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="p-7 bg-[#111] border border-[#1a1a1a] rounded-2xl h-full">
                  <div className="w-12 h-12 bg-[#ff9e19]/10 rounded-xl flex items-center justify-center mb-5">
                    <item.icon className="w-6 h-6 text-[#ff9e19]" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3}>
            <div className="mt-10 p-7 bg-gradient-to-r from-[#ff9e19]/8 to-transparent border border-[#ff9e19]/15 rounded-2xl">
              <p className="text-lg text-center">
                <span className="text-[#ff9e19] font-semibold">Stage 1 was the foundation.</span>{' '}
                <span className="text-gray-300">
                  A regulated nervous system without direction is still incomplete. The next 6 stages
                  install the architecture on top of that foundation — identity, flow, coherence, and
                  the ability to sustain it all under real-world pressure.
                </span>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── WHAT UNLOCKS: Stages 2–7 ──────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[#0d0d0d] border-t border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                The 6 Stages That Complete the Installation
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Each stage adds a new practice. Each unlocks only when your system is ready.
                You can't skip ahead — and you won't want to.
              </p>
            </div>
          </Reveal>

          {/* Stage 1 — already done */}
          <Reveal>
            <div className="p-5 rounded-xl border border-[#ff9e19]/30 bg-[#ff9e19]/5 mb-3 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold bg-[#ff9e19] text-black flex-shrink-0">1</div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">Neural Priming</span>
                  <span className="text-gray-500 text-sm">— Resonance Breathing + Awareness Rep</span>
                  <span className="px-2 py-0.5 bg-[#ff9e19]/20 text-[#ff9e19] text-xs font-bold rounded-full">INSTALLED ✓</span>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-[#ff9e19] flex-shrink-0" />
            </div>
          </Reveal>

          {/* Stages 2–7 */}
          {[
            {
              stage: 2, name: 'Embodied Awareness', tagline: 'Bring awareness into the whole self',
              practice: 'Somatic Flow (3 min)',
              why: 'Your awareness is still mostly in your head. Somatic Flow connects it to your body — proprioception, movement, breath. Coherence becomes physical.',
            },
            {
              stage: 3, name: 'Aligned Action Mode', tagline: 'Act from coherence',
              practice: '21-Day Evidence Cycles (2–3 min daily)',
              why: 'Identity without evidence is aspiration. The 21-day cycle installs chosen identity through verifiable daily proof — conditioning the nervous system through action.',
            },
            {
              stage: 4, name: 'Flow Mode', tagline: 'Train sustained flow states',
              practice: 'Flow Block (60–90 min)',
              why: 'Deep work isn\'t a strategy — it\'s a trained neurological state. Flow Blocks systematically condition your brain to drop into sustained attention on demand.',
            },
            {
              stage: 5, name: 'Relational Coherence', tagline: 'Stay open in connection',
              practice: 'Co-Regulation Practice (3–5 min)',
              why: 'Your nervous system collapses under social stress. This trains the ventral vagal circuit to stay open — not just alone in the morning, but in rooms with other people.',
            },
            {
              stage: 6, name: 'Integration', tagline: 'Convert insights and states to traits',
              practice: 'Nightly Debrief (2 min)',
              why: 'Lessons without integration vanish. The Nightly Debrief uses hippocampal consolidation to encode daily lived experience into permanent, trait-level awareness.',
            },
            {
              stage: 7, name: 'Accelerated Expansion', tagline: 'Awareness engineers itself',
              practice: 'Advanced protocols (by application)',
              why: 'Supplements, neurofeedback, guided expansion. This is the beyond — for those who\'ve proven complete IOS competence and are ready to accelerate.',
              locked: true,
            },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 0.07}>
              <div className={`p-5 rounded-xl border mb-3 transition-all ${item.locked ? 'border-[#1a1a1a] bg-[#0e0e0e] opacity-60' : 'border-[#1e1e1e] bg-[#111] hover:border-[#2a2a2a]'}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0 ${item.locked ? 'bg-[#1a1a1a] text-gray-600' : 'bg-[#1a1a1a] text-[#ff9e19]'}`}>
                    {item.stage}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold">{item.name}</span>
                      <span className="text-[#ff9e19] text-sm italic">— {item.tagline}</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">+ {item.practice}</div>
                    <p className="text-sm text-gray-400 leading-relaxed">{item.why}</p>
                  </div>
                  {item.locked
                    ? <Lock className="w-4 h-4 text-gray-700 flex-shrink-0 mt-1" />
                    : <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0 mt-1" />
                  }
                </div>
              </div>
            </Reveal>
          ))}

          <Reveal delay={0.3}>
            <div className="mt-8 text-center">
              <button
                onClick={scrollToPrice}
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#ff9e19] hover:bg-[#ffb04d] text-black font-bold rounded-xl transition-all text-lg shadow-lg shadow-[#ff9e19]/15"
              >
                <Zap className="w-5 h-5" />
                Unlock Stages 2–7
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── MEET THE HUMANS BEHIND THE AI ───────────────────────────────── */}
      <section className="py-20 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-4">
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">
                The Humans Behind Nic AI & Fehren AI
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                You've been coached by the AI versions. Here are the real people whose experience,
                voice, and methodology built them.
              </p>
            </div>
          </Reveal>

          {/* Nicholas + Fehren — large cards */}
          <div className="grid sm:grid-cols-2 gap-6 mt-12 mb-6">
            {[
              {
                img: '/coaches/nic.avif',
                name: 'Nicholas Kusmich',
                role: 'IOS Systems Architect',
                ai: 'Nic AI',
                bio: 'Former pastor turned marketing strategist who\'s generated over $1B in client revenue. After years of external achievement without internal coherence, Nicholas built the IOS as the operating system he wished existed. He\'s the architect of everything you\'ve been experiencing.',
              },
              {
                img: '/coaches/fehren.avif',
                name: 'Fehren Kusmich',
                role: 'Heart & Body Specialist',
                ai: 'Fehren AI',
                bio: 'Certified practitioner bringing somatic wisdom and heart-centered guidance. Fehren\'s approach creates the safety that makes deep transformation possible — particularly through the body-based stages you\'ll encounter in Stage 2 and beyond.',
              },
            ].map((person, i) => (
              <Reveal key={i} delay={i * 0.15}>
                <div className="p-7 bg-[#111] border border-[#1a1a1a] rounded-2xl flex gap-5 h-full">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                    <Image src={person.img} alt={person.name} width={160} height={160} quality={100} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-xs text-[#ff9e19] font-medium uppercase tracking-widest mb-1">{person.ai} → {person.name}</div>
                    <h3 className="font-semibold text-lg mb-0.5">{person.name}</h3>
                    <p className="text-[#ff9e19] text-sm mb-3">{person.role}</p>
                    <p className="text-gray-400 text-sm leading-relaxed">{person.bio}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Charok + Guest — smaller */}
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                img: '/coaches/charok.jpg',
                name: 'Charok Lama',
                role: 'Leading Buddhist Teacher & Life Coach',
                bio: 'Recognized reincarnation of a Himalayan yogi. Trained at Kopan and Sera Je Monasteries. Bridges ancient contemplative wisdom with modern psychology and CBT. Brings the depth of lineage to the IOS framework.',
              },
              {
                img: null,
                name: 'Guest Experts',
                role: "World's Leading Authorities",
                bio: 'Each month, a world-class leader brings their expertise to the community — covering neuroscience, performance, relationships, and the edges of human potential. All sessions recorded.',
              },
            ].map((person, i) => (
              <Reveal key={i} delay={i * 0.15 + 0.2}>
                <div className="p-6 bg-[#111] border border-[#1a1a1a] rounded-2xl flex gap-4 h-full">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#1a1a1a] flex-shrink-0 flex items-center justify-center">
                    {person.img
                      ? <Image src={person.img} alt={person.name} width={112} height={112} quality={100} className="w-full h-full object-cover" />
                      : <User className="w-7 h-7 text-gray-600" />
                    }
                  </div>
                  <div>
                    <h3 className="font-semibold mb-0.5">{person.name}</h3>
                    <p className="text-[#ff9e19] text-sm mb-2">{person.role}</p>
                    <p className="text-gray-400 text-sm leading-relaxed">{person.bio}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[#0d0d0d] border-t border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
              What Happened When They Continued
            </h2>
            <p className="text-xl text-gray-400 text-center mb-14 max-w-2xl mx-auto">
              These aren't beginners. These are people who, like you, completed Stage 1 and kept going.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {[
              {
                icon: TrendingUp, name: 'Jesse', label: 'Entrepreneur',
                quote: '"My business did $60k the first year. $90k the next year. And this year after this protocol, I\'ll cross over the $300k mark."',
                stat: '5x revenue growth',
              },
              {
                icon: TrendingUp, name: 'Brian', label: 'Business Owner',
                quote: '"Since doing this I have had 7 million dollar months in a row. I have never done that before. Something just started clicking. Hard to describe."',
                stat: '7 consecutive $1M+ months',
              },
              {
                icon: Heart, name: 'Jenna', label: 'Personal Transformation',
                quote: '"Words can\'t express how much this has helped me. I was able to clearly see the walls I had built and dissolve them, allowing me to love freely. Tremendously healing."',
                stat: null,
              },
              {
                icon: Shield, name: 'Martin', label: 'Stage 7 Graduate',
                quote: '"36 days without anxiety or sleep pills after finishing Stage 7."',
                stat: 'Complete freedom from dependency',
              },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="p-7 bg-[#111] border border-[#1a1a1a] rounded-2xl h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 bg-[#ff9e19]/10 rounded-full flex items-center justify-center">
                      <t.icon className="w-5 h-5 text-[#ff9e19]" />
                    </div>
                    <div>
                      <div className="font-semibold">{t.name}</div>
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
            <div className="p-8 bg-gradient-to-r from-[#ff9e19]/8 to-transparent border border-[#ff9e19]/15 rounded-2xl text-center">
              <p className="text-2xl font-medium mb-3">
                "This has <span className="text-[#ff9e19]">completely changed who I am</span> for the better.
                I am in such an amazing place."
              </p>
              <p className="text-gray-500 text-sm">— Alan</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── PRICING ───────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">
                Choose How You Continue
              </h2>
              <p className="text-xl text-gray-400 max-w-xl mx-auto">
                Stage 1 proved the system works. Stages 2–7 are where it fully installs.
              </p>
            </div>
          </Reveal>

          {/* Track selector */}
          <Reveal>
            <div className="max-w-md mx-auto mb-8">
              <div className="flex gap-2 p-1 bg-[#111] border border-[#1a1a1a] rounded-xl">
                {(['installer', 'coaching'] as const).map((track) => (
                  <button
                    key={track}
                    onClick={() => handleTrackChange(track)}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all text-sm ${
                      selectedTrack === track ? 'bg-[#ff9e19] text-black' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {track === 'installer' ? 'IOS Installer' : 'Installer + Live Coaching'}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Coaching add-on note */}
          {selectedTrack === 'coaching' && (
            <Reveal>
              <div className="max-w-2xl mx-auto mb-8 p-5 bg-[#ff9e19]/5 border border-[#ff9e19]/15 rounded-xl">
                <p className="text-center text-gray-300 text-sm">
                  <span className="text-[#ff9e19] font-semibold">Everything in the Installer, PLUS:</span>{' '}
                  Weekly live coaching calls with Nicholas, Fehren, and Charok Lama.
                  Monthly guest expert sessions. Direct Q&A and hot seat coaching. All calls recorded.
                </p>
              </div>
            </Reveal>
          )}

          {/* Pricing cards */}
          <div className="grid md:grid-cols-3 gap-5">
            {(selectedTrack === 'installer'
              ? [
                  { plan: 'annual' as PlanType, label: 'Annual Access', sub: 'Best for full transformation', price: '$697', monthly: 'Just $58/mo', billing: 'Billed annually', badge: 'SAVE 61%' },
                  { plan: 'biannual' as PlanType, label: '6 Months Access', sub: 'Solid commitment', price: '$597', monthly: '$100/mo', billing: 'Billed every 6 months', badge: null },
                  { plan: 'quarterly' as PlanType, label: '3 Months Access', sub: 'Start and see', price: '$447', monthly: '$149/mo', billing: 'Billed every 3 months', badge: null },
                ]
              : [
                  { plan: 'annual_coaching' as PlanType, label: 'Annual Access', sub: 'Best for full transformation', price: '$1,797', monthly: 'Just $150/mo', billing: 'Billed annually', badge: 'BEST VALUE' },
                  { plan: 'biannual_coaching' as PlanType, label: '6 Months Access', sub: 'Solid commitment', price: '$1,397', monthly: '$233/mo', billing: 'Billed every 6 months', badge: null },
                  { plan: 'quarterly_coaching' as PlanType, label: '3 Months Access', sub: 'Start and see', price: '$1,038', monthly: '$346/mo', billing: 'Billed every 3 months', badge: null },
                ]
            ).map((card) => (
              <Reveal key={card.plan}>
                <div
                  onClick={() => setSelectedPlan(card.plan)}
                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedPlan === card.plan
                      ? 'border-[#ff9e19] bg-[#ff9e19]/8 shadow-lg shadow-[#ff9e19]/10'
                      : 'border-[#1a1a1a] bg-[#111] hover:border-[#2a2a2a]'
                  }`}
                >
                  {card.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#ff9e19] text-black text-xs font-bold rounded-full whitespace-nowrap">
                      {card.badge}
                    </div>
                  )}
                  <div className="text-center pt-3">
                    <h3 className="font-bold text-lg mb-1">{card.label}</h3>
                    <p className="text-gray-500 text-sm mb-5">{card.sub}</p>
                    <div className="text-4xl font-bold mb-1">{card.price}</div>
                    <p className={selectedPlan === card.plan ? 'text-[#ff9e19] font-medium' : 'text-gray-400'}>
                      {card.monthly}
                    </p>
                    <p className="text-gray-600 text-xs mt-2">{card.billing}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Error */}
          {checkoutError && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
              <p className="text-red-400 text-sm">{checkoutError}</p>
            </div>
          )}

          {/* CTA */}
          <Reveal delay={0.2}>
            <div className="mt-8 text-center">
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-[#ff9e19] hover:bg-[#ffb04d] text-black font-bold rounded-xl transition-all text-lg shadow-xl shadow-[#ff9e19]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkoutLoading
                  ? <><Loader2 className="w-5 h-5 animate-spin" />Processing...</>
                  : <><Zap className="w-5 h-5" />{getButtonText()}</>
                }
              </button>
              <p className="mt-3 text-gray-600 text-xs">Auto-renews at same rate until cancelled</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── FAQ (warm-audience objections) ───────────────────────────────── */}
      <section className="py-20 px-4 bg-[#0d0d0d] border-t border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h2 className="text-3xl font-bold text-center mb-12">Questions Before You Continue</h2>
          </Reveal>

          <div className="space-y-3">
            {[
              {
                q: "I've felt improvement in Stage 1 — will Stage 2 feel like starting over?",
                a: "No. Stage 2 builds directly on what Stage 1 installed. Somatic Flow adds body-based awareness to the nervous system coherence you've already established. You'll feel the connection immediately — not like starting over, like adding a second layer to a solid foundation.",
              },
              {
                q: "What happens to my Nic AI and Fehren AI access?",
                a: "They stay with you and deepen. As you progress through stages, the AI coaches gain access to more protocols, tools, and context. The conversations get richer, not just longer — because the tools available to them expand with each stage you unlock.",
              },
              {
                q: "What if I miss days or fall off the practice?",
                a: "The system is built for real life. Missing a day doesn't reset your progress. If you fall off for an extended period, the system recalibrates your starting point rather than punishing you. The goal is sustainable installation, not perfect performance.",
              },
              {
                q: "How much more time does this add to my day?",
                a: "Stage 2 adds about 3 minutes (Somatic Flow). Stage 3 adds 2–3 minutes. Stages stack gradually — you never go from 7 minutes to 2 hours overnight. Most users at Stage 6 spend 18–22 minutes on their morning stack. The ROI on that time is significant.",
              },
              {
                q: "Can I pause if life gets difficult?",
                a: "The subscription can be cancelled at any time. But practically: the system is designed to be most valuable during difficult periods, not least. The tools — Reframe, Decentering, Thought Hygiene — are on-demand exactly for those moments.",
              },
              {
                q: "Is the Live Coaching track worth it?",
                a: "If you want to move faster and have direct access to Nicholas, Fehren, and Charok Lama, yes. Live calls accelerate integration because you can bring your specific situation. If you're self-directed and consistent, the Installer track handles the full journey on its own.",
              },
            ].map((item, i) => (
              <Reveal key={i}>
                <div className="border border-[#1a1a1a] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-[#111] transition-colors"
                  >
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

      {/* ─── FINAL CTA ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-bold mb-5">
              The Foundation Is Set.<br />
              <span className="text-[#ff9e19]">Build On It.</span>
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto">
              Stage 1 changed your baseline. Stages 2–7 change your ceiling.
              The system is ready. The only question is whether you are.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={scrollToPrice}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#ff9e19] hover:bg-[#ffb04d] text-black font-bold rounded-xl transition-all text-lg shadow-xl shadow-[#ff9e19]/15"
              >
                <Zap className="w-5 h-5" />
                Continue the Installation
              </button>
              <button
                onClick={() => setShowChat(true)}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-lg"
              >
                <MessageCircle className="w-5 h-5" />
                Still Have Questions?
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Sales chat ────────────────────────────────────────────────────── */}
      {showChat && <SalesChat onClose={() => setShowChat(false)} />}

      {/* ─── Keyframes ─────────────────────────────────────────────────────── */}
      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
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

// ─── Sales chat widget ────────────────────────────────────────────────────────
function SalesChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: "Hey! You've already done the hard part — Stage 1 is installed. What questions do you have about continuing?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    try {
      const res = await fetch('/api/sales-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMessage }] }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Having trouble connecting right now. You can always start your free Stage 1 at /chat and ask the coaches directly." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111] border border-[#1a1a1a] rounded-2xl w-full max-w-lg h-[580px] max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#1a1a1a] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#ff9e19]/10 rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-[#ff9e19]" />
            </div>
            <div>
              <div className="font-semibold text-sm">IOS Advisor</div>
              <div className="text-xs text-gray-500">Ask about continuing</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#ff9e19] text-black rounded-br-sm'
                  : 'bg-[#1a1a1a] text-gray-300 rounded-bl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#1a1a1a] p-3.5 rounded-2xl rounded-bl-sm flex gap-1">
                {[0, 150, 300].map((d) => (
                  <span key={d} className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-[#1a1a1a] flex-shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask anything..."
              className="flex-1 px-4 py-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#ff9e19]/40"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="px-4 py-3 bg-[#ff9e19] hover:bg-[#ffb04d] text-black rounded-xl transition-colors disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
