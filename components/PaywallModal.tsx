// /components/PaywallModal.tsx
'use client';

import { useState } from 'react';
import { X, Check, Zap, Shield, Brain, Sparkles, Star, Users, Video, Mic } from 'lucide-react';

type PlanType = 'quarterly' | 'biannual' | 'annual' | 'quarterly_coaching' | 'biannual_coaching' | 'annual_coaching';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (plan: PlanType) => Promise<void>;
}

export function PaywallModal({ isOpen, onClose, onUpgrade }: PaywallModalProps) {
  const [selectedTrack, setSelectedTrack] = useState<'installer' | 'coaching'>('installer');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      await onUpgrade(selectedPlan);
    } catch (err) {
      setError('Failed to start checkout. Please try again.');
      console.error('Upgrade error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update selected plan when track changes
  const handleTrackChange = (track: 'installer' | 'coaching') => {
    setSelectedTrack(track);
    if (track === 'installer') {
      setSelectedPlan('annual');
    } else {
      setSelectedPlan('annual_coaching');
    }
  };

  const installerFeatures = [
    { icon: Brain, text: 'All stage rituals including Embodied Awareness & Somatic Flow' },
    { icon: Star, text: '21-Day Identity Installation and Flow Block Performance Cycles' },
    { icon: Shield, text: 'Relational Coherence Protocols' },
    { icon: Sparkles, text: 'Nic AI and Fehren AI Coaches ($1,200 Value)' },
    { icon: Video, text: 'Science of Neural Liberation Course ($497 Value)' },
    { icon: Zap, text: 'Full Integration of the MOS and NOS Kernels' },
  ];

  const coachingFeatures = [
    { icon: Users, text: 'Weekly live coaching calls with Nic, Fehren, and Leading Buddhist Lama Charok' },
    { icon: Star, text: 'Monthly live coaching calls with world\'s leading guest experts' },
    { icon: Mic, text: 'Direct Q&A and hot seat coaching' },
    { icon: Video, text: 'All calls recorded and stored for easy access' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#111111] border border-[#1a1a1a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="p-8 pb-6 text-center border-b border-[#1a1a1a]">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#ff9e19]/10 rounded-full mb-4">
            <Zap className="w-8 h-8 text-[#ff9e19]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Congratulations. Stage 1 Neural Priming Complete.
          </h2>
          <p className="text-gray-400 mb-4">
            You've now proven your stability. It's time to install the full system with Stages 2-7.
          </p>
          <p className="text-gray-500 text-sm">
            Below are your options where you can get just the IOS Installer or the IOS Installer + Live Weekly Coaching.
          </p>
        </div>

        {/* Track Selector */}
        <div className="p-6 border-b border-[#1a1a1a]">
          <div className="flex gap-2 p-1 bg-[#0a0a0a] rounded-xl">
            <button
              onClick={() => handleTrackChange('installer')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                selectedTrack === 'installer'
                  ? 'bg-[#1a1a1a] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              IOS Installer
            </button>
            <button
              onClick={() => handleTrackChange('coaching')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                selectedTrack === 'coaching'
                  ? 'bg-[#1a1a1a] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Installer + Live Coaching
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="p-6 border-b border-[#1a1a1a]">
          <p className="text-sm text-[#ff9e19] uppercase tracking-wider font-semibold mb-4">
            {selectedTrack === 'installer' ? 'Full System Access' : 'Everything in IOS Installer, PLUS'}
          </p>
          <div className="space-y-3">
            {(selectedTrack === 'installer' ? installerFeatures : coachingFeatures).map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-[#ff9e19]/10 rounded-lg flex items-center justify-center mt-0.5">
                  <feature.icon className="w-4 h-4 text-[#ff9e19]" />
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{feature.text}</p>
              </div>
            ))}
          </div>
          {selectedTrack === 'coaching' && (
            <p className="text-gray-500 text-sm mt-4 pt-4 border-t border-[#1a1a1a]">
              + All IOS Installer features included
            </p>
          )}
        </div>

        {/* Pricing */}
        <div className="p-6 space-y-3">
          {selectedTrack === 'installer' ? (
            <>
              {/* Annual - Best Value */}
              <button
                onClick={() => setSelectedPlan('annual')}
                className={`w-full p-5 rounded-xl border-2 transition-all text-left relative ${
                  selectedPlan === 'annual'
                    ? 'border-[#ff9e19] bg-[#ff9e19]/10'
                    : 'border-[#1a1a1a] hover:border-[#333]'
                }`}
              >
                <div className="absolute -top-3 left-4 px-3 py-1 bg-[#ff9e19] text-black text-xs font-bold rounded-full">
                  SAVE 61%
                </div>
                <div className="flex items-start gap-4 pr-2">
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                    selectedPlan === 'annual' ? 'border-[#ff9e19] bg-[#ff9e19]' : 'border-gray-500'
                  }`}>
                    {selectedPlan === 'annual' && <Check className="w-3 h-3 text-black" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div className="min-w-0">
                        <span className="text-white font-semibold">Annual</span>
                        <span className="text-gray-500 text-sm ml-2 hidden sm:inline">— for those committed and serious about upgrades</span>
                        <p className="text-gray-500 text-xs sm:hidden mt-0.5">For those committed and serious</p>
                      </div>
                      <div className="text-2xl font-bold text-white flex-shrink-0">$697</div>
                    </div>
                    <div className="text-[#ff9e19] text-sm mt-1">Just $58/month billed annually</div>
                  </div>
                </div>
              </button>

              {/* 6 Month */}
              <button
                onClick={() => setSelectedPlan('biannual')}
                className={`w-full p-5 rounded-xl border-2 transition-all text-left relative ${
                  selectedPlan === 'biannual'
                    ? 'border-[#ff9e19] bg-[#ff9e19]/10'
                    : 'border-[#1a1a1a] hover:border-[#333]'
                }`}
              >
                <div className="flex items-start gap-4 pr-2">
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                    selectedPlan === 'biannual' ? 'border-[#ff9e19] bg-[#ff9e19]' : 'border-gray-500'
                  }`}>
                    {selectedPlan === 'biannual' && <Check className="w-3 h-3 text-black" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div className="min-w-0">
                        <span className="text-white font-semibold">6 Months Access</span>
                        <span className="text-gray-500 text-sm ml-2 hidden sm:inline">— for those ready to roll their sleeves up</span>
                        <p className="text-gray-500 text-xs sm:hidden mt-0.5">For those ready to roll their sleeves up</p>
                      </div>
                      <div className="text-2xl font-bold text-white flex-shrink-0">$597</div>
                    </div>
                    <div className="text-gray-400 text-sm mt-1">$100/month billed every 6 months</div>
                  </div>
                </div>
              </button>

              {/* 3 Month */}
              <button
                onClick={() => setSelectedPlan('quarterly')}
                className={`w-full p-5 rounded-xl border-2 transition-all text-left relative ${
                  selectedPlan === 'quarterly'
                    ? 'border-[#ff9e19] bg-[#ff9e19]/10'
                    : 'border-[#1a1a1a] hover:border-[#333]'
                }`}
              >
                <div className="flex items-start gap-4 pr-2">
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                    selectedPlan === 'quarterly' ? 'border-[#ff9e19] bg-[#ff9e19]' : 'border-gray-500'
                  }`}>
                    {selectedPlan === 'quarterly' && <Check className="w-3 h-3 text-black" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div className="min-w-0">
                        <span className="text-white font-semibold">3 Months Access</span>
                        <span className="text-gray-500 text-sm ml-2 hidden sm:inline">— for those looking to dip their toe</span>
                        <p className="text-gray-500 text-xs sm:hidden mt-0.5">For those looking to dip their toe</p>
                      </div>
                      <div className="text-2xl font-bold text-white flex-shrink-0">$447</div>
                    </div>
                    <div className="text-gray-400 text-sm mt-1">$149/month billed every 3 months</div>
                  </div>
                </div>
              </button>
            </>
          ) : (
            <>
              {/* Annual Coaching - Best Value */}
              <button
                onClick={() => setSelectedPlan('annual_coaching')}
                className={`w-full p-5 rounded-xl border-2 transition-all text-left relative ${
                  selectedPlan === 'annual_coaching'
                    ? 'border-[#ff9e19] bg-[#ff9e19]/10'
                    : 'border-[#1a1a1a] hover:border-[#333]'
                }`}
              >
                <div className="absolute -top-3 left-4 px-3 py-1 bg-[#ff9e19] text-black text-xs font-bold rounded-full">
                  BEST VALUE
                </div>
                <div className="flex items-start gap-4 pr-2">
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                    selectedPlan === 'annual_coaching' ? 'border-[#ff9e19] bg-[#ff9e19]' : 'border-gray-500'
                  }`}>
                    {selectedPlan === 'annual_coaching' && <Check className="w-3 h-3 text-black" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div className="min-w-0">
                        <span className="text-white font-semibold">Annual</span>
                        <span className="text-gray-500 text-sm ml-2 hidden sm:inline">— for those committed and serious about upgrades</span>
                        <p className="text-gray-500 text-xs sm:hidden mt-0.5">For those committed and serious</p>
                      </div>
                      <div className="text-2xl font-bold text-white flex-shrink-0">$1,797</div>
                    </div>
                    <div className="text-[#ff9e19] text-sm mt-1">Just $150/month billed annually</div>
                  </div>
                </div>
              </button>

              {/* 6 Month Coaching */}
              <button
                onClick={() => setSelectedPlan('biannual_coaching')}
                className={`w-full p-5 rounded-xl border-2 transition-all text-left relative ${
                  selectedPlan === 'biannual_coaching'
                    ? 'border-[#ff9e19] bg-[#ff9e19]/10'
                    : 'border-[#1a1a1a] hover:border-[#333]'
                }`}
              >
                <div className="flex items-start gap-4 pr-2">
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                    selectedPlan === 'biannual_coaching' ? 'border-[#ff9e19] bg-[#ff9e19]' : 'border-gray-500'
                  }`}>
                    {selectedPlan === 'biannual_coaching' && <Check className="w-3 h-3 text-black" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div className="min-w-0">
                        <span className="text-white font-semibold">6 Months Access</span>
                        <span className="text-gray-500 text-sm ml-2 hidden sm:inline">— for those ready to roll their sleeves up</span>
                        <p className="text-gray-500 text-xs sm:hidden mt-0.5">For those ready to roll their sleeves up</p>
                      </div>
                      <div className="text-2xl font-bold text-white flex-shrink-0">$1,397</div>
                    </div>
                    <div className="text-gray-400 text-sm mt-1">$233/month billed every 6 months</div>
                  </div>
                </div>
              </button>

              {/* 3 Month Coaching */}
              <button
                onClick={() => setSelectedPlan('quarterly_coaching')}
                className={`w-full p-5 rounded-xl border-2 transition-all text-left relative ${
                  selectedPlan === 'quarterly_coaching'
                    ? 'border-[#ff9e19] bg-[#ff9e19]/10'
                    : 'border-[#1a1a1a] hover:border-[#333]'
                }`}
              >
                <div className="flex items-start gap-4 pr-2">
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                    selectedPlan === 'quarterly_coaching' ? 'border-[#ff9e19] bg-[#ff9e19]' : 'border-gray-500'
                  }`}>
                    {selectedPlan === 'quarterly_coaching' && <Check className="w-3 h-3 text-black" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div className="min-w-0">
                        <span className="text-white font-semibold">3 Months Access</span>
                        <span className="text-gray-500 text-sm ml-2 hidden sm:inline">— for those looking to dip their toe</span>
                        <p className="text-gray-500 text-xs sm:hidden mt-0.5">For those looking to dip their toe</p>
                      </div>
                      <div className="text-2xl font-bold text-white flex-shrink-0">$1,038</div>
                    </div>
                    <div className="text-gray-400 text-sm mt-1">$346/month billed every 3 months</div>
                  </div>
                </div>
              </button>
            </>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="px-6 pb-2">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* CTA */}
        <div className="p-6 pt-2">
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-4 bg-[#ff9e19] hover:bg-[#ffb04d] text-black font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 flex-shrink-0" />
                <span>
                  {selectedTrack === 'installer' 
                    ? 'Install the IOS and Unlock The Full System' 
                    : 'Install the IOS and Unlock The Full System + Live Coaching Calls'}
                </span>
              </>
            )}
          </button>
          
          <div className="flex items-center justify-center mt-4 text-gray-500 text-sm">
            <span>Auto-renews at same rate until cancelled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
