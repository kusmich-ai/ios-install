// /app/upgrade/page.tsx
'use client';

import { useState } from 'react';
import { 
  Zap, Brain, Shield, Sparkles, Star, Users, ChevronDown, 
  CheckCircle2, ArrowRight, MessageCircle, X, Send,
  TrendingUp, Clock, Heart, Target, Waves, Lock, Loader2, User
} from 'lucide-react';
import Image from 'next/image';
import { useSubscriptionActions } from '@/hooks/useSubscription';

type PlanType = 'quarterly' | 'biannual' | 'annual' | 'quarterly_coaching' | 'biannual_coaching' | 'annual_coaching';

export default function UpgradePage() {
  const [selectedTrack, setSelectedTrack] = useState<'installer' | 'coaching'>('installer');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  const [showChat, setShowChat] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  
  const { startCheckout } = useSubscriptionActions();

  const handleTrackChange = (track: 'installer' | 'coaching') => {
    setSelectedTrack(track);
    if (track === 'installer') {
      setSelectedPlan('annual');
    } else {
      setSelectedPlan('annual_coaching');
    }
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

  // Dynamic button text based on selected track
  const getButtonText = () => {
    if (selectedTrack === 'coaching') {
      return 'Upgrade To The Full IOS Installer + Live Coaching';
    }
    return 'Upgrade To The Full IOS Installer Now';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#ff9e19]/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ff9e19]/5 rounded-full blur-[120px]" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff9e19]/10 border border-[#ff9e19]/20 rounded-full mb-8">
            <Zap className="w-4 h-4 text-[#ff9e19]" />
            <span className="text-sm text-[#ff9e19] font-medium">For High-Performers Who Want To Get Unstuck and Unstoppable</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
            You Don't Need Another Book, Course, App, Seminar, or Tactic.<br/>
            <span className="text-[#ff9e19]">You Need an Installation.</span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
            The IOS Installer rewires your nervous system and mental architecture for thriving. 
            Not learning. Not implementation. <span className="text-white font-medium">Complete neural upgrade.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button 
              onClick={scrollToPrice}
              className="px-8 py-4 bg-[#ff9e19] hover:bg-[#ffb04d] text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-lg"
            >
              <Zap className="w-5 h-5" />
              Install The IOS Now
            </button>
            <button 
              onClick={() => setShowChat(true)}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all flex items-center justify-center gap-2 text-lg"
            >
              <MessageCircle className="w-5 h-5" />
              Have Questions? Chat With Us
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#ff9e19]" />
              <span>HRV Improvements in less than 14 Days</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#ff9e19]" />
              <span>7-Stage Progressive System For Guaranteed Results</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#ff9e19]" />
              <span>AI Coaches Available 24/7</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-gray-500" />
        </div>
      </section>

      {/* ===== PROBLEM AGITATION ===== */}
      <section className="py-20 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6">
            You've Reached Incredible Heights.<br/>
            <span className="text-gray-400">So Why Does Something Still Feel... Off?</span>
          </h2>
          
          <p className="text-xl text-gray-400 text-center mb-12 max-w-3xl mx-auto">
            You know there is even more. That's not a bug in your programming. 
            It's a signal. <span className="text-white">We call it "The Inner Knock."</span>
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: Brain, title: "You've read the books", desc: "Atomic Habits. Think and Grow Rich. The Power of Now. You know the concepts. But knowing isn't installing." },
              { icon: Target, title: "You've tried the apps", desc: "Calm. Headspace. Waking Up. They work... until they don't. Because they address symptoms, not the operating system." },
              { icon: Clock, title: "You've done the "work"", desc: "Biohacked. Personal Development. Plant Based Medicine. But you're not broken. You're running outdated software on hardware that needs an upgrade." },
              { icon: TrendingUp, title: "You've hustled harder", desc: "More discipline. More willpower. More pushing through. But willpower is a limited resource. The system needs an upgrade." },
            ].map((item, i) => (
              <div key={i} className="p-6 bg-[#111] border border-[#1a1a1a] rounded-xl">
                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 p-8 bg-gradient-to-r from-[#ff9e19]/10 to-transparent border border-[#ff9e19]/20 rounded-2xl">
            <p className="text-xl text-center">
              <span className="text-[#ff9e19] font-semibold">The problem isn't you.</span> It's that you've been trying to 
              install new software on top of an operating system that was never designed for the life you're building.
            </p>
          </div>
        </div>
      </section>

      {/* ===== THE SOLUTION: UNIQUE MECHANISM ===== */}
      <section className="py-20 px-4 bg-[#0d0d0d] border-t border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff9e19]/10 border border-[#ff9e19]/20 rounded-full mb-6">
              <span className="text-sm text-[#ff9e19] font-medium">THE SOLUTION</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Introducing The IOS™<br/>
              <span className="text-[#ff9e19]">Integrated Operating System</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Not a course you watch. Not a practice you try to remember. Not a "hack". 
              A complete neural and mental architecture that <span className="text-white font-medium">installs itself through progressive, competence-based unlocking.</span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="p-8 bg-[#111] border border-[#1a1a1a] rounded-2xl">
              <div className="w-16 h-16 bg-[#ff9e19]/10 rounded-2xl flex items-center justify-center mb-6">
                <Waves className="w-8 h-8 text-[#ff9e19]" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Neural Operating System (NOS)</h3>
              <p className="text-gray-400 mb-6">
                Your nervous system is the hardware. Most people are running in constant fight-or-flight, 
                burning out their system. The NOS kernel gives your nervous system a new baseline of coherent regulation (aka deep flow state).
              </p>
              <ul className="space-y-3">
                {[
                  "Measurable HRV improvement within 14 days",
                  "Vagal tone optimization through resonance training",
                  "Awareness and embodied presence",
                  "Chaos response rewiring at the physiological level"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#ff9e19] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 bg-[#111] border border-[#1a1a1a] rounded-2xl">
              <div className="w-16 h-16 bg-[#ff9e19]/10 rounded-2xl flex items-center justify-center mb-6">
                <Brain className="w-8 h-8 text-[#ff9e19]" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Mental Operating System (MOS)</h3>
              <p className="text-gray-400 mb-6">
                Your mind is the software. Most self-help teaches you to add more apps. 
                The MOS kernel upgrades the entire operating system – how you process, interpret, and respond to reality.
              </p>
              <ul className="space-y-3">
                {[
                  "Identity installation through micro-action cycles",
                  "Flow state training for sustained deep work",
                  "Cognitive reframing protocols (not positive thinking)",
                  "Meta-awareness: watching the mind, not being run by it"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#ff9e19] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { old: "Learning", new: "Installation", desc: "You don't learn the IOS. It installs itself through short daily rituals that becomes automatic." },
              { old: "Information", new: "Transformation", desc: "Not more content to consume (and remember). A progressive system that changes who you are." },
              { old: "Willpower", new: "System Design", desc: "Stop relying on discipline. Let the architecture of the system do the heavy lifting." },
            ].map((item, i) => (
              <div key={i} className="p-6 bg-[#111] border border-[#1a1a1a] rounded-xl text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-red-400 line-through">{item.old}</span>
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                  <span className="text-[#ff9e19] font-semibold">{item.new}</span>
                </div>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 7 STAGES ===== */}
      <section className="py-20 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              7 Progressive Stages.<br/>
              <span className="text-gray-400">Each Unlocked By Competence, Not Just Time.</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              You can't skip ahead. The system advances you when your IOS demonstrates readiness. 
              This isn't a 30-day challenge. It's a <span className="text-white">complete upgrade architecture.</span>
            </p>
          </div>

          <div className="space-y-4">
            {[
              { stage: 1, name: "Neural Priming", tagline: "Stabilize the signal", desc: "Resonance training + Awareness reps. The foundation everything builds on.", free: true },
              { stage: 2, name: "Embodied Awareness", tagline: "Bring awareness into the whole self", desc: "Somatic flow practices. Your body becomes a coherent extension of your awareness." },
              { stage: 3, name: "Identity Mode", tagline: "Act from coherence", desc: "21-day identity installation cycles. Become who you're meant to be." },
              { stage: 4, name: "Flow Mode", tagline: "Train sustained flow states", desc: "Deep work protocols. Flow blocks become your new normal." },
              { stage: 5, name: "Relational Coherence", tagline: "Stay open in connection", desc: "Co-regulation practices. Your nervous system stays open and connected." },
              { stage: 6, name: "Integration", tagline: "Convert insights and states to traits", desc: "Nightly debrief protocols. Daily lessons encode into permanent trait-level changes." },
              { stage: 7, name: "Accelerated Expansion", tagline: "Awareness engineers itself", desc: "Advanced protocols. Supplements, neurofeedback, and guided expansion (by application only)." },
            ].map((item, i) => (
              <div 
                key={i} 
                className={`p-6 rounded-xl border transition-all ${
                  item.free ? 'bg-[#ff9e19]/5 border-[#ff9e19]/20' : 'bg-[#111] border-[#1a1a1a]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                    item.free ? 'bg-[#ff9e19] text-black' : 'bg-[#1a1a1a] text-[#ff9e19]'
                  }`}>
                    {item.stage}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <span className="text-gray-500">—</span>
                      <span className="text-[#ff9e19] text-sm italic">{item.tagline}</span>
                      {item.free && (
                        <span className="px-2 py-0.5 bg-[#ff9e19] text-black text-xs font-bold rounded-full">FREE</span>
                      )}
                    </div>
                    <p className="text-gray-400">{item.desc}</p>
                  </div>
                  {!item.free && <Lock className="w-5 h-5 text-gray-600 flex-shrink-0" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF / TESTIMONIALS ===== */}
      <section className="py-20 px-4 bg-[#0d0d0d] border-t border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Real Results. <span className="text-[#ff9e19]">Real Upgrades.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="p-8 bg-[#111] border border-[#1a1a1a] rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#ff9e19]/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#ff9e19]" />
                </div>
                <div>
                  <div className="font-semibold">Jesse</div>
                  <div className="text-sm text-gray-500">Entrepreneur</div>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                "My business did <span className="text-white font-semibold">$60k the first year. $90k the next year.</span> And this year after this protocol, 
                I'll cross over the <span className="text-[#ff9e19] font-semibold">$300k mark.</span>"
              </p>
              <div className="text-sm text-gray-500">5x revenue growth</div>
            </div>

            <div className="p-8 bg-[#111] border border-[#1a1a1a] rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#ff9e19]/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#ff9e19]" />
                </div>
                <div>
                  <div className="font-semibold">Brian</div>
                  <div className="text-sm text-gray-500">Business Owner</div>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                "Since doing this I have had <span className="text-[#ff9e19] font-semibold">7 million dollar months in a row.</span> I have never done that before. 
                Something just started clicking. <span className="text-white font-semibold">Hard to describe.</span>"
              </p>
              <div className="text-sm text-gray-500">7 consecutive $1M+ months</div>
            </div>

            <div className="p-8 bg-[#111] border border-[#1a1a1a] rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#ff9e19]/10 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-[#ff9e19]" />
                </div>
                <div>
                  <div className="font-semibold">Jenna</div>
                  <div className="text-sm text-gray-500">Transformation Journey</div>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                "Words can't express how much this has helped me. I was able to <span className="text-white font-semibold">clearly see the walls I had built and dissolve them</span>, 
                allowing me to <span className="text-[#ff9e19] font-semibold">love freely.</span> Tremendously healing and transformative."
              </p>
            </div>

            <div className="p-8 bg-[#111] border border-[#1a1a1a] rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#ff9e19]/10 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-[#ff9e19]" />
                </div>
                <div>
                  <div className="font-semibold">Martin</div>
                  <div className="text-sm text-gray-500">Stage 7 Graduate</div>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                "<span className="text-[#ff9e19] font-semibold">36 days without anxiety or sleep pills</span> after finishing Stage 7."
              </p>
              <div className="text-sm text-gray-500">Complete freedom from dependency</div>
            </div>
          </div>

          <div className="p-8 bg-gradient-to-r from-[#ff9e19]/10 to-transparent border border-[#ff9e19]/20 rounded-2xl text-center">
            <p className="text-2xl font-medium mb-4">
              "This has <span className="text-[#ff9e19]">completely changed who I am</span> for the better. 
              I am in such an amazing place and want to thank you from the bottom of my heart."
            </p>
            <p className="text-gray-500">— Alan</p>
          </div>
        </div>
      </section>

      {/* ===== YOUR GUIDES ===== */}
      <section className="py-20 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Your Guides On This Journey</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Nicholas */}
            <div className="text-center">
              <div className="w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden bg-[#1a1a1a]">
                <Image
                  src="/coaches/nic.webp"
                  alt="Nicholas Kusmich"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Nicholas Kusmich</h3>
              <p className="text-[#ff9e19] text-sm mb-4">IOS Systems Architect</p>
              <p className="text-gray-400 text-sm">
                Former pastor turned marketing strategist who's generated over $1B in client revenue. 
                Now dedicated to helping high-performers install the integrated operating system that matches their outer ambitions.
              </p>
            </div>

            {/* Fehren */}
            <div className="text-center">
              <div className="w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden bg-[#1a1a1a]">
                <Image
                  src="/coaches/fehren.webp"
                  alt="Fehren Kusmich"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fehren Kusmich</h3>
              <p className="text-[#ff9e19] text-sm mb-4">Heart & Body Specialist</p>
              <p className="text-gray-400 text-sm">
                Certified practitioner who brings somatic wisdom and heart-centered guidance. 
                Her spacious approach creates safety for deep transformation.
              </p>
            </div>

            {/* Charok */}
            <div className="text-center">
              <div className="w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden bg-[#1a1a1a]">
                <Image
                  src="/coaches/charok.jpg"
                  alt="Charok Lama"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Charok Lama</h3>
              <p className="text-[#ff9e19] text-sm mb-4">Leading Buddhist Teacher & Life Coach</p>
              <p className="text-gray-400 text-sm">
                Recognized reincarnation of a Himalayan yogi. Trained at Kopan and Sera Je Monasteries. 
                Bridges ancient wisdom with modern psychology, fluent in CBT and traditional Buddhist practice.
              </p>
            </div>

            {/* Guest Experts */}
            <div className="text-center">
              <div className="w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden bg-[#1a1a1a] flex items-center justify-center">
                <User className="w-16 h-16 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Guest Experts</h3>
              <p className="text-[#ff9e19] text-sm mb-4">World's Leading Experts</p>
              <p className="text-gray-400 text-sm">
                Each month there will be a guest who is a world class leader and authority in their field 
                bringing their expertise and perspective to relevant topic matters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHAT'S INCLUDED ===== */}
      <section className="py-20 px-4 bg-[#0d0d0d] border-t border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Everything You Get With The IOS Installer</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[
              { icon: Zap, title: "All 7 Stage Rituals & Protocols", desc: "From Neural Priming to Accelerated Expansion. Each stage unlocks when you're ready.", value: "Core System" },
              { icon: Brain, title: "Nic AI & Fehren AI Coaches", desc: "24/7 access to AI coaches trained on hundreds of real coaching conversations. Not chatbots. Coaches.", value: "$1,200 Value" },
              { icon: Star, title: "Science of Neural Liberation Course", desc: "4 modules, 16 tutorials, 30+ hours of neuroscience-backed transformation education.", value: "$497 Value" },
              { icon: Target, title: "21-Day Identity Installation Cycles", desc: "Systematic identity engineering. Become who you're meant to be through daily micro-proof.", value: "Included" },
              { icon: Clock, title: "Flow Block Performance System", desc: "Deep work training. 60-90 minute flow states become your new normal.", value: "Included" },
              { icon: Shield, title: "Cognitive Protocol Suite", desc: "Reframe, Decentering, Thought Hygiene, Meta-Reflection. Real tools, not affirmations.", value: "Included" },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-6 bg-[#111] border border-[#1a1a1a] rounded-xl">
                <div className="w-12 h-12 bg-[#ff9e19]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-[#ff9e19]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    {item.value !== "Included" && item.value !== "Core System" && (
                      <span className="text-xs text-[#ff9e19] font-medium">{item.value}</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="py-20 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Choose Your Installation Path</h2>
            <p className="text-xl text-gray-400">Stage 1 is free. Stages 2-7 require commitment.</p>
          </div>

          {/* Track Selector */}
          <div className="max-w-lg mx-auto mb-8">
            <div className="flex gap-2 p-1 bg-[#111] border border-[#1a1a1a] rounded-xl">
              <button
                onClick={() => handleTrackChange('installer')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  selectedTrack === 'installer' ? 'bg-[#ff9e19] text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                IOS Installer
              </button>
              <button
                onClick={() => handleTrackChange('coaching')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  selectedTrack === 'coaching' ? 'bg-[#ff9e19] text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                Installer + Live Coaching
              </button>
            </div>
          </div>

          {selectedTrack === 'coaching' && (
            <div className="max-w-2xl mx-auto mb-8 p-6 bg-[#ff9e19]/5 border border-[#ff9e19]/20 rounded-xl">
              <p className="text-center text-gray-300">
                <span className="text-[#ff9e19] font-semibold">Everything in the IOS Installer, PLUS:</span> Weekly live coaching calls with Nic, Fehren, and Charok Lama. 
                Monthly guest expert sessions. Direct Q&A and hot seat coaching. All calls recorded.
              </p>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {selectedTrack === 'installer' ? (
              <>
                <div 
                  onClick={() => setSelectedPlan('annual')} 
                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedPlan === 'annual' ? 'border-[#ff9e19] bg-[#ff9e19]/10' : 'border-[#1a1a1a] bg-[#111] hover:border-[#333]'
                  }`}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#ff9e19] text-black text-xs font-bold rounded-full">SAVE 61%</div>
                  <div className="text-center pt-4">
                    <h3 className="text-xl font-bold mb-1">Annual Access</h3>
                    <p className="text-gray-500 text-sm mb-4">For those committed and serious</p>
                    <div className="text-4xl font-bold mb-1">$697</div>
                    <p className="text-[#ff9e19] font-medium">Just $58/month</p>
                    <p className="text-gray-500 text-sm mt-2">Billed annually</p>
                  </div>
                </div>
                <div 
                  onClick={() => setSelectedPlan('biannual')} 
                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedPlan === 'biannual' ? 'border-[#ff9e19] bg-[#ff9e19]/10' : 'border-[#1a1a1a] bg-[#111] hover:border-[#333]'
                  }`}
                >
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-1">6 Months Access</h3>
                    <p className="text-gray-500 text-sm mb-4">Ready to roll your sleeves up</p>
                    <div className="text-4xl font-bold mb-1">$597</div>
                    <p className="text-gray-400">$100/month</p>
                    <p className="text-gray-500 text-sm mt-2">Billed every 6 months</p>
                  </div>
                </div>
                <div 
                  onClick={() => setSelectedPlan('quarterly')} 
                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedPlan === 'quarterly' ? 'border-[#ff9e19] bg-[#ff9e19]/10' : 'border-[#1a1a1a] bg-[#111] hover:border-[#333]'
                  }`}
                >
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-1">3 Months Access</h3>
                    <p className="text-gray-500 text-sm mb-4">Looking to dip your toe</p>
                    <div className="text-4xl font-bold mb-1">$447</div>
                    <p className="text-gray-400">$149/month</p>
                    <p className="text-gray-500 text-sm mt-2">Billed every 3 months</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div 
                  onClick={() => setSelectedPlan('annual_coaching')} 
                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedPlan === 'annual_coaching' ? 'border-[#ff9e19] bg-[#ff9e19]/10' : 'border-[#1a1a1a] bg-[#111] hover:border-[#333]'
                  }`}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#ff9e19] text-black text-xs font-bold rounded-full">BEST VALUE</div>
                  <div className="text-center pt-4">
                    <h3 className="text-xl font-bold mb-1">Annual Access</h3>
                    <p className="text-gray-500 text-sm mb-4">For those committed and serious</p>
                    <div className="text-4xl font-bold mb-1">$1,797</div>
                    <p className="text-[#ff9e19] font-medium">Just $150/month</p>
                    <p className="text-gray-500 text-sm mt-2">Billed annually</p>
                  </div>
                </div>
                <div 
                  onClick={() => setSelectedPlan('biannual_coaching')} 
                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedPlan === 'biannual_coaching' ? 'border-[#ff9e19] bg-[#ff9e19]/10' : 'border-[#1a1a1a] bg-[#111] hover:border-[#333]'
                  }`}
                >
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-1">6 Months Access</h3>
                    <p className="text-gray-500 text-sm mb-4">Ready to roll your sleeves up</p>
                    <div className="text-4xl font-bold mb-1">$1,397</div>
                    <p className="text-gray-400">$233/month</p>
                    <p className="text-gray-500 text-sm mt-2">Billed every 6 months</p>
                  </div>
                </div>
                <div 
                  onClick={() => setSelectedPlan('quarterly_coaching')} 
                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedPlan === 'quarterly_coaching' ? 'border-[#ff9e19] bg-[#ff9e19]/10' : 'border-[#1a1a1a] bg-[#111] hover:border-[#333]'
                  }`}
                >
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-1">3 Months Access</h3>
                    <p className="text-gray-500 text-sm mb-4">Looking to dip your toe</p>
                    <div className="text-4xl font-bold mb-1">$1,038</div>
                    <p className="text-gray-400">$346/month</p>
                    <p className="text-gray-500 text-sm mt-2">Billed every 3 months</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Error Message */}
          {checkoutError && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
              <p className="text-red-400">{checkoutError}</p>
            </div>
          )}

          {/* CTA Button */}
          <div className="mt-8 text-center">
            <button 
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#ff9e19] hover:bg-[#ffb04d] text-black font-bold rounded-xl transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  {getButtonText()}
                </>
              )}
            </button>
            
            <p className="mt-4 text-gray-600 text-xs">Auto-renews at same rate until cancelled</p>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-20 px-4 bg-[#0d0d0d] border-t border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-4">
            {[
              { q: "How is this different from meditation apps like Calm or Headspace?", a: "Those apps teach you a practice. The IOS installs a complete operating system. Meditation apps address symptoms (stress, sleep). We rewire the underlying architecture – your nervous system's baseline and your mind's default patterns. Plus, you don't just follow guided audio. You have AI coaches that know your journey and adapt to your specific needs." },
              { q: "How is this different from therapy?", a: "Therapy is valuable for processing past experiences and treating clinical conditions. The IOS isn't therapy – it's systems engineering. We're not treating dysfunction; we're installing an upgrade. Many of our users continue therapy alongside the IOS; they work together beautifully." },
              { q: "How is this different from other courses or programs?", a: "Courses give you information. The IOS gives you installation. You don't 'learn' the IOS – it installs itself through progressive practice. You can't skip ahead or binge-watch. The system unlocks when your nervous system demonstrates competence. This isn't another thing to add to your life; it becomes how you operate." },
              { q: "How much time does this take?", a: "Stage 1 was about 7 minutes per day. As you progress, rituals stack but they're designed to integrate into your existing routine, not add hours to your day. Most users find the ROI on time is massive because their performance in everything else improves." },
              { q: "What if I've tried everything and nothing works?", a: "That's exactly who this is for. You've tried adding more apps, more practices, more discipline. The IOS takes a different approach: we upgrade the underlying system. If everything else has been software patches on a faulty operating system, this is the kernel update." },
              { q: "What are the AI coaches like?", a: "Nic AI and Fehren AI are trained on hundreds of real coaching conversations. They know the protocols intimately and adapt to your specific journey. They're not chatbots giving generic advice - they're coaches that hold you accountable, call out your patterns, and guide you through the stages. Available 24/7." },
            ].map((item, i) => (
              <div key={i} className="border border-[#1a1a1a] rounded-xl overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)} 
                  className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-[#111] transition-colors"
                >
                  <span className="font-medium">{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-400">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-20 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            The Inner Knock Won't Stop.<br/>
            <span className="text-[#ff9e19]">But You Can Finally Answer It.</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            You're not here by accident. That restless feeling that there must be more? 
            It's real. And it's not going away until you upgrade the operating system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={scrollToPrice}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#ff9e19] hover:bg-[#ffb04d] text-black font-bold rounded-xl transition-all text-lg"
            >
              <Zap className="w-5 h-5" />
              Upgrade To The Full IOS Installer
            </button>
            <button 
              onClick={() => setShowChat(true)}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-lg"
            >
              <MessageCircle className="w-5 h-5" />
              Still Have Questions?
            </button>
          </div>
        </div>
      </section>

      {/* ===== SALES CHAT WIDGET ===== */}
      {showChat && (
        <SalesChat onClose={() => setShowChat(false)} />
      )}
    </div>
  );
}

// ===== SALES CHAT COMPONENT =====
function SalesChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: "Hey! 👋 I'm here to answer any questions about the IOS Installer. What would you like to know?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/sales-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, { role: 'user', content: userMessage }]
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble connecting right now. Please try again, or you can start your free Stage 1 at /chat to talk with the AI coaches there." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111] border border-[#1a1a1a] rounded-2xl w-full max-w-lg h-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#1a1a1a] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ff9e19]/10 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-[#ff9e19]" />
            </div>
            <div>
              <div className="font-semibold">IOS Sales Advisor</div>
              <div className="text-xs text-gray-500">Ask me anything about the IOS</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-[#ff9e19] text-black rounded-br-md' 
                  : 'bg-[#1a1a1a] text-gray-300 rounded-bl-md'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#1a1a1a] text-gray-300 p-4 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#1a1a1a] flex-shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask a question..."
              className="flex-1 px-4 py-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#ff9e19]/50"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="px-4 py-3 bg-[#ff9e19] hover:bg-[#ffb04d] text-black rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
